export default function ConsolePanel({ output, stdin, onStdinChange }) {
  return (
    <div className="border-t border-slate-800 bg-black/80 px-4 py-3 text-xs text-emerald-400">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
        Console
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap">
        {output || "Run code to see output."}
      </pre>

      {typeof onStdinChange === "function" && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Program Input (stdin)
          </div>
          <textarea
            className="mt-2 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
            rows={4}
            placeholder={"Example:\n5\n10\nhello"}
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
          />
          <div className="mt-1 text-[10px] text-slate-500">
            Each line is one call to input().
          </div>
        </div>
      )}
    </div>
  );
}
