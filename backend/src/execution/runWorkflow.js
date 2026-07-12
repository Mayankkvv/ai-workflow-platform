import Workflow from "../models/Workflow.js";
import ExecutionLog from "../models/ExecutionLog.js";
import executors from "./executors/index.js";
import { getExecutionOrder, getPredecessorId } from "./graphUtils.js";
import redisConnection from "../config/redis.js";

export const runWorkflow = async (workflowId, jobData = {}, jobId = null) => {
  const workflow = await Workflow.findById(workflowId);

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  const order = getExecutionOrder(workflow.nodes, workflow.edges);

  const context = {};
  const nodeResults = [];
  let overallStatus = "success";

  for (const nodeId of order) {
    if (jobId) {
      const cancelFlag = await redisConnection.get(`cancel:${jobId}`);
      if (cancelFlag) {
        overallStatus = "cancelled";
        break;
      }
    }

    const rawNode = workflow.nodes.find((n) => n.nodeId === nodeId);
    const plainNode = typeof rawNode.toObject === "function" ? rawNode.toObject() : rawNode;
    const node = { ...plainNode, userId: workflow.userId };

    const executor = executors[node.type];

    const predecessorId = getPredecessorId(nodeId, workflow.edges);
    const input = predecessorId ? context[predecessorId] : null;

    if (!executor) {
      nodeResults.push({
        nodeId,
        type: node.type,
        status: "failed",
        error: `No executor found for node type "${node.type}"`,
      });
      overallStatus = "failed";
      break;
    }

    try {
      const output = await executor(node, input, jobData);
      context[nodeId] = output;

      nodeResults.push({
        nodeId,
        type: node.type,
        status: "success",
        output,
      });
    } catch (error) {
      nodeResults.push({
        nodeId,
        type: node.type,
        status: "failed",
        error: error.message,
      });
      overallStatus = "failed";
      break;
    }
  }

  if (jobId) {
    await redisConnection.del(`cancel:${jobId}`);
  }

  const executionLog = await ExecutionLog.create({
    workflowId: workflow._id,
    userId: workflow.userId,
    status: overallStatus,
    nodeResults,
  });

  return executionLog;
};