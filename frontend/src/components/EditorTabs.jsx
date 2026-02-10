export default function EditorTabs({ tabs, activeId, onSelect, onClose }) {
  return (
    <div className="flex h-10 items-center gap-1 overflow-auto border-b border-slate-800 bg-slate-900 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`group flex items-center gap-2 rounded-t-md px-3 py-2 text-xs font-medium ${
            activeId === tab.id
              ? "bg-slate-950 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="truncate">{tab.name}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            className="rounded px-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-white"
          >
            x
          </span>
        </button>
      ))}
    </div>
  );
}
