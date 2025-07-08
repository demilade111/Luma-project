import { auth } from "../config/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getCurrentUser } from "./auth/authGuard.js";

// Function to check and display auth status
function checkAuthStatus() {
  console.log("=== Authentication Status Check ===");

  // Check Firebase auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Firebase Auth: User is logged in");
      console.log("User ID:", user.uid);
      console.log("Email:", user.email);
      console.log("Display Name:", user.displayName);
    } else {
      console.log("❌ Firebase Auth: No user logged in");
    }
  });

  // Check session storage
  const sessionUser = getCurrentUser();
  console.log("\n=== Session Storage ===");
  console.log("User Token:", sessionUser.token);
  console.log("User Email:", sessionUser.email);
  console.log("User ID:", sessionUser.userId);

  // Check if any session data exists
  const hasSessionData =
    sessionUser.token || sessionUser.email || sessionUser.userId;
  if (hasSessionData) {
    console.log("✅ Session Storage: User data found");
  } else {
    console.log("❌ Session Storage: No user data found");
  }

  // Display current page info
  console.log("\n=== Current Page ===");
  console.log("URL:", window.location.href);
  console.log("Page Title:", document.title);
}

// Run the check when the script loads
checkAuthStatus();

// Export for use in other scripts
export { checkAuthStatus };
