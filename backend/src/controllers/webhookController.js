import Workflow from "../models/workflow.js";
import workflowQueue from "../queues/workflowQueue.js";

export const receiveWebhook = async (req, res) => {
  try {
    const { token } = req.params;

    const workflow = await Workflow.findOne({ webhookToken: token });

    if (!workflow) {
      return res.status(404).json({
        message: "No workflow found for this webhook",
      });
    }

    if (!workflow.isActive) {
      return res.status(403).json({
        message: "This workflow is not active",
      });
    }

    const job = await workflowQueue.add("execute", {
      workflowId: workflow._id.toString(),
      triggerPayload: req.body,
    });

    return res.status(202).json({
      message: "Webhook received, workflow execution started",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Webhook receive error:", error.message);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};