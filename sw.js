/**
 * @file sw.js
 * This is the Service Worker file for the Progressive Web App (PWA).
 * A service worker is a script that the browser runs in the background, separate from a web page,
 * enabling features that don't need a web page or user interaction.
 * Key features enabled here are offline capabilities through caching.
 */

// A unique name for the cache. Changing this name will effectively version the cache,
// allowing the 'activate' event to clean up old caches.
const CACHE_NAME = 'urbansense-cache-v1';

// An array of URLs representing the "app shell" – the minimal HTML, CSS, and JavaScript
// required to power the user interface. These will be cached on install.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg'
  // Note: The main JS and CSS files are often added to this list in more complex build setups,
  // but for our simple PWA, caching the entry points is sufficient, and the fetch handler
  // will cache other assets dynamically.
];

/**
 * The 'install' event is the first event a service worker gets.
 * It's only called once per service worker.
 * We use this event to pre-cache the essential files for the app shell.
 */
self.addEventListener('install', event => {
  // `event.waitUntil` tells the browser that work is ongoing until the promise settles,
  // and it shouldn't terminate the service worker if it wants to continue.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

/**
 * The 'activate' event is fired when the service worker starts up.
 * It's a good place to manage old caches.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache name is not in our whitelist, it's an old cache, so we delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * The 'fetch' event fires every time the app requests a resource (e.g., an image, a script, an API call).
 * We can intercept these requests and respond with cached assets if available.
 * This is the core of the offline-first strategy.
 */
self.addEventListener('fetch', event => {
    // We only want to handle GET requests for caching. Other requests (like POST) should pass through.
    if (event.request.method !== 'GET') {
        return;
    }

    // `event.respondWith` hijacks the fetch request and allows us to provide our own response.
    event.respondWith(
        // 1. Try to find a matching response in the cache.
        caches.match(event.request)
            .then(cachedResponse => {
                // If a cached response is found, return it immediately. This is the "cache-first" part.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 2. If not in the cache, fetch it from the network.
                return fetch(event.request).then(networkResponse => {
                    // We don't want to cache requests to third-party APIs like Google's.
                    if (event.request.url.includes('googleapis.com')) {
                        return networkResponse;
                    }
                    
                    // 3. If the network request is successful, cache the response for future use.
                    // We must clone the response because a response is a stream and can only be consumed once.
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    // Return the response from the network.
                    return networkResponse;
                }).catch(error => {
                    // This catch block is triggered if the network fetch fails (e.g., user is offline).
                    console.error('Fetch failed; returning offline fallback if available.', error);
                    // For this app, if the app shell is already cached, it will load, and only
                    // dynamic content (like new AI responses) will fail, which is handled in the app's UI.
                    // A more advanced implementation could return a specific "offline" page here.
                });
            })
    );
});
