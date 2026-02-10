<<<<<<< HEAD
# CodeLearn Platform

A production-ready coding education platform with multi-file projects, VSCode-style editor, tutorials, and practice problems.

## Requirements
- Node.js 18+
- MongoDB (Atlas or local)
- Python 3 available on the backend host

## Setup
1. Backend
```
cd backend
copy .env.example .env
npm install
npm run dev
```

2. Frontend
```
cd frontend
npm install
npm run dev
```

3. Environment Variables
- `backend/.env`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `PORT`
  - `CORS_ORIGIN`
  - `TEACHER_CODE`
  - `APP_BASE_URL`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
- `frontend/.env`
  - `VITE_API_URL=http://localhost:5000`

## Project Structure
- `backend/`
  - `controllers/` auth, projects, files, run
  - `models/` User, Project
  - `routes/` API endpoints
  - `middleware/` JWT auth
  - `utils/` file-tree helpers
- `frontend/`
  - `pages/` Login, Dashboard, Editor, Practice
  - `pages/` Landing, Courses, CourseDetail, CourseLesson, CourseAssignment
  - `components/` Navbar, Sidebar, FileTree, Tabs, Console, Modal, Tutorial panel
  - `data/` tutorials and practice problems
  - `lib/` API client + tree helpers

## Deployment Guide
1. Backend
- Set env vars on your hosting platform (Render, Railway, AWS, etc.).
- Ensure Python 3 is installed for code execution.
- Run with `node server.js` (or `npm start`).

2. Frontend
- Build with `npm run build` in `frontend/`.
- Serve static files with Vite preview or any static hosting (Vercel, Netlify, S3).
- Set `VITE_API_URL` to the backend URL.

## Email Verification
- Signup now requires a real email address and verification.
- Configure SMTP settings in `backend/.env` for production.
- If SMTP is not configured, the backend logs a verification link in the server console.

## Teacher Code
- Default teacher code: `CODELEARN_TEACHER` (set via `TEACHER_CODE` in `backend/.env`).

## Future-Ready Architecture
The backend and frontend are modular to support multi-language execution, docker-based sandboxes, collaboration, AI coding help, and monetization layers.

## Course System
- Seed sample courses with `POST /api/courses/seed` (one-time).
- Courses include lessons and assignments with progress tracked per user enrollment.
=======
# VSGeeks
GeeksforGeeks with VSCode mashup
>>>>>>> a58b1ea17ad1b06f4b11a2c8456a175804a9b21d
