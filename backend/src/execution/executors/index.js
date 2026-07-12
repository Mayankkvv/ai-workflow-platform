import webhookTrigger from "./webhookTrigger.js";
import groqAI from "./groqAI.js";
import mongoStore from "./mongoStore.js";
import slackNotification from "./slackNotification.js";
import restApiCall from "./restApiCall.js";
import githubCreateIssue from "./githubCreateIssue.js";
import discordNotification from "./discordNotification.js";
import gmailSendEmail from "./gmailSendEmail.js";
import googleDriveUpload from "./googleDriveUpload.js";

const executors = {
  webhookTrigger,
  groqAI,
  mongoStore,
  slackNotification,
  restApiCall,
  githubCreateIssue,
  discordNotification,
  gmailSendEmail,
  googleDriveUpload,
};

export default executors;