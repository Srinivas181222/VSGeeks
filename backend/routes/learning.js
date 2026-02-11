const express = require("express");
const auth = require("../middleware/auth");
const {
  listTopics,
  getTopic,
  listProblems,
  getProblem,
  listChallenges,
  getChallenge,
  getChallengeLeaderboard,
  seedPython,
  seedChallenges,
} = require("../controllers/learningController");

const router = express.Router();

router.get("/topics", listTopics);
router.get("/topics/:id", getTopic);

router.get("/problems", listProblems);
router.get("/problems/:id", getProblem);

router.get("/challenges", listChallenges);
router.get("/challenges/:id", getChallenge);
router.get("/challenges/:id/leaderboard", auth, getChallengeLeaderboard);

router.post("/seed/python", auth, seedPython);
router.post("/seed/challenges", auth, seedChallenges);

module.exports = router;
