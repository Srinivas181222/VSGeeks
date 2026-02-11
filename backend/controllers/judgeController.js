const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Problem = require("../models/Problem");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const User = require("../models/User");
const {
  complexityToScore,
  estimateComplexityFromCode,
  normalizeComplexity,
  percentileLowerBetter,
} = require("../utils/performance");

const buildHarness = (problem, code) => {
  const tests = JSON.stringify(problem.testCases || []);
  const entryType = problem.entryType || "function";
  const entryName = problem.entryName;

  return `
import json, time, inspect

${code}

def __is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)

def __values_match(actual, expected):
    if __is_number(actual) and __is_number(expected):
        return abs(float(actual) - float(expected)) <= 1e-6

    if isinstance(actual, (list, tuple)) and isinstance(expected, (list, tuple)):
        if len(actual) != len(expected):
            return False
        return all(__values_match(a, b) for a, b in zip(actual, expected))

    if isinstance(actual, dict) and isinstance(expected, dict):
        if set(actual.keys()) != set(expected.keys()):
            return False
        return all(__values_match(actual[k], expected[k]) for k in actual.keys())

    return actual == expected

def __call_args(func, inp):
    if not isinstance(inp, list):
        return [inp]

    # LeetCode-style: if input list matches callable arity, spread args; otherwise pass as one arg.
    try:
        sig = inspect.signature(func)
        params = list(sig.parameters.values())
        positional = [
            p for p in params
            if p.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
        ]
        has_varargs = any(p.kind == inspect.Parameter.VAR_POSITIONAL for p in params)
        required = len([p for p in positional if p.default is inspect._empty])
        max_args = 10**9 if has_varargs else len(positional)
        if required <= len(inp) <= max_args:
            return inp
    except Exception:
        pass

    return [inp]

def __resolve_function(entry_name):
    direct = globals().get(entry_name)
    if callable(direct):
        return direct, entry_name

    solution_cls = globals().get("Solution")
    if inspect.isclass(solution_cls):
        try:
            inst = solution_cls()
            method = getattr(inst, entry_name, None)
            if callable(method):
                return method, "Solution." + entry_name

            public_methods = [
                n for n, m in inspect.getmembers(inst, predicate=callable)
                if not n.startswith("_")
            ]
            if len(public_methods) == 1:
                chosen = public_methods[0]
                return getattr(inst, chosen), "Solution." + chosen
        except Exception:
            pass

    user_functions = []
    for name, obj in globals().items():
        if name.startswith("_"):
            continue
        if name in {"json", "time", "inspect"}:
            continue
        if inspect.isfunction(obj):
            user_functions.append((name, obj))

    if len(user_functions) == 1:
        return user_functions[0][1], user_functions[0][0]

    return None, entry_name

def __resolve_class(entry_name):
    direct = globals().get(entry_name)
    if inspect.isclass(direct):
        return direct, entry_name

    solution_cls = globals().get("Solution")
    if inspect.isclass(solution_cls):
        return solution_cls, "Solution"

    user_classes = []
    for name, obj in globals().items():
        if name.startswith("_"):
            continue
        if name in {"json", "time", "inspect"}:
            continue
        if inspect.isclass(obj):
            user_classes.append((name, obj))

    if len(user_classes) == 1:
        return user_classes[0][1], user_classes[0][0]

    return None, entry_name

def __run():
    tests = json.loads(${JSON.stringify(tests)})
    passed = 0
    total = len(tests)
    details = []
    had_runtime_error = False
    resolver_used = ""
    start = time.perf_counter()
    for t in tests:
        inp = t.get("input")
        expected = t.get("output")
        try:
            if "${entryType}" == "function":
                func, resolved_name = __resolve_function("${entryName}")
                if func is None:
                    raise Exception("Function ${entryName} not found")
                resolver_used = resolved_name
                args = __call_args(func, inp)
                output = func(*args)
            else:
                cls, resolved_name = __resolve_class("${entryName}")
                if cls is None:
                    raise Exception("Class ${entryName} not found")
                resolver_used = resolved_name
                init_args = inp.get("init", [])
                calls = inp.get("calls", [])
                obj = cls(*init_args)
                outputs = []
                for call in calls:
                    method = getattr(obj, call[0])
                    args = call[1] if len(call) > 1 else []
                    outputs.append(method(*args))
                output = outputs
            if __values_match(output, expected):
                passed += 1
            else:
                details.append({"input": inp, "expected": expected, "output": output})
        except Exception as e:
            had_runtime_error = True
            details.append({"input": inp, "expected": expected, "error": str(e)})
    runtime_ms = int((time.perf_counter() - start) * 1000)
    result = {
        "passed": passed,
        "total": total,
        "runtimeMs": runtime_ms,
        "details": details,
        "hadRuntimeError": had_runtime_error,
        "resolverUsed": resolver_used,
    }
    print("__RESULT__" + json.dumps(result, default=str))

__run()
`;
};

const judgeProblem = async (req, res) => {
  const { problemId, code, challengeId } = req.body;
  if (!problemId || !code) {
    return res.status(400).json({ error: "problemId and code required" });
  }

  const problem = await Problem.findById(problemId);
  if (!problem) return res.status(404).json({ error: "Problem not found" });

  const user = await User.findById(req.user.id);
  const teacherId = user?.role === "student" ? user.teacherId : user?._id;
  let challenge = null;
  if (challengeId) {
    challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.active) {
      return res.status(404).json({ error: "Challenge not found or inactive" });
    }
    const problemIncluded = (challenge.problemIds || []).some(
      (id) => id.toString() === problem._id.toString()
    );
    if (!problemIncluded) {
      return res.status(400).json({ error: "Problem is not part of this challenge" });
    }
  }

  const tempFile = path.join(
    os.tmpdir(),
    `codelearn-judge-${Date.now()}-${Math.random().toString(16).slice(2)}.py`
  );

  const script = buildHarness(problem, code);
  fs.writeFileSync(tempFile, script, "utf8");

  execFile(
    "python",
    [tempFile],
    { timeout: 8000, maxBuffer: 1024 * 1024 },
    async (error, stdout, stderr) => {
      fs.unlink(tempFile, () => {});

      if (error && !stdout) {
        return res.json({ status: "Runtime Error", output: stderr || error.message });
      }

      const lines = stdout.trim().split("\n");
      const resultLine = lines.reverse().find((line) => line.startsWith("__RESULT__"));
      if (!resultLine) {
        return res.json({ status: "Runtime Error", output: stderr || "No result" });
      }

      const payload = JSON.parse(resultLine.replace("__RESULT__", ""));
      let status = "Wrong Answer";
      if (payload.passed === payload.total) {
        status = "Accepted";
      } else if (payload.hadRuntimeError && payload.passed === 0) {
        status = "Runtime Error";
      }
      const runtimeMs = payload.runtimeMs || 0;
      const estimated = estimateComplexityFromCode(code, problem.entryName);
      const expectedComplexity = normalizeComplexity(problem.complexity);
      const expectedComplexityScore = complexityToScore(expectedComplexity);

      const submission = await Submission.create({
        userId: req.user.id,
        teacherId,
        problemId: problem._id,
        challengeId: challengeId || null,
        status,
        runtimeMs,
        passedCount: payload.passed,
        totalCount: payload.total,
        estimatedComplexity: estimated.label,
        complexityScore: estimated.score,
        expectedComplexity,
        expectedComplexityScore,
        sourceLength: code.length,
      });

      let runtimePercentile = 0;
      let complexityPercentile = 0;
      if (status === "Accepted") {
        const peerFilter = {
          problemId: problem._id,
          status: "Accepted",
        };

        if (teacherId) peerFilter.teacherId = teacherId;
        if (challengeId) peerFilter.challengeId = challengeId;

        const peers = await Submission.find(peerFilter).select("runtimeMs complexityScore");
        runtimePercentile = percentileLowerBetter(
          peers.map((s) => s.runtimeMs),
          runtimeMs
        );
        complexityPercentile = percentileLowerBetter(
          peers.map((s) => s.complexityScore),
          estimated.score
        );
      }

      const challengeAccepted = !challengeId || status === "Accepted";

      return res.json({
        status,
        runtimeMs,
        passed: payload.passed,
        total: payload.total,
        complexity: {
          expected: expectedComplexity,
          estimated: estimated.label,
          score: estimated.score,
          percentile: complexityPercentile,
        },
        runtimePercentile,
        submissionId: submission._id,
        details: (payload.details || []).slice(0, 3),
        resolverUsed: payload.resolverUsed || problem.entryName,
        challengeAccepted,
        challengeMessage:
          challengeId && !challengeAccepted
            ? "Challenge submission is counted only when all test cases pass."
            : "",
      });
    }
  );
};

module.exports = { judgeProblem };
