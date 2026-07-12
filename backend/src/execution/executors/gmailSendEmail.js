import { getValidGoogleAccessToken } from "../../services/googleTokenHelper.js";
import { sendGmailMessage } from "../../services/googleService.js";
import { renderTemplate } from "../renderTemplate.js";

const gmailSendEmail = async (node, input) => {
  const accessToken = await getValidGoogleAccessToken(node.userId, "gmail");

  const to = node.data?.to || "";
  const subjectTemplate = node.data?.subject || "";
  const bodyTemplate = node.data?.body || "";

  const subject = renderTemplate(subjectTemplate, { input });
  const body = renderTemplate(bodyTemplate, { input });

  if (!to || !subject) {
    throw new Error("Gmail node requires both a recipient and a subject");
  }

  const result = await sendGmailMessage(accessToken, to, subject, body);

  return {
    messageId: result.id,
    to,
    subject,
  };
};

export default gmailSendEmail;