export const tutorials = [
  {
    id: "python-basics",
    title: "Python Basics",
    content:
      "Learn how Python runs top to bottom, how to print output, and how to use variables. Focus on simple statements and reading error messages.",
    example: `print("Hello, CodeLearn")\nname = "Ada"\nprint("Welcome,", name)\n`,
    task:
      "Print your name and your favorite number on separate lines. Then print a short sentence that uses both values.",
  },
  {
    id: "variables-types",
    title: "Variables and Types",
    content:
      "Python has dynamic types. Use int, float, str, and bool values, and check types with type().",
    example: `age = 18\nprice = 3.5\nis_student = True\nprint(type(age), type(price), type(is_student))\n`,
    task:
      "Create variables for height (float), city (str), and enrolled (bool). Print their types.",
  },
  {
    id: "strings",
    title: "Strings and Slicing",
    content:
      "Strings are sequences. You can index, slice, and format them using f-strings.",
    example: `language = "python"\nprint(language[0])\nprint(language[1:4])\nprint(f"I am learning {language.upper()}")\n`,
    task:
      "Given a word, print the first 3 letters, the last 2 letters, and the word in uppercase.",
  },
  {
    id: "lists-tuples",
    title: "Lists and Tuples",
    content:
      "Lists are mutable sequences, tuples are immutable. Use append, pop, and indexing.",
    example: `numbers = [3, 1, 4]\nnumbers.append(2)\nprint(numbers)\ncoords = (10, 20)\nprint(coords[0], coords[1])\n`,
    task:
      "Create a list of 5 numbers, remove the last number, and print the updated list.",
  },
  {
    id: "dicts-sets",
    title: "Dictionaries and Sets",
    content:
      "Dictionaries map keys to values. Sets store unique values and support membership checks.",
    example: `scores = {"Ada": 96, "Linus": 92}\nprint(scores["Ada"])\nletters = set("hello")\nprint(letters)\n`,
    task:
      "Add a new key to a dictionary and check if a value exists in a set.",
  },
  {
    id: "conditionals",
    title: "Conditionals",
    content:
      "Use if, elif, and else to branch logic. Combine conditions with and/or.",
    example: `score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")\n`,
    task:
      "Write a grade classifier that prints A, B, C, or F based on a score.",
  },
  {
    id: "loops",
    title: "Loops",
    content:
      "Use for loops with range and while loops for repetition. Track counters and break when needed.",
    example: `total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)\n`,
    task:
      "Print all even numbers from 2 to 20 and count how many there are.",
  },
  {
    id: "functions",
    title: "Functions",
    content:
      "Functions package logic. Use parameters, return values, and default arguments.",
    example: `def area(width, height=1):\n    return width * height\n\nprint(area(5))\nprint(area(5, 3))\n`,
    task:
      "Write a function that returns the average of a list. Handle an empty list.",
  },
  {
    id: "comprehensions",
    title: "Comprehensions",
    content:
      "Comprehensions are compact ways to build lists, dicts, and sets.",
    example: `squares = [n * n for n in range(1, 6)]\nprint(squares)\n`,
    task:
      "Create a list of words longer than 4 letters from a given list.",
  },
  {
    id: "modules",
    title: "Modules and Packages",
    content:
      "Import standard libraries to reuse code. Use aliases to keep names short.",
    example: `import math as m\nprint(m.sqrt(25))\n`,
    task:
      "Import random and generate a random integer between 1 and 100.",
  },
  {
    id: "file-io",
    title: "File I/O",
    content:
      "Read and write files with open(). Use with to handle closing safely.",
    example: `with open("notes.txt", "w") as f:\n    f.write("Hello file")\n`,
    task:
      "Write two lines to a file called output.txt using a with block.",
  },
  {
    id: "exceptions",
    title: "Exceptions",
    content:
      "Use try/except to handle errors. Catch specific exceptions when possible.",
    example: `try:\n    num = int("abc")\nexcept ValueError:\n    print("Invalid number")\n`,
    task:
      "Ask for input, convert to int, and handle invalid input gracefully.",
  },
  {
    id: "oop",
    title: "Classes and Objects",
    content:
      "Classes define blueprints. Use __init__ for setup and methods for behavior.",
    example: `class Counter:\n    def __init__(self):\n        self.count = 0\n    def inc(self):\n        self.count += 1\n\nc = Counter()\nc.inc()\nprint(c.count)\n`,
    task:
      "Create a class Book with title and author, and a method to describe it.",
  },
];
