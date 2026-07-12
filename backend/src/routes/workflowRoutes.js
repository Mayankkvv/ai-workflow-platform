import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecutionLogs,
  renameWorkflow,
} from "../controllers/workflowController.js";

const router = express.Router();

router.use(protect);

router.post("/", createWorkflow);
router.get("/", getWorkflows);
router.get("/:id", getWorkflowById);
router.put("/:id", updateWorkflow);
router.patch("/:id/rename", renameWorkflow);
router.delete("/:id", deleteWorkflow);
router.post("/:id/execute", executeWorkflow);
router.get("/:id/executions", getExecutionLogs);

export default router;