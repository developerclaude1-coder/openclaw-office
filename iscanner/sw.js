// sw.js — service worker for offline support. Caches the app shell so Scanly
// works with no network once installed. Bump CACHE on any asset change.
const CACHE = "scanly-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./js/app.js",
  "./js/db.js",
  "./js/ui.js",
  "./js/geometry.js",
  "./js/edge-detect.js",
  "./js/filters.js",
  "./js/pdf.js",
  "./js/crop-editor.js",
  "./js/filter-editor.js",
  "./js/export.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((resp) => {
          // Runtime-cache same-origin GETs so future loads are offline-safe.
          if (resp.ok && new URL(request.url).origin === self.location.origin) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return resp;
        })
        .catch(() => cached);
    }),
  );
});
