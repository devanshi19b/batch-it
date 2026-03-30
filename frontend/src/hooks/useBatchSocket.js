import { useEffect, useEffectEvent } from "react";
import { io } from "socket.io-client";
import { API_ORIGIN } from "../services/api";

let socketInstance;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_ORIGIN, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }

  return socketInstance;
};

export function useBatchRoom({ batchId, enabled, onUpdate }) {
  const handleUpdate = useEffectEvent((payload) => {
    onUpdate?.(payload);
  });

  useEffect(() => {
    if (!enabled || !batchId) {
      return undefined;
    }

    const socket = getSocket();
    const listener = (payload) => {
      if (payload?.batchId === batchId) {
        handleUpdate(payload);
      }
    };

    socket.emit("batch:join", batchId);
    socket.on("batch:updated", listener);

    return () => {
      socket.emit("batch:leave", batchId);
      socket.off("batch:updated", listener);
    };
  }, [batchId, enabled]);
}

export function useBatchesFeed({ enabled, onChange }) {
  const handleChange = useEffectEvent((payload) => {
    onChange?.(payload);
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = getSocket();
    const listener = (payload) => {
      handleChange(payload);
    };

    socket.on("batches:changed", listener);
    return () => socket.off("batches:changed", listener);
  }, [enabled]);
}
