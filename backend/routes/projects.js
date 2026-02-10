const express = require("express");
const auth = require("../middleware/auth");
const {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProjectTree,
  markOpened,
} = require("../controllers/projectController");

const router = express.Router();

router.use(auth);
router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.delete("/:id", deleteProject);
router.put("/:id/tree", updateProjectTree);
router.put("/:id/opened", markOpened);

module.exports = router;
