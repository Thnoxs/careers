const CACHE_NAME = "protocol-cache-v2"; // Version update kiya taki naya cache bane
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/image/favicon.png", // Apna favicon bhi add kar lo
  "https://cdn.tailwindcss.com",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files cache ho rahi hain...");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting(); // Naye service worker ko turant active karne ke liye
});

// Activate Event - Purane kachre (old cache) ko saaf karne ke liye
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Purana cache delete ho raha hai...");
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch Event - Smart offline fallback ke sath
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar cache mein file hai, toh wahi return karo
      if (response) {
        return response;
      }

      // Agar nahi hai, toh internet se laane ki koshish karo
      return fetch(event.request).catch(() => {
        // Agar internet band hai aur user page load kar raha hai, toh HTML fallback de do
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    }),
  );
});
