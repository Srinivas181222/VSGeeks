const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const read = (relativePath) =>
  fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

const checks = [
  {
    id: "courses-seed-auth",
    description: "Courses seed endpoint requires auth middleware",
    pass: () => /router\.post\("\/seed",\s*auth,\s*seedCourses\)/.test(read("routes/courses.js")),
  },
  {
    id: "no-jwt-fallback-secret",
    description: "No weak JWT fallback secret remains",
    pass: () => !/dev_secret/.test(read("controllers/authController.js") + read("middleware/auth.js")),
  },
  {
    id: "no-teacher-code-fallback",
    description: "No weak teacher-code fallback remains",
    pass: () => !/CODELEARN_TEACHER/.test(read("controllers/authController.js")),
  },
  {
    id: "problem-api-no-solution-tests",
    description: "Public problem APIs exclude solution and hidden test cases",
    pass: () => {
      const source = read("controllers/learningController.js");
      const occurrences = source.match(/select\("-solution -testCases"\)/g) || [];
      return occurrences.length >= 2;
    },
  },
  {
    id: "force-reset-guard",
    description: "Destructive force reset is guarded by ALLOW_SEED_FORCE_RESET",
    pass: () =>
      /ALLOW_SEED_FORCE_RESET/.test(read("controllers/courseController.js")) &&
      /ALLOW_SEED_FORCE_RESET/.test(read("controllers/learningController.js")),
  },
  {
    id: "server-has-api-hardening",
    description: "Server uses security headers and rate limiting middleware",
    pass: () => {
      const source = read("server.js");
      return (
        /securityHeaders/.test(source) &&
        /createRateLimiter/.test(source) &&
        /app\.use\("\/api",\s*globalApiLimiter\)/.test(source) &&
        /app\.post\("\/api\/auth\/login",\s*loginLimiter\)/.test(source)
      );
    },
  },
];

let hasFailure = false;
for (const check of checks) {
  const ok = check.pass();
  const status = ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${check.id}: ${check.description}`);
  if (!ok) hasFailure = true;
}

if (hasFailure) {
  console.error("\nSecurity regression checks failed.");
  process.exit(1);
}

console.log("\nAll security regression checks passed.");
