import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import { setupSocket } from "./socket/socket.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

app.get("/", (req,res) => {
    res.send("Backend is running");
});

const server = http.createServer(app);

// Socket.Io setup
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});