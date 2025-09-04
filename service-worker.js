const CACHE_NAME = "sorteador-virtual-cache-v1";
const FILES_TO_CACHE = [
    "index.html",
    "style.css",
    "manifest.json",
    "icons/icon-540.png",
    "icons/logo.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => 
                caches.match("index.html")
            )
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((resp) => {
                return (
                    resp ||
                    fetch(event.request).then((response) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response.clone());
                            return response;
                        });
                    }).catch(() => caches.match(event.request))
                );
            })
        );
    }
});    