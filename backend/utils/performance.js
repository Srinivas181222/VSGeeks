const COMPLEXITY_ORDER = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
];

const normalizeComplexity = (value) => {
  if (!value || typeof value !== "string") return "O(n)";
  const compact = value.replace(/\s+/g, "").toLowerCase();
  if (compact.includes("o(1)")) return "O(1)";
  if (compact.includes("o(logn)") || compact.includes("o(log(n))")) return "O(log n)";
  if (compact.includes("o(nlogn)") || compact.includes("o(nlog(n))")) return "O(n log n)";
  if (compact.includes("o(n^2)") || compact.includes("o(n2)")) return "O(n^2)";
  if (compact.includes("o(n^3)") || compact.includes("o(n3)")) return "O(n^3)";
  if (compact.includes("o(2^n)") || compact.includes("o(2n)")) return "O(2^n)";
  if (compact.includes("o(n)")) return "O(n)";
  return "O(n)";
};

const complexityToScore = (value) => {
  const normalized = normalizeComplexity(value);
  const index = COMPLEXITY_ORDER.indexOf(normalized);
  return index >= 0 ? index + 1 : 3;
};

const getIndentLevel = (line) => {
  const match = line.match(/^(\s*)/);
  if (!match) return 0;
  return Math.floor(match[1].replace(/\t/g, "    ").length / 4);
};

const estimateComplexityFromCode = (code, entryName = "") => {
  if (typeof code !== "string" || !code.trim()) {
    return { label: "O(1)", score: complexityToScore("O(1)") };
  }

  const lines = code.split("\n");
  const loopStack = [];
  let maxLoopDepth = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const indent = getIndentLevel(rawLine);
    while (loopStack.length && loopStack[loopStack.length - 1] >= indent) {
      loopStack.pop();
    }

    if (/^(for|while)\b/.test(line)) {
      loopStack.push(indent);
      if (loopStack.length > maxLoopDepth) maxLoopDepth = loopStack.length;
    }
  }

  const hasSort = /(?:\.sort\(|\bsorted\()/.test(code);
  const recursionPattern = entryName
    ? new RegExp(`\\b${entryName}\\s*\\(`)
    : null;

  let hasRecursion = false;
  if (recursionPattern) {
    const body = lines.filter((line) => !line.trim().startsWith("def "));
    hasRecursion = body.some((line) => recursionPattern.test(line));
  }

  let label = "O(1)";
  if (hasRecursion && maxLoopDepth >= 1) {
    label = "O(2^n)";
  } else if (maxLoopDepth >= 3) {
    label = "O(n^3)";
  } else if (maxLoopDepth === 2) {
    label = "O(n^2)";
  } else if (maxLoopDepth === 1 && hasSort) {
    label = "O(n log n)";
  } else if (hasSort) {
    label = "O(n log n)";
  } else if (maxLoopDepth === 1) {
    label = "O(n)";
  } else if (hasRecursion) {
    label = "O(n)";
  }

  return { label, score: complexityToScore(label) };
};

const percentileLowerBetter = (values, value) => {
  const normalized = values
    .filter((v) => Number.isFinite(v))
    .slice()
    .sort((a, b) => a - b);

  if (!normalized.length || !Number.isFinite(value)) return 0;

  const idx = normalized.findIndex((v) => v >= value);
  const rank = idx >= 0 ? idx + 1 : normalized.length;
  const percentile = ((normalized.length - rank + 1) / normalized.length) * 100;
  return Math.max(1, Math.min(100, Math.round(percentile)));
};

module.exports = {
  normalizeComplexity,
  complexityToScore,
  estimateComplexityFromCode,
  percentileLowerBetter,
};
