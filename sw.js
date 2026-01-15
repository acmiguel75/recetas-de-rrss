
// basic service worker
const CACHE_NAME = 'smart-recetario-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle shared data
  if (event.request.method === 'GET' && event.request.url.includes('?url=')) {
    // Let the frontend handle the query parameters
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
