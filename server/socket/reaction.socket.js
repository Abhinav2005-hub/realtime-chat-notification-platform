import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setupReactions = (io, socket) => {
  socket.on("add_reaction", async ({ messageId, emoji }) => {
    try {
      if (!messageId || !emoji) return;

      // check if already exists
      const existing = await prisma.reaction.findFirst({
        where: {
          messageId,
          userId: socket.userId,
          emoji,
        },
      });

      if (existing) {
        // remove reaction if clicked again
        await prisma.reaction.delete({
          where: { id: existing.id },
        });
      } else {
        // add reaction
        await prisma.reaction.create({
          data: {
            emoji,
            userId: socket.userId,
            messageId,
          },
        });
      }

      // fetch updated reactions
      const reactions = await prisma.reaction.findMany({
        where: { messageId },
        include: { user: true },
      });

      io.emit("reaction_updated", {
        messageId,
        reactions,
      });
    } catch (err) {
      console.error("add_reaction error:", err.message);
    }
  });
};
