const C='sw-stats-v6';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // always ask the server first (bypass the 10-minute GitHub cache); fall back to the saved copy offline
    e.respondWith(fetch(u.href,{cache:'no-cache'}).then(x=>{if(x.ok){const cp=x.clone();caches.open(C).then(c=>c.put(r,cp))}return x}).catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m||caches.match(r,{ignoreSearch:true})).then(m=>m||caches.match('./index.html'))));
    return;
  }
  // Firebase SDK files (pinned version) are cached so the app also starts offline
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x.ok){const cp=x.clone();caches.open(C).then(c=>c.put(r,cp))}return x})));
  }
});
