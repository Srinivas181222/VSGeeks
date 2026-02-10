export default function ConsolePanel({ output }) {
  return (
    <div className="h-48 border-t border-slate-800 bg-black/80 px-4 py-3 text-xs text-emerald-400">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
        Console
      </div>
      <pre className="h-32 overflow-auto whitespace-pre-wrap">{output || "Run code to see output."}</pre>
    </div>
  );
}
