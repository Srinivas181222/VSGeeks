const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Project = require("../models/Project");
const { findNode } = require("../utils/tree");

const runPython = async (req, res) => {
  const { code, projectId, fileId, input } = req.body;

  let source = code;
  if (!source && projectId && fileId) {
    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const node = findNode(project.files, fileId);
    if (!node || node.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }
    source = node.content || "";
  }

  if (typeof source !== "string") {
    return res.status(400).json({ error: "Code required" });
  }

  const tempFile = path.join(
    os.tmpdir(),
    `codelearn-${Date.now()}-${Math.random().toString(16).slice(2)}.py`
  );

  fs.writeFileSync(tempFile, source, "utf8");

  const child = spawn("python", [tempFile], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  let killed = false;
  const maxOutput = 1024 * 1024;

  const killTimer = setTimeout(() => {
    killed = true;
    child.kill("SIGKILL");
  }, 5000);

  const finish = (output) => {
    clearTimeout(killTimer);
    fs.unlink(tempFile, () => {});
    return res.json({ output });
  };

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
    if (stdout.length > maxOutput) {
      killed = true;
      child.kill("SIGKILL");
    }
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
    if (stderr.length > maxOutput) {
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
};

module.exports = { runPython };
