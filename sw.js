/**
 * Nelsmari Sous Vide - Service Worker
 * Cache-first para assets estáticos, network-first para CSV y HTML.
 */

const CACHE_NAME = 'nelsmari-v7';
const STATIC_ASSETS = [
  '/',
  '/assets/css/style.css',
  '/assets/js/analytics.js',
  '/assets/js/config.js',
  '/assets/js/cart.js',
  '/assets/js/csv-loader.js',
  '/assets/js/menu.js',
  '/assets/js/combos.js',
  '/assets/js/checkout.js',
  '/assets/js/whatsapp.js',
  '/assets/js/home.js',
  '/assets/js/product-detail.js',
  '/assets/img/ui/logo.webp',
  '/assets/img/ui/favicon-32.png',
  '/assets/img/ui/favicon-192.png'
];

// Install: pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML/CSV, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and external requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // HTML and CSV: network first, fallback to cache
  if (event.request.destination === 'document' || url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache images and assets on the fly
        if (response.ok && (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
