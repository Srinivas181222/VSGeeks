export default function TutorialPanel({ tutorial }) {
  if (!tutorial) {
    return (
      <aside className="hidden h-full w-80 flex-col border-r border-slate-800 bg-slate-950/70 px-4 py-4 lg:flex">
        <div className="text-sm text-slate-500">Select a tutorial to begin.</div>
      </aside>
    );
  }

  return (
    <aside className="hidden h-full w-80 flex-col border-r border-slate-800 bg-slate-950/70 px-4 py-4 lg:flex">
      <div className="text-xs uppercase tracking-widest text-slate-400">Tutorial</div>
      <h3 className="mt-2 text-lg font-semibold text-white">{tutorial.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{tutorial.content}</p>
      <div className="mt-4">
        <div className="text-xs uppercase tracking-widest text-slate-400">Example</div>
        <pre className="mt-2 rounded-md bg-slate-900/80 p-3 text-xs text-slate-200">
          {tutorial.example}
        </pre>
      </div>
      <div className="mt-4">
        <div className="text-xs uppercase tracking-widest text-slate-400">Task</div>
        <p className="mt-2 text-sm text-slate-300">{tutorial.task}</p>
      </div>
    </aside>
  );
}
