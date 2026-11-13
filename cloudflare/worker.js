// Céu de Hoje · servidor de avisos (Cloudflare Worker)
// Só guarda: o endereço de notificação do telemóvel e as horas (manhã / noite) em UTC.
// Não guarda nomes, aniversários, ciclo nem nada pessoal. Envia um «toque» sem conteúdo;
// é o próprio telemóvel que decide o aviso com os dados que tem guardados.
//
// Ligações necessárias (Settings → Bindings): KV namespace com o nome de variável  PUSH
// Agendamento (Settings → Triggers → Cron):  */15 * * * *

const APP = 'https://juliomcm-tech.github.io/ceu-de-hoje/';
const FAN = 40; // toques por execução (limite do plano grátis: 50 pedidos externos)
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'content-type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...H, 'content-type': 'application/json' } });
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = s => new TextEncoder().encode(s);

async function vapid(env) { // gera as chaves na primeira vez e guarda-as no KV
  let k = await env.PUSH.get('_vapid', 'json');
  if (!k) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    k = { priv: await crypto.subtle.exportKey('jwk', kp.privateKey), pub: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)), fan: crypto.randomUUID() };
    await env.PUSH.put('_vapid', JSON.stringify(k));
  }
  return k;
}
async function jwtFor(aud, k) {
  const head = b64u(enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))), body = b64u(enc(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: APP })));
  const key = await crypto.subtle.importKey('jwk', k.priv, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc(head + '.' + body));
  return head + '.' + body + '.' + b64u(sig);
}
// hora local "HH:MM" + diferença do fuso (minutos, como Date.getTimezoneOffset) -> fatia UTC "HHMM" de 15 em 15 min
function slot(hhmm, off) { const [h, m] = String(hhmm).split(':').map(Number); if (!(h >= 0 && h < 24 && m >= 0 && m < 60)) return null; let t = h * 60 + m + (+off || 0); t = ((Math.round(t / 15) * 15) % 1440 + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0'); }
const nowSlot = d => { const t = Math.floor((d.getUTCHours() * 60 + d.getUTCMinutes()) / 15) * 15; return String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0'); };
const okEndpoint = e => { try { const u = new URL(e); return u.protocol === 'https:' && /(^|\.)(googleapis\.com|push\.apple\.com|mozilla\.com|mozaws\.net|windows\.com|notify\.windows\.com)$/.test(u.hostname); } catch (x) { return false; } };

async function sendAll(list, env) { // list: [{k: chave KV, e: endpoint}]
  const k = await vapid(env), jwts = {}, gone = [];
  for (const it of list) {
    try {
      const aud = new URL(it.e).origin; jwts[aud] = jwts[aud] || await jwtFor(aud, k);
      const r = await fetch(it.e, { method: 'POST', headers: { TTL: '7200', Urgency: 'normal', Authorization: `vapid t=${jwts[aud]}, k=${k.pub}`, 'Content-Length': '0' } });
      if (r.status === 404 || r.status === 410) gone.push(it.id);
    } catch (e) { }
  }
  for (const id of gone) await unsub(id, env); // subscrições que já não existem
  return { sent: list.length - gone.length, gone: gone.length };
}
async function unsub(id, env) {
  const u = await env.PUSH.get('u:' + id, 'json'); if (!u) return;
  for (const key of u.keys || []) await env.PUSH.delete(key);
  await env.PUSH.delete('u:' + id);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    const url = new URL(req.url);
    if (url.pathname === '/vapid') return json({ key: (await vapid(env)).pub });
    if (url.pathname === '/sub' && req.method === 'POST') {
      const b = await req.json().catch(() => ({})), id = String(b.id || '').replace(/[^\w-]/g, '').slice(0, 40);
      if (!id || !okEndpoint(b.endpoint)) return json({ ok: false, err: 'dados inválidos' }, 400);
      const keys = [];
      for (const [t, on, hh] of [['m', b.on?.m !== false, b.m || '08:00'], ['n', b.on?.n !== false, b.n || '21:30']]) { const s = on && slot(hh, b.off); if (s) keys.push(`${t}:${s}:${id}`); }
      const old = await env.PUSH.get('u:' + id, 'json');
      for (const key of (old?.keys || [])) if (!keys.includes(key)) await env.PUSH.delete(key);
      for (const key of keys) if (!(old?.keys || []).includes(key) || old.e !== b.endpoint) await env.PUSH.put(key, '', { metadata: { e: b.endpoint, id } });
      await env.PUSH.put('u:' + id, JSON.stringify({ keys, e: b.endpoint }));
      return json({ ok: true, keys: keys.length });
    }
    if (url.pathname === '/unsub' && req.method === 'POST') { const b = await req.json().catch(() => ({})); if (b.id) await unsub(String(b.id).replace(/[^\w-]/g, ''), env); return json({ ok: true }); }
    if (url.pathname === '/fan' && req.method === 'POST') { // uso interno: um lote de toques
      const k = await vapid(env); if (req.headers.get('x-fan') !== k.fan) return json({ ok: false }, 403);
      const b = await req.json(); return json(await sendAll(b.list || [], env));
    }
    return json({ app: 'Céu de Hoje', ok: true });
  },
  async scheduled(ev, env, ctx) {
    const s = nowSlot(new Date(ev.scheduledTime)), due = [];
    for (const t of ['m', 'n']) { let cursor; do { const r = await env.PUSH.list({ prefix: `${t}:${s}:`, cursor }); r.keys.forEach(x => x.metadata && due.push({ id: x.metadata.id, e: x.metadata.e })); cursor = r.list_complete ? null : r.cursor; } while (cursor); }
    if (!due.length) return;
    if (due.length <= FAN) { await sendAll(due, env); return; }
    const k = await vapid(env), self = env.SELF_URL; // com muita gente: divide em lotes
    for (let i = 0; i < due.length; i += FAN) {
      const part = due.slice(i, i + FAN);
      if (self) ctx.waitUntil(fetch(self.replace(/\/$/, '') + '/fan', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fan': k.fan }, body: JSON.stringify({ list: part }) }));
      else if (i === 0) await sendAll(part, env);
    }
  }
};
// exportado para os testes locais
export { slot, nowSlot, okEndpoint };
