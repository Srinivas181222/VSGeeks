const crypto = require("crypto");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const listCourses = async (req, res) => {
  const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
  return res.json(courses);
};

const getCourse = async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, published: true });
  if (!course) return res.status(404).json({ error: "Course not found" });
  return res.json(course);
};

const enroll = async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, published: true });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const existing = await Enrollment.findOne({
    userId: req.user.id,
    courseId: course._id,
  });
  if (existing) return res.json(existing);

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId: course._id,
    lastAccessed: new Date(),
  });
  return res.json(enrollment);
};

const getProgress = async (req, res) => {
  const enrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.id,
  });
  if (!enrollment) return res.status(404).json({ error: "Not enrolled" });
  return res.json(enrollment);
};

const updateProgress = async (req, res) => {
  const { lessonId, completed } = req.body;
  if (!lessonId) return res.status(400).json({ error: "lessonId required" });

  const enrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.id,
  });
  if (!enrollment) return res.status(404).json({ error: "Not enrolled" });

  const set = new Set(enrollment.completedLessons);
  if (completed === false) set.delete(lessonId);
  else set.add(lessonId);

  enrollment.completedLessons = Array.from(set);
  enrollment.lastAccessed = new Date();
  await enrollment.save();

  return res.json(enrollment);
};

const submitAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { code } = req.body;

  const enrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.id,
  });
  if (!enrollment) return res.status(404).json({ error: "Not enrolled" });

  const existing = enrollment.assignmentSubmissions.find(
    (sub) => sub.assignmentId === assignmentId
  );

  if (existing) {
    existing.code = code || "";
    existing.submittedAt = new Date();
    existing.status = "submitted";
  } else {
    enrollment.assignmentSubmissions.push({
      assignmentId,
      code: code || "",
      status: "submitted",
    });
  }

  enrollment.lastAccessed = new Date();
  await enrollment.save();

  return res.json(enrollment);
};

const seedCourses = async (req, res) => {
  const count = await Course.countDocuments();
  if (count > 0) {
    return res.json({ message: "Courses already seeded" });
  }

  const course = await Course.create({
    title: "Python Foundations",
    slug: "python-foundations",
    description: "Master Python fundamentals with hands-on exercises.",
    level: "Beginner",
    duration: "3 weeks",
    lessons: [
      {
        id: crypto.randomUUID(),
        title: "Getting Started",
        content:
          "Learn about variables, print statements, and basic syntax.",
        example: 'print("Hello, CodeLearn!")',
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        title: "Control Flow",
        content: "Use if statements and loops to control logic.",
        example: "for n in range(3):\n    print(n)",
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        title: "Functions",
        content: "Create reusable code with functions.",
        example: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))",
        order: 3,
      },
    ],
    assignments: [
      {
        id: crypto.randomUUID(),
        title: "FizzBuzz",
        prompt: "Implement FizzBuzz from 1 to 50.",
        starter: "for n in range(1, 51):\n    # TODO\n    pass\n",
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        title: "Mini Calculator",
        prompt: "Write a function that evaluates simple + and - expressions.",
        starter: "def calc(expr):\n    # TODO\n    return 0\n",
        order: 2,
      },
    ],
    published: true,
  });

  return res.json({ message: "Seeded", course });
};

module.exports = {
  listCourses,
  getCourse,
  enroll,
  getProgress,
  updateProgress,
  submitAssignment,
  seedCourses,
};
