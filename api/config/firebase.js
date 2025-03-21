import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccount from "../utils/projectmern-424e6-firebase-adminsdk-fbsvc-ae32af5b7a.json" assert { type: "json" };

dotenv.config();

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully!");
} catch (error) {
  console.error("❌ Firebase Initialization Failed:", error);
}

export default admin;
