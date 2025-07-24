const CACHE_NAME = "luma-v1.0.0";
const STATIC_CACHE = "luma-static-v1.0.0";
const DYNAMIC_CACHE = "luma-dynamic-v1.0.0";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/output.css",
  "/src/asset/css/",
  "/js/main.js",
  "/js/inject.js",
  "/js/pwa.js",
  "/js/auth/authGuard.js",
  "/js/auth/login.js",
  "/js/auth/signup.js",
  "/js/auth/signout.js",
  "/js/checkAuthStatus.js",
  "/service/gameService.js",
  "/config/firebase.js",
  "/components/navbar.html",
  "/components/sidebar.html",
  "/components/footer.html",
  "/components/hero.html",
  "/src/asset/images/logo.png",
  "/src/asset/images/placeholder.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-regular-400.woff2",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error);
      })
  );
  self.skipWaiting();
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
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Claiming clients");
        return self.clients.claim();
      })
  );
});


self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // 🧠 Handle all HTML navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Skip Firebase Admin SDK requests and Google APIs
  if (url.hostname.includes("googleapis") || url.pathname.includes("/api/")) {
    return;
  }

  // 🧠 Cache-first for CSS/JS/images
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((res) => {
        if (res) return res;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) =>
              cache.put(request, response.clone())
            );
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) =>
            cache.put(request, res.clone())
          );
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});


// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any pending offline actions
      console.log("Processing background sync...")
    );
  }
});

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received");

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
  console.log("Service Worker: Notification clicked");

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
