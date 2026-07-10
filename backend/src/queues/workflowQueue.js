import { Queue } from "bullmq";
import connection from "../config/redis.js";

const workflowQueue = new Queue("workflow-execution", {
  connection,
});

export default workflowQueue;