export const problems = [
  {
    id: "sum-array",
    title: "Sum of Array",
    difficulty: "Easy",
    prompt: "Write a function that returns the sum of all numbers in a list.",
    starter: `def sum_array(nums):\n    # TODO: implement\n    return 0\n\nprint(sum_array([1,2,3,4]))\n`,
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    prompt:
      "Print numbers from 1 to 30. For multiples of 3 print Fizz, multiples of 5 print Buzz, multiples of both print FizzBuzz.",
    starter: `for n in range(1, 31):\n    # TODO: implement\n    pass\n`,
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Medium",
    prompt:
      "Given a list of integers and a target, return indices of two numbers that add to the target.",
    starter: `def two_sum(nums, target):\n    # TODO: implement\n    return []\n\nprint(two_sum([2,7,11,15], 9))\n`,
  },
];
