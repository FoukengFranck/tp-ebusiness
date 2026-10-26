const CACHE_NAME = "batobaye-cache-v1";
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles.css", "/src/main.jsx"];

// Installation du Service Worker et mise en cache des assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Stratégie "Cache First, falling back to Network" pour les assets,
// et "Network First" pour l'API Laravel
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Si c'est une requête vers l'API Laravel (produits ou panier)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Vous êtes hors ligne. Données indisponibles.",
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    return;
  }

  // Pour le reste (interface statique)
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
      .catch(() => {
        // Page de secours en cas de perte totale de réseau sur une page non mise en cache
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      }),
  );
});
