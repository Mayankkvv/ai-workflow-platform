import webhookTrigger from "./webhookTrigger.js";
import groqAI from "./groqAI.js";
import mongoStore from "./mongoStore.js";
import slackNotification from "./slackNotification.js";

const executors = {
  webhookTrigger,
  groqAI,
  mongoStore,
  slackNotification,
};

export default executors;