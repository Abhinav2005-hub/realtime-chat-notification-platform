import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// create 1 to 1 conversation
export const createGroupConversation = async (req, res) => {
    const { userId } = req.body;
    const currentUserId = req.user.id;

// check if conversation already exist
    const existing = await prisma.conversation.findFirst({
        where: {
            members: {
                every: {
                    userId: { in: [currentUserId, userId] }
                }
            }
        }
    });

    if (existing) {
        return res.json(existing);
    }

    const conversation = await prisma.conversation.create({
        data: {
            isGroup: true,
            members: {
                create: [
                    { userId: req.userId },
                    { userId }
                ]
            }
        }
    });

    res.status(201).json(conversation);
};

export const getConversations = async (req, res) => {
    const userId = req.user.id;

    const conversations = await prisma.conversations.findMany({
        where: {
            members: {
                some: { userId }
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, email: true }
                    }
                }
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        }
    });

    res.json(conversations);
};