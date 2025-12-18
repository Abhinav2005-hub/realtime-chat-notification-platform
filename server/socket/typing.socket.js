export const setupTyping = (io, socket) => {
    socket.on("typing", ({ conversationId }) => {
        socket.to(conversationId).emit("user_typing", socket.userId);
    });

    socket.on("stop_typing", ({ conversationId }) => {
        socket.to(conversationId).emit("stop_typing", socket.userId);
    });
};