const findNode = (nodes, nodeId) => {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.type === "folder" && node.children?.length) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
};

const addChild = (nodes, parentId, child) => {
  if (!parentId) {
    nodes.push(child);
    return true;
  }
  const parent = findNode(nodes, parentId);
  if (!parent || parent.type !== "folder") return false;
  parent.children = parent.children || [];
  parent.children.push(child);
  return true;
};

const removeNode = (nodes, nodeId) => {
  const index = nodes.findIndex((n) => n.id === nodeId);
  if (index >= 0) {
    nodes.splice(index, 1);
    return true;
  }
  for (const node of nodes) {
    if (node.type === "folder" && node.children?.length) {
      const removed = removeNode(node.children, nodeId);
      if (removed) return true;
    }
  }
  return false;
};

const updateNode = (nodes, nodeId, updater) => {
  const node = findNode(nodes, nodeId);
  if (!node) return false;
  updater(node);
  return true;
};

module.exports = {
  findNode,
  addChild,
  removeNode,
  updateNode,
};
