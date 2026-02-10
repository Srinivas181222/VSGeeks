const express = require("express");
const auth = require("../middleware/auth");
const {
  getTree,
  createNode,
  renameNode,
  deleteNode,
  updateContent,
  getFile,
} = require("../controllers/fileController");

const router = express.Router();

router.use(auth);
router.get("/:id/tree", getTree);
router.post("/:id/create", createNode);
router.put("/:id/rename", renameNode);
router.delete("/:id/delete", deleteNode);
router.put("/:id/content", updateContent);
router.get("/:id/file/:nodeId", getFile);

module.exports = router;
