import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../lib/api";

export default function TeacherAdmin() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest("/api/teacher/students");
        setStudents(data.students || []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-2xl font-semibold">Teacher Admin</div>
        <div className="text-sm text-slate-400">
          Track student progress, submissions, and activity.
        </div>
        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Solved</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Last Submission</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <div className="text-white">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </td>
                  <td className="px-4 py-3">{student.solvedCount}</td>
                  <td className="px-4 py-3">{student.submissions}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {student.lastSubmission
                      ? new Date(student.lastSubmission).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
