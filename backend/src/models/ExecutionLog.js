import mongoose from "mongoose";

const nodeResultSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const executionLogSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "cancelled"],
      required: true,
    },
    nodeResults: {
      type: [nodeResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ExecutionLog = mongoose.model("ExecutionLog", executionLogSchema);

export default ExecutionLog;