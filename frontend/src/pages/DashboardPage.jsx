import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWorkflows,
  createWorkflow,
  renameWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
} from "../services/workflowService.js";
import useAuthStore from "../store/authStore.js";
import RenameModal from "../components/RenameModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EditDescriptionModal from "../components/EditDescriptionModal.jsx";
import { DashboardSkeleton } from "../components/Skeleton.jsx";
import { useToast } from "../context/ToastContext.jsx";

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const toast = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [descriptionTarget, setDescriptionTarget] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await getWorkflows();
        setWorkflows(data.workflows);
      } catch (err) {
        toast.error("Could not load your workflows. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const data = await createWorkflow("Untitled Workflow", "");
      setWorkflows((prev) => [data.workflow, ...prev]);
      toast.success("Workflow created");
    } catch (err) {
      toast.error("Could not create a new workflow. Please try again.");
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
      toast.success("Workflow renamed");
    } catch (err) {
      toast.error("Could not rename the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDescriptionSave = async (newDescription) => {
    setIsProcessing(true);
    try {
      await renameWorkflow(descriptionTarget._id, descriptionTarget.name, newDescription);
      setWorkflows((prev) =>
        prev.map((w) =>
          w._id === descriptionTarget._id ? { ...w, description: newDescription } : w
        )
      );
      setDescriptionTarget(null);
      toast.success("Description updated");
    } catch (err) {
      toast.error("Could not update the description. Please try again.");
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
      toast.success("Workflow deleted");
    } catch (err) {
      toast.error("Could not delete the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (workflow) => {
    setDuplicatingId(workflow._id);
    try {
      const data = await duplicateWorkflow(workflow._id);
      setWorkflows((prev) => [data.workflow, ...prev]);
      toast.success("Workflow duplicated");
    } catch (err) {
      toast.error("Could not duplicate the workflow. Please try again.");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      w.name.toLowerCase().includes(term) ||
      (w.description || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/account" className="text-sm text-gray-600 hover:text-gray-900">
              Account
            </Link>
            <button onClick={clearAuth} className="text-sm text-gray-600 hover:text-gray-900">
              Log out
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
            Your Workflows
          </h2>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workflows..."
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleCreateWorkflow}
            disabled={isCreating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isCreating ? "Creating..." : "+ New Workflow"}
          </button>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : workflows.length === 0 ? (
          <p className="text-gray-500">
            You don't have any workflows yet. Create your first one above.
          </p>
        ) : filteredWorkflows.length === 0 ? (
          <p className="text-gray-500">No workflows match "{searchTerm}".</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow._id} className="group relative">
                <Link
                  to={`/workflows/${workflow._id}`}
                  className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <h3 className="font-medium text-gray-800 pr-20">{workflow.name}</h3>
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
                      setDescriptionTarget(workflow);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 hover:bg-gray-200 text-gray-600 text-sm"
                    title="Edit description"
                  >
                    📝
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDuplicate(workflow);
                    }}
                    disabled={duplicatingId === workflow._id}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 hover:bg-gray-200 text-gray-600 text-sm disabled:opacity-50"
                    title="Duplicate"
                  >
                    ⧉
                  </button>
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

      {descriptionTarget && (
        <EditDescriptionModal
          currentDescription={descriptionTarget.description}
          onSave={handleDescriptionSave}
          onCancel={() => setDescriptionTarget(null)}
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