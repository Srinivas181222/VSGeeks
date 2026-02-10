const express = require("express");
const auth = require("../middleware/auth");
const { getStudents } = require("../controllers/teacherController");

const router = express.Router();

router.get("/students", auth, getStudents);

module.exports = router;
