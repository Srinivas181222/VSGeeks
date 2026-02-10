const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true },
    code: { type: String, default: "" },
    status: { type: String, default: "submitted" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", index: true },
    completedLessons: { type: [String], default: [] },
    assignmentSubmissions: { type: [AssignmentSubmissionSchema], default: [] },
    lastAccessed: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
