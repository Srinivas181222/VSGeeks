const express = require("express");
const auth = require("../middleware/auth");
const { runPython } = require("../controllers/runController");

const router = express.Router();

router.post("/", auth, runPython);

module.exports = router;
