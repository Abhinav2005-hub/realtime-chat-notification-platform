import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {

  /* JOIN CONVERSATION ROOM */
  socket.on("conversation:join", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined ${conversationId}`);
  });

  /* LEAVE CONVERSATION ROOM */
  socket.on("conversation:leave", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left ${conversationId}`);
  });

  /* SEND MESSAGE */
  socket.on("send_message", async ({ conversationId, content, replyToId }) => {
    try {
      if (!conversationId || !content?.trim()) return;

      const sender = await prisma.user.findUnique({
        where: { id: socket.userId },
      });

      if (!sender || sender.isBlocked) {
        socket.emit("error_message", "You are blocked or invalid user");
        return;
      }

      const message = await prisma.message.create({
        data: {
          content,
          senderId: socket.userId,
          conversationId,
          replyToId: replyToId || null,
          status: "sent",
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
          replyTo: true,
          reactions: true,
        },
      });

      io.to(conversationId).emit("receive_message", {
        id: message.id,
        content: message.content,
        sender: message.sender,
        senderId: message.senderId,
        conversationId: message.conversationId,
        replyTo: message.replyTo,
        createdAt: message.createdAt,
        status: "delivered",
        reactions: message.reactions,
      });

      await prisma.message.update({
        where: { id: message.id },
        data: { status: "delivered" },
      });

      const members = await prisma.conversationMember.findMany({
        where: {
          conversationId,
          userId: { not: socket.userId },
        },
      });

      for (const member of members) {
        const isOnline = await redis.exists(`user:${member.userId}`);
        if (!isOnline) {
          await sendNotification(member.userId, "New Message", content);
        }
      }
    } catch (error) {
      console.error("send_message error:", error);
    }
  });

  /* EDIT MESSAGE */
  socket.on("edit_message", async ({ messageId, newContent }) => {
    try {
      if (!newContent || !newContent.trim()) return;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) return;

      if (message.senderId !== socket.userId) {
        socket.emit("error_message", "You can only edit your own messages");
        return;
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
        },
      });

      io.to(updated.conversationId).emit("message_edited", {
        messageId: updated.id,
        newContent: updated.content,
        isEdited: updated.isEdited,
      });
    } catch (err) {
      console.error("edit_message error:", err.message);
    }
  });

  /* MARK SEEN */
  socket.on("mark_seen", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          status: { not: "seen" },
        },
        data: { status: "seen" },
      });

      io.to(conversationId).emit("messages_seen", {
        conversationId,
        seenBy: socket.userId,
      });
    } catch (err) {
      console.error("mark_seen error:", err.message);
    }
  });

  /* TYPING */
  socket.on("typing", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(conversationId).emit("user_typing", {
      userId: socket.userId,
    });
  });

  /* DELETE MESSAGE */
  socket.on("delete_message", async ({ messageId }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) return;

      if (message.senderId !== socket.userId) return;

      const deleted = await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: "Message deleted",
        },
      });

      io.to(message.conversationId).emit("message_deleted", {
        messageId: deleted.id,
        conversationId: deleted.conversationId,
      });
    } catch (err) {
      console.error("delete_message error:", err.message);
    }
  });

  /* REACT MESSAGE */
  socket.on("react_message", async ({ messageId, emoji }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) return;

      const reaction = await prisma.reaction.upsert({
        where: {
          userId_messageId: {
            userId: socket.userId,
            messageId,
          },
        },
        update: { emoji },
        create: {
          emoji,
          userId: socket.userId,
          messageId,
        },
      });

      io.to(message.conversationId).emit("message_reacted", {
        messageId,
        userId: socket.userId,
        emoji: reaction.emoji,
      });
    } catch (err) {
      console.error("react_message error:", err.message);
    }
  });
};
