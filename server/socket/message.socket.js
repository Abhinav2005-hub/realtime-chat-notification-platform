import { PrismaClient } from "@prisma/client";
import { redis } from "../config/redis";

const prisma = new PrismaClient();

export const setupMessaging = (io, socket) => {
    socket.on ("send_message", async ({ conversationId, content}) => {
        const message = await prisma.message.create({
            data: {
                content, 
                senderId: socket.userId,
                conversationId,
                status: "sent"
            }
        });

        io.to(conversationId).emit("receive_message", {
            ...message,
            status: "delivered"
        });

        await prisma.message.update({
            where: { id: message.id },
            data: { ststus: "delivered" }   
        });
    });
};