self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('reflection-v1').then((cache) => {
      return cache.addAll(['./', './index.html', './styles/app.css', './scripts/app.js']);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
