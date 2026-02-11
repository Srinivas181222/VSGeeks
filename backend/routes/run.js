const express = require("express");
const auth = require("../middleware/auth");
const {
  runPython,
  startRunSession,
  streamRunSession,
  sendRunInput,
  stopRunSession,
} = require("../controllers/runController");

const router = express.Router();

router.post("/session", auth, startRunSession);
router.get("/session/:sessionId/stream", auth, streamRunSession);
router.post("/session/:sessionId/input", auth, sendRunInput);
router.delete("/session/:sessionId", auth, stopRunSession);
router.post("/", auth, runPython);

module.exports = router;
