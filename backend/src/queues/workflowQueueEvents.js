import { QueueEvents, Job } from "bullmq";
import connection from "../config/redis.js";
import workflowQueue from "./workflowQueue.js";
import { getIO } from "../config/socket.js";

const queueEvents = new QueueEvents("workflow-execution", { connection });

const parseReturnValue = (returnvalue) => {
  try {
    return typeof returnvalue === "string" ? JSON.parse(returnvalue) : returnvalue;
  } catch (error) {
    return returnvalue;
  }
};

queueEvents.on("completed", async ({ jobId, returnvalue }) => {
  try {
    const job = await Job.fromId(workflowQueue, jobId);
    if (!job) return;

    const { workflowId } = job.data;

    getIO().to(`workflow:${workflowId}`).emit("execution:update", {
      workflowId,
      status: "completed",
      result: parseReturnValue(returnvalue),
    });
  } catch (error) {
    console.error("QueueEvents completed handler error:", error.message);
  }
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  try {
    const job = await Job.fromId(workflowQueue, jobId);
    if (!job) return;

    const { workflowId } = job.data;

    getIO().to(`workflow:${workflowId}`).emit("execution:update", {
      workflowId,
      status: "failed",
      error: failedReason,
    });
  } catch (error) {
    console.error("QueueEvents failed handler error:", error.message);
  }
});

export default queueEvents;