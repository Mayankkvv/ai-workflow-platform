import { useEffect } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore.js";

export const useWorkflowSocket = (workflowId, onUpdate) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!workflowId || !accessToken) {
      return;
    }

    const socket = io("http://localhost:5000", {
      auth: { token: accessToken },
    });

    socket.on("connect", () => {
      socket.emit("joinWorkflow", workflowId);
    });

    socket.on("execution:update", (data) => {
      if (data.workflowId === workflowId) {
        onUpdate(data);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return () => {
      socket.emit("leaveWorkflow", workflowId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, accessToken]);
};