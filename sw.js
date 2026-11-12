// Céu de Hoje — funciona sem rede e avisa dos aniversários
const CACHE = 'ceu-v12';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'ceu-data').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('__agenda.json')) return;
  if (/openlibrary\.org|tvmaze\.com/.test(url.hostname) && !/covers\.openlibrary|static\.tvmaze/.test(url.hostname)) return; // dados sempre frescos
  if (req.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit); return hit || net; }));
});
// ---- alertas de aniversário (Chrome Android, app instalada) ----
async function checkBirthdays() {
  const c = await caches.open('ceu-data'), r = await c.match('./__agenda.json'); if (!r) return;
  const list = await r.json(), now = new Date(), pad = n => String(n).padStart(2, '0');
  const md = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, tm = new Date(now.getTime() + 864e5), mdT = `${pad(tm.getMonth() + 1)}-${pad(tm.getDate())}`;
  const key = `${now.getFullYear()}-${md}`, done = await c.match('./__notified'), last = done ? await done.text() : '';
  if (last === key) return;
  const today = list.filter(x => x.md === md), tomorrow = list.filter(x => x.md === mdT);
  const age = x => x.y ? ` · faz ${now.getFullYear() - x.y}` : '';
  if (today.length) await self.registration.showNotification(today.length === 1 ? `🎂 Hoje faz anos: ${today[0].n}` : `🎂 Hoje fazem anos: ${today.map(x => x.n).join(', ')}`, { body: today.map(x => `${x.n} (${x.r})${age(x)}`).join('\n') + '\nToca para criar o cartaz e enviar os parabéns.', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'ceu-bday-' + key, requireInteraction: true, data: { url: './?aniversarios' } });
  else if (tomorrow.length) await self.registration.showNotification(`⏰ Amanhã faz${tomorrow.length > 1 ? 'em' : ''} anos: ${tomorrow.map(x => x.n).join(', ')}`, { body: 'Prepara já o cartaz ou a mensagem.', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'ceu-bday-t-' + key, data: { url: './?aniversarios' } });
  if (today.length || tomorrow.length) { await c.put('./__notified', new Response(key)); try { self.navigator.setAppBadge && self.navigator.setAppBadge(today.length || tomorrow.length); } catch (e) { } }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'ceu-bdays') e.waitUntil(checkBirthdays()); });
self.addEventListener('message', e => { if (e.data === 'check-bdays') e.waitUntil(checkBirthdays()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { for (const w of ws) { if ('focus' in w) { w.navigate(url).catch(() => { }); return w.focus(); } } return clients.openWindow(url); }));
});
