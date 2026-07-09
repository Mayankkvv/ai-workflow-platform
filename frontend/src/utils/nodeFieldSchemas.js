export const NODE_FIELD_SCHEMAS = {
  webhookTrigger: [
    {
      key: "webhookPath",
      label: "Webhook Path",
      inputType: "text",
      placeholder: "/hooks/my-workflow",
    },
  ],
  groqAI: [
    {
      key: "prompt",
      label: "Prompt",
      inputType: "textarea",
      placeholder: "Summarize this: {{input}}",
    },
    {
      key: "model",
      label: "Model",
      inputType: "select",
      options: [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
      ],
    },
  ],
  mongoStore: [
    {
      key: "collectionName",
      label: "Collection Name",
      inputType: "text",
      placeholder: "results",
    },
  ],
  slackNotification: [
    {
      key: "channel",
      label: "Slack Channel",
      inputType: "text",
      placeholder: "#alerts",
    },
    {
      key: "message",
      label: "Message Template",
      inputType: "textarea",
      placeholder: "New result: {{result}}",
    },
  ],
};