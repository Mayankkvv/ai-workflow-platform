export const sendDiscordMessage = async (webhookUrl, content) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Discord webhook error (${response.status}): ${errorBody}`);
  }

  return { sent: true };
};