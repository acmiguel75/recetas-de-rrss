
const CACHE_NAME = 'recetario-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Si es un share_target, redirigimos con los parámetros
  if (url.pathname === '/' && (url.searchParams.has('text') || url.searchParams.has('url'))) {
    event.respondWith(Response.redirect('/' + url.search, 303));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
