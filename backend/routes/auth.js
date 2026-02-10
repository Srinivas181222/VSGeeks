const express = require("express");
const {
  signupStudent,
  signupTeacher,
  login,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup-student", signupStudent);
router.post("/signup-teacher", signupTeacher);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;
