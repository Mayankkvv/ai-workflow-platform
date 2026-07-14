import { z } from "zod";

const nodeSchema = z.object({
  nodeId: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.string(), z.any()).optional().default({}),
});

const edgeSchema = z.object({
  edgeId: z.string(),
  source: z.string(),
  target: z.string(),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1, "Workflow name is required"),
  description: z.string().trim().optional().default(""),
});

export const updateWorkflowSchema = z.object({
  name: z.string().trim().min(1, "Workflow name is required"),
  description: z.string().trim().optional().default(""),
  nodes: z.array(nodeSchema).optional().default([]),
  edges: z.array(edgeSchema).optional().default([]),
  isActive: z.boolean().optional(),
});

export const renameWorkflowSchema = z.object({
  name: z.string().trim().min(1, "Workflow name is required"),
  description: z.string().trim().optional(),
});