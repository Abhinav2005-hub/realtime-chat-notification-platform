import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/:conversationId", protect, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(messages);
  } catch (error) {
    console.error("get messages error:", error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;
