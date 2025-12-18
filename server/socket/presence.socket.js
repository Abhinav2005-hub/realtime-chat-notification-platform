import redis from "../config/redis";

export const setupPresence = (io, socket) => {
    redis.set(`user:${socket.userId}`, socket.id);
    io.emit("user_online", socket.userId);

    socket.on("disconnect", async () => {
        await redis.del(`user${socket.userId}`);
        io.emit("user_offline", socket.userId);
    });
};