// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dhanajalee-mern-app.firebaseapp.com",
  projectId: "dhanajalee-mern-app",
  storageBucket: "dhanajalee-mern-app.firebasestorage.app",
  messagingSenderId: "1068621903480",
  appId: "1:1068621903480:web:45d1caf80d7c13c72d5f8d",
  measurementId: "G-MD4HJJSQLP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);  // ✅ Export storage
export default app;
