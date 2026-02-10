import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("");
      setError("Verification token missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await apiRequest(`/api/auth/verify?token=${token}`);
        setStatus(res.message || "Verified.");
      } catch (err) {
        setStatus("");
        setError(err.message);
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
        <div className="text-2xl font-semibold">Email Verification</div>
        <div className="mt-3 text-sm text-slate-300">{status}</div>
        {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}
        <Link to="/login" className="mt-6 inline-flex text-sm text-emerald-300">
          Back to login
        </Link>
      </div>
    </div>
  );
}
