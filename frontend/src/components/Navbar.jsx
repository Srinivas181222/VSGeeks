import { NavLink, useNavigate } from "react-router-dom";
import { getUser, isTeacher } from "../lib/auth";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
  }`;

export default function Navbar({ onToggleTutorial = () => {}, showTutorialToggle = false }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = getUser();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-emerald-500/20 ring-1 ring-emerald-500/40" />
        <div>
          <div className="text-lg font-semibold text-white">CodeLearn</div>
          <div className="text-xs text-slate-400">Studio</div>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/topics" className={navLinkClass}>
          Topics
        </NavLink>
        <NavLink to="/projects" className={navLinkClass}>
          Projects
        </NavLink>
        <NavLink to="/practice" className={navLinkClass}>
          Questions
        </NavLink>
        <NavLink to="/practice-workspace" className={navLinkClass}>
          Practice
        </NavLink>
        <NavLink to="/courses" className={navLinkClass}>
          Courses
        </NavLink>
        <NavLink to="/challenges" className={navLinkClass}>
          Challenges
        </NavLink>
        <NavLink to="/leaderboard" className={navLinkClass}>
          Leaderboard
        </NavLink>
        {isTeacher() && (
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        )}
        {showTutorialToggle && (
          <button
            onClick={onToggleTutorial}
            className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Toggle Tutorial
          </button>
        )}
        {user?.displayName && (
          <div className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
            {user.displayName}
          </div>
        )}
        <button
          onClick={logout}
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
