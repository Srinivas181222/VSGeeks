import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Navbar from "../components/Navbar";
import ConsolePanel from "../components/ConsolePanel";
import { apiRequest } from "../lib/api";

export default function CourseLesson() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const completedLessons = useMemo(
    () => new Set(progress?.completedLessons || []),
    [progress]
  );

  const loadCourse = async () => {
    setError("");
    try {
      const data = await apiRequest(`/api/courses/${id}`);
      setCourse(data);
      const found = data.lessons.find((l) => l.id === lessonId);
      if (!found) return navigate(`/courses/${id}`);
      setLesson(found);
      setEditorValue(found.example || "");
    } catch (err) {
      setError(err.message);
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
    try {
      const data = await apiRequest(`/api/courses/${id}/enroll`, { method: "POST" });
      setProgress(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCourse();
    loadProgress();
  }, [id, lessonId]);

  const runCode = async () => {
    try {
      const res = await apiRequest("/api/run", {
        method: "POST",
        body: JSON.stringify({ code: editorValue }),
      });
      setOutput(res.output);
    } catch (err) {
      setOutput(err.message);
    }
  };

  const markComplete = async () => {
    try {
      const data = await apiRequest(`/api/courses/${id}/progress`, {
        method: "PUT",
        body: JSON.stringify({ lessonId, completed: true }),
      });
      setProgress(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-400">
          Loading lesson...
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
            Lesson {lesson.order}
          </div>
          <div className="mt-2 text-2xl font-semibold">{lesson.title}</div>
          <p className="mt-3 text-sm text-slate-300">{lesson.content}</p>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-slate-400">Example</div>
            <pre className="mt-2 rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
              {lesson.example}
            </pre>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setEditorValue(lesson.example || "")}
              className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-600"
            >
              Load Example
            </button>
            <button
              onClick={markComplete}
              className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Mark Complete
            </button>
            {!progress && (
              <button
                onClick={enroll}
                className="rounded-md border border-emerald-500/50 px-3 py-2 text-xs text-emerald-200 hover:border-emerald-400"
              >
                Enroll
              </button>
            )}
            {completedLessons.has(lessonId) && (
              <div className="text-xs text-emerald-300">Completed</div>
            )}
          </div>
          {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            <div>Lesson Sandbox</div>
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
              theme="vs-dark"
              value={editorValue}
              onChange={(value) => setEditorValue(value ?? "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                fontFamily: "JetBrains Mono, monospace",
              }}
            />
          </div>
          <ConsolePanel output={output} />
        </div>
      </div>
    </div>
  );
}
