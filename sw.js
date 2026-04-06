const CACHE_NAME = "protocol-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "https://cdn.tailwindcss.com",
];

// Install event - Jab pehli baar site khulegi, in files ko download karke save kar lega
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

// Fetch event - Jab net nahi hoga, tab ye saved files ko browser ko dega
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar file cache me mil gayi toh wahi dedo, warna internet se laane ki koshish karo
      return response || fetch(event.request);
    }),
  );
});
