import { auth } from "../../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { clearSession } from "./authGuard.js";

// Function to handle sign out
async function handleSignOut() {
  console.log("Sign out button clicked");
  try {
    await signOut(auth);
    clearSession(); // Clear session storage
    console.log("Successfully signed out, redirecting to login...");
    // Redirect to login page
    window.location.href = "/views/auth/login.html";
  } catch (error) {
    console.error("Error signing out:", error);
    alert("Error signing out. Please try again.");
  }
}

// Attach sign out handler for both sidebar and navbar buttons
function attachSignOutHandler() {
  console.log("Attaching sign out handlers...");

  const signOutBtn = document.getElementById("signOut");
  if (signOutBtn) {
    console.log("Found signOut button, attaching handler");
    signOutBtn.addEventListener("click", handleSignOut);
  } else {
    console.log("signOut button not found");
  }

  const signOutNavBtn = document.getElementById("signOutNav");
  if (signOutNavBtn) {
    console.log("Found signOutNav button, attaching handler");
    signOutNavBtn.addEventListener("click", handleSignOut);
  } else {
    console.log("signOutNav button not found");
  }
}

// Try to attach handlers when DOM is ready
document.addEventListener("DOMContentLoaded", attachSignOutHandler);

// Try to attach handlers when components are injected
window.addEventListener("components-injected", attachSignOutHandler);

// Also try to attach handlers after a short delay to catch any late-loading components
setTimeout(attachSignOutHandler, 1000);
