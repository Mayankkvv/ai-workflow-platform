import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
import { useToast } from "../context/ToastContext.jsx";

const PROVIDERS = [
  { key: "github", label: "GitHub" },
  { key: "discord", label: "Discord" },
  { key: "gmail", label: "Gmail" },
  { key: "googledrive", label: "Google Drive" },
  { key: "slack", label: "Slack" },
];

function IntegrationsMenu() {
  const toast = useToast();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscordForm, setShowDiscordForm] = useState(false);
  const [discordUrlInput, setDiscordUrlInput] = useState("");
  const [busyProvider, setBusyProvider] = useState(null);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await getIntegrations();
      setIntegrations(data.integrations);
    } catch (err) {
      toast.error("Could not load integrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchIntegrations();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowDiscordForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIntegration = (provider) => integrations.find((i) => i.provider === provider);

  const handleConnect = async (provider) => {
    if (provider === "discord") {
      setShowDiscordForm(true);
      return;
    }

    setBusyProvider(provider);
    try {
      let url;
      if (provider === "github") ({ url } = await getGithubConnectUrl());
      else if (provider === "gmail") ({ url } = await getGmailConnectUrl());
      else if (provider === "googledrive") ({ url } = await getGoogleDriveConnectUrl());
      else if (provider === "slack") ({ url } = await getSlackConnectUrl());
      window.location.href = url;
    } catch (err) {
      toast.error(`Could not start ${provider} connection`);
      setBusyProvider(null);
    }
  };

  const handleDiscordSubmit = async () => {
    setBusyProvider("discord");
    try {
      await connectDiscord(discordUrlInput);
      toast.success("Discord connected");
      setShowDiscordForm(false);
      setDiscordUrlInput("");
      fetchIntegrations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect Discord");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleDisconnect = async (provider, label) => {
    setBusyProvider(provider);
    try {
      await disconnectIntegration(provider);
      toast.success(`${label} disconnected`);
      fetchIntegrations();
    } catch (err) {
      toast.error(`Could not disconnect ${label}`);
    } finally {
      setBusyProvider(null);
    }
  };

  const handleTest = async (provider) => {
    setBusyProvider(provider);
    try {
      const data = await testIntegration(provider);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection test failed");
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
      >
        Integrations
        {integrations.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5">
            {integrations.length}
          </span>
        )}
        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-2">
          {isLoading ? (
            <p className="text-sm text-gray-400 p-3">Loading...</p>
          ) : (
            <div className="space-y-0.5">
              {PROVIDERS.map((provider) => {
                const integration = getIntegration(provider.key);
                const isBusy = busyProvider === provider.key;

                return (
                  <div key={provider.key} className="p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{provider.label}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {integration
                            ? `Connected as ${integration.providerAccountLabel}`
                            : "Not connected"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {integration && (
                          <button
                            onClick={() => handleTest(provider.key)}
                            disabled={isBusy}
                            className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
                          >
                            Test
                          </button>
                        )}
                        {integration ? (
                          <button
                            onClick={() => handleDisconnect(provider.key, provider.label)}
                            disabled={isBusy}
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {isBusy ? "..." : "Disconnect"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(provider.key)}
                            disabled={isBusy}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isBusy ? "..." : "Connect"}
                          </button>
                        )}
                      </div>
                    </div>

                    {provider.key === "discord" && showDiscordForm && !integration && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] text-gray-400">
                          Server Settings → Integrations → Webhooks → Copy URL
                        </p>
                        <input
                          type="text"
                          value={discordUrlInput}
                          onChange={(e) => setDiscordUrlInput(e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={handleDiscordSubmit}
                          disabled={busyProvider === "discord"}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {busyProvider === "discord" ? "Connecting..." : "Save"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-100 mt-2 pt-2 px-2">
            <Link
              to="/integrations"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Manage all integrations →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsMenu;