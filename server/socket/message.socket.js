import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {
  socket.on(
    "send_message",
    async ({ conversationId, content }) => {
      try {
        // Save message (sent)
        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.userId,
            conversationId,
            status: "sent"
          }
        });

        // Emit message to conversation room (delivered)
        io.to(conversationId).emit("receive_message", {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
          status: "delivered"
        });

        // Update delivered status
        await prisma.message.update({
          where: { id: message.id },
          data: { status: "delivered" }
        });

        // Fetch all conversation members except sender
        const members = await prisma.conversationMember.findMany({
          where: {
            conversationId,
            userId: { not: socket.userId }
          }
        });

        // Notify offline members
        for (const member of members) {
          const isOnline = await redis.exists(
            `user:${member.userId}`
          );

          if (!isOnline) {
            await sendNotification(
              member.userId,
              "New Message",
              content
            );
          }
        }
      } catch (error) {
        console.error("send_message error:", error.message);
      }
    }
  );
};
