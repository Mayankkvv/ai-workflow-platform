# ⚡ FlowForge AI — AI Workflow Automation Platform

A full-stack, production-style workflow automation platform (in the spirit of Zapier / n8n) where users visually design pipelines — trigger, AI processing, storage, notification — using a drag-and-drop canvas, then execute them through a background job engine with real AI integration and real third-party actions.

**[Live Demo](#) · [API Base URL](#)** *(replace with your deployed links)*

> Built end-to-end as a solo project to go deep on production backend architecture (auth, queues, OAuth, real-time systems) rather than just CRUD — not a tutorial clone.

---

## ✨ What It Actually Does

A user builds a workflow like:

```
Webhook Trigger → Groq AI → Store in MongoDB → Slack Notification
```

...saves it, flips it **Active**, and any external system (a form, another API, a script) can hit its unique webhook URL to trigger it. The workflow runs in the background, calls a real LLM, writes real data, and posts a real message — with the whole run logged, node by node, and streamed live to the browser as it happens.

## 🧩 Core Features

**Visual Builder**
- Drag-and-drop canvas (React Flow) with custom, color-coded nodes per type
- Per-node configuration panels (schema-driven forms), with `{{templating}}` to pass data between nodes
- Undo/redo, node delete/duplicate, keyboard shortcuts
- Pre-built **workflow templates** (Resume Analyzer, Email Summarizer, Customer Support Triage, Lead Generator, GitHub PR Summarizer)

**Execution Engine**
- Background job queue (Redis + BullMQ) — the API responds instantly (`202 Accepted`) while a fully independent worker process executes the workflow
- Execution order determined by a real **topological sort** over the workflow's node graph (not array order)
- Cooperative job **cancellation** and one-click **retry**
- Full execution history with a node-by-node breakdown of inputs/outputs/errors

**Real Integrations (not stubs)**
- **Groq AI** — real LLM calls for reasoning/classification/generation steps
- **GitHub** — OAuth2, creates real issues
- **Gmail** — OAuth2 with automatic access-token refresh, sends real emails
- **Google Drive** — OAuth2 (shared with Gmail's token infrastructure), uploads real files
- **Slack** — OAuth2 bot token, posts to real channels
- **Discord** — incoming webhook, posts to real channels
- **Generic REST API node** — call any external HTTP API, with basic SSRF protection
- All third-party credentials are **AES-256-GCM encrypted at rest**, never stored in plaintext

**Real-Time & Auth**
- Socket.IO live execution status, bridged across the separate API/worker processes via BullMQ's `QueueEvents`
- JWT access + refresh tokens with rotation, httpOnly cookies, and session persistence across reloads
- Password reset via real transactional email (Nodemailer)

**Product Polish**
- Full light/dark mode
- Toast notifications, loading skeletons, workflow search/rename/duplicate
- Responsive dashboard with live stats and cross-workflow activity feed

---

## 🏗️ Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│   Frontend   │ ─────► │   API Server      │ ─────► │  MongoDB    │
│  React+Vite  │  HTTP  │  Express          │        │  (Atlas)    │
│  (Vercel)    │ ◄───── │  (Render)         │        └─────────────┘
└──────┬───────┘  WS    └─────────┬─────────┘
       │ Socket.IO                │ enqueue job
       │                          ▼
       │                 ┌──────────────────┐
       │                 │   Redis Queue     │
       │                 │   (Upstash)       │
       │                 └─────────┬─────────┘
       │                           │ picked up by
       │                 ┌─────────▼─────────┐
       └── live updates ◄│  Worker Process    │
         (via QueueEvents)│  (Render)          │──► Groq / GitHub / Gmail /
                          └────────────────────┘    Drive / Slack / Discord
```

The API server and the worker are **deliberately separate processes** — the API never blocks on slow node execution (an LLM call, an email send); it just queues a job and returns immediately. This mirrors how real production systems isolate request-handling from background work.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Zustand, Axios, React Flow, Socket.IO client, Lucide Icons |
| Backend | Node.js, Express, MongoDB + Mongoose, JWT, bcrypt, Zod |
| Jobs / Real-time | Redis, BullMQ, Socket.IO |
| AI | Groq API |
| Integrations | GitHub, Google (Gmail + Drive), Slack — OAuth2; Discord — incoming webhooks |
| Email | Nodemailer |
| Infra | MongoDB Atlas, Upstash Redis, Render (API + worker), Vercel (frontend) |

---

## 📂 Project Structure

```
ai-workflow-platform/
├── backend/
│   ├── src/
│   │   ├── config/           # DB, Redis, Socket.IO setup
│   │   ├── models/            # User, Workflow, ExecutionLog, Integration
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/              # Express routers
│   │   ├── middlewares/          # Auth (JWT) middleware
│   │   ├── validators/            # Zod schemas
│   │   ├── services/               # Groq, GitHub, Google, Slack, Discord, mailer
│   │   ├── execution/                # Orchestrator, graph sort, node executors
│   │   ├── queues/                     # BullMQ queue + event bridge
│   │   ├── workers/                     # Background execution worker
│   │   └── utils/                        # Encryption, template rendering
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/              # Dashboard, Builder, Login, Account, etc.
    │   ├── components/           # NodeConfigPanel, Sidebar, Toast, modals
    │   ├── context/                # Toast + Theme providers
    │   ├── store/                    # Zustand auth store
    │   ├── services/                   # API client modules
    │   ├── hooks/                        # useWorkflowSocket
    │   └── utils/                          # Node types, field schemas, templates
    └── package.json
```

---

## 🚀 Running Locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas cluster, an Upstash Redis instance, a Groq API key.

```bash
git clone https://github.com/Mayankkvv/ai-workflow-platform.git
cd ai-workflow-platform

# Backend
cd backend
npm install
cp .env.example .env   # fill in your own values
npm run dev             # API server
npm run worker          # in a separate terminal — background worker

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables (backend): `MONGO_URI`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GROQ_API_KEY`, `INTEGRATION_ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`, plus OAuth client credentials for whichever integrations you want to test (GitHub/Google/Slack).

---

## 🗺️ Roadmap / Not Yet Built

- Role-based access control (admin views across all users)
- Scheduled / recurring execution (cron-style triggers via BullMQ repeatable jobs)
- Multi-input node merging (currently each node reads one upstream predecessor)
- Automated test suite

---

## 📄 License

MIT — feel free to explore, fork, or use this as a reference for your own project.

---

Built by **Mayank Kumar** — [GitHub](https://github.com/Mayankkvv)