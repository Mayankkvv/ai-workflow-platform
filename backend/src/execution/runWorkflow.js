import Workflow from "../models/Workflow.js";
import ExecutionLog from "../models/ExecutionLog.js";
import executors from "./executors/index.js";
import { getExecutionOrder, getPredecessorId } from "./graphUtils.js";

export const runWorkflow = async (workflowId) => {
  const workflow = await Workflow.findById(workflowId);

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  const order = getExecutionOrder(workflow.nodes, workflow.edges);

  const context = {};
  const nodeResults = [];
  let overallStatus = "success";

  for (const nodeId of order) {
    const node = workflow.nodes.find((n) => n.nodeId === nodeId);
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
      const output = await executor(node, input);
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

  const executionLog = await ExecutionLog.create({
    workflowId: workflow._id,
    userId: workflow.userId,
    status: overallStatus,
    nodeResults,
  });

  return executionLog;
};