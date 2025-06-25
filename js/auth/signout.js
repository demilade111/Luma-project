import { auth } from "../../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.addEventListener("components-injected", () => {
  const signOutBtn = document.getElementById("signOut");

  if (!signOutBtn) {
    return;
  }

  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/views/auth/login.html";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  });
});
