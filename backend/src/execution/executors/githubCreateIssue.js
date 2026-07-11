import Integration from "../../models/Integration.js";
import { decrypt } from "../../utils/encryption.js";
import { createGithubIssue } from "../../services/githubService.js";
import { renderTemplate } from "../renderTemplate.js";

const githubCreateIssue = async (node, input) => {
  const integration = await Integration.findOne({
    userId: node.userId,
    provider: "github",
  }).select("+accessToken");

  if (!integration) {
    throw new Error("No GitHub account connected for this user");
  }

  const accessToken = decrypt(integration.accessToken);

  const repo = node.data?.repo || "";
  const titleTemplate = node.data?.title || "";
  const bodyTemplate = node.data?.body || "";

  const title = renderTemplate(titleTemplate, { input });
  const body = renderTemplate(bodyTemplate, { input });

  if (!repo || !title) {
    throw new Error("GitHub node requires both a repository and a title");
  }

  const issue = await createGithubIssue(accessToken, repo, title, body);

  return {
    issueNumber: issue.number,
    url: issue.html_url,
  };
};

export default githubCreateIssue;