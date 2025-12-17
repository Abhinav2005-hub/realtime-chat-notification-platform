import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { redis } from "./config/redis.js";

const prisma = new PrismaClient();

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  // JWT authentication for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.userId);

    // Mark user online
    await redis.set(`user:${socket.userId}`, socket.id);

    io.emit("user_online", socket.userId);

    // 🔹 Join conversation
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    // 🔹 Typing indicator
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_typing", socket.userId);
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("stop_typing", socket.userId);
    });

    // 🔹 Send message
    socket.on("send_message", async ({ conversationId, content }) => {
      const message = await prisma.message.create({
        data: {
          content,
          senderId: socket.userId,
          conversationId
        }
      });

      io.to(conversationId).emit("receive_message", {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        status: "delivered"
      });
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.userId);
      await redis.del(`user:${socket.userId}`);
      io.emit("user_offline", socket.userId);
    });
  });
};
