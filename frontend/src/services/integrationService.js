import api from "./api.js";

export const getIntegrations = async () => {
  const response = await api.get("/integrations");
  return response.data;
};

export const getGithubConnectUrl = async () => {
  const response = await api.get("/integrations/github/connect");
  return response.data;
};

export const connectDiscord = async (webhookUrl) => {
  const response = await api.post("/integrations/discord/connect", { webhookUrl });
  return response.data;
};

export const disconnectIntegration = async (provider) => {
  const response = await api.delete(`/integrations/${provider}`);
  return response.data;
};

export const getGmailConnectUrl = async () => {
  const response = await api.get("/integrations/gmail/connect");
  return response.data;
};