import { auth } from "../../config/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Authentication guard for protected pages
export function initAuthGuard() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, store session info
        sessionStorage.setItem(
          "userToken",
          user.accessToken || "authenticated"
        );
        sessionStorage.setItem("userEmail", user.email);
        sessionStorage.setItem("userId", user.uid);
        resolve(user);
      } else {
        // User is not authenticated, redirect to login
        sessionStorage.clear();
        window.location.href = "/views/auth/login.html";
      }
    });
  });
}

// Check if user is currently logged in (for login/signup pages)
export function checkIfLoggedIn() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in, redirect to home
        window.location.href = "/views/home/index.html";
      } else {
        resolve(null);
      }
    });
  });
}

// Get current user session info
export function getCurrentUser() {
  return {
    token: sessionStorage.getItem("userToken"),
    email: sessionStorage.getItem("userEmail"),
    userId: sessionStorage.getItem("userId"),
  };
}

// Clear user session
export function clearSession() {
  sessionStorage.clear();
}
