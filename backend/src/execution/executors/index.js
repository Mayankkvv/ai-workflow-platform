import webhookTrigger from "./webhookTrigger.js";
import groqAI from "./groqAI.js";
import mongoStore from "./mongoStore.js";
import slackNotification from "./slackNotification.js";
import restApiCall from "./restApiCall.js";
import githubCreateIssue from "./githubCreateIssue.js";

const executors = {
  webhookTrigger,
  groqAI,
  mongoStore,
  slackNotification,
  restApiCall,
  githubCreateIssue,
};

export default executors;