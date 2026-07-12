import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getIntegrations,
  getGithubConnectUrl,
  getGmailConnectUrl,
  getGoogleDriveConnectUrl,
  connectDiscord,
  disconnectIntegration,
} from "../services/integrationService.js";

const PROVIDERS = [
  { key: "github", label: "GitHub" },
  { key: "discord", label: "Discord" },
  { key: "gmail", label: "Gmail" },
  { key: "googledrive", label: "Google Drive" },
];

function IntegrationsPage() {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [discordUrlInput, setDiscordUrlInput] = useState("");
  const [showDiscordForm, setShowDiscordForm] = useState(false);
  const [isConnectingDiscord, setIsConnectingDiscord] = useState(false);

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
      setMessage(`${searchParams.get("connected")} connected successfully`);
    } else if (searchParams.get("error")) {
      setMessage(`Failed to connect ${searchParams.get("error")}`);
    }
  }, []);

  const isConnected = (provider) =>
    integrations.some((i) => i.provider === provider);

  const getLabel = (provider) =>
    integrations.find((i) => i.provider === provider)?.providerAccountLabel;

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
    } else if (provider === "discord") {
      setShowDiscordForm(true);
    }
  };

  const handleDiscordSubmit = async () => {
    setIsConnectingDiscord(true);
    try {
      await connectDiscord(discordUrlInput);
      setMessage("Discord connected successfully");
      setShowDiscordForm(false);
      setDiscordUrlInput("");
      fetchIntegrations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not connect Discord");
    } finally {
      setIsConnectingDiscord(false);
    }
  };

  const handleDisconnect = async (provider) => {
    await disconnectIntegration(provider);
    fetchIntegrations();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
          ← Back to dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-800 mt-4 mb-6">Integrations</h1>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 text-sm">
            {message}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-3">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.key}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{provider.label}</p>
                    {isConnected(provider.key) && (
                      <p className="text-xs text-gray-500">
                        Connected as {getLabel(provider.key)}
                      </p>
                    )}
                  </div>

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

                {provider.key === "discord" && showDiscordForm && !isConnected("discord") && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs text-gray-500">
                      In Discord: Server Settings → Integrations → Webhooks → New Webhook → Copy URL
                    </p>
                    <input
                      type="text"
                      value={discordUrlInput}
                      onChange={(e) => setDiscordUrlInput(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationsPage;