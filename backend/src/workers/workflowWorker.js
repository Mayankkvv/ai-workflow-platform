import "dotenv/config";

import { Worker } from "bullmq";
import connection from "../config/redis.js";
import connectDB from "../config/db.js";
import { runWorkflow } from "../execution/runWorkflow.js";

connectDB();

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const { workflowId } = job.data;

    console.log(`Processing job ${job.id} for workflow ${workflowId}`);

    const executionLog = await runWorkflow(workflowId, job.data, job.id.toString());

    console.log(`Execution finished with status: ${executionLog.status}`);

    return {
      status: executionLog.status,
      executionLogId: executionLog._id,
    };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed:`, error.message);
});

console.log("Workflow worker is running and waiting for jobs...");