import { db, auth } from "../config/firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Migration script to update existing comments with user information
async function migrateComments() {
  console.log("Starting comment migration...");

  try {
    // Get all events
    const eventsSnapshot = await getDocs(collection(db, "events"));

    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      console.log(`Processing event: ${eventId}`);

      // Get all comments for this event
      const commentsSnapshot = await getDocs(
        collection(db, "events", eventId, "comments")
      );

      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();

        // Check if comment already has user information
        if (!commentData.userName && !commentData.userId) {
          console.log(`Updating comment ${commentDoc.id} in event ${eventId}`);

          // Try to get user information from the user's email if available
          let userName = "Anonymous";
          let userEmail = null;

          if (commentData.userEmail) {
            userEmail = commentData.userEmail;
            userName = commentData.userEmail.split("@")[0];
          }

          // Update the comment with user information
          await updateDoc(
            doc(db, "events", eventId, "comments", commentDoc.id),
            {
              userName: userName,
              userEmail: userEmail,
              userId: commentData.userId || null,
            }
          );

          console.log(
            `Updated comment ${commentDoc.id} with userName: ${userName}`
          );
        }
      }
    }

    console.log("Comment migration completed successfully!");
  } catch (error) {
    console.error("Error during comment migration:", error);
  }
}

// Export the migration function
export { migrateComments };

// Run migration if this script is executed directly
if (typeof window !== "undefined") {
  // Only run in browser environment
  window.migrateComments = migrateComments;
}
