import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CREATE 1-TO-1 CONVERSATION
 */
export const createOneToOneConversation = async (req, res) => {
  const userId = req.userId;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ message: "targetUserId is required" });
  }

  if (userId === targetUserId) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  try {
    // check existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: {
              in: [userId, targetUserId],
            },
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId },
            { userId: targetUserId },
          ],
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (err) {
    console.error("createOneToOneConversation error:", err);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
};

//create group conversation 
export const createGroupConversation = async (req, res) => {
  const userId = req.userId;
  const { name, memberIds } = req.body;

  if (!name || !memberIds || memberIds.length < 2) {
    return res.status(200).json({
      message: "Group name and atleast 2 members are required",
    });
  }

 
  try {
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        members: {
          create: [
            { userId }, // creator
            ...memberIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (err) {
    console.error("createGroupConversation error:", err);
    return res.status(500).json({ message: "Failed to create group" });
  }
};

/**
 * GET ALL CONVERSATIONS OF LOGGED-IN USER
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};
