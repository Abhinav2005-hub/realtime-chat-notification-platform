import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
    fs.readFileSync("./firebase-service-account.json", "utf8")
);

admin.initializeApp({
    credentials: admin.credential.cert(serviceAccount)
});

export const firebaseAdmin = admin;