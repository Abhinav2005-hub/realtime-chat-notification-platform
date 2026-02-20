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
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

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
            user: { select: { id: true, name: true, email: true } },
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
    const uniqueMembers = [...new Set(memberIds)].filter(
      (id) => id !== userId
    );

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        createdBy: userId,
        members: {
          create: [
            { userId }, // admin
            ...uniqueMembers.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
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

/* RENAME GROUP */
export const renameGroup = async (req, res) => {
  const { conversationId } = req.params;
  const { newName } = req.body;

  if (!newName) {
    return res.status(400).json({ message: "New name required" });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.createdBy !== req.userId) {
      return res.status(403).json({ message: "Only admin can rename group" });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { name: newName },
    });

    return res.json(updated);
  } catch (error) {
    console.error("renameGroup error:", error);
    return res.status(500).json({ message: "Failed to rename group" });
  }
};

/* ADD MEMBER */
export const addGroupMember = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.createdBy !== req.userId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    await prisma.conversationMember.create({
      data: {
        conversationId,
        userId,
      },
    });

    return res.json({ message: "Member added" });
  } catch (error) {
    console.error("addGroupMember error:", error);
    return res.status(500).json({ message: "Failed to add member" });
  }
};

/* REMOVE MEMBER */
export const removeGroupMember = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.createdBy !== req.userId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    await prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });

    return res.json({ message: "Member removed" });
  } catch (error) {
    console.error("removeGroupMember error:", error);
    return res.status(500).json({ message: "Failed to remove member" });
  }
};

/* LEAVE GROUP */
export const leaveGroup = async (req, res) => {
  const { conversationId } = req.params;

  try {
    await prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId: req.userId,
      },
    });

    return res.json({ message: "You left the group" });
  } catch (error) {
    console.error("leaveGroup error:", error);
    return res.status(500).json({ message: "Failed to leave group" });
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
        creator: {
          select: { id: true, name: true, email: true },
        },
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