import { db, auth } from "../config/firebase.js";
import {
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let selectedCategories = [];

window.toggleCategory = (cat) => {
  const index = selectedCategories.indexOf(cat);
  if (index > -1) {
    selectedCategories.splice(index, 1);
  } else {
    selectedCategories.push(cat);
  }

  const classesToToggle = [
    "bg-[#4A4F6C]",
    "to-[#F59275]",
    "from-[#F1647A]",
    "transition-colors",
    "shadow",
    "shadow-gray-600",
    "bg-gradient-to-r",
  ];

  document.querySelectorAll(`[data-category="${cat}"]`).forEach((el) => {
    classesToToggle.forEach((cls) => el.classList.toggle(cls));
  });
};


// Updated loadUserCategories to wait for auth state properly
function loadUserCategories() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user logged in");
        resolve();
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.categories && Array.isArray(data.categories)) {
            selectedCategories = data.categories;
            console.log("Loaded categories:", selectedCategories);

            // Mark saved categories active in the UI
            selectedCategories.forEach((cat) => {
              document.querySelectorAll(`[data-category="${cat}"]`).forEach((el) => {
                el.classList.add(
                    "to-[#F59275]",
                    "from-[#F1647A]",
                    "transition-colors",
                    "shadow",
                    "shadow-gray-600",
                    "bg-gradient-to-r"
                );
              });
            });
          }
        }
      } catch (err) {
        console.error("Error loading user categories:", err);
      } finally {
        resolve();
      }
    });
  });
}

window.saveCategories = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save preferences.");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { categories: selectedCategories });
    alert("Categories updated!");
  } catch (err) {
    console.error("Error updating categories:", err);
    alert("Error updating categories.");
  }
};

export { loadUserCategories };
