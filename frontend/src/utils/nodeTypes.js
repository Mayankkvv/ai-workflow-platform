export const NODE_TYPES = [
  { type: "webhookTrigger", label: "Webhook Trigger" },
  { type: "groqAI", label: "Groq AI" },
  { type: "mongoStore", label: "Store in MongoDB" },
  { type: "slackNotification", label: "Slack Notification" },
  { type: "restApiCall", label: "REST API Call" },
  { type: "githubCreateIssue", label: "GitHub: Create Issue" },
  { type: "discordNotification", label: "Discord Notification" },
];

export const getNodeLabel = (type) => {
  const match = NODE_TYPES.find((n) => n.type === type);
  return match ? match.label : type;
};