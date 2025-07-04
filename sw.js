
const CACHE_NAME = 'urbansense-cache-v1';
// These are the core files for the app shell.
// Other files will be cached dynamically by the fetch event handler.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg'
];

// On install, pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// On fetch, serve from cache, fallback to network, then cache the network response
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If we have a cached response, return it.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If not in cache, fetch from the network.
                return fetch(event.request).then(networkResponse => {
                    // Don't cache requests to the Gemini API.
                    if (event.request.url.includes('googleapis.com')) {
                        return networkResponse;
                    }
                    
                    // Check for a valid response to cache.
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return networkResponse;
                }).catch(error => {
                    console.error('Fetch failed; returning offline fallback if available.', error);
                    // This is where you could return a generic offline fallback page,
                    // but for this app, if the shell is cached, it should still load.
                });
            })
    );
});
