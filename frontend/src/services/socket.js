import { io } from "socket.io-client";
import { BACKEND_URL } from "./api";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}
