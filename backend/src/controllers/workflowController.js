import Workflow from "../models/Workflow.js";
import workflowQueue from "../queues/workflowQueue.js";
import { createWorkflowSchema, updateWorkflowSchema,renameWorkflowSchema, } from "../validators/workflowValidator.js";
import ExecutionLog from "../models/ExecutionLog.js";

export const createWorkflow = async (req, res) => {
  try {
    const parsed = createWorkflowSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, description } = parsed.data;

    const newWorkflow = await Workflow.create({
      name,
      description,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Workflow created successfully",
      workflow: newWorkflow,
    });
  } catch (error) {
    console.error("Create workflow error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ userId: req.userId }).sort({ updatedAt: -1 });

    return res.status(200).json({
      workflows,
    });
  } catch (error) {
    console.error("Get workflows error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "You do not have access to this workflow",
      });
    }

    return res.status(200).json({
      workflow,
    });
  } catch (error) {
    console.error("Get workflow by id error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const parsed = updateWorkflowSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "You do not have access to this workflow",
      });
    }

    const { name, description, nodes, edges, isActive } = parsed.data;

    workflow.name = name;
    workflow.description = description;
    workflow.nodes = nodes;
    workflow.edges = edges;
    if (isActive !== undefined) {
      workflow.isActive = isActive;
    }

    const updatedWorkflow = await workflow.save();

    return res.status(200).json({
      message: "Workflow updated successfully",
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error("Update workflow error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "You do not have access to this workflow",
      });
    }

    await workflow.deleteOne();

    return res.status(200).json({
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    console.error("Delete workflow error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};


export const executeWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "You do not have access to this workflow",
      });
    }

    const job = await workflowQueue.add("execute", {
      workflowId: workflow._id.toString(),
    });

    return res.status(202).json({
      message: "Workflow execution started",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Execute workflow error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const getExecutionLogs = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "You do not have access to this workflow",
      });
    }

    const executions = await ExecutionLog.find({ workflowId: workflow._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      executions,
    });
  } catch (error) {
    console.error("Get execution logs error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

export const renameWorkflow = async (req, res) => {
  try {
    const parsed = renameWorkflowSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (workflow.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "You do not have access to this workflow" });
    }

    workflow.name = parsed.data.name;
    const updatedWorkflow = await workflow.save();

    return res.status(200).json({
      message: "Workflow renamed successfully",
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error("Rename workflow error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};