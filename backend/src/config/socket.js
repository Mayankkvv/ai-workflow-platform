import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Workflow from "../models/Workflow.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Not authorized, no token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Not authorized, invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on("joinWorkflow", async (workflowId) => {
      try {
        const workflow = await Workflow.findById(workflowId);

        if (!workflow || workflow.userId.toString() !== socket.userId) {
          return;
        }

        socket.join(`workflow:${workflowId}`);
      } catch (error) {
        console.error("joinWorkflow error:", error.message);
      }
    });

    socket.on("leaveWorkflow", (workflowId) => {
      socket.leave(`workflow:${workflowId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet");
  }
  return io;
};