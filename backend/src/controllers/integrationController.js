import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";
import { encrypt } from "../utils/encryption.js";
import {
  getGithubAuthorizeUrl,
  exchangeGithubCode,
  getGithubUser,
} from "../services/githubService.js";

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