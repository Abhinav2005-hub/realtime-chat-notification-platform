import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {
  socket.on(
    "send_message",
    async ({ conversationId, content, replyToId }) => {
      try {
        // CHECK IF SENDER IS BLOCKED (ADMIN CONTROL)
        const sender = await prisma.user.findUnique({
          where: { id: socket.userId }
        });

        if (sender?.isBlocked) {
          socket.emit(
            "error_message",
            "You are blocked by admin and cannot send messages"
          );
          return;
        }

        // SAVE MESSAGE (sent) — WITH REPLY SUPPORT
        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.userId,
            conversationId,
            replyToId: replyToId || null,
            status: "sent"
          }
        });

        // EMIT MESSAGE TO CONVERSATION ROOM (delivered)
        io.to(conversationId).emit("receive_message", {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          conversationId: message.conversationId,
          replyToId: message.replyToId,
          createdAt: message.createdAt,
          status: "delivered"
        });

        // UPDATE MESSAGE STATUS IN DB
        await prisma.message.update({
          where: { id: message.id },
          data: { status: "delivered" }
        });

        // FETCH ALL CONVERSATION MEMBERS (EXCEPT SENDER)
        const members = await prisma.conversationMember.findMany({
          where: {
            conversationId,
            userId: { not: socket.userId }
          }
        });

        // NOTIFY OFFLINE MEMBERS (GROUP + 1–1)
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

  // Mark Seen
  socket.on("mark_seen",async ({ conversationId }) => {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          status: { not: "seen" }
        },
        data: { status: "seen" }
      });

      // notify all user in conversation 
      io.to(conversationId).emit("messages_seen", {
        conversationId,
        seenBy: socket.userId
      });
    } catch (err) {
      console.error("mark_seen error:", err.message);
    }
  })

  // Typing Indicator
  socket.on("typing", ({ conversationId }) => {
    try {
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId
      });
    } catch (error) {
      console.error("typing error:", error.message);
    }
  });
};
