 
 import { auth } from "../../config/firebase.js"; //
 import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
 
 document.addEventListener("click", (e) => {

    const signOutBtn = e.target.closest("#signOut")

    if (signOutBtn) {
            console.log("SignOut button CLICKED", signOutBtn);
           signOut(auth)
           .then(() => {
            console.log("Signed out successfully.");
               window.location.href = "/views/auth/login.html"
           })
            .catch((error) => {
                console.error("Error signing out:", error);
           });
   }
});