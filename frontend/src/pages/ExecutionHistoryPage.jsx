import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getExecutionLogs,
  executeWorkflow,
} from "../services/workflowService.js";
import { getNodeLabel } from "../utils/nodeTypes.js";
import { useWorkflowSocket } from "../hooks/useWorkflowSocket.js";
import { useToast } from "../context/ToastContext.jsx";
import { ExecutionHistorySkeleton } from "../components/Skeleton.jsx";

function ExecutionHistoryPage() {
  const { id } = useParams();

  const [executions, setExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const toast = useToast();

  const fetchExecutions = async () => {
    try {
      const data = await getExecutionLogs(id);
      setExecutions(data.executions);
    } catch (err) {
      toast.error("Could not load execution history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useWorkflowSocket(id, (data) => {
    const message =
      data.status === "cancelled"
        ? "An execution was cancelled — list updated"
        : data.status === "completed" || data.status === "success"
          ? "A new execution just completed — list updated"
          : "A new execution just failed — list updated";

    toast.info(message);
    fetchExecutions();
  });

  const toggleExpanded = (executionId) => {
    setExpandedId((prev) => (prev === executionId ? null : executionId));
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await executeWorkflow(id);
      toast.info("Retry started — results will appear here shortly");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start retry");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/workflows/${id}`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to builder
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Execution History
            </h1>
          </div>

          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isRetrying ? "Starting..." : "↻ Run Again"}
          </button>
        </div>

        {isLoading ? (
          <ExecutionHistorySkeleton />
        ) : executions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No executions yet. Run this workflow from the builder to see results
            here.
          </p>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <div
                key={execution._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(execution._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        execution.status === "success"
                          ? "bg-green-100 text-green-700"
                          : execution.status === "cancelled"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {execution.status}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(execution.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {expandedId === execution._id ? "Hide" : "View"} details
                  </span>
                </button>

                {expandedId === execution._id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-800">
                    {execution.nodeResults.map((result, index) => (
                      <div
                        key={`${result.nodeId}-${index}`}
                        className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {getNodeLabel(result.type)}
                          </span>
                          <span
                            className={
                              result.status === "success"
                                ? "text-green-600 text-xs"
                                : "text-red-600 text-xs"
                            }
                          >
                            {result.status}
                          </span>
                        </div>

                        {result.status === "success" ? (
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words bg-gray-800 p-2 rounded">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-xs text-red-600">{result.error}</p>
                        )}
                      </div>
                    ))}
                    {execution.nodeResults.length === 0 && (
                      <p className="text-xs text-gray-400">
                        No nodes ran before this execution was cancelled.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExecutionHistoryPage;
