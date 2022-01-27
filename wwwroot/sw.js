var cacheName = 'hello-pwav21';
var filesToCache = [
    '/index.html',
    '/pageone.html',
    '/css/style.css',
    '/js/main.js',
    '/favicon.svg',
    '/images/favicon.png',
    '/manifest.json'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', (e) => {
    // Activate immediately
    self.skipWaiting();

    // Caches everything in 'filesToCache'
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching all: app shell and content to ${cacheName}`);
        await cache.addAll(filesToCache);
    })());
});


/* Clear the Cache */
self.addEventListener('activate', (e) => {
    console.log("[Service Worker] Activate");
    e.waitUntil(clients.claim());
    console.log("[Service Worker] Claimed all clients");

    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key === cacheName) {
                return;
            }
            else {
                // Delete old caches
                console.log(`New cache is ${cacheName}, deleting old cache: ${key}`);
                return caches.delete(key);
            }
        }))
    }));
});

/* Serve cached content when offline */
self.addEventListener('fetch', (e) => {
    // Gets resource from cache, otherwise gets resource from network and caches it
    console.log("[Service Worker] Fetch");

    e.respondWith((async () => {
        const resource = await caches.open(cacheName).then(function (cache) {
            return caches.match(e.request);
        });

        if (resource) {
            // Use Cache
            console.log(`[Service Worker] Fetching resource from cache ${cacheName}: ${e.request.url}`);
            return resource;
        }
        else {
            // Get from Network
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Fetching and caching new resource to ${cacheName}: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
		} 
    })());
});