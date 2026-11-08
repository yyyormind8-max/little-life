// Кеш для быстрого повторного запуска и игры без сети. Файлы с ?v= неизменны, поэтому берём из кеша.
const CACHE='little-life-v65';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const versioned=/[?&]v=\d+/.test(req.url)||/\/(assets|vendor)\//.test(req.url);
  if(versioned){e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req);if(hit)return hit;const res=await fetch(req);if(res.ok)c.put(req,res.clone());return res}))}
  else e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res}).catch(()=>caches.match(req)))});
