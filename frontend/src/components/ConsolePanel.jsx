import { useState } from "react";

export default function ConsolePanel({
  output,
  stdin,
  onStdinChange,
  onSendInput,
  interactiveRunning = false,
  runState = "idle",
  runMessage = "",
  onStop,
  onClear,
}) {
  const [runtimeInput, setRuntimeInput] = useState("");
  const [inputError, setInputError] = useState("");

  const interactiveMode = typeof onSendInput === "function";

  const sendRuntimeInput = async () => {
    if (!interactiveMode || !interactiveRunning) return;
    setInputError("");
    try {
      await onSendInput(runtimeInput);
      setRuntimeInput("");
    } catch (err) {
      setInputError(err.message);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-black/80 px-4 py-3 text-xs text-emerald-400">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
        <span>Console</span>
        <div className="flex items-center gap-3">
          {interactiveMode && <span>State: {runState}</span>}
          {typeof onClear === "function" && (
            <button
              onClick={onClear}
              className="text-[10px] text-slate-400 transition hover:text-white"
              title="Clear console"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <pre className="max-h-44 overflow-auto whitespace-pre-wrap">
        {output || "Run code to see output."}
      </pre>
      {runMessage && <div className="mt-2 text-[11px] text-amber-300">{runMessage}</div>}

      {interactiveMode && (
        <div className="mt-4 border-t border-slate-800 pt-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Program Input (stdin)
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 disabled:opacity-60"
              placeholder={
                interactiveRunning ? "Type input and press Enter" : "Run code to send input"
              }
              value={runtimeInput}
              disabled={!interactiveRunning}
              onChange={(e) => setRuntimeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendRuntimeInput();
                }
              }}
            />
            <button
              onClick={sendRuntimeInput}
              disabled={!interactiveRunning}
              className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500 disabled:opacity-50"
            >
              Send
            </button>
            {typeof onStop === "function" && (
              <button
                onClick={onStop}
                disabled={!interactiveRunning}
                className="rounded-md border border-rose-500/50 px-3 py-2 text-xs text-rose-200 transition hover:border-rose-400 disabled:opacity-50"
              >
                Stop
              </button>
            )}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Sends one line to the running process.
          </div>
          {inputError && <div className="mt-1 text-[11px] text-rose-300">{inputError}</div>}
        </div>
      )}

      {!interactiveMode && typeof onStdinChange === "function" && (
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
