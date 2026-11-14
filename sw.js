// Céu de Hoje — funciona sem rede e avisa dos aniversários
const CACHE = 'ceu-v70';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './badge-96.png', './mp4-muxer.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'ceu-data').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('__agenda.json')) return;
  if (/openlibrary\.org|tvmaze\.com/.test(url.hostname) && !/covers\.openlibrary|static\.tvmaze/.test(url.hostname)) return; // dados sempre frescos
  const isApp = /\/(index\.html)?$/.test(url.pathname);
  if (isApp && (req.mode === 'navigate' || url.pathname.endsWith('index.html'))) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { if (r.ok && !r.redirected) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  const cacheable = url.origin === self.location.origin || /fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.hostname);
  if (!cacheable) return; // APIs e capas de outros sites: sempre da rede, sem ocupar espaço
  e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit); return hit || net; }));
});
// ---- alertas de aniversário (Chrome Android, app instalada) ----
async function checkEvents() { // devolve o número de avisos mostrados // ciclo, patudos, resumo do mês, livro do ano
  const c = await caches.open('ceu-data'), r = await c.match('./__events.json'); if (!r) return 0;
  const ev = await r.json(), now = new Date(), pad = n => String(n).padStart(2, '0'), today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dn = await c.match('./__notified-ev'), done = dn ? await dn.json() : []; let changed = false;
  const PRI = ['cy', 'preg', 'gift', 'cd0', 'cd1', 'pet', 'week', 'tar', 'tarw', 'rt', 'month', 'night'], pr = e => { const k = PRI.findIndex(p => e.tag.startsWith(p)); return k < 0 ? 50 : k; };
  const due = ev.filter(e => e.d === today && !done.includes(e.tag) && !(e.h && now.getHours() < e.h)).sort((a, b) => pr(a) - pr(b));
  const show = (t, b, tag, url) => self.registration.showNotification(t, { body: b, icon: 'icon-192.png', badge: 'badge-96.png', tag, data: { url: url || './' } });
  for (const e of due.slice(0, 2)) await show(e.t, e.b, e.tag, e.url); // no máximo 2 avisos de cada vez
  if (due.length > 2) { const rest = due.slice(2); await show(`✨ Mais ${rest.length} aviso${rest.length > 1 ? 's' : ''} de hoje`, rest.map(e => e.t).join('\n'), 'more-' + today, './'); }
  due.forEach(e => done.push(e.tag)); if (due.length) changed = true;
  if (changed) await c.put('./__notified-ev', new Response(JSON.stringify(done.slice(-500))));
  return due.length;
}
async function checkAll() { try { await checkEvents(); } catch (e) { } try { await checkBirthdays(); } catch (e) { } }
let shownB = 0;
async function checkBirthdays() {
  const c = await caches.open('ceu-data'), r = await c.match('./__agenda.json'); if (!r) return;
  const list = await r.json(), now = new Date(), pad = n => String(n).padStart(2, '0');
  const md = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, tm = new Date(now.getTime() + 864e5), mdT = `${pad(tm.getMonth() + 1)}-${pad(tm.getDate())}`;
  const key = `${now.getFullYear()}-${md}`, done = await c.match('./__notified'), last = done ? await done.text() : '';
  if (last === key) return;
  const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, f29 = (x, m, y) => x.md === m || (m === '02-28' && x.md === '02-29' && !leap(y));
  const today = list.filter(x => f29(x, md, now.getFullYear())), tomorrow = list.filter(x => f29(x, mdT, tm.getFullYear()));
  const age = x => x.y ? ` · faz ${now.getFullYear() - x.y}` : '';
  if (today.length) await self.registration.showNotification(today.length === 1 ? `🎂 Hoje faz anos: ${today[0].n}` : `🎂 Hoje fazem anos: ${today.map(x => x.n).join(', ')}`, { body: today.map(x => `${x.n} (${x.r})${age(x)}`).join('\n') + '\nToca para criar o cartaz e enviar os parabéns.', icon: 'icon-192.png', badge: 'badge-96.png', tag: 'ceu-bday-' + key, requireInteraction: true, data: { url: './?aniversarios' } });
  else if (tomorrow.length) await self.registration.showNotification(`⏰ Amanhã faz${tomorrow.length > 1 ? 'em' : ''} anos: ${tomorrow.map(x => x.n).join(', ')}`, { body: 'Prepara já o cartaz ou a mensagem.', icon: 'icon-192.png', badge: 'badge-96.png', tag: 'ceu-bday-t-' + key, data: { url: './?aniversarios' } });
  if (today.length || tomorrow.length) { await c.put('./__notified', new Response(key)); shownB = 1; try { self.navigator.setAppBadge && self.navigator.setAppBadge(today.length || tomorrow.length); } catch (e) { } }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'ceu-bdays') e.waitUntil(checkAll()); });
self.addEventListener('message', e => { if (e.data === 'check-bdays') e.waitUntil(checkAll()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { for (const w of ws) { if ('focus' in w) { w.navigate(url).catch(() => { }); return w.focus(); } } return clients.openWindow(url); }));
});

// ---- toque do servidor (Cloudflare): chega à hora certa; o telemóvel decide o aviso ----
self.addEventListener('push', e => e.waitUntil((async () => {
  const h = new Date().getHours(), night = h >= 15; let n = 0; shownB = 0;
  try { n += await checkEvents(); } catch (x) { }
  if (!night) { try { await checkBirthdays(); n += shownB; } catch (x) { } }
  if (!n) await self.registration.showNotification(night ? '🌙 Boa noite' : '✨ Bom dia', { body: night ? 'O teu ritual da noite: respira, agradece e vê a Lua de hoje.' : 'A tua carta de hoje e o céu do teu dia estão à tua espera.', icon: 'icon-192.png', badge: 'badge-96.png', tag: 'push-' + (night ? 'n' : 'm'), data: { url: night ? './?noite' : './?carta' } });
})()));
