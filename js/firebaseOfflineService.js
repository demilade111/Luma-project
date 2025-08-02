// Firebase Offline Service - Wrapper for Firebase operations with offline support
import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import offlineManager from "./offlineManager.js";

class FirebaseOfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  // Generic method to get documents from collection with offline support
  async getCollection(collectionName, options = {}) {
    const cacheKey = `${collectionName}_${JSON.stringify(options)}`;

    console.log(
      `🔄 Getting ${collectionName} - Online: ${this.isOnline}, Navigator online: ${navigator.onLine}`
    );

    try {
      if (this.isOnline) {
        console.log(`🌐 Online: Fetching ${collectionName} from Firebase`);
        // Try to get from Firebase first
        const collectionRef = collection(db, collectionName);
        let q = collectionRef;

        // Apply query options
        if (options.where) {
          q = query(
            q,
            where(
              options.where.field,
              options.where.operator,
              options.where.value
            )
          );
        }
        if (options.orderBy) {
          q = query(
            q,
            orderBy(options.orderBy.field, options.orderBy.direction || "asc")
          );
        }
        if (options.limit) {
          q = query(q, limit(options.limit));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(
          `✅ Fetched ${data.length} ${collectionName} from Firebase`
        );

        // Cache the data
        await offlineManager.cacheCollection(collectionName, data);
        await offlineManager.cacheData(cacheKey, data);

        return data;
      } else {
        // Offline: try to get from cache
        console.log(`📱 Offline: Getting ${collectionName} from cache`);
        const cachedData = await offlineManager.getCachedData(cacheKey);

        if (cachedData) {
          console.log(
            `✅ Found ${cachedData.length} ${collectionName} in cache (key: ${cacheKey})`
          );
          return cachedData;
        }

        // Fallback to collection cache
        console.log(`🔍 Trying collection cache for ${collectionName}`);
        const collectionData = await offlineManager.getCachedCollection(
          collectionName
        );
        if (collectionData) {
          console.log(
            `✅ Found ${collectionData.length} ${collectionName} in collection cache`
          );
          return collectionData;
        }

        console.log(`❌ No cached data found for ${collectionName}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error getting collection ${collectionName}:`, error);

      // Fallback to cache on error
      console.log(`🔄 Falling back to cache due to error`);
      const cachedData = await offlineManager.getCachedData(cacheKey);
      if (cachedData) {
        console.log(
          `✅ Found ${cachedData.length} ${collectionName} in fallback cache`
        );
        return cachedData;
      }

      const collectionData = await offlineManager.getCachedCollection(
        collectionName
      );
      if (collectionData) {
        console.log(
          `✅ Found ${collectionData.length} ${collectionName} in fallback collection cache`
        );
        return collectionData;
      }

      console.log(`❌ No fallback data found for ${collectionName}`);
      return [];
    }
  }

  // Get games with offline support
  async getGames(options = {}) {
    return this.getCollection("games", options);
  }

  // Get events with offline support
  async getEvents(options = {}) {
    return this.getCollection("events", options);
  }

  // Get users with offline support
  async getUsers(options = {}) {
    return this.getCollection("users", options);
  }

  // Get a single document with offline support
  async getDocument(collectionName, docId) {
    const cacheKey = `${collectionName}_${docId}`;

    try {
      if (this.isOnline) {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          await offlineManager.cacheData(cacheKey, data);
          return data;
        }
        return null;
      } else {
        // Offline: try to get from cache
        const cachedData = await offlineManager.getCachedData(cacheKey);
        return cachedData;
      }
    } catch (error) {
      console.error(
        `Error getting document ${collectionName}/${docId}:`,
        error
      );

      // Fallback to cache
      const cachedData = await offlineManager.getCachedData(cacheKey);
      return cachedData;
    }
  }

  // Add document with offline support (queues for later if offline)
  async addDocument(collectionName, data) {
    if (this.isOnline) {
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
        });
        return docRef;
      } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
      }
    } else {
      // Store as pending action
      await offlineManager.storePendingAction({
        type: "addDocument",
        data: {
          collection: collectionName,
          data: data,
        },
      });

      offlineManager.showNotification(
        "Action queued for when you're back online",
        "info"
      );
      return { id: "pending_" + Date.now() };
    }
  }

  // Update document with offline support
  async updateDocument(collectionName, docId, data) {
    if (this.isOnline) {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(
          docRef,
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        return true;
      } catch (error) {
        console.error(
          `Error updating document ${collectionName}/${docId}:`,
          error
        );
        throw error;
      }
    } else {
      // Store as pending action
      await offlineManager.storePendingAction({
        type: "updateDocument",
        data: {
          collection: collectionName,
          docId: docId,
          data: data,
        },
      });

      offlineManager.showNotification(
        "Update queued for when you're back online",
        "info"
      );
      return true;
    }
  }

  // Delete document with offline support
  async deleteDocument(collectionName, docId) {
    if (this.isOnline) {
      try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error(
          `Error deleting document ${collectionName}/${docId}:`,
          error
        );
        throw error;
      }
    } else {
      // Store as pending action
      await offlineManager.storePendingAction({
        type: "deleteDocument",
        data: {
          collection: collectionName,
          docId: docId,
        },
      });

      offlineManager.showNotification(
        "Delete queued for when you're back online",
        "info"
      );
      return true;
    }
  }

  // Add comment with offline support
  async addComment(eventId, commentData) {
    if (this.isOnline) {
      try {
        const commentsRef = collection(db, "events", eventId, "comments");
        const docRef = await addDoc(commentsRef, {
          ...commentData,
          createdAt: serverTimestamp(),
        });
        return docRef;
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    } else {
      // Store as pending action
      await offlineManager.storePendingAction({
        type: "comment",
        data: {
          eventId: eventId,
          ...commentData,
        },
      });

      offlineManager.showNotification(
        "Comment will be posted when you're back online",
        "info"
      );
      return { id: "pending_" + Date.now() };
    }
  }

  // Add/remove bookmark with offline support
  async toggleBookmark(userId, gameId, gameData, action = "add") {
    if (this.isOnline) {
      try {
        const bookmarkRef = doc(db, "users", userId, "bookmarks", gameId);

        if (action === "add") {
          await setDoc(bookmarkRef, {
            gameId: gameId,
            title: gameData.title || gameData.name,
            image: gameData.image || gameData.thumbnail,
            addedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(bookmarkRef);
        }

        return true;
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        throw error;
      }
    } else {
      // Store as pending action
      await offlineManager.storePendingAction({
        type: "bookmark",
        data: {
          userId: userId,
          gameId: gameId,
          title: gameData.title || gameData.name,
          image: gameData.image || gameData.thumbnail,
          action: action,
        },
      });

      offlineManager.showNotification(
        `Bookmark ${
          action === "add" ? "added" : "removed"
        } (will sync when online)`,
        "info"
      );
      return true;
    }
  }

  // Get user bookmarks with offline support
  async getUserBookmarks(userId) {
    return this.getCollection(`users/${userId}/bookmarks`);
  }

  // Get event comments with offline support
  async getEventComments(eventId) {
    return this.getCollection(`events/${eventId}/comments`, {
      orderBy: { field: "createdAt", direction: "desc" },
    });
  }

  // Real-time listener with offline fallback
  onSnapshot(collectionName, callback, options = {}) {
    if (this.isOnline) {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // Apply query options
      if (options.where) {
        q = query(
          q,
          where(
            options.where.field,
            options.where.operator,
            options.where.value
          )
        );
      }
      if (options.orderBy) {
        q = query(
          q,
          orderBy(options.orderBy.field, options.orderBy.direction || "asc")
        );
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Cache the data
        offlineManager.cacheCollection(collectionName, data);
        callback(data);
      });
    } else {
      // Offline: return cached data immediately
      this.getCollection(collectionName, options).then(callback);

      // Return a dummy unsubscribe function
      return () => {};
    }
  }

  // Check if data is fresh (less than specified age)
  async isDataFresh(collectionName, maxAge = 5 * 60 * 1000) {
    // Default 5 minutes
    const cachedData = await offlineManager.getCachedCollection(collectionName);
    if (!cachedData) return false;

    // Check if we have timestamp info
    const cacheInfo = await offlineManager.getCachedData(
      `${collectionName}_info`
    );
    if (!cacheInfo || !cacheInfo.timestamp) return false;

    return Date.now() - cacheInfo.timestamp < maxAge;
  }

  // Force refresh data from server
  async refreshData(collectionName, options = {}) {
    if (!this.isOnline) {
      throw new Error("Cannot refresh data while offline");
    }

    // Clear cache for this collection
    await offlineManager.cacheData(`${collectionName}_info`, { timestamp: 0 });

    // Fetch fresh data
    return this.getCollection(collectionName, options);
  }

  // Get cache statistics
  async getCacheStats() {
    return offlineManager.getCacheStats();
  }

  // Clear all cache
  async clearCache() {
    // This would clear all cached data
    console.log("Clearing all cache...");
  }

  // Get network status
  getNetworkStatus() {
    return offlineManager.getNetworkStatus();
  }
}

// Create and export singleton instance
const firebaseOfflineService = new FirebaseOfflineService();

// Make it available globally
if (typeof window !== "undefined") {
  window.firebaseOfflineService = firebaseOfflineService;
}

export default firebaseOfflineService;
