const CACHE_NAME = 'reservapro-v25';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'security.js',
  'script.js',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap',
  'https://res.cloudinary.com/dkfbcedvr/image/upload/v1770047092/bdfqj2q5ntyfphrxk1bs.png',
  'https://res.cloudinary.com/dkfbcedvr/image/upload/v1770045309/main-sample.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
  // Nettoyage des anciens caches si nécessaire
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});