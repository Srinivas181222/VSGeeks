import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Navbar from "../components/Navbar";
import ConsolePanel from "../components/ConsolePanel";
import { apiRequest } from "../lib/api";
import { applyVscodeTheme, editorOptions } from "../lib/monaco";

export default function ProblemSolver() {
  const { topicId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await apiRequest(`/api/problems/${problemId}`);
      setProblem(data);
      setCode(data.starter || "");
    };
    load();
  }, [problemId]);

  const runCode = async () => {
    setOutput("Running...");
    try {
      const res = await apiRequest("/api/run", {
        method: "POST",
        body: JSON.stringify({ code, input: stdin }),
      });
      setOutput(res.output);
    } catch (err) {
      setOutput(err.message);
    }
  };

  const submitCode = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiRequest("/api/judge", {
        method: "POST",
        body: JSON.stringify({ problemId, code }),
      });
      setResult(res);
      setOutput(res.status);
    } catch (err) {
      setOutput(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-400">
          Loading problem...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-emerald-300">
                {problem.difficulty}
              </div>
              <div className="mt-2 text-2xl font-semibold">{problem.title}</div>
            </div>
            <Link
              to={`/practice/${topicId}`}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to list
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-300">{problem.prompt}</p>
          <div className="mt-4 text-xs text-slate-500">
            Expected Complexity: {problem.complexity}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setShowSolution((prev) => !prev)}
              className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-600"
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </button>
          </div>

          {showSolution && (
            <pre className="mt-4 rounded-lg bg-slate-950 p-4 text-xs text-emerald-200">
              {problem.solution}
            </pre>
          )}

          {result && (
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
              <div className="text-sm font-semibold text-white">Submission Result</div>
              <div className="mt-2 text-xs text-slate-400">
                Status: <span className="text-emerald-300">{result.status}</span>
              </div>
              <div className="text-xs text-slate-400">
                Runtime: {result.runtimeMs} ms • Passed {result.passed}/{result.total}
              </div>
              {result.details?.length > 0 && (
                <div className="mt-3 text-xs text-slate-500">
                  Showing first failed cases.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
            <div>main.py</div>
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-600"
              >
                Run
              </button>
              <button
                onClick={submitCode}
                disabled={loading}
                className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
          <div className="h-[480px]">
            <Editor
              height="100%"
              language="python"
              theme="vscode-dark-plus"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              beforeMount={applyVscodeTheme}
              options={editorOptions}
            />
          </div>
          <ConsolePanel output={output} stdin={stdin} onStdinChange={setStdin} />
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
            <div>Python • UTF-8 • LF</div>
            <div>LeetCode-style judge enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
