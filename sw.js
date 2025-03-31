// sw.js

const CACHE_NAME = 'guia-cache-v1'; // Change version when you update assets
const urlsToCache = [
  '/', // Cache the root (often index.html)
  '/index.html',
  '/style.css',
  '/script.js',
  // Add paths to your specific icons used in manifest and meta tags
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png',
  // Add other essential assets (fonts, maybe key sounds if preloaded)
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap', // Cache font CSS
  // Note: Caching external resources like Google Fonts requires careful handling
];

// Install event: Cache necessary assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
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

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
       console.log('Service Worker: Activation complete');
       return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});

// Fetch event: Serve cached assets first (Cache First Strategy)
self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        // Not in cache - fetch from network
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
             // Optional: Cache the newly fetched resource dynamically
             // Be careful with this - might cache unwanted things if not restricted
             /*
             (networkResponse) => {
                if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return networkResponse;
             }
             */
             networkResponse => networkResponse // Just return network response if not caching dynamically
        ).catch(error => {
            console.error('Service Worker: Fetch failed', error);
            // Optional: Return a fallback offline page here if fetch fails
            // return caches.match('/offline.html');
        });
      })
  );
});