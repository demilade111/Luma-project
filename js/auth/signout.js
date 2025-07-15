import { auth } from "../../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { clearSession } from "./authGuard.js";

// Function to handle sign out
async function handleSignOut() {
  try {
    await signOut(auth);
    clearSession(); // Clear session storage
    // Redirect to login page
    window.location.href = "/views/auth/login.html";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Attach sign out handler for both sidebar and navbar buttons
function attachSignOutHandler() {
  const signOutBtn = document.getElementById("signOut");
  if (signOutBtn) signOutBtn.addEventListener("click", handleSignOut);
  const signOutNavBtn = document.getElementById("signOutNav");
  if (signOutNavBtn) signOutNavBtn.addEventListener("click", handleSignOut);
}
document.addEventListener("DOMContentLoaded", attachSignOutHandler);
window.addEventListener("components-injected", attachSignOutHandler);
