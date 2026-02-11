const { spawn } = require("child_process");
const { randomUUID } = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Project = require("../models/Project");
const { findNode } = require("../utils/tree");

const MAX_OUTPUT_BYTES = 1024 * 1024;
const LEGACY_TIMEOUT_MS = 5000;
const DEFAULT_SESSION_TIMEOUT_MS = 10 * 60 * 1000;
const MIN_SESSION_TIMEOUT_MS = 30 * 1000;
const SESSION_TIMEOUT_MS = (() => {
  const raw = Number(process.env.RUN_SESSION_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_SESSION_TIMEOUT_MS;
  return Math.max(raw, MIN_SESSION_TIMEOUT_MS);
})();
const SESSION_TTL_MS = 30000;
const runSessions = new Map();

const resolveSource = async ({ code, projectId, fileId, userId }) => {
  let source = code;
  if (!source && projectId && fileId) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    const node = findNode(project.files, fileId);
    if (!node || node.type !== "file") {
      const err = new Error("File not found");
      err.status = 404;
      throw err;
    }
    source = node.content || "";
  }

  if (typeof source !== "string") {
    const err = new Error("Code required");
    err.status = 400;
    throw err;
  }

  return source;
};

const writeTempFile = (source) => {
  const tempFile = path.join(
    os.tmpdir(),
    `codelearn-${Date.now()}-${Math.random().toString(16).slice(2)}.py`
  );
  fs.writeFileSync(tempFile, source, "utf8");
  return tempFile;
};

const sendSse = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const emitSessionEvent = (session, event, data) => {
  session.events.push({ event, data });
  for (const client of session.clients) {
    try {
      sendSse(client, event, data);
    } catch {
      session.clients.delete(client);
    }
  }
};

const cleanupSession = (session) => {
  for (const client of session.clients) {
    if (!client.writableEnded) {
      client.end();
    }
  }
  session.clients.clear();
  runSessions.delete(session.id);
};

const finishSession = (session, payload) => {
  if (session.finished) return;
  session.finished = true;
  clearTimeout(session.killTimer);
  if (session.cleanupTimer) clearTimeout(session.cleanupTimer);
  fs.unlink(session.tempFile, () => {});

  emitSessionEvent(session, "end", payload);

  for (const client of session.clients) {
    if (!client.writableEnded) {
      client.end();
    }
  }
  session.clients.clear();

  session.cleanupTimer = setTimeout(() => {
    cleanupSession(session);
  }, SESSION_TTL_MS);
};

const runPython = async (req, res) => {
  try {
    const { code, projectId, fileId, input } = req.body;
    const source = await resolveSource({
      code,
      projectId,
      fileId,
      userId: req.user.id,
    });

    const tempFile = writeTempFile(source);

    const child = spawn("python", ["-u", tempFile], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    const killTimer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, LEGACY_TIMEOUT_MS);

    const finish = (output) => {
      clearTimeout(killTimer);
      fs.unlink(tempFile, () => {});
      return res.json({ output });
    };

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT_BYTES) {
        killed = true;
        child.kill("SIGKILL");
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_OUTPUT_BYTES) {
        killed = true;
        child.kill("SIGKILL");
      }
    });

    child.on("error", (err) => {
      return finish(err.message);
    });

    child.on("close", () => {
      if (killed) {
        return finish("Execution timed out or output was too large.");
      }
      return finish(stderr || stdout);
    });

    if (typeof input === "string" && input.length) {
      child.stdin.write(input);
    }
    child.stdin.end();
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Run failed" });
  }
};

const startRunSession = async (req, res) => {
  try {
    const { code, projectId, fileId, input } = req.body;
    const source = await resolveSource({
      code,
      projectId,
      fileId,
      userId: req.user.id,
    });

    const tempFile = writeTempFile(source);
    const child = spawn("python", ["-u", tempFile], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const sessionId = randomUUID();

    const session = {
      id: sessionId,
      userId: req.user.id,
      child,
      tempFile,
      clients: new Set(),
      events: [],
      outputBytes: 0,
      finished: false,
      terminatedReason: "",
      killTimer: null,
      cleanupTimer: null,
    };

    runSessions.set(sessionId, session);

    emitSessionEvent(session, "session", {
      sessionId,
      status: "running",
      timeoutMs: SESSION_TIMEOUT_MS,
    });

    const handleOutput = (stream, chunk) => {
      if (session.finished) return;
      session.outputBytes += Buffer.byteLength(chunk);
      if (session.outputBytes > MAX_OUTPUT_BYTES) {
        session.terminatedReason = "Execution output was too large.";
        child.kill("SIGKILL");
        return;
      }
      emitSessionEvent(session, "output", { stream, chunk: chunk.toString() });
    };

    child.stdout.on("data", (chunk) => handleOutput("stdout", chunk));
    child.stderr.on("data", (chunk) => handleOutput("stderr", chunk));

    child.on("error", (err) => {
      finishSession(session, { status: "error", message: err.message });
    });

    child.on("close", (exitCode, signal) => {
      if (session.finished) return;
      if (session.terminatedReason) {
        finishSession(session, { status: "killed", message: session.terminatedReason });
        return;
      }
      if (exitCode === 0) {
        finishSession(session, { status: "ok", exitCode: 0 });
        return;
      }
      finishSession(session, {
        status: "runtime_error",
        exitCode,
        signal,
        message: `Process exited with code ${exitCode}${signal ? ` (signal ${signal})` : ""}.`,
      });
    });

    session.killTimer = setTimeout(() => {
      if (session.finished) return;
      session.terminatedReason = `Execution timed out after ${Math.round(
        SESSION_TIMEOUT_MS / 1000
      )} seconds.`;
      child.kill("SIGKILL");
    }, SESSION_TIMEOUT_MS);

    if (typeof input === "string" && input.length) {
      child.stdin.write(input);
    }

    return res.status(201).json({ sessionId, timeoutMs: SESSION_TIMEOUT_MS });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Run failed" });
  }
};

const streamRunSession = (req, res) => {
  const session = runSessions.get(req.params.sessionId);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({
      error: "Run session not found (expired or unavailable on this server instance).",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  res.write(": connected\n\n");

  for (const evt of session.events) {
    sendSse(res, evt.event, evt.data);
  }

  if (session.finished) {
    return res.end();
  }

  session.clients.add(res);
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": ping\n\n");
    }
  }, 3000);

  req.on("close", () => {
    clearInterval(heartbeat);
    session.clients.delete(res);
  });
};

const sendRunInput = (req, res) => {
  const session = runSessions.get(req.params.sessionId);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({
      error: "Run session not found (expired or unavailable on this server instance).",
    });
  }
  if (session.finished) {
    return res.status(409).json({ error: "Run session already finished" });
  }

  const { input } = req.body;
  if (typeof input !== "string") {
    return res.status(400).json({ error: "Input must be a string" });
  }

  try {
    if (input.length) {
      session.child.stdin.write(input);
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Unable to write to stdin" });
  }
};

const stopRunSession = (req, res) => {
  const session = runSessions.get(req.params.sessionId);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({
      error: "Run session not found (expired or unavailable on this server instance).",
    });
  }
  if (!session.finished) {
    session.terminatedReason = "Execution stopped by user.";
    session.child.kill("SIGKILL");
  }
  return res.json({ stopped: true });
};

module.exports = {
  runPython,
  startRunSession,
  streamRunSession,
  sendRunInput,
  stopRunSession,
};
