const crypto = require("crypto");
const Topic = require("../models/Topic");
const Problem = require("../models/Problem");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

const listTopics = async (req, res) => {
  const topics = await Topic.find().sort({ order: 1 });
  return res.json(topics);
};

const getTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ error: "Topic not found" });
  return res.json(topic);
};

const listProblems = async (req, res) => {
  const { topicId } = req.query;
  const filter = topicId ? { topicId } : {};
  const problems = await Problem.find(filter).sort({ createdAt: 1 });
  return res.json(problems);
};

const getProblem = async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  return res.json(problem);
};

const listChallenges = async (req, res) => {
  const challenges = await Challenge.find({ active: true }).sort({ createdAt: -1 });
  return res.json(challenges);
};

const getChallenge = async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ error: "Challenge not found" });
  return res.json(challenge);
};

const seedPython = async (req, res) => {
  if (req.user?.id) {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ error: "Teacher access required" });
    }
  }

  const topicsCount = await Topic.countDocuments();
  const problemsCount = await Problem.countDocuments();
  if (topicsCount > 0 || problemsCount > 0) {
    return res.json({ message: "Already seeded" });
  }

  const topics = await Topic.insertMany([
    {
      title: "Python Basics",
      slug: "python-basics",
      description: "Syntax, print, inputs, and foundational operations.",
      order: 1,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Hello Python",
          content: "Learn print statements and basic syntax.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Numbers and Strings",
          content: "Work with integers, floats, and string operations.",
          order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "Input and Output",
          content: "Collect input and format output.",
          order: 3,
        },
      ],
    },
    {
      title: "Variables & Data Types",
      slug: "variables-data-types",
      description: "Variables, lists, dicts, tuples, and type handling.",
      order: 2,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Variables",
          content: "Assign and reassign values.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Collections",
          content: "Lists, tuples, and dictionaries.",
          order: 2,
        },
      ],
    },
    {
      title: "Conditionals & Loops",
      slug: "conditionals-loops",
      description: "if/else logic, for/while loops, and flow control.",
      order: 3,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "If Statements",
          content: "Branch logic with if/elif/else.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Loops",
          content: "Iterate with for and while loops.",
          order: 2,
        },
      ],
    },
    {
      title: "Functions",
      slug: "functions",
      description: "Reusable logic, parameters, return values, and helpers.",
      order: 4,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Defining Functions",
          content: "Create and call functions.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Parameters",
          content: "Use positional and keyword arguments.",
          order: 2,
        },
      ],
    },
    {
      title: "OOP",
      slug: "oop",
      description: "Classes, objects, methods, and encapsulation.",
      order: 5,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Classes and Objects",
          content: "Define classes and instantiate objects.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Methods",
          content: "Create instance methods and properties.",
          order: 2,
        },
      ],
    },
    {
      title: "Modules & Packages",
      slug: "modules-packages",
      description: "Importing modules, using standard libraries, packaging code.",
      order: 6,
      lessons: [
        {
          id: crypto.randomUUID(),
          title: "Importing Modules",
          content: "Use import statements and aliases.",
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Standard Library",
          content: "Math, random, and datetime modules.",
          order: 2,
        },
      ],
    },
  ]);

  const topicMap = new Map(topics.map((t) => [t.slug, t._id]));

  const buildProblems = (topicSlug, templates) => {
    const problems = [];
    for (let i = 1; i <= 50; i += 1) {
      const template = templates[(i - 1) % templates.length];
      const data = template(i);
      problems.push({
        topicId: topicMap.get(topicSlug),
        title: `${data.title} ${i}`,
        slug: `${topicSlug}-${data.slug}-${i}`,
        difficulty: data.difficulty,
        prompt: data.prompt,
        entryType: data.entryType || "function",
        entryName: data.entryName,
        starter: data.starter,
        solution: data.solution,
        complexity: data.complexity || "O(n)",
        testCases: data.testCases,
      });
    }
    return problems;
  };

  const basicTemplates = [
    (i) => ({
      title: "Add Two Numbers",
      slug: "add-two",
      difficulty: "Easy",
      prompt: "Return the sum of two integers.",
      entryName: "add_numbers",
      starter: "def add_numbers(a, b):\n    # TODO\n    return 0\n",
      solution: "def add_numbers(a, b):\n    return a + b\n",
      testCases: [
        { input: [i, i + 1], output: i + i + 1 },
        { input: [10, -5], output: 5 },
      ],
    }),
    (i) => ({
      title: "Square Value",
      slug: "square",
      difficulty: "Easy",
      prompt: "Return the square of the input.",
      entryName: "square",
      starter: "def square(n):\n    # TODO\n    return 0\n",
      solution: "def square(n):\n    return n * n\n",
      testCases: [
        { input: [i], output: i * i },
        { input: [4], output: 16 },
      ],
    }),
    (i) => ({
      title: "Greeting",
      slug: "greet",
      difficulty: "Easy",
      prompt: "Return a greeting for the given name.",
      entryName: "greet",
      starter: 'def greet(name):\n    # TODO\n    return ""\n',
      solution: 'def greet(name):\n    return f"Hello, {name}!"\n',
      testCases: [
        { input: ["Ada"], output: "Hello, Ada!" },
        { input: ["CodeLearn"], output: "Hello, CodeLearn!" },
      ],
    }),
  ];

  const variableTemplates = [
    (i) => ({
      title: "List Sum",
      slug: "list-sum",
      difficulty: "Easy",
      prompt: "Return the sum of all numbers in a list.",
      entryName: "sum_list",
      starter: "def sum_list(nums):\n    # TODO\n    return 0\n",
      solution: "def sum_list(nums):\n    return sum(nums)\n",
      testCases: [
        { input: [[i, i + 1, i + 2]], output: i + i + 1 + i + 2 },
        { input: [[1, 2, 3]], output: 6 },
      ],
    }),
    (i) => ({
      title: "Dictionary Lookup",
      slug: "dict-lookup",
      difficulty: "Easy",
      prompt: "Return the value for a key in the dictionary or 0 if missing.",
      entryName: "get_value",
      starter: "def get_value(data, key):\n    # TODO\n    return 0\n",
      solution: "def get_value(data, key):\n    return data.get(key, 0)\n",
      testCases: [
        { input: [{ a: i }, "a"], output: i },
        { input: [{ b: 2 }, "a"], output: 0 },
      ],
    }),
    (i) => ({
      title: "String Length",
      slug: "string-length",
      difficulty: "Easy",
      prompt: "Return the length of the string.",
      entryName: "string_length",
      starter: 'def string_length(text):\n    # TODO\n    return 0\n',
      solution: "def string_length(text):\n    return len(text)\n",
      testCases: [
        { input: ["python"], output: 6 },
        { input: ["loop" + "s" * (i % 3)], output: 4 + (i % 3) },
      ],
    }),
  ];

  const loopTemplates = [
    (i) => ({
      title: "Sum to N",
      slug: "sum-to-n",
      difficulty: "Easy",
      prompt: "Return the sum of integers from 1 to n.",
      entryName: "sum_to_n",
      starter: "def sum_to_n(n):\n    # TODO\n    return 0\n",
      solution: "def sum_to_n(n):\n    return n * (n + 1) // 2\n",
      testCases: [
        { input: [i], output: (i * (i + 1)) // 2 },
        { input: [10], output: 55 },
      ],
    }),
    (i) => ({
      title: "Count Evens",
      slug: "count-evens",
      difficulty: "Easy",
      prompt: "Count how many even numbers are in the list.",
      entryName: "count_evens",
      starter: "def count_evens(nums):\n    # TODO\n    return 0\n",
      solution: "def count_evens(nums):\n    return sum(1 for n in nums if n % 2 == 0)\n",
      testCases: [
        { input: [[1, 2, 3, 4]], output: 2 },
        { input: [[i, i + 1, i + 2]], output: [i, i + 1, i + 2].filter((n) => n % 2 === 0).length },
      ],
    }),
    (i) => ({
      title: "Factorial",
      slug: "factorial",
      difficulty: "Medium",
      prompt: "Return n factorial.",
      entryName: "factorial",
      starter: "def factorial(n):\n    # TODO\n    return 1\n",
      solution:
        "def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n",
      testCases: [
        { input: [5], output: 120 },
        { input: [i % 6], output: [1, 1, 2, 6, 24, 120][i % 6] },
      ],
    }),
  ];

  const functionTemplates = [
    (i) => ({
      title: "Power Function",
      slug: "power",
      difficulty: "Easy",
      prompt: "Return base raised to exponent.",
      entryName: "power",
      starter: "def power(base, exp):\n    # TODO\n    return 0\n",
      solution: "def power(base, exp):\n    return base ** exp\n",
      testCases: [
        { input: [2, i % 5], output: 2 ** (i % 5) },
        { input: [3, 2], output: 9 },
      ],
    }),
    (i) => ({
      title: "Average",
      slug: "average",
      difficulty: "Easy",
      prompt: "Return the average of the list.",
      entryName: "average",
      starter: "def average(nums):\n    # TODO\n    return 0\n",
      solution: "def average(nums):\n    return sum(nums) / len(nums) if nums else 0\n",
      testCases: [
        { input: [[i, i + 2, i + 4]], output: (i + i + 2 + i + 4) / 3 },
        { input: [[1, 2, 3, 4]], output: 2.5 },
      ],
    }),
    (i) => ({
      title: "Palindrome Check",
      slug: "palindrome",
      difficulty: "Easy",
      prompt: "Return True if the string is a palindrome.",
      entryName: "is_palindrome",
      starter: "def is_palindrome(text):\n    # TODO\n    return False\n",
      solution: "def is_palindrome(text):\n    return text == text[::-1]\n",
      testCases: [
        { input: ["level"], output: true },
        { input: ["code"], output: false },
      ],
    }),
  ];

  const oopTemplates = [
    (i) => ({
      title: "Counter Class",
      slug: "counter",
      difficulty: "Medium",
      prompt:
        "Create a Counter class with methods inc(n=1) and value(). Return outputs for the calls.",
      entryType: "class",
      entryName: "Counter",
      starter:
        "class Counter:\n    def __init__(self, start=0):\n        self.count = start\n\n    def inc(self, n=1):\n        # TODO\n        pass\n\n    def value(self):\n        # TODO\n        return 0\n",
      solution:
        "class Counter:\n    def __init__(self, start=0):\n        self.count = start\n\n    def inc(self, n=1):\n        self.count += n\n        return None\n\n    def value(self):\n        return self.count\n",
      testCases: [
        {
          input: { init: [i], calls: [["inc", [2]], ["value", []]] },
          output: [null, i + 2],
        },
      ],
      complexity: "O(1)",
    }),
    (i) => ({
      title: "Bank Account",
      slug: "bank-account",
      difficulty: "Medium",
      prompt:
        "Implement BankAccount with deposit(amount), withdraw(amount), balance(). Return outputs for calls.",
      entryType: "class",
      entryName: "BankAccount",
      starter:
        "class BankAccount:\n    def __init__(self, balance=0):\n        self.amount = balance\n\n    def deposit(self, amount):\n        # TODO\n        pass\n\n    def withdraw(self, amount):\n        # TODO\n        pass\n\n    def balance(self):\n        # TODO\n        return 0\n",
      solution:
        "class BankAccount:\n    def __init__(self, balance=0):\n        self.amount = balance\n\n    def deposit(self, amount):\n        self.amount += amount\n        return None\n\n    def withdraw(self, amount):\n        if amount <= self.amount:\n            self.amount -= amount\n        return None\n\n    def balance(self):\n        return self.amount\n",
      testCases: [
        {
          input: { init: [100], calls: [["deposit", [i]], ["withdraw", [30]], ["balance", []]] },
          output: [null, null, 100 + i - 30],
        },
      ],
      complexity: "O(1)",
    }),
  ];

  const moduleTemplates = [
    (i) => ({
      title: "Square Root",
      slug: "sqrt",
      difficulty: "Easy",
      prompt: "Return the square root of n rounded to 2 decimals.",
      entryName: "sqrt_two",
      starter: "import math\n\ndef sqrt_two(n):\n    # TODO\n    return 0\n",
      solution: "import math\n\ndef sqrt_two(n):\n    return round(math.sqrt(n), 2)\n",
      testCases: [
        { input: [i * i], output: i },
        { input: [2], output: 1.41 },
      ],
      complexity: "O(1)",
    }),
    (i) => ({
      title: "GCD",
      slug: "gcd",
      difficulty: "Easy",
      prompt: "Return the greatest common divisor of a and b.",
      entryName: "gcd",
      starter: "import math\n\ndef gcd(a, b):\n    # TODO\n    return 1\n",
      solution: "import math\n\ndef gcd(a, b):\n    return math.gcd(a, b)\n",
      testCases: [
        { input: [i + 2, (i + 2) * 3], output: i + 2 },
        { input: [12, 18], output: 6 },
      ],
      complexity: "O(log n)",
    }),
  ];

  const problems = [
    ...buildProblems("python-basics", basicTemplates),
    ...buildProblems("variables-data-types", variableTemplates),
    ...buildProblems("conditionals-loops", loopTemplates),
    ...buildProblems("functions", functionTemplates),
    ...buildProblems("oop", oopTemplates),
    ...buildProblems("modules-packages", moduleTemplates),
  ];

  await Problem.insertMany(problems);

  const sampleChallenge = await Challenge.create({
    title: "Python Sprint Challenge",
    description: "Solve 10 problems fast. Ranked by solved count and runtime.",
    problemIds: problems.slice(0, 10).map((p) => p._id),
    active: true,
  });

  return res.json({ message: "Seeded", topics, challenge: sampleChallenge });
};

module.exports = {
  listTopics,
  getTopic,
  listProblems,
  getProblem,
  listChallenges,
  getChallenge,
  seedPython,
};
