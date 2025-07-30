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

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
     
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
  
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
    
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Firebase and external API requests
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("localhost:3000") ||
    url.pathname.includes("/api/")
  ) {
    return;
  }

  // Handle different types of requests
  if (request.destination === "document") {
    // HTML pages - try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Fallback to offline.html for offline state
            return caches.match("/offline.html");
          });
        })
    );
  } else if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image"
  ) {
    // Static assets - try cache first, fallback to network
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  } else {
    // Other requests - network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {


  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any pending offline actions

    );
  }
});

// Push notification handling
self.addEventListener("push", (event) => {


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


  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
 

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
