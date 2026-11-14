// ===== A tua semana, importar aniversários (.vcf), rotinas pela Lua, teste de avisos =====
const ROUT = [['cabelo', '✂️', 'Cortar o cabelo'], ['unhas', '💅', 'Unhas'], ['depilacao', '🪒', 'Depilação'], ['pele', '🧖', 'Tratamento de pele'], ['dieta', '🥗', 'Começar uma dieta'], ['exercicio', '🏃', 'Começar exercício'], ['horta', '🌱', 'Plantar e jardinagem'], ['limpeza', '🧹', 'Limpezas e arrumações'], ['negocios', '💼', 'Começar projetos e negócios']];
const routSel = () => { try { return JSON.parse(store.get('ceu_routines') || '[]'); } catch (e) { return []; } };
function bestInWeek(key, from) { const t0 = noonJd(from || todayStr()); let best = null; for (let k = 0; k < 7; k++) { const d = dayStr(t0 + k), sc = luaGuide(d)[key] || 0; if (!best || sc > best.sc) best = { d, sc }; } return best && best.sc >= 2 ? best : null; }
function routinesBox() {
  const sel = routSel(), nd = d => niceDate(d).replace(/^([^,]+), /, (m, w) => w.replace('-feira', '') + ', ');
  return `<div class="box rout" id="sec-rout"><h3>✂️ Rotinas pela Lua</h3><p class="note">Escolhe o que te interessa: a app diz-te o melhor dia da semana e avisa nesse dia.</p><div class="chips" id="rtSel">${ROUT.map(r => `<button class="qchip${sel.includes(r[0]) ? ' on' : ''}" data-r="${r[0]}">${r[1]} ${r[2]}</button>`).join('')}</div>
    ${sel.length ? `<div class="rtl">${sel.map(k => { const r = ROUT.find(z => z[0] === k), b = bestInWeek(k); return `<p>${r[1]} <b>${r[2]}</b>: ${b ? `${nd(b.d)} ${'🌙'.repeat(Math.min(3, b.sc))}` : 'esta semana a Lua não ajuda; espera pela próxima'}</p>`; }).join('')}</div>` : ''}<p class="note">Tradição do calendário lunar, para quem gosta de seguir a Lua.</p></div>`;
}
function bindRoutines() { document.querySelectorAll('#rtSel [data-r]').forEach(b => b.onclick = () => { const s = routSel(), k = b.dataset.r, n = s.includes(k) ? s.filter(x => x !== k) : [...s, k]; store.set('ceu_routines', JSON.stringify(n)); try { syncAlertData(); } catch (e) { } render(); }); }
function routineAlerts() { const out = [], t0 = noonJd(todayStr()); routSel().forEach(k => { const r = ROUT.find(z => z[0] === k); for (let w = 0; w < 6; w++) { const b = bestInWeek(k, dayStr(t0 + w * 7)); if (b) out.push({ d: b.d, t: `${r[1]} Hoje é o melhor dia da semana: ${r[2].toLowerCase()}`, b: `Lua em ${SIGNS[skyFor(b.d).moon.sign].n}, ${moonPhaseName(skyFor(b.d).phase.elong)}.`, tag: 'rt-' + k + b.d, url: './?semana-lua', h: 9 }); } }); return out; }

// ---------- A tua semana ----------
function weekItems(from) {
  const t0 = noonJd(from), days = Array.from({ length: 7 }, (_, k) => dayStr(t0 + k)), out = days.map(d => ({ d, it: [] })), at = d => out.find(x => x.d === d), add = (d, ic, t, m) => { const x = at(d); if (x) x.it.push([ic, t, m]); };
  const mmdd = d => d.slice(5);
  agendaAll().filter(x => x.kind !== 'me').forEach(x => days.forEach(d => { if (mmdd(x.d) === mmdd(d) || (mmdd(x.d) === '02-29' && mmdd(d) === '02-28' && !leap(+d.slice(0, 4)))) add(d, x.kind === 'a' ? '🐾' : '🎂', `${x.name} faz ${+d.slice(0, 4) - +x.d.slice(0, 4)} anos`); }));
  P.list('ceu_bdays').forEach(x => { const nb = nextBirthday(x.d), g = dayStr(noonJd(nb) - 7); if (days.includes(g)) add(g, '🎁', `Prenda para ${x.name.split(' ')[0]} (faltam 7 dias)`); });
  try { const o = CY.get(); if (o.on && !o.preg) { const st = cycleStats(o); if (st.last) { predPeriods(days[0], days[6]).forEach((d, i, a) => { if (i === 0 || noonJd(d) - noonJd(a[i - 1]) > 1) add(d, '🩸', 'Período previsto'); }); if (days.includes(st.fert[0])) add(st.fert[0], '🌸', 'Começa a janela fértil'); if (o.ttc && days.includes(st.peak[0])) add(st.peak[0], '🔥', 'Dias de pico'); } } if (o.preg) { const lmp = noonJd(o.preg.d); days.forEach(d => { const dd = noonJd(d) - lmp; if (dd > 0 && dd % 7 === 0) add(d, '🤰', `Começam as ${dd / 7} semanas`); }); } } catch (e) { }
  try { CD.all().forEach(x => { if (days.includes(x.d)) add(x.d, x.e || '⏳', x.t); }); } catch (e) { }
  try { intList('viagens').filter(x => x.sd && x.status !== 2).forEach(x => { if (days.includes(x.sd)) add(x.sd, '✈️', `Viagem: ${x.title}`); }); } catch (e) { }
  skyAgenda(9).filter(x => days.includes(x.d)).forEach(x => add(x.d, x.ic, x.t, x.m));
  routSel().forEach(k => { const r = ROUT.find(z => z[0] === k), b = bestInWeek(k, days[0]); if (b) add(b.d, r[1], r[2] + ' (melhor dia)'); });
  return out;
}
const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
function weekFrom() { const t = todayStr(); return wdOf(t) === 0 && new Date().getHours() >= 15 ? dayStr(noonJd(t) + 1) : t; }
function weekCount(W) { return W.reduce((a, x) => a + x.it.length, 0); }
function openWeekView() {
  const from = weekFrom(), W = weekItems(from), n = weekCount(W), me = P.get() || {};
  $('#infoTitle').textContent = '📅 A tua semana';
  $('#infoBody').innerHTML = `${n ? '' : '<p class="note">Semana calma: nada marcado. Aproveita! 🌿</p>'}<div class="wkv">${W.map(x => `<div class="wkday${x.d === todayStr() ? ' today' : ''}"><div class="wkhd"><b>${cap1(WDAY[wdOf(x.d)][0].replace('-feira', ''))}</b><small>${+x.d.slice(8)} ${MESES[+x.d.slice(5, 7) - 1].slice(0, 3)}</small><span>${moonEmoji(skyFor(x.d).phase.elong)}</span></div>${x.it.length ? x.it.map(i => `<p><span>${i[0]}</span><span class="wtx">${esc(i[1])}${i[2] ? `<small>${esc(i[2])}</small>` : ''}</span></p>`).join('') : '<p class="mute">—</p>'}</div>`).join('')}</div>
    <div class="drow"><button class="btn main" id="wkSpk">🔊 Ouvir a semana</button><button class="btn" id="wkSh">📤 Partilhar</button></div><label class="chk"><input type="checkbox" id="wkAl"${store.get('ceu_week_alert') === '0' ? '' : ' checked'}> Avisar-me ao domingo à noite com a semana</label>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal(); $('#infoDlg').scrollTop = 0;
  const txt = () => `A tua semana${me.name ? ', ' + me.name.split(' ')[0] : ''}. ` + W.filter(x => x.it.length).map(x => `${WDAY[wdOf(x.d)][0]}: ${x.it.map(i => i[1] + (i[2] ? '. ' + i[2] : '')).join(' ')}.`).join(' ') || 'Semana calma, sem nada marcado.';
  $('#wkAl').onchange = e => { store.set('ceu_week_alert', e.target.checked ? '1' : '0'); try { syncAlertData(); } catch (er) { } };
  $('#wkSpk').onclick = e => speakText(txt(), e.currentTarget, '🔊 Ouvir a semana');
  $('#wkSh').onclick = async () => { await fontsReady(); const [c, ctx, Wd, H] = newCanvas(); bg(ctx, Wd, H, 'wk' + from, ['#2a5fd1', '#06081a']); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 36px Cinzel'; ctx.fillText('A MINHA SEMANA NO CÉU', Wd / 2, 100);
    let y = 170; W.forEach(x => { ctx.textAlign = 'left'; ctx.fillStyle = '#ffe9a8'; ctx.font = '700 32px Manrope'; ctx.fillText(`${cap1(WDAY[wdOf(x.d)][0].replace('-feira', ''))} ${+x.d.slice(8)}`, 80, y); ctx.font = `30px ${EMOJI_F}`; ctx.fillText(moonEmoji(skyFor(x.d).phase.elong), Wd - 120, y); y += 44; ctx.fillStyle = '#fff'; ctx.font = '500 28px Manrope'; (x.it.length ? x.it.slice(0, 3) : [['·', 'dia livre']]).forEach(i => { ctx.fillText(`${i[0]}  ${i[1]}`.slice(0, 52), 110, y); y += 38; }); y += 18; });
    brandFoot(ctx, Wd, H); shareCanvases([{ name: 'a-minha-semana', c }], `📅 A minha semana no céu ✨\n\n${APP_URL}`); };
}
function weekAlerts() {
  if (store.get('ceu_week_alert') === '0') return []; const t = todayStr(), sun = dayStr(noonJd(t) + ((7 - wdOf(t)) % 7)), W = weekItems(dayStr(noonJd(sun) + 1)), n = weekCount(W);
  const highlights = W.flatMap(x => x.it).slice(0, 3).map(i => i[0] + ' ' + i[1]).join(' · ');
  return [{ d: sun, t: n ? `📅 A tua semana: ${n} coisa${n > 1 ? 's' : ''} para não esquecer` : '📅 Semana calma pela frente', b: highlights || 'Nada marcado: aproveita 🌿', tag: 'week-' + sun, url: './?asemana', h: 19 }];
}

// ---------- Importar aniversários dos contactos (.vcf) ----------
function parseVcf(txt) {
  const lines = txt.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n'), out = []; let c = null;
  const qp = s => { try { return decodeURIComponent(s.replace(/=\n?/g, '%').replace(/%([^0-9A-F]|$)/gi, '=$1')); } catch (e) { return s; } };
  for (const raw of lines) { const L = raw.trim(); if (/^BEGIN:VCARD/i.test(L)) c = {}; else if (/^END:VCARD/i.test(L)) { if (c && (c.fn || c.n)) out.push(c); c = null; } else if (c) { const i = L.indexOf(':'); if (i < 0) continue; const key = L.slice(0, i).toUpperCase(), val0 = L.slice(i + 1), val = /QUOTED-PRINTABLE/.test(key) ? qp(val0) : val0;
    if (/^FN[;:]?/.test(key) || key === 'FN') c.fn = val.replace(/\\,/g, ',').trim(); else if (/^N(;|$)/.test(key)) { const p = val.split(';'); c.n = [p[1], p[0]].filter(Boolean).join(' ').trim(); } else if (/^BDAY/.test(key)) c.bday = val.trim(); else if (/^TEL/.test(key) && !c.tel) c.tel = val.replace(/[^\d+]/g, ''); } }
  return out.map(x => { const b = (x.bday || '').replace(/T.*$/, ''); let d = '', ny = false, m;
    if ((m = b.match(/^(\d{4})-?(\d{2})-?(\d{2})$/))) d = `${m[1]}-${m[2]}-${m[3]}`; else if ((m = b.match(/^--(\d{2})-?(\d{2})$/))) { ny = true; d = `--${m[1]}-${m[2]}`; }
    return { name: (x.fn || x.n || '').slice(0, 24), d, ny, tel: (x.tel || '').replace(/^\+351/, '') }; }).filter(x => x.name && x.d);
}
function openImportVcf() {
  $('#infoTitle').textContent = '📇 Importar aniversários';
  $('#infoBody').innerHTML = `<div class="box"><p>Junta de uma vez os aniversários que já tens nos contactos.</p><p><b>1.</b> Exporta os contactos para um ficheiro <b>.vcf</b>:</p><p class="note">📱 Android: app Contactos → menu → Gerir contactos → Exportar.<br>🌐 Google Contactos (contacts.google.com) → Exportar → vCard.<br>🍎 iPhone: Contactos → Listas → toque longo em «Todos» → Exportar.</p><p><b>2.</b> Escolhe esse ficheiro aqui:</p><label class="btn main" style="display:block;text-align:center">📂 Escolher o ficheiro .vcf<input type="file" id="vcfIn" accept=".vcf,text/vcard,text/x-vcard" hidden></label></div><div id="vcfOut"></div>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
  $('#vcfIn').onchange = async e => { const f = e.target.files[0]; if (!f) return; const L = parseVcf(await f.text()), have = P.list('ceu_bdays'), isDup = x => have.some(h => h.name.toLowerCase() === x.name.toLowerCase() && h.d.slice(5) === x.d.slice(-5)); const ok = L.filter(x => !x.ny && !isDup(x)), ny = L.filter(x => x.ny && !have.some(h => h.name.toLowerCase() === x.name.toLowerCase())), dup = L.filter(isDup);
    if (!L.length) { $('#vcfOut').innerHTML = '<p class="note">Não encontrei nenhum contacto com data de anos neste ficheiro.</p>'; return; }
    $('#vcfOut').innerHTML = `<div class="box">${ok.length ? `<h3>🎂 ${ok.length} aniversário${ok.length > 1 ? 's' : ''} para juntar</h3><div class="vcl">${ok.map((x, i) => `<label class="chk"><input type="checkbox" data-vi="${i}" checked> ${esc(x.name)} <small>${+x.d.slice(8)} ${MESES[+x.d.slice(5, 7) - 1].slice(0, 3)} ${x.d.slice(0, 4)}</small></label>`).join('')}</div><button class="btn main" id="vcfGo" style="width:100%">Juntar à agenda</button>` : '<p>Não há aniversários novos com o ano completo.</p>'}
      ${ny.length ? `<h3 style="margin-top:12px">📝 Sem ano de nascimento (${ny.length})</h3><p class="note">Toca para completar o ano e guardar.</p>${ny.map((x, i) => `<button class="link vny" data-ni="${i}">${esc(x.name)} · ${+x.d.slice(-2)} ${MESES[+x.d.slice(2, 4) - 1].slice(0, 3)} ›</button>`).join('<br>')}` : ''}${dup.length ? `<p class="note">${dup.length} já estava${dup.length > 1 ? 'm' : ''} na agenda.</p>` : ''}</div>`;
    if ($('#vcfGo')) $('#vcfGo').onclick = () => { const sel = [...document.querySelectorAll('[data-vi]')].filter(c => c.checked).map(c => ok[+c.dataset.vi]), M = P.list('ceu_bdays'); sel.forEach(x => M.push({ name: x.name, rel: 'amigo', d: x.d, t: '', tel: x.tel || '', relTxt: '' })); P.setList('ceu_bdays', M); try { syncAlertData(); } catch (e) { } toast(`${sel.length} aniversário${sel.length > 1 ? 's' : ''} juntos 🎂`); $('#infoDlg').close(); render(); };
    document.querySelectorAll('.vny').forEach(b => b.onclick = () => { const x = ny[+b.dataset.ni]; $('#infoDlg').close(); openPerson(null, { name: x.name, d: '', tel: x.tel, md: x.d.slice(2) }); });
  };
}
// teste de avisos
async function testAlert() {
  if (!('Notification' in window)) { toast('Este telemóvel não deixa notificações'); return; } if (Notification.permission !== 'granted') { await enableAlerts(); if (Notification.permission !== 'granted') return; }
  try { const reg = await navigator.serviceWorker.ready; await reg.showNotification('🧪 Teste do Céu de Hoje', { body: 'Se estás a ver isto, os avisos estão a funcionar ✨', icon: 'icon-192.png', badge: 'badge-96.png', tag: 'test-' + Date.now(), data: { url: './' } }); toast('Enviado: espreita a barra de cima'); } catch (e) { try { new Notification('🧪 Teste do Céu de Hoje', { body: 'Os avisos estão a funcionar ✨', icon: 'icon-192.png' }); } catch (er) { toast('Não deu: ' + (er.message || 'erro')); } }
  try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (e) { }
}

// ---------- Avisos à hora certa (servidor Cloudflare; também no iPhone com a app no ecrã principal) ----------
const PUSH_URL = 'https://ceu-avisos.juliomcm.workers.dev'; // endereço do Worker (ex.: https://ceu-avisos.NOME.workers.dev); vazio = desligado
const pushUrl = () => (store.get('ceu_push_url') || PUSH_URL).replace(/\/$/, '');
const PS = { get: () => { try { return JSON.parse(store.get('ceu_push') || '{}'); } catch (e) { return {}; } }, set: o => store.set('ceu_push', JSON.stringify(o)) };
const u8 = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
async function pushSync(force) {
  const o = PS.get(), url = pushUrl(); if (!url || !o.on || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try { const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription();
    if (!sub) { const { key } = await (await fetch(url + '/vapid')).json(); sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(key) }); force = true; }
    const off = new Date().getTimezoneOffset(), sig = [sub.endpoint, off, o.m, o.n, o.mOn, o.nOn].join('|');
    if (!force && o.sig === sig && Date.now() - (o.at || 0) < 7 * 864e5) { if (o.err) { o.err = ''; PS.set(o); } return true; }
    o.id = o.id || (crypto.randomUUID ? crypto.randomUUID() : 'u' + Date.now() + Math.random().toString(36).slice(2));
    const r = await fetch(url + '/sub', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: o.id, endpoint: sub.endpoint, off, m: o.m || '08:00', n: o.n || '21:30', on: { m: o.mOn !== false, n: !!o.nOn } }) });
    if (!r.ok) throw new Error('servidor ' + r.status); o.sig = sig; o.at = Date.now(); o.err = ''; PS.set(o); return true;
  } catch (e) { o.err = String(e.message || e).slice(0, 80); PS.set(o); return false; }
}
async function pushOff() { const o = PS.get(), url = pushUrl(); o.on = false; PS.set(o); try { if (url && o.id) await fetch(url + '/unsub', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: o.id }) }); const reg = await navigator.serviceWorker.ready, s = await reg.pushManager.getSubscription(); s && s.unsubscribe(); } catch (e) { } }
function pushBox() {
  if (!pushUrl()) return ''; const o = PS.get(), ios = /iPhone|iPad/.test(navigator.userAgent), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone, can = 'PushManager' in window;
  return `<div class="box pushb"><h3>⏰ Avisos à hora certa</h3><p class="note">Chegam mesmo com a app fechada, à hora que escolheres${ios ? ', também no iPhone' : ''}. O servidor não guarda nada teu: só a hora do toque.</p>
    ${ios && !standalone ? '<p class="note">📲 No iPhone, primeiro instala a app: Safari → Partilhar → Adicionar ao ecrã principal. Depois abre-a pelo ícone e volta aqui.</p>' : !can ? '<p class="note">Este navegador não deixa avisos com a app fechada.</p>' : `
    <label class="chk"><input type="checkbox" id="psOn"${o.on ? ' checked' : ''}> Ligar os avisos à hora certa</label>
    <div class="two"><label>☀️ Manhã<input type="time" id="psM" value="${o.m || '08:00'}"></label><label class="chk"><input type="checkbox" id="psMOn"${o.mOn === false ? '' : ' checked'}> carta e dia</label></div>
    <div class="two"><label>🌙 Noite<input type="time" id="psN" value="${o.n || '21:30'}"></label><label class="chk"><input type="checkbox" id="psNOn"${o.nOn ? ' checked' : ''}> ritual da noite</label></div>
    <p class="note" id="psSt">${o.on ? (o.err ? '⚠️ Não deu para ligar ao servidor dos avisos (sem rede?). <button class="btn" id="psRetry" style="padding:6px 12px;font-size:13px;margin-top:6px">🔄 Tentar de novo</button>' : '✅ Ligado') : ''}</p>`}</div>`;
}
function bindPushBox() {
  if (!$('#psOn')) return; const save = async () => { const o = PS.get(); Object.assign(o, { m: $('#psM').value || '08:00', n: $('#psN').value || '21:30', mOn: $('#psMOn').checked, nOn: $('#psNOn').checked }); PS.set(o); if (o.on) { $('#psSt').textContent = 'A ligar…'; const ok = await pushSync(true); $('#psSt').textContent = ok ? '✅ Ligado' : '⚠️ ' + (PS.get().err || 'Não deu'); } };
  $('#psOn').onchange = async e => { if (e.target.checked) { if (Notification.permission !== 'granted') { const p = await Notification.requestPermission(); if (p !== 'granted') { e.target.checked = false; toast('Sem autorização para avisos'); return; } } const o = PS.get(); o.on = true; PS.set(o); save(); } else { await pushOff(); $('#psSt').textContent = 'Desligado'; } };
  ['#psM', '#psN', '#psMOn', '#psNOn'].forEach(id => $(id).onchange = save);
  const retry = async () => { const st = $('#psSt'); if (st) st.textContent = 'A ligar…'; const ok = await pushSync(true); if (st) { st.innerHTML = ok ? '✅ Ligado' : '⚠️ Ainda sem ligação. Verifica a internet e tenta mais tarde. <button class="btn" id="psRetry" style="padding:6px 12px;font-size:13px;margin-top:6px">🔄 Tentar de novo</button>'; const b = $('#psRetry'); if (b) b.onclick = retry; } };
  if ($('#psRetry')) $('#psRetry').onclick = retry;
  const o0 = PS.get(); if (o0.on && o0.err && navigator.onLine !== false) retry();
}
