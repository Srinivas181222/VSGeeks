const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const fileRoutes = require("./routes/files");
const runRoutes = require("./routes/run");
const courseRoutes = require("./routes/courses");
const learningRoutes = require("./routes/learning");
const judgeRoutes = require("./routes/judge");
const leaderboardRoutes = require("./routes/leaderboard");
const teacherRoutes = require("./routes/teacher");

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "2mb" }));

connectDb()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.json({ status: "CodeLearn API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/run", runRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", learningRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/teacher", teacherRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
