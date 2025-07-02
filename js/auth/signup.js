import { auth, db } from "../../config/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { checkIfLoggedIn } from "./authGuard.js";

// Check if user is already logged in
checkIfLoggedIn();

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

    // Store session information
    const user = userCred.user;
    sessionStorage.setItem("userToken", user.accessToken || "authenticated");
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userId", user.uid);

    // Redirect to home page
    window.location.href = "/views/home/index.html";
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
