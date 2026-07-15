import { useState } from "react";

function RenameModal({ currentName, onSave, onCancel, isLoading }) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm border border-transparent dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Rename Workflow
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameModal;
