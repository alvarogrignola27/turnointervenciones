// Service Worker para Turnos de Intervenciones
// Estrategia: network-first para HTML/JS (para que las nuevas versiones lleguen
// rápido), cache-first para assets estáticos. Firebase nunca se cachea.

const CACHE_NAME = 'turnos-v76';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // NO llamar skipWaiting automáticamente — esperamos a que el usuario apruebe
  // la actualización desde la UI (botón "Actualizar"). El cliente envía
  // {type:'SKIP_WAITING'} cuando esté listo.
});

// Permitir que la app pida al SW que se active de inmediato
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // NUNCA cachear Firebase ni Google APIs (necesitan red)
  if (url.includes('firebase') ||
      url.includes('googleapis.com') ||
      url.includes('firebaseio.com') ||
      url.includes('gstatic.com') ||
      url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Network-first para HTML, JS, CSS (para que las actualizaciones lleguen)
  const isCode = url.endsWith('.html') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('/');
  if (isCode) {
    event.respondWith(
      // cache:'no-cache' fuerza al SW a saltearse la cache HTTP del navegador
      // y siempre revalidar con el servidor. Esto + updateViaCache:'none' en el
      // register garantiza que las actualizaciones lleguen rápido.
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first para assets (íconos, etc)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
