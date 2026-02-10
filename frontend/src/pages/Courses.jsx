import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import MarketingFooter from "../components/MarketingFooter";
import { apiRequest } from "../lib/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/courses");
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const seedCourses = async () => {
    setError("");
    try {
      await apiRequest("/api/courses/seed", { method: "POST" });
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold">Course Catalog</div>
            <div className="text-sm text-slate-400">
              Structured, project-driven learning paths.
            </div>
          </div>
          <button
            onClick={seedCourses}
            className="rounded-md border border-slate-800 px-3 py-2 text-xs text-slate-200 hover:border-slate-700"
          >
            Seed Sample Courses
          </button>
        </div>

        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {loading && <div className="text-sm text-slate-400">Loading courses...</div>}
          {!loading &&
            courses.map((course) => (
              <div
                key={course._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div className="text-xs uppercase tracking-widest text-emerald-300">
                  {course.level}
                </div>
                <div className="mt-2 text-xl font-semibold">{course.title}</div>
                <div className="mt-2 text-sm text-slate-300">{course.description}</div>
                <div className="mt-4 text-xs text-slate-500">
                  {course.lessons?.length || 0} lessons •{" "}
                  {course.assignments?.length || 0} assignments • {course.duration}
                </div>
                <Link
                  to={`/courses/${course._id}`}
                  className="mt-5 inline-flex rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  View Course
                </Link>
              </div>
            ))}
          {!loading && courses.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
              No courses yet. Use “Seed Sample Courses” to add examples.
            </div>
          )}
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
