// Cache name with version for easy updates
const CACHE_NAME = 'dp-attendance-cache-v1';

// Assets to precache - only include files we know exist
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg'
  // Removed potentially missing files
];

// Runtime caching resources (will be cached as they're fetched)
const RUNTIME_CACHE_URLS = [
  /\/assets\//,
  /\.(?:js|css|woff2)$/,
  /\.(jpe?g|png|gif|svg|webp)$/
];

// Install event with better error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching app assets');
        // Cache each asset individually to prevent failure if one is missing
        return Promise.all(
          PRECACHE_ASSETS.map(url => {
            return fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to cache: ${url}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.warn(`Skipping cache for ${url}: ${error.message}`);
                // Continue with installation even if one asset fails
                return Promise.resolve();
              });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;
  
  // Skip browser-sync or API requests
  if (
    event.request.url.includes('/browser-sync/') || 
    event.request.url.includes('/sockjs-node/') ||
    event.request.url.includes('/api/')
  ) {
    return;
  }

  // Apply runtime caching for assets
  const shouldCacheAsset = RUNTIME_CACHE_URLS.some(pattern => 
    pattern.test(event.request.url)
  );

  // Navigation requests (HTML documents) - network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // Assets - cache first, network fallback (for non-HTML resources)
  if (shouldCacheAsset) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          fetchAndUpdateCache(event.request);
          return cachedResponse;
        }
        
        // No cache, go to network
        return fetchAndUpdateCache(event.request);
      })
    );
    return;
  }

  // Default: try network first then fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Helper to fetch and update cache
function fetchAndUpdateCache(request) {
  return fetch(request).then(response => {
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }

    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then(cache => {
      cache.put(request, responseToCache);
    });

    return response;
  });
}

// Message event - handle messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 