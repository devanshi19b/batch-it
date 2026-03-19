import { io } from "socket.io-client";
import { BACKEND_URL } from "./api";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }

  return socketInstance;
}
