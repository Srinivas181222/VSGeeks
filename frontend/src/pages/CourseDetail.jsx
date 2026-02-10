import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../lib/api";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCourse = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/courses/${id}`);
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    setError("");
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-400">
          Loading course...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-rose-400">{error}</div>
      </div>
    );
  }

  const completedLessons = new Set(progress?.completedLessons || []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-300">
              {course.level}
            </div>
            <div className="mt-2 text-3xl font-semibold">{course.title}</div>
            <div className="mt-2 text-sm text-slate-300">{course.description}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Duration</div>
            <div className="text-sm">{course.duration}</div>
            {!progress && (
              <button
                onClick={enroll}
                className="mt-4 rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Enroll
              </button>
            )}
            {progress && (
              <div className="mt-4 text-xs text-emerald-300">Enrolled</div>
            )}
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="text-sm uppercase tracking-widest text-slate-400">Lessons</div>
            <div className="mt-4 space-y-3">
              {course.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-semibold text-white">{lesson.title}</div>
                    <div className="text-xs text-slate-400">Lesson {lesson.order}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {completedLessons.has(lesson.id) && (
                      <div className="text-xs text-emerald-300">Completed</div>
                    )}
                    <Link
                      to={`/courses/${course._id}/lessons/${lesson.id}`}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-600"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="text-sm uppercase tracking-widest text-slate-400">
              Assignments
            </div>
            <div className="mt-4 space-y-3">
              {course.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm"
                >
                  <div className="font-semibold text-white">{assignment.title}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Assignment {assignment.order}
                  </div>
                  <Link
                    to={`/courses/${course._id}/assignments/${assignment.id}`}
                    className="mt-3 inline-flex rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-600"
                  >
                    Open Assignment
                  </Link>
                </div>
              ))}
              {course.assignments.length === 0 && (
                <div className="text-sm text-slate-400">No assignments yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
