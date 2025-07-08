import { auth } from "../../config/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkIfLoggedIn } from "./authGuard.js";

// Check if user is already logged in
checkIfLoggedIn();

// Get form elements
const form = document.querySelector("form");
const errorMsg = document.createElement("p");
errorMsg.className = "text-red-500 text-sm mt-2";
form.appendChild(errorMsg);

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = form.username.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    errorMsg.textContent = "All fields are required.";
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Store session information
    sessionStorage.setItem("userToken", user.accessToken || "authenticated");
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userId", user.uid);

    // Redirect to home page
    window.location.href = "/views/home/index.html";
  } catch (err) {
    console.error(err);
    if (err.code === "auth/user-not-found") {
      errorMsg.textContent = "No account found with this email.";
    } else if (err.code === "auth/wrong-password") {
      errorMsg.textContent = "Incorrect password.";
    } else if (err.code === "auth/invalid-email") {
      errorMsg.textContent = "Invalid email format.";
    } else {
      errorMsg.textContent = "Login failed. Please try again.";
    }
  }
});
