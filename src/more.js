// ===== Mais: cópia de segurança, partilhar itens, citações, passaporte, meta, empréstimos, O meu ano =====

// ---------- Cópia de segurança ----------
const BK_SKIP = /^ceu_(pin|news|sug_|lastbk|bksnooze|seen_|ep_|monseen_|tar_\d|tar3_|tarw_|conf_|tour)/;
function hasPersonalData() { return ['ceu_moments', 'ceu_books', 'ceu_bdays', 'ceu_diario', 'ceu_trips', 'ceu_shows', 'ceu_pets'].some(k => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) && v.length; } catch (e) { return false; } }); }
function backupData() { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('ceu_') && !BK_SKIP.test(k)) o[k] = localStorage.getItem(k); } } catch (e) { } return { app: 'ceu-de-hoje', v: 2, at: new Date().toISOString(), data: o }; }
async function doBackup() {
  const bk = backupData(); try { if (typeof PHDB !== 'undefined') bk.photos = await PHDB.all(); } catch (e) { }
  const f = new File([JSON.stringify(bk)], `ceu-de-hoje-copia-${todayStr()}.json`, { type: 'application/json' });
  let ok = false;
  try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Cópia Céu de Hoje' }); ok = true; } } catch (e) { if (e && e.name === 'AbortError') return; }
  if (!ok) ok = await saveBlob(f, f.name);
  if (ok) { store.set('ceu_lastbk', todayStr()); toast('Cópia feita 💾 Guarda o ficheiro num sítio seguro'); if (typeof render === 'function' && ST.type === 'eu') render(); }
}
async function doRestore(file) {
  let j; try { j = JSON.parse(await file.text()); } catch (e) { toast('Ficheiro inválido'); return; }
  return restoreObj(j);
}
async function restoreObj(j, ask) {
  if (!j || j.app !== 'ceu-de-hoje') { toast('Este ficheiro não é uma cópia do Céu de Hoje'); return; }
  if (j.v >= 2 && j.data) {
    const n = Object.keys(j.data).length; if (!n) { toast('A cópia está vazia'); return; }
    if (ask !== false && !confirmBox(ask || `Repor a cópia de ${new Date(j.at).toLocaleDateString('pt-PT')}? Os dados deste telemóvel são substituídos pelos da cópia.`)) return;
    const snap = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('ceu_') && !BK_SKIP.test(k)) snap[k] = localStorage.getItem(k); } } catch (e) { }
    try { Object.keys(snap).forEach(k => { if (!(k in j.data)) localStorage.removeItem(k); }); for (const [k, v] of Object.entries(j.data)) if (k.startsWith('ceu_') && !BK_SKIP.test(k)) localStorage.setItem(k, v); } catch (e) { try { Object.keys(j.data).forEach(k => localStorage.removeItem(k)); for (const [k, v] of Object.entries(snap)) localStorage.setItem(k, v); } catch (x) { } toast('Sem espaço no telemóvel para repor tudo: ficou tudo como estava.', 5000); return; }
    if (j.photos) for (const [k, v] of Object.entries(j.photos)) try { await PHDB.put(k, v); } catch (e) { }
  } else { // cópia antiga (só diário, perfil, aniversários, animais)
    if (!confirmBox('Repor esta cópia? Junta as notas e substitui o perfil, aniversários e animais.')) return;
    const ids = new Set(DIA.all().map(x => x.id)); DIA.save(DIA.all().concat((j.diario || []).filter(x => !ids.has(x.id))));
    if (j.profile) P.set(j.profile); if (j.bdays) P.setList('ceu_bdays', j.bdays); if (j.pets) P.setList('ceu_pets', j.pets);
  }
  store.set('ceu_lastbk', todayStr()); try { syncAlertData(); } catch (e) { }
  toast('Cópia reposta ✅'); setTimeout(() => location.reload(), 900);
}

// ---------- Mudança de casa: juliomcm-tech.github.io → ceudehoje.com ----------
const NEW_SITE = 'https://ceudehoje.com/';
function isOldHost() { return /github\.io$/.test(location.hostname) || /[?&]oldhost/.test(location.search); }
async function gzB64(str) { const b = await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer(), u = new Uint8Array(b); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function gunB64(b64) { const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/')), u = Uint8Array.from(s, c => c.charCodeAt(0)); return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); }
function migBox() {
  if (!isOldHost()) return '';
  const has = Object.keys(backupData().data).length > 2, done = store.get('ceu_migrated');
  return `<div class="migb"><h3>🏠 A Céu de Hoje mudou de casa</h3><p>A nova morada é <b>ceudehoje.com</b>. ${has ? (done ? 'Os teus dados já foram levados. Abre a nova morada e instala de lá a app.' : 'Leva os teus dados contigo num toque: perfil, aniversários, animais, diário, ciclo e fotos.') : 'Abre a nova morada e instala de lá a app.'}</p><button class="btn main" id="migGo" style="width:100%">${has && !done ? '📦 Levar os meus dados' : '✨ Abrir ceudehoje.com'}</button>${has && !done ? '<p class="note">Os dados viajam dentro do próprio link, diretamente do teu telemóvel para a nova morada. Não passam por nenhum servidor.</p>' : ''}</div>`;
}
function bindMig() {
  const b = $('#migGo'); if (!b) return;
  b.onclick = async () => {
    const has = Object.keys(backupData().data).length > 2;
    if (!has || store.get('ceu_migrated')) { location.href = NEW_SITE; return; }
    b.disabled = true; b.textContent = 'A preparar…';
    try {
      const bk = backupData(); bk.mig = 1; try { if (typeof PHDB !== 'undefined') bk.photos = await PHDB.all(); } catch (e) { }
      let enc = await gzB64(JSON.stringify(bk)), noPh = false;
      if (enc.length > 1800000 && bk.photos) { delete bk.photos; enc = await gzB64(JSON.stringify(bk)); noPh = true; }
      if (enc.length > 1800000) { b.disabled = false; b.textContent = '📦 Levar os meus dados'; toast('Tens muitos dados para um link: faz uma cópia de segurança aqui e repõe-na em ceudehoje.com', 7000); doBackup(); return; }
      if (noPh && !confirmBox('As fotos são grandes demais para o link. Os outros dados vão todos. Para levar as fotos, faz também uma cópia de segurança e repõe-na lá. Continuar?')) { b.disabled = false; b.textContent = '📦 Levar os meus dados'; return; }
      store.set('ceu_migrated', todayStr());
      try { if (PS.get().on) await pushOff(); } catch (e) { }
      location.href = NEW_SITE + '#mig=' + enc;
    } catch (e) { b.disabled = false; b.textContent = '📦 Levar os meus dados'; toast('Não deu para preparar o link. Usa a cópia de segurança.', 6000); }
  };
}
async function checkMigLink() {
  const m = location.hash.match(/^#mig=([\w-]+)/); if (!m) return false;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  let j; try { j = JSON.parse(await gunB64(m[1])); } catch (e) { toast('O link de mudança está incompleto. Usa a cópia de segurança.', 6000); return true; }
  if (!j || j.app !== 'ceu-de-hoje' || !j.mig) return true;
  const here = Object.keys(backupData().data).length > 2;
  await restoreObj(j, here ? 'Já tens dados nesta morada. Substituir pelos que trouxeste da morada antiga?' : `Bem-vindo à nova casa! 🏠 Trazer os teus dados da morada antiga (${Object.keys(j.data).length} itens${j.photos ? ' e fotos' : ''})?`);
  return true;
}
function bkDue() { if (!hasPersonalData()) return false; const last = store.get('ceu_lastbk'), sn = store.get('ceu_bksnooze'); if (sn && sn > todayStr()) return false; return !last || (noonJd(todayStr()) - noonJd(last)) >= 30; }
function bkCard() {
  if (!bkDue()) return '';
  const last = store.get('ceu_lastbk');
  return `<div class="box bkc"><h3>💾 Faz uma cópia dos teus dados</h3><p>${last ? `A última foi a ${niceDate(last)}.` : 'Ainda não fizeste nenhuma.'} Tudo fica só neste telemóvel: se ele se perder, a cópia salva os teus livros, diário, aniversários e viagens.</p><div class="drow"><button class="btn main" id="bkNow">Guardar cópia</button><button class="btn" id="bkLater">Mais tarde</button></div></div>`;
}
function menuBackupHtml() { const last = store.get('ceu_lastbk'); return `<p style="margin:0 0 8px">${last ? `Última cópia: <b>${niceDate(last)}</b>.` : 'Ainda não fizeste nenhuma cópia.'}</p><div class="drow"><button class="btn main" id="mBk">💾 Guardar cópia</button><label class="btn" style="text-align:center">📥 Repor<input type="file" id="mRs" accept="application/json,.json" hidden></label></div><p class="note">Guarda o ficheiro no WhatsApp (envia para ti), no email ou no Drive. Num telemóvel novo, abre a app e carrega em «Repor». O PIN não vai na cópia.</p>`; }
function bindBackupMenu() { const b = $('#bkMenu'); if (!b) return; b.innerHTML = menuBackupHtml(); $('#mBk').onclick = async () => { await doBackup(); b.innerHTML = menuBackupHtml(); bindBackupMenu(); }; $('#mRs').onchange = e => e.target.files[0] && doRestore(e.target.files[0]); }

// ---------- Canvas: utilitários ----------
function loadImg(src) { return new Promise(res => { if (!src) return res(null); const im = new Image(); if (!/^data:/.test(src)) im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; setTimeout(() => res(null), 8000); }); }
async function fontsReady() { try { await Promise.all(['700 40px Cinzel', 'italic 600 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '600 30px Manrope', '800 30px Manrope'].map(f => document.fonts.load(f))); } catch (e) { } }
const EMOJI_F = '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
function newCanvas(W = 1080, H = 1350) { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d'), W, H]; }
function brandFoot(ctx, W, H, y) { const b = (store.get('ceu_brand') || '').trim(); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 26px Cinzel'; ctx.fillText(b || 'CÉU DE HOJE', W / 2, y || H - 52); ctx.textAlign = 'left'; }
function fitFont(ctx, text, maxW, start, min, tpl) { let s = start; do { ctx.font = tpl(s); if (ctx.measureText(text).width <= maxW) break; s -= 2; } while (s > min); return s; }
function linesOf(ctx, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let line = ''; for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); } return out; }

// ---------- Partilhar livro / série / viagem ----------
async function drawItemCard(t, x) {
  await fontsReady();
  const [c, ctx, W, H] = newCanvas(), C = INT[t], cc = t === 'viagens' ? countryOf(x) : null, sky = x.sd ? skyFor(x.sd) : null;
  const el = sky ? SIGNS[sky.moon.sign].el : 'ar'; bg(ctx, W, H, x.id + 'card', EL_COL[el]);
  if (cc) { const [w2, g2] = newCanvas(W, 620); const g = g2.createLinearGradient(0, 0, W, 0); cc[2].forEach((k, i) => g.addColorStop(i / Math.max(1, cc[2].length - 1), k)); g2.fillStyle = g; g2.fillRect(0, 0, W, 620); g2.globalCompositeOperation = 'destination-in'; const m = g2.createLinearGradient(0, 0, 0, 620); m.addColorStop(0, '#000'); m.addColorStop(1, '#0000'); g2.fillStyle = m; g2.fillRect(0, 0, W, 620); ctx.globalAlpha = .3; ctx.drawImage(w2, 0, 0); ctx.globalAlpha = .9; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 10); ctx.globalAlpha = 1; }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 28px Cinzel'; ctx.fillText(t === 'livros' ? 'O MEU LIVRO' : t === 'series' ? (x.kind === 'filme' ? 'O MEU FILME' : 'A MINHA SÉRIE') : t === 'colecoes' ? 'DA MINHA COLEÇÃO' : 'A MINHA VIAGEM', W / 2, 80);
  const img = x.cover ? await loadImg(x.cover) : null;
  const body = (ctx, dy) => { ctx.save(); ctx.translate(0, dy);
  let y = 120;
    
    if (img) { const h = 540, w = Math.min(380, h * img.width / img.height); ctx.save(); ctx.shadowColor = '#000a'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(ctx, W / 2 - w / 2, y, w, h, 14); ctx.clip(); ctx.drawImage(img, W / 2 - w / 2, y, w, h); ctx.restore(); y += h + 70; }
    else if (cc) { ctx.font = `260px ${EMOJI_F}`; ctx.fillText(flagOf(cc[1]), W / 2, y + 290); y += 380; }
    else if (t === 'livros') { const w = 300, h = 430, colr = col(x.title + (x.by || '')); ctx.save(); ctx.shadowColor = '#000a'; ctx.shadowBlur = 40; rr(ctx, W / 2 - w / 2, y, w, h, 12); ctx.fillStyle = colr; ctx.fill(); ctx.restore(); ctx.fillStyle = '#ffffffdd'; ctx.font = '700 34px Cinzel'; wrap(ctx, x.title.toUpperCase(), W / 2, y + 150, w - 50, 44, 5, 'center'); ctx.font = 'italic 600 28px "Cormorant Garamond"'; ctx.fillText(x.by || '', W / 2, y + h - 50); y += h + 70; }
    else { ctx.font = `200px ${EMOJI_F}`; ctx.fillText(t === 'series' && x.kind !== 'filme' ? '📺' : C.ic, W / 2, y + 230); y += 330; }
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; fitFont(ctx, x.title, W - 140, 64, 34, s => `700 ${s}px Cinzel`); ctx.fillText(x.title, W / 2, y); y += 52;
    const sub = [x.by, x.place, x.genre].filter(Boolean).join(' · '); if (sub) { ctx.fillStyle = '#cfc6ee'; ctx.font = 'italic 600 36px "Cormorant Garamond"'; ctx.fillText(sub, W / 2, y); y += 50; }
    if (x.rating) { stars(ctx, W / 2, y + 6, x.rating, 22, 'center'); y += 60; } else y += 16;
    const dur = durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et)); ctx.font = '600 30px Manrope'; ctx.fillStyle = '#e8e2ff';
    const facts = [];
    if (x.status === 2 && dur) facts.push(`⏱ ${C.done} em ${dur}`); else facts.push(C.verb[x.status]);
    if (t === 'livros' && +x.pages) facts.push(`📖 ${x.pages} páginas`);
    ctx.fillText(facts.join('   ·   '), W / 2, y); y += 66;
    // céu + tarot
    const T = tarotFor((x.title || '') + (t === 'livros' ? (x.by || '') + 'l' : t === 'series' ? 'tv' : (x.sd || '') + 'v'));
    ctx.textAlign = 'left'; const bx = 80, bw = W - 160; let lines = [];
    if (sky) lines.push(`🌙 ${t === 'viagens' ? 'Partiste' : 'Começaste'} com a Lua em ${SIGNS[sky.moon.sign].n} (${moonPhaseName(sky.phase.elong)})`);
    if (t === 'viagens' && x.sd && x.status !== 0) { const r = tripScore(x.sd); lines.push(`${r.verdict[0]} ${r.verdict[1]}`); }
    if (t === 'livros' && sky) lines.push(`☿ Mercúrio em ${SIGNS[sky.mercury.sign].n}${sky.mercury.rx ? ' (retrógrado)' : ''}`);
    lines.push(`🃏 ${T[0]}: ${t === 'livros' ? T[3] : t === 'series' ? TAROT_TV[TAROT.indexOf(T)] : T[2]}`);
    ctx.font = '500 29px Manrope'; const L = lines.flatMap(l => linesOf(ctx, l, bw - 60)).slice(0, 7);
    const bh = L.length * 42 + 50;
    ctx.fillStyle = '#ffffff12'; rr(ctx, bx, y, bw, bh, 22); ctx.fill(); ctx.strokeStyle = '#f2c76e44'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#efeaff'; L.forEach((l, i) => ctx.fillText(l, bx + 30, y + 52 + i * 42));
    ctx.restore(); return y + bh; };
  const [, scratch] = newCanvas(W, H + 600); const end = body(scratch, 0), dy = Math.max(0, Math.min(140, (H - 120 - end) / 2)); body(ctx, dy);
  brandFoot(ctx, W, H); return c;
}
async function shareItem(t, x) {
  toast('A preparar a imagem…'); const c = await drawItemCard(t, x);
  const cap = t === 'livros' ? `📚 ${x.title}${x.by ? ' de ' + x.by : ''}${x.rating ? ' ' + '★'.repeat(x.rating) : ''}\n\n${x.comment ? '«' + x.comment.slice(0, 200) + '»\n\n' : ''}Feito com Céu de Hoje ✨ ${APP_URL}` : t === 'viagens' ? `${(() => { const cc = countryOf(x); return cc ? flagOf(cc[1]) + ' ' : '✈️ '; })()}${x.title}${x.rating ? ' ' + '★'.repeat(x.rating) : ''}\n\nFeito com Céu de Hoje ✨ ${APP_URL}` : `🎬 ${x.title}${x.rating ? ' ' + '★'.repeat(x.rating) : ''}\n\nFeito com Céu de Hoje ✨ ${APP_URL}`;
  await shareCanvases([{ name: (x.title || 'item').toLowerCase().replace(/[^a-z0-9]+/gi, '-').slice(0, 40), c }], cap);
}

// ---------- Citações ----------
async function ocrPage(file) {
  const w = await ocrWorker(), cv = await fileToCanvas(file, 2000, false), { data } = await w.recognize(cv);
  return (data.text || '').replace(/-\n(\p{Ll})/gu, '$1').replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}
async function drawQuoteCard(q, x) {
  await fontsReady();
  const [c, ctx, W, H] = newCanvas(), sky = skyFor(q.d || todayStr()), sg = SIGNS[sky.moon.sign];
  bg(ctx, W, H, q.id + 'q', EL_COL[sg.el]);
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 300px "Cormorant Garamond"'; ctx.textAlign = 'left'; ctx.globalAlpha = .55; ctx.fillText('“', 60, 330); ctx.globalAlpha = 1;
  const maxW = W - 200; let s = 68, L;
  do { ctx.font = `italic 600 ${s}px "Cormorant Garamond"`; L = linesOf(ctx, q.txt, maxW); s -= 3; } while ((L.length * s * 1.32 > 760) && s > 30);
  const lh = (s + 3) * 1.32, top = 250 + Math.max(0, (760 - L.length * lh) / 2);
  ctx.fillStyle = '#fbf6ea'; L.forEach((l, i) => ctx.fillText(l, 100, top + i * lh));
  let y = Math.max(top + L.length * lh + 40, 900);
  ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(220, y); ctx.stroke(); y += 60;
  ctx.fillStyle = '#fff'; fitFont(ctx, x.by || x.title, maxW, 44, 26, sz => `700 ${sz}px Cinzel`); ctx.fillText(x.by || x.title, 100, y); y += 50;
  if (x.by) { ctx.fillStyle = '#cfc6ee'; ctx.font = 'italic 600 38px "Cormorant Garamond"'; ctx.fillText(`«${x.title}»${q.pg ? ', p. ' + q.pg : ''}`, 100, y); }
  ctx.font = '500 26px Manrope'; ctx.fillStyle = '#bdb4e6'; ctx.fillText(`🌙 Guardada com a Lua em ${sg.n}`, 100, H - 120);
  brandFoot(ctx, W, H); return c;
}
function quotesBox(x) {
  const Q = x.quotes || [];
  return `<div class="box quotes"><h3>✍️ Citações ${Q.length ? `<small>(${Q.length})</small>` : ''}</h3>${Q.map(q => `<blockquote data-q="${q.id}">“${esc(q.txt)}”<small>${q.pg ? 'p. ' + q.pg + ' · ' : ''}${niceDate(q.d).replace(/-feira/, '')}</small><span><button class="ib qsh" title="Partilhar">📤</button><button class="ib qdel" title="Apagar">🗑️</button></span></blockquote>`).join('') || '<p class="hint" style="text-align:left">Guarda as frases que te tocaram. Podes fotografar a página e eu leio o texto.</p>'}<button class="btn" id="qAdd" style="width:100%">＋ Guardar uma citação</button><div id="qForm"></div></div>`;
}
function bindQuotes(t, id) {
  const get = () => intList(t).find(z => z.id === id), saveQ = fn => { const all = intList(t), o = all.find(z => z.id === id); fn(o); intSave(t, all); openItem(t, id, false); };
  document.querySelectorAll('.quotes blockquote').forEach(b => { const qid = b.dataset.q; b.querySelector('.qsh').onclick = async () => { const x = get(), q = x.quotes.find(z => z.id === qid); toast('A preparar a imagem…'); await shareCanvases([{ name: 'citacao', c: await drawQuoteCard(q, x) }], `“${q.txt}”\n— ${x.by ? x.by + ', ' : ''}${x.title}\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); }; b.querySelector('.qdel').onclick = () => { if (confirmBox('Apagar esta citação?')) saveQ(o => o.quotes = (o.quotes || []).filter(z => z.id !== qid)); }; });
  if (!$('#qAdd')) return;
  $('#qAdd').onclick = () => {
    $('#qAdd').hidden = true;
    $('#qForm').innerHTML = `<div class="form"><label class="btn ghost" style="text-align:center;cursor:pointer">📷 Fotografar a página<input type="file" id="qCam" accept="image/*" capture="environment" hidden></label><p class="hint" id="qMsg" style="margin:4px 0"></p><label>A frase<textarea id="qTxt" rows="4" maxlength="600" placeholder="Escreve ou fotografa a página e apaga o que não queres"></textarea></label><div class="two"><label>Página<input type="number" id="qPg" inputmode="numeric" min="1" max="5000"></label><div style="display:flex;align-items:flex-end"><button class="btn main" id="qSave" style="width:100%">Guardar</button></div></div></div>`;
    $('#qCam').onchange = async e => { const f = e.target.files[0]; if (!f) return; if (!ONLINE()) { $('#qMsg').textContent = 'Para ler a página precisas de internet (abre pelo endereço do GitHub).'; return; } $('#qMsg').textContent = '🔎 A ler a página…'; try { const txt = await ocrPage(f); $('#qTxt').value = txt; if (!txt) { $('#qMsg').textContent = 'Não consegui ler. Tenta com mais luz.'; return; }
        const words = txt.split(' '); let a = -1; $('#qMsg').innerHTML = `<b>Toca na primeira e na última palavra da frase</b> (ou edita o texto em baixo)<div class="qpick">${words.map((w, i) => `<span data-w="${i}">${esc(w)}</span>`).join(' ')}</div>`;
        $('#qMsg').querySelectorAll('[data-w]').forEach(sp => sp.onclick = () => { const i = +sp.dataset.w; const all = $('#qMsg').querySelectorAll('[data-w]'); if (a < 0) { a = i; all.forEach(z => z.classList.toggle('on', +z.dataset.w === i)); $('#qTxt').value = words[i]; } else { const [x0, x1] = a <= i ? [a, i] : [i, a]; all.forEach(z => z.classList.toggle('on', +z.dataset.w >= x0 && +z.dataset.w <= x1)); $('#qTxt').value = words.slice(x0, x1 + 1).join(' ').replace(/^[^\p{L}\p{N}“"«]+/u, ''); a = -1; } }); } catch (er) { $('#qMsg').textContent = 'Não consegui ler a página (precisa de internet).'; } };
    $('#qSave').onclick = () => { const txt = $('#qTxt').value.trim().replace(/^[“"«]+|[”"»]+$/g, ''); if (!txt) { toast('Escreve a frase'); return; } saveQ(o => { o.quotes = (o.quotes || []).concat({ id: 'q' + Date.now().toString(36), txt, pg: $('#qPg').value || '', d: todayStr() }); }); toast('Citação guardada ✍️'); };
  };
}

// ---------- Empréstimos ----------
const lentDays = x => x.lent ? Math.round(noonJd(todayStr()) - noonJd(x.lent.d)) : 0;
function lendBox(x) {
  if (x.lent) { const n = lentDays(x); return `<div class="box"><h3>🤝 Emprestado</h3><p>Está com <b>${esc(x.lent.to)}</b> desde ${niceDate(x.lent.d)}${n ? ` (há ${n} dia${n > 1 ? 's' : ''})` : ''}.</p>${n >= 30 ? '<p class="note">Já passou um mês: talvez seja altura de lembrar 😉</p>' : ''}<button class="btn main" id="lendBack" style="width:100%">✅ Já voltou</button></div>`; }
  return `<div class="box"><h3>🤝 Emprestar</h3><div class="drow"><input type="text" id="lendTo" maxlength="40" placeholder="A quem emprestaste?"><button class="btn" id="lendGo">Emprestar</button></div><p class="note">Avisamos-te passado um mês. Na estante, o livro fica meio fora da prateleira.</p></div>`;
}
function bindLend(t, id) {
  const upd = fn => { const all = intList(t), o = all.find(z => z.id === id); fn(o); intSave(t, all); openItem(t, id, false); render(); };
  if ($('#lendGo')) $('#lendGo').onclick = () => { const to = $('#lendTo').value.trim(); if (!to) { toast('Escreve o nome'); return; } upd(o => o.lent = { to, d: todayStr() }); toast(`Emprestado a ${to} 🤝`); };
  if ($('#lendBack')) $('#lendBack').onclick = () => upd(o => { o.lentLog = (o.lentLog || []).concat({ ...o.lent, back: todayStr() }); delete o.lent; });
}
function lentReminders() {
  const L = intList('livros').filter(x => x.lent && lentDays(x) >= 30); if (!L.length) return '';
  return `<div class="box careful2">${L.map(x => `<p>🤝 <b>«${esc(x.title)}»</b> está com ${esc(x.lent.to)} há ${lentDays(x)} dias. Já pediste de volta?</p>`).join('')}</div>`;
}

// ---------- Meta de leitura ----------
function goalGet(y) { try { return (JSON.parse(store.get('ceu_goal') || '{}'))[y] || 0; } catch (e) { return 0; } }
function goalSet(y, n) { let o = {}; try { o = JSON.parse(store.get('ceu_goal') || '{}'); } catch (e) { } o[y] = n; store.set('ceu_goal', JSON.stringify(o)); }
function goalBox() {
  const y = todayStr().slice(0, 4), g = goalGet(y), done = intList('livros').filter(x => x.status === 2 && (x.ed || '').startsWith(y)).length;
  if (!g || ST.goalEdit) return `<div class="box goal"><h3>🎯 Meta de leitura ${y}</h3><p>Quantos livros queres ler este ano?</p><div class="drow"><input type="number" id="goalIn" inputmode="numeric" min="1" max="365" value="${g || 12}"><button class="btn main" id="goalSet">Definir</button></div></div>`;
  const doy = noonJd(todayStr()) - noonJd(y + '-01-01') + 1, diy = noonJd((+y + 1) + '-01-01') - noonJd(y + '-01-01'), exp = g * doy / diy, diff = done - exp, pct = Math.min(1, done / g);
  const R = 46, Cc = 2 * Math.PI * R;
  const msg = done >= g ? `🏆 Meta cumprida! ${done > g ? `Já vais ${done - g} acima.` : 'Parabéns!'}` : diff >= 1 ? `🚀 Vais ${Math.floor(diff)} livro${Math.floor(diff) > 1 ? 's' : ''} à frente do ritmo.` : diff <= -1 ? `🐢 Estás ${Math.ceil(-diff)} livro${Math.ceil(-diff) > 1 ? 's' : ''} atrás do ritmo. Ainda vais a tempo!` : '✨ Vais mesmo no ritmo certo.';
  const left = g - done, daysLeft = Math.max(1, diy - doy), per = left > 0 ? Math.round(daysLeft / left) : 0;
  return `<div class="box goal"><div class="ring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="${R}" class="rbg"/><circle cx="55" cy="55" r="${R}" class="rfg" stroke-dasharray="${Cc}" stroke-dashoffset="${Cc * (1 - pct)}"/></svg><b>${done}<small>/${g}</small></b></div><div><h3>🎯 Meta ${y}</h3><p>${msg}</p>${left > 0 ? `<p class="note">Faltam ${left}: um livro a cada ${per} dias.</p>` : ''}<button class="link" id="goalEd">mudar meta</button></div></div>`;
}
function bindGoal() { if ($('#goalSet')) $('#goalSet').onclick = () => { const n = +$('#goalIn').value; if (n > 0) { goalSet(todayStr().slice(0, 4), n); ST.goalEdit = false; render(); } }; if ($('#goalEd')) $('#goalEd').onclick = () => { ST.goalEdit = true; render(); }; }

// ---------- Passaporte ----------
const CNAME = { PT: 'Portugal', ES: 'Espanha', FR: 'França', IT: 'Itália', DE: 'Alemanha', GB: 'Reino Unido', IE: 'Irlanda', NL: 'Países Baixos', BE: 'Bélgica', CH: 'Suíça', AT: 'Áustria', GR: 'Grécia', HR: 'Croácia', CZ: 'Chéquia', HU: 'Hungria', PL: 'Polónia', DK: 'Dinamarca', SE: 'Suécia', NO: 'Noruega', FI: 'Finlândia', IS: 'Islândia', TR: 'Turquia', MA: 'Marrocos', EG: 'Egito', TN: 'Tunísia', CV: 'Cabo Verde', AO: 'Angola', MZ: 'Moçambique', ST: 'São Tomé', GW: 'Guiné-Bissau', ZA: 'África do Sul', BR: 'Brasil', US: 'Estados Unidos', CA: 'Canadá', MX: 'México', CU: 'Cuba', DO: 'Rep. Dominicana', AR: 'Argentina', CL: 'Chile', PE: 'Peru', CO: 'Colômbia', JP: 'Japão', CN: 'China', TH: 'Tailândia', IN: 'Índia', VN: 'Vietname', ID: 'Indonésia', MV: 'Maldivas', AE: 'Emirados', AU: 'Austrália', NZ: 'Nova Zelândia', LU: 'Luxemburgo', AD: 'Andorra', MT: 'Malta', CY: 'Chipre', RO: 'Roménia', BG: 'Bulgária' };
const EU_ISO = 'PT ES FR IT DE GB IE NL BE CH AT GR HR CZ HU PL DK SE NO FI IS LU AD MT CY RO BG TR'.split(' '), EU_TOTAL = 44;
const CONT = { AF: 'MA EG TN CV AO MZ ST GW ZA', AM: 'BR US CA MX CU DO AR CL PE CO', AS: 'JP CN TH IN VN ID MV AE', OC: 'AU NZ' };
const contOf = iso => EU_ISO.includes(iso) ? 'Europa' : CONT.AF.includes(iso) ? 'África' : CONT.AM.includes(iso) ? 'Américas' : CONT.AS.includes(iso) ? 'Ásia' : CONT.OC.includes(iso) ? 'Oceânia' : '';
function passportStamps() {
  const by = {};
  intList('viagens').filter(x => x.status >= 1 && x.sd).sort((a, b) => a.sd.localeCompare(b.sd)).forEach(x => { const cc = countryOf(x); if (!cc) return; const k = cc[1]; if (!by[k]) by[k] = { iso: k, cc, name: CNAME[k] || cc[0], first: x.sd, years: new Set(), n: 0, moon: SIGNS[skyFor(x.sd).moon.sign].n }; by[k].years.add(x.sd.slice(0, 4)); by[k].n++; });
  const S = Object.values(by), eu = S.filter(s => EU_ISO.includes(s.iso)).length, conts = [...new Set(S.map(s => contOf(s.iso)).filter(Boolean))];
  return { S, eu, euPct: Math.round(eu / EU_TOTAL * 100), conts };
}
function vPassport() {
  const P2 = passportStamps(), me = P.get();
  if (!P2.S.length) return `<div class="box"><h3>🛂 Passaporte astral</h3><p>Quando juntares viagens feitas com data e país, cada país ganha aqui o seu carimbo.</p></div>`;
  const stamp = (s, i) => { const r = seeded(s.iso)(), rot = (r * 16 - 8).toFixed(1), c = s.cc[2].find(k => !/^#f{3,6}$/i.test(k)) || '#c33'; return `<div class="stamp" style="--sc:${c};transform:rotate(${rot}deg)"><span class="sf">${flagOf(s.iso)}</span><b>${esc(s.name.toUpperCase())}</b><small>${[...s.years].join(' · ')}</small><i>☾ ${s.moon}</i></div>`; };
  return `<div class="passport"><div class="pp-h"><small>PASSAPORTE ASTRAL</small><b>${esc((me && me.name) || 'Viajante')}</b></div><div class="pp-s"><div><b>${P2.S.length}</b><span>país${P2.S.length > 1 ? 'es' : ''}</span></div><div><b>${P2.euPct}%</b><span>da Europa</span></div><div><b>${P2.conts.length}</b><span>continente${P2.conts.length > 1 ? 's' : ''}</span></div></div><div class="stamps">${P2.S.map(stamp).join('')}</div><button class="btn main" id="ppShare" style="width:100%;margin-top:12px">📤 Partilhar o passaporte</button></div>`;
}
async function drawPassport() {
  await fontsReady();
  const P2 = passportStamps(), me = P.get(), n = P2.S.length, cols = n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), H = Math.max(1350, 520 + rows * (cols === 2 ? 420 : 270)), [c, ctx, W] = newCanvas(1080, H);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#132447'); g.addColorStop(1, '#0a1226'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = seeded('pp'); ctx.strokeStyle = '#ffffff0c'; ctx.lineWidth = 1; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(W / 2, H * .45, 120 + i * 22, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = '#f2c76e88'; ctx.lineWidth = 3; rr(ctx, 30, 30, W - 60, H - 60, 26); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText('PASSAPORTE ASTRAL', W / 2, 105);
  ctx.fillStyle = '#fff'; ctx.font = '700 62px Cinzel'; ctx.fillText(((me && me.name) || 'Viajante').split(' ')[0].toUpperCase(), W / 2, 180);
  ctx.font = '600 30px Manrope'; ctx.fillStyle = '#cdd8f5'; ctx.fillText(`${n} país${n > 1 ? 'es' : ''}  ·  ${P2.euPct}% da Europa  ·  ${P2.conts.length} continente${P2.conts.length > 1 ? 's' : ''}`, W / 2, 240);
  const cw = (W - 120) / cols, ch = cols === 2 ? 420 : 270, top = 300 + Math.max(0, (H - 140 - 300 - rows * ch) / 2);
  P2.S.forEach((s, i) => {
    const row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols), cx = W / 2 + ((i % cols) - (inRow - 1) / 2) * cw, cy = top + Math.floor(i / cols) * ch + ch / 2, col = s.cc[2].find(k => !/^#f{3,6}$/i.test(k)) || '#c33', rot = (seeded(s.iso)() * 16 - 8) * Math.PI / 180, R = Math.min(cw, ch) / 2 - 22;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = .92;
    ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke(); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R - 12, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ffffff10'; ctx.beginPath(); ctx.arc(0, 0, R - 12, 0, 7); ctx.fill();
    ctx.font = `${Math.round(R * .62)}px ${EMOJI_F}`; ctx.fillStyle = '#fff'; ctx.fillText(flagOf(s.iso), 0, -R * .08);
    ctx.fillStyle = '#fff'; fitFont(ctx, s.name.toUpperCase(), R * 1.6, Math.round(R * .2), 14, z => `700 ${z}px Cinzel`); ctx.fillText(s.name.toUpperCase(), 0, R * .36);
    ctx.font = `600 ${Math.round(R * .15)}px Manrope`; ctx.fillStyle = '#dfe6ff'; ctx.fillText([...s.years].join(' · ') + '  ☾ ' + s.moon, 0, R * .6);
    ctx.restore();
  });
  brandFoot(ctx, W, H, H - 60); return c;
}

// ---------- Livro do ano ----------
const ANO_Q = [
  ['mood', 'Como foi o teu ano, numa palavra-emoji?', 'pick'],
  ['word', 'Se 2026 fosse uma só palavra, qual seria?', 'Ex.: Coragem'],
  ['best', 'Qual foi o melhor momento do ano?', 'Ex.: O dia em que…'],
  ['photo', 'Escolhe a fotografia do ano 📷', 'photo'],
  ['who', 'Quem te marcou mais este ano?', 'Um nome, ou alguns'],
  ['proud', 'Uma conquista de que te orgulhas?', 'Grande ou pequena, conta'],
  ['learn', 'O que aprendeste em 2026?', 'Ex.: que não preciso de agradar a todos'],
  ['song', 'A música que vai ficar como banda sonora de 2026?', 'Música e artista'],
  ['leave', 'O que deixas ficar em 2026?', 'Ex.: a pressa, o medo de…'],
  ['wish', 'O teu desejo para 2027?', 'Escreve com fé ✨']];
const ANO_MOODS = [['🤩', 'Incrível'], ['😊', 'Bom'], ['🌊', 'Intenso'], ['🌱', 'De crescimento'], ['😮‍💨', 'Difícil'], ['🎢', 'Uma montanha-russa']];
function anoYear() { const t = todayStr(); return +t.slice(5, 7) <= 1 ? +t.slice(0, 4) - 1 : +t.slice(0, 4); }
function anoYears() { const cur = anoYear(), ys = new Set([cur]); for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), mm = /^ceu_ano_(\d{4})$/.exec(k || ''); if (mm) ys.add(+mm[1]); } MOM.all().forEach(x => ys.add(+x.d.slice(0, 4))); ['livros', 'viagens', 'series'].forEach(t => intList(t).forEach(x => { const d = x.ed || x.sd; if (d) ys.add(+d.slice(0, 4)); })); DIA.all().forEach(x => ys.add(+x.d.slice(0, 4))); return [...ys].filter(v => v >= 1990 && v <= cur).sort((a, b) => a - b); }
function anoGet(y) { try { return JSON.parse(store.get('ceu_ano_' + y) || '{}'); } catch (e) { return {}; } }
function anoSet(y, o) { store.set('ceu_ano_' + y, JSON.stringify(o)); }
function yearCard() {
  const y = anoYear(), A = anoGet(y), m = +todayStr().slice(5, 7), hot = m >= 11 || m === 1;
  if (!hot) return `<button class="yrow" id="anoGo">📖 <span>${A.done ? `O meu livro de ${y}` : `Criar o meu livro de ${y}`}</span><i>›</i></button>`;
  return `<div class="box yearc${hot ? ' hot' : ''}"><div class="yc-ic">📖</div><div><h3>O meu livro de ${y}</h3><p>${A.done ? 'O teu livro do ano está pronto. Abre, partilha ou exporta em PDF.' : `Responde a ${ANO_Q.length} perguntas e junto tudo o que viveste: livros, viagens, séries, pessoas e diário. Sai um mini-livro só teu.`}</p><button class="btn main" id="anoGo">${A.done ? '📖 Abrir o meu livro' : '✨ Criar o meu livro'}</button></div></div>`;
}
function lowFirst(s) { s = String(s || '').trim().replace(/[.!]+$/, ''); return s ? s[0].toLowerCase() + s.slice(1) : ''; }
function yearData(y) {
  const ys = String(y), p = P.get() || {}, si = p.d ? (p.t ? sunSignAt(p.d, p.t, p.c) : sunSignOf(p.d)) : null;
  const inY = (x, k) => (x[k] || '').startsWith(ys);
  const books = intList('livros'), read = books.filter(x => x.status === 2 && inY(x, 'ed')).sort((a, b) => a.ed.localeCompare(b.ed));
  const pages = read.reduce((a, x) => a + (+x.pages || 0), 0), favB = [...read].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  const byA = {}; read.forEach(x => x.by && (byA[x.by] = (byA[x.by] || 0) + 1)); const topA = Object.entries(byA).sort((a, b) => b[1] - a[1])[0];
  const byG = {}; read.forEach(x => x.genre && (byG[x.genre] = (byG[x.genre] || 0) + 1)); const topG = Object.entries(byG).sort((a, b) => b[1] - a[1])[0];
  const durs = read.filter(x => x.sd).map(x => ({ x, d: Math.max(1, Math.round(noonJd(x.ed) - noonJd(x.sd))) })), fastest = durs.sort((a, b) => a.d - b.d)[0];
  const quotes = books.flatMap(x => (x.quotes || []).filter(q => (q.d || '').startsWith(ys)).map(q => ({ ...q, b: x })));
  const shows = intList('series').filter(x => inY(x, 'ed') || inY(x, 'sd')), favS = [...shows].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  const trips = intList('viagens').filter(x => x.status >= 1 && inY(x, 'sd')).sort((a, b) => a.sd.localeCompare(b.sd)), countries = []; trips.forEach(x => { const cc = countryOf(x); if (cc && !countries.find(c => c[1] === cc[1])) countries.push(cc); });
  const favT = [...trips].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  const ppl = P.list('ceu_bdays'), pets = P.list('ceu_pets'); let bdlog = []; try { bdlog = JSON.parse(store.get('ceu_bdlog') || '[]').filter(b => (b.d || '').startsWith(ys)); } catch (e) { }
  const cards = [...new Set(bdlog.map(b => b.n))];
  const notes = DIA.all().filter(x => (x.d || '').startsWith(ys)), avgM = notes.length ? notes.reduce((a, x) => a + x.mood, 0) / notes.length : 0;
  const byM = {}; notes.forEach(x => { const k = +x.d.slice(5, 7); (byM[k] = byM[k] || []).push(x.mood); }); const bestM = Object.entries(byM).map(([k, v]) => [+k, v.reduce((a, b) => a + b, 0) / v.length, v.length]).filter(e => e[2] >= 2).sort((a, b) => b[1] - a[1])[0];
  const tags = {}; notes.forEach(x => (x.tags || []).forEach(t => tags[t] = (tags[t] || 0) + 1)); const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  const happy = notes.filter(x => x.mood >= 5 && x.txt && x.txt.length >= 12 && x.txt.length <= 160 && !CRISIS.test(nrm(x.txt))).slice(-3);
  const sJ = skyFor(ys + '-01-01'), sD = skyFor(ys + '-12-31'), sN = skyFor((y + 1) + '-07-01');
  const dreamsY = intList('viagens').filter(x => x.realized && (x.realized.d || '').startsWith(ys));
  return { dreamsY, y, p, si, read, pages, favB, topA, topG, fastest, quotes, shows, favS, trips, countries, favT, ppl, pets, cards, notes, avgM, bestM, topTag, happy, sJ, sD, sN, cn: chineseSign(ys + '-07-01'), cnNext: chineseSign((y + 1) + '-07-01') };
}
// --- páginas (papel creme) ---
const INK = '#2b2118', GOLD = '#a8842c', PAPER = '#f7f0e1';
function paper(ctx, W, H, seed) {
  ctx.__noTheme = true;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .8); v.addColorStop(0, '#00000000'); v.addColorStop(1, '#6b4b2033'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const r = seeded('pp' + seed); for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(110,80,40,${r() * .06})`; ctx.fillRect(r() * W, r() * H, 1.5, 1.5); }
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92); ctx.lineWidth = 1; ctx.strokeRect(58, 58, W - 116, H - 116);
  ctx.fillStyle = GOLD; ctx.font = `30px ${SYMF}`; ctx.textAlign = 'center'; [[52, 64], [W - 52, 64], [52, H - 40], [W - 52, H - 40]].forEach(([x, y]) => ctx.fillText('✦', x, y)); ctx.textAlign = 'left';
}
function chapter(ctx, W, num, title, y = 170) {
  ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 26px Cinzel'; ctx.fillText(num ? 'CAPÍTULO ' + num : '', W / 2, y);
  ctx.fillStyle = INK; fitFont(ctx, title, W - 220, 72, 40, s => `italic 600 ${s}px "Cormorant Garamond"`); ctx.fillText(title, W / 2, y + 82);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 150, y + 120); ctx.lineTo(W / 2 - 20, y + 120); ctx.moveTo(W / 2 + 20, y + 120); ctx.lineTo(W / 2 + 150, y + 120); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.font = `24px ${SYMF}`; ctx.fillText('✦', W / 2, y + 129); ctx.textAlign = 'left'; return y + 190;
}
function ornament(ctx, W, H, yy, ic) { const free = H - 150 - yy; if (free < 260) return; const sz = Math.min(320, free * .7); ctx.save(); ctx.globalAlpha = .13; ctx.textAlign = 'center'; ctx.font = `${Math.round(sz)}px ${EMOJI_F}`; ctx.fillText(ic, W / 2, yy + free / 2 + sz * .35); ctx.restore(); }
function pageNum(ctx, W, H, n) { ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '600 26px "Cormorant Garamond"'; ctx.fillText(`— ${n} —`, W / 2, H - 82); ctx.textAlign = 'left'; }
function para(ctx, text, x, y, w, size = 36, color = INK, align = 'left', maxLines = 30) { ctx.font = `500 ${size}px "Cormorant Garamond"`; ctx.fillStyle = color; const L = linesOf(ctx, text, w).slice(0, maxLines); ctx.textAlign = align; L.forEach((l, i) => ctx.fillText(l, align === 'center' ? x + w / 2 : x, y + i * size * 1.3)); ctx.textAlign = 'left'; return y + L.length * size * 1.3; }
function bigStats(ctx, W, y, items) { const n = items.length, cw = (W - 200) / n; items.forEach(([v, l], i) => { const cx = 100 + cw * i + cw / 2; ctx.textAlign = 'center'; ctx.fillStyle = GOLD; fitFont(ctx, String(v), cw - 20, 76, 30, s => `700 ${s}px Cinzel`); ctx.fillText(String(v), cx, y); ctx.fillStyle = INK; ctx.font = '600 26px Manrope'; ctx.fillText(l, cx, y + 44); }); ctx.textAlign = 'left'; return y + 100; }
function listLines(ctx, items, x, y, w, size = 32, max = 9) { ctx.font = `500 ${size}px "Cormorant Garamond"`; items.slice(0, max).forEach((t, i) => { ctx.fillStyle = GOLD; ctx.fillText('❧', x, y + i * size * 1.45); ctx.fillStyle = INK; let s = t; while (ctx.measureText(s).width > w - 50 && s.length > 3) s = s.slice(0, -2); ctx.fillText(s === t ? s : s + '…', x + 46, y + i * size * 1.45); }); return y + Math.min(items.length, max) * size * 1.45; }
async function buildYearBook(y) {
  await fontsReady();
  const D = yearData(y), A = anoGet(y), W = 1080, H = 1350, pages = [], first = (D.p.name || '').split(' ')[0];
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']; let ch = 0, pn = 1;
  const page = (fn, name) => { const [c, ctx] = newCanvas(W, H); fn(ctx); pages.push({ name: `${String(pages.length + 1).padStart(2, '0')}-${name}`, c }); };
  const sg = D.si != null ? SIGNS[D.si] : null, el = sg ? sg.el : 'agua';
  // 1. Capa
  page(ctx => {
    bg(ctx, W, H, 'ano' + y + first, EL_COL[el]); wheel(ctx, W / 2, 560, 330, .35);
    ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92); ctx.lineWidth = 1; ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.fillText('O LIVRO DE', W / 2, 220);
    ctx.fillStyle = '#fff'; fitFont(ctx, (first || 'UM ANO').toUpperCase(), W - 200, 110, 50, s => `700 ${s}px Cinzel`); ctx.fillText((first || 'UM ANO').toUpperCase(), W / 2, 340);
    if (sg) { ctx.font = `150px ${SYMF}`; ctx.fillStyle = EL_COL[el][0]; ctx.fillText(sg.g + VS, W / 2, 640); }
    ctx.fillStyle = '#f2c76e'; ctx.font = '700 170px Cinzel'; ctx.fillText(String(y), W / 2, 930);
    ctx.fillStyle = '#e9e2ff'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; ctx.fillText('Um ano escrito nas estrelas', W / 2, 1020);
    if (A.mood != null) { ctx.font = `64px ${EMOJI_F}`; ctx.fillText(ANO_MOODS[A.mood][0], W / 2, 1130); }
    brandFoot(ctx, W, H, H - 90);
  }, 'capa');
  // 2. A palavra
  page(ctx => {
    paper(ctx, W, H, 2); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 28px Cinzel'; ctx.fillText(`${y} NUMA PALAVRA`, W / 2, 330);
    ctx.fillStyle = INK; const w = A.word || (A.mood != null ? ANO_MOODS[A.mood][1] : 'Vivido'); fitFont(ctx, w, W - 220, 150, 60, s => `italic 600 ${s}px "Cormorant Garamond"`); ctx.fillText(w, W / 2, 560);
    if (A.mood != null) { ctx.font = '600 34px Manrope'; ctx.fillStyle = '#5b4a36'; ctx.fillText(`Um ano ${ANO_MOODS[A.mood][1].toLowerCase()} ${ANO_MOODS[A.mood][0]}`, W / 2, 660); }
    let yy = 820; const lines = [];
    if (D.read.length) lines.push(`${D.read.length} livro${D.read.length > 1 ? 's' : ''}`); if (D.countries.length) lines.push(`${D.countries.length} país${D.countries.length > 1 ? 'es' : ''}`); if (D.shows.length) lines.push(`${D.shows.length} série${D.shows.length > 1 ? 's' : ''} e filmes`); if (D.notes.length) lines.push(`${D.notes.length} página${D.notes.length > 1 ? 's' : ''} de diário`);
    if (lines.length) { ctx.fillStyle = INK; const half = lines.length > 2 ? [lines.slice(0, 2), lines.slice(2)] : [lines]; half.forEach(hl => { fitFont(ctx, hl.join('  ·  '), W - 220, 44, 26, z => `italic 500 ${z}px "Cormorant Garamond"`); ctx.fillText(hl.join('  ·  '), W / 2, yy); yy += 58; }); yy += 12; }
    ctx.font = 'italic 500 34px "Cormorant Garamond"'; ctx.fillStyle = '#6b5a44'; para(ctx, 'Este livro foi escrito por ti, dia após dia, sem saberes. Aqui está ele.', 160, yy + 40, W - 320, 34, '#6b5a44', 'center');
    pageNum(ctx, W, H, ++pn);
  }, 'palavra');
  if (A.photo) { const ph = await loadImg(A.photo); if (ph) page(ctx => {
    paper(ctx, W, H, 21); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 28px Cinzel'; ctx.fillText(`A FOTOGRAFIA DE ${y}`, W / 2, 190);
    const fw = 720, fh = Math.min(760, fw * ph.height / ph.width), pw = fw + 60, phh = fh + 190;
    ctx.save(); ctx.translate(W / 2, 270 + phh / 2); ctx.rotate(-.04); ctx.shadowColor = '#0005'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = '#fffdf8'; ctx.fillRect(-pw / 2, -phh / 2, pw, phh); ctx.shadowColor = 'transparent';
    const sw = ph.width, shh = Math.min(ph.height, sw * fh / fw); ctx.drawImage(ph, 0, (ph.height - shh) / 2, sw, shh, -fw / 2, -phh / 2 + 30, fw, fh);
    ctx.fillStyle = '#3a3026'; const cap = A.best || String(y); fitFont(ctx, cap, fw - 20, 46, 26, z => `italic 600 ${z}px "Cormorant Garamond"`); ctx.fillText(cap.length > 60 ? cap.slice(0, 58) + '…' : cap, 0, phh / 2 - 70);
    ctx.fillStyle = '#e8d9a8cc'; ctx.save(); ctx.rotate(-.5); ctx.fillRect(-60, -phh / 2 - 10, 120, 34); ctx.restore(); ctx.restore();
    pageNum(ctx, W, H, ++pn);
  }, 'foto'); }
  // 3. O teu céu
  page(ctx => {
    paper(ctx, W, H, 3); let yy = chapter(ctx, W, roman[++ch], `O teu céu de ${y}`);
    const T = tarotFor((D.p.name || '') + y + 'ano'), py = D.p.d ? personalYear(D.p.d, y) : null;
    const items = [];
    if (sg) items.push(`Nasceste com o Sol em ${sg.n}, signo de ${sg.el === 'agua' ? 'água' : sg.el}.`);
    items.push(`${y} foi o ano chinês do ${D.cn.n} ${D.cn.e} (${D.cn.el}).`);
    if (py) items.push(`Viveste o teu ano pessoal ${py}: ${YEAR_MEAN[py]}.`);
    items.push(D.sJ.jupiter.sign === D.sD.jupiter.sign ? `Júpiter, o planeta da sorte, passou o ano em ${SIGNS[D.sJ.jupiter.sign].n}.` : `Júpiter, o planeta da sorte, começou o ano em ${SIGNS[D.sJ.jupiter.sign].n} e terminou em ${SIGNS[D.sD.jupiter.sign].n}.`);
    items.push(D.sJ.saturn.sign === D.sD.saturn.sign ? `Saturno, o mestre da paciência, esteve em ${SIGNS[D.sJ.saturn.sign].n}.` : `Saturno, o mestre da paciência, mudou de ${SIGNS[D.sJ.saturn.sign].n} para ${SIGNS[D.sD.saturn.sign].n}.`);
    items.forEach(t => { yy = para(ctx, t, 140, yy, W - 280, 38) + 22; });
    yy += 30; ctx.fillStyle = '#efe4cc'; rr(ctx, 120, yy, W - 240, 300, 20); ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 26px Cinzel'; ctx.fillText('A TUA CARTA DO ANO', W / 2, yy + 60); ctx.fillStyle = INK; ctx.font = 'italic 600 58px "Cormorant Garamond"'; ctx.fillText(`${T[1]} · ${T[0]}`, W / 2, yy + 135); ctx.textAlign = 'left';
    para(ctx, cap1(T[2].replace(/viagem|viajar/g, 'caminho')) + '.', 170, yy + 195, W - 340, 32, '#4a3c2c', 'center', 3);
    pageNum(ctx, W, H, ++pn);
  }, 'ceu');
  // 4. Livros
  if (D.read.length) page(ctx => {
    paper(ctx, W, H, 4); let yy = chapter(ctx, W, roman[++ch], 'As tuas leituras');
    yy = bigStats(ctx, W, yy + 40, [[D.read.length, D.read.length > 1 ? 'livros' : 'livro'], [D.pages ? D.pages.toLocaleString('pt-PT') : '–', 'páginas'], [D.topG ? D.topG[0] : '–', 'género']]) + 20;
    const lvl = READER.filter(r => D.read.length >= r[0]).pop(); ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.font = 'italic 600 44px "Cormorant Garamond"'; ctx.fillText(lvl[1], W / 2, yy); ctx.textAlign = 'left'; yy += 60;
    if (D.favB && D.favB.rating) yy = para(ctx, `O favorito: «${D.favB.title}»${D.favB.by ? ', de ' + D.favB.by : ''} ${'★'.repeat(D.favB.rating)}`, 140, yy, W - 280, 36) + 10;
    if (D.topA && D.topA[1] > 1) yy = para(ctx, `Autor(a) do ano: ${D.topA[0]} (${D.topA[1]} livros).`, 140, yy, W - 280, 34) + 6;
    if (D.fastest && D.read.length > 1) yy = para(ctx, `O mais rápido: «${D.fastest.x.title}», em ${D.fastest.d} dia${D.fastest.d > 1 ? 's' : ''}.`, 140, yy, W - 280, 34) + 6;
    yy += 24; yy = listLines(ctx, D.read.map(x => x.title + (x.by ? ' — ' + x.by : '')), 140, yy, W - 280, 32, Math.max(3, Math.floor((H - 160 - yy) / 46)));
    try { ornament(ctx, W, H, Math.max(yy, 0), '📚'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'livros');
  // 4b. Citações
  if (D.quotes.length) page(ctx => {
    paper(ctx, W, H, 41); let yy = chapter(ctx, W, '', 'Frases que guardaste', 150);
    D.quotes.slice(-4).forEach(q => { if (yy > H - 300) return; ctx.fillStyle = GOLD; ctx.font = '700 70px "Cormorant Garamond"'; ctx.fillText('“', 120, yy + 30); ctx.font = 'italic 500 36px "Cormorant Garamond"'; ctx.fillStyle = INK; const L = linesOf(ctx, q.txt, W - 320).slice(0, 5); L.forEach((l, i) => ctx.fillText(l, 180, yy + i * 46)); yy += L.length * 46 + 8; ctx.font = '600 24px Manrope'; ctx.fillStyle = '#6b5a44'; ctx.fillText(`— ${q.b.title}${q.pg ? ', p. ' + q.pg : ''}`, 180, yy); yy += 70; });
    try { ornament(ctx, W, H, Math.max(yy, 0), '❝'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'citacoes');
  // 5. Viagens
  if (D.trips.length) page(ctx => {
    paper(ctx, W, H, 5); let yy = chapter(ctx, W, roman[++ch], 'Os teus caminhos');
    if (D.dreamsY.length) { ctx.fillStyle = '#efe4cc'; rr(ctx, 120, yy - 10, W - 240, 120, 18); ctx.fill(); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 22px Cinzel'; ctx.fillText('✦ SONHO REALIZADO ✦', W / 2, yy + 28); ctx.fillStyle = INK; fitFont(ctx, `Finalmente: ${D.dreamsY.map(x => x.title).join(', ')}!`, W - 300, 40, 24, z => `italic 600 ${z}px "Cormorant Garamond"`); ctx.fillText(`Finalmente: ${D.dreamsY.map(x => x.title).join(', ')}!`, W / 2, yy + 82); ctx.textAlign = 'left'; yy += 140; }
    if (D.countries.length) { const n = D.countries.length, sz = n <= 3 ? 150 : n <= 6 ? 110 : 80, per = Math.floor((W - 200) / (sz * 1.25)); ctx.textAlign = 'center'; ctx.font = `${sz}px ${EMOJI_F}`; D.countries.slice(0, per * 2).forEach((c, i) => { const row = Math.floor(i / per), inRow = Math.min(per, n - row * per), x = W / 2 + (i % per - (inRow - 1) / 2) * sz * 1.25; ctx.fillText(flagOf(c[1]), x, yy + sz + row * sz * 1.3); }); yy += sz * 1.3 * Math.ceil(Math.min(n, per * 2) / per) + 40; ctx.textAlign = 'left'; }
    yy = bigStats(ctx, W, yy + 30, [[D.trips.length, D.trips.length > 1 ? 'viagens' : 'viagem'], [D.countries.length, D.countries.length === 1 ? 'país' : 'países']]) + 10;
    if (D.favT) { const r = tripScore(D.favT.sd); yy = para(ctx, `A viagem do ano: ${D.favT.title}${D.favT.rating ? ' ' + '★'.repeat(D.favT.rating) : ''}. Partiste com a Lua em ${SIGNS[skyFor(D.favT.sd).moon.sign].n}: ${lowFirst(r.verdict[1])}.`, 140, yy, W - 280, 36) + 20; }
    yy = listLines(ctx, D.trips.map(x => `${x.title} · ${niceDate(x.sd).replace(/^[^,]+, /, '')}`), 140, yy, W - 280, 32, Math.max(2, Math.floor((H - 160 - yy) / 46)));
    try { ornament(ctx, W, H, Math.max(yy, 0), '🧭'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'viagens');
  // 6. Séries
  if (D.shows.length) page(ctx => {
    paper(ctx, W, H, 6); let yy = chapter(ctx, W, roman[++ch], 'No sofá');
    yy = bigStats(ctx, W, yy + 40, [[D.shows.length, D.shows.length > 1 ? 'séries e filmes' : 'série ou filme']]) + 20;
    if (D.favS && D.favS.rating) yy = para(ctx, `A que mais gostaste: «${D.favS.title}» ${'★'.repeat(D.favS.rating)}`, 140, yy, W - 280, 38) + 20;
    yy = listLines(ctx, D.shows.map(x => x.title + (x.rating ? '  ' + '★'.repeat(x.rating) : '')), 140, yy, W - 280, 34, Math.floor((H - 160 - yy) / 49));
    try { ornament(ctx, W, H, Math.max(yy, 0), '🍿'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'series');
  // 7. Pessoas
  if (D.ppl.length || D.pets.length || D.cards.length || A.who) page(ctx => {
    paper(ctx, W, H, 7); let yy = chapter(ctx, W, roman[++ch], 'As tuas pessoas');
    const st = []; if (D.ppl.length) st.push([D.ppl.length, 'aniversários na agenda']); if (D.cards.length) st.push([D.cards.length, D.cards.length > 1 ? 'cartões de parabéns' : 'cartão de parabéns']); if (D.pets.length) st.push([D.pets.length, D.pets.length > 1 ? 'patudos' : 'patudo']);
    if (st.length) yy = bigStats(ctx, W, yy + 40, st) + 20;
    if (A.who) { ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 24px Cinzel'; ctx.fillText('QUEM TE MARCOU', W / 2, yy + 20); ctx.fillStyle = INK; fitFont(ctx, A.who, W - 240, 64, 34, s => `italic 600 ${s}px "Cormorant Garamond"`); ctx.fillText(A.who, W / 2, yy + 100); ctx.textAlign = 'left'; yy += 160; }
    if (D.cards.length) yy = para(ctx, `Este ano deste os parabéns a ${D.cards.slice(0, 6).join(', ')}${D.cards.length > 6 ? ' e mais ' + (D.cards.length - 6) : ''}. Cada cartão foi um abraço à distância.`, 140, yy, W - 280, 34) + 20;
    if (D.pets.length) yy = para(ctx, `E não esquecer ${D.pets.map(a => a.name).join(', ')}, que esteve${D.pets.length > 1 ? 'ram' : ''} sempre lá 🐾`.replace(' 🐾', '.'), 140, yy, W - 280, 34) + 20;
    try { ornament(ctx, W, H, Math.max(yy, 0), '💛'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'pessoas');
  // 7b. Patudos
  const petsY = P.list('ceu_pets').map(a => ({ a, C: petCare(a).filter(c => (c.d || '').startsWith(String(y))) })).filter(o => o.C.length);
  if (petsY.length) { const pics = []; for (const o of petsY) for (const c of o.C.filter(c => c.photo).slice(-3)) { const im = await loadImg(c.photo); if (im) pics.push(im); } page(ctx => {
    paper(ctx, W, H, 75); let yy = chapter(ctx, W, roman[++ch], petsY.length > 1 ? 'Os patudos' : `O ano ${spOf(petsY[0].a)[0] === 'gata' ? 'da' : 'do'} ${petsY[0].a.name}`);
    petsY.slice(0, 3).forEach(o => { const C = o.C, n = k => C.filter(c => c.k === k).length, ps = C.filter(c => c.k === 'peso' && +c.kg).sort((a, b) => a.d.localeCompare(b.d)); const bits = [n('foto') && `${n('foto')} momento${n('foto') > 1 ? 's' : ''} fofo${n('foto') > 1 ? 's' : ''}`, n('vet') && `${n('vet')} ida${n('vet') > 1 ? 's' : ''} ao veterinário`, n('vac') && `vacinas em dia`, n('banho') && `${n('banho')} banho${n('banho') > 1 ? 's' : ''}`, ps.length > 1 && `de ${ps[0].kg} para ${ps[ps.length - 1].kg} kg`].filter(Boolean);
      ctx.fillStyle = INK; ctx.font = '700 40px Cinzel'; ctx.fillText(`${spOf(o.a)[1]}  ${o.a.name}`, 140, yy); yy = para(ctx, bits.join(' · ') || 'Sempre ao teu lado.', 140, yy + 50, W - 280, 34) + 30; });
    if (pics.length) { const n = Math.min(3, pics.length), pw = 250, gap = 40, x0 = W / 2 - (n * pw + (n - 1) * gap) / 2; pics.slice(0, n).forEach((im, j) => { const x = x0 + j * (pw + gap), h = pw; ctx.save(); ctx.translate(x + pw / 2, yy + 160); ctx.rotate((j - 1) * .06); ctx.shadowColor = '#0004'; ctx.shadowBlur = 18; ctx.fillStyle = '#fffdf8'; ctx.fillRect(-pw / 2 - 14, -h / 2 - 14, pw + 28, h + 60); ctx.shadowColor = 'transparent'; const s = Math.min(im.width, im.height); ctx.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, -pw / 2, -h / 2, pw, h); ctx.restore(); }); yy += 380; }
    try { ornament(ctx, W, H, yy, '🐾'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'patudos'); }
  // 8. Diário
  if (D.notes.length) page(ctx => {
    paper(ctx, W, H, 8); let yy = chapter(ctx, W, roman[++ch], 'O teu diário');
    const mm = MOODS.reduce((b, m) => Math.abs(m[0] - D.avgM) < Math.abs(b[0] - D.avgM) ? m : b, MOODS[0]);
    yy = bigStats(ctx, W, yy + 40, [[D.notes.length, D.notes.length > 1 ? 'notas' : 'nota'], [mm[2], 'humor médio']]) + 20;
    if (D.bestM) yy = para(ctx, `O mês mais feliz foi ${MESES[D.bestM[0] - 1]}.`, 140, yy, W - 280, 36) + 10;
    if (D.topTag) yy = para(ctx, `O tema de que mais escreveste: ${D.topTag[0].toLowerCase()}.`, 140, yy, W - 280, 36) + 10;
    if (A.diary && D.happy.length) { yy += 30; ctx.fillStyle = GOLD; ctx.font = '700 24px Cinzel'; ctx.textAlign = 'center'; ctx.fillText('DIAS RADIANTES', W / 2, yy); ctx.textAlign = 'left'; yy += 50; D.happy.forEach(x => { if (yy > H - 220) return; ctx.font = '600 22px Manrope'; ctx.fillStyle = '#6b5a44'; ctx.fillText(niceDate(x.d).replace(/^[^,]+, /, '').toUpperCase(), 140, yy); yy = para(ctx, `«${x.txt}»`, 140, yy + 40, W - 280, 32, INK, 'left', 3) + 24; }); }
    try { ornament(ctx, W, H, Math.max(yy, 0), '🌙'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'diario');
  // 8b. Momentos do ano
  const momY = MOM.all().filter(x => (x.d || '').startsWith(String(y))).sort((a, b) => (a.d + (a.t || '')).localeCompare(b.d + (b.t || '')));
  if (momY.length) page(ctx => { paper(ctx, W, H, 85); let yy = chapter(ctx, W, roman[++ch], 'Momentos que ficam');
    momY.slice(0, 9).forEach(x => { if (yy > H - 200) return; const w = whoOf(x.who); ctx.font = '700 22px Cinzel'; ctx.fillStyle = GOLD; ctx.fillText(`${niceDate(x.d).replace(/^[^,]+, /, '').toUpperCase()}${x.t ? ' · ' + x.t : ''}`, 140, yy); yy = para(ctx, `${x.title}${w.id !== 'me' ? ' (' + w.n + ')' : ''}`, 140, yy + 42, W - 280, 34, INK, 'left', 2) + 26; });
    if (momY.length > 9) para(ctx, `…e mais ${momY.length - 9} momentos no livro de momentos.`, 140, yy, W - 280, 28, '#6b5a44');
    pageNum(ctx, W, H, ++pn); }, 'momentos');
  // 9. Nas tuas palavras
  const QA = [['best', 'O melhor momento'], ['proud', 'A conquista'], ['learn', 'O que aprendeste'], ['song', 'A banda sonora'], ['leave', 'O que fica em ' + y]].filter(([k]) => A[k]);
  if (QA.length) page(ctx => {
    paper(ctx, W, H, 9); let yy = chapter(ctx, W, roman[++ch], 'Nas tuas palavras');
    const room = (H - 170 - yy) / QA.length;
    QA.forEach(([k, l]) => { ctx.fillStyle = GOLD; ctx.font = '700 24px Cinzel'; ctx.fillText(l.toUpperCase(), 140, yy); const sz = room > 190 ? 40 : 34; yy = para(ctx, (k === 'song' ? '♪ ' : '') + A[k], 140, yy + sz + 14, W - 280, sz, INK, 'left', Math.max(1, Math.floor((room - 60) / (sz * 1.3)))) + 34; });
    try { ornament(ctx, W, H, Math.max(yy, 0), '✍️'); } catch (e) { } pageNum(ctx, W, H, ++pn);
  }, 'palavras');
  // 10. Carta para o próximo ano
  page(ctx => {
    paper(ctx, W, H, 10); let yy = chapter(ctx, W, '', `Carta para ${y + 1}`, 150);
    const jn = SIGNS[D.sN.jupiter.sign], hj = D.si != null ? ((D.sN.jupiter.sign - D.si + 12) % 12) + 1 : null, py2 = D.p.d ? personalYear(D.p.d, y + 1) : null, T2 = tarotFor((D.p.name || '') + (y + 1) + 'ano');
    const parts = [`Querido(a) ${first || 'eu'} de ${y + 1},`];
    let mid = A.word ? `Em ${y} a tua palavra foi «${A.word}». ` : `Fechaste ${y} com ${D.read.length + D.trips.length + D.notes.length ? 'muitas histórias para contar' : 'tudo por escrever'}. `;
    if (D.dreamsY.length) mid += `Realizaste o sonho de ir a ${D.dreamsY.map(x => x.title).join(' e ')}${(D.dreamsY[0].ts0 || D.dreamsY[0].ts) ? ', que estava na tua lista desde ' + new Date(D.dreamsY[0].ts0 || D.dreamsY[0].ts).getFullYear() : ''}. `;
    if (A.proud) mid += `Conseguiste ${lowFirst(A.proud)}, e isso ninguém te tira. `;
    if (A.learn) mid += `Aprendeste ${/^que\b/i.test(A.learn) ? '' : 'que '}${lowFirst(A.learn)}. `;
    if (A.leave) mid += `E deixaste para trás ${lowFirst(A.leave)}.`;
    parts.push(mid.trim());
    parts.push(`O céu de ${y + 1} traz Júpiter em ${jn.n}${hj ? `, a abrir portas n${AREA[hj]}` : ''}. ${py2 ? `Vais viver o teu ano pessoal ${py2}: ${YEAR_MEAN[py2]}. ` : ''}É o ano chinês do ${D.cnNext.n} ${D.cnNext.e}, e a carta que te acompanha é ${T2[0]}: ${T2[2].replace(/viagem|viajar/g, 'caminho')}.`);
    if (A.wish) parts.push(`O teu desejo: ${lowFirst(A.wish)}. Que se cumpra. ✨`.replace(' ✨', ''));
    parts.push(`Com carinho,\n${first || 'eu'}, em ${y}`);
    const avail = H - 160 - yy; let size = 36, L; do { ctx.font = `500 ${size}px "Cormorant Garamond"`; L = parts.reduce((n, p) => n + linesOf(ctx, p, W - 280).length + 1, 0); size -= 2; } while (L * (size + 2) * 1.3 > avail && size > 24); size += 2;
    parts.forEach((p, i) => { const isSign = i === parts.length - 1; yy = para(ctx, p, 140, yy, W - 280, size, INK, isSign ? 'left' : 'left') + size * .7; });
    pageNum(ctx, W, H, ++pn);
  }, 'carta');
  // 11. Contracapa
  page(ctx => {
    bg(ctx, W, H, 'fim' + y, EL_COL[el]); ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 40px Cinzel'; ctx.fillText('FIM DE ' + y, W / 2, 480);
    ctx.fillStyle = '#fff'; ctx.font = 'italic 600 64px "Cormorant Garamond"'; ctx.fillText('O resto ainda', W / 2, 600); ctx.fillText('está por escrever.', W / 2, 680);
    ctx.font = `90px ${SYMF}`; ctx.fillStyle = '#f2c76e'; ctx.fillText('✦', W / 2, 840);
    ctx.font = '500 28px Manrope'; ctx.fillStyle = '#d8d0f5'; ctx.fillText('Feito com a app Céu de Hoje', W / 2, H - 170); ctx.fillText(APP_URL.replace(/^https?:\/\//, ''), W / 2, H - 125);
  }, 'contracapa');
  return pages;
}
// --- PDF simples (imagens JPEG) ---
async function pagesToPdf(pages, PW = 432, PH = 540) {
  const enc = new TextEncoder(), parts = [], off = []; let len = 0;
  const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (id, body) => { off[id] = len; push(`${id} 0 obj\n${body}\nendobj\n`); };
  const n = pages.length, kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  push('%PDF-1.4\n'); push(new Uint8Array([37, 226, 227, 207, 211, 10]));
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  for (let i = 0; i < n; i++) {
    const c = pages[i].c, pid = 3 + i * 3, cid = pid + 1, iid = pid + 2, bytes = new Uint8Array(await (await blobOf(c, .9)).arrayBuffer());
    obj(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${iid} 0 R >> >> /Contents ${cid} 0 R >>`);
    const cs = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`; obj(cid, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    off[iid] = len; push(`${iid} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`); push(bytes); push('\nendstream\nendobj\n');
  }
  const max = 2 + n * 3, xo = len; let x = `xref\n0 ${max + 1}\n0000000000 65535 f \n`; for (let id = 1; id <= max; id++) x += String(off[id]).padStart(10, '0') + ' 00000 n \n';
  push(x + `trailer\n<< /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xo}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}
// --- diálogo ---
let ANO_PAGES = null;
function openAno(step) {
  const y = anoYear(), A = anoGet(y), dlg = $('#anoDlg'), body = $('#anoBody'), foot = $('#anoFoot');
  if (step == null) step = A.done ? 'book' : 0;
  if (step === 'book') { showAnoBook(y); if (!dlg.open) dlg.showModal(); return; }
  if (step === 0) {
    $('#anoTitle').textContent = `📖 O meu livro de ${y}`;
    const D = yearData(y), has = [D.read.length && `📚 ${D.read.length} livros`, D.trips.length && `✈️ ${D.trips.length} viagens`, D.shows.length && `🎬 ${D.shows.length} séries e filmes`, D.notes.length && `📔 ${D.notes.length} notas`, (D.ppl.length + D.pets.length) && `🎂 ${D.ppl.length + D.pets.length} aniversários`].filter(Boolean);
    body.innerHTML = `<p>Vamos escrever o teu livro de ${y}. São <b>${ANO_Q.length} perguntas rápidas</b> (podes saltar qualquer uma) e eu junto o que já guardaste na app:</p>${has.length ? `<p class="chips">${has.map(h => `<span class="chip" style="--c:var(--gold)">${h}</span>`).join(' ')}</p>` : '<p class="note">Ainda não tens livros, viagens ou notas deste ano, mas o livro faz-se na mesma com as tuas respostas e o teu céu.</p>'}${!(P.get() || {}).d ? '<p class="note">Dica: põe a tua data de nascimento em «O meu espaço» para o livro ter o teu signo e o teu ano pessoal.</p>' : ''}<label class="chk"><input type="checkbox" id="anoDiary"${A.diary ? ' checked' : ''}> Incluir alguns dias radiantes do diário (só os teus dias 😄)</label><p class="note">Fica tudo só neste telemóvel. Só sai daqui se partilhares.</p>`;
    foot.innerHTML = `<button class="btn main" id="anoNext">Começar ✨</button><button class="btn" data-close>Fechar</button>`;
    $('#anoNext').onclick = () => { A.diary = $('#anoDiary').checked; anoSet(y, A); openAno(1); };
  } else {
    const [k, q, ph] = ANO_Q[step - 1];
    $('#anoTitle').textContent = `Pergunta ${step} de ${ANO_Q.length}`;
    body.innerHTML = `<div class="anoprog"><i style="width:${step / ANO_Q.length * 100}%"></i></div><h3 class="anoq">${q}</h3>${ph === 'photo' ? `<div class="anophoto">${A.photo ? `<img src="${A.photo}" alt="">` : '<span>🖼️</span>'}</div><div class="drow"><label class="btn main" style="text-align:center;cursor:pointer">${A.photo ? 'Trocar foto' : 'Escolher foto'}<input type="file" id="anoPh" accept="image/*" hidden></label>${A.photo ? '<button class="btn" id="anoPhDel">Tirar</button>' : ''}</div><p class="note">Fica na primeira página do livro, como uma polaroid.</p>` : ph === 'pick' ? `<div class="anopick">${ANO_MOODS.map((m, i) => `<button data-m="${i}"${A.mood === i ? ' class="on"' : ''}><span>${m[0]}</span>${m[1]}</button>`).join('')}</div>` : `<textarea id="anoA" rows="3" maxlength="${k === 'word' ? 24 : 220}" placeholder="${ph}">${esc(A[k] || '')}</textarea>`}`;
    foot.innerHTML = `<button class="btn" id="anoBack">←</button><button class="btn main" id="anoNext">${step === ANO_Q.length ? '📖 Criar o livro' : 'Seguinte →'}</button><button class="btn" id="anoSkip">Saltar</button>`;
    if (ph === 'pick') body.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { A.mood = +b.dataset.m; anoSet(y, A); openAno(step + 1); });
    if ($('#anoPh')) $('#anoPh').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const u = URL.createObjectURL(f), im = await loadImg(u); URL.revokeObjectURL(u); if (!im) throw 0; const k = Math.min(1, 760 / Math.max(im.width, im.height)), c2 = document.createElement('canvas'); c2.width = Math.round(im.width * k); c2.height = Math.round(im.height * k); c2.getContext('2d').drawImage(im, 0, 0, c2.width, c2.height); A.photo = c2.toDataURL('image/jpeg', .8); anoSet(y, A); openAno(step); } catch (er) { toast('Não consegui usar essa foto'); } };
    if ($('#anoPhDel')) $('#anoPhDel').onclick = () => { delete A.photo; anoSet(y, A); openAno(step); };
    const save = () => { if ($('#anoA')) { A[k] = $('#anoA').value.trim(); anoSet(y, A); } };
    $('#anoBack').onclick = () => { save(); openAno(step - 1); };
    $('#anoSkip').onclick = () => { if (step === ANO_Q.length) { A.done = 1; anoSet(y, A); openAno('book'); } else openAno(step + 1); };
    $('#anoNext').onclick = () => { save(); if (step === ANO_Q.length) { A.done = 1; anoSet(y, A); openAno('book'); render(); } else openAno(step + 1); };
    setTimeout(() => $('#anoA') && $('#anoA').focus(), 50);
  }
  foot.querySelectorAll('[data-close]').forEach(b => b.onclick = () => dlg.close());
  if (!dlg.open) dlg.showModal();
}
async function showAnoBook(y) {
  $('#anoTitle').textContent = `📖 O meu livro de ${y}`; $('#anoBody').innerHTML = '<p class="hint">A escrever o teu livro… ✍️</p>'; $('#anoFoot').innerHTML = '';
  ANO_PAGES = await buildYearBook(y);
  $('#anoBody').innerHTML = `<div class="bookv">${ANO_PAGES.map((p, i) => `<img src="${stampOnce(p.c).toDataURL('image/jpeg', .85)}" alt="Página ${i + 1}" data-i="${i}">`).join('')}</div><p class="hint">Desliza para folhear · ${ANO_PAGES.length} páginas</p><div class="anoact"><button class="btn main" id="anoShare">📤 Partilhar páginas</button><button class="btn" id="anoPdf">📄 PDF</button><button class="btn" id="anoVid">🎬 Vídeo</button></div><button class="btn ghost" id="anoSt" style="width:100%;margin-top:6px">📱 Versão stories (9:16) para Instagram e Facebook</button>${anoYears().length > 1 ? `<button class="btn ghost" id="anoAll" style="width:100%;margin-top:6px">📚 Todos os anos num só livro (${anoYears()[0]}–${anoYears()[anoYears().length - 1]})</button>` : ''}`;
  $('#anoFoot').innerHTML = `<button class="btn" id="anoEdit">✏️ Respostas</button><button class="btn" data-close>Fechar</button>`;
  $('#anoFoot').querySelector('[data-close]').onclick = () => $('#anoDlg').close();
  $('#anoEdit').onclick = () => openAno(1);
  const cap = `O meu ${y}, em livro 📖✨\n\nFeito com a app Céu de Hoje: ${APP_URL}`;
  $('#anoShare').onclick = () => shareCanvases(ANO_PAGES, cap);
  $('#anoPdf').onclick = async () => { const b = $('#anoPdf'); b.disabled = true; b.textContent = 'A criar…'; try { const pdf = await pagesToPdf(ANO_PAGES), f = new File([pdf], `o-meu-livro-${y}.pdf`, { type: 'application/pdf' }); let ok = false; try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); ok = true; } } catch (e) { if (e && e.name === 'AbortError') ok = true; } if (!ok) await saveBlob(f, f.name); } finally { b.disabled = false; b.textContent = '📄 PDF'; } };
  if ($('#anoAll')) $('#anoAll').onclick = async () => { const b = $('#anoAll'); b.disabled = true; try { const all = []; const Y = anoYears(); for (const yy of Y) { b.textContent = `A escrever ${yy}…`; const pg = await buildYearBook(yy); all.push(...(yy === Y[Y.length - 1] ? pg : pg.slice(0, -1))); } b.textContent = 'A juntar…'; const pdf = await pagesToPdf(all), f = new File([pdf], `os-meus-livros-${Y[0]}-${Y[Y.length - 1]}.pdf`, { type: 'application/pdf' }); let ok = false; try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); ok = true; } } catch (e) { if (e && e.name === 'AbortError') ok = true; } if (!ok) await saveBlob(f, f.name); } finally { b.disabled = false; b.textContent = '📚 Todos os anos num só livro'; } };
  $('#anoSt').onclick = async () => { const b = $('#anoSt'); b.disabled = true; b.textContent = 'A criar os stories…'; try { const st = await buildYearStories(y); $('#anoBody').querySelector('.bookv').innerHTML = st.map(p => `<img class="stv" src="${p.c.toDataURL('image/jpeg', .82)}" alt="">`).join(''); b.textContent = '📤 Partilhar os stories'; b.disabled = false; b.onclick = () => shareCanvases(st, cap); const v = $('#anoVid'); v.onclick = async () => { const per = 2.6, dur = st.length * per; const r = await recordAnim((ctx, t) => { const i = Math.min(st.length - 1, Math.floor(t / per)), f = t - i * per; ctx.globalAlpha = 1; ctx.drawImage(st[i].c, 0, 0); if (f > per - .4 && i < st.length - 1) { ctx.globalAlpha = (f - (per - .4)) / .4; ctx.drawImage(st[i + 1].c, 0, 0); ctx.globalAlpha = 1; } }, dur, 1080, 1920, v, '🎬'); if (!r) return; const f = new File([r.blob], `o-meu-${y}-story.${r.ext}`, { type: r.blob.type }); copySync(cap); try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } await saveBlob(f, f.name); }; } catch (e) { b.disabled = false; b.textContent = '📱 Versão stories'; toast('Não consegui criar os stories'); } };
  $('#anoVid').onclick = async () => {
    const per = 3.2, dur = ANO_PAGES.length * per;
    const draw = (ctx, t) => { const i = Math.min(ANO_PAGES.length - 1, Math.floor(t / per)), f = t - i * per; ctx.globalAlpha = 1; ctx.drawImage(ANO_PAGES[i].c, 0, 0); if (f > per - .5 && i < ANO_PAGES.length - 1) { ctx.globalAlpha = (f - (per - .5)) / .5; ctx.drawImage(ANO_PAGES[i + 1].c, 0, 0); ctx.globalAlpha = 1; } };
    const r = await recordAnim(draw, dur, 1080, 1350, $('#anoVid'), '🎬'); if (!r) return;
    const f = new File([r.blob], `o-meu-${y}.${r.ext}`, { type: r.blob.type }); copySync(cap);
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    await saveBlob(f, f.name);
  };
}

// ---------- Registo de cartões de parabéns ----------
function logBday(o) { try { const L = JSON.parse(store.get('ceu_bdlog') || '[]'), d = todayStr(); if (!o || !o.name || L.some(b => b.n === o.name && b.d === d)) return; L.push({ n: o.name, rel: o.rel || '', d }); store.set('ceu_bdlog', JSON.stringify(L.slice(-400))); } catch (e) { } }

// ---------- Ligações na interface ----------
function bindMore() {
  if ($('#bkNow')) { $('#bkNow').onclick = doBackup; $('#bkLater').onclick = () => { store.set('ceu_bksnooze', dayStr(noonJd(todayStr()) + 7)); render(); }; }
  if ($('#anoGo')) $('#anoGo').onclick = () => openAno();
}

// ---------- Patudos: caderneta, cuidados, tu e o patudo ----------
const CARE_T = { vac: ['💉', 'Vacina', 365], des: ['🪱', 'Desparasitação', 90], vet: ['🩺', 'Veterinário', 0], peso: ['⚖️', 'Peso', 0], banho: ['🛁', 'Banho / tosquia', 0], foto: ['📸', 'Momento fofo', 0] };
const petCare = a => (a && a.care) || [];
function careNext(a, k) { const L = petCare(a).filter(c => c.k === k).sort((x, y) => x.d.localeCompare(y.d)), l = L[L.length - 1]; if (!l) return null; return l.next || dayStr(noonJd(l.d) + CARE_T[k][2]); }
function careDue(days = 3) {
  const out = [], t = noonJd(todayStr());
  P.list('ceu_pets').forEach((a, i) => ['vac', 'des'].forEach(k => { const n = careNext(a, k); if (!n) return; const dd = Math.round(noonJd(n) - t); if (dd <= days && dd >= -60) out.push({ i, a, k, n, dd }); }));
  return out.sort((x, y) => x.dd - y.dd);
}
const dueTxt = dd => dd === 0 ? 'é hoje' : dd === 1 ? 'é amanhã' : dd > 1 ? `daqui a ${dd} dias` : `está atrasada ${-dd} dia${dd < -1 ? 's' : ''}`;
function careBox(a, i) {
  const C = petCare(a).slice().sort((x, y) => y.d.localeCompare(x.d)), due = ['vac', 'des'].map(k => [k, careNext(a, k)]).filter(e => e[1]);
  const pesos = petCare(a).filter(c => c.k === 'peso' && +c.kg).sort((x, y) => x.d.localeCompare(y.d)), fotos = C.filter(c => c.k === 'foto' && c.photo).slice(0, 6);
  let spark = '';
  if (pesos.length >= 2) { const v = pesos.map(p => +p.kg), mn = Math.min(...v), mx = Math.max(...v), rg = mx - mn || 1, pts = v.map((k, j) => `${(j / (v.length - 1) * 280 + 10).toFixed(1)},${(70 - (k - mn) / rg * 50).toFixed(1)}`).join(' '); spark = `<div class="wspark"><svg viewBox="0 0 300 80"><polyline points="${pts}" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${pts.split(' ').map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="4" fill="var(--gold)"/>`).join('')}</svg><small>⚖️ ${v[0]} kg → <b>${v[v.length - 1]} kg</b></small></div>`; }
  return `<div class="box care"><h3>📋 Caderneta de ${esc(a.name)}</h3>
    ${due.map(([k, n]) => { const dd = Math.round(noonJd(n) - noonJd(todayStr())); return `<p class="due${dd <= 7 ? ' soon' : ''}">${CARE_T[k][0]} Próxima ${CARE_T[k][1].toLowerCase()}: <b>${niceDate(n).replace(/-feira/, '')}</b> (${dueTxt(dd)})</p>`; }).join('')}
    <div class="carebtns">${Object.entries(CARE_T).map(([k, v]) => `<button data-ck="${k}"><span>${v[0]}</span>${v[1].split(' ')[0]}</button>`).join('')}</div><div id="careForm"></div>
    ${spark}${fotos.length ? `<div class="cfotos">${fotos.map(f => `<img src="${f.photo}" alt="">`).join('')}</div>` : ''}
    ${C.length ? `<div class="ctl">${C.slice(0, 8).map(c => `<div data-cid="${c.id}"><span>${CARE_T[c.k][0]}</span><div><b>${CARE_T[c.k][1]}${c.kg ? ' · ' + c.kg + ' kg' : ''}</b><small>${niceDate(c.d).replace(/-feira/, '')}${c.note ? ' · ' + esc(c.note) : ''}</small></div><button class="ib cdel">✕</button></div>`).join('')}</div>` : '<p class="note">Regista vacinas, desparasitações, idas ao veterinário, o peso e os momentos fofos. Avisamos-te quando chegar a próxima vacina.</p>'}</div>`;
}
function bindCare(i) {
  const upd = fn => { const l = P.list('ceu_pets'); fn(l[i]); P.setList('ceu_pets', l); openPet(i, false, false); };
  document.querySelectorAll('[data-ck]').forEach(b => b.onclick = () => {
    const k = b.dataset.ck, def = CARE_T[k][2] ? dayStr(noonJd(todayStr()) + CARE_T[k][2]) : '';
    $('#careForm').innerHTML = `<div class="form cf"><h4>${CARE_T[k][0]} ${CARE_T[k][1]}</h4><div class="two"><label>Data<input type="date" id="cD" value="${todayStr()}"></label>${k === 'peso' ? '<label>Peso (kg)<input type="number" id="cKg" step="0.1" min="0" inputmode="decimal"></label>' : def ? `<label>Próxima<input type="date" id="cN" value="${def}"></label>` : '<span></span>'}</div>${k === 'foto' ? '<label class="btn ghost" style="text-align:center;cursor:pointer">📷 Escolher foto<input type="file" id="cPh" accept="image/*" hidden></label><div id="cPhP"></div>' : ''}<label>Nota<input type="text" id="cNote" maxlength="80" placeholder="${k === 'vac' ? 'Ex.: Raiva, Polivalente' : k === 'vet' ? 'Ex.: Consulta de rotina' : k === 'foto' ? 'Ex.: Primeira vez na praia' : 'Opcional'}"></label><button class="btn main" id="cSave">Guardar</button></div>`;
    let photo = '';
    if ($('#cPh')) $('#cPh').onchange = async e => { const f = e.target.files[0]; if (!f) return; const u = URL.createObjectURL(f), im = await loadImg(u); URL.revokeObjectURL(u); if (!im) return; const s = Math.min(1, 480 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); photo = c.toDataURL('image/jpeg', .72); $('#cPhP').innerHTML = `<img src="${photo}" alt="" style="width:100%;border-radius:10px;margin:6px 0">`; };
    $('#cSave').onclick = () => { const e = { id: 'c' + Date.now().toString(36), k, d: $('#cD').value || todayStr(), note: $('#cNote').value.trim() }; if ($('#cN') && $('#cN').value) e.next = $('#cN').value; if ($('#cKg')) { if (!+$('#cKg').value) { toast('Escreve o peso'); return; } e.kg = +(+$('#cKg').value).toFixed(1); } if (k === 'foto') { if (!photo) { toast('Escolhe a foto'); return; } e.photo = photo; } upd(a => a.care = petCare(a).concat(e)); toast('Registado 🐾'); };
    $('#careForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.querySelectorAll('.ctl [data-cid]').forEach(el => el.querySelector('.cdel').onclick = () => { if (confirmBox('Apagar este registo?')) upd(a => a.care = petCare(a).filter(c => c.id !== el.dataset.cid)); });
}
// tu e o patudo
const EL_FRIEND = { fogo: 'ar', ar: 'fogo', terra: 'agua', agua: 'terra' };
function ownerPet(a) {
  const p = P.get(); if (!p || !p.d) return null;
  const o = sunSignOf(p.d), s = sunSignAt(a.d, a.t), O = SIGNS[o], S = SIGNS[s];
  const k = o === s ? 'same' : O.el === S.el ? 'el' : EL_FRIEND[O.el] === S.el ? 'friend' : 'diff';
  const kd = Math.min((sunSignOf(p.d) - s + 12) % 12, (s - sunSignOf(p.d) + 12) % 12), pct = Math.min(99, PAIR_BASE[kd] + 6);
  const txt = { same: `Mesmo signo! ${a.name} é praticamente o teu reflexo de quatro patas: sentem as coisas da mesma maneira.`, el: `Os dois são de ${O.el === 'agua' ? 'água' : O.el}: entendem-se sem palavras e têm o mesmo ritmo.`, friend: `${O.n} e ${S.n} completam-se: ${O.el === 'fogo' || O.el === 'ar' ? 'um dá a faísca, o outro o entusiasmo' : 'um dá estabilidade, o outro carinho'}. Dupla de sucesso.`, diff: `Feitios diferentes, e é aí que está a graça: ${a.name} ensina-te ${['paciência', 'a viver o momento', 'a brincar mais', 'a abrandar'][(seeded(a.name)() * 4) | 0]}, tu dás-lhe segurança.` }[k];
  return { o, s, O, S, pct: Math.min(100, pct), txt, me: (p.name || 'Tu').split(' ')[0] };
}
function ownerPetBox(a) { const r = ownerPet(a); if (!r) return ''; return `<div class="box opet"><h3>💞 Tu e ${esc(a.name)}</h3><div class="opr"><span>${G(r.O.g)}</span><b>${r.pct}%</b><span>${G(r.S.g)}</span></div><p>${esc(r.txt)}</p><button class="btn" id="opShare" style="width:100%">📤 Partilhar</button></div>`; }
async function drawOwnerPet(a) {
  await fontsReady(); const r = ownerPet(a), [c, ctx, W, H] = newCanvas(), sp = spOf(a);
  bg(ctx, W, H, 'op' + a.name, EL_COL[r.S.el]);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText('TU E O TEU PATUDO', W / 2, 120);
  ctx.font = `150px ${SYMF}`; ctx.fillStyle = EL_COL[r.O.el][0]; ctx.fillText(r.O.g + VS, W / 2 - 260, 420); ctx.fillStyle = EL_COL[r.S.el][0]; ctx.fillText(r.S.g + VS, W / 2 + 260, 420);
  ctx.font = `110px ${EMOJI_F}`; ctx.fillText('💞', W / 2, 400);
  ctx.fillStyle = '#fff'; ctx.font = '700 46px Cinzel'; ctx.fillText(r.me.toUpperCase(), W / 2 - 260, 520); ctx.fillText(a.name.toUpperCase(), W / 2 + 260, 520);
  ctx.font = 'italic 600 34px "Cormorant Garamond"'; ctx.fillStyle = '#d8d0f5'; ctx.fillText(r.O.n, W / 2 - 260, 570); ctx.fillText(`${sp[1]} ${r.S.n}`, W / 2 + 260, 570);
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 190px Cinzel'; ctx.fillText(r.pct + '%', W / 2, 820);
  ctx.font = 'italic 600 44px "Cormorant Garamond"'; ctx.fillStyle = '#fff'; wrap(ctx, r.txt, W / 2, 940, W - 200, 58, 5, 'center');
  brandFoot(ctx, W, H); return c;
}
function bindOwnerPet(a) { if ($('#opShare')) $('#opShare').onclick = async () => { const r = ownerPet(a); toast('A preparar…'); await shareCanvases([{ name: 'tu-e-' + a.name.toLowerCase(), c: await drawOwnerPet(a) }], `${r.me} ${r.O.g} 💞 ${a.name} ${r.S.g}: ${r.pct}% de sintonia!\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); }; }

// ---------- Aviso do livro do ano (1 dez a 31 jan) ----------
function yearNudge() { const t = todayStr(), m = +t.slice(5, 7), y = anoYear(); if (!(m === 12 || m === 1)) return false; if (anoGet(y).done) return false; return !store.get('ceu_ynudge_' + y); }

// ---------- Stories do ano (9:16) ----------
async function buildYearStories(y) {
  await fontsReady();
  const D = yearData(y), A = anoGet(y), W = 1080, H = 1920, out = [], first = (D.p.name || '').split(' ')[0] || 'Eu';
  const PAL = [['#ff5f6d', '#5b247a'], ['#1fa2ff', '#12285a'], ['#f7971e', '#6a1b4d'], ['#00b09b', '#0b3d4a'], ['#ee0979', '#2b1055'], ['#8e2de2', '#1a0b3a'], ['#f2c76e', '#3a2208']];
  const slide = (k, fn) => { const [c, ctx] = newCanvas(W, H); ctx.__noTheme = true; const p = PAL[k % PAL.length], g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, p[0]); g.addColorStop(1, p[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); const r = seeded('s' + k + y); ctx.globalAlpha = .18; for (let i = 0; i < 9; i++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r() * W, r() * H, 60 + r() * 260, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.fillStyle = '#ffffffcc'; ctx.font = '700 30px Cinzel'; ctx.fillText(`O MEU ${y}`, W / 2, 130); fn(ctx); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffffcc'; ctx.font = '700 28px Cinzel'; ctx.fillText((store.get('ceu_brand') || '').trim() || 'CÉU DE HOJE', W / 2, H - 90); out.push({ name: `story-${String(out.length + 1).padStart(2, '0')}`, c }); };
  const big = (ctx, n, lbl, y0 = 820) => { ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; fitFont(ctx, String(n), W - 160, 330, 120, s => `700 ${s}px Cinzel`); ctx.fillText(String(n), W / 2, y0); ctx.font = '800 54px Manrope'; ctx.fillText(lbl, W / 2, y0 + 110); };
  const line = (ctx, t, y0, sz = 46) => { ctx.fillStyle = '#fff'; ctx.font = `italic 600 ${sz}px "Cormorant Garamond"`; wrap(ctx, t, W / 2, y0, W - 180, sz * 1.25, 4, 'center'); };
  let k = 0;
  slide(k++, ctx => { ctx.fillStyle = '#fff'; ctx.font = '800 60px Manrope'; ctx.fillText(`${first},`, W / 2, 620); ctx.fillText('este foi o teu ano.', W / 2, 700); ctx.font = '700 260px Cinzel'; ctx.fillText(String(y), W / 2, 1060); if (A.word) { ctx.font = '700 36px Cinzel'; ctx.fillText('NUMA PALAVRA', W / 2, 1240); ctx.font = 'italic 600 110px "Cormorant Garamond"'; ctx.fillText(A.word, W / 2, 1370); } });
  if (D.read.length) slide(k++, ctx => { ctx.font = `150px ${EMOJI_F}`; ctx.fillText('📚', W / 2, 470); big(ctx, D.read.length, D.read.length > 1 ? 'livros lidos' : 'livro lido'); if (D.pages) line(ctx, `${D.pages.toLocaleString('pt-PT')} páginas viradas`, 1090, 56); const lvl = READER.filter(r => D.read.length >= r[0]).pop(); line(ctx, lvl[1], 1220, 52); if (D.favB) line(ctx, `O favorito: «${D.favB.title}»`, 1400, 46); });
  if (D.trips.length) slide(k++, ctx => { ctx.font = `${D.countries.length > 4 ? 110 : 160}px ${EMOJI_F}`; const fl = D.countries.slice(0, 8).map(c => flagOf(c[1])); [fl.slice(0, 4), fl.slice(4)].forEach((row, j) => row.length && ctx.fillText(row.join(' '), W / 2, 470 + j * 170)); big(ctx, D.countries.length || D.trips.length, D.countries.length ? (D.countries.length > 1 ? 'países' : 'país') : 'viagens', 980); line(ctx, `${D.trips.length} ${D.trips.length > 1 ? 'viagens' : 'viagem'}${D.favT ? `. A melhor: ${D.favT.title}` : ''}`, 1250, 50); if (D.dreamsY.length) line(ctx, `✨ Sonho realizado: ${D.dreamsY.map(x => x.title).join(', ')}`, 1420, 50); });
  if (D.shows.length) slide(k++, ctx => { ctx.font = `150px ${EMOJI_F}`; ctx.fillText('🍿', W / 2, 470); big(ctx, D.shows.length, 'séries e filmes'); if (D.favS) line(ctx, `O que mais gostaste: «${D.favS.title}»`, 1130, 50); });
  const petsY = P.list('ceu_pets').map(a => ({ a, n: petCare(a).filter(c => (c.d || '').startsWith(String(y))).length })).filter(o => o.n);
  if (D.cards.length || petsY.length) slide(k++, ctx => { ctx.font = `150px ${EMOJI_F}`; ctx.fillText(petsY.length && !D.cards.length ? '🐾' : '🎂', W / 2, 470); if (D.cards.length) { big(ctx, D.cards.length, D.cards.length > 1 ? 'cartões de parabéns' : 'cartão de parabéns'); line(ctx, `Para ${D.cards.slice(0, 4).join(', ')}${D.cards.length > 4 ? '…' : ''}`, 1130, 48); } if (petsY.length) line(ctx, `🐾 ${petsY.map(o => o.a.name).join(' e ')}: ${petsY.reduce((s, o) => s + o.n, 0)} momentos na caderneta`, D.cards.length ? 1330 : 900, 50); });
  if (D.notes.length) slide(k++, ctx => { const mm = MOODS.reduce((b, m) => Math.abs(m[0] - D.avgM) < Math.abs(b[0] - D.avgM) ? m : b, MOODS[0]); ctx.font = `220px ${EMOJI_F}`; ctx.fillText(mm[1], W / 2, 560); big(ctx, D.notes.length, D.notes.length > 1 ? 'páginas de diário' : 'página de diário', 900); if (D.bestM) line(ctx, `O mês mais feliz: ${MESES[D.bestM[0] - 1]}`, 1170, 54); });
  slide(k++, ctx => { const T2 = tarotFor((D.p.name || '') + (y + 1) + 'ano'); ctx.fillStyle = '#fff'; ctx.font = '700 40px Cinzel'; ctx.fillText(`PARA ${y + 1}`, W / 2, 470); ctx.font = `160px ${EMOJI_F}`; ctx.fillText('🃏', W / 2, 700); ctx.font = 'italic 600 96px "Cormorant Garamond"'; ctx.fillText(T2[0], W / 2, 900); line(ctx, cap1(T2[2].replace(/viagem|viajar/g, 'caminho')) + '.', 1020, 50); if (A.wish) line(ctx, `«${A.wish}»`, 1300, 52); ctx.textAlign = 'center'; ctx.font = '600 34px Manrope'; ctx.fillStyle = '#ffffffdd'; ctx.fillText('Faz o teu em', W / 2, H - 240); ctx.fillText(APP_URL.replace(/^https?:\/\//, ''), W / 2, H - 190); });
  return out;
}

// ---------- Numerologia explicada ----------
const NUM_INFO = {
  1: { w: 'Início', c: ['Vermelho', '#e0413a'], e: 'O 1 é a energia do começo: iniciativa, coragem e vontade própria. É o número de quem abre caminho.', f: 'determinação, independência, liderança', x: 'impaciência e querer fazer tudo sozinho', d: ['Começa aquilo que andas a adiar', 'Toma a decisão que depende só de ti', 'Veste algo que te dê confiança'], n: ['Esperar que os outros decidam por ti', 'Discussões por orgulho'] },
  2: { w: 'Parceria', c: ['Laranja suave', '#f2a65a'], e: 'O 2 é a energia da união: escuta, diplomacia e sensibilidade. Tudo corre melhor a dois.', f: 'empatia, paciência, tato', x: 'indecisão e engolir o que sentes', d: ['Conversa com calma sobre um assunto delicado', 'Faz algo a dois', 'Ouve mais do que falas'], n: ['Forçar decisões rápidas', 'Ficar calado(a) com o que te magoa'] },
  3: { w: 'Alegria', c: ['Amarelo', '#f5c518'], e: 'O 3 é a energia da expressão: criatividade, humor e comunicação. É o número da festa e das ideias.', f: 'criatividade, simpatia, otimismo', x: 'dispersão e falar demais', d: ['Publica, escreve, canta, cria', 'Combina um café com amigos', 'Muda o visual: cabelo ou unhas com cor'], n: ['Prometer o que não consegues cumprir', 'Gastar por impulso'] },
  4: { w: 'Bases', c: ['Verde', '#3f9b5a'], e: 'O 4 é a energia da construção: método, esforço e estabilidade. Passo a passo, chega-se longe.', f: 'organização, responsabilidade, lealdade', x: 'rigidez e excesso de trabalho', d: ['Arruma a casa, os papéis ou a agenda', 'Trata de contas e burocracias', 'Cumpre uma rotina saudável'], n: ['Mudanças radicais sem planear', 'Deixar tudo para amanhã'] },
  5: { w: 'Liberdade', c: ['Azul-turquesa', '#1fb5c9'], e: 'O 5 é a energia do movimento: aventura, curiosidade e mudança. A rotina pesa, o novo chama.', f: 'versatilidade, coragem, carisma', x: 'inquietação e excessos', d: ['Experimenta um sítio ou caminho novo', 'Viaja, nem que seja perto', 'Arrisca uma mudança pequena'], n: ['Compromissos longos à pressa', 'Exageros na comida ou na despesa'] },
  6: { w: 'Amor', c: ['Rosa', '#e86a9a'], e: 'O 6 é a energia do cuidado: família, casa, beleza e responsabilidade afetiva.', f: 'carinho, sentido de justiça, harmonia', x: 'querer agradar a todos e controlar', d: ['Mima quem amas', 'Cuida da casa ou de ti (spa, cabelo, unhas)', 'Liga a alguém da família'], n: ['Carregar os problemas dos outros', 'Ciúmes'] },
  7: { w: 'Sabedoria', c: ['Violeta', '#8a5cd6'], e: 'O 7 é a energia da reflexão: estudo, intuição e espiritualidade. Pede silêncio e profundidade.', f: 'análise, intuição, vida interior', x: 'isolamento e desconfiança', d: ['Lê, estuda, medita', 'Passeia sozinho(a) na natureza', 'Escreve no diário'], n: ['Agendas cheias', 'Decisões importantes sem pensar'] },
  8: { w: 'Colheita', c: ['Dourado', '#c99a2e'], e: 'O 8 é a energia do poder pessoal: dinheiro, carreira e resultados. O esforço é recompensado.', f: 'ambição, gestão, autoridade', x: 'materialismo e teimosia', d: ['Negoceia, pede o aumento, fecha o negócio', 'Revê as finanças', 'Investe em ti'], n: ['Gastos de ostentação', 'Ser duro(a) demais com os outros'] },
  9: { w: 'Coração', c: ['Vermelho-escuro', '#a3233a'], e: 'O 9 é a energia do fim de ciclo: generosidade, perdão e visão alargada. Fecha-se para abrir.', f: 'compaixão, idealismo, generosidade', x: 'nostalgia e cansaço emocional', d: ['Termina o que está pendente', 'Doa, ajuda, perdoa', 'Despede-te do que já não serve'], n: ['Começar grandes projetos hoje', 'Remoer o passado'] },
  11: { w: 'Inspiração', c: ['Prateado', '#a8b3c7'], e: 'O 11 é um número mestre: intuição apurada, inspiração e capacidade de iluminar os outros. Sente tudo com mais intensidade.', f: 'visão, sensibilidade, inspiração', x: 'nervosismo e exigência excessiva', d: ['Confia no primeiro pressentimento', 'Inspira alguém com o teu exemplo', 'Descansa a mente'], n: ['Ignorar sinais do corpo', 'Ambientes muito tensos'] },
  22: { w: 'Construtor', c: ['Azul-real', '#2f5fd0'], e: 'O 22 é um número mestre: o construtor. Junta sonho e prática para criar coisas que ficam.', f: 'visão prática, liderança, persistência', x: 'pressão e perfeccionismo', d: ['Planeia em grande, começa pequeno', 'Trabalha num projeto de longo prazo', 'Junta pessoas à volta de uma ideia'], n: ['Desistir à primeira dificuldade', 'Fazer tudo sozinho(a)'] },
  33: { w: 'Amor maior', c: ['Rosa-dourado', '#e7a58f'], e: 'O 33 é o número mestre do amor incondicional: cuidar, ensinar e curar.', f: 'compaixão, entrega, sabedoria do coração', x: 'esquecer-se de si', d: ['Ajuda alguém sem esperar nada', 'Ensina o que sabes', 'Cuida também de ti'], n: ['Dizer sim a tudo', 'Sacrifícios que te esgotam'] }
};
function numInfoHtml(kind, n, p) {
  const I = NUM_INFO[n] || NUM_INFO[redNum(n)], ttl = kind === 'lp' ? `O teu número da vida: ${n}` : kind === 'py' ? `O teu ano pessoal: ${n}` : `O teu número de hoje: ${n}`;
  const how = kind === 'lp' ? `Soma de todos os algarismos da tua data de nascimento (${p.d.split('-').reverse().join('/')}), reduzida a um só número. Não muda nunca: é a tua essência.` : kind === 'py' ? `Dia e mês do teu nascimento + o ano atual, reduzidos. Muda no dia 1 de janeiro e marca o tema do teu ano.` : `O teu ano pessoal + o dia e o mês de hoje, reduzidos. Muda todos os dias.`;
  const intro = kind === 'lp' ? I.e : kind === 'py' ? `Estás num ${YEAR_MEAN[n] || 'ano especial'}. ${I.e}` : `Hoje a energia é de ${I.w.toLowerCase()}: ${DAY_MEAN[n]}. ${I.e}`;
  return { ttl, body: `<div class="numhero" style="--nc:${I.c[1]}"><b>${n}</b><span>${I.w}</span></div><p>${intro}</p>
    <div class="box"><h3>${kind === 'dia' ? '✅ Hoje, aproveita para' : '✨ O que te favorece'}</h3>${kind === 'dia' ? I.d.map(t => `<p>• ${t}</p>`).join('') : `<p>Pontos fortes: <b>${I.f}</b>.</p><p>${I.d.map(t => '• ' + t).join('<br>')}</p>`}</div>
    <div class="box"><h3>⚠️ Cuidado com</h3>${kind === 'dia' ? I.n.map(t => `<p>• ${t}</p>`).join('') : `<p>${cap1(I.x)}.</p>`}</div>
    <div class="box"><h3>🎨 Cor ${kind === 'dia' ? 'de hoje' : 'do número'}</h3><p><span class="sw" style="background:${I.c[1]}"></span> <b>${I.c[0]}</b>${kind === 'dia' ? ': boa escolha para a roupa, o verniz ou um pormenor no cabelo.' : '.'}</p></div>
    <p class="note">🔢 Como se calcula: ${how}</p>`, color: I.c[1], I };
}
function openNum(kind) {
  const p = P.get(); if (!p || !p.d) return; const t = todayStr(), n = kind === 'lp' ? lifePath(p.d) : kind === 'py' ? personalYear(p.d, +t.slice(0, 4)) : numDay(p.d, t), r = numInfoHtml(kind, n, p);
  $('#infoDlg').scrollTop = 0; $('#infoTitle').textContent = '🔢 ' + r.ttl; $('#infoBody').innerHTML = r.body + `<button class="btn main" id="numShare" style="width:100%">📤 Partilhar</button>`;
  $('#numShare').onclick = async () => { await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'num' + n + t, [r.color, '#1b1440']); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.fillText(r.ttl.toUpperCase().replace(/: \d+$/, ''), W / 2, 150); ctx.fillStyle = '#fff'; ctx.font = '700 340px Cinzel'; ctx.fillText(String(n), W / 2, 540); ctx.font = 'italic 600 70px "Cormorant Garamond"'; ctx.fillText(r.I.w, W / 2, 650); ctx.font = '500 36px Manrope'; ctx.fillStyle = '#eee'; wrap(ctx, kind === 'dia' ? `${cap1(DAY_MEAN[n])}. ${r.I.d[0]}.` : r.I.e, W / 2, 780, W - 200, 52, 6, 'center'); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '600 32px Manrope'; ctx.fillText(`🎨 ${r.I.c[0]}`, W / 2, 1150); brandFoot(ctx, W, H); await shareCanvases([{ name: 'numerologia', c }], `🔢 ${r.ttl} · ${r.I.w}\n${kind === 'dia' ? cap1(DAY_MEAN[n]) + '.' : r.I.e}\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
}

// ---------- Patudos: passeios, adoção, perdido, ficha ----------
function walkHours(ds) {
  const city = CITIES[ST.city || 0], H = planetaryHours(ds, city); if (!H) return [];
  const good = { sun: '☀️ Sol: energia e brincadeira', jupiter: '♃ Júpiter: passeios longos e felizes', venus: '♀ Vénus: calma e mimos' };
  const fmt = ms => new Date(ms).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: city[3] });
  return H.hours.filter(h => !h.night && good[h.p]).map(h => ({ t: `${fmt(h.start)}–${fmt(h.end)}`, why: good[h.p] }));
}
function adoptToday() { const md = todayStr().slice(5); return P.list('ceu_pets').map((a, i) => ({ a, i })).filter(o => o.a.adopt && o.a.adopt.slice(5) === md && o.a.adopt < todayStr()).map(o => ({ ...o, yrs: ageOn(o.a.adopt) })); }
async function drawAdopt(a) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(), sp = spOf(a), yrs = ageOn(a.adopt), ph = petCare(a).filter(x => x.photo).slice(-1)[0];
  bg(ctx, W, H, 'ad' + a.name, ['#ff9a7a', '#5a1f3a']); ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 34px Cinzel'; ctx.fillText('DIA DE ADOÇÃO', W / 2, 140);
  let y = 200; const im = ph ? await loadImg(ph.photo) : null;
  if (im) { const s = 460; ctx.save(); ctx.beginPath(); ctx.arc(W / 2, y + s / 2, s / 2, 0, 7); ctx.clip(); const m = Math.min(im.width, im.height); ctx.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, W / 2 - s / 2, y, s, s); ctx.restore(); ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(W / 2, y + s / 2, s / 2 + 4, 0, 7); ctx.stroke(); y += s + 120; }
  else { ctx.font = `260px ${EMOJI_F}`; ctx.fillText(sp[1], W / 2, y + 280); y += 420; }
  ctx.fillStyle = '#fff'; ctx.font = '700 96px Cinzel'; ctx.fillText(a.name.toUpperCase(), W / 2, y); y += 110;
  ctx.font = 'italic 600 56px "Cormorant Garamond"'; ctx.fillText(yrs > 0 ? `${yrs} ano${yrs > 1 ? 's' : ''} de família 🏡`.replace(' 🏡', '') : 'Chegou a casa!', W / 2, y); y += 90;
  ctx.font = '500 36px Manrope'; ctx.fillStyle = '#ffe9e0'; wrap(ctx, `No dia ${a.adopt.split('-').reverse().join('/')} a casa ficou mais cheia, e o coração também.`, W / 2, y, W - 220, 52, 3, 'center');
  ctx.textAlign = 'center'; ctx.font = `90px ${EMOJI_F}`; ctx.fillText('🐾', W / 2, H - 170); brandFoot(ctx, W, H); return c;
}
async function drawLost(a, o) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(); ctx.__noTheme = true; const sp = spOf(a);
  ctx.fillStyle = '#ffd400'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, 220);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd400'; ctx.font = '800 130px Manrope'; ctx.fillText('PROCURA-SE', W / 2, 165);
  let y = 260; const im = o.photo ? await loadImg(o.photo) : null;
  if (im) { const w = 760, h = Math.min(620, w * im.height / im.width); ctx.fillStyle = '#fff'; ctx.fillRect(W / 2 - w / 2 - 12, y - 12, w + 24, h + 24); const sh = Math.min(im.height, im.width * h / w); ctx.drawImage(im, 0, (im.height - sh) / 2, im.width, sh, W / 2 - w / 2, y, w, h); y += h + 90; }
  else { ctx.font = `300px ${EMOJI_F}`; ctx.fillText(sp[1], W / 2, y + 300); y += 420; }
  ctx.fillStyle = '#111'; ctx.font = '800 96px Manrope'; ctx.fillText(a.name.toUpperCase(), W / 2, y); y += 66;
  ctx.font = '600 40px Manrope'; ctx.fillText([sp[2], a.breed].filter(Boolean).join(' · '), W / 2, y); y += 64;
  if (o.zone) { ctx.font = '600 38px Manrope'; y = wrap(ctx, `Visto pela última vez: ${o.zone}`, W / 2, y, W - 140, 50, 2, 'center') + 10; }
  if (o.note) { ctx.font = 'italic 500 34px Manrope'; ctx.textAlign = 'center'; y = wrap(ctx, o.note, W / 2, y, W - 160, 46, 2, 'center') + 10; }
  ctx.textAlign = 'center'; ctx.fillStyle = '#c00'; ctx.fillRect(60, H - 210, W - 120, 150); ctx.fillStyle = '#fff'; ctx.font = '800 66px Manrope'; ctx.fillText(`📞 ${o.phone || ''}`, W / 2, H - 112);
  return c;
}
function lostForm(i) {
  const a = P.list('ceu_pets')[i], ph = petCare(a).filter(x => x.photo).slice(-1)[0];
  $('#petMore').innerHTML = `<div class="box lostf"><h3>🆘 Cartaz de animal perdido</h3><p class="note">Fica pronto em segundos para o WhatsApp, Facebook e para imprimir. Esperemos que nunca precises 🙏</p><div class="form"><label class="btn ghost" style="text-align:center;cursor:pointer">📷 ${ph ? 'Trocar a foto' : 'Escolher foto'}<input type="file" id="lPh" accept="image/*" hidden></label><div id="lPhP">${ph ? `<img src="${ph.photo}" alt="" style="width:100%;border-radius:10px">` : ''}</div><label>O teu telemóvel<input type="tel" id="lTel" value="${esc(store.get('ceu_lostphone') || '')}" placeholder="9xx xxx xxx"></label><label>Onde foi visto pela última vez<input type="text" id="lZone" maxlength="70" placeholder="Ex.: Parque da Cidade, Porto"></label><label>Nota<input type="text" id="lNote" maxlength="90" placeholder="Ex.: Tem coleira azul, é meigo"></label><button class="btn main" id="lGo">Criar cartaz</button></div></div>`;
  let photo = ph ? ph.photo : '';
  $('#lPh').onchange = async e => { const f = e.target.files[0]; if (!f) return; const u = URL.createObjectURL(f), im = await loadImg(u); URL.revokeObjectURL(u); if (!im) return; const s = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); photo = c.toDataURL('image/jpeg', .85); $('#lPhP').innerHTML = `<img src="${photo}" alt="" style="width:100%;border-radius:10px">`; };
  $('#lGo').onclick = async () => { const tel = $('#lTel').value.trim(); if (!tel) { toast('Põe o teu contacto'); return; } store.set('ceu_lostphone', tel); const o = { photo, phone: tel, zone: $('#lZone').value.trim(), note: $('#lNote').value.trim() }; await shareCanvases([{ name: 'procura-se-' + a.name.toLowerCase(), c: await drawLost(a, o) }], `🆘 PROCURA-SE: ${a.name} (${[spOf(a)[2], a.breed].filter(Boolean).join(', ')})${o.zone ? '\nVisto pela última vez: ' + o.zone : ''}${o.note ? '\n' + o.note : ''}\n📞 ${tel}\nPartilhem, por favor 🙏`); };
  $('#petMore').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function vetPdf(i) {
  await fontsReady(); const a = P.list('ceu_pets')[i], sp = spOf(a), C = petCare(a).slice().sort((x, y) => y.d.localeCompare(x.d)), W = 1240, H = 1754, pages = [];
  let c, ctx, y;
  const newPage = () => { [c, ctx] = newCanvas(W, H); ctx.__noTheme = true; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#222'; y = 110; pages.push({ c }); };
  const L = (t, f = '500 30px Manrope', col = '#222', dy = 46) => { if (y > H - 120) newPage(); ctx.font = f; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(t, 100, y); y += dy; };
  newPage();
  ctx.fillStyle = '#13795b'; ctx.fillRect(0, 0, W, 16); L(`Ficha de ${a.name}`, '700 56px Manrope', '#111', 70); L(`${sp[2]}${a.breed ? ' · ' + a.breed : ''} · nascido(a) a ${a.d.split('-').reverse().join('/')} (${ageOn(a.d)} anos)${a.adopt ? ' · adotado(a) a ' + a.adopt.split('-').reverse().join('/') : ''}`, '500 28px Manrope', '#555', 60);
  const pesos = C.filter(x => x.k === 'peso'); if (pesos[0]) L(`Peso atual: ${pesos[0].kg} kg (${pesos[0].d.split('-').reverse().join('/')})`, '600 30px Manrope', '#222', 60);
  for (const k of ['vac', 'des', 'vet', 'peso', 'banho']) { const R = C.filter(x => x.k === k); if (!R.length) continue; y += 14; L(`${CARE_T[k][1]}`, '700 34px Manrope', '#13795b', 50); ctx.strokeStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(100, y - 34); ctx.lineTo(W - 100, y - 34); ctx.stroke(); R.forEach(x => L(`${x.d.split('-').reverse().join('/')}   ${x.kg ? x.kg + ' kg   ' : ''}${x.note || ''}${x.next ? '   (próxima: ' + x.next.split('-').reverse().join('/') + ')' : ''}`)); }
  if (!C.length) L('Ainda sem registos na caderneta.', 'italic 500 30px Manrope', '#777');
  pages.forEach((p, j) => { const g = p.c.getContext('2d'); g.font = '500 22px Manrope'; g.fillStyle = '#999'; g.textAlign = 'center'; g.fillText(`Céu de Hoje · ${a.name} · página ${j + 1} de ${pages.length} · ${todayStr().split('-').reverse().join('/')}`, W / 2, H - 50); });
  const pdf = await pagesToPdf(pages, 595.28, 841.89), f = new File([pdf], `ficha-${a.name.toLowerCase()}.pdf`, { type: 'application/pdf' });
  try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  await saveBlob(f, f.name);
}

// ---------- Imagens com a cor do ambiente ----------
const TH_PAL = { branco: { h: 245, s: .25, ink: [245, .3, .14], acc: [42, .62, .36] }, pink: { h: 340, s: .75, ink: [330, .45, .17], acc: [340, .72, .45] }, menta: { h: 158, s: .45, ink: [160, .45, .14], acc: [160, .72, .3] } };
function canvasTheme() { const t = store.get('ceu_theme') || 'astral'; return TH_PAL[t] ? t : 'astral'; }
(function () {
  if (typeof CanvasRenderingContext2D === 'undefined') return;
  const P2 = CanvasRenderingContext2D.prototype, fd = Object.getOwnPropertyDescriptor(P2, 'fillStyle'), sd = Object.getOwnPropertyDescriptor(P2, 'strokeStyle');
  if (!fd || !sd || P2.__themed) return; P2.__themed = true;
  const sc = document.createElement('canvas').getContext('2d'), cache = new Map();
  const hsl2 = (h, s, l, a) => `hsla(${Math.round(h)},${Math.round(s * 100)}%,${Math.round(l * 100)}%,${+a.toFixed(3)})`;
  function map(c) {
    const th = canvasTheme(); if (th === 'astral' || typeof c !== 'string') return c;
    const key = th + '|' + c; if (cache.has(key)) return cache.get(key);
    fd.set.call(sc, '#000'); fd.set.call(sc, c); const n = fd.get.call(sc); let r, g, b, a = 1, m;
    if ((m = /^#([0-9a-f]{6})$/i.exec(n))) { r = parseInt(m[1].slice(0, 2), 16); g = parseInt(m[1].slice(2, 4), 16); b = parseInt(m[1].slice(4), 16); } else if ((m = /rgba?\(([^)]+)\)/.exec(n))) { [r, g, b, a = 1] = m[1].split(',').map(Number); } else { cache.set(key, c); return c; }
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
    const T = TH_PAL[th]; let out;
    if (h >= 33 && h <= 52 && s > .45 && l > .5) out = hsl2(T.acc[0], T.acc[1], T.acc[2], a); // dourado → acento do tema
    else if (l < .3) out = hsl2(T.h, T.s * .55, .955 - l * .25, a); // fundos escuros → claros com o tom do tema
    else if (l > .78) out = hsl2(T.ink[0], T.ink[1], T.ink[2] + (1 - l) * .5, a); // texto claro → tinta escura
    else out = hsl2(h, Math.min(1, s * 1.05), Math.max(.18, 1 - l - .05), a); // cores médias → versão mais escura
    cache.set(key, out); return out;
  }
  window.themeColor = map;
  Object.defineProperty(P2, 'fillStyle', { get() { return fd.get.call(this); }, set(v) { fd.set.call(this, this.__noTheme ? v : map(v)); }, configurable: true });
  Object.defineProperty(P2, 'strokeStyle', { get() { return sd.get.call(this); }, set(v) { sd.set.call(this, this.__noTheme ? v : map(v)); }, configurable: true });
  for (const fn of ['createLinearGradient', 'createRadialGradient']) { const o = P2[fn]; P2[fn] = function (...args) { const g = o.apply(this, args); g.__noTheme = this.__noTheme; return g; }; }
  const acs = CanvasGradient.prototype.addColorStop; CanvasGradient.prototype.addColorStop = function (o, c) { return acs.call(this, o, this.__noTheme ? c : map(c)); };
})();

// ---------- Listas de escolha com as cores da app (substitui as janelas cinzentas do telemóvel) ----------
(function () {
  if (typeof HTMLSelectElement === 'undefined') return;
  const lbl = s => { const o = s.options[s.selectedIndex]; return o ? o.textContent : '—'; };
  const refresh = s => { if (s.__btn) { s.__btn.querySelector('b').textContent = lbl(s); s.__btn.hidden = s.hidden; } };
  for (const prop of ['value', 'selectedIndex']) { const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop); if (d && d.set) Object.defineProperty(HTMLSelectElement.prototype, prop, { get() { return d.get.call(this); }, set(v) { d.set.call(this, v); refresh(this); }, configurable: true }); }
  function openList(s) {
    let dlg = document.getElementById('selDlg');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'selDlg'; dlg.innerHTML = '<h2 id="selT"></h2><input type="search" id="selQ" placeholder="🔎 Procurar…"><div id="selL"></div><div class="dlgfoot"><button class="btn" id="selX">Fechar</button></div>'; document.body.appendChild(dlg); dlg.querySelector('#selX').onclick = () => dlg.close(); dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); }
    const L = dlg.querySelector('#selL'), q = dlg.querySelector('#selQ'), lab = s.closest('label'), title = s.getAttribute('aria-label') || (lab ? [...lab.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '') || 'Escolhe';
    dlg.querySelector('#selT').textContent = title; q.value = ''; q.hidden = s.options.length < 12;
    const draw = () => { const f = nrm(q.value); const sub = (t, q) => { let j = 0; for (const ch of t) if (ch === q[j]) j++; return j === q.length; }; L.innerHTML = [...s.options].map((o, i) => (!f || nrm(o.textContent).includes(f) || (f.length >= 3 && sub(nrm(o.textContent), f.replace(/\s/g, '')))) ? `<button data-i="${i}"${i === s.selectedIndex ? ' class="on"' : ''}>${esc(o.textContent)}${i === s.selectedIndex ? ' <i>✓</i>' : ''}</button>` : '').join(''); L.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { s.selectedIndex = +b.dataset.i; s.dispatchEvent(new Event('change', { bubbles: true })); s.dispatchEvent(new Event('input', { bubbles: true })); dlg.close(); }); };
    q.oninput = draw; draw(); dlg.showModal(); const on = L.querySelector('.on'); if (on) on.scrollIntoView({ block: 'center' });
  }
  function enhance(s) {
    if (s.__btn || s.multiple || s.closest('#selDlg')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'selbtn'; b.innerHTML = '<b></b><i>▾</i>'; s.__btn = b; s.classList.add('selhid'); s.after(b); refresh(s);
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); openList(s); };
    s.addEventListener('change', () => refresh(s));
    new MutationObserver(() => refresh(s)).observe(s, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }
  const scan = root => (root.querySelectorAll ? root.querySelectorAll('select') : []).forEach(enhance);
  const start = () => { scan(document); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.tagName === 'SELECT') enhance(n); else scan(n); }))).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// ---------- Sonhos de viagem: lista de desejos que se cruza com viagens e diário ----------
const dreams = () => intList('viagens').filter(x => x.status === 0);
function dreamKeys(d) { const ks = [d.title, d.place].filter(Boolean).map(s => nrm(s).replace(/[^a-z ]/g, ' ').trim()).filter(s => s.length >= 3); const cc = countryOf(d); return { ks, cc }; }
function dreamMatches(trip) {
  const txt = ' ' + nrm([trip.title, trip.place, trip.by].join(' ')).replace(/[^a-z ]/g, ' ') + ' ', tc = countryOf(trip);
  return dreams().filter(d => !d.realized && d.id !== trip.id).filter(d => { const { ks, cc } = dreamKeys(d); if (ks.some(k => txt.includes(' ' + k + ' '))) return true; return cc && tc && cc[1] === tc[1] && ks.every(k => countryOf({ title: k }) && countryOf({ title: k })[1] === cc[1]); });
}
function realizeDream(d, when, viaId, how) { const all = intList('viagens'), o = all.find(z => z.id === d.id); if (!o) return; o.realized = { d: when || todayStr(), via: viaId || '', how: how || 'viagem' }; intSave('viagens', all); }
function dreamCheck(trip) {
  const M = dreamMatches(trip); if (!M.length) return;
  const names = M.map(d => '«' + d.title + '»').join(' e '), first = Math.min(...M.map(d => d.ts0 || d.ts || Date.now()));
  setTimeout(() => { if (confirmBox(`✨ ${names} ${M.length > 1 ? 'estavam' : 'estava'} na tua lista de sonhos desde ${new Date(first).toLocaleDateString('pt-PT')}. Marcar como realizado?`)) { M.forEach(d => realizeDream(d, trip.sd || todayStr(), trip.id, 'viagem')); toast(M.length > 1 ? `🎉 ${M.length} sonhos realizados!` : '🎉 Sonho realizado!', 3500); render(); } }, 350);
}
function dreamCheckText(text, ds) {
  if (!text) return; const t = ' ' + nrm(text).replace(/[^a-z ]/g, ' ') + ' ';
  const d = dreams().find(x => !x.realized && dreamKeys(x).ks.some(k => k.length >= 4 && t.includes(' ' + k + ' '))); if (!d) return;
  setTimeout(() => { if (confirmBox(`✈️ Falaste de «${d.title}» no diário. Foste lá? Era um dos teus sonhos: marcar como realizado?`)) { realizeDream(d, ds || todayStr(), '', 'diario'); toast('🎉 Sonho realizado!', 3500); render(); } }, 400);
}
function syncProfileDream() { const p = P.get(); if (!p || !p.dream) return; const k = 'ceu_dreamsync_' + nrm(p.dream); if (store.get(k)) return; const all = intList('viagens'); if (!all.some(x => nrm(x.title) === nrm(p.dream))) { all.push({ id: 'i' + Date.now().toString(36), title: p.dream, by: '', status: 0, rating: 0, ts: Date.now(), ts0: Date.now(), fromProfile: true }); intSave('viagens', all); } store.set(k, '1'); }
function vDreams() {
  syncProfileDream();
  const D = dreams().sort((a, b) => (a.realized ? 1 : 0) - (b.realized ? 1 : 0) || (b.ts || 0) - (a.ts || 0)), done = D.filter(d => d.realized).length;
  if (!D.length) return `<div class="box"><h3>✨ Os meus sonhos</h3><p>Junta os lugares onde sonhas ir: cidades, países, aquele restaurante, um festival… Quando lá fores (ou escreveres sobre isso no diário), a app risca o sonho e guarda-o no teu livro do ano.</p><button class="btn main" id="drAdd" style="width:100%">＋ Juntar um sonho</button></div>`;
  return `<div class="box dreams"><h3>✨ Os meus sonhos</h3><div class="drprog"><i style="width:${D.length ? done / D.length * 100 : 0}%"></i></div><p class="note">${done} de ${D.length} sonho${D.length > 1 ? 's' : ''} realizado${done === 1 ? '' : 's'}${done ? ' 🎉' : ''}</p>${D.map(d => { const cc = countryOf(d), since = (d.ts0 || d.ts) ? Math.max(0, Math.round((Date.now() - (d.ts0 || d.ts)) / 864e5)) : null; return `<div class="dr${d.realized ? ' ok' : ''}" data-id="${d.id}"><span>${d.realized ? '✅' : cc ? flagOf(cc[1]) : '✨'}</span><div><b>${esc(d.title)}</b><small>${d.realized ? `Realizado a ${niceDate(d.realized.d).replace(/^[^,]+, /, '')} de ${d.realized.d.slice(0, 4)}` : since != null ? `Na lista há ${since} dia${since === 1 ? '' : 's'}` : 'Na lista'}</small></div>${d.realized ? '' : '<button class="ib drok" title="Já fui!">✓</button>'}</div>`; }).join('')}<button class="btn main" id="drAdd" style="width:100%;margin-top:8px">＋ Juntar um sonho</button></div>`;
}
function bindDreams() {
  if ($('#drAdd')) $('#drAdd').onclick = () => openItem('viagens', null, true, { status: 0, ts: Date.now() });
  document.querySelectorAll('.dr[data-id]').forEach(el => { el.onclick = e => { if (e.target.closest('.drok')) return; openItem('viagens', el.dataset.id, false); }; const b = el.querySelector('.drok'); if (b) b.onclick = () => { const d = dreams().find(x => x.id === el.dataset.id); if (d && confirmBox(`Já foste a «${d.title}»? 🎉`)) { realizeDream(d, todayStr(), '', 'manual'); toast('🎉 Sonho realizado!', 3000); render(); } }; });
}

// ---------- Partilhar as estatísticas de leitura (mês ou ano) ----------
async function drawReadStats(y, mo) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(), B = bookStats(String(y)), ym = mo ? `${y}-${String(mo).padStart(2, '0')}` : null, me = P.get() || {};
  const read = ym ? B.done.filter(x => (x.ed || '').startsWith(ym)) : B.yr, pages = read.reduce((a, x) => a + (+x.pages || 0), 0), rated = read.filter(x => x.rating), avgR = rated.length ? rated.reduce((a, x) => a + x.rating, 0) / rated.length : 0;
  const days = new Set(intList('livros').flatMap(x => x.log || []).filter(d => d.startsWith(ym || String(y)))), byA = {}; read.forEach(x => x.by && (byA[x.by] = (byA[x.by] || 0) + 1)); const topA = Object.entries(byA).sort((a, b) => b[1] - a[1])[0];
  const byG = {}; read.forEach(x => x.genre && (byG[x.genre] = (byG[x.genre] || 0) + 1)); const topG = Object.entries(byG).sort((a, b) => b[1] - a[1])[0], fav = [...read].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  bg(ctx, W, H, 'rs' + y + (mo || ''), ['#7a5cff', '#2a1d6a']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText(ym ? `AS MINHAS LEITURAS · ${MESES[mo - 1].toUpperCase()} ${y}` : `AS MINHAS LEITURAS DE ${y}`, W / 2, 100);
  if (me.name) { ctx.fillStyle = '#d8d0f5'; ctx.font = 'italic 600 36px "Cormorant Garamond"'; ctx.fillText(me.name.split(' ')[0], W / 2, 150); }
  ctx.fillStyle = '#fff'; ctx.font = '700 200px Cinzel'; ctx.fillText(String(read.length), W / 2, 360); ctx.font = '800 40px Manrope'; ctx.fillText(read.length === 1 ? 'livro lido' : 'livros lidos', W / 2, 420);
  const st = [[pages ? pages.toLocaleString('pt-PT') : '–', 'páginas'], [pages ? Math.round(pages * 250 / 1000) + ' mil' : '–', 'palavras'], [days.size || '–', 'dias a ler'], [avgR ? avgR.toFixed(1) + '★' : '–', 'nota média']];
  st.forEach(([v, l], i) => { const x = 140 + i * 267, yy = 520; ctx.fillStyle = '#ffffff14'; rr(ctx, x - 120, yy - 60, 240, 130, 20); ctx.fill(); ctx.fillStyle = '#f2c76e'; fitFont(ctx, String(v), 220, 50, 26, z => `700 ${z}px Cinzel`); ctx.fillText(String(v), x, yy); ctx.fillStyle = '#e8e2ff'; ctx.font = '600 24px Manrope'; ctx.fillText(l, x, yy + 44); });
  let y0 = 680;
  if (!ym) { const mx = Math.max(1, ...B.months), mn = 'JFMAMJJASOND'; ctx.textAlign = 'center'; B.months.forEach((v, k) => { const x = 110 + k * 79, h = v / mx * 180; ctx.fillStyle = '#ffffff18'; rr(ctx, x - 26, y0, 52, 190, 10); ctx.fill(); if (v) { ctx.fillStyle = '#f2c76e'; rr(ctx, x - 26, y0 + 190 - h, 52, h, 10); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 22px Manrope'; ctx.fillText(String(v), x, y0 + 180 - h); } ctx.fillStyle = '#cfc6ee'; ctx.font = '700 22px Manrope'; ctx.fillText(mn[k], x, y0 + 222); }); y0 += 270; }
  else { const dim = new Date(y, mo, 0).getDate(), first = (new Date(y, mo - 1, 1).getDay() + 6) % 7; ctx.font = '700 20px Manrope'; ctx.textAlign = 'center'; 'STQQSSD'.split('').forEach((d, i) => { ctx.fillStyle = '#cfc6ee'; ctx.fillText(d, 230 + i * 104, y0); }); for (let d = 1; d <= dim; d++) { const k = first + d - 1, x = 230 + (k % 7) * 104, yy = y0 + 30 + Math.floor(k / 7) * 58, on = days.has(`${ym}-${String(d).padStart(2, '0')}`); ctx.fillStyle = on ? '#f2c76e' : '#ffffff12'; ctx.beginPath(); ctx.arc(x, yy + 18, 24, 0, 7); ctx.fill(); ctx.fillStyle = on ? '#2a1d05' : '#e8e2ff'; ctx.font = '700 20px Manrope'; ctx.fillText(String(d), x, yy + 25); } y0 += 30 + Math.ceil((first + dim) / 7) * 58 + 30; }
  ctx.textAlign = 'left'; const lines = [];
  if (fav && fav.rating) lines.push(`❤️ Favorito: «${fav.title}» ${'★'.repeat(fav.rating)}`);
  if (topA) lines.push(`✍️ Autor(a): ${topA[0]}${topA[1] > 1 ? ` (${topA[1]})` : ''}`); if (topG) lines.push(`🏷️ Género: ${topG[0]}`);
  const lvl = READER.filter(r => B.yr.length >= r[0]).pop(); if (!ym && lvl) lines.push(lvl[1]);
  ctx.font = '600 32px Manrope'; ctx.fillStyle = '#efeaff'; lines.slice(0, 4).forEach((l, i) => { let s = l; while (ctx.measureText(s).width > W - 200 && s.length > 4) s = s.slice(0, -2); ctx.fillText(s === l ? s : s + '…', 100, y0 + i * 52); }); y0 += Math.min(4, lines.length) * 52 + 10;
  const covers = []; for (const x of read.filter(x => x.cover).slice(-6)) { const im = await loadImg(x.cover); if (im) covers.push(im); }
  if (covers.length && y0 < H - 330) { const cw = 130, chh = 195, gap = 18, n = covers.length, x0 = W / 2 - (n * cw + (n - 1) * gap) / 2; covers.forEach((im, i) => { ctx.save(); ctx.shadowColor = '#0008'; ctx.shadowBlur = 16; rr(ctx, x0 + i * (cw + gap), y0 + 10, cw, chh, 8); ctx.clip(); ctx.drawImage(im, x0 + i * (cw + gap), y0 + 10, cw, chh); ctx.restore(); }); }
  else if (!read.length) { ctx.textAlign = 'center'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; ctx.fillStyle = '#fff'; ctx.fillText('O próximo livro está à espera 📚', W / 2, y0 + 80); }
  brandFoot(ctx, W, H); return { c, n: read.length, pages };
}
function readShareBox(y) { const cur = todayStr(), sameY = String(y) === cur.slice(0, 4), m = sameY ? +cur.slice(5, 7) : 12; return `<div class="box rshare"><h3>📤 Partilhar as minhas leituras</h3><div class="seg2"><button data-rsp="m" class="on">${MESES[m - 1][0].toUpperCase() + MESES[m - 1].slice(1)}</button><button data-rsp="y">Ano ${y}</button></div><div class="drow" style="margin-top:8px"><button class="btn main" id="rsGo">📤 Partilhar</button><button class="btn" id="rsSave">⬇️ Guardar</button></div></div>`; }
function bindReadShare(y) {
  if (!$('#rsGo')) return; const cur = todayStr(), m = String(y) === cur.slice(0, 4) ? +cur.slice(5, 7) : 12; let per = 'm';
  document.querySelectorAll('[data-rsp]').forEach(b => b.onclick = () => { per = b.dataset.rsp; document.querySelectorAll('[data-rsp]').forEach(z => z.classList.toggle('on', z === b)); });
  const make = () => drawReadStats(+y, per === 'm' ? m : 0);
  $('#rsGo').onclick = async () => { toast('A preparar…'); const r = await make(); await shareCanvases([{ name: `leituras-${y}${per === 'm' ? '-' + String(m).padStart(2, '0') : ''}`, c: r.c }], `📚 ${per === 'm' ? 'O meu ' + MESES[m - 1] : 'O meu ' + y} em livros: ${r.n} livro${r.n === 1 ? '' : 's'}${r.pages ? ', ' + r.pages.toLocaleString('pt-PT') + ' páginas' : ''}!\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  $('#rsSave').onclick = async () => { const r = await make(); await saveBlob(await blobOf(r.c), `leituras-${y}${per === 'm' ? '-' + String(m).padStart(2, '0') : ''}.jpg`); };
}

// ---------- Reel (vídeo 9:16) de um livro, série ou viagem ----------
const REEL_HEAD = { livros: ['VOU LER', 'A LER AGORA', 'LI!', 'EM PAUSA', 'DESISTI'], series: ['VOU COMEÇAR', 'A VER AGORA', 'ACABEI!', 'EM PAUSA', 'DESISTI'], viagens: ['SONHO DE IR', 'EM VIAGEM', 'FUI!'], colecoes: ['QUERO!', 'A CAMINHO', 'JÁ É MEU!', 'EMPRESTADO', 'JÁ NÃO É MEU'] };
async function makeItemReel(t, x, btn) {
  await fontsReady(); const W = 1080, H = 1920, C = INT[t], cc = t === 'viagens' ? countryOf(x) : null, img = x.cover ? await loadImg(x.cover) : null, sky = x.sd ? skyFor(x.sd) : null;
  const el = sky ? SIGNS[sky.moon.sign].el : 'ar', base = document.createElement('canvas'); base.width = W; base.height = H; bg(base.getContext('2d'), W, H, x.id + 'reel', EL_COL[el]);
  const T = tarotFor((x.title || '') + (t === 'livros' ? (x.by || '') + 'l' : t === 'series' ? 'tv' : (x.sd || '') + 'v')), tm = t === 'livros' ? T[3] : t === 'series' ? TAROT_TV[TAROT.indexOf(T)] : T[2];
  const head = x.realized ? 'SONHO REALIZADO!' : (t === 'series' && x.kind === 'filme' ? ['VOU VER', 'A VER AGORA', 'VI!', 'EM PAUSA', 'DESISTI'] : REEL_HEAD[t])[x.status] || '';
  const dur = durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et)), loved = x.rating >= 5, ease2 = v => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3);
  const draw = (ctx, s) => {
    ctx.drawImage(base, 0, 0); ctx.textAlign = 'center';
    const a = ease2(s / .6); ctx.globalAlpha = a; ctx.fillStyle = '#f2c76e'; ctx.font = '800 64px Manrope'; ctx.fillText(head, W / 2, 230 - (1 - a) * 40); ctx.globalAlpha = 1;
    const ap = ease2((s - .3) / .8), sc = .85 + .15 * ap, cy = 640; ctx.save(); ctx.globalAlpha = ap; ctx.translate(W / 2, cy); ctx.scale(sc, sc); ctx.rotate((1 - ap) * -.08);
    if (img) { const h = 640, w = Math.min(460, h * img.width / img.height); ctx.shadowColor = '#000a'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip(); ctx.drawImage(img, -w / 2, -h / 2, w, h); }
    else { ctx.font = `${cc ? 340 : 300}px ${EMOJI_F}`; ctx.fillText(cc ? flagOf(cc[1]) : t === 'series' && x.kind !== 'filme' ? '📺' : C.ic, 0, 120); }
    ctx.restore(); ctx.globalAlpha = 1;
    const at = ease2((s - 1.1) / .6); ctx.globalAlpha = at; ctx.fillStyle = '#fff'; fitFont(ctx, x.title, W - 120, 84, 40, z => `700 ${z}px Cinzel`); ctx.fillText(x.title, W / 2, 1080); const sub = [x.by, x.genre].filter(Boolean).join(' · '); if (sub) { ctx.fillStyle = '#d8d0f5'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; ctx.fillText(sub, W / 2, 1150); } ctx.globalAlpha = 1;
    if (x.rating) for (let i = 0; i < 5; i++) { const ai = ease2((s - 1.8 - i * .15) / .3); if (ai <= 0) continue; ctx.save(); ctx.translate(W / 2 + (i - 2) * 92, 1250); ctx.scale(ai, ai); star(ctx, 0, 0, 36, i < x.rating); ctx.restore(); }
    let y = 1360; const af = ease2((s - 2.8) / .5); ctx.globalAlpha = af; ctx.font = '700 44px Manrope'; ctx.fillStyle = '#fff';
    if (loved) { ctx.fillText('❤️ ADOREI ❤️', W / 2, y); y += 70; }
    if (x.status === 2 && dur) { ctx.font = '600 40px Manrope'; ctx.fillText(`⏱ ${C.done} em ${dur}`, W / 2, y); y += 66; }
    if (t === 'series' && x.kind !== 'filme' && (x.eplog || []).length) { ctx.font = '600 36px Manrope'; ctx.fillText(`📺 ${epInfo(x)}`, W / 2, y); y += 60; }
    ctx.globalAlpha = 1;
    if (x.comment) { const ac = ease2((s - 3.6) / .6); ctx.globalAlpha = ac; ctx.fillStyle = '#ffffffee'; ctx.font = 'italic 600 48px "Cormorant Garamond"'; const Ls = linesOf(ctx, '“' + x.comment.slice(0, 160) + (x.comment.length > 160 ? '…' : '') + '”', W - 200).slice(0, 3); Ls.forEach((l, i) => ctx.fillText(l, W / 2, y + 20 + i * 60)); y += 40 + Ls.length * 60; ctx.globalAlpha = 1; }
    const am = ease2((s - 4.6) / .6); ctx.globalAlpha = am; ctx.font = '500 34px Manrope'; ctx.fillStyle = '#e8e2ff'; if (sky) { ctx.fillText(`🌙 Comecei com a Lua em ${SIGNS[sky.moon.sign].n}`, W / 2, Math.max(y + 40, 1660)); } ctx.fillText(`🃏 ${T[0]}: ${tm.length > 44 ? tm.slice(0, 42) + '…' : tm}`, W / 2, Math.max(y + 96, 1716)); ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.fillText((store.get('ceu_brand') || '').trim() || 'CÉU DE HOJE', W / 2, H - 80);
  };
  const r = await recordAnim(draw, 7.5, W, H, btn, '🎬'); if (!r) return;
  const cap = t === 'series' ? `${x.kind === 'filme' ? '🎬' : '📺'} ${head.charAt(0) + head.slice(1).toLowerCase()} ${x.title}${x.by ? ' (' + x.by + ')' : ''}${x.rating ? ' ' + '★'.repeat(x.rating) : ''}${x.comment ? '\n\n«' + x.comment.slice(0, 200) + '»' : ''}\n\nFeito com Céu de Hoje ✨ ${APP_URL}` : t === 'livros' ? `📚 ${x.title}${x.by ? ' de ' + x.by : ''}${x.rating ? ' ' + '★'.repeat(x.rating) : ''}${x.comment ? '\n\n«' + x.comment.slice(0, 200) + '»' : ''}\n\nFeito com Céu de Hoje ✨ ${APP_URL}` : `${cc ? flagOf(cc[1]) : '✈️'} ${x.title}\n\nFeito com Céu de Hoje ✨ ${APP_URL}`;
  $('#reelVid').src = URL.createObjectURL(r.blob); $('#reelInfo').innerHTML = r.ext === 'mp4' ? 'Reel pronto (vertical 9:16, MP4): serve para Reels e Stories do Instagram e do Facebook, e para o Estado do WhatsApp. Junta a música lá dentro.' : 'Reel pronto (9:16) em <b>WebM</b>: o Facebook e o WhatsApp aceitam; o Instagram pode recusar. Atualiza o Chrome para gravar em MP4.'; $('#reelDlg').showModal();
  $('#reelShare').onclick = async () => { const f = new File([r.blob], `${t}-${nrm(x.title).replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.${r.ext}`, { type: r.blob.type }); if (!(await shareFiles([f], cap))) { await saveBlob(f, f.name); toast('Vídeo guardado e legenda copiada'); } };
}
