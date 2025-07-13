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
  const fields = {
    username: document.querySelector("#username-input"),
    email: document.querySelector("#email-input"),
    categories: document.querySelector("#categories-input"),
    city: document.querySelector("#city-select"),
    gamerLevel: document.querySelector("#gamer-level-select"),
    month: document.querySelector("#birthday-month"),
    day: document.querySelector("#birthday-day"),
    year: document.querySelector("#birthday-year"),
    profileImg: document.querySelector("#profile-image"),
  };

  console.log("Profile fields found:", {
    username: !!fields.username,
    email: !!fields.email,
    categories: !!fields.categories,
    city: !!fields.city,
    gamerLevel: !!fields.gamerLevel,
    month: !!fields.month,
    day: !!fields.day,
    year: !!fields.year,
    profileImg: !!fields.profileImg,
  });

  return fields;
}

// Show loading state
function showLoading() {
  const btn = document.querySelector("#update-profile-btn");
  if (btn) {
    btn.textContent = "Loading...";
    btn.disabled = true;
  }
}

// Hide loading state
function hideLoading() {
  const btn = document.querySelector("#update-profile-btn");
  if (btn) {
    btn.textContent = "Update Profile";
    btn.disabled = false;
  }
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

function testProfileFunctionality() {
  console.log("=== Profile Functionality Test ===");
  console.log("Current URL:", window.location.href);
  console.log("Document ready state:", document.readyState);
  console.log(
    "Firebase auth state:",
    auth.currentUser ? "User logged in" : "No user"
  );
  const fields = getProfileFields();
  const missingFields = Object.entries(fields)
    .filter(([name, element]) => !element)
    .map(([name]) => name);
  if (missingFields.length > 0) {
    console.error("Missing form fields:", missingFields);
  } else {
    console.log("All form fields found successfully!");
  }
  try {
    console.log("Firebase db instance:", !!db);
    console.log("Firebase auth instance:", !!auth);
  } catch (error) {
    console.error("Firebase not accessible:", error);
  }
}

// Load user profile and populate form
async function loadUserProfile(user) {
  try {
    console.log("Loading profile for user:", user.uid);
    const fields = getProfileFields();
    if (!fields.username || !fields.email) {
      console.error("Profile form fields not found");
      showError("Profile form not properly loaded");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("User data loaded:", data);
      if (fields.username) {
        console.log("Firestore username value:", data.username);
        fields.username.value = data.username || "";
        console.log("Set username field to:", fields.username.value);
      } else {
        console.error("Username input field not found in DOM");
      }
      if (fields.email) fields.email.value = data.email || user.email || "";
      if (fields.categories)
        fields.categories.value = Array.isArray(data.categories)
          ? data.categories.join(", ")
          : "";
      if (fields.city) fields.city.value = data.city || "";
      if (fields.gamerLevel) fields.gamerLevel.value = data.gamerLevel || "";
      if (fields.month) fields.month.value = data.birthdayMonth || "";
      if (fields.day) fields.day.value = data.birthdayDay || "";
      if (fields.year) fields.year.value = data.birthdayYear || "";
      if (fields.profileImg && data.profileImg) {
        fields.profileImg.style.backgroundImage = `url(${data.profileImg})`;
        fields.profileImg.style.backgroundSize = "cover";
        fields.profileImg.style.backgroundPosition = "center";
        fields.profileImg.innerHTML = "";
      }
      showSuccess("Profile loaded successfully!");
    } else {
      console.log("No existing profile found, starting fresh");
      if (fields.email) fields.email.value = user.email || "";
      showSuccess("New profile ready to be created!");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    showError("Failed to load profile data: " + error.message);
  }
}

// Save user profile to Firestore
async function saveUserProfile(user) {
  try {
    showLoading();
    console.log("Saving profile for user:", user.uid);
    const fields = getProfileFields();
    const userRef = doc(db, "users", user.uid);
    const categoriesArr = fields.categories?.value
      ? fields.categories.value
          .split(",")
          .map((cat) => cat.trim())
          .filter(Boolean)
      : [];
    const profileData = {
      username: fields.username?.value || "",
      email: fields.email?.value || user.email || "",
      categories: categoriesArr,
      city: fields.city?.value || "",
      gamerLevel: fields.gamerLevel?.value || "",
      birthdayMonth: fields.month?.value || "",
      birthdayDay: fields.day?.value || "",
      birthdayYear: fields.year?.value || "",
      updatedAt: new Date(),
    };
    if (fields.profileImg && fields.profileImg.style.backgroundImage) {
      const url = fields.profileImg.style.backgroundImage;
      if (url !== "none") {
        profileData.profileImg = url.slice(5, -2);
      }
    }
    console.log("Saving profile data:", profileData);
    await setDoc(userRef, profileData, { merge: true });
    hideLoading();
    showSuccess("Profile updated successfully!");
  } catch (error) {
    console.error("Error saving profile:", error);
    hideLoading();
    showError("Failed to update profile: " + error.message);
  }
}

function initProfile() {
  console.log("Initializing profile functionality...");
  testProfileFunctionality();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupProfile);
  } else {
    setupProfile();
  }
}

function setupProfile() {
  console.log("Setting up profile event listeners...");
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log("No user authenticated, redirecting to login...");
      window.location.href = "/views/auth/login.html";
      return;
    }
    console.log("User authenticated:", user.email);
    loadUserProfile(user);
    const btn = document.querySelector("#update-profile-btn");
    if (btn) {
      console.log("Update profile button found, setting up event listener");
      btn.replaceWith(btn.cloneNode(true));
      const newBtn = document.querySelector("#update-profile-btn");
      newBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Update profile button clicked");
        await saveUserProfile(user);
      });
    } else {
      console.error("Update profile button not found");
    }
  });
}

initProfile();
