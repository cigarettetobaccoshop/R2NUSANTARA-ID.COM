const CACHE_NAME = 'r2-nusantara-v4';
const urlsToCache = [
  '/id.com/',
  '/id.com/index.html',
  '/id.com/style.css',
  '/id.com/app.js',
  '/id.com/data.js',
  '/id.com/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(function(){})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
