export const WORKFLOW_TEMPLATES = [
  {
    id: "resume-analyzer",
    name: "Resume Analyzer",
    description:
      "Extracts skills and experience from a submitted resume, scores it with AI, and saves the analysis to Google Drive.",
    requiredIntegration: { key: "googledrive", label: "Google Drive" },
    nodes: [
      {
        nodeId: "trigger-1",
        type: "webhookTrigger",
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        nodeId: "groq-1",
        type: "groqAI",
        position: { x: 320, y: 150 },
        data: {
          prompt:
            "Analyze this resume and extract key skills, years of experience, and give a 1-10 fit score for a software engineering role.\n\nResume: {{input.payload.resumeText}}",
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        nodeId: "drive-1",
        type: "googleDriveUpload",
        position: { x: 590, y: 150 },
        data: {
          fileName: "resume-analysis-{{input.payload.candidateName}}.txt",
          content: "{{input.response}}",
        },
      },
    ],
    edges: [
      { edgeId: "edge-1", source: "trigger-1", target: "groq-1" },
      { edgeId: "edge-2", source: "groq-1", target: "drive-1" },
    ],
  },
  {
    id: "email-summarizer",
    name: "Email Summarizer",
    description:
      "Summarizes a long email into a short digest and emails it back, with any action items highlighted.",
    requiredIntegration: { key: "gmail", label: "Gmail" },
    nodes: [
      {
        nodeId: "trigger-1",
        type: "webhookTrigger",
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        nodeId: "groq-1",
        type: "groqAI",
        position: { x: 320, y: 150 },
        data: {
          prompt:
            "Summarize this email in 2-3 sentences and list any action items.\n\nEmail: {{input.payload.emailBody}}",
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        nodeId: "gmail-1",
        type: "gmailSendEmail",
        position: { x: 590, y: 150 },
        data: {
          to: "{{input.payload.recipientEmail}}",
          subject: "Summary: {{input.payload.emailSubject}}",
          body: "{{input.response}}",
        },
      },
    ],
    edges: [
      { edgeId: "edge-1", source: "trigger-1", target: "groq-1" },
      { edgeId: "edge-2", source: "groq-1", target: "gmail-1" },
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support Triage",
    description:
      "Classifies incoming support requests by urgency, logs every ticket, and alerts your team on Slack.",
    requiredIntegration: { key: "slack", label: "Slack" },
    nodes: [
      {
        nodeId: "trigger-1",
        type: "webhookTrigger",
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        nodeId: "groq-1",
        type: "groqAI",
        position: { x: 320, y: 150 },
        data: {
          prompt:
            'A customer submitted this support request: "{{input.payload.message}}"\nCustomer email: {{input.payload.email}}\n\nClassify this into one of: "urgent", "billing", "general", "spam".\nThen write a one-sentence internal summary.\nRespond as:\nCategory: <category>\nSummary: <summary>',
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        nodeId: "mongo-1",
        type: "mongoStore",
        position: { x: 590, y: 150 },
        data: { collectionName: "support_tickets" },
      },
      {
        nodeId: "slack-1",
        type: "slackNotification",
        position: { x: 860, y: 150 },
        data: { channel: "", message: "New ticket triaged: {{input.input.response}}" },
      },
    ],
    edges: [
      { edgeId: "edge-1", source: "trigger-1", target: "groq-1" },
      { edgeId: "edge-2", source: "groq-1", target: "mongo-1" },
      { edgeId: "edge-3", source: "mongo-1", target: "slack-1" },
    ],
  },
  {
    id: "lead-generator",
    name: "Lead Generator",
    description:
      "Scores inbound sales leads with AI, logs every submission, and pings your team on Discord for hot leads.",
    requiredIntegration: { key: "discord", label: "Discord" },
    nodes: [
      {
        nodeId: "trigger-1",
        type: "webhookTrigger",
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        nodeId: "groq-1",
        type: "groqAI",
        position: { x: 320, y: 150 },
        data: {
          prompt:
            "Score this sales lead from 1-10 based on budget, urgency, and fit. Explain why in one sentence.\n\nName: {{input.payload.name}}\nCompany: {{input.payload.company}}\nMessage: {{input.payload.message}}",
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        nodeId: "mongo-1",
        type: "mongoStore",
        position: { x: 590, y: 150 },
        data: { collectionName: "leads" },
      },
      {
        nodeId: "discord-1",
        type: "discordNotification",
        position: { x: 860, y: 150 },
        data: { message: "New lead scored: {{input.input.response}}" },
      },
    ],
    edges: [
      { edgeId: "edge-1", source: "trigger-1", target: "groq-1" },
      { edgeId: "edge-2", source: "groq-1", target: "mongo-1" },
      { edgeId: "edge-3", source: "mongo-1", target: "discord-1" },
    ],
  },
  {
    id: "github-pr-summarizer",
    name: "GitHub PR Summarizer",
    description:
      "Summarizes an incoming pull request for reviewers and files it as a GitHub issue with the key changes and risks.",
    requiredIntegration: { key: "github", label: "GitHub" },
    nodes: [
      {
        nodeId: "trigger-1",
        type: "webhookTrigger",
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        nodeId: "groq-1",
        type: "groqAI",
        position: { x: 320, y: 150 },
        data: {
          prompt:
            "Summarize this pull request in 2-3 sentences for a reviewer, highlighting the key change and any risk areas.\n\nPR Title: {{input.payload.prTitle}}\nDescription: {{input.payload.prDescription}}",
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        nodeId: "github-1",
        type: "githubCreateIssue",
        position: { x: 590, y: 150 },
        data: {
          repo: "",
          title: "PR Summary: {{input.payload.prTitle}}",
          body: "{{input.response}}",
        },
      },
    ],
    edges: [
      { edgeId: "edge-1", source: "trigger-1", target: "groq-1" },
      { edgeId: "edge-2", source: "groq-1", target: "github-1" },
    ],
  },
];