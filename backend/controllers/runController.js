const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Project = require("../models/Project");
const { findNode } = require("../utils/tree");

const runPython = async (req, res) => {
  const { code, projectId, fileId } = req.body;

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

  execFile(
    "python",
    [tempFile],
    { timeout: 5000, maxBuffer: 1024 * 1024 },
    (error, stdout, stderr) => {
      fs.unlink(tempFile, () => {});
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      return res.json({ output: stdout });
    }
  );
};

module.exports = { runPython };
