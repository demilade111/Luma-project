// Cache Testing Utility
class CacheTest {
  constructor() {
    this.init();
  }

  async init() {
    // Wait for offline manager to be ready
    await this.waitForOfflineManager();
    this.setupGlobalCommands();
  }

  async waitForOfflineManager() {
    let attempts = 0;
    while (!window.offlineManager && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (window.offlineManager) {
      console.log("✅ Offline manager ready");
    } else {
      console.error("❌ Offline manager not found");
    }
  }

  setupGlobalCommands() {
    // Make testing commands available globally
    window.cacheTest = {
      populate: () => this.populateCache(),
      check: () => this.checkCache(),
      clear: () => this.clearCache(),
      test: () => this.testOfflineMode(),
      status: () => this.getStatus(),
    };

    console.log(`
🎯 Cache Testing Commands Available:
- window.cacheTest.populate() - Populate cache with data
- window.cacheTest.check() - Check cache status
- window.cacheTest.clear() - Clear all cache
- window.cacheTest.test() - Test offline mode
- window.cacheTest.status() - Get current status
    `);
  }

  async populateCache() {
    console.log("🔄 Populating cache...");

    try {
      // Check if we're online
      if (!navigator.onLine) {
        console.warn(
          "⚠️ You are offline. Please go online first to populate cache."
        );
        return;
      }

      // Wait for services to be ready
      await this.waitForServices();

      // Populate games cache
      console.log("📦 Caching games...");
      const games = await firebaseOfflineService.getGames();
      console.log(`✅ Cached ${games.length} games`);

      // Populate events cache
      console.log("📅 Caching events...");
      const events = await firebaseOfflineService.getEvents();
      console.log(`✅ Cached ${events.length} events`);

      // Populate user data if logged in
      if (auth.currentUser) {
        console.log("👤 Caching user data...");
        const bookmarks = await firebaseOfflineService.getUserBookmarks(
          auth.currentUser.uid
        );
        console.log(`✅ Cached ${bookmarks.length} bookmarks`);
      }

      // Get final cache stats
      const stats = await window.offlineManager.getCacheStats();
      console.log("📊 Final cache stats:", stats);

      console.log("🎉 Cache population complete!");
      return { success: true, stats };
    } catch (error) {
      console.error("❌ Error populating cache:", error);
      return { success: false, error: error.message };
    }
  }

  async waitForServices() {
    let attempts = 0;
    while (
      (!window.firebaseOfflineService || !window.offlineManager) &&
      attempts < 50
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.firebaseOfflineService) {
      throw new Error("Firebase offline service not ready");
    }

    if (!window.offlineManager) {
      throw new Error("Offline manager not ready");
    }
  }

  async checkCache() {
    console.log("🔍 Checking cache status...");

    try {
      // Check service worker cache
      const cacheKeys = await caches.keys();
      console.log("📁 Service Worker Caches:", cacheKeys);

      // Check IndexedDB
      if (window.offlineManager) {
        const stats = await window.offlineManager.getCacheStats();
        console.log("💾 IndexedDB Stats:", stats);

        // Check specific collections
        const games = await window.offlineManager.getCachedCollection("games");
        const events = await window.offlineManager.getCachedCollection(
          "events"
        );

        console.log("🎮 Cached games:", games?.length || 0);
        console.log("📅 Cached events:", events?.length || 0);

        return {
          cacheKeys,
          stats,
          games: games?.length || 0,
          events: events?.length || 0,
        };
      }
    } catch (error) {
      console.error("❌ Error checking cache:", error);
      return { error: error.message };
    }
  }

  async clearCache() {
    console.log("🗑️ Clearing cache...");

    try {
      // Clear service worker cache
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      console.log("✅ Service worker cache cleared");

      // Clear IndexedDB
      if (window.offlineManager) {
        await window.offlineManager.clearOldCache(0); // Clear all
        console.log("✅ IndexedDB cache cleared");
      }

      console.log("🎉 All cache cleared!");
      return { success: true };
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
      return { success: false, error: error.message };
    }
  }

  async testOfflineMode() {
    console.log("🧪 Testing offline mode...");

    const results = {
      online: navigator.onLine,
      serviceWorker: "serviceWorker" in navigator,
      offlineManager: !!window.offlineManager,
      firebaseService: !!window.firebaseOfflineService,
      cacheStatus: null,
    };

    // Check cache status
    try {
      results.cacheStatus = await this.checkCache();
    } catch (error) {
      results.cacheStatus = { error: error.message };
    }

    console.log("📊 Test Results:", results);

    // Provide recommendations
    if (!results.online) {
      console.log("💡 Go online to populate cache first");
    }

    if (!results.cacheStatus.games && !results.cacheStatus.events) {
      console.log("💡 Run window.cacheTest.populate() to cache data");
    }

    return results;
  }

  getStatus() {
    return {
      online: navigator.onLine,
      serviceWorker: "serviceWorker" in navigator,
      offlineManager: !!window.offlineManager,
      firebaseService: !!window.firebaseOfflineService,
      networkStatus: window.networkStatusIndicator?.getStatus(),
    };
  }
}

// Initialize cache test utility
const cacheTest = new CacheTest();

// Make it available globally
if (typeof window !== "undefined") {
  window.cacheTestInstance = cacheTest;
}

export default cacheTest;
