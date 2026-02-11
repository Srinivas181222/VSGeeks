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
import json, time, traceback

${code}

def __run():
    tests = json.loads(${JSON.stringify(tests)})
    passed = 0
    total = len(tests)
    details = []
    start = time.perf_counter()
    for t in tests:
        inp = t.get("input")
        expected = t.get("output")
        try:
            if "${entryType}" == "function":
                func = globals().get("${entryName}")
                if func is None:
                    raise Exception("Function ${entryName} not found")
                args = inp if isinstance(inp, list) else [inp]
                output = func(*args)
            else:
                cls = globals().get("${entryName}")
                if cls is None:
                    raise Exception("Class ${entryName} not found")
                init_args = inp.get("init", [])
                calls = inp.get("calls", [])
                obj = cls(*init_args)
                outputs = []
                for call in calls:
                    method = getattr(obj, call[0])
                    args = call[1] if len(call) > 1 else []
                    outputs.append(method(*args))
                output = outputs
            if output == expected:
                passed += 1
            else:
                details.append({"input": inp, "expected": expected, "output": output})
        except Exception as e:
            details.append({"input": inp, "error": str(e)})
    runtime_ms = int((time.perf_counter() - start) * 1000)
    result = {"passed": passed, "total": total, "runtimeMs": runtime_ms, "details": details}
    print("__RESULT__" + json.dumps(result))

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
      const status = payload.passed === payload.total ? "Accepted" : "Wrong Answer";
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
