import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {

  /*SEND MESSAGE*/
  socket.on("send_message", async ({ conversationId, content, replyToId }) => {
    try {
      if (!conversationId || !content) return;

      const sender = await prisma.user.findUnique({
        where: { id: socket.userId }
      });

      if (!sender || sender.isBlocked) {
        socket.emit("error_message", "You are blocked or invalid user");
        return;
      }

      // Save message
      const message = await prisma.message.create({
        data: {
          content,
          senderId: socket.userId,
          conversationId,
          replyToId: replyToId || null,
          status: "sent"
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          replyTo: true
        }
      });

      // Emit to room (frontend listens to this!)
      io.to(conversationId).emit("receive_message", {
        id: message.id,
        content: message.content,
        sender: message.sender,
        senderId: message.senderId,
        conversationId: message.conversationId,
        replyTo: message.replyTo,
        createdAt: message.createdAt,
        status: "delivered"
      });

      // Mark delivered
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "delivered" }
      });

      // Notify offline users
      const members = await prisma.conversationMember.findMany({
        where: {
          conversationId,
          userId: { not: socket.userId }
        }
      });

      for (const member of members) {
        const isOnline = await redis.exists(`user:${member.userId}`);
        if (!isOnline) {
          await sendNotification(
            member.userId,
            "New Message",
            content
          );
        }
      }

    } catch (error) {
      console.error("send_message error:", error);
    }
  });

  /*MARK SEEN*/
  socket.on("mark_seen", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          status: { not: "seen" }
        },
        data: { status: "seen" }
      });

      io.to(conversationId).emit("messages_seen", {
        conversationId,
        seenBy: socket.userId
      });
    } catch (err) {
      console.error("mark_seen error:", err);
    }
  });

  /*TYPING*/
  socket.on("typing", ({ conversationId }) => {
    try {
      if (!conversationId) return;

      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId
      });
    } catch (error) {
      console.error("typing error:", error);
    }
  });
};
