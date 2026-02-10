const express = require("express");
const auth = require("../middleware/auth");
const {
  listCourses,
  getCourse,
  enroll,
  getProgress,
  updateProgress,
  submitAssignment,
  seedCourses,
} = require("../controllers/courseController");

const router = express.Router();

router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/seed", seedCourses);

router.post("/:id/enroll", auth, enroll);
router.get("/:id/progress", auth, getProgress);
router.put("/:id/progress", auth, updateProgress);
router.post("/:id/assignment/:assignmentId/submit", auth, submitAssignment);

module.exports = router;
