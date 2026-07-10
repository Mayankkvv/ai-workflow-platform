import "dotenv/config";
import { Worker } from "bullmq";
import connection from "../config/redis.js";
import connectDB from "../config/db.js";
import Workflow from "../models/Workflow.js";

connectDB();

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const { workflowId } = job.data;

    console.log(`Processing job ${job.id} for workflow ${workflowId}`);

    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    console.log(`Workflow "${workflow.name}" has ${workflow.nodes.length} node(s)`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Finished processing workflow ${workflowId}`);

    return { status: "completed" };
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