// sw.js

const CACHE_NAME = 'guide-app-v1';
const ASSETS = [
  './',
  './index.html',
  './public/css/style.css',
  './manifest.json',
  './src/js/main.js',
  './src/js/config/constants.js',
  './src/js/core/gameLogic.js',
  './src/js/core/levels.js',
  './src/js/core/state.js',
  './src/js/ui/domElements.js',
  './src/js/ui/ui.js',
  './src/js/utils/audio.js',
  './src/js/utils/utils.js',
  './public/images/icons/icon-72x72.png',
  './public/images/icons/icon-96x96.png',
  './public/images/icons/icon-144x144.png',
  './public/images/icons/icon-192x192.png',
  './public/images/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap',
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Force activation immediately after install
      })
      .catch(error => {
         console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
       console.log('Service Worker: Activation complete');
       return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached response if found
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        // Else fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache responses that aren't successful or from our origin
            if (!response.ok || !event.request.url.startsWith(self.location.origin)) {
              return response;
            }
            
            // Clone the response to use it and cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a fallback for HTML files
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            // Or return nothing for other types of requests
            return new Response('Not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});