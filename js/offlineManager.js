// Offline Data Manager for Luma App
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.db = null;
    this.init();
  }

  async init() {
    await this.initDatabase();
    this.setupNetworkListeners();
    this.setupServiceWorkerCommunication();
  }

  // Initialize IndexedDB
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("LumaOfflineDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create collections store for Firebase data
        if (!db.objectStoreNames.contains("collections")) {
          const collectionsStore = db.createObjectStore("collections", {
            keyPath: "id",
          });
          collectionsStore.createIndex("collection", "collection", {
            unique: false,
          });
          collectionsStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
        }

        // Create cache store for general data
        if (!db.objectStoreNames.contains("cache")) {
          const cacheStore = db.createObjectStore("cache", { keyPath: "key" });
          cacheStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Create pending actions store
        if (!db.objectStoreNames.contains("pendingActions")) {
          const actionsStore = db.createObjectStore("pendingActions", {
            keyPath: "id",
            autoIncrement: true,
          });
          actionsStore.createIndex("type", "type", { unique: false });
          actionsStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  // Setup network status listeners
  setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.onNetworkRestored();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.onNetworkLost();
    });
  }

  // Setup service worker communication
  setupServiceWorkerCommunication() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case "NETWORK_STATUS":
        this.isOnline = data.isOnline;
        break;
      case "CACHE_UPDATED":
        this.onCacheUpdated(data.key, data.data);
        break;
    }
  }

  // Network restored handler
  async onNetworkRestored() {
    console.log("Network restored - processing pending actions");
    this.showNotification("You are back online!", "success");

    // Process pending actions
    await this.processPendingActions();

    // Sync cached data with server
    await this.syncCachedData();
  }

  // Network lost handler
  onNetworkLost() {
    console.log("Network lost - switching to offline mode");
    this.showNotification(
      "You are offline. Some features may be limited.",
      "warning"
    );
  }

  // Cache Firebase collection data
  async cacheCollection(collectionName, data, timestamp = Date.now()) {
    try {
      const tx = this.db.transaction(["collections"], "readwrite");
      const store = tx.objectStore("collections");

      await store.put({
        id: `${collectionName}_${timestamp}`,
        collection: collectionName,
        data: data,
        timestamp: timestamp,
      });

      console.log(
        `Cached ${collectionName} collection with ${data.length} items`
      );
      return true;
    } catch (error) {
      console.error("Error caching collection:", error);
      return false;
    }
  }

  async getCachedCollection(collectionName) {
    try {
      if (!this.db) {
        console.warn("Database not initialized, initializing now...");
        await this.initDatabase();
      }
  
      const tx = this.db.transaction(["collections"], "readonly");
      const store = tx.objectStore("collections");
      const index = store.index("collection");
  
      const results = await new Promise((resolve, reject) => {
        const request = index.getAll(collectionName);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
  
      if (!results || results.length === 0) {
        return null;
      }
  
      const mostRecent = results.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      );
  
      return mostRecent.data;
    } catch (error) {
      console.error("Error getting cached collection:", error);
      return null;
    }
  }
  

  // Cache general data
  async cacheData(key, data, timestamp = Date.now()) {
    try {
      const tx = this.db.transaction(["cache"], "readwrite");
      const store = tx.objectStore("cache");

      await store.put({
        key: key,
        data: data,
        timestamp: timestamp,
      });

      console.log(`Cached data for key: ${key}`);
      return true;
    } catch (error) {
      console.error("Error caching data:", error);
      return false;
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const tx = this.db.transaction(["cache"], "readonly");
      const store = tx.objectStore("cache");

      const result = await store.get(key);
      return result ? result.data : null;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  // Store pending action for when network is restored
  async storePendingAction(action) {
    try {
      const tx = this.db.transaction(["pendingActions"], "readwrite");
      const store = tx.objectStore("pendingActions");

      await store.add({
        ...action,
        timestamp: Date.now(),
      });

      console.log("Stored pending action:", action.type);
      return true;
    } catch (error) {
      console.error("Error storing pending action:", error);
      return false;
    }
  }

  // Get all pending actions
  async getPendingActions() {
    try {
      const tx = this.db.transaction(["pendingActions"], "readonly");
      const store = tx.objectStore("pendingActions");

      return await store.getAll();
    } catch (error) {
      console.error("Error getting pending actions:", error);
      return [];
    }
  }

  // Remove pending action
  async removePendingAction(id) {
    try {
      const tx = this.db.transaction(["pendingActions"], "readwrite");
      const store = tx.objectStore("pendingActions");

      await store.delete(id);
      console.log("Removed pending action:", id);
      return true;
    } catch (error) {
      console.error("Error removing pending action:", error);
      return false;
    }
  }

  // Process pending actions when network is restored
  async processPendingActions() {
    const pendingActions = await this.getPendingActions();

    for (const action of pendingActions) {
      try {
        await this.processAction(action);
        await this.removePendingAction(action.id);
      } catch (error) {
        console.error("Failed to process action:", error);
      }
    }
  }

  // Process individual action
  async processAction(action) {
    switch (action.type) {
      case "comment":
        await this.processCommentAction(action.data);
        break;
      case "bookmark":
        await this.processBookmarkAction(action.data);
        break;
      case "event":
        await this.processEventAction(action.data);
        break;
      default:
        console.log("Unknown action type:", action.type);
    }
  }

  // Process comment action
  async processCommentAction(data) {
    // Import Firebase modules dynamically
    const { db } = await import("../config/firebase.js");
    const { collection, addDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );

    try {
      await addDoc(collection(db, "events", data.eventId, "comments"), {
        text: data.text,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        createdAt: serverTimestamp(),
      });

      console.log("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    }
  }

  // Process bookmark action
  async processBookmarkAction(data) {
    const { db } = await import("../config/firebase.js");
    const { doc, setDoc, deleteDoc } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );

    try {
      const bookmarkRef = doc(
        db,
        "users",
        data.userId,
        "bookmarks",
        data.gameId
      );

      if (data.action === "add") {
        await setDoc(bookmarkRef, {
          gameId: data.gameId,
          title: data.title,
          image: data.image,
        });
      } else if (data.action === "remove") {
        await deleteDoc(bookmarkRef);
      }

      console.log("Bookmark action processed successfully");
    } catch (error) {
      console.error("Error processing bookmark action:", error);
      throw error;
    }
  }

  // Process event action
  async processEventAction(data) {
    // Handle event-related actions
    console.log("Processing event action:", data);
  }

  // Sync cached data with server
  async syncCachedData() {
    // This would sync any locally modified data with the server
    console.log("Syncing cached data with server...");
  }

  // Check if data is stale (older than specified time)
  isDataStale(timestamp, maxAge = 24 * 60 * 60 * 1000) {
    // Default 24 hours
    return Date.now() - timestamp > maxAge;
  }

  // Clear old cached data
  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // Default 7 days
    try {
      const tx = this.db.transaction(["collections", "cache"], "readwrite");
      const collectionsStore = tx.objectStore("collections");
      const cacheStore = tx.objectStore("cache");

      const collectionsIndex = collectionsStore.index("timestamp");
      const cacheIndex = cacheStore.index("timestamp");

      const cutoffTime = Date.now() - maxAge;

      // Clear old collections
      const oldCollections = await collectionsIndex.getAllKeys(
        IDBKeyRange.upperBound(cutoffTime)
      );
      for (const key of oldCollections) {
        await collectionsStore.delete(key);
      }

      // Clear old cache
      const oldCache = await cacheIndex.getAllKeys(
        IDBKeyRange.upperBound(cutoffTime)
      );
      for (const key of oldCache) {
        await cacheStore.delete(key);
      }

      console.log(
        `Cleared ${oldCollections.length} old collections and ${oldCache.length} old cache entries`
      );
    } catch (error) {
      console.error("Error clearing old cache:", error);
    }
  }

  // Show notification
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "warning"
        ? "bg-yellow-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;

    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">
          ${
            type === "success"
              ? "✓"
              : type === "warning"
              ? "⚠"
              : type === "error"
              ? "✗"
              : "ℹ"
          }
        </span>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Get network status
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: navigator.connection
        ? navigator.connection.effectiveType
        : "unknown",
    };
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      // Ensure database is initialized
      if (!this.db) {
        console.warn("Database not initialized, initializing now...");
        await this.initDatabase();
      }

      const tx = this.db.transaction(
        ["collections", "cache", "pendingActions"],
        "readonly"
      );
      const collectionsStore = tx.objectStore("collections");
      const cacheStore = tx.objectStore("cache");
      const actionsStore = tx.objectStore("pendingActions");

      const collectionsCount = await collectionsStore.count();
      const cacheCount = await cacheStore.count();
      const pendingActionsCount = await actionsStore.count();

      return {
        collections: collectionsCount,
        cache: cacheCount,
        pendingActions: pendingActionsCount,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { collections: 0, cache: 0, pendingActions: 0 };
    }
  }
}

// Create and export singleton instance
const offlineManager = new OfflineManager();

// Make it available globally
if (typeof window !== "undefined") {
  window.offlineManager = offlineManager;
}

export default offlineManager;
