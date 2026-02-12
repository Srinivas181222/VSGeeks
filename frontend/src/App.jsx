import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditorPage from "./pages/EditorPage";
import Practice from "./pages/Practice";
import Landing from "./pages/Landing";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLesson from "./pages/CourseLesson";
import CourseAssignment from "./pages/CourseAssignment";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import PracticeList from "./pages/PracticeList";
import ProblemSolver from "./pages/ProblemSolver";
import PracticeStudio from "./pages/PracticeStudio";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Leaderboard from "./pages/Leaderboard";
import TeacherAdmin from "./pages/TeacherAdmin";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import { isTeacher } from "./lib/auth";
import VerifyEmail from "./pages/VerifyEmail";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RequireTeacher = ({ children }) => {
  if (!isTeacher()) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/topics" element={<Topics />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <EditorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/practice"
          element={
            <RequireAuth>
              <Practice />
            </RequireAuth>
          }
        />
        <Route
          path="/practice-workspace"
          element={
            <RequireAuth>
              <PracticeStudio />
            </RequireAuth>
          }
        />
        <Route
          path="/topics/:id"
          element={
            <RequireAuth>
              <TopicDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/practice/:topicId"
          element={
            <RequireAuth>
              <PracticeList />
            </RequireAuth>
          }
        />
        <Route
          path="/practice/:topicId/:problemId"
          element={
            <RequireAuth>
              <ProblemSolver />
            </RequireAuth>
          }
        />
        <Route
          path="/challenges"
          element={
            <RequireAuth>
              <Challenges />
            </RequireAuth>
          }
        />
        <Route
          path="/challenges/:id"
          element={
            <RequireAuth>
              <ChallengeDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireTeacher>
                <TeacherAdmin />
              </RequireTeacher>
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <RequireAuth>
              <CourseDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id/lessons/:lessonId"
          element={
            <RequireAuth>
              <CourseLesson />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id/assignments/:assignmentId"
          element={
            <RequireAuth>
              <CourseAssignment />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
