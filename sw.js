'use strict';
const CACHE_NAME='gundam-math-v9-rwd-mech-upgrade';
const APP_SHELL=[
  './','./index.html','./styles.css',
  './css-base-layout.css','./css-duel-hero.css','./css-duel-enemy.css','./css-mech-detail.css','./css-question-review.css','./css-war-layout.css','./css-war-units.css','./css-war-shared-mechs.css','./css-ui.css',
  './app.js','./core-domain.js','./core-questions.js','./core-ui.js','./app-duel.js','./war-context.js','./war-scene-core.js','./war-scene-render.js','./war-scene-turn.js','./war-scene-effects.js','./app-ui.js','./pwa.js',
  './manifest.webmanifest','./icons/icon-192.png','./icons/icon.svg'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
