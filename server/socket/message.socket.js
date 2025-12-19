import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {
  socket.on(
    "send_message",
    async ({ conversationId, content, receiverId }) => {
      try {
        //  Save message (sent)
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

        // Update message status in DB
        await prisma.message.update({
          where: { id: message.id },
          data: { status: "delivered" }
        });

        // Check if receiver is online (Redis)
        const receiverOnline = await redis.exists(
          `user:${receiverId}`
        );

        // 5Send push notification if receiver is offline
        if (!receiverOnline) {
          await sendNotification(
            receiverId,
            "New Message",
            content
          );
        }
      } catch (error) {
        console.error("send_message error:", error.message);
      }
    }
  );
};
