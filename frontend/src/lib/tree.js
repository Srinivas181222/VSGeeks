export const findNode = (nodes, nodeId) => {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.type === "folder" && node.children?.length) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
};

export const flattenFiles = (nodes, acc = []) => {
  nodes.forEach((node) => {
    if (node.type === "file") acc.push(node);
    if (node.type === "folder" && node.children?.length) {
      flattenFiles(node.children, acc);
    }
  });
  return acc;
};
