import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FullPageSkeleton } from "../components/Skeleton.jsx";
import { useToast } from "../context/ToastContext.jsx";
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
  cancelExecution,
  deleteWorkflow,
} from "../services/workflowService.js";
import {
  toReactFlowNodes,
  toReactFlowEdges,
  toBackendNodes,
  toBackendEdges,
} from "../utils/workflowMappers.js";
import { NODE_TYPES } from "../utils/nodeTypes.js";
import NodeConfigPanel from "../components/NodeConfigPanel.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useWorkflowSocket } from "../hooks/useWorkflowSocket.js";

const MAX_HISTORY = 50;

function WorkflowBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [webhookToken, setWebhookToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [liveExecutionStatus, setLiveExecutionStatus] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [history, setHistory] = useState({ past: [], future: [] });

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const data = await getWorkflowById(id);
        setWorkflowName(data.workflow.name);
        setDescription(data.workflow.description || "");
        setIsActive(data.workflow.isActive);
        setWebhookToken(data.workflow.webhookToken || "");
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

  useWorkflowSocket(id, (data) => {
    setActiveJobId(null);

    if (data.status === "cancelled") {
      toast.info("Execution was cancelled");
    } else if (data.status === "completed" || data.status === "success") {
      toast.success("Execution completed — check History for details");
    } else {
      toast.error(
        `Execution failed: ${data.error || "see History for details"}`,
      );
    }
  });

  const takeSnapshot = () => {
    setHistory((h) => ({
      past: [...h.past, { nodes, edges }].slice(-MAX_HISTORY),
      future: [],
    }));
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    setHistory({
      past: newPast,
      future: [{ nodes, edges }, ...history.future],
    });
    setNodes(previous.nodes);
    setEdges(previous.edges);
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, { nodes, edges }],
      future: newFuture,
    });
    setNodes(next.nodes);
    setEdges(next.edges);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, nodes, edges]);

  const handleNodesChangeWithHistory = (changes) => {
    if (changes.some((c) => c.type === "remove")) {
      takeSnapshot();
    }
    onNodesChange(changes);
  };

  const handleEdgesChangeWithHistory = (changes) => {
    if (changes.some((c) => c.type === "remove")) {
      takeSnapshot();
    }
    onEdgesChange(changes);
  };

  const onConnect = (params) => {
    takeSnapshot();
    setEdges((eds) => addEdge(params, eds));
  };

  const onNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
  };

  const onNodeDragStart = () => {
    takeSnapshot();
  };

  const handleConfigChange = (nodeId, newConfig) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: newConfig } }
          : node,
      ),
    );
  };

  const handleAddNode = (nodeType, label) => {
    takeSnapshot();

    const newNode = {
      id: crypto.randomUUID(),
      type: "default",
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      },
      data: { label, nodeType, config: {} },
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const handleDeleteNode = (nodeId) => {
    takeSnapshot();
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    setSelectedNodeId(null);
  };

  const handleDuplicateNode = (nodeId) => {
    const original = nodes.find((n) => n.id === nodeId);
    if (!original) return;

    takeSnapshot();

    const newNode = {
      ...original,
      id: crypto.randomUUID(),
      position: {
        x: original.position.x + 40,
        y: original.position.y + 40,
      },
      data: {
        ...original.data,
        config: { ...(original.data.config || {}) },
      },
      selected: false,
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await updateWorkflow(id, {
        name: workflowName,
        description,
        nodes: toBackendNodes(nodes),
        edges: toBackendEdges(edges),
        isActive,
      });
      toast.success("Saved successfully");
    } catch (err) {
      toast.error("Could not save the workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);

    try {
      const data = await executeWorkflow(id);
      setActiveJobId(data.jobId);
      toast.info("Execution started — check history for results shortly");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not start execution. Please try again.";
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeJobId) return;

    try {
      const data = await cancelExecution(id, activeJobId);
      toast.info(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel execution");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkflow(id);
      navigate("/dashboard");
    } catch (err) {
      setError("Could not delete the workflow. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  if (isLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back
          </Link>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            Active
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* {liveExecutionStatus && (
            <span className="text-sm text-gray-700">{liveExecutionStatus}</span>
          )}
          {saveMessage && (
            <span className="text-sm text-green-600">{saveMessage}</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>} */}

          <button
            onClick={handleUndo}
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={history.future.length === 0}
            title="Redo (Ctrl+Shift+Z)"
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-600 px-2"
          >
            ↷ Redo
          </button>

          <Link
            to={`/workflows/${id}/executions`}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            History
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-800 px-3 py-2"
          >
            Delete
          </button>

          {activeJobId && (
            <button
              onClick={handleCancel}
              className="text-sm text-orange-600 hover:text-orange-800 px-3 py-2"
            >
              Cancel Run
            </button>
          )}

          <button
            onClick={handleExecute}
            disabled={isExecuting || !!activeJobId}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isExecuting ? "Starting..." : activeJobId ? "Running..." : "▶ Run"}
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
            onNodesChange={handleNodesChangeWithHistory}
            onEdgesChange={handleEdgesChangeWithHistory}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStart={onNodeDragStart}
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
          webhookToken={webhookToken}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
        />
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this workflow?"
          message="This will permanently delete the workflow and all its execution history. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default WorkflowBuilderPage;
