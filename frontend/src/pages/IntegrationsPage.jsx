import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import {
  getIntegrations,
  getGithubConnectUrl,
  getGmailConnectUrl,
  getGoogleDriveConnectUrl,
  getSlackConnectUrl,
  connectDiscord,
  testIntegration,
  disconnectIntegration,
} from "../services/integrationService.js";
import { IntegrationsSkeleton } from "../components/Skeleton.jsx";

const PROVIDERS = [
  { key: "github", label: "GitHub" },
  { key: "discord", label: "Discord" },
  { key: "gmail", label: "Gmail" },
  { key: "googledrive", label: "Google Drive" },
  { key: "slack", label: "Slack" },
];

function IntegrationsPage() {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discordUrlInput, setDiscordUrlInput] = useState("");
  const [showDiscordForm, setShowDiscordForm] = useState(false);
  const [isConnectingDiscord, setIsConnectingDiscord] = useState(false);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const toast = useToast();

  const fetchIntegrations = async () => {
    try {
      const data = await getIntegrations();
      setIntegrations(data.integrations);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();

    if (searchParams.get("connected")) {
      toast.success(`${searchParams.get("connected")} connected successfully`);
    } else if (searchParams.get("error")) {
      toast.error(`Failed to connect ${searchParams.get("error")}`);
    }
  }, [searchParams, toast]);

  const getIntegration = (provider) =>
    integrations.find((i) => i.provider === provider);
  const isConnected = (provider) => !!getIntegration(provider);

  const handleConnect = async (provider) => {
    if (provider === "github") {
      const { url } = await getGithubConnectUrl();
      window.location.href = url;
    } else if (provider === "gmail") {
      const { url } = await getGmailConnectUrl();
      window.location.href = url;
    } else if (provider === "googledrive") {
      const { url } = await getGoogleDriveConnectUrl();
      window.location.href = url;
    } else if (provider === "slack") {
      const { url } = await getSlackConnectUrl();
      window.location.href = url;
    } else if (provider === "discord") {
      setShowDiscordForm(true);
    }
  };

  const handleDiscordSubmit = async () => {
    setIsConnectingDiscord(true);
    try {
      await connectDiscord(discordUrlInput);
      toast.success("Discord connected successfully");
      setShowDiscordForm(false);
      setDiscordUrlInput("");
      fetchIntegrations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect Discord");
    } finally {
      setIsConnectingDiscord(false);
    }
  };

  const handleTest = async (provider) => {
    setTestingProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: null }));
    try {
      const data = await testIntegration(provider);
      setTestResults((prev) => ({
        ...prev,
        [provider]: { ok: true, message: data.message },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          ok: false,
          message: err.response?.data?.message || "Test failed",
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    await disconnectIntegration(provider);
    setTestResults((prev) => ({ ...prev, [provider]: null }));
    fetchIntegrations();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-6">
          Integrations
        </h1>

        {isLoading ? (
          <IntegrationsSkeleton />
        ) : (
          <div className="space-y-3">
            {PROVIDERS.map((provider) => {
              const integration = getIntegration(provider.key);
              const testResult = testResults[provider.key];

              return (
                <div
                  key={provider.key}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {provider.label}
                      </p>
                      {integration && (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Connected as {integration.providerAccountLabel}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Connected on{" "}
                            {new Date(
                              integration.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {integration && (
                        <button
                          onClick={() => handleTest(provider.key)}
                          disabled={testingProvider === provider.key}
                          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
                        >
                          {testingProvider === provider.key
                            ? "Testing..."
                            : "Test"}
                        </button>
                      )}

                      {isConnected(provider.key) ? (
                        <button
                          onClick={() => handleDisconnect(provider.key)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider.key)}
                          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {testResult && (
                    <p
                      className={`text-xs mt-2 ${
                        testResult.ok ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {testResult.ok ? "✓" : "✕"} {testResult.message}
                    </p>
                  )}

                  {provider.key === "discord" &&
                    showDiscordForm &&
                    !isConnected("discord") && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-xs text-gray-500">
                          In Discord: Server Settings → Integrations → Webhooks
                          → New Webhook → Copy URL
                        </p>
                        <input
                          type="text"
                          value={discordUrlInput}
                          onChange={(e) => setDiscordUrlInput(e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm"
                        />
                        <button
                          onClick={handleDiscordSubmit}
                          disabled={isConnectingDiscord}
                          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isConnectingDiscord ? "Connecting..." : "Save"}
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationsPage;
