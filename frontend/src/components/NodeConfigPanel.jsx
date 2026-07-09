import { NODE_FIELD_SCHEMAS } from "../utils/nodeFieldSchemas.js";

function NodeConfigPanel({ selectedNode, onConfigChange, onClose }) {
  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-400">
          Click a node to configure it.
        </p>
      </div>
    );
  }

  const fields = NODE_FIELD_SCHEMAS[selectedNode.data.nodeType] || [];
  const config = selectedNode.data.config || {};

  const handleFieldChange = (key, value) => {
    onConfigChange(selectedNode.id, {
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="w-72 border-l border-gray-200 bg-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          {selectedNode.data.label}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-gray-400">
          This node has no configurable settings.
        </p>
      ) : (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>

              {field.inputType === "textarea" && (
                <textarea
                  value={config[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {field.inputType === "text" && (
                <input
                  type="text"
                  value={config[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {field.inputType === "select" && (
                <select
                  value={config[field.key] || field.options[0]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NodeConfigPanel;