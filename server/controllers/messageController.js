import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
    const { conversationID } = req.params;

    try {
        const message = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" }
        });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};