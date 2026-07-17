import { Handle, Position } from "@xyflow/react";
import { NODE_VISUALS, DEFAULT_VISUAL } from "../utils/nodeVisuals.js";

function WorkflowNode({ data, selected }) {
  const visual = NODE_VISUALS[data.nodeType] || DEFAULT_VISUAL;
  const Icon = visual.icon;

  return (
    <div
      className={`min-w-[190px] bg-white dark:bg-gray-900 rounded-xl border shadow-sm px-3 py-2.5 flex items-center gap-3 transition-shadow ${
        selected
          ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/40 dark:ring-blue-500/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: visual.accent, width: 8, height: 8, border: "2px solid white" }}
      />

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${visual.badge}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {data.label}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{visual.category}</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: visual.accent, width: 8, height: 8, border: "2px solid white" }}
      />
    </div>
  );
}

export default WorkflowNode;