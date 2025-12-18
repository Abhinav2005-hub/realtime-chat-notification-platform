import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setupSeen = (io, socket) => {
    socket.on("message_seen", async ({ conversationId }) => {
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: socket.userId },
                status: { not: "seen" }
            },
            data: { status: "seen" }
        });

        socket.to(conversationId).emit("message_seen", { conversationId });
    });
};