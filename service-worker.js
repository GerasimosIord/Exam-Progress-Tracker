const CACHE_NAME = 'study-tracker-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
