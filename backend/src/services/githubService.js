const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_URL = "https://api.github.com";

export const getGithubAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/integrations/github/callback`,
    scope: "repo",
    state,
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
};

export const exchangeGithubCode = async (code) => {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.BACKEND_URL}/api/integrations/github/callback`,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return data;
};

export const getGithubUser = async (accessToken) => {
  const response = await fetch(`${GITHUB_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not fetch GitHub user profile");
  }

  return response.json();
};

export const createGithubIssue = async (accessToken, repo, title, body) => {
  const response = await fetch(`${GITHUB_API_URL}/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}): ${data.message}`);
  }

  return data;
};