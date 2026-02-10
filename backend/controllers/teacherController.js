const Submission = require("../models/Submission");
const User = require("../models/User");

const getStudents = async (req, res) => {
  const teacher = await User.findById(req.user.id);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access required" });
  }

  const students = await User.find({ teacherId: teacher._id, role: "student" });
  const studentIds = students.map((s) => s._id);

  const solvedStats = await Submission.aggregate([
    { $match: { userId: { $in: studentIds }, status: "Accepted" } },
    { $group: { _id: "$userId", solvedProblems: { $addToSet: "$problemId" } } },
    { $project: { solvedCount: { $size: "$solvedProblems" } } },
  ]);

  const submissionStats = await Submission.aggregate([
    { $match: { userId: { $in: studentIds } } },
    { $group: { _id: "$userId", submissions: { $sum: 1 }, lastSubmission: { $max: "$createdAt" } } },
  ]);

  const solvedMap = new Map(solvedStats.map((s) => [s._id.toString(), s.solvedCount]));
  const submissionMap = new Map(
    submissionStats.map((s) => [
      s._id.toString(),
      { submissions: s.submissions, lastSubmission: s.lastSubmission },
    ])
  );

  const data = students.map((student) => {
    const solvedCount = solvedMap.get(student._id.toString()) || 0;
    const submissionInfo = submissionMap.get(student._id.toString()) || {
      submissions: 0,
      lastSubmission: null,
    };
    return {
      id: student._id,
      name: student.displayName || student.email,
      email: student.email,
      solvedCount,
      submissions: submissionInfo.submissions,
      lastSubmission: submissionInfo.lastSubmission,
    };
  });

  return res.json({ teacher: teacher.email, students: data });
};

module.exports = { getStudents };
