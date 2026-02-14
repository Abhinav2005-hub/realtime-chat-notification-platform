import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMessages, markMessagesSeen, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:conversationId", protect, getMessages);

router.post("/seen", protect, markMessagesSeen);

router.delete("/:messageId", protect, deleteMessage);

export default router;
