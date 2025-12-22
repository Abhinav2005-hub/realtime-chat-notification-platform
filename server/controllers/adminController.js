import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const blockUser = async (req, res) => {
    const { userId } = req.body;
    await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: true }
    });
    res.json({ message: "User blocked" });
};

export const unblockUser = async (req, res) => {
    const { userId } = req.body;
    await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: flase }
    });
    res.json({ message: "User unblocked" });
};

export const deleteMessage = async (req, res) => {
    const { messageId } = req.body;
    await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true }
    });
    res.json({ message: "Message deleted" }); 
};