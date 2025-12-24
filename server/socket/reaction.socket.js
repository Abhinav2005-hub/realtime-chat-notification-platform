import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const setupReactions = (io, socket) => {
    socket.on(
        "react_message",
        async ({ messageId, emoji, conversationId }) => {
            try {
                const reaction = await prisma.reaction.upsert({
                    where: {
                        userId_messageId: {
                            userId: socket.userId,
                            messageId
                        }
                    },
                    update: { emoji },
                    create: {
                        emoji,
                        userId: socket.userId,
                        messageId
                    }
                });

                io.to(conversationId).emit("message_reacted", {
                    messageId,
                    userId: socket.userId,
                    emoji
                });
            } catch (err) {
                console.error("reaction error:", err.message);
            }
        }
    );
} 