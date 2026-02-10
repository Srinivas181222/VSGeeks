export const tutorials = [
  {
    id: "python-basics",
    title: "Python Basics",
    content:
      "Learn how to declare variables, use loops, and write functions. Try editing the example and run it.",
    example: `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("CodeLearn"))\n`,
    task: "Modify the function to greet with your name and add a second print statement.",
  },
  {
    id: "lists-dicts",
    title: "Lists and Dictionaries",
    content:
      "Lists store ordered items, dictionaries store key/value pairs. Use them to model data.",
    example: `scores = {"Ada": 96, "Linus": 92}\n\nfor name, score in scores.items():\n    print(name, score)\n`,
    task: "Add a new score and compute the average.",
  },
];
