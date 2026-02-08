const CACHE_NAME = "readify-v1.0.3";

// Core HTML and CSS files needed for offline shell loading.
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

// App scripts to keep available from the service worker cache.
const JS_FILES = [
  "./javascript/main.js",
  "./javascript/explorer.js",
  "./javascript/flow.js",
  "./javascript/games.js",
  "./javascript/recommender.js",
  "./javascript/tracker.js",
  "./javascript/feedback.js",
  "./javascript/books.js",
  "./javascript/script.js",
  "./javascript/index.js"
];

// Static images used throughout the app UI.
const IMAGES= [
  "./assets/books/book1.jpg",
  "./assets/books/book2.jpg",
  "./assets/books/book3.jpg",
  "./assets/books/book4.jpg",
  "./assets/books/book5.jpg",
  "./assets/books/book6.jpg",
  "./assets/books/book7.jpg",
  "./assets/books/book8.jpg",
  "./assets/books/book9.jpg",
  "./assets/books/book10.jpg",
  "./assets/books/book11.jpg",
  "./assets/books/book12.jpg",
  "./assets/author/author1.jpg",
  "./assets/author/author2.jpg",
  "./assets/author/author3.jpg",
  "./assets/author/author4.jpg",
  "./assets/author/author5.jpg",
  "./assets/logo/big_logo.png"
];

// Single list used during install caching.
const ASSETS_TO_CACHE = [...CORE_ASSETS, ...JS_FILES, ...IMAGES];

// Pre-cache required assets during service worker install.
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    for (const url of ASSETS_TO_CACHE) {
      try {
        await cache.add(url);
      } catch (err) {
        console.error("Failed to cache:", url, err);
      }
    }

    self.skipWaiting();
  })());
});

// Remove old cache versions when activating a new worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// Serve cached content first/with fallback depending on request type.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML = req.headers.get("accept")?.includes("text/html");
  const isImage = req.destination === "image";
  const isStyleOrScript =
    req.destination === "style" ||
    req.destination === "script" ||
    /\.css$/i.test(url.pathname) ||
    /\.js$/i.test(url.pathname);

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./")))
    );
    return;
  }

  if (isImage) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            return res;
          })
          .catch(() => caches.match("./android-chrome-192x192.png"));
      })
    );
    return;
  }

  if (isStyleOrScript) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
