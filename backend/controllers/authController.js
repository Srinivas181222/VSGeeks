const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");

const signupStudent = async (req, res) => {
  const { email, password, teacherEmail, displayName } = req.body;
  if (!email || !password || !teacherEmail) {
    return res.status(400).json({ error: "Email, password, and teacher email required" });
  }
  if (!validator.isEmail(email) || !validator.isEmail(teacherEmail)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const teacher = await User.findOne({ email: teacherEmail, role: "teacher" });
  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    role: "student",
    displayName: displayName || "",
    teacherId: teacher._id,
    teacherEmail: teacher.email,
    emailVerified: true,
    verificationToken: "",
    verificationTokenExpires: null,
  });

  return res.json({
    message: "Account created. You can log in now.",
    user: { id: user._id, email: user.email, role: user.role, teacherEmail },
  });
};

const signupTeacher = async (req, res) => {
  const { email, password, teacherCode, displayName } = req.body;
  if (!email || !password || !teacherCode) {
    return res.status(400).json({ error: "Email, password, and teacher code required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  if (teacherCode !== (process.env.TEACHER_CODE || "CODELEARN_TEACHER")) {
    return res.status(403).json({ error: "Invalid teacher code" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    role: "teacher",
    displayName: displayName || "",
    emailVerified: true,
    verificationToken: "",
    verificationTokenExpires: null,
  });

  return res.json({
    message: "Account created. You can log in now.",
    user: { id: user._id, email: user.email, role: user.role },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      teacherEmail: user.teacherEmail || "",
      displayName: user.displayName || "",
    },
  });
};

const verifyEmail = async (req, res) => {
  return res.json({ message: "Email verification is disabled." });
};

const resendVerification = async (req, res) => {
  return res.json({ message: "Email verification is disabled." });
};

module.exports = { signupStudent, signupTeacher, login, verifyEmail, resendVerification };
