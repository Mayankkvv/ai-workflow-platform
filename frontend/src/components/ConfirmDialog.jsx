function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading,
}) {
  const confirmClasses =
    variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm border border-transparent dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-sm text-white px-3 py-1.5 rounded-md disabled:opacity-50 ${confirmClasses}`}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;