import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/topics";
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-white">Welcome to CodeLearn</div>
          <div className="text-sm text-slate-400">Login to your coding studio</div>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Login
          </button>

          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <Link to="/signup/student" className="hover:text-white">
              Create student account
            </Link>
            <Link to="/signup/teacher" className="hover:text-white">
              Create teacher account
            </Link>
            <div className="text-xs text-slate-500">Email verification is disabled.</div>
          </div>
          {message && <div className="text-sm text-rose-400">{message}</div>}
        </div>
      </div>
    </div>
  );
}
