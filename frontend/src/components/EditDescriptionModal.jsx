import { useState } from "react";

function EditDescriptionModal({ currentDescription, onSave, onCancel, isLoading }) {
  const [description, setDescription] = useState(currentDescription || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(description.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Description</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            autoFocus
            placeholder="What does this workflow do?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
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

export default EditDescriptionModal;