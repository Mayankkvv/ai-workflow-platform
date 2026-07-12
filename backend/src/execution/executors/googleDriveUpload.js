import { getValidGoogleAccessToken } from "../../services/googleTokenHelper.js";
import { uploadToGoogleDrive } from "../../services/googleService.js";
import { renderTemplate } from "../renderTemplate.js";

const googleDriveUpload = async (node, input) => {
  const accessToken = await getValidGoogleAccessToken(node.userId, "googledrive");

  const fileNameTemplate = node.data?.fileName || "workflow-output.txt";
  const contentTemplate = node.data?.content || "";

  const fileName = renderTemplate(fileNameTemplate, { input });
  const content = renderTemplate(contentTemplate, { input });

  if (!content) {
    throw new Error("Google Drive node requires file content");
  }

  const result = await uploadToGoogleDrive(accessToken, fileName, content, "text/plain");

  return {
    fileId: result.id,
    fileName: result.name,
  };
};

export default googleDriveUpload;