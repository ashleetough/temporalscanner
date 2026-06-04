const CACHE = 'temporal-printer-v1';
const PRECACHE = ['/', '/temporal_printer_mobile.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const shouldCache = url.origin === self.location.origin || url.origin === 'https://unpkg.com';
  if (!shouldCache) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        caches.open(CACHE).then(c => c.put(e.request, response.clone()));
        return response;
      }).catch(() => cached);
    })
  );
});
