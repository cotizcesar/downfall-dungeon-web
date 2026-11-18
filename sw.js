/* DOWNFALL DUNGEON service worker: keeps the engine and the font so the game starts without internet.
   The game page itself is fetched fresh whenever there is a connection (so updates always arrive) and served from the cache when there is none. */
const CACHE = 'downfall-v1';
const KEEP = h => h === 'cdn.jsdelivr.net' || h === 'fonts.googleapis.com' || h === 'fonts.gstatic.com';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  if (KEEP(u.hostname)) { e.respondWith((async () => { const c = await caches.open(CACHE), hit = await c.match(e.request); if (hit) return hit; const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; })()); return; }
  if (u.origin === location.origin && (u.pathname.endsWith('/') || u.pathname.endsWith('index.html') || u.pathname.endsWith('manifest.webmanifest') || u.pathname.endsWith('icon.svg') || /\/tips\/[a-z]+\.jpg$/.test(u.pathname) || /\/lang\/[a-z]+\.json$/.test(u.pathname))) {
    e.respondWith((async () => { const c = await caches.open(CACHE); try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; } catch (err) { const hit = await c.match(e.request, { ignoreSearch: true }); if (hit) return hit; throw err; } })());
  }
});
