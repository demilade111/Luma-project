import { auth } from "../../config/firebase.js";
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

// 2. Helpers
function bookmarksRef(uid) {
  return collection(db, "users", uid, "bookmarks");
}

async function addBookmark(uid, game) {
  await setDoc(doc(bookmarksRef(uid), game.id), {
    title: game.title,
    thumbnail: game.thumbnail,
    // other game properties...
  });
}

async function removeBookmark(uid, gameId) {
  await deleteDoc(doc(db, "users", uid, "bookmarks", gameId));
}

// 3. Track bookmarks in real-time
let unsubscribeBookmarks;

auth.onAuthStateChanged((user) => {
  if (user) {
    unsubscribeBookmarks = onSnapshot(bookmarksRef(user.uid), (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      window.bookmarkedIds = new Set(ids);
      updateBookmarksUI(); // your function to toggle UI states
    });
  } else {
    if (unsubscribeBookmarks) unsubscribeBookmarks();
    window.bookmarkedIds = new Set();
    updateBookmarksUI();
  }
});

// 4. Render game cards + allow bookmarking
function createGameCard(game) {
  const button = document.createElement("button");
  button.textContent = window.bookmarkedIds?.has(game.id) ? "★" : "☆";
  button.addEventListener("click", async () => {
    const uid = auth.currentUser.uid;
    if (!uid) return alert("Please sign in to bookmark games.");

    if (window.bookmarkedIds.has(game.id)) {
      await removeBookmark(uid, game.id);
    } else {
      await addBookmark(uid, game);
    }
  });

  // add the button to your card and append to your container...
}

// 5. Render bookmarks page
async function renderBookmarksPage() {
  const container = document.getElementById("bookmarks-container");
  container.innerHTML = "";

  for (const gameId of window.bookmarkedIds) {
    const docSnap = await getDoc(
      doc(bookmarksRef(auth.currentUser.uid), gameId)
    );
    if (docSnap.exists()) {
      const game = { id: docSnap.id, ...docSnap.data() };
      // create a card like above and append it...
    }
  }
}
