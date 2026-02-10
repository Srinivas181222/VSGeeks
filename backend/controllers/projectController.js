const crypto = require("crypto");
const Project = require("../models/Project");

const defaultFiles = () => [
  {
    id: crypto.randomUUID(),
    name: "main.py",
    type: "file",
    content: 'print("Hello from CodeLearn")',
  },
];

const createProject = async (req, res) => {
  const { name, files } = req.body;
  if (!name) return res.status(400).json({ error: "Project name required" });

  const project = await Project.create({
    userId: req.user.id,
    projectName: name,
    files: Array.isArray(files) && files.length ? files : defaultFiles(),
    lastOpened: new Date(),
  });

  return res.json(project);
};

const getProjects = async (req, res) => {
  const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  return res.json(projects);
};

const getProject = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json(project);
};

const deleteProject = async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json({ success: true });
};

const updateProjectTree = async (req, res) => {
  const { files } = req.body;
  if (!Array.isArray(files)) {
    return res.status(400).json({ error: "Files tree required" });
  }
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { files } },
    { new: true }
  );
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json(project);
};

const markOpened = async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { lastOpened: new Date() } },
    { new: true }
  );
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json(project);
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProjectTree,
  markOpened,
};
