import "dotenv/config";
import crypto from "crypto";
import connectDB from "../config/db.js";
import Workflow from "../models/workflow.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  const workflowsMissingToken = await Workflow.find({
    $or: [{ webhookToken: { $exists: false } }, { webhookToken: null }],
  });

  console.log(`Found ${workflowsMissingToken.length} workflow(s) missing a webhookToken.`);

  for (const workflow of workflowsMissingToken) {
    workflow.webhookToken = crypto.randomBytes(24).toString("hex");
    await workflow.save();
    console.log(`Updated workflow "${workflow.name}" (${workflow._id})`);
  }

  console.log("Backfill complete.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Backfill failed:", error.message);
  process.exit(1);
});