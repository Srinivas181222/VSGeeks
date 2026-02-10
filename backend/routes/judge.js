const express = require("express");
const auth = require("../middleware/auth");
const { judgeProblem } = require("../controllers/judgeController");

const router = express.Router();

router.post("/", auth, judgeProblem);

module.exports = router;
