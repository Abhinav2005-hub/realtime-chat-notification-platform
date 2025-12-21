import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createGroupConversation = async (req, res) => {
    const { name, memberIds } = req.body;

    const conversation = await prisma.conversation.create({
        data: {
            isGroup: true,
            members: {
                create: [
                    { userId: req.userId },
                    ...memberIds.map((id) => ({ userId: id }))
                ]
            }
        }
    });

    res.status(201).json(conversation);
};