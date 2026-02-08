const CACHE_NAME = "readify-v1.0.4";

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

const PRECACHE = [...CORE_ASSETS, ...JS_FILES];

const toScopedUrl = (p) => new URL(p, self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    const scopedList = PRECACHE.map(toScopedUrl);

    await cache.addAll(scopedList);

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)));
    await self.clients.claim();
  })());
});

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

  // HTML: network-first, fallback to cached shell
  if (isHTML) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
        return res;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match(toScopedUrl("./index.html"));
      }
    })());
    return;
  }

  // Images: cache-first 
  if (isImage) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
        return res;
      } catch {
        return caches.match(toScopedUrl("./android-chrome-192x192.png"));
      }
    })());
    return;
  }

  // Network-first (keeps updates), fallback to cache
  if (isStyleOrScript) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: "no-store" });
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
        return res;
      } catch {
        return caches.match(req);
      }
    })());
    return;
  }

  // Default: cache-first then network
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
      return res;
    } catch {
      return caches.match(toScopedUrl("./index.html"));
    }
  })());
});
