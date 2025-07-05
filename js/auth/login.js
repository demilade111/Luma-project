// js/login.js

import { auth } from "../../config/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkIfLoggedIn } from "./authGuard.js";

// Check if user is already logged in
checkIfLoggedIn();

// Select the form and inject error message container
const form = document.querySelector("form");
const errorMsg = document.createElement("p");
errorMsg.className = "text-sm text-red-600 mt-2";
form.appendChild(errorMsg);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!username || !password) {
    errorMsg.textContent = "Both fields are required.";
    return;
  }

  try {
    // In this case, we assume `username` is actually the email.
    const userCred = await signInWithEmailAndPassword(auth, username, password);
    const user = userCred.user;

    // Store session information
    sessionStorage.setItem("userToken", user.accessToken || "authenticated");
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userId", user.uid);

    // Redirect to home page
    window.location.href = "/views/home/index.html";
  } catch (err) {
    console.error(err);
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password"
    ) {
      errorMsg.textContent = "Invalid username or password.";
    } else if (err.code === "auth/invalid-email") {
      errorMsg.textContent = "Invalid email format.";
    } else {
      errorMsg.textContent = "Login failed. Please try again.";
    }
  }
});
