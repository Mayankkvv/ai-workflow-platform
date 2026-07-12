import Integration from "../models/Integration.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { refreshGoogleAccessToken } from "./googleService.js";

export const getValidGoogleAccessToken = async (userId, provider) => {
  const integration = await Integration.findOne({ userId, provider }).select(
    "+accessToken +refreshToken"
  );

  if (!integration) {
    throw new Error(`No ${provider} account connected for this user`);
  }

  const isExpired =
    !integration.tokenExpiresAt || new Date() >= new Date(integration.tokenExpiresAt);

  if (!isExpired) {
    return decrypt(integration.accessToken);
  }

  if (!integration.refreshToken) {
    throw new Error(`${provider} connection has expired. Please reconnect.`);
  }

  const refreshedData = await refreshGoogleAccessToken(decrypt(integration.refreshToken));

  integration.accessToken = encrypt(refreshedData.access_token);
  integration.tokenExpiresAt = new Date(Date.now() + refreshedData.expires_in * 1000);
  await integration.save();

  return refreshedData.access_token;
};