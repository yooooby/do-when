const CACHE='last-when-v7-consistent-assets';
const ASSETS=['./','./index.html','./css/styles.css?v=7','./js/app.js?v=7','./js/dates.js?v=7','./js/storage.js?v=7','./js/images.js?v=7','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('last-when-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(new Request(event.request,{cache:'no-cache'})).then(response=>{if(!response.ok)throw Error('Navigation failed');return response}).catch(()=>caches.open(CACHE).then(cache=>cache.match(new URL('./index.html',self.registration.scope).href))));return;
 }
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request)));
});
