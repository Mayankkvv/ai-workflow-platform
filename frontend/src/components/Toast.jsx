const STYLES = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-gray-800",
};

function Toast({ message, type = "info", onDismiss }) {
  return (
    <div
      className={`${STYLES[type]} text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm animate-[fadeIn_0.2s_ease-out]`}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-white/70 hover:text-white leading-none"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;