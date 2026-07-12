const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export const getGoogleAuthorizeUrl = (state, scope) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/integrations/google/callback`,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const exchangeGoogleCode = async (code) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.BACKEND_URL}/api/integrations/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }

  return data;
};

export const refreshGoogleAccessToken = async (refreshToken) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Google token refresh error: ${data.error_description || data.error}`);
  }

  return data;
};

export const getGoogleUserInfo = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Could not fetch Google user profile");
  }

  return response.json();
};

const buildRawEmail = (to, subject, body) => {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const sendGmailMessage = async (accessToken, to, subject, body) => {
  const raw = buildRawEmail(to, subject, body);

  const response = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Gmail API error (${response.status}): ${data.error?.message}`);
  }

  return data;
};