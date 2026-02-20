import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* CREATE 1-TO-1 CONVERSATION */
export const createOneToOneConversation = async (req, res) => {
  const userId = req.userId;
  const { targetUserId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!targetUserId) {
    return res.status(400).json({ message: "targetUserId is required" });
  }

  if (userId === targetUserId) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  try {
    // CORRECT EXISTING CONVERSATION CHECK
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // REATE NEW CONVERSATION
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
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (err) {
    console.error("createOneToOneConversation error:", err);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
};

/* CREATE GROUP CONVERSATION */
export const createGroupConversation = async (req, res) => {
  const userId = req.userId;
  const { name, memberIds } = req.body;

  if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({
      message: "Group name and at least 2 members are required",
    });
  }

  try {
    // Remove duplicates & creator
    const uniqueMembers = [...new Set(memberIds)].filter(
      (id) => id !== userId
    );

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        members: {
          create: [
            { userId }, // creator
            ...uniqueMembers.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error("createGroupConversation error:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
};

/* GET USER CONVERSATIONS */
export const getConversations = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
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

    return res.json(conversations);
  } catch (error) {
    console.error("getConversations error:", error);
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
};
