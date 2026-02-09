const CACHE_NAME = "readify-v1.0.7";

/* Core app shell files */
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

/* JavaScript files */
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

/* Images used across the app */
const IMAGES = [
  "./assets/books/book1.webp",
  "./assets/books/book2.webp",
  "./assets/books/book3.webp",
  "./assets/books/book4.webp",
  "./assets/books/book5.webp",
  "./assets/books/book6.webp",
  "./assets/books/book7.webp",
  "./assets/books/book8.webp",
  "./assets/books/book9.webp",
  "./assets/books/book10.webp",
  "./assets/books/book11.webp",
  "./assets/books/book12.webp",
  "./assets/author/author1.webp",
  "./assets/author/author2.webp",
  "./assets/author/author3.webp",
  "./assets/author/author4.webp",
  "./assets/author/author5.webp",
  "./assets/logo/big_logo.webp"
];

const ASSETS_TO_CACHE = [...CORE_ASSETS, ...JS_FILES, ...IMAGES];

/* Install: pre-cache app assets */
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

/* Activate: clean old caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

/* Fetch handling */
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

  /* Detect partial (range) requests */
  const isRangeRequest = req.headers.has("range");

  /* Only cache safe, full responses */
  const shouldCacheResponse = (res) => {
    if (!res) return false;
    if (!res.ok) return false;
    if (res.status !== 200) return false;
    if (res.type === "opaque") return false;
    return true;
  };

  /* HTML: network first */
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (shouldCacheResponse(res)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match("./"))
        )
    );
    return;
  }

  /* Images: cache first, avoid caching range (206) responses */
  if (isImage) {
    if (isRangeRequest) {
      event.respondWith(
        fetch(req).catch(() =>
          caches.match("./android-chrome-192x192.png")
        )
      );
      return;
    }

    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req)
          .then((res) => {
            if (shouldCacheResponse(res)) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() =>
            caches.match("./android-chrome-192x192.png")
          );
      })
    );
    return;
  }

  /* CSS & JS: network first to avoid stale layout/scripts */
  if (isStyleOrScript) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (shouldCacheResponse(res)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  /* Default: cache first with network fallback */
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (shouldCacheResponse(res)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
