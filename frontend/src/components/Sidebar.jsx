import FileTree from "./FileTree";

export default function Sidebar({
  tree,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onCreateRootFile,
  onCreateRootFolder,
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Explorer
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateRootFile}
            className="rounded px-2 py-1 text-xs text-slate-400 hover:text-white"
            title="New file"
          >
            +F
          </button>
          <button
            onClick={onCreateRootFolder}
            className="rounded px-2 py-1 text-xs text-slate-400 hover:text-white"
            title="New folder"
          >
            +D
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-3 py-3">
        {tree.length === 0 ? (
          <div className="text-sm text-slate-500">No files yet.</div>
        ) : (
          <FileTree
            tree={tree}
            activeId={activeFileId}
            onSelect={onSelectFile}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onRename={onRenameNode}
            onDelete={onDeleteNode}
          />
        )}
      </div>
    </aside>
  );
}
