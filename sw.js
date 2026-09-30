const CACHE="music-money-v2.0.3";
const CORE=["./","index.html","style.css","app.js","manifest.webmanifest","icon-180.png","icon-512.png","icons/favicon-32.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:"reload"}))))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith(caches.match(r,{ignoreSearch:same}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>hit||(r.mode==="navigate"?caches.match("index.html"):Response.error()));
    return hit||net;
  }));
});
