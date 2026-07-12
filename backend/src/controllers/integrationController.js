import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";
import { encrypt } from "../utils/encryption.js";
import { testSlackAuth } from "../services/slackService.js";
import { getValidGoogleAccessToken } from "../services/googleTokenHelper.js";
import { sendDiscordMessage } from "../services/discordService.js";
import {
  getGithubAuthorizeUrl,
  exchangeGithubCode,
  getGithubUser,
} from "../services/githubService.js";

import {
  getGoogleAuthorizeUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from "../services/googleService.js";

import {
  getSlackAuthorizeUrl,
  exchangeSlackCode,
} from "../services/slackService.js";

export const testIntegration = async (req, res) => {
  try {
    const { provider } = req.params;

    const integration = await Integration.findOne({
      userId: req.userId,
      provider,
    }).select("+accessToken");

    if (!integration) {
      return res.status(404).json({ message: `No ${provider} integration connected` });
    }

    if (provider === "github") {
      const token = decrypt(integration.accessToken);
      const ghUser = await getGithubUser(token);
      return res.status(200).json({ message: `Connected as ${ghUser.login}` });
    }

    if (provider === "slack") {
      const token = decrypt(integration.accessToken);
      const result = await testSlackAuth(token);
      return res.status(200).json({ message: `Connected to workspace "${result.team}"` });
    }

    if (provider === "gmail" || provider === "googledrive") {
      const token = await getValidGoogleAccessToken(req.userId, provider);
      const info = await getGoogleUserInfo(token);
      return res.status(200).json({ message: `Connected as ${info.email}` });
    }

    if (provider === "discord") {
      const webhookUrl = decrypt(integration.accessToken);
      await sendDiscordMessage(webhookUrl, "✅ Connection test successful from AI Workflow Platform");
      return res.status(200).json({ message: "Test message sent to your Discord channel" });
    }

    return res.status(400).json({ message: "Unknown provider" });
  } catch (error) {
    console.error("Test integration error:", error.message);
    return res.status(400).json({ message: "Connection test failed — you may need to reconnect." });
  }
};

export const connectGithub = async (req, res) => {
  const state = jwt.sign({ userId: req.userId }, process.env.OAUTH_STATE_SECRET, {
    expiresIn: "10m",
  });

  const url = getGithubAuthorizeUrl(state);

  return res.status(200).json({ url });
};

export const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const decoded = jwt.verify(state, process.env.OAUTH_STATE_SECRET);
    const userId = decoded.userId;

    const tokenData = await exchangeGithubCode(code);
    const githubUser = await getGithubUser(tokenData.access_token);

    await Integration.findOneAndUpdate(
      { userId, provider: "github" },
      {
        userId,
        provider: "github",
        accessToken: encrypt(tokenData.access_token),
        scope: tokenData.scope || "",
        providerAccountLabel: githubUser.login,
      },
      { upsert: true, new: true }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/integrations?connected=github`);
  } catch (error) {
    console.error("GitHub callback error:", error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=github`);
  }
};

export const listIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.userId }).select(
      "provider providerAccountLabel createdAt"
    );

    return res.status(200).json({ integrations });
  } catch (error) {
    console.error("List integrations error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const disconnectIntegration = async (req, res) => {
  try {
    const { provider } = req.params;

    await Integration.findOneAndDelete({ userId: req.userId, provider });

    return res.status(200).json({ message: `${provider} disconnected successfully` });
  } catch (error) {
    console.error("Disconnect integration error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const connectDiscord = async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      return res.status(400).json({
        message: "Please provide a valid Discord webhook URL",
      });
    }

    await Integration.findOneAndUpdate(
      { userId: req.userId, provider: "discord" },
      {
        userId: req.userId,
        provider: "discord",
        accessToken: encrypt(webhookUrl),
        providerAccountLabel: "Discord Webhook",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Discord connected successfully" });
  } catch (error) {
    console.error("Connect Discord error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const GMAIL_SCOPE =
  "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email";

export const connectGmail = async (req, res) => {
  const state = jwt.sign(
    { userId: req.userId, provider: "gmail" },
    process.env.OAUTH_STATE_SECRET,
    { expiresIn: "10m" }
  );

  const url = getGoogleAuthorizeUrl(state, GMAIL_SCOPE);

  return res.status(200).json({ url });
};

export const googleCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const decoded = jwt.verify(state, process.env.OAUTH_STATE_SECRET);
    const { userId, provider } = decoded;

    const tokenData = await exchangeGoogleCode(code);
    const googleUser = await getGoogleUserInfo(tokenData.access_token);

    await Integration.findOneAndUpdate(
      { userId, provider },
      {
        userId,
        provider,
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token
          ? encrypt(tokenData.refresh_token)
          : undefined,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope || "",
        providerAccountLabel: googleUser.email,
      },
      { upsert: true, new: true }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/integrations?connected=${provider}`);
  } catch (error) {
    console.error("Google callback error:", error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=google`);
  }
};

const GOOGLE_DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";


export const connectGoogleDrive = async (req, res) => {
  const state = jwt.sign(
    { userId: req.userId, provider: "googledrive" },
    process.env.OAUTH_STATE_SECRET,
    { expiresIn: "10m" }
  );

  const url = getGoogleAuthorizeUrl(state, GOOGLE_DRIVE_SCOPE);

  return res.status(200).json({ url });
};

export const connectSlack = async (req, res) => {
  const state = jwt.sign({ userId: req.userId }, process.env.OAUTH_STATE_SECRET, {
    expiresIn: "10m",
  });

  const url = getSlackAuthorizeUrl(state);

  return res.status(200).json({ url });
};

export const slackCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const decoded = jwt.verify(state, process.env.OAUTH_STATE_SECRET);
    const userId = decoded.userId;

    const tokenData = await exchangeSlackCode(code);

    await Integration.findOneAndUpdate(
      { userId, provider: "slack" },
      {
        userId,
        provider: "slack",
        accessToken: encrypt(tokenData.access_token),
        scope: tokenData.scope || "",
        providerAccountLabel: tokenData.team?.name || "Slack Workspace",
      },
      { upsert: true, new: true }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/integrations?connected=slack`);
  } catch (error) {
    console.error("Slack callback error:", error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=slack`);
  }
};