import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
  }
);

const edgeSchema = new mongoose.Schema(
  {
    edgeId: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Workflow = mongoose.model("Workflow", workflowSchema);

export default Workflow;