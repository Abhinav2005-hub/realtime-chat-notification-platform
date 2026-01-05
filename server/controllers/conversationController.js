import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create 1-to-1 conversation
 */
export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    // check existing 1-to-1 conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: { in: [req.userId, userId] }
          }
        }
      },
      include: { members: true }
    });

    if (existing) {
      return res.json(existing);
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [{ userId: req.userId }, { userId }]
        }
      },
      include: { members: true }
    });

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all conversations of logged-in user
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId: req.userId }
        }
      },
      include: {
        members: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

/**
 * Create group conversation
 */
export const createGroupConversation = async (req, res) => {
  try {
    const { name, members } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        members: {
          create: [
            { userId: req.userId },
            ...members.map((id) => ({ userId: id }))
          ]
        }
      }
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const createOneToOneConversation = async (req, res) => {
  const userId = req.userId;
  const { otherUserId } = req.body;

  if (userId == otherUserId) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  try {
    // check if conversation already exist
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: {
              in: [userId, otherUserId]
            }
          }
        }
      }
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
            { userId: otherUserId }
          ]
        }
      }
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
