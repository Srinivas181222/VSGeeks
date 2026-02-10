import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function TeacherSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    try {
      const data = await apiRequest("/api/auth/signup-teacher", {
        method: "POST",
        body: JSON.stringify({ email, password, teacherCode, displayName }),
      });
      setMessage(data.message || "Check your email to verify your account.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-white">Teacher Signup</div>
          <div className="text-sm text-slate-400">
            Use the admin code to create a teacher account.
          </div>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            placeholder="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            placeholder="Teacher code"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create teacher account
          </button>

          <Link to="/login" className="text-sm text-slate-400 hover:text-white">
            Already have an account? Login
          </Link>
          {message && <div className="text-sm text-emerald-300">{message}</div>}
        </div>
      </div>
    </div>
  );
}
