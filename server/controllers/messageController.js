import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { cursor, limit = 20 } = req.query;

  try {
    const take = Number(limit);

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false
      },
      orderBy: {
        createdAt: "desc"
      },
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      })
    });

    const nextCursor =
      messages.length === take
        ? messages[messages.length - 1].id
        : null;

    res.json({
      messages: [...messages].reverse(), 
      nextCursor
    });

  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markMessagesSeen = async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.userId;
  
  try {
    await prisma.message.updateMany ({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: "seen" }
      },
      data: { status: "seen" }
    });

    res.json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId !== req.userId) {
      return res.status(403).json({ message: "Not allowed to delete this message" });
    } 

    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: "Message deleted"
      }
    });

    res.json(deletedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content,
        isEdited: true
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};