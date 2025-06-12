// js/firebase-config.js
import { initializeApp } from "firebase/app";

console.log("Firebase config loading");

const firebaseConfig = {
  apiKey: "AIzaSyChm-EbSEcobq3bIy1APiyzSTj4miZRCKY",
  authDomain: "luma-project-a26e6.firebaseapp.com",
  projectId: "luma-project-a26e6",
  storageBucket: "luma-project-a26e6.appspot.com", // fixed domain
  messagingSenderId: "482552513484",
  appId: "1:482552513484:web:fce5a5fb0441082f72d369",
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app };
