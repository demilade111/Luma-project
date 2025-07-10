import { db, auth } from "../../config/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Helper to get form fields
function getProfileFields() {
  return {
    fullName: document.querySelector('input[placeholder="Add Name"]'),
    email: document.querySelector('input[placeholder="Add Email"]'),
    city: document.querySelector('select:has(option[value="Vancouver"])'),
    gamerLevel: document.querySelector('select:has(option[value="Pro"])'),
    month: document.querySelectorAll("select")[2],
    day: document.querySelectorAll("select")[3],
    year: document.querySelectorAll("select")[4],
    profileImg: document.querySelector(".bg-gray-600.rounded-full"),
  };
}

// Load user profile and populate form
async function loadUserProfile(user) {
  const fields = getProfileFields();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const data = userSnap.data();
  if (fields.fullName) fields.fullName.value = data.fullName || "";
  if (fields.email) fields.email.value = data.email || user.email || "";
  if (fields.city) fields.city.value = data.city || "";
  if (fields.gamerLevel) fields.gamerLevel.value = data.gamerLevel || "";
  if (fields.month) fields.month.value = data.birthdayMonth || "";
  if (fields.day) fields.day.value = data.birthdayDay || "";
  if (fields.year) fields.year.value = data.birthdayYear || "";
  if (fields.profileImg && data.profileImg) {
    fields.profileImg.style.backgroundImage = `url(${data.profileImg})`;
    fields.profileImg.innerHTML = "";
  }
}

// Save user profile to Firestore
async function saveUserProfile(user) {
  const fields = getProfileFields();
  const userRef = doc(db, "users", user.uid);
  const profileData = {
    fullName: fields.fullName.value,
    email: fields.email.value,
    city: fields.city.value,
    gamerLevel: fields.gamerLevel.value,
    birthdayMonth: fields.month.value,
    birthdayDay: fields.day.value,
    birthdayYear: fields.year.value,
  };
  // Profile image (if set)
  if (fields.profileImg && fields.profileImg.style.backgroundImage) {
    const url = fields.profileImg.style.backgroundImage;
    profileData.profileImg = url.slice(5, -2); // remove url(' and ')
  }
  await setDoc(userRef, profileData, { merge: true });
}

// Listen for auth and setup form
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  loadUserProfile(user);
  // Save handler
  const btn = document.querySelector('button[type="submit"]');
  if (btn) {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await saveUserProfile(user);
      alert("Profile updated successfully!");
    });
  }
});
