import { db, auth } from "../config/firebase.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Add a comment to Firestore for a specific event, and update event doc with latest 3 comments and count
export async function postComment(eventId, text) {
  if (!text || !eventId) return;

  // Get current user
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to post comments");
  }

  // Get user data from Firestore
  let userName = user.displayName || user.email?.split("@")[0] || "Anonymous";
  let userEmail = user.email;

  try {
    // Try to get username from users collection
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userName = userData.username || userName;
    }
  } catch (error) {
    console.log("Could not fetch user data, using fallback name");
  }

  // Add comment to subcollection with user info
  await addDoc(collection(db, "events", eventId, "comments"), {
    text,
    userId: user.uid,
    userEmail: userEmail,
    userName: userName,
    createdAt: serverTimestamp(),
  });

  // Update event doc with latest 3 comments and count
  const eventRef = doc(db, "events", eventId);
  await runTransaction(db, async (transaction) => {
    // Get latest 3 comments
    const commentsSnap = await getDocs(
      query(
        collection(db, "events", eventId, "comments"),
        orderBy("createdAt", "desc")
      )
    );
    const allComments = commentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const latestComments = allComments.slice(0, 3).map((c) => ({
      text: c.text,
      userName: c.userName || "Anonymous",
      userEmail: c.userEmail,
      createdAt: c.createdAt,
    }));
    const commentsCount = allComments.length;
    await transaction.update(eventRef, {
      comments: latestComments.length > 0 ? latestComments : null,
      commentsCount: commentsCount,
    });
  });
}

// Listen for comments in real-time for a specific event
export function listenForComments(eventId, callback) {
  const q = query(
    collection(db, "events", eventId, "comments"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(comments);
  });
}
