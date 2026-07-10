import api from "./api.js";

export const getWorkflows = async () => {
  const response = await api.get("/workflows");
  return response.data;
};

export const getWorkflowById = async (id) => {
  const response = await api.get(`/workflows/${id}`);
  return response.data;
};

export const createWorkflow = async (name, description) => {
  const response = await api.post("/workflows", { name, description });
  return response.data;
};

export const updateWorkflow = async (id, payload) => {
  const response = await api.put(`/workflows/${id}`, payload);
  return response.data;
};

export const deleteWorkflow = async (id) => {
  const response = await api.delete(`/workflows/${id}`);
  return response.data;
};

export const executeWorkflow = async (id) => {
  const response = await api.post(`/workflows/${id}/execute`);
  return response.data;
};

export const getExecutionLogs = async (id) => {
  const response = await api.get(`/workflows/${id}/executions`);
  return response.data;
};