import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";

const prisma = new PrismaClient();

export const setupPresence = async (io, socket) => {
  try {
    // Store socket ID in Redis (user is online)
    await redis.set(`user:${socket.userId}`, socket.id);

    // Join all conversations user is part of
    const memberships = await prisma.conversationMember.findMany({
      where: { userId: socket.userId },
    });

    memberships.forEach((m) => {
      socket.join(m.conversationId);
    });

    // Notify others (not the current socket)
    socket.broadcast.emit("user_online", socket.userId);

    // Join conversation dynamically
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", async () => {
      // Remove from Redis
      await redis.del(`user:${socket.userId}`);

      // Notify others user is offline
      socket.broadcast.emit("user_offline", socket.userId);
    });

  } catch (error) {
    console.error("presence error:", error.message);
  }
};