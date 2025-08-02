const CACHE_NAME = "luma-v2.0.0";
const STATIC_CACHE = "luma-static-v2.0.0";
const DYNAMIC_CACHE = "luma-dynamic-v2.0.0";
const DATA_CACHE = "luma-data-v2.0.0";

// Static files to cache on install
const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/output.css",
  "/js/main.js",
  "/js/inject.js",
  "/js/pwa.js",
  "/js/auth/authGuard.js",
  "/js/auth/login.js",
  "/js/auth/signup.js",
  "/js/auth/signout.js",
  "/js/checkAuthStatus.js",
  "/js/event.js",
  "/js/comment.js",
  "/js/bookmark.js",
  "/js/userEvents.js",
  "/js/preference.js",
  "/js/profile.js",
  "/js/uploadGamesToFirebase.js",
  "/service/gameService.js",
  "/config/firebase.js",
  "/components/navbar.html",
  "/components/sidebar.html",
  "/components/footer.html",
  "/components/hero.html",
  "/components/mobilenavbar.html",
  "/src/asset/images/logo.png",
  "/src/asset/images/placeholder.png",
  "/src/asset/images/bookmark.png",
  "/src/asset/images/bookmark-solid.svg",
  "/src/asset/images/Crown.png",
  "/src/asset/images/duel.png",
  "/src/asset/images/event.png",
  "/src/asset/images/event-2.png",
  "/src/asset/images/event-img.png",
  "/src/asset/images/expand.png",
  "/src/asset/images/fea-cal-1.png",
  "/src/asset/images/fea-cal-2.png",
  "/src/asset/images/fea-cal-3.png",
  "/src/asset/images/fea-cal-4.png",
  "/src/asset/images/fea-cal-5.png",
  "/src/asset/images/fea-cal-6.png",
  "/src/asset/images/fea-cal-7.png",
  "/src/asset/images/fea-cal-8.png",
  "/src/asset/images/fea-cal-9.png",
  "/src/asset/images/frost.png",
  "/src/asset/images/helsinki.png",
  "/src/asset/images/home-banner.jpg",
  "/src/asset/images/hormony.png",
  "/src/asset/images/img+gradient.png",
  "/src/asset/images/kevin.png",
  "/src/asset/images/logo_old.png",
  "/src/asset/images/map.png",
  "/src/asset/images/marvel.png",
  "/src/asset/images/montreal.png",
  "/src/asset/images/nightcage.png",
  "/src/asset/images/profile.png",
  "/src/asset/images/seattle.png",
  "/src/asset/images/seti.png",
  "/src/asset/images/setting.png",
  "/src/asset/images/stella.png",
  "/src/asset/images/support.jpg",
  "/src/asset/images/times-logo.png",
  "/src/asset/images/toronto.png",
  "/src/asset/images/uprising.png",
  "/src/asset/images/user-events-cover.jpg",
  "/src/asset/images/valley.png",
  "/src/asset/images/vancouver.png",
  "/src/asset/images/vancouver-city-events.jpg",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-regular-400.woff2",
];

// HTML pages to cache
const HTML_PAGES = [
  "/views/auth/login.html",
  "/views/auth/signup.html",
  "/views/bookmarks/bookmark.html",
  "/views/bookmarks/bookmarks_1.html",
  "/views/event/calendar_1.html",
  "/views/event/calendar.html",
  "/views/event/city-events.html",
  "/views/event/create-event.html",
  "/views/event/event_1.html",
  "/views/event/event-details.html",
  "/views/event/event.html",
  "/views/event/post-event-details.html",
  "/views/event/post-event-details_1.html",
  "/views/event/post-event-details_2.html",
  "/views/event/user-events.html",
  "/views/game/game-details.html",
  "/views/game/games.html",
  "/views/game/my-games.html",
  "/views/game/night-cage-tutorial.html",
  "/views/home/index.html",
  "/views/tutorial/tutorial.html",
  "/views/user/activity.html",
  "/views/user/preferences.html",
  "/views/user/profile.html",
  "/views/user/profile_1.html",
  "/views/user/setting.html",
  "/views/user/settings.html",
  "/views/user/support.html",
  "/views/user/support_1.html",
];

// Install event - cache static files and HTML pages
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Caching static files...");
        return cache.addAll(STATIC_FILES);
      }),
      // Cache HTML pages
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log("Caching HTML pages...");
        return cache.addAll(HTML_PAGES);
      }),
    ])
      .then(() => {
        console.log("Service Worker: Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Error during installation", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== DATA_CACHE
            ) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activation complete");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE)
  if (request.method !== "GET") {
    return;
  }

  // Skip Firebase write operations and external APIs
  if (shouldSkipCaching(request, url)) {
    return;
  }

  // Handle different types of requests
  if (request.destination === "document") {
    // HTML pages - network first, fallback to cache
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === "image") {
    // Images - cache first, fallback to network
    event.respondWith(handleImageRequest(request));
  } else if (
    request.destination === "style" ||
    request.destination === "script"
  ) {
    // CSS/JS - cache first, fallback to network
    event.respondWith(handleStaticAssetRequest(request));
  } else if (url.pathname.includes("/api/")) {
    // API requests - network first, fallback to cache
    event.respondWith(handleAPIRequest(request));
  } else {
    // Other requests - network first, fallback to cache
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request should be skipped for caching
function shouldSkipCaching(request, url) {
  // Skip Firebase write operations
  if (
    url.hostname.includes("firebase") &&
    (request.method === "POST" ||
      request.method === "PUT" ||
      request.method === "DELETE")
  ) {
    return true;
  }

  // Skip external APIs that don't support caching
  if (
    url.hostname.includes("googleapis") ||
    url.hostname.includes("localhost:3000")
  ) {
    return true;
  }

  return false;
}

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response.status === 200) {
      // Cache successful responses
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log("Network failed for document, trying cache...");

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline.html for navigation requests
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }

    throw error;
  }
}

// Handle image requests
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fallback to network
    const response = await fetch(request);

    if (response.status === 200) {
      // Cache successful responses
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log("Image fetch failed:", error);
    // Return a placeholder image or throw error
    throw error;
  }
}

// Handle static asset requests (CSS, JS)
async function handleStaticAssetRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fallback to network
    const response = await fetch(request);

    if (response.status === 200) {
      // Cache successful responses
      const responseClone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log("Static asset fetch failed:", error);
    throw error;
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response.status === 200) {
      // Cache successful API responses
      const responseClone = response.clone();
      caches.open(DATA_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log("API request failed, trying cache...");

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response.status === 200) {
      // Cache successful responses
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log("Request failed, trying cache...");

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any pending offline actions
      handleOfflineActions()
    );
  }
});

// Handle offline actions when connection is restored
async function handleOfflineActions() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await processOfflineAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error("Failed to process offline action:", error);
      }
    }
  } catch (error) {
    console.error("Error handling offline actions:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Push notification received");

  const options = {
    body: event.data ? event.data.text() : "New notification from Luma",
    icon: "/src/asset/images/logo.png",
    badge: "/src/asset/images/logo.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/src/asset/images/logo.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/src/asset/images/logo.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Luma", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_DATA") {
    cacheData(event.data.key, event.data.data);
  }

  if (event.data && event.data.type === "GET_CACHED_DATA") {
    getCachedData(event.data.key).then((data) => {
      event.ports[0].postMessage({ data });
    });
  }
});

// Cache data in IndexedDB
async function cacheData(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(["cache"], "readwrite");
    const store = tx.objectStore("cache");
    await store.put({ key, data, timestamp: Date.now() });
    console.log(`Cached data for key: ${key}`);
  } catch (error) {
    console.error("Error caching data:", error);
  }
}

// Get cached data from IndexedDB
async function getCachedData(key) {
  try {
    const db = await openDB();
    const tx = db.transaction(["cache"], "readonly");
    const store = tx.objectStore("cache");
    const result = await store.get(key);
    return result ? result.data : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    return null;
  }
}

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LumaOfflineDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create cache store
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

// Store pending offline actions
async function storePendingAction(action) {
  try {
    const db = await openDB();
    const tx = db.transaction(["pendingActions"], "readwrite");
    const store = tx.objectStore("pendingActions");
    await store.add({
      ...action,
      timestamp: Date.now(),
    });
    console.log("Stored pending action:", action.type);
  } catch (error) {
    console.error("Error storing pending action:", error);
  }
}

// Get pending actions
async function getPendingActions() {
  try {
    const db = await openDB();
    const tx = db.transaction(["pendingActions"], "readonly");
    const store = tx.objectStore("pendingActions");
    return await store.getAll();
  } catch (error) {
    console.error("Error getting pending actions:", error);
    return [];
  }
}

// Remove pending action
async function removePendingAction(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(["pendingActions"], "readwrite");
    const store = tx.objectStore("pendingActions");
    await store.delete(id);
    console.log("Removed pending action:", id);
  } catch (error) {
    console.error("Error removing pending action:", error);
  }
}

// Process offline action
async function processOfflineAction(action) {
  switch (action.type) {
    case "comment":
      // Process comment posting
      console.log("Processing offline comment:", action.data);
      break;
    case "bookmark":
      // Process bookmark action
      console.log("Processing offline bookmark:", action.data);
      break;
    default:
      console.log("Unknown action type:", action.type);
  }
}
