import { getNodeLabel } from "./nodeTypes.js";

export const toReactFlowNodes = (backendNodes) => {
  return backendNodes.map((node) => ({
    id: node.nodeId,
    type: "default",
    position: node.position,
    data: {
      label: getNodeLabel(node.type),
      nodeType: node.type,
      config: node.data,
    },
  }));
};

export const toReactFlowEdges = (backendEdges) => {
  return backendEdges.map((edge) => ({
    id: edge.edgeId,
    source: edge.source,
    target: edge.target,
  }));
};

export const toBackendNodes = (reactFlowNodes) => {
  return reactFlowNodes.map((node) => ({
    nodeId: node.id,
    type: node.data.nodeType,
    position: node.position,
    data: node.data.config || {},
  }));
};

export const toBackendEdges = (reactFlowEdges) => {
  return reactFlowEdges.map((edge) => ({
    edgeId: edge.id,
    source: edge.source,
    target: edge.target,
  }));
};