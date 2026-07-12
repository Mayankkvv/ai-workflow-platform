import { useState } from "react";
import { NODE_FIELD_SCHEMAS } from "../utils/nodeFieldSchemas.js";

function NodeConfigPanel({
  selectedNode,
  onConfigChange,
  onClose,
  webhookToken,
  onDeleteNode,
  onDuplicateNode,
}) {
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-400">Click a node to configure it.</p>
      </div>
    );
  }

  const fields = NODE_FIELD_SCHEMAS[selectedNode.data.nodeType] || [];
  const config = selectedNode.data.config || {};

  const handleFieldChange = (key, value) => {
    onConfigChange(selectedNode.id, { ...config, [key]: value });
  };

  const isWebhookTrigger = selectedNode.data.nodeType === "webhookTrigger";
  const isRestApiCall = selectedNode.data.nodeType === "restApiCall";
  const webhookUrl = webhookToken ? `http://localhost:5000/hooks/${webhookToken}` : "";

  const headers = config.headers || {};

  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    handleFieldChange("headers", { ...headers, [newHeaderKey.trim()]: newHeaderValue });
    setNewHeaderKey("");
    setNewHeaderValue("");
  };

  const handleRemoveHeader = (keyToRemove) => {
    const updated = { ...headers };
    delete updated[keyToRemove];
    handleFieldChange("headers", updated);
  };

  return (
    <div className="w-72 border-l border-gray-200 bg-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{selectedNode.data.label}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-sm">
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onDuplicateNode(selectedNode.id)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
        >
          ⧉ Duplicate
        </button>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded"
        >
          🗑 Delete Node
        </button>
      </div>

      {isWebhookTrigger && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <div className="text-xs bg-gray-50 border border-gray-200 rounded-md p-2 break-all text-gray-600">
            {webhookUrl}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(webhookUrl)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Copy URL
          </button>
        </div>
      )}

      {isRestApiCall && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={config.method || "GET"}
              onChange={(e) => handleFieldChange("method", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={config.url || ""}
              onChange={(e) => handleFieldChange("url", e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headers</label>
            <div className="space-y-1 mb-2">
              {Object.entries(headers).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                >
                  <span className="truncate">
                    <strong>{key}</strong>: {value}
                  </span>
                  <button
                    onClick={() => handleRemoveHeader(key)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Key"
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                placeholder="Value"
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <button
                onClick={handleAddHeader}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 rounded"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body (JSON, optional)
            </label>
            <textarea
              value={config.body || ""}
              onChange={(e) => handleFieldChange("body", e.target.value)}
              placeholder='{"key": "{{input.payload.message}}"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {fields.length === 0 && !isWebhookTrigger && !isRestApiCall ? (
        <p className="text-sm text-gray-400">This node has no configurable settings.</p>
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