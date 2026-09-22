/**
 * Service Worker para Muzzaga Pádel
 * Proporciona soporte offline para el catálogo de la cantina, pase digital y herramientas.
 */

const CACHE_NAME = "muzzaga-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/menu",
  "/torneos",
  "/herramientas/dividir-gastos",
  "/herramientas/nivel",
  "/herramientas/pizarra",
  "/herramientas/americano",
  "/img/logo_badge.png",
  "/img/logo_full.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones GET en el mismo origen
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Peticiones de API no se cachean con service worker
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no hay cache, fallback básico si es HTML
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
