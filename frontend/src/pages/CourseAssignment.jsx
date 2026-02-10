import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Navbar from "../components/Navbar";
import ConsolePanel from "../components/ConsolePanel";
import { apiRequest } from "../lib/api";
import { applyVscodeTheme, editorOptions } from "../lib/monaco";

export default function CourseAssignment() {
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [progress, setProgress] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState("");
  const [message, setMessage] = useState("");

  const submissions = useMemo(
    () => progress?.assignmentSubmissions || [],
    [progress]
  );

  const loadCourse = async () => {
    try {
      const data = await apiRequest(`/api/courses/${id}`);
      setCourse(data);
      const found = data.assignments.find((a) => a.id === assignmentId);
      if (!found) return navigate(`/courses/${id}`);
      setAssignment(found);
      setEditorValue(found.starter || "");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadProgress = async () => {
    try {
      const data = await apiRequest(`/api/courses/${id}/progress`);
      setProgress(data);
    } catch (err) {
      setProgress(null);
    }
  };

  const enroll = async () => {
    setMessage("");
    try {
      const data = await apiRequest(`/api/courses/${id}/enroll`, { method: "POST" });
      setProgress(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadCourse();
    loadProgress();
  }, [id, assignmentId]);

  const runCode = async () => {
    try {
      const res = await apiRequest("/api/run", {
        method: "POST",
        body: JSON.stringify({ code: editorValue, input: stdin }),
      });
      setOutput(res.output);
    } catch (err) {
      setOutput(err.message);
    }
  };

  const submit = async () => {
    setMessage("");
    try {
      const data = await apiRequest(`/api/courses/${id}/assignment/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({ code: editorValue }),
      });
      setProgress(data);
      setMessage("Submitted");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const lastSubmission = submissions.find((s) => s.assignmentId === assignmentId);

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-400">
          Loading assignment...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="text-xs uppercase tracking-widest text-emerald-300">
            Assignment {assignment.order}
          </div>
          <div className="mt-2 text-2xl font-semibold">{assignment.title}</div>
          <p className="mt-3 text-sm text-slate-300">{assignment.prompt}</p>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-slate-400">Starter</div>
            <pre className="mt-2 rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
              {assignment.starter}
            </pre>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setEditorValue(assignment.starter || "")}
              className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-600"
            >
              Reset Starter
            </button>
            <button
              onClick={submit}
              className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Submit Assignment
            </button>
            {!progress && (
              <button
                onClick={enroll}
                className="rounded-md border border-emerald-500/50 px-3 py-2 text-xs text-emerald-200 hover:border-emerald-400"
              >
                Enroll
              </button>
            )}
          </div>
          {lastSubmission && (
            <div className="mt-3 text-xs text-slate-400">
              Last submitted: {new Date(lastSubmission.submittedAt).toLocaleString()}
            </div>
          )}
          {message && <div className="mt-3 text-sm text-emerald-300">{message}</div>}
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            <div>Assignment Sandbox</div>
            <button
              onClick={runCode}
              className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Run
            </button>
          </div>
          <div className="h-96">
            <Editor
              height="100%"
              language="python"
              theme="vscode-dark-plus"
              value={editorValue}
              onChange={(value) => setEditorValue(value ?? "")}
              beforeMount={applyVscodeTheme}
              options={editorOptions}
            />
          </div>
          <ConsolePanel output={output} stdin={stdin} onStdinChange={setStdin} />
        </div>
      </div>
    </div>
  );
}
