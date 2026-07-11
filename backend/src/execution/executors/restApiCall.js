import { renderTemplate } from "../renderTemplate.js";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

const isBlockedUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    if (BLOCKED_HOSTS.includes(hostname)) {
      return true;
    }

    if (
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return true;
    }

    return false;
  } catch (error) {
    return true;
  }
};

const restApiCall = async (node, input) => {
  const method = node.data?.method || "GET";
  const rawUrl = node.data?.url || "";
  const rawBody = node.data?.body || "";
  const headers = node.data?.headers || {};

  const url = renderTemplate(rawUrl, { input });

  if (!url) {
    throw new Error("REST API Call node has no URL configured");
  }

  if (isBlockedUrl(url)) {
    throw new Error(`URL "${url}" is not allowed (points to a private/internal address)`);
  }

  const renderedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    renderedHeaders[key] = renderTemplate(value, { input });
  }

  const fetchOptions = {
    method,
    headers: renderedHeaders,
  };

  if (method !== "GET" && method !== "DELETE" && rawBody) {
    const renderedBody = renderTemplate(rawBody, { input });
    fetchOptions.body = renderedBody;
    if (!renderedHeaders["Content-Type"] && !renderedHeaders["content-type"]) {
      fetchOptions.headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(url, fetchOptions);

  const contentType = response.headers.get("content-type") || "";
  const responseBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      `REST API call failed (${response.status}): ${JSON.stringify(responseBody)}`
    );
  }

  return {
    status: response.status,
    body: responseBody,
  };
};

export default restApiCall;