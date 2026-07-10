import { renderTemplate } from "../renderTemplate.js";

const slackNotification = async (node, input) => {
  const channel = node.data?.channel || "#general";
  const messageTemplate = node.data?.message || "";

  const finalMessage = renderTemplate(messageTemplate, { input });

  console.log(`[Slack Simulation] Would send to ${channel}: "${finalMessage}"`);

  return {
    simulated: true,
    channel,
    message: finalMessage,
  };
};

export default slackNotification;