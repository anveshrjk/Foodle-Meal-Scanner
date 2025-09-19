// lib/firebase/client.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-Oo1I3GFufsuIZc1kZYo6OqvzDchjnyw",
  authDomain: "foodle-meal-scanner.firebaseapp.com",
  projectId: "foodle-meal-scanner",
  storageBucket: "foodle-meal-scanner.firebasestorage.app",
  messagingSenderId: "92634316810",
  appId: "1:92634316810:web:233235be7411e98c845ff3",
  measurementId: "G-2SE4CSQV4G"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the auth instance to be used in other parts of your app
export const auth = getAuth(app);