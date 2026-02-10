import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../lib/api";

export default function ChallengeDetail() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest(`/api/challenges/${id}`);
        setChallenge(data);
        const problemList = await Promise.all(
          (data.problemIds || []).map((problemId) => apiRequest(`/api/problems/${problemId}`))
        );
        setProblems(problemList);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-400">
          Loading challenge...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-xs uppercase tracking-widest text-emerald-300">Challenge</div>
        <div className="mt-2 text-3xl font-semibold">{challenge.title}</div>
        <div className="mt-2 text-sm text-slate-300">{challenge.description}</div>
        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {problems.map((problem, index) => (
            <div
              key={problem._id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="text-xs text-slate-400">Problem {index + 1}</div>
              <div className="mt-1 text-sm font-semibold text-white">{problem.title}</div>
              <div className="mt-1 text-xs text-slate-500">
                {problem.difficulty} • {problem.complexity}
              </div>
              <Link
                to={`/practice/${problem.topicId}/${problem._id}`}
                className="mt-3 inline-flex rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Solve
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
