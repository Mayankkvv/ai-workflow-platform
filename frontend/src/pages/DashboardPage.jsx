import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWorkflows,
  createWorkflow,
  renameWorkflow,
  deleteWorkflow,
} from "../services/workflowService.js";
import useAuthStore from "../store/authStore.js";
import RenameModal from "../components/RenameModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await getWorkflows();
        setWorkflows(data.workflows);
      } catch (err) {
        setError("Could not load your workflows. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const data = await createWorkflow("Untitled Workflow", "");
      setWorkflows((prev) => [data.workflow, ...prev]);
    } catch (err) {
      setError("Could not create a new workflow. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSave = async (newName) => {
    setIsProcessing(true);
    try {
      await renameWorkflow(renameTarget._id, newName);
      setWorkflows((prev) =>
        prev.map((w) => (w._id === renameTarget._id ? { ...w, name: newName } : w))
      );
      setRenameTarget(null);
    } catch (err) {
      setError("Could not rename the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await deleteWorkflow(deleteTarget._id);
      setWorkflows((prev) => prev.filter((w) => w._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError("Could not delete the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={clearAuth}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Workflows
          </h2>
          <button
            onClick={handleCreateWorkflow}
            disabled={isCreating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "+ New Workflow"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading your workflows...</p>
        ) : workflows.length === 0 ? (
          <p className="text-gray-500">
            You don't have any workflows yet. Create your first one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow._id} className="group relative">
                <Link
                  to={`/workflows/${workflow._id}`}
                  className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <h3 className="font-medium text-gray-800 pr-14">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {workflow.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {workflow.isActive ? "Active" : "Draft"}
                  </p>
                </Link>

                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRenameTarget(workflow);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 hover:bg-gray-200 text-gray-600 text-sm"
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(workflow);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 hover:bg-red-100 text-red-600 text-sm"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renameTarget && (
        <RenameModal
          currentName={renameTarget.name}
          onSave={handleRenameSave}
          onCancel={() => setRenameTarget(null)}
          isLoading={isProcessing}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete workflow?"
          message={`"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
}

export default DashboardPage;