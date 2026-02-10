import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import MarketingFooter from "../components/MarketingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <MarketingNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%)]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300">
              New: Course Studio
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              A production-grade coding academy built for serious builders.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              CodeLearn combines a VSCode-grade editor, project workspaces, and curated
              courses so students ship real software faster.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Launch Studio
              </Link>
              <Link
                to="/courses"
                className="rounded-md border border-slate-800 px-5 py-3 text-sm text-slate-200 hover:border-slate-700 hover:text-white"
              >
                Browse Courses
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-400">
              <div>
                <div className="text-2xl font-semibold text-white">48k+</div>
                <div>Active learners</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">320+</div>
                <div>Real projects shipped</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">CodeLearn Studio</div>
              <div className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">
                Live
              </div>
            </div>
            <div className="mt-6 h-64 rounded-xl bg-slate-950 p-4 text-xs text-emerald-200">
              <div>~/projects/python/main.py</div>
              <pre className="mt-3 whitespace-pre-wrap text-slate-200">
{`def ship(product):
    print(f"Shipping {product} today.")

ship("CodeLearn Studio")`}
              </pre>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Auto-save and instant run results.
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Multi-file workspaces + guided lessons.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-sm uppercase tracking-widest text-emerald-300">
          Features
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "VSCode-grade editor",
              body: "Monaco editor, multi-file tabs, and workspace tooling in the browser.",
            },
            {
              title: "Guided courses",
              body: "Step-by-step lessons and assignment checkpoints tied to live coding.",
            },
            {
              title: "Production projects",
              body: "Ship real apps with reusable templates, tasks, and code review flows.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="text-lg font-semibold text-white">{item.title}</div>
              <p className="mt-3 text-sm text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="text-sm uppercase tracking-widest text-emerald-300">
              Courses
            </div>
            <h2 className="mt-3 text-3xl font-semibold">
              Structured learning paths built for career acceleration.
            </h2>
            <p className="mt-3 text-slate-300">
              Each course blends lessons, assignments, and live coding tasks so learners
              build muscle memory and portfolio-ready work.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex rounded-md border border-slate-800 px-4 py-2 text-sm text-slate-200 hover:border-slate-700 hover:text-white"
            >
              View Course Catalog
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="text-sm text-slate-400">Live cohort</div>
            <div className="mt-2 text-xl font-semibold text-white">
              Python Foundations
            </div>
            <div className="mt-3 text-sm text-slate-300">
              12 lessons • 6 assignments • Career-ready final project
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                Lesson: Control Flow, Collections, and Functions
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                Assignment: Build a CLI budgeting app
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                Mentor feedback and progress analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-sm uppercase tracking-widest text-emerald-300">
          Pricing
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Starter", price: "$0", detail: "Free practice + editor access." },
            { title: "Pro", price: "$29/mo", detail: "Full courses + mentorship." },
            { title: "Teams", price: "Custom", detail: "Private cohorts + reporting." },
          ].map((tier) => (
            <div
              key={tier.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="text-lg font-semibold text-white">{tier.title}</div>
              <div className="mt-2 text-3xl font-semibold">{tier.price}</div>
              <div className="mt-2 text-sm text-slate-300">{tier.detail}</div>
              <button className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-10 text-center">
          <div className="text-2xl font-semibold text-white">
            Build your next cohort with CodeLearn.
          </div>
          <div className="mt-3 text-sm text-emerald-100">
            Launch your studio today and onboard your first students in minutes.
          </div>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Start for Free
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
