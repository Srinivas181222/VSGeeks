const express = require("express");
const router = express.Router();

// GET topics
router.get("/topics", (req, res) => {
  res.json([
    { title: "Python Basics", slug: "python-basics" },
    { title: "Loops", slug: "loops" },
    { title: "Functions", slug: "functions" }
  ]);
});

// GET lesson
router.get("/lesson/:slug", (req, res) => {
  const lessons = {
    "python-basics": {
      title: "Python Basics",
      content: "print('Hello world')"
    },
    "loops": {
      title: "Loops",
      content: "for i in range(5): print(i)"
    },
    "functions": {
      title: "Functions",
      content: "def greet(): print('hi')"
    }
  };

  res.json(lessons[req.params.slug] || {});
});

module.exports = router;
