import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: { not: req.userId },
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};