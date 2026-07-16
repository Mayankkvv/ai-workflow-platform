import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WORKFLOW_TEMPLATES } from "../utils/workflowTemplates.js";
import { getIntegrations } from "../services/integrationService.js";
import { createWorkflowFromTemplate } from "../services/workflowService.js";
import { useToast } from "../context/ToastContext.jsx";

function TemplatesModal({ onClose }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [connectedProviders, setConnectedProviders] = useState([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [creatingId, setCreatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIntegrations();
        setConnectedProviders(data.integrations.map((i) => i.provider));
      } catch (err) {
        // Non-critical — templates still work, we just can't show connection badges.
      } finally {
        setIsLoadingIntegrations(false);
      }
    };
    load();
  }, []);

  const handleUseTemplate = async (template) => {
    setCreatingId(template.id);
    try {
      const data = await createWorkflowFromTemplate(
        template.name,
        template.description,
        template.nodes,
        template.edges
      );
      toast.success(`"${template.name}" created`);
      onClose();
      navigate(`/workflows/${data.workflow._id}`);
    } catch (err) {
      toast.error("Could not create workflow from template");
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-hidden border border-transparent dark:border-gray-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Workflow Templates
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {WORKFLOW_TEMPLATES.map((template) => {
            const isConnected = connectedProviders.includes(
              template.requiredIntegration.key
            );
            const isCreating = creatingId === template.id;

            return (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  {!isLoadingIntegrations && (
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                        isConnected
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      Requires: {template.requiredIntegration.label}
                      {isConnected ? " ✓" : " (not connected)"}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleUseTemplate(template)}
                  disabled={isCreating}
                  className="shrink-0 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {isCreating ? "Creating..." : "Use Template"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TemplatesModal;