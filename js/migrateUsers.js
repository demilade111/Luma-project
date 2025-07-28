import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Migration utility: Fix users with auto-generated document IDs
export async function migrateUsersToUidDocumentIds() {
  console.log("Starting user migration to uid-based document IDs...");
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const userDoc of snapshot.docs) {
    try {
      const data = userDoc.data();
      const uid = data.uid;

      if (!uid) {
        console.log(`Skipping document ${userDoc.id} - no uid field`);
        skippedCount++;
        continue;
      }

      // Skip if this document already uses uid as document ID
      if (userDoc.id === uid) {
        console.log(`User ${uid} already has correct document ID`);
        skippedCount++;
        continue;
      }

      // Check if a document with uid as ID already exists
      const existingUserDoc = await getDoc(doc(db, "users", uid));
      if (existingUserDoc.exists()) {
        console.log(
          `User document with uid ${uid} already exists, deleting old document`
        );
        await deleteDoc(doc(db, "users", userDoc.id));
        migratedCount++;
        continue;
      }

      // Create new document with uid as ID
      console.log(`Migrating user ${uid} from document ${userDoc.id}`);
      await setDoc(doc(db, "users", uid), data);

      // Delete old document
      await deleteDoc(doc(db, "users", userDoc.id));
      migratedCount++;
    } catch (error) {
      console.error(`Error migrating user document ${userDoc.id}:`, error);
      errorCount++;
    }
  }

  console.log(
    `Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
  );
}

// Run migration when this script is imported
migrateUsersToUidDocumentIds().catch(console.error);
