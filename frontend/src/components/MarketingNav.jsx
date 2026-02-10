import { Link } from "react-router-dom";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/40" />
          <div>
            <div className="text-lg font-semibold text-white">CodeLearn</div>
            <div className="text-xs text-slate-400">Launch faster. Learn deeper.</div>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="text-slate-300 hover:text-white" to="/topics">
            Topics
          </Link>
          <a className="text-slate-300 hover:text-white" href="#features">
            Features
          </a>
          <a className="text-slate-300 hover:text-white" href="#courses">
            Courses
          </a>
          <a className="text-slate-300 hover:text-white" href="#pricing">
            Pricing
          </a>
          <Link
            to="/login"
            className="rounded-md border border-slate-800 px-3 py-2 text-slate-200 hover:border-slate-700 hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md bg-emerald-500 px-3 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Start Coding
          </Link>
        </nav>
      </div>
    </header>
  );
}
