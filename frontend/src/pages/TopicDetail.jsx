import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../lib/api";

export default function TopicDetail() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const data = await apiRequest(`/api/topics/${id}`);
        setTopic(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  if (!topic) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-400">
          Loading topic...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-xs uppercase tracking-widest text-emerald-300">
          Topic {topic.order}
        </div>
        <div className="mt-2 text-3xl font-semibold">{topic.title}</div>
        <div className="mt-2 text-sm text-slate-300">{topic.description}</div>
        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="text-sm uppercase tracking-widest text-slate-400">Lessons</div>
          <div className="mt-4 space-y-3">
            {topic.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
              >
                <div className="font-semibold text-white">{lesson.title}</div>
                <div className="text-xs text-slate-500">Lesson {lesson.order}</div>
                <div className="mt-2 text-sm text-slate-400">{lesson.content}</div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to={`/practice/${topic._id}`}
          className="mt-6 inline-flex rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Practice 50 Problems
        </Link>
      </div>
    </div>
  );
}
