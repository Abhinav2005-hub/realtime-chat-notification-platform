import firebaseAdmin from "../config/firebase.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sendNotification = async (userId, title, body) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user?.fcmToken) return;

  await firebaseAdmin.messaging().send({
    token: user.fcmToken,
    notification: { title, body }
  });

  await prisma.notification.create({
    data: { userId, title, body }
  });
};
