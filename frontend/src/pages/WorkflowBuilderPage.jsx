import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  getWorkflowById,
  updateWorkflow,
  executeWorkflow,
} from "../services/workflowService.js";
import {
  toReactFlowNodes,
  toReactFlowEdges,
  toBackendNodes,
  toBackendEdges,
} from "../utils/workflowMappers.js";
import { NODE_TYPES } from "../utils/nodeTypes.js";
import NodeConfigPanel from "../components/NodeConfigPanel.jsx";

function WorkflowBuilderPage() {
  const { id } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const data = await getWorkflowById(id);
        setWorkflowName(data.workflow.name);
        setDescription(data.workflow.description || "");
        setNodes(toReactFlowNodes(data.workflow.nodes));
        setEdges(toReactFlowEdges(data.workflow.edges));
      } catch (err) {
        setError("Could not load this workflow.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleConfigChange = (nodeId, newConfig) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: newConfig } }
          : node
      )
    );
  };

  const handleAddNode = (nodeType, label) => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "default",
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      },
      data: {
        label,
        nodeType,
        config: {},
      },
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    setError("");

    try {
      await updateWorkflow(id, {
        name: workflowName,
        description,
        nodes: toBackendNodes(nodes),
        edges: toBackendEdges(edges),
      });
      setSaveMessage("Saved successfully");
    } catch (err) {
      setError("Could not save the workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setSaveMessage("");
    setError("");

    try {
      await executeWorkflow(id);
      setSaveMessage("Execution started — check history for results shortly");
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not start execution. Please try again.";
      setError(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading workflow...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back
          </Link>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          />
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-sm text-green-600">{saveMessage}</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
          <Link
            to={`/workflows/${id}/executions`}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            History
          </Link>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isExecuting ? "Starting..." : "▶ Run"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-gray-200 bg-white p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Add a node
          </p>
          {NODE_TYPES.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => handleAddNode(nodeType.type, nodeType.label)}
              className="w-full text-left text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-2"
            >
              {nodeType.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <NodeConfigPanel
          selectedNode={selectedNode}
          onConfigChange={handleConfigChange}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}

export default WorkflowBuilderPage;