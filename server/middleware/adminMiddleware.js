import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const requireAdmin = async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId }
    });

    if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};