import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  cancelExecution,
  getExecutionLogs,
  getRecentExecutions,
  renameWorkflow,
  duplicateWorkflow,
} from "../controllers/workflowController.js";

const router = express.Router();

router.use(protect);

router.get("/executions/recent", getRecentExecutions);
router.post("/", createWorkflow);
router.get("/", getWorkflows);
router.get("/:id", getWorkflowById);
router.put("/:id", updateWorkflow);
router.patch("/:id/rename", renameWorkflow);
router.post("/:id/duplicate", duplicateWorkflow);
router.delete("/:id", deleteWorkflow);
router.post("/:id/execute", executeWorkflow);
router.post("/:id/executions/:jobId/cancel", cancelExecution);
router.get("/:id/executions", getExecutionLogs);

export default router;