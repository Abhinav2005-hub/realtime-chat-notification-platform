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

      // emit realtime message
      io.to(conversationId).emit("receive_message", {
        id: message.id,
        content: message.content,
        sender: message.sender,
        senderId: message.senderId,
        conversationId: message.conversationId,
        replyTo: message.replyTo,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        status: "delivered",
        reactions: message.reactions,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
      });

      // update message status to delivered in DB
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "delivered" },
      });

      // notify offline members
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
  socket.on("edit_message", async ({ messageId, content }) => {
    try {
      if (!messageId || !content?.trim()) return;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) return;

      // only sender can edit
      if (message.senderId !== socket.userId) {
        socket.emit("error_message", "You can only edit your own messages");
        return;
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          isEdited: true,
        },
      });

      io.to(updated.conversationId).emit("message_edited", {
        messageId: updated.id,
        content: updated.content,
        isEdited: updated.isEdited,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error("edit_message error:", error);
    }
  });

  /* DELETE MESSAGE */
  socket.on("delete_message", async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) return;

      // only sender can delete
      if (message.senderId !== socket.userId) {
        socket.emit("error_message", "You can only delete your own messages");
        return;
      }

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
    } catch (error) {
      console.error("delete_message error:", error);
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
    } catch (error) {
      console.error("mark_seen error:", error);
    }
  });

  /* TYPING INDICATOR */
  socket.on("typing", ({ conversationId }) => {
    try {
      if (!conversationId) return;

      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
      });
    } catch (error) {
      console.error("typing error:", error);
    }
  });

  /* REACT MESSAGE */
  socket.on("react_message", async ({ messageId, emoji }) => {
    try {
      if (!messageId || !emoji) return;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { conversationId: true },
      });

      if (!message) return;

      // check if user already reacted
      const existingReaction = await prisma.reaction.findFirst({
        where: {
          messageId,
          userId: socket.userId,
        },
      });

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          // toggle remove reaction
          await prisma.reaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          // update emoji
          await prisma.reaction.update({
            where: { id: existingReaction.id },
            data: { emoji },
          });
        }
      } else {
        // create new reaction
        await prisma.reaction.create({
          data: {
            messageId,
            userId: socket.userId,
            emoji,
          },
        });
      }

      // updated reactions list
      const updatedReactions = await prisma.reaction.findMany({
        where: { messageId },
        select: {
          id: true,
          emoji: true,
          userId: true,
        },
      });

      io.to(message.conversationId).emit("message_reaction_updated", {
        messageId,
        reactions: updatedReactions,
      });
    } catch (error) {
      console.error("react_message error:", error);
    }
  });
};

