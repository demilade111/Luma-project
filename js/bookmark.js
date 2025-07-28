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
    "bg-[#262C3D] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col";

  // 🔧 Container for image with relative positioning
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "relative";

  // Image itself
  const image = document.createElement("img");
  image.src = game.image;
  image.alt = game.title;
  image.className = "w-full h-48 object-cover";

  // Bookmark icon (FontAwesome)
  const bookmarkIcon = document.createElement("i");
  bookmarkIcon.className =
    "fa-solid fa-bookmark text-white text-lg absolute top-2 left-2 bg-black/60 p-2 rounded-full hover:scale-110 transition-transform cursor-pointer";

  // Add click handler to remove bookmark
  bookmarkIcon.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = auth.currentUser;
    if (!user) return;

    if (confirm(`Remove "${game.title}" from bookmarks?`)) {
      try {
        await removeBookmark(user.uid, game.gameId);
        console.log("Bookmark removed successfully");
      } catch (error) {
        console.error("Error removing bookmark:", error);
        alert("Failed to remove bookmark. Please try again.");
      }
    }
  });

  // Assemble image wrapper
  imageWrapper.appendChild(image);
  imageWrapper.appendChild(bookmarkIcon);

  const content = document.createElement("div");
  content.className = "p-4 flex flex-col justify-between flex-grow";

  // Title + Button row
  const row = document.createElement("div");
  row.className = "flex justify-between items-center gap-4";

  // Title
  const title = document.createElement("h3");
  title.textContent = game.title;
  title.className = "text-xl font-semibold text-gray-200 truncate";

  // Button
  const btn = document.createElement("span");
  btn.className =
    "bg-[#F1647A] p-[3px] text-gray-200 rounded-2xl px-3 py-1.5 whitespace-nowrap";
  btn.textContent = "View Details";

  // Final assembly
  row.appendChild(title);
  row.appendChild(btn);
  content.appendChild(row);
  wrapper.appendChild(imageWrapper);
  wrapper.appendChild(content);

  return wrapper;
}
