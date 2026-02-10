const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    example: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    prompt: { type: String, default: "" },
    starter: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    level: { type: String, default: "Beginner" },
    duration: { type: String, default: "2 weeks" },
    lessons: { type: [LessonSchema], default: [] },
    assignments: { type: [AssignmentSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
