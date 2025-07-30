import { auth } from "../config/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getCurrentUser } from "./auth/authGuard.js";

// Function to check and display auth status
function checkAuthStatus() {


  // Check Firebase auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
     
    } else {

    }
  });

  // Check session storage
  const sessionUser = getCurrentUser();


  // Check if any session data exists
  const hasSessionData =
    sessionUser.token || sessionUser.email || sessionUser.userId;

  
}

// Run the check when the script loads
checkAuthStatus();

// Export for use in other scripts
export { checkAuthStatus };
