import "dotenv/config";

import userRoutes from "./routes/userRoutes.js";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import { initSocket } from "./config/socket.js";
import "./queues/workflowQueueEvents.js";
import integrationRoutes from "./routes/integrationRoutes.js";

connectDB();

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

// Deliberate deployment trade-off: on the free tier, the worker runs inside
// this same process instead of as a separate service, to avoid a second
// paid Render service. Locally, RUN_WORKER_IN_PROCESS is unset, so the
// worker still runs separately via `npm run worker`, exactly as taught
// in Step 16.
if (process.env.RUN_WORKER_IN_PROCESS === "true") {
  await import("./workers/workflowWorker.js");
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/hooks", webhookRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/users", userRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});