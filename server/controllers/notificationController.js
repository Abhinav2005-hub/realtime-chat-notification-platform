import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const saveFcmToken = async (req, res) => {
    const { fcmToken } = req.body;

    await prisma.user.update({
        where: { id: req.user.Id },
        data: { fcmToken }
    });

    res.json({ message: "FCM token saved" });
};