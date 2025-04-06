// sw.js

// Increase this version number whenever you make changes to the app
const CACHE_VERSION = 'v2'; 
const CACHE_NAME = `guide-app-${CACHE_VERSION}`;

// Static assets that rarely change
const STATIC_CACHE_NAME = `guide-static-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  './public/images/icons/icon-72x72.png',
  './public/images/icons/icon-96x96.png',
  './public/images/icons/icon-144x144.png',
  './public/images/icons/icon-192x192.png',
  './public/images/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Dynamic assets that may change frequently
const DYNAMIC_ASSETS = [
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
  './src/js/utils/utils.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache dynamic assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching dynamic assets');
        return cache.addAll(DYNAMIC_ASSETS);
      })
    ])
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
        cacheNames.filter(name => {
          // Delete old caches that don't match our current version
          return name.startsWith('guide-') && 
                 !name.includes(CACHE_VERSION);
        }).map(name => {
          console.log('Service Worker: Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => {
       console.log('Service Worker: Activation complete');
       return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});

// Helper function to determine if a request is for a dynamic asset
function isDynamicAsset(url) {
  const requestUrl = new URL(url);
  // Consider HTML, JavaScript, and CSS files as dynamic assets
  return requestUrl.pathname.endsWith('.html') || 
         requestUrl.pathname.endsWith('.js') || 
         requestUrl.pathname.endsWith('.css') ||
         requestUrl.pathname === '/'; // Root path (index.html)
}

// Fetch event - implement a smarter caching strategy
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Only handle requests from our origin
  if (requestUrl.origin === self.location.origin) {
    // Special handling for navigation requests (URLs with hash fragments)
    if (event.request.mode === 'navigate' || 
        (event.request.method === 'GET' && 
         event.request.headers.get('accept').includes('text/html'))) {
      
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response to use it and cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no exact match in cache, serve index.html
                return caches.match('./index.html');
              });
          })
      );
      return; // End processing this request
    }
    
    // For HTML and JS files: Network-first, fallback to cache
    if (isDynamicAsset(event.request.url)) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response to use it and cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  console.log('Service Worker: Serving from cache after network failure:', event.request.url);
                  return cachedResponse;
                }
                
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
    }
    // For static assets: Cache-first, fallback to network
    else {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache, fetch from network and cache it
            return fetch(event.request)
              .then(response => {
                // Clone the response to use it and cache it
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                
                return response;
              });
          })
      );
    }
  }
});

// Listen for the message event to update the cache on user action
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});