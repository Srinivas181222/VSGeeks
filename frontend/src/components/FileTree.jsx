import { useState } from "react";

const Row = ({
  node,
  depth,
  activeId,
  onSelect,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}) => {
  const [open, setOpen] = useState(true);
  const isFolder = node.type === "folder";
  const isActive = activeId === node.id;

  return (
    <div>
      <div
        className={`group flex items-center justify-between rounded-md px-2 py-1 text-sm ${
          isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900"
        }`}
        style={{ paddingLeft: 12 + depth * 12 }}
      >
        <button
          onClick={() => (isFolder ? setOpen(!open) : onSelect(node))}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="text-xs text-slate-500">{isFolder ? (open ? "▾" : "▸") : "•"}</span>
          <span className="truncate">{node.name}</span>
        </button>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {isFolder && (
            <>
              <button
                className="rounded px-1 text-xs text-slate-400 hover:text-white"
                title="New file"
                onClick={() => onCreateFile(node.id)}
              >
                +F
              </button>
              <button
                className="rounded px-1 text-xs text-slate-400 hover:text-white"
                title="New folder"
                onClick={() => onCreateFolder(node.id)}
              >
                +D
              </button>
            </>
          )}
          <button
            className="rounded px-1 text-xs text-slate-400 hover:text-white"
            title="Rename"
            onClick={() => onRename(node)}
          >
            R
          </button>
          <button
            className="rounded px-1 text-xs text-red-400 hover:text-red-300"
            title="Delete"
            onClick={() => onDelete(node)}
          >
            X
          </button>
        </div>
      </div>
      {isFolder && open && node.children?.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <Row
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree(props) {
  const { tree } = props;
  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <Row key={node.id} node={node} depth={0} {...props} />
      ))}
    </div>
  );
}
