import { db } from "../config/firebase.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Helper to get the bookmarks container
function getBookmarkContainer() {
  return document.getElementById("bookmark-list");
}

// Renders a bookmark card
function createBookmarkCard(bookmark) {
  const div = document.createElement("div");
  div.className =
    "bg-white border border-black rounded-2xl p-4 shadow flex flex-col justify-between";
  div.innerHTML = `
    <img src="${bookmark.image}" alt="${bookmark.title}" class="w-full h-40 object-cover rounded-xl mb-4">
    <h2 class="text-xl font-semibold text-gray-800">${bookmark.title}</h2>
  `;
  return div;
}

// Load bookmarks from Firestore
async function loadBookmarks(user) {
  const container = getBookmarkContainer();
  container.innerHTML = `<p class="text-gray-500">Loading...</p>`;

  try {
    const ref = collection(db, "users", user.uid, "bookmarks");
    const snap = await getDocs(ref);
    container.innerHTML = "";

    if (snap.empty) {
      container.innerHTML = `<p class="text-gray-400 text-center">No bookmarks found.</p>`;
      return;
    }

    snap.forEach((doc) => {
      const data = doc.data();
      const card = createBookmarkCard(data);
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="text-red-500">Error loading bookmarks</p>`;
    console.error("Bookmark load error:", err);
  }
}

// Wait for auth state and trigger load
onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    loadBookmarks(user);
  } else {
    const container = getBookmarkContainer();
    container.innerHTML =
      "<p class='text-red-500 text-center'>You must be signed in to view bookmarks.</p>";
  }
});
