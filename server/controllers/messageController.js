import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" }
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
