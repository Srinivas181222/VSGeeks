const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/email");

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
  const verificationToken = crypto.randomBytes(24).toString("hex");
  const user = await User.create({
    email,
    password: hashed,
    role: "student",
    displayName: displayName || "",
    teacherId: teacher._id,
    teacherEmail: teacher.email,
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  await sendVerificationEmail({ to: user.email, token: verificationToken });

  return res.json({
    message: "Verification email sent",
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
  const verificationToken = crypto.randomBytes(24).toString("hex");
  const user = await User.create({
    email,
    password: hashed,
    role: "teacher",
    displayName: displayName || "",
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  await sendVerificationEmail({ to: user.email, token: verificationToken });

  return res.json({
    message: "Verification email sent",
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
  if (!user.emailVerified) {
    return res.status(403).json({ error: "Email not verified" });
  }

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
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Token required" });

  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(404).json({ error: "Invalid token" });
  if (user.emailVerified) return res.json({ message: "Already verified" });
  if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
    return res.status(400).json({ error: "Token expired" });
  }

  user.emailVerified = true;
  user.verificationToken = "";
  user.verificationTokenExpires = null;
  await user.save();

  return res.json({ message: "Email verified" });
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.emailVerified) return res.json({ message: "Already verified" });

  const verificationToken = crypto.randomBytes(24).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.save();

  await sendVerificationEmail({ to: user.email, token: verificationToken });
  return res.json({ message: "Verification email sent" });
};

module.exports = { signupStudent, signupTeacher, login, verifyEmail, resendVerification };
