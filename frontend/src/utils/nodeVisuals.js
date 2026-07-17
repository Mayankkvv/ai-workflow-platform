import {
  Radio,
  Sparkles,
  Database,
  Globe,
  GitBranch,
  MessageCircle,
  Mail,
  MessageSquare,
  HardDrive,
} from "lucide-react";

export const NODE_VISUALS = {
  webhookTrigger: {
    icon: Radio,
    category: "Trigger",
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    accent: "#f59e0b",
  },
  groqAI: {
    icon: Sparkles,
    category: "AI",
    badge: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    accent: "#8b5cf6",
  },
  mongoStore: {
    icon: Database,
    category: "Storage",
    badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    accent: "#10b981",
  },
  restApiCall: {
    icon: Globe,
    category: "Action",
    badge: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
    accent: "#06b6d4",
  },
  githubCreateIssue: {
    icon: GitBranch,
    category: "Action",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    accent: "#6b7280",
  },
  discordNotification: {
    icon: MessageCircle,
    category: "Notification",
    badge: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    accent: "#6366f1",
  },
  gmailSendEmail: {
    icon: Mail,
    category: "Notification",
    badge: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    accent: "#ef4444",
  },
  slackNotification: {
    icon: MessageSquare,
    category: "Notification",
    badge: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400",
    accent: "#c026d3",
  },
  googleDriveUpload: {
    icon: HardDrive,
    category: "Storage",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    accent: "#3b82f6",
  },
};

export const DEFAULT_VISUAL = {
  icon: Globe,
  category: "Action",
  badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  accent: "#6b7280",
};