/* Calculadora CSM — service worker: la app queda disponible sin conexión. */
const CACHE = 'neocalc-csm-v1';
const ARCHIVOS = [
  './', './index.html', './css/styles.css',
  './js/calculo.js', './js/datos-medicamentos.js', './js/datos-tablas.js',
  './js/datos-nutricion.js', './js/app.js',
  './assets/logo-csm.png', './assets/isotipo-csm.png',
  './assets/icono-192.png', './assets/icono-512.png',
  './assets/icono-maskable-512.png', './assets/icono-ios-180.png',
  './manifest.webmanifest'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html')))
  );
});
