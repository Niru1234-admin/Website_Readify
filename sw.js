const CACHE_NAME = "readify-v1.0.1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./explorer.html",
  "./flow.html",
  "./games.html",
  "./recommender.html",
  "./tracker.html",
  "./feedback.html",
  "./css/reset.css",
  "./css/styles.css",
  "./css/games.css",
  "./apple-touch-icon.png",
  "./favicon-16x16.png",
  "./favicon-32x32.png",
  "./android-chrome-192x192.png",
  "./android-chrome-512x512.png",
  "./manifest.json"
];

const JS_FILES = [
  "./javascript/main.js",
  "./javascript/explorer.js",
  "./javascript/flow.js",
  "./javascript/games.js",
  "./javascript/recommender.js",
  "./javascript/tracker.js",
  "./javascript/feedback.js",
  "./javascript/books.js",
  "./javascript/script.js"
];

const ASSETS_TO_CACHE = [...CORE_ASSETS, ...JS_FILES];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isHTML = req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
      );
    })
  );
});
