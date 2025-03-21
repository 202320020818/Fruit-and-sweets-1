// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "projectmern-424e6.firebaseapp.com",
  projectId: "projectmern-424e6",
  storageBucket: "projectmern-424e6.firebasestorage.app",
  messagingSenderId: "841285728455",
  appId: "1:841285728455:web:951ac8dc765d0ebbf0e6e2",
  measurementId: "G-51R6YFG4NR",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
