const crypto = require("crypto");
const Project = require("../models/Project");
const { addChild, findNode, removeNode, updateNode } = require("../utils/tree");

const getTree = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json(project.files);
};

const createNode = async (req, res) => {
  const { parentId, type, name } = req.body;
  if (!name || !type) return res.status(400).json({ error: "Name and type required" });
  if (!["file", "folder"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const node = {
    id: crypto.randomUUID(),
    name,
    type,
    content: type === "file" ? "" : undefined,
    children: type === "folder" ? [] : undefined,
  };

  const ok = addChild(project.files, parentId || null, node);
  if (!ok) return res.status(400).json({ error: "Invalid parent folder" });

  await project.save();
  return res.json({ tree: project.files, node });
};

const renameNode = async (req, res) => {
  const { nodeId, name } = req.body;
  if (!nodeId || !name) return res.status(400).json({ error: "NodeId and name required" });

  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const ok = updateNode(project.files, nodeId, (node) => {
    node.name = name;
  });
  if (!ok) return res.status(404).json({ error: "Node not found" });

  await project.save();
  return res.json({ tree: project.files });
};

const deleteNode = async (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) return res.status(400).json({ error: "NodeId required" });

  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const ok = removeNode(project.files, nodeId);
  if (!ok) return res.status(404).json({ error: "Node not found" });

  await project.save();
  return res.json({ tree: project.files });
};

const updateContent = async (req, res) => {
  const { nodeId, content } = req.body;
  if (!nodeId) return res.status(400).json({ error: "NodeId required" });

  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const ok = updateNode(project.files, nodeId, (node) => {
    if (node.type !== "file") return;
    node.content = content ?? "";
  });
  if (!ok) return res.status(404).json({ error: "Node not found" });

  await project.save();
  return res.json({ tree: project.files });
};

const getFile = async (req, res) => {
  const { nodeId } = req.params;
  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });
  const node = findNode(project.files, nodeId);
  if (!node || node.type !== "file") return res.status(404).json({ error: "File not found" });
  return res.json(node);
};

module.exports = {
  getTree,
  createNode,
  renameNode,
  deleteNode,
  updateContent,
  getFile,
};
