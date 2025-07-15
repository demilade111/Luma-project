import { auth, db } from "../../config/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc as firestoreDoc,
  setDoc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { checkIfLoggedIn } from "./authGuard.js";

// Check if user is already logged in
checkIfLoggedIn();

const form = document.querySelector("form");
const errorMsg = document.createElement("p");
errorMsg.className = "text-sm text-red-600";
form.appendChild(errorMsg);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  // Get selected categories
  const categories = Array.from(
    form.querySelectorAll('input[name="categories"]:checked')
  ).map((cb) => cb.value);

  if (!username || !email || !password) {
    errorMsg.textContent = "All fields are required.";
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      errorMsg.textContent = "Username already exists.";
      return;
    }

    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCred.user.uid;

    // Use uid as document ID instead of auto-generating
    await setDoc(firestoreDoc(db, "users", uid), {
      uid,
      username,
      email,
      categories, // Save selected categories
    });

    // Store session information
    const user = userCred.user;
    sessionStorage.setItem("userToken", user.accessToken || "authenticated");
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("userId", user.uid);

    // Redirect to home page
    window.location.href = "/views/home/index.html";
  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      errorMsg.textContent = "Email is already registered.";
    } else if (err.code === "auth/weak-password") {
      errorMsg.textContent = "Password must be at least 6 characters.";
    } else {
      errorMsg.textContent = "Registration failed.";
    }
  }
});

// Utility: Add default categories to all existing users if missing
export async function addDefaultCategoriesToUsers(
  defaultCategories = ["Strategy", "Family"]
) {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    if (
      !data.categories ||
      !Array.isArray(data.categories) ||
      data.categories.length === 0
    ) {
      await updateDoc(firestoreDoc(db, "users", userDoc.id), {
        categories: defaultCategories,
      });
    }
  }
  console.log("Default categories added to users where missing.");
}

// Migration utility: Fix users with auto-generated document IDs
// export async function migrateUsersToUidDocumentIds() {
//   console.log("Starting user migration to uid-based document IDs...");
//   const usersRef = collection(db, "users");
//   const snapshot = await getDocs(usersRef);

//   for (const userDoc of snapshot.docs) {
//     const data = userDoc.data();
//     const uid = data.uid;

//     // Skip if this document already uses uid as document ID
//     if (userDoc.id === uid) {
//       console.log(`User ${uid} already has correct document ID`);
//       continue;
//     }

//     // Check if a document with uid as ID already exists
//     const existingUserDoc = await getDoc(firestoreDoc(db, "users", uid));
//     if (existingUserDoc.exists()) {
//       console.log(
//         `User document with uid ${uid} already exists, deleting old document`
//       );
//       await deleteDoc(firestoreDoc(db, "users", userDoc.id));
//       continue;
//     }

//     // Create new document with uid as ID
//     console.log(`Migrating user ${uid} from document ${userDoc.id}`);
//     await setDoc(firestoreDoc(db, "users", uid), data);

//     // Delete old document
//     await deleteDoc(firestoreDoc(db, "users", userDoc.id));
//   }

//   console.log("User migration completed!");
// }

// TEMP: Run the utility to add default categories to all users
addDefaultCategoriesToUsers();

// TEMP: Run migration for existing users (uncomment when needed)
// migrateUsersToUidDocumentIds();
