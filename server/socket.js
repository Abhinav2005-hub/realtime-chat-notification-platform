import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setupSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            method: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next (new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.uderId;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.userId);

        //Join conversation room
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`User joined conversation ${conversationId}`);
        });

        // send message 
        socket.on("send_message", async ({ conversationId, content }) => {
            try {
                const message = await prisma.message.create({
                    data: {
                        content,
                        senderId: socket.userId,
                        conversationId
                    }
                });

                io.to(conversationId).emit("receive_message", {
                    id: message.id,
                    content: message.content,
                    senderId: message.senderId,
                    createdAt: message.createdAt
                });
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.userId);
        });
    });
};