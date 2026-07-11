import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getIntegrations,
  getGithubConnectUrl,
  disconnectIntegration,
} from "../services/integrationService.js";

const PROVIDERS = [{ key: "github", label: "GitHub" }];

function IntegrationsPage() {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

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
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationsPage;