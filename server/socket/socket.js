import { Server } from "socket.io";
import { socketAuth } from "./auth.socket.js";
import { setupPresence } from "./presence.socket.js";
import { setupTyping } from "./typing.socket.js";
import { setupMessaging } from "./message.socket.js";
import { setupSeen } from "./seen.socket.js";

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // JWT Authentication
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    setupPresence(io, socket);
    setupTyping(io, socket);
    setupMessaging(io, socket);
    setupSeen(io, socket);
  });
};
