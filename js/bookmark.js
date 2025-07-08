import { auth } from "../config/firebase.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

// Helper: Get user's bookmarks reference
function bookmarksRef(uid) {
  return collection(db, "users", uid, "bookmarks");
}

// Add bookmark
async function addBookmark(uid, game) {
  await setDoc(doc(bookmarksRef(uid), game.id), {
    gameId: game.id,
    title: game.title,
    image: game.image,
  });
}

// Remove bookmark
async function removeBookmark(uid, gameId) {
  await deleteDoc(doc(bookmarksRef(uid), gameId));
}

// Listen to bookmark changes
auth.onAuthStateChanged((user) => {
  if (!user) return;

  const listContainer = document.getElementById("bookmark-list");
  const ref = bookmarksRef(user.uid);

  onSnapshot(ref, (snapshot) => {
    listContainer.innerHTML = "";

    if (snapshot.empty) {
      listContainer.innerHTML = `<p class="text-gray-500 text-center col-span-3">You have no bookmarked games yet.</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = createGameCard({ id: docSnap.id, ...data });
      listContainer.appendChild(card);
    });
  });
});

// Create and return a game card element
function createGameCard(game) {
  const wrapper = document.createElement("a");
  wrapper.href = `/views/game/game-details.html?id=${game.gameId}`;
  wrapper.className =
    "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col";

  const image = document.createElement("img");
  image.src = game.image;
  image.alt = game.title;
  image.className = "w-full h-48 object-cover";

  const content = document.createElement("div");
  content.className = "p-4 flex flex-col justify-between flex-grow";

  const title = document.createElement("h3");
  title.textContent = game.title;
  title.className = "text-xl font-semibold text-gray-800 mb-4";

  const btn = document.createElement("span");
  btn.className =
    "inline-block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded";
  btn.textContent = "View Details";

  content.appendChild(title);
  content.appendChild(btn);
  wrapper.appendChild(image);
  wrapper.appendChild(content);

  return wrapper;
}
