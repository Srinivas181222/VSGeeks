export default function ActivityBar() {
  return (
    <div className="flex h-full w-12 flex-col items-center gap-4 border-r border-slate-800 bg-slate-950 py-4 text-slate-500">
      <div className="rounded-md bg-slate-800/70 px-2 py-1 text-xs text-white">EX</div>
      <div className="text-xs">SC</div>
      <div className="text-xs">TM</div>
      <div className="text-xs">ST</div>
    </div>
  );
}
