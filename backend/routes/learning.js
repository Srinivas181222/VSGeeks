const express = require("express");
const auth = require("../middleware/auth");
const {
  listTopics,
  getTopic,
  listProblems,
  getProblem,
  listChallenges,
  getChallenge,
  seedPython,
} = require("../controllers/learningController");

const router = express.Router();

router.get("/topics", listTopics);
router.get("/topics/:id", getTopic);
router.get("/problems", listProblems);
router.get("/problems/:id", getProblem);
router.get("/challenges", listChallenges);
router.get("/challenges/:id", getChallenge);

router.post("/seed/python", auth, seedPython);

module.exports = router;
