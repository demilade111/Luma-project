// Simple Visual Offline Testing UI
class OfflineTestUI {
  constructor() {
    this.panel = null;
    this.init();
  }

  init() {
    this.createPanel();
    this.updateStatus();
    this.setupAutoUpdate();
  }

  createPanel() {
    // Create floating test panel
    this.panel = document.createElement("div");
    this.panel.id = "offline-test-panel";
    this.panel.className =
      "fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-50 max-w-sm border";
    this.panel.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-800">Offline Mode Test</h3>
        <button id="close-test-panel" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span>Network:</span>
          <span id="network-status" class="font-medium"></span>
        </div>
        <div class="flex justify-between">
          <span>Games Cached:</span>
          <span id="games-cached" class="font-medium">-</span>
        </div>
        <div class="flex justify-between">
          <span>Events Cached:</span>
          <span id="events-cached" class="font-medium">-</span>
        </div>
        <div class="flex justify-between">
          <span>Service Worker:</span>
          <span id="sw-status" class="font-medium">-</span>
        </div>
      </div>
      
      <div class="mt-3 space-y-2">
        <button id="populate-cache-btn" class="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
          Populate Cache
        </button>
        <button id="test-offline-btn" class="w-full bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
          Test Offline
        </button>
        <button id="clear-cache-btn" class="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
          Clear Cache
        </button>
      </div>
    `;

    document.body.appendChild(this.panel);

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    document
      .getElementById("close-test-panel")
      .addEventListener("click", () => {
        this.panel.style.display = "none";
      });

    // Populate cache button
    document
      .getElementById("populate-cache-btn")
      .addEventListener("click", () => {
        this.populateCache();
      });

    // Test offline button
    document
      .getElementById("test-offline-btn")
      .addEventListener("click", () => {
        this.testOfflineMode();
      });

    // Clear cache button
    document.getElementById("clear-cache-btn").addEventListener("click", () => {
      this.clearCache();
    });
  }

  async updateStatus() {
    try {
      // Network status
      const networkStatus = document.getElementById("network-status");
      networkStatus.textContent = navigator.onLine ? "Online" : "Offline";
      networkStatus.className = navigator.onLine
        ? "font-medium text-green-600"
        : "font-medium text-red-600";

      // Service worker status
      const swStatus = document.getElementById("sw-status");
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        swStatus.textContent = registrations.length > 0 ? "Active" : "Inactive";
        swStatus.className =
          registrations.length > 0
            ? "font-medium text-green-600"
            : "font-medium text-red-600";
      } else {
        swStatus.textContent = "Not Supported";
        swStatus.className = "font-medium text-gray-500";
      }

      // Cache status
      if (window.offlineManager && window.offlineManager.db) {
        try {
          const stats = await window.offlineManager.getCacheStats();
          const games = await window.offlineManager.getCachedCollection(
            "games"
          );
          const events = await window.offlineManager.getCachedCollection(
            "events"
          );

          document.getElementById("games-cached").textContent =
            games?.length || 0;
          document.getElementById("events-cached").textContent =
            events?.length || 0;
        } catch (error) {
          console.warn("Error getting cache stats:", error);
          document.getElementById("games-cached").textContent = "0";
          document.getElementById("events-cached").textContent = "0";
        }
      } else {
        document.getElementById("games-cached").textContent = "0";
        document.getElementById("events-cached").textContent = "0";
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  setupAutoUpdate() {
    // Update status every 2 seconds
    setInterval(() => {
      this.updateStatus();
    }, 2000);
  }

  async populateCache() {
    const btn = document.getElementById("populate-cache-btn");
    const originalText = btn.textContent;

    try {
      btn.textContent = "Loading...";
      btn.disabled = true;

      if (!navigator.onLine) {
        this.showMessage("Please go online first to populate cache", "warning");
        return;
      }

      // Wait for services to be ready
      await this.waitForServices();

      // Populate cache
      const games = await firebaseOfflineService.getGames();
      const events = await firebaseOfflineService.getEvents();

      this.showMessage(
        `Cache populated! ${games.length} games, ${events.length} events`,
        "success"
      );
      this.updateStatus();
    } catch (error) {
      this.showMessage("Failed to populate cache: " + error.message, "error");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  async testOfflineMode() {
    const btn = document.getElementById("test-offline-btn");
    const originalText = btn.textContent;

    try {
      btn.textContent = "Testing...";
      btn.disabled = true;

      // Check if we have cached data
      if (window.offlineManager) {
        const games = await window.offlineManager.getCachedCollection("games");
        const events = await window.offlineManager.getCachedCollection(
          "events"
        );

        if (games && games.length > 0) {
          this.showMessage(
            `✅ Offline mode ready! ${games.length} games cached`,
            "success"
          );
        } else if (events && events.length > 0) {
          this.showMessage(
            `✅ Offline mode ready! ${events.length} events cached`,
            "success"
          );
        } else {
          this.showMessage(
            "❌ No data cached. Please populate cache first.",
            "warning"
          );
        }
      }
    } catch (error) {
      this.showMessage("Test failed: " + error.message, "error");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  async clearCache() {
    const btn = document.getElementById("clear-cache-btn");
    const originalText = btn.textContent;

    try {
      btn.textContent = "Clearing...";
      btn.disabled = true;

      // Clear service worker cache
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));

      // Clear IndexedDB
      if (window.offlineManager) {
        await window.offlineManager.clearOldCache(0);
      }

      this.showMessage("Cache cleared successfully", "success");
      this.updateStatus();
    } catch (error) {
      this.showMessage("Failed to clear cache: " + error.message, "error");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
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

  showMessage(message, type = "info") {
    // Create notification
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 max-w-sm ${
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
              ? "✅"
              : type === "warning"
              ? "⚠️"
              : type === "error"
              ? "❌"
              : "ℹ️"
          }
        </span>
        <span class="text-sm">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize offline test UI
const offlineTestUI = new OfflineTestUI();

// Make it available globally
if (typeof window !== "undefined") {
  window.offlineTestUI = offlineTestUI;
}

export default offlineTestUI;
