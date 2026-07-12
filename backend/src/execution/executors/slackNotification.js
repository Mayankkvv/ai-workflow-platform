import Integration from "../../models/Integration.js";
import { decrypt } from "../../utils/encryption.js";
import { sendSlackMessage } from "../../services/slackService.js";
import { renderTemplate } from "../renderTemplate.js";

const slackNotification = async (node, input) => {
  const integration = await Integration.findOne({
    userId: node.userId,
    provider: "slack",
  }).select("+accessToken");

  if (!integration) {
    throw new Error("No Slack workspace connected for this user");
  }

  const botToken = decrypt(integration.accessToken);

  const channel = node.data?.channel || "";
  const messageTemplate = node.data?.message || "";
  const message = renderTemplate(messageTemplate, { input });

  if (!channel || !message) {
    throw new Error("Slack node requires both a channel and a message");
  }

  const result = await sendSlackMessage(botToken, channel, message);

  return {
    sent: true,
    channel: result.channel,
    ts: result.ts,
  };
};

export default slackNotification;