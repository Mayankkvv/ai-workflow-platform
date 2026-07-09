import { useState, useEffect } from "react";
import { getWorkflows, createWorkflow } from "../services/workflowService.js";
import useAuthStore from "../store/authStore.js";

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
              <div
                key={workflow._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="font-medium text-gray-800">{workflow.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {workflow.description || "No description"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {workflow.isActive ? "Active" : "Draft"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;