export const setupMessaging = (io, socket) => {
    socket.on("send_message", async ({ conversationId, content }) => {
      try {
        if (!conversationId || !content?.trim()) return;
  
        if (!socket.userId) {
          console.error("Socket userId missing");
          return;
        }
  
        // Save message in DB
        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.userId,
            conversationId,
            status: "sent",
          },
        });
  
        // Update conversation updatedAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
  
        // Emit message to room
        io.to(conversationId).emit("receive_message", {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
          status: "delivered",
        });
  
        // Update status → delivered
        await prisma.message.update({
          where: { id: message.id },
          data: { status: "delivered" },
        });
  
      } catch (error) {
        console.error("send_message error:", error);
      }
    });
  };
  