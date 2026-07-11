import Integration from "../../models/Integration.js";
import { decrypt } from "../../utils/encryption.js";
import { sendDiscordMessage } from "../../services/discordService.js";
import { renderTemplate } from "../renderTemplate.js";

const discordNotification = async (node, input) => {
  const integration = await Integration.findOne({
    userId: node.userId,
    provider: "discord",
  }).select("+accessToken");

  if (!integration) {
    throw new Error("No Discord webhook connected for this user");
  }

  const webhookUrl = decrypt(integration.accessToken);

  const messageTemplate = node.data?.message || "";
  const message = renderTemplate(messageTemplate, { input });

  if (!message) {
    throw new Error("Discord node requires a message");
  }

  const result = await sendDiscordMessage(webhookUrl, message);

  return {
    sent: result.sent,
    message,
  };
};

export default discordNotification;