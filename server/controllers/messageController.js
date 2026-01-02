import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      include: {
        reactions: true,
        replyTo: {
          select: { id: true, content: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
