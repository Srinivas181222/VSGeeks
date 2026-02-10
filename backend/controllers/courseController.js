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
  if (count > 0 && req.query.force !== "true") {
    return res.json({ message: "Courses already seeded" });
  }

  if (req.query.force === "true") {
    await Enrollment.deleteMany({});
    await Course.deleteMany({});
  }

  const courses = await Course.insertMany([
    {
      title: "Python Foundations",
      slug: "python-foundations",
      description: "Master Python fundamentals with guided practice.",
      level: "Beginner",
      duration: "3 weeks",
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Getting Started",
          content: "Variables, print statements, and simple expressions.",
          example: 'name = "CodeLearn"\nprint("Hello", name)\n',
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Input and Output",
          content: "Use input() to read data and print() to display results.",
          example:
            'name = input("Name: ")\nprint("Welcome,", name)\n',
          order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "Conditionals",
          content: "Branch logic with if/elif/else and comparison operators.",
          example: "score = 82\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\n",
          order: 3,
        },
        {
          id: crypto.randomUUID(),
          title: "Loops",
          content: "Use for and while loops to repeat work.",
          example: "total = 0\nfor n in range(1, 6):\n    total += n\nprint(total)\n",
          order: 4,
        },
        {
          id: crypto.randomUUID(),
          title: "Functions",
          content: "Package logic into functions with parameters and returns.",
          example:
            "def area(w, h=1):\n    return w * h\n\nprint(area(4, 3))\n",
          order: 5,
        },
        {
          id: crypto.randomUUID(),
          title: "Lists and Dictionaries",
          content: "Store collections of data and iterate over them.",
          example:
            "scores = {\"Ada\": 96, \"Linus\": 92}\nfor name, score in scores.items():\n    print(name, score)\n",
          order: 6,
        },
        {
          id: crypto.randomUUID(),
          title: "Strings and Formatting",
          content: "Work with strings, slicing, and f-strings.",
          example:
            "lang = \"python\"\nprint(lang[:3])\nprint(f\"I love {lang.upper()}\")\n",
          order: 7,
        },
        {
          id: crypto.randomUUID(),
          title: "Debugging Basics",
          content: "Read tracebacks, use print debugging, and test small pieces.",
          example:
            "def safe_divide(a, b):\n    if b == 0:\n        return None\n    return a / b\n\nprint(safe_divide(10, 2))\n",
          order: 8,
        },
      ],
      assignments: [
        {
          id: crypto.randomUUID(),
          title: "FizzBuzz",
          prompt: "Print numbers from 1 to 50 with Fizz/Buzz rules.",
          starter: "for n in range(1, 51):\n    # TODO\n    pass\n",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "List Stats",
          prompt: "Return min, max, and average from a list of numbers.",
          starter:
            "def stats(nums):\n    # TODO\n    return 0, 0, 0\n",
          order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "Word Counter",
          prompt: "Count how many times each word appears in a sentence.",
          starter:
            "def count_words(text):\n    # TODO\n    return {}\n",
          order: 3,
        },
        {
          id: crypto.randomUUID(),
          title: "Mini Calculator",
          prompt: "Evaluate simple + and - expressions like '3+5-2'.",
          starter: "def calc(expr):\n    # TODO\n    return 0\n",
          order: 4,
        },
      ],
      published: true,
    },
    {
      title: "Python Data Toolkit",
      slug: "python-data-toolkit",
      description: "Process data with files, CSV, and structured collections.",
      level: "Intermediate",
      duration: "4 weeks",
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "List Processing",
          content: "Filter, map, and aggregate lists of values.",
          example: "nums = [1, 2, 3, 4, 5]\nprint(sum(nums))\n",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Comprehensions",
          content: "Build lists and dicts with compact syntax.",
          example:
            "squares = [n * n for n in range(1, 6)]\nprint(squares)\n",
          order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "File I/O",
          content: "Read and write files safely using with blocks.",
          example:
            "with open(\"data.txt\", \"w\") as f:\n    f.write(\"Hello\")\n",
          order: 3,
        },
        {
          id: crypto.randomUUID(),
          title: "CSV Parsing",
          content: "Use the csv module to read structured data.",
          example:
            "import csv\nwith open(\"scores.csv\") as f:\n    reader = csv.reader(f)\n    for row in reader:\n        print(row)\n",
          order: 4,
        },
        {
          id: crypto.randomUUID(),
          title: "Error Handling",
          content: "Handle bad data and missing files with try/except.",
          example:
            "try:\n    value = int(\"x\")\nexcept ValueError:\n    print(\"Bad number\")\n",
          order: 5,
        },
        {
          id: crypto.randomUUID(),
          title: "Modules",
          content: "Organize code into reusable modules.",
          example:
            "import math\nprint(math.sqrt(16))\n",
          order: 6,
        },
      ],
      assignments: [
        {
          id: crypto.randomUUID(),
          title: "Sales Report",
          prompt: "Read a list of numbers and return total and average.",
          starter:
            "def report(nums):\n    # TODO\n    return 0, 0\n",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "CSV Cleaner",
          prompt:
            "Read rows and keep only those with a valid email field.",
          starter:
            "def filter_rows(rows):\n    # TODO\n    return []\n",
          order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "Log Analyzer",
          prompt:
            "Count how many times each error code appears in a log list.",
          starter:
            "def count_errors(codes):\n    # TODO\n    return {}\n",
          order: 3,
        },
      ],
      published: true,
    },
  ]);

  return res.json({ message: "Seeded", courses });
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
