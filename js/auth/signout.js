import { auth } from "../../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { clearSession } from "./authGuard.js";

// Function to handle sign out
async function handleSignOut() {
  try {
    await signOut(auth);
    clearSession(); // Clear session storage
    window.location.href = "/views/auth/login.html";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Attach sign out handler when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const signOutBtn = document.getElementById("signOut");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", handleSignOut);
  }
});

// Also attach when components are injected (for sidebar sign out)
window.addEventListener("components-injected", () => {
  const signOutBtn = document.getElementById("signOut");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", handleSignOut);
  }
});
