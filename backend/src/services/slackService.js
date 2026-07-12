const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access";
const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

export const getSlackAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/integrations/slack/callback`,
    scope: "chat:write,chat:write.public",
    state,
  });

  return `${SLACK_AUTHORIZE_URL}?${params.toString()}`;
};

export const exchangeSlackCode = async (code) => {
  const response = await fetch(SLACK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.BACKEND_URL}/api/integrations/slack/callback`,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  return data;
};

export const sendSlackMessage = async (botToken, channel, text) => {
  const response = await fetch(SLACK_POST_MESSAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
};

const SLACK_AUTH_TEST_URL = "https://slack.com/api/auth.test";

export const testSlackAuth = async (botToken) => {
  const response = await fetch(SLACK_AUTH_TEST_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${botToken}` },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
};