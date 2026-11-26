/* SORILLO: guarda la app en el móvil para que abra sin cobertura. Los datos van aparte (Firestore). */
const C = 'sorillo-demo-v1';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const guarda = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then((c) => c.put(req, cp)); } return res; };
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* la app: primero la red (para recibir mejoras), si no hay cobertura la copia guardada */
    e.respondWith(fetch(r, { cache: 'no-cache' }).then((res) => guarda(r, res)).catch(() => caches.match(r).then((m) => m || caches.match('./index.html'))));
  } else if (/(^|\.)gstatic\.com$|^fonts\.googleapis\.com$|^cdnjs\.cloudflare\.com$/.test(u.hostname)) {
    /* librerías y tipografías: la copia guardada, y si no hay, la red */
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => guarda(r, res))));
  }
});
