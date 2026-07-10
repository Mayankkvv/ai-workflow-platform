import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getExecutionLogs } from "../services/workflowService.js";
import { getNodeLabel } from "../utils/nodeTypes.js";
import { useWorkflowSocket } from "../hooks/useWorkflowSocket.js";

function ExecutionHistoryPage() {
  const { id } = useParams();

  const [executions, setExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [liveNotice, setLiveNotice] = useState("");

  const fetchExecutions = async () => {
    try {
      const data = await getExecutionLogs(id);
      setExecutions(data.executions);
    } catch (err) {
      setError("Could not load execution history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useWorkflowSocket(id, (data) => {
    setLiveNotice(
      data.status === "completed"
        ? "A new execution just completed — list updated"
        : "A new execution just failed — list updated"
    );
    fetchExecutions();

    setTimeout(() => setLiveNotice(""), 4000);
  });

  const toggleExpanded = (executionId) => {
    setExpandedId((prev) => (prev === executionId ? null : executionId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={`/workflows/${id}`}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back to builder
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Execution History</h1>
        </div>

        {liveNotice && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 text-sm">
            {liveNotice}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading history...</p>
        ) : executions.length === 0 ? (
          <p className="text-gray-500">
            No executions yet. Run this workflow from the builder to see results here.
          </p>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <div
                key={execution._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(execution._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        execution.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {execution.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(execution.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {expandedId === execution._id ? "Hide" : "View"} details
                  </span>
                </button>

                {expandedId === execution._id && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50">
                    {execution.nodeResults.map((result, index) => (
                      <div
                        key={`${result.nodeId}-${index}`}
                        className="text-sm bg-white border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">
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
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-xs text-red-600">{result.error}</p>
                        )}
                      </div>
                    ))}
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