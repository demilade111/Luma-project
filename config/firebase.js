
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChm-EbSEcobq3bIy1APiyzSTj4miZRCKY",
  authDomain: "luma-project-a26e6.firebaseapp.com",
  projectId: "luma-project-a26e6",
  storageBucket: "luma-project-a26e6.appspot.com",
  messagingSenderId: "482552513484",
  appId: "1:482552513484:web:fce5a5fb0441082f72d369",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
