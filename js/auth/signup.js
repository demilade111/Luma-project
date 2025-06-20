// js/register.js

import { auth, db } from "../../config/firebase.js"; // ✅ use correct path and .js extension
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.querySelector("form");
const errorMsg = document.createElement("p");
errorMsg.className = "text-sm text-red-600";
form.appendChild(errorMsg);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!username || !email || !password) {
    errorMsg.textContent = "All fields are required.";
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      errorMsg.textContent = "Username already exists.";
      return;
    }

    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCred.user.uid;

    await addDoc(usersRef, {
      uid,
      username,
      email,
    });

    alert("Account created. Redirecting to login...");
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      errorMsg.textContent = "Email is already registered.";
    } else if (err.code === "auth/weak-password") {
      errorMsg.textContent = "Password must be at least 6 characters.";
    } else {
      errorMsg.textContent = "Registration failed.";
    }
  }
});
