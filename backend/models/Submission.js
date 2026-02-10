const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: null },
    status: { type: String, default: "Rejected" },
    runtimeMs: { type: Number, default: 0 },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", SubmissionSchema);
