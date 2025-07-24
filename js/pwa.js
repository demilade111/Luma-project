// PWA Management Script
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    this.init();
  }

  async init() {
    // Check if service worker is supported
    if ("serviceWorker" in navigator) {
      await this.registerServiceWorker();
    }

    // Check if app is already installed
    this.checkIfInstalled();

    // Listen for install prompt
    this.listenForInstallPrompt();

    // Create install button if needed
    this.createInstallButton();

    // Handle app updates
    this.handleAppUpdates();
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            this.showUpdateNotification();
          }
        });
      });

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  checkIfInstalled() {
    // Check if running in standalone mode (installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      this.isInstalled = true;
      console.log("App is installed and running in standalone mode");
    }
  }

  listenForInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("Install prompt triggered");
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for successful installation
    window.addEventListener("appinstalled", (e) => {
      console.log("App was installed");
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  createInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById("pwa-install-btn")) {
      const button = document.createElement("button");
      button.id = "pwa-install-btn";
      button.className =
        "fixed bottom-4 right-4 bg-gradient-to-r from-[#F59275] to-[#F1647A] text-white px-4 py-2 rounded-full shadow-lg z-50 hidden hover:shadow-xl transition-all duration-300";
      button.innerHTML = `
        <i class="fas fa-download mr-2"></i>
        Install App
      `;
      button.addEventListener("click", () => this.installApp());
      document.body.appendChild(button);
      this.installButton = button;
    }
  }

  showInstallButton() {
    if (this.installButton && !this.isInstalled) {
      this.installButton.classList.remove("hidden");
      this.installButton.classList.add("flex", "items-center");
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.classList.add("hidden");
      this.installButton.classList.remove("flex", "items-center");
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log("No install prompt available");
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      this.deferredPrompt = null;
      this.hideInstallButton();
    } catch (error) {
      console.error("Error during app installation:", error);
    }
  }

  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement("div");
    notification.id = "pwa-update-notification";
    notification.className =
      "fixed top-4 right-4 bg-gradient-to-r from-[#F59275] to-[#F1647A] text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm";
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <i class="fas fa-sync-alt mr-2"></i>
          <span>New version available!</span>
        </div>
        <button id="pwa-update-btn" class="ml-4 bg-white text-[#F1647A] px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100">
          Update
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Handle update button click
    document.getElementById("pwa-update-btn").addEventListener("click", () => {
      this.updateApp();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  updateApp() {
    // Remove update notification
    const notification = document.getElementById("pwa-update-notification");
    if (notification) {
      notification.remove();
    }

    // Reload the page to activate new service worker
    window.location.reload();
  }

  handleAppUpdates() {
    // Listen for service worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SKIP_WAITING") {
          this.updateApp();
        }
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Show notification
  showNotification(title, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      const defaultOptions = {
        icon: "/src/asset/images/logo.png",
        badge: "/src/asset/images/logo.png",
        vibrate: [100, 50, 100],
        ...options,
      };

      new Notification(title, defaultOptions);
    }
  }

  // Check network status
  checkNetworkStatus() {
    if ("navigator" in window && "onLine" in navigator) {
      return navigator.onLine;
    }
    return true; // Assume online if not supported
  }

  // Handle offline/online events
  setupNetworkHandling() {
    window.addEventListener("online", () => {
      console.log("App is online");
      this.showNotification("Luma", { body: "You are back online!" });
    });

    window.addEventListener("offline", () => {
      console.log("App is offline");
      this.showNotification("Luma", {
        body: "You are offline. Some features may be limited.",
      });
    });
  }

  // Get app info
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.checkNetworkStatus(),
      hasServiceWorker: "serviceWorker" in navigator,
      hasNotifications: "Notification" in window,
      notificationPermission:
        "Notification" in window ? Notification.permission : "not-supported",
    };
  }
}

// Initialize PWA when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.pwaManager = new PWAManager();

  // Setup network handling
  window.pwaManager.setupNetworkHandling();

  // Request notification permission on first visit
  if (localStorage.getItem("notification-permission-requested") !== "true") {
    setTimeout(() => {
      window.pwaManager.requestNotificationPermission();
      localStorage.setItem("notification-permission-requested", "true");
    }, 3000);
  }
});

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = PWAManager;
}
