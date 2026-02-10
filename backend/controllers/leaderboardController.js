const Submission = require("../models/Submission");
const User = require("../models/User");

const getLeaderboard = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const teacherId = user.role === "teacher" ? user._id : user.teacherId;
  if (!teacherId) return res.status(400).json({ error: "Teacher not assigned" });

  const stats = await Submission.aggregate([
    { $match: { teacherId, status: "Accepted" } },
    {
      $group: {
        _id: "$userId",
        solvedProblems: { $addToSet: "$problemId" },
        avgRuntime: { $avg: "$runtimeMs" },
        lastSubmission: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        solvedCount: { $size: "$solvedProblems" },
        avgRuntime: { $ifNull: ["$avgRuntime", 0] },
        lastSubmission: 1,
      },
    },
    { $sort: { solvedCount: -1, avgRuntime: 1 } },
  ]);

  const userIds = stats.map((s) => s._id);
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const leaderboard = stats.map((s, index) => {
    const profile = userMap.get(s._id.toString());
    return {
      rank: index + 1,
      studentId: s._id,
      name: profile?.displayName || profile?.email || "Student",
      email: profile?.email,
      solvedCount: s.solvedCount,
      avgRuntime: Math.round(s.avgRuntime),
      lastSubmission: s.lastSubmission,
    };
  });

  return res.json({ teacherId, leaderboard });
};

module.exports = { getLeaderboard };
