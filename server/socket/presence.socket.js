import { PrismaClient } from "@prisma/client";
import redis from "../config/redis";

const prisma = new PrismaClient();

export const setupPresence = async (io, socket) => {
    await redis.set(`user:${socket.userId}`, socket.id);

    const memberships = await prisma.conversationMember.findMany({
        where: { userId: socket.userId }
    });
    
    memberships.forEach((m) => {
        socket.join(m.conversationId);
    });
    
    io.emit("user_online", socket.userId);

    socket.on("disconnect", async () => {
        await redis.del(`user${socket.userId}`);
        io.emit("user_offline", socket.userId);
    });
};