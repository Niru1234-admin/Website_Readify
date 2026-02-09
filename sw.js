const CACHE_NAME = "readify-v1.0.5";

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
  "./assets/author/author1.jpg",
  "./assets/author/author2.jpg",
  "./assets/author/author3.jpg",
  "./assets/author/author4.jpg",
  "./assets/author/author5.jpg",
  "./assets/logo/big_logo.webp"
];

const ASSETS_TO_CACHE = [...CORE_ASSETS, ...JS_FILES, ...IMAGES];

/* Convert relative paths to absolute URLs (GitHub Pages safe) */
const toAbsoluteURL = (path) =>
  new URL(path, self.registration.scope).toString();

/* Check if a response is safe to cache */
const canCache = (res) => {
  if (!res) return false;
  if (!res.ok) return false;
  if (res.status !== 200) return false;
  if (res.type === "opaque") return false;
  return true;
};

/* Install event: cache files safely */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const asset of ASSETS_TO_CACHE) {
        const url = toAbsoluteURL(asset);
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (canCache(res)) {
            await cache.put(url, res.clone());
          }
        } catch (err) {
          console.warn("Cache skipped:", url);
        }
      }

      self.skipWaiting();
    })()
  );
});

/* Activate event: remove old caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      );
      self.clients.claim();
    })()
  );
});

/* Fetch handling */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === "navigate" ||
    req.headers.get("accept")?.includes("text/html");

  const isImage = req.destination === "image";
  const isCSSorJS =
    req.destination === "style" ||
    req.destination === "script" ||
    /\.css$/i.test(url.pathname) ||
    /\.js$/i.test(url.pathname);

  const isRangeRequest = req.headers.has("range");

  /* HTML: network first */
  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (canCache(res)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(req, res.clone());
          }
          return res;
        } catch {
          return (
            (await caches.match(req)) ||
            (await caches.match(toAbsoluteURL("./index.html")))
          );
        }
      })()
    );
    return;
  }

  /* Images: cache first, ignore range requests */
  if (isImage) {
    if (isRangeRequest) {
      event.respondWith(fetch(req));
      return;
    }

    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
          const res = await fetch(req);
          if (canCache(res)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(req, res.clone());
          }
          return res;
        } catch {
          return caches.match(toAbsoluteURL("./android-chrome-192x192.png"));
        }
      })()
    );
    return;
  }

  /* CSS & JS: network first */
  if (isCSSorJS) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req, { cache: "no-store" });
          if (canCache(res)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(req, res.clone());
          }
          return res;
        } catch {
          return caches.match(req);
        }
      })()
    );
    return;
  }

  /* Default: cache first */
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        if (canCache(res)) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, res.clone());
        }
        return res;
      } catch {
        return caches.match(toAbsoluteURL("./index.html"));
      }
    })()
  );
});