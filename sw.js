// sw.js - basic service worker cache
const CACHE_NAME = 'r2-static-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/js/app.js'
];

self.addEventListener('install', (evt)=>{
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (evt)=>{
  evt.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (evt)=>{
  if(evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then(resp=>resp||fetch(evt.request))
  );
});
