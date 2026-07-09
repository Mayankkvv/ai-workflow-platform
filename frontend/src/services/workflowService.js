import api from "./api.js";

export const getWorkflows = async () => {
  const response = await api.get("/workflows");
  return response.data;
};

export const createWorkflow = async (name, description) => {
  const response = await api.post("/workflows", { name, description });
  return response.data;
};

export const deleteWorkflow = async (id) => {
  const response = await api.delete(`/workflows/${id}`);
  return response.data;
};