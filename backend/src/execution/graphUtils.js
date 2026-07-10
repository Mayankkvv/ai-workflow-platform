export const getExecutionOrder = (nodes, edges) => {
  const nodeIds = nodes.map((node) => node.nodeId);

  const inDegree = {};
  const adjacency = {};

  nodeIds.forEach((id) => {
    inDegree[id] = 0;
    adjacency[id] = [];
  });

  edges.forEach((edge) => {
    adjacency[edge.source].push(edge.target);
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
  });

  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const order = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    order.push(currentId);

    adjacency[currentId].forEach((neighborId) => {
      inDegree[neighborId] -= 1;
      if (inDegree[neighborId] === 0) {
        queue.push(neighborId);
      }
    });
  }

  if (order.length !== nodeIds.length) {
    throw new Error("Workflow contains a cycle and cannot be executed");
  }

  return order;
};

export const getPredecessorId = (nodeId, edges) => {
  const incomingEdge = edges.find((edge) => edge.target === nodeId);
  return incomingEdge ? incomingEdge.source : null;
};