import { build, files, version } from '$service-worker';

const CACHE_NAME = `selerasi-cache-v${version}`;

// Gabungkan semua file build (JS/CSS) dan static assets
const ASSETS_TO_CACHE = [
  '/',
  ...build,
  ...files
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya proses metode GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Jangan cache request API lokal maupun database Supabase
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, kembalikan langsung (Cache First untuk aset statis)
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cek keabsahan response sebelum disimpan ke cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache aset yang baru diakses secara dinamis
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Fallback navigasi offline (kembali ke root index) jika tidak terkoneksi internet
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
