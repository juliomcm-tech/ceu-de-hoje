// ===== App =====
const $ = s => document.querySelector(s);
const MESES = MES_N;
const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { if (!store._warned || Date.now() - store._warned > 20000) { store._warned = Date.now(); setTimeout(() => { try { toast('⚠️ A memória da app está cheia: não foi possível guardar. Faz uma cópia de segurança e apaga algumas fotos.', 6000); } catch (x) { } }, 50); } return false; } } };
const ST = { date: '', type: 'top', mode: 'dia', fmt: store.get('ceu_fmt') || 'feed', modern: store.get('ceu_modern') === '1', sky: store.get('ceu_sky') !== '0', cover: store.get('ceu_cover') === '1', brand: store.get('ceu_brand') || '', city: +(store.get('ceu_city') || 0), reads: [], rank: [], canvases: [], cap: '' };
const TYPE_MODES = { top: ['dia', 'semana', 'mes', 'ano'], pares: ['dia'], lua: ['dia', 'mes'], anos: ['dia'], horas: ['dia'] };
let DL = null;
try { if (window.claude && claude.use) claude.use('downloads').then(x => { DL = x; }).catch(() => { }); } catch (e) { }
const SYMF = '"Noto Sans Symbols","Noto Sans Symbols 2","Segoe UI Symbol","DejaVu Sans",sans-serif';
const VS = '︎';
const city = () => CITIES[ST.city] || CITIES[0];

const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const shiftDate = (ds, n, mode) => { const [y, m, d] = ds.split('-').map(Number); const t = mode === 'ano' ? new Date(Date.UTC(y + n, 0, 1)) : mode === 'mes' ? new Date(Date.UTC(y, m - 1 + n, 1)) : new Date(Date.UTC(y, m - 1, d + n * (mode === 'semana' ? 7 : 1))); return t.toISOString().slice(0, 10); };
const dParts = ds => ds.split('-').map(Number);
const cap1 = s => s[0].toUpperCase() + s.slice(1);
function niceDate(ds) { const [y, m, d] = dParts(ds); return DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] + ', ' + d + ' de ' + MESES[m - 1]; }
function periodLabel(mode = ST.mode) {
  const [y, m] = dParts(ST.date);
  if (mode === 'dia') return niceDate(ST.date);
  if (mode === 'ano') return String(y);
  if (mode === 'mes') return cap1(MESES[m - 1]) + ' ' + y;
  const [a, b] = periodRange(ST.date, 'semana'), A = dParts(a), B = dParts(b);
  return A[1] === B[1] ? `${A[2]} a ${B[2]} de ${MESES[A[1] - 1]}` : `${A[2]} ${MESES[A[1] - 1].slice(0, 3)} a ${B[2]} ${MESES[B[1] - 1].slice(0, 3)}`;
}
const topTitle = () => ST.pets ? ({ dia: 'TOP DOS PETS', semana: 'PETS DA SEMANA', mes: 'PETS DO MÊS', ano: 'PETS DE ' + ST.date.slice(0, 4) })[ST.mode] : ({ dia: 'TOP DO DIA', semana: 'TOP DA SEMANA', mes: 'TOP DO MÊS', ano: 'TOP DE ' + ST.date.slice(0, 4) })[ST.mode];
const AREA_LBL = rd => rd && rd.pet ? { amor: 'Mimos', trabalho: 'Brincadeira', dinheiro: 'Apetite', energia: 'Passeio' } : { amor: 'Amor', trabalho: 'Trabalho', dinheiro: 'Dinheiro', energia: 'Energia' };
const AREAS4 = rd => { const L = AREA_LBL(rd); return [[L.amor, 'amor', rd.love], [L.trabalho, 'trabalho', rd.work], [L.dinheiro, 'dinheiro', rd.money], [L.energia, 'energia', rd.energy]]; };
const brand = () => ST.brand || 'Céu de Hoje';
const starStr = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const firstSentence = t => { const m = t.match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : t; };
const MEDAL = ['🥇', '🥈', '🥉'];
const plainEmoji = t => t.replace(/^[^\p{L}\d]+/u, '');
function toast(msg, ms) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), ms || 2600); }
const rxList = s => (ST.modern ? ALLP : CLASSIC).filter(p => s[p].rx);
const rxText = s => { const l = rxList(s); return l.length ? `${l.map(p => PL[p].n).join(', ')} retrógrad${l.length > 1 ? 'os' : PL[l[0]].f ? 'a' : 'o'}` : ''; };
function skyShort() {
  if (ST.mode === 'ano') { const s = skyFor(ST.date.slice(0, 4) + '-01-01'); return `Júpiter em ${SIGN_IN[s.jupiter.sign]} · Saturno em ${SIGN_IN[s.saturn.sign]} no início do ano`; }
  const s = skyFor(ST.mode === 'dia' ? ST.date : periodRange(ST.date, ST.mode)[0]), rx = rxText(s);
  if (ST.mode !== 'dia') return `Sol em ${SIGN_IN[s.sun.sign]}${rx ? ' · ' + rx : ''} no início`;
  return `Sol em ${SIGN_IN[s.sun.sign]} · Lua em ${SIGN_IN[s.moon.sign]} · ${moonPhaseName(s.phase.elong)}${rx ? ' · ' + rx : ''}`;
}

// ---------- Canvas helpers ----------
function bg(ctx, W, H, seed, elc) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0a26'); g.addColorStop(1, '#03030c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * .5, H * .2, 10, W * .5, H * .2, W * .95); rg.addColorStop(0, elc[1] + 'dd'); rg.addColorStop(1, '#00000000'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  const r2 = ctx.createRadialGradient(W * .95, H, 10, W * .95, H, W * .7); r2.addColorStop(0, '#3a1d6a77'); r2.addColorStop(1, '#00000000'); ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);
  const r = seeded('st' + seed);
  const lt = typeof canvasTheme === 'function' && canvasTheme() !== 'astral' && !ctx.__noTheme;
  for (let i = 0; i < (lt ? 90 : 240); i++) { ctx.globalAlpha = (.2 + r() * .7) * (lt ? .35 : 1); ctx.fillStyle = r() < .15 ? '#ffe3a3' : '#fff'; ctx.beginPath(); ctx.arc(r() * W, r() * H, r() * 1.7 + .3, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function star(ctx, cx, cy, R, on) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } ctx.closePath(); if (on) { ctx.fillStyle = '#f2c76e'; ctx.fill(); } else { ctx.strokeStyle = '#f2c76e77'; ctx.lineWidth = 2; ctx.stroke(); } }
function stars(ctx, x, y, n, R, align = 'left') { const gap = R * 2.4, w = gap * 4 + 2 * R; let sx = align === 'right' ? x - w + R : align === 'center' ? x - w / 2 + R : x + R; for (let i = 0; i < 5; i++) star(ctx, sx + i * gap, y, R, i < n); }
function wrap(ctx, text, x, y, maxW, lh, maxLines, align = 'left') {
  const words = text.split(' '); let line = '', lines = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); let l = lines[maxLines - 1]; while (ctx.measureText(l + '…').width > maxW && l.length) l = l.slice(0, -1); lines[maxLines - 1] = l.replace(/[\s,;:—-]+$/, '') + '…'; }
  ctx.textAlign = align; lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); ctx.textAlign = 'left'; return y + lines.length * lh;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wheel(ctx, cx, cy, R, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, R * .82, 0, 7); ctx.stroke();
  ctx.fillStyle = '#f2c76e'; ctx.font = `${R * .11}px ${SYMF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) { const a = (i * 30 - 75) * Math.PI / 180, a2 = (i * 30 - 90) * Math.PI / 180; ctx.beginPath(); ctx.moveTo(cx + R * .82 * Math.cos(a2), cy + R * .82 * Math.sin(a2)); ctx.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2)); ctx.stroke(); ctx.fillText(SIGNS[i].g + VS, cx + R * .91 * Math.cos(a), cy + R * .91 * Math.sin(a)); }
  ctx.restore(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
}
function drawMoon(ctx, cx, cy, r, e) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#1c1e40'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const lit = '#f6f1dc', waxing = e < 180, crescent = Math.cos(e * D2R) > 0;
  ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !waxing); ctx.closePath(); ctx.fill();
  ctx.fillStyle = crescent ? '#1c1e40' : lit; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, r * Math.abs(Math.cos(e * D2R))), r, 0, 0, 7); ctx.fill();
  ctx.restore(); ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
}
const mk = (fmt = ST.fmt) => { const W = 1080, H = fmt === 'story' ? 1920 : 1350, c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d'), W, H, fmt === 'story']; };
function header(ctx, W, S, y, label = periodLabel()) {
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.textAlign = 'left'; ctx.fillText(brand().toUpperCase(), 72, y);
  ctx.fillStyle = '#c9c9ee'; ctx.font = '600 27px Manrope'; ctx.textAlign = 'right'; ctx.fillText(label, W - 72, y); ctx.textAlign = 'left';
}
function titleBlock(ctx, W, S, title, sub, line, y0) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText(brand().toUpperCase(), W / 2, y0);
  ctx.fillStyle = '#fff'; ctx.font = `700 ${title.length > 16 ? 62 : 76}px Cinzel`; ctx.fillText(title, W / 2, y0 + 86);
  ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; ctx.fillText(sub, W / 2, y0 + 136);
  if (line) {
    ctx.fillStyle = '#b3b3dc';
    if (S) { // Reels/Stories: duas linhas centradas, longe das margens que o Facebook corta
      ctx.font = '600 27px Manrope'; const parts = line.split(' · '); let l1 = line, l2 = '';
      if (ctx.measureText(line).width > W - 260 && parts.length > 1) { let best = 1, bd = 1e9; for (let i = 1; i < parts.length; i++) { const d = Math.abs(ctx.measureText(parts.slice(0, i).join(' · ')).width - ctx.measureText(parts.slice(i).join(' · ')).width); if (d < bd) { bd = d; best = i; } } l1 = parts.slice(0, best).join(' · '); l2 = parts.slice(best).join(' · '); }
      ctx.fillText(l1, W / 2, y0 + 180); if (l2) ctx.fillText(l2, W / 2, y0 + 216);
    } else { let fs = 22; ctx.font = `500 ${fs}px Manrope`; while (ctx.measureText(line).width > W - 140 && fs > 15) { fs--; ctx.font = `500 ${fs}px Manrope`; } ctx.fillText(line, W / 2, y0 + 176); }
  }
  ctx.textAlign = 'left';
}
function footer(ctx, W, H, S, txt) { ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 27px Manrope'; ctx.fillText(txt, W / 2, H - (S ? 200 : 46)); ctx.textAlign = 'left'; }

// ---------- TOP ----------
function topRow(ctx, rd, i, x, y, w, h, S, alpha = 1, glow = 0) {
  const cy = y + h / 2, elc = EL_COL[rd.sign.el][0];
  ctx.save(); ctx.globalAlpha = alpha;
  if (glow) { ctx.shadowColor = '#f2c76e'; ctx.shadowBlur = 30 * glow; }
  ctx.fillStyle = i < 3 ? ['#f2c76e2a', '#cfd8e31e', '#d0895a22'][i] : (i % 2 ? '#ffffff08' : '#ffffff10');
  rr(ctx, x, y + 3, w, h - 6, 16); ctx.fill(); ctx.shadowBlur = 0;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = i < 3 ? ['#f2c76e', '#dfe6ee', '#e0a070'][i] : '#8e8fbf'; ctx.font = `800 ${S ? 40 : 34}px Manrope`; ctx.fillText(String(i + 1), x + 44, cy);
  ctx.fillStyle = elc; ctx.font = `${S ? 50 : 42}px ${SYMF}`; ctx.fillText(rd.sign.g + VS, x + 116, cy + 2);
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `700 ${S ? 34 : 29}px Cinzel`; ctx.fillText(rd.sign.n.toUpperCase(), x + 162, cy - (S ? 14 : 11));
  ctx.fillStyle = '#b9b9e2'; ctx.font = `500 ${S ? 23 : 20}px Manrope`; ctx.fillText(rd.keyword, x + 162, cy + (S ? 22 : 18));
  stars(ctx, x + w - 24, cy, toStars(rd.overall), S ? 15 : 13, 'right');
  ctx.restore(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
}
function topLayout(S, H) { const top = S ? 420 : 280, bot = S ? 330 : 104; return { top, rowH: (H - top - bot) / 12, P: 60 }; }
function drawTop() {
  const [c, ctx, W, H, S] = mk();
  bg(ctx, W, H, ST.date + ST.mode + 'top', ['#7a5cff', '#2a1d6a']);
  wheel(ctx, W / 2, S ? 300 : 150, S ? 360 : 300, .08);
  titleBlock(ctx, W, S, topTitle(), periodLabel(), null, S ? 170 : 78);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe3a3'; ctx.font = `600 ${S ? 24 : 21}px Manrope`; wrap(ctx, dayAlert(), W / 2, S ? 350 : 238, W - 140, S ? 28 : 24, 1, 'center');
  const L = topLayout(S, H);
  ST.rank.forEach((rd, i) => topRow(ctx, rd, i, L.P, L.top + i * L.rowH, W - 2 * L.P, L.rowH, S));
  footer(ctx, W, H, S, 'Desliza: tudo sobre o teu signo →  ·  Segue ' + brand());
  return c;
}
function drawSign(rd, pos) {
  const [c, ctx, W, H, S] = mk(), elc = EL_COL[rd.sign.el], P = 72;
  bg(ctx, W, H, ST.date + ST.mode + rd.si, elc);
  header(ctx, W, S, S ? 130 : 84);
  const gy = S ? 360 : 232;
  wheel(ctx, W / 2, gy, S ? 200 : 160, .2);
  const g = ctx.createRadialGradient(W / 2, gy, 10, W / 2, gy, 118); g.addColorStop(0, elc[0] + '55'); g.addColorStop(1, elc[0] + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, gy, 118, 0, 7); ctx.fill();
  ctx.strokeStyle = elc[0]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, gy, 100, 0, 7); ctx.stroke();
  ctx.fillStyle = '#fff6e0'; ctx.font = `112px ${SYMF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(rd.sign.g + VS, W / 2, gy + 6);
  const bx = W / 2 + 92, by = gy - 78;
  ctx.fillStyle = pos < 3 ? ['#f2c76e', '#dfe6ee', '#e0a070'][pos] : '#2b2d63'; ctx.beginPath(); ctx.arc(bx, by, 40, 0, 7); ctx.fill();
  ctx.fillStyle = pos < 3 ? '#1a1206' : '#fff'; ctx.font = '800 34px Manrope'; ctx.fillText(pos + 1 + 'º', bx, by + 2);
  ctx.textBaseline = 'alphabetic';
  let y = gy + (S ? 230 : 190);
  ctx.fillStyle = '#fff'; ctx.font = '700 80px Cinzel'; ctx.fillText(rd.sign.n.toUpperCase(), W / 2, y);
  y += 44; ctx.fillStyle = '#a9a9d6'; ctx.font = '600 25px Manrope'; ctx.fillText(rd.sign.r + '  ·  ' + rd.keyword, W / 2, y);
  y += S ? 88 : 66; ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 48px "Cormorant Garamond"';
  y = wrap(ctx, '“' + rd.headline + '”', W / 2, y, W - 2 * P, 56, 2, 'center') + (S ? 40 : 22);
  const rows = AREAS4(rd).map(([l, k, t]) => [l.toUpperCase(), k, t]);
  const rowH = S ? 136 : 116;
  for (const [l, k, t] of rows) {
    ctx.fillStyle = '#ffffff12'; rr(ctx, P - 18, y, W - 2 * P + 36, rowH - 12, 18); ctx.fill();
    ctx.fillStyle = elc[0]; ctx.font = '800 24px Manrope'; ctx.fillText(l, P + 4, y + 38);
    stars(ctx, W - P - 4, y + 30, rd.stars[k], 13, 'right');
    ctx.fillStyle = '#e6e6fb'; ctx.font = `500 ${S ? 27 : 24}px Manrope`;
    wrap(ctx, firstSentence(t), P + 4, y + 74, W - 2 * P - 8, S ? 34 : 30, S ? 2 : 1);
    y += rowH;
  }
  y += S ? 14 : 6;
  const ally = ['ALIADO', SIGNS[rd.ally].g + VS + ' ' + SIGNS[rd.ally].n, null], cor = ['COR', PL[rd.fav].cor, PL[rd.fav].hex];
  const chips = rd.mode === 'dia' ? [['SORTE', String(rd.lucky), null], cor, ['ASTRO', PL[rd.fav].g + VS + ' ' + PL[rd.fav].n, null], ally]
    : rd.mode === 'ano' ? [['MELHOR MÊS', rd.bestDay, null], [AREA_LBL(rd).amor.toUpperCase(), rd.bestLove, null], cor, ally]
      : [['MELHOR DIA', rd.bestDay, null], [AREA_LBL(rd).amor.toUpperCase(), rd.bestLove, null], cor, ally];
  const cw = (W - 2 * P + 36 - 3 * 12) / 4, ch = S ? 120 : 98;
  chips.forEach(([l, v, hex], i) => {
    const x = P - 18 + i * (cw + 12);
    ctx.fillStyle = '#ffffff0d'; rr(ctx, x, y, cw, ch, 16); ctx.fill(); ctx.strokeStyle = elc[0] + '55'; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#9b9cc9'; ctx.font = '800 18px Manrope'; ctx.fillText(l, x + cw / 2, y + 32);
    let vx = x + cw / 2; ctx.font = `700 ${v.length > 11 ? 21 : 26}px Manrope, ${SYMF}`;
    if (hex) { const tw = ctx.measureText(v).width; ctx.fillStyle = hex; ctx.beginPath(); ctx.arc(vx - tw / 2 - 6, y + ch - 40, 9, 0, 7); ctx.fill(); vx += 10; }
    ctx.fillStyle = '#fff'; ctx.fillText(v, vx, y + ch - 30);
  });
  ctx.textAlign = 'center'; ctx.fillStyle = '#d8d8f4'; ctx.font = `italic 600 ${S ? 36 : 32}px "Cormorant Garamond"`;
  wrap(ctx, firstSentence(rd.advice.replace(/^O teu regente, ([^,]+), /, '$1 ').replace(/^(.)/, m => m.toUpperCase())), W / 2, y + ch + (S ? 66 : 50), W - 2 * P, S ? 42 : 34, 2, 'center');
  footer(ctx, W, H, S, 'Segue ' + brand() + ' · o teu horóscopo todos os dias');
  return c;
}
function drawSky() {
  const [c, ctx, W, H, S] = mk();
  bg(ctx, W, H, ST.date + 'ceu', ['#4f7cff', '#152a5c']);
  const ds = ST.mode === 'dia' ? ST.date : periodRange(ST.date, ST.mode)[0], s = skyFor(ds), list = ST.modern ? ALLP : CLASSIC;
  header(ctx, W, S, S ? 130 : 84);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 64px Cinzel'; ctx.fillText(ST.mode === 'dia' ? 'O CÉU DE HOJE' : 'O CÉU', W / 2, S ? 250 : 172);
  const cx = W / 2, cy = S ? 640 : 520, R = S ? 380 : 330;
  wheel(ctx, cx, cy, R, .55);
  const placed = [];
  list.slice().sort((a, b) => s[a].lon - s[b].lon).forEach(p => {
    let ang = s[p].lon, rad = R * .64;
    for (const q of placed) if (Math.abs(angDiff(q.ang, ang)) < 9 && Math.abs(q.rad - rad) < 30) rad -= 62;
    placed.push({ ang, rad });
    const a = (ang - 90) * Math.PI / 180, x = cx + rad * Math.cos(a), y = cy + rad * Math.sin(a);
    ctx.strokeStyle = PL[p].hex + '66'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + R * .8 * Math.cos(a), cy + R * .8 * Math.sin(a)); ctx.lineTo(cx + (rad + 30) * Math.cos(a), cy + (rad + 30) * Math.sin(a)); ctx.stroke();
    ctx.fillStyle = '#0b0a26'; ctx.beginPath(); ctx.arc(x, y, 28, 0, 7); ctx.fill(); ctx.strokeStyle = PL[p].hex; ctx.stroke();
    ctx.fillStyle = PL[p].hex; ctx.font = `36px ${SYMF}`; ctx.textBaseline = 'middle'; ctx.fillText(PL[p].g + VS, x, y + 2); ctx.textBaseline = 'alphabetic';
  });
  drawMoon(ctx, cx, cy - 18, 40, s.phase.elong);
  ctx.textAlign = 'center'; ctx.fillStyle = '#e8e8f8'; ctx.font = '700 20px Manrope'; ctx.fillText(moonPhaseName(s.phase.elong), cx, cy + 48);
  let y = cy + R + (S ? 100 : 72);
  ctx.font = `600 ${S ? 27 : 23}px Manrope, ${SYMF}`; ctx.textAlign = 'left';
  list.forEach((p, i) => { const x = i % 2 ? W / 2 + 30 : 110, yy = y + Math.floor(i / 2) * (S ? 50 : 38); ctx.fillStyle = PL[p].hex; ctx.fillText(`${PL[p].g}${VS}  ${PL[p].n} em ${SIGN_IN[s[p].sign]} ${Math.floor(s[p].deg)}°${s[p].rx ? ' ℞' : ''}`, x, yy); });
  footer(ctx, W, H, S, 'Posições reais calculadas · Segue ' + brand());
  return c;
}

// ---------- Avisos ----------
const V_GOOD = { amor: ['o amor sorri-te — aproveita', 'boa altura para abrir o coração'], trabalho: ['algo em que investiste vai dar frutos', 'o teu esforço vai ser reconhecido'], dinheiro: ['boa maré para dinheiro e negócios', 'uma oportunidade financeira pode surgir'], energia: ['estás imparável — vai em frente', 'energia e confiança no máximo'] };
const V_BAD = { amor: ['evita discussões com quem amas', 'não leves tudo a peito no amor'], trabalho: ['revê tudo antes de entregar', 'não assines nada à pressa'], dinheiro: ['não gastes por impulso', 'adia compras grandes'], energia: ['não forces, descansa', 'poupa energias e dorme bem'] };
const AREA_N = { amor: 'no amor', trabalho: 'no trabalho', dinheiro: 'no dinheiro', energia: 'na energia' };
function verdict(rd) {
  if (rd.pet) return petVerdict(rd);
  const r = seeded('v' + ST.date + ST.mode + rd.si), ks = ['amor', 'trabalho', 'dinheiro', 'energia'];
  const best = ks.reduce((a, b) => rd.area[b] > rd.area[a] ? b : a), worst = ks.reduce((a, b) => rd.area[b] < rd.area[a] ? b : a);
  const per = { dia: 'Dia', semana: 'Semana', mes: 'Mês', ano: 'Ano' }[rd.mode] || 'Dia', fem = per === 'Semana';
  let good = pick(V_GOOD[best], r), bad = pick(V_BAD[worst], r);
  if (rd.mode === 'dia') {
    const s = skyFor(ST.date);
    if (best === 'dinheiro' && [2, 8, 11].includes(rd.H.jupiter)) good = 'Júpiter a favor, algo em que investiste vai dar frutos';
    else if (best === 'amor' && [1, 5, 7, 11].includes(rd.H.venus)) good = 'Vénus a favor, o amor está do teu lado';
    else if (best === 'trabalho' && [6, 10].includes(rd.H.jupiter)) good = 'Júpiter abre portas no trabalho';
    if (worst === 'trabalho' && s.mercury.rx) bad = 'Mercúrio retrógrado, revê tudo antes de enviar ou assinar';
    else if (worst === 'amor' && s.venus.rx) bad = 'Vénus retrógrada, não reabras feridas antigas';
    else if (worst === 'energia' && rd.H.saturn === 1) bad = 'Saturno pesa no teu signo, descansa mais';
    else if (worst === 'dinheiro' && [2, 8].includes(rd.H.mars)) bad = 'Marte mexe no dinheiro, nada de compras por impulso';
  }
  if (rd.overall >= 70) return { k: 'bom', col: '#7ee0a6', icon: '✓', txt: `${per} bo${fem ? 'a' : 'm'}: ${good}.` };
  if (rd.overall <= 50 || rd.area[worst] <= 40) return { k: 'cuidado', col: '#ffb36b', icon: '!', txt: `${per} de cuidado: ${bad}.` };
  return { k: 'misto', col: '#ffe3a3', icon: '≈', txt: `Aposta ${AREA_N[best]}, cuidado ${AREA_N[worst]}.` };
}
function dayAlert() {
  const avgAll = ST.rank.reduce((a, r) => a + r.overall, 0) / 12;
  if (ST.mode !== 'dia') { const hi = (ST.rank[0].highlights || []).find(h => /Eclipse|Lua Nova|Lua Cheia|retrógrad/.test(h)); return (avgAll >= 64 ? 'Período de boas energias para a maioria dos signos.' : avgAll <= 54 ? 'Período exigente: paciência e prudência.' : 'Período misto: escolhe bem as batalhas.') + (hi ? ' ' + plainEmoji(hi).replace(/:.*$/, '') + '.' : ''); }
  const s = skyFor(ST.date), asp = dayAspects(ST.date, ST.modern), tense = asp.filter(a => a.asp === 'quad' || a.asp === 'opo').length, harm = asp.filter(a => a.asp === 'tri' || a.asp === 'sext').length;
  const sc = avgAll + 3 * harm - 3 * tense - (s.mercury.rx ? 2 : 0);
  let t = sc >= 66 ? 'Dia de boas energias: bom para avançar com o que queres.' : sc <= 54 ? 'Dia exigente: calma nas palavras e nas decisões.' : 'Dia misto: escolhe bem as batalhas.';
  const ph = moonPhaseName(s.phase.elong);
  if (asp.length) t += ' ' + asp[0].mean;
  else if (ph === 'Lua Cheia') t += ' Lua Cheia: emoções ao rubro.';
  else if (ph === 'Lua Nova') t += ' Lua Nova: bom para começar.';
  else if (s.mercury.rx) t += ' Mercúrio retrógrado: confirma tudo duas vezes.';
  return t;
}
const BLOCK_H = S => S ? 412 : 380;
function drawBlock(ctx, rd, i, x, y, w, S) {
  const h = BLOCK_H(S) - 16, elc = EL_COL[rd.sign.el][0], V = verdict(rd);
  ctx.fillStyle = i < 3 ? ['#f2c76e1c', '#cfd8e314', '#d0895a18'][i] : '#ffffff0d'; rr(ctx, x, y, w, h, 22); ctx.fill();
  ctx.strokeStyle = (i < 3 ? ['#f2c76e', '#dfe6ee', '#e0a070'][i] : elc) + '55'; ctx.lineWidth = 2; ctx.stroke();
  // cabeçalho
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillStyle = i < 3 ? ['#f2c76e', '#dfe6ee', '#e0a070'][i] : '#2b2d63'; ctx.beginPath(); ctx.arc(x + 46, y + 46, 26, 0, 7); ctx.fill();
  ctx.fillStyle = i < 3 ? '#1a1206' : '#fff'; ctx.font = '800 26px Manrope'; ctx.fillText(String(i + 1), x + 46, y + 47);
  ctx.fillStyle = elc; ctx.font = `46px ${SYMF}`; ctx.fillText(rd.sign.g + VS, x + 116, y + 48);
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '700 32px Cinzel'; ctx.fillText(rd.sign.n.toUpperCase(), x + 160, y + 38);
  ctx.fillStyle = '#a9a9d6'; ctx.font = '600 19px Manrope'; ctx.fillText(rd.sign.r + ' · ' + rd.keyword, x + 160, y + 68);
  stars(ctx, x + w - 26, y + 46, toStars(rd.overall), 14, 'right');
  // aviso
  ctx.fillStyle = V.col + '22'; rr(ctx, x + 22, y + 84, w - 44, 44, 14); ctx.fill();
  ctx.fillStyle = V.col; ctx.font = '800 23px Manrope'; ctx.fillText(V.icon, x + 42, y + 107); wrap(ctx, V.txt, x + 70, y + 107, w - 110, 26, 1);
  // frase
  ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 30px "Cormorant Garamond"'; wrap(ctx, '“' + rd.headline + '”', x + 26, y + (S ? 158 : 152), w - 52, 30, 1);
  ctx.textBaseline = 'alphabetic';
  // grelha 2x2
  const gx = x + 22, gy = y + (S ? 176 : 168), gw = (w - 44 - 12) / 2, gh = S ? 86 : 74;
  AREAS4(rd).map(([l, k, t]) => [l.toUpperCase(), k, t]).forEach(([l, k, t], j) => {
    const bx = gx + (j % 2) * (gw + 12), by = gy + Math.floor(j / 2) * (gh + 10);
    ctx.fillStyle = '#ffffff0f'; rr(ctx, bx, by, gw, gh, 14); ctx.fill();
    ctx.fillStyle = elc; ctx.font = '800 17px Manrope'; ctx.fillText(l, bx + 16, by + 27);
    stars(ctx, bx + gw - 14, by + 21, rd.stars[k], 9, 'right');
    ctx.fillStyle = '#e6e6fb'; ctx.font = '500 18px Manrope'; wrap(ctx, firstSentence(t), bx + 16, by + 52, gw - 30, 21, S ? 2 : 1);
  });
  // rodapé do bloco
  const fy = gy + 2 * gh + 10 + 28; ctx.fillStyle = '#c9c9ee'; ctx.font = `600 19px Manrope, ${SYMF}`; ctx.textAlign = 'center';
  const extra = rd.mode === 'dia' ? `Sorte ${rd.lucky}  ·  Cor ${PL[rd.fav].cor.toLowerCase()}  ·  Astro ${PL[rd.fav].g}${VS} ${PL[rd.fav].n}  ·  Aliado ${SIGNS[rd.ally].g}${VS} ${SIGNS[rd.ally].n}`
    : `${rd.mode === 'ano' ? 'Melhor mês' : 'Melhor dia'}: ${rd.bestDay}  ·  Amor: ${rd.bestLove}  ·  Cor ${PL[rd.fav].cor.toLowerCase()}  ·  Aliado ${SIGNS[rd.ally].n}`;
  ctx.fillText(extra, x + w / 2, fy); ctx.textAlign = 'left';
}
function drawPage(from, to, pageNo, pages) {
  const [c, ctx, W, H, S] = mk();
  bg(ctx, W, H, ST.date + ST.mode + 'pg' + pageNo, ['#5a4cff', '#1d1a5a']);
  header(ctx, W, S, S ? 120 : 56);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 34px Cinzel'; ctx.fillText(`${topTitle()} · ${from + 1}º a ${to}º`, W / 2, S ? 186 : 104);
  let y = S ? 230 : 128;
  if (pageNo === 1) {
    const ah = S ? 92 : 44; ctx.fillStyle = '#ffe3a31c'; rr(ctx, 48, y - 4, W - 96, ah, 14); ctx.fill();
    ctx.fillStyle = '#ffe3a3'; ctx.font = `700 ${S ? 23 : 20}px Manrope`; let al = '📣 ' + dayAlert(); if (!S && ctx.measureText(al).width > W - 130) al = al.split(/(?<=\.) /)[0]; wrap(ctx, al, W / 2, y + (S ? 32 : 26), W - 130, 28, S ? 2 : 1, 'center');
    y += ah + 8;
  }
  ctx.textAlign = 'left';
  for (let i = from; i < to; i++) { drawBlock(ctx, ST.rank[i], i, 48, y, W - 96, S); y += BLOCK_H(S); }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 22px Manrope';
  ctx.fillText(pageNo < pages ? `Continua → ${to + 1}º a ${Math.min(12, to + (to - from))}º` : 'Segue ' + brand() + ' · todos os dias', W / 2, H - (S ? 190 : 22));
  ctx.textAlign = 'left';
  return c;
}
function drawLong() {
  const W = 1080, head = 330, H = head + 12 * BLOCK_H(false) + 110, c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  bg(ctx, W, H, ST.date + ST.mode + 'long', ['#5a4cff', '#1d1a5a']);
  titleBlock(ctx, W, false, topTitle(), periodLabel(), skyShort(), 70);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe3a3'; ctx.font = '600 24px Manrope'; wrap(ctx, dayAlert(), W / 2, 288, W - 140, 28, 2, 'center');
  let y = head + 20; for (let i = 0; i < 12; i++) { drawBlock(ctx, ST.rank[i], i, 48, y, W - 96, false); y += BLOCK_H(false); }
  footer(ctx, W, H, false, 'Comenta o teu signo 👇  ·  Segue ' + brand());
  return c;
}
function capTop() {
  const L = [];
  L.push(`🏆 ${topTitle()} · ${periodLabel().toUpperCase()}`);
  L.push(`🌌 ${skyShort()}`);
  if (ST.mode === 'dia') { const s = skyFor(ST.date); if (s.moonIngress) L.push(`☽ A Lua entra em ${SIGN_IN[s.moonIngress.to]} às ${fmtHM(+s.moonIngress.time, city()[3])}`); dayAspects(ST.date, ST.modern).slice(0, 2).forEach(a => L.push(`✨ ${a.txt}: ${a.mean}`)); }
  else { const hi = (ST.rank[0].highlights || []).filter(h => /Lua|Eclipse|retrógrad|frente|Júpiter entra|Saturno entra/.test(h)).map(h => h.replace(/:.*$/, '')); if (hi.length) L.push('📅 ' + hi.join(' · ')); }
  L.push(`📣 ${dayAlert()}`, '👇 Desliza até ao teu signo: aviso, amor, trabalho, dinheiro, energia, sorte e cor.', '');
  ST.rank.forEach((rd, i) => L.push(`${MEDAL[i] || (i + 1) + 'º'} ${rd.sign.g} ${rd.sign.n} ${starStr(toStars(rd.overall))} — ${rd.headline}`));
  L.push('', '💬 Em que lugar ficou o teu signo? Comenta 👇 e marca alguém!', `👉 Segue ${brand()} para não perderes nenhum dia.`, '', '━━━━━━━━  TUDO SOBRE O TEU SIGNO  ━━━━━━━━');
  ST.rank.forEach((rd, i) => {
    L.push('', `${rd.sign.g} ${rd.sign.n.toUpperCase()} · ${i + 1}º lugar`, `${{ bom: '✅', misto: '⚖️', cuidado: '⚠️' }[verdict(rd).k]} ${verdict(rd).txt}`);
    { const L4 = AREA_LBL(rd); L.push(`${rd.pet ? '🥰' : '❤️'} ${L4.amor} ${starStr(rd.stars.amor)} ${rd.love}`, `${rd.pet ? '🎾' : '💼'} ${L4.trabalho} ${starStr(rd.stars.trabalho)} ${rd.work}`, `${rd.pet ? '🍖' : '💰'} ${L4.dinheiro} ${starStr(rd.stars.dinheiro)} ${rd.money}`, `${rd.pet ? '🐾' : '⚡'} ${L4.energia} ${starStr(rd.stars.energia)} ${rd.energy}`); }
    if (rd.highlights && rd.highlights.length) L.push(rd.highlights.slice(0, 2).join('\n'));
    L.push(`🔮 ${rd.advice}`);
    L.push(rd.mode === 'dia' ? `🍀 Sorte ${rd.lucky} · 🎨 ${PL[rd.fav].cor} · ${PL[rd.fav].g} Astro: ${PL[rd.fav].n} · 🤝 ${SIGNS[rd.ally].n}` : `📆 ${rd.mode === 'ano' ? 'Melhor mês' : 'Melhor dia'}: ${rd.bestDay} · ❤️ ${rd.bestLove} · 🎨 ${PL[rd.fav].cor} · 🤝 ${SIGNS[rd.ally].n}`);
  });
  L.push('', '#horoscopo #signos #astrologia #horoscopododia #zodiaco');
  return L.join('\n');
}

// ---------- PARES ----------
function drawPairsTop(P) {
  const [c, ctx, W, H, S] = mk();
  bg(ctx, W, H, ST.date + 'pares', ['#ff5a8a', '#5c1638']);
  titleBlock(ctx, W, S, 'QUEM COMBINA HOJE', niceDate(ST.date), skyShort(), S ? 170 : 78);
  let y = S ? 440 : 300; const cardH = S ? 300 : 232;
  P.top.forEach((p, i) => {
    const x = 60, w = W - 120;
    ctx.fillStyle = ['#f2c76e22', '#cfd8e318', '#d0895a1c'][i]; rr(ctx, x, y, w, cardH - 22, 24); ctx.fill(); ctx.strokeStyle = ['#f2c76e', '#dfe6ee', '#e0a070'][i] + '88'; ctx.lineWidth = 2; ctx.stroke();
    const cy = y + (cardH - 22) / 2 - 18; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${S ? 96 : 80}px ${SYMF}`; ctx.fillStyle = EL_COL[SIGNS[p.a].el][0]; ctx.fillText(SIGNS[p.a].g + VS, W / 2 - 170, cy);
    ctx.fillStyle = EL_COL[SIGNS[p.b].el][0]; ctx.fillText(SIGNS[p.b].g + VS, W / 2 + 170, cy);
    ctx.fillStyle = '#ff6b98'; ctx.font = `800 ${S ? 76 : 64}px Manrope`; ctx.fillText(p.score + '%', W / 2, cy);
    ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.font = `700 ${S ? 34 : 30}px Cinzel`; ctx.fillText(`${SIGNS[p.a].n.toUpperCase()} + ${SIGNS[p.b].n.toUpperCase()}`, W / 2, cy + (S ? 92 : 76));
    ctx.fillStyle = '#c9c9ee'; ctx.font = `500 ${S ? 25 : 22}px Manrope`; ctx.fillText(cap1(PAIR_TXT[p.k]), W / 2, cy + (S ? 132 : 108));
    ctx.textAlign = 'left'; y += cardH;
  });
  const w = P.worst; ctx.textAlign = 'center'; ctx.fillStyle = '#a9a9d6'; ctx.font = `600 ${S ? 27 : 24}px Manrope, ${SYMF}`;
  ctx.fillText(`Paciência hoje: ${SIGNS[w.a].g}${VS} ${SIGNS[w.a].n} + ${SIGNS[w.b].g}${VS} ${SIGNS[w.b].n} (${w.score}%)`, W / 2, y + (S ? 40 : 26));
  footer(ctx, W, H, S, 'Marca o teu par 💞  ·  Segue ' + brand());
  return c;
}
function drawPairsList(P) {
  const [c, ctx, W, H, S] = mk();
  bg(ctx, W, H, ST.date + 'pares2', ['#ff5a8a', '#3a1238']);
  titleBlock(ctx, W, S, 'O TEU PAR DE HOJE', niceDate(ST.date), 'Com quem o teu signo combina melhor hoje', S ? 170 : 78);
  const top = S ? 420 : 280, rowH = (H - top - (S ? 330 : 104)) / 12;
  P.best.forEach((p, i) => {
    const o = p.a === i ? p.b : p.a, y = top + i * rowH, cy = y + rowH / 2;
    ctx.fillStyle = i % 2 ? '#ffffff08' : '#ffffff10'; rr(ctx, 60, y + 3, W - 120, rowH - 6, 16); ctx.fill();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.font = `${S ? 46 : 38}px ${SYMF}`; ctx.fillStyle = EL_COL[SIGNS[i].el][0]; ctx.fillText(SIGNS[i].g + VS, 92, cy);
    ctx.fillStyle = '#fff'; ctx.font = `700 ${S ? 30 : 26}px Cinzel`; ctx.fillText(SIGNS[i].n.toUpperCase(), 150, cy);
    ctx.fillStyle = '#ff6b98'; ctx.font = `800 ${S ? 30 : 26}px Manrope`; ctx.textAlign = 'center'; ctx.fillText('♥', W / 2 + 40, cy);
    ctx.textAlign = 'left'; ctx.font = `${S ? 46 : 38}px ${SYMF}`; ctx.fillStyle = EL_COL[SIGNS[o].el][0]; ctx.fillText(SIGNS[o].g + VS, W / 2 + 90, cy);
    ctx.fillStyle = '#e6e6fb'; ctx.font = `600 ${S ? 28 : 24}px Manrope`; ctx.fillText(SIGNS[o].n, W / 2 + 145, cy);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffb3c9'; ctx.font = `800 ${S ? 30 : 26}px Manrope`; ctx.fillText(p.score + '%', W - 84, cy);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  });
  footer(ctx, W, H, S, 'Marca o teu par 💞  ·  Segue ' + brand());
  return c;
}
function capPairs(P) {
  const L = [`💞 QUEM COMBINA HOJE · ${niceDate(ST.date).toUpperCase()}`, `🌌 ${skyShort()}`, ''];
  P.top.forEach((p, i) => L.push(`${MEDAL[i]} ${SIGNS[p.a].g} ${SIGNS[p.a].n} + ${SIGNS[p.b].g} ${SIGNS[p.b].n} — ${p.score}% · ${PAIR_TXT[p.k]}`));
  L.push(`⚠️ Paciência: ${SIGNS[P.worst.a].n} + ${SIGNS[P.worst.b].n} (${P.worst.score}%)`, '', '❤️ O PAR IDEAL DE CADA SIGNO HOJE');
  P.best.forEach((p, i) => { const o = p.a === i ? p.b : p.a; L.push(`${SIGNS[i].g} ${SIGNS[i].n} → ${SIGNS[o].g} ${SIGNS[o].n} (${p.score}%)`); });
  L.push('', '👇 Marca o teu par nos comentários e diz-nos se bate certo!', `👉 Segue ${brand()} para o teu horóscopo todos os dias.`, '', '#compatibilidade #signos #amor #astrologia #horoscopo');
  return L.join('\n');
}

// ---------- LUA ----------
function drawLuaDay() {
  const [c, ctx, W, H, S] = mk(), D = lunarDay(ST.date), elc = EL_COL[D.el];
  bg(ctx, W, H, ST.date + 'lua', ['#cfd8e3', '#1d2547']);
  header(ctx, W, S, S ? 130 : 84, niceDate(ST.date));
  const my = S ? 400 : 270; drawMoon(ctx, W / 2, my, S ? 150 : 120, D.e);
  let y = my + (S ? 250 : 200); ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = '700 70px Cinzel'; ctx.fillText('LUA EM ' + SIGN_IN[D.sign].toUpperCase(), W / 2, y);
  y += 46; ctx.fillStyle = '#c9c9ee'; ctx.font = '600 27px Manrope'; ctx.fillText(`${D.ph} · ${Math.round(D.s.phase.illum * 100)}% iluminada${D.ingress ? ' · entra em ' + SIGN_IN[D.ingress.to] + ' às ' + fmtHM(+D.ingress.time, city()[3]) : ''}`, W / 2, y);
  y += S ? 80 : 62;
  ctx.fillStyle = elc[0] + '33'; const tw = 520; rr(ctx, W / 2 - tw / 2, y - 44, tw, 66, 33); ctx.fill();
  ctx.fillStyle = elc[0]; ctx.font = '800 30px Manrope'; ctx.fillText(D.type[0].toUpperCase(), W / 2, y);
  y += 50; ctx.fillStyle = '#d8d8f4'; ctx.font = '500 24px Manrope'; ctx.fillText('Semear: ' + D.type[1], W / 2, y);
  y += S ? 80 : 56; ctx.textAlign = 'left';
  const box = (title, items, col, mark) => {
    const h = 56 + items.length * (S ? 50 : 42);
    ctx.fillStyle = '#ffffff10'; rr(ctx, 60, y, W - 120, h, 20); ctx.fill();
    ctx.fillStyle = col; ctx.font = '800 22px Manrope'; ctx.fillText(title, 92, y + 40);
    ctx.font = `600 ${S ? 28 : 25}px Manrope, ${SYMF}`; ctx.fillStyle = '#eee';
    items.forEach((t, i) => { ctx.fillStyle = col; ctx.fillText(mark, 92, y + 84 + i * (S ? 50 : 42)); ctx.fillStyle = '#ececfb'; ctx.fillText(t, 132, y + 84 + i * (S ? 50 : 42)); });
    y += h + 16;
  };
  box('CABELO', [D.hair], '#ffe3a3', '✂');
  box('BOM PARA', D.good, '#7ee0a6', '✓');
  if (D.bad.length) box('EVITAR', D.bad, '#ff8fa3', '✕');
  const nx = eventsBetween(ST.date, dayStr(noonJd(ST.date) + 30), false, true).filter(e => e.type === 'lua').slice(0, 3);
  if (nx.length && y < H - (S ? 420 : 240)) box('PRÓXIMAS FASES', nx.map(e => `${{ nova: 'Lua Nova', crescente: 'Quarto Crescente', cheia: 'Lua Cheia', minguante: 'Quarto Minguante' }[e.kind]}${e.eclipse ? ' (eclipse)' : ''} · ${new Date(msFromJd(e.jd)).getUTCDate()} ${MESES[new Date(msFromJd(e.jd)).getUTCMonth()].slice(0, 3)} · ${SIGN_IN[e.sign]}`), '#cfd8e3', '•');
  footer(ctx, W, H, S, 'Calendário lunar · Segue ' + brand());
  return c;
}
function drawLuaMonth() {
  const [c, ctx, W, H, S] = mk(), [y0, m0] = dParts(ST.date);
  bg(ctx, W, H, ST.date.slice(0, 7) + 'luames', ['#cfd8e3', '#1d2547']);
  titleBlock(ctx, W, S, 'CALENDÁRIO LUNAR', cap1(MESES[m0 - 1]) + ' ' + y0, 'Fases reais da Lua · dias de raiz, folha, flor e fruto', S ? 170 : 70);
  const days = daysIn(...periodRange(ST.date, 'mes')), first = (new Date(Date.UTC(y0, m0 - 1, 1)).getUTCDay() + 6) % 7, rows = Math.ceil((first + days.length) / 7);
  const top = S ? 470 : 300, P = 40, cw = (W - 2 * P) / 7, legendH = S ? 300 : 150, ch = Math.min(S ? 190 : 140, (H - top - legendH - (S ? 230 : 40)) / rows);
  ctx.textAlign = 'center'; ctx.fillStyle = '#9b9cc9'; ctx.font = '800 20px Manrope';
  ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].forEach((d, i) => ctx.fillText(d, P + cw * i + cw / 2, top - 16));
  const evs = periodEvents(...periodRange(ST.date, 'mes'), false).filter(e => e.type === 'lua');
  days.forEach((d, i) => {
    const k = first + i, x = P + (k % 7) * cw, y = top + Math.floor(k / 7) * ch, D = lunarDay(d), col = EL_COL[D.el][0];
    ctx.fillStyle = '#ffffff0c'; rr(ctx, x + 4, y + 4, cw - 8, ch - 8, 12); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(x + 4, y + ch - 12, cw - 8, 8);
    ctx.fillStyle = '#fff'; ctx.font = '700 24px Manrope'; ctx.textAlign = 'left'; ctx.fillText(String(+d.slice(8)), x + 14, y + 34);
    drawMoon(ctx, x + cw / 2, y + ch / 2 + 6, Math.min(cw, ch) * .2, D.e);
    const ev = evs.find(e => dayStr(e.jd) === d && (e.kind === 'nova' || e.kind === 'cheia'));
    if (ev) { ctx.fillStyle = '#ffe3a3'; ctx.font = '800 15px Manrope'; ctx.textAlign = 'right'; ctx.fillText(ev.eclipse ? 'ECLIPSE' : ev.kind === 'nova' ? 'NOVA' : 'CHEIA', x + cw - 12, y + 30); }
    if (D.hairGood) { ctx.fillStyle = '#ffe3a3'; ctx.font = `22px ${SYMF}`; ctx.textAlign = 'right'; ctx.fillText('✂', x + cw - 12, y + ch - 20); }
  });
  let ly = top + rows * ch + (S ? 60 : 40); ctx.textAlign = 'left'; ctx.font = '600 23px Manrope';
  const leg = [['fogo', 'Fruto'], ['terra', 'Raiz'], ['ar', 'Flor'], ['agua', 'Folha']];
  leg.forEach(([el, t], i) => { const x = 70 + i * 245; ctx.fillStyle = EL_COL[el][0]; ctx.fillRect(x, ly - 16, 34, 14); ctx.fillStyle = '#ddd'; ctx.fillText('Dia de ' + t.toLowerCase(), x + 46, ly); });
  ly += 44; ctx.fillStyle = '#ffe3a3'; ctx.font = `600 23px Manrope, ${SYMF}`; ctx.fillText('✂ melhores dias para cortar o cabelo (crescer forte)', 70, ly);
  footer(ctx, W, H, S, 'Guarda e partilha · Segue ' + brand());
  return c;
}
function capLuaDay() {
  const D = lunarDay(ST.date);
  return [`🌙 LUA DE HOJE · ${niceDate(ST.date).toUpperCase()}`, `${D.ph} em ${SIGN_IN[D.sign]} (${Math.round(D.s.phase.illum * 100)}% iluminada)${D.ingress ? ` · entra em ${SIGN_IN[D.ingress.to]} às ${fmtHM(+D.ingress.time, city()[3])}` : ''}`, '',
    `🌱 ${D.type[0]}: bom para semear ${D.type[1]}.`, `✂️ Cabelo: ${D.hair}.`, '', '✅ Bom para:', ...D.good.map(g => '• ' + g), ...(D.bad.length ? ['', '⛔ Evitar:', ...D.bad.map(g => '• ' + g)] : []), '',
    '💬 Também segues a Lua para cortar o cabelo ou semear? Conta-nos 👇', `👉 Segue ${brand()} para o calendário lunar todos os dias.`, '', '#calendariolunar #lua #fasesdalua #horta #astrologia'].join('\n');
}
function capLuaMonth() {
  const [a, b] = periodRange(ST.date, 'mes'), days = daysIn(a, b), ev = periodEvents(a, b, false).filter(e => e.type === 'lua');
  const L = [`🌙 CALENDÁRIO LUNAR · ${periodLabel('mes').toUpperCase()}`, ''];
  ev.forEach(e => L.push(`${{ nova: '🌑 Lua Nova', crescente: '🌓 Quarto Crescente', cheia: '🌕 Lua Cheia', minguante: '🌗 Quarto Minguante' }[e.kind]}${e.eclipse ? ' (eclipse ' + e.eclipse + ')' : ''}: dia ${new Date(msFromJd(e.jd)).getUTCDate()}, em ${SIGN_IN[e.sign]}`));
  const hair = days.filter(d => lunarDay(d).hairGood).map(d => +d.slice(8));
  L.push('', `✂️ Melhores dias para cortar o cabelo: ${hair.join(', ') || '—'}`);
  for (const [el, nm] of [['terra', 'raiz 🥕'], ['agua', 'folha 🥬'], ['fogo', 'fruto 🍅'], ['ar', 'flor 🌸']]) L.push(`🌱 Dias de ${nm}: ${days.filter(d => lunarDay(d).el === el).map(d => +d.slice(8)).join(', ')}`);
  L.push('', '📌 Guarda este calendário para usares o mês todo!', `👉 Segue ${brand()}`, '', '#calendariolunar #fasesdalua #lua #horta');
  return L.join('\n');
}

// ---------- ANIVERSÁRIOS ----------
function drawBirthday() {
  const [c, ctx, W, H, S] = mk(), B = birthday(ST.date, ST.modern), sg = SIGNS[B.si], elc = EL_COL[sg.el];
  bg(ctx, W, H, ST.date + 'anos', elc);
  header(ctx, W, S, S ? 130 : 84, niceDate(ST.date));
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 52px "Cormorant Garamond"'; ctx.fillText('Se fazes anos hoje…', W / 2, S ? 260 : 180);
  ctx.fillStyle = '#fff'; ctx.font = '700 84px Cinzel'; ctx.fillText('PARABÉNS!', W / 2, S ? 360 : 270);
  const gy = S ? 560 : 420; ctx.strokeStyle = elc[0]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, gy, 92, 0, 7); ctx.stroke();
  ctx.fillStyle = '#fff6e0'; ctx.font = `100px ${SYMF}`; ctx.textBaseline = 'middle'; ctx.fillText(sg.g + VS, W / 2, gy + 6); ctx.textBaseline = 'alphabetic';
  let y = gy + 150; ctx.fillStyle = '#c9c9ee'; ctx.font = '600 27px Manrope'; ctx.fillText(`Sol a ${B.deg}° de ${sg.n} · o teu novo ano astral`, W / 2, y);
  y += 70; ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 50px "Cormorant Garamond"'; y = wrap(ctx, '“' + B.headline + '”', W / 2, y, W - 140, 56, 2, 'center') + 30;
  ctx.textAlign = 'left'; ctx.font = `500 ${S ? 28 : 25}px Manrope`;
  const items = [['SORTE', B.lines[0]], ['ESFORÇO', B.lines[1]], ['AMOR', `Melhores meses: ${B.best.amor.join(' e ')}`], ['TRABALHO', `Melhores meses: ${B.best.trabalho.join(' e ')}`], ['DINHEIRO', `Melhores meses: ${B.best.dinheiro.join(' e ')}`]];
  for (const [l, t] of items) {
    const h = S ? 112 : 92; ctx.fillStyle = '#ffffff10'; rr(ctx, 60, y, W - 120, h - 12, 16); ctx.fill();
    ctx.fillStyle = elc[0]; ctx.font = '800 20px Manrope'; ctx.fillText(l, 88, y + 32);
    ctx.fillStyle = '#ececfb'; ctx.font = `500 ${S ? 26 : 24}px Manrope`; wrap(ctx, plainEmoji(t), 88, y + 66, W - 176, 30, 1);
    y += h;
  }
  footer(ctx, W, H, S, 'Marca quem faz anos hoje 🎂  ·  Segue ' + brand());
  return c;
}
function capBirthday() {
  const B = birthday(ST.date, ST.modern), sg = SIGNS[B.si];
  return [`🎂 SE FAZES ANOS HOJE (${niceDate(ST.date)})`, `Parabéns, ${sg.n} ${sg.g}! O teu novo ano astral começa hoje, com o Sol a ${B.deg}° de ${sg.n}.`, '', `✨ ${B.headline}`, ...B.lines, '', '🎁 Marca nos comentários quem faz anos hoje e oferece-lhe esta previsão!', `👉 Segue ${brand()}`, '', `#parabens #aniversario #${sg.tag} #signos #astrologia`].join('\n');
}

// ---------- HORAS ----------
function drawHours() {
  const [c, ctx, W, H, S] = mk(), ci = city(), PH = planetaryHours(ST.date, ci);
  bg(ctx, W, H, ST.date + 'horas', ['#f5c542', '#3d2a0a']);
  titleBlock(ctx, W, S, 'HORAS PLANETÁRIAS', niceDate(ST.date), PH ? `${ci[0]} · nascer do sol ${fmtHM(PH.rise, ci[3])} · pôr do sol ${fmtHM(PH.set, ci[3])}` : ci[0], S ? 170 : 78);
  if (!PH) return c;
  let y = S ? 450 : 300; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe3a3'; ctx.font = '700 28px Manrope, ' + SYMF;
  ctx.fillText(`Dia de ${PL[PH.ruler].n} ${PL[PH.ruler].g}${VS} — a tradição mais antiga dos astros`, W / 2, y); y += S ? 60 : 40;
  const rowH = S ? 165 : 128;
  for (const p of ['venus', 'jupiter', 'mercury', 'sun', 'mars', 'moon', 'saturn']) {
    const hs = PH.hours.filter(h => h.p === p && h.start > PH.rise - 1).slice(0, 4);
    ctx.fillStyle = '#ffffff10'; rr(ctx, 60, y, W - 120, rowH - 14, 18); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = PL[p].hex; ctx.font = `56px ${SYMF}`; ctx.fillText(PL[p].g + VS, 125, y + (rowH - 14) / 2); ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `700 ${S ? 30 : 27}px Cinzel`; ctx.fillText(`${PL[p].n.toUpperCase()}`, 185, y + 44);
    ctx.fillStyle = '#c9c9ee'; ctx.font = `500 ${S ? 24 : 21}px Manrope`; ctx.fillText('para ' + HOUR_USE[p], 185 + ctx.measureText('').width, y + 44 + (S ? 38 : 32));
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffe3a3'; ctx.font = `700 ${S ? 27 : 24}px Manrope`;
    const times = hs.map(h => fmtHM(h.start, ci[3]));
    ctx.fillText(times.slice(0, 2).join('  ·  '), W - 90, y + 44); if (times.length > 2) ctx.fillText(times.slice(2).join('  ·  '), W - 90, y + 44 + (S ? 38 : 32));
    ctx.textAlign = 'left'; y += rowH;
  }
  footer(ctx, W, H, S, 'Usa a hora certa · Segue ' + brand());
  return c;
}
function capHours() {
  const ci = city(), PH = planetaryHours(ST.date, ci); if (!PH) return '';
  const L = [`⏳ HORAS PLANETÁRIAS · ${niceDate(ST.date).toUpperCase()}`, `📍 ${ci[0]} · ☀️ nascer ${fmtHM(PH.rise, ci[3])} · 🌇 pôr ${fmtHM(PH.set, ci[3])}`, `Hoje é dia de ${PL[PH.ruler].n} ${PL[PH.ruler].g}. Cada hora do dia é regida por um astro, como faziam os antigos.`, ''];
  for (const p of ['venus', 'jupiter', 'mercury', 'sun', 'mars', 'moon', 'saturn']) L.push(`${PL[p].g} ${PL[p].n} (${HOUR_USE[p]}): ${PH.hours.filter(h => h.p === p).map(h => fmtHM(h.start, ci[3]) + '–' + fmtHM(h.end, ci[3])).join(', ')}`);
  L.push('', '💡 Queres pedir um aumento? Usa a hora de Júpiter. Um encontro? A hora de Vénus.', `👉 Segue ${brand()}`, '', '#horasplanetarias #astrologia #signos #horoscopo');
  return L.join('\n');
}

// ---------- Montar o post ----------
function computeTop() {
  ST.reads = ST.mode === 'ano' ? yearReads(+ST.date.slice(0, 4), ST.modern) : SIGNS.map((_, i) => readAny(i, ST.date, ST.mode, ST.modern));
  ST.rank = ST.reads.slice().sort((a, b) => b.overall - a.overall || (b.area.amor + b.area.dinheiro) - (a.area.amor + a.area.dinheiro) || a.si - b.si);

  if (ST.pets) ST.rank = ST.rank.map(petize);
}
function buildPost(type = ST.type) {
  if (type === 'top') {
    computeTop();
    if (ST.fmt === 'longa') return { cs: [{ name: 'top-completo', c: drawLong() }], cap: capTop() };
    const cs = ST.cover ? [{ name: '00-top', c: drawTop() }] : [], per = 3, pages = 4;
    for (let p = 0; p < pages; p++) cs.push({ name: `0${p + 1}-signos-${p * per + 1}-${(p + 1) * per}`, c: drawPage(p * per, (p + 1) * per, p + 1, pages) });
    if (ST.sky && ST.mode !== 'ano') cs.push({ name: '09-ceu', c: drawSky() });
    return { cs, cap: capTop() };
  }
  if (type === 'pares') { const P = pairsDay(ST.date, ST.modern); return { cs: [{ name: '01-quem-combina', c: drawPairsTop(P) }, { name: '02-par-de-cada-signo', c: drawPairsList(P) }], cap: capPairs(P) }; }
  if (type === 'lua') return ST.mode === 'mes' ? { cs: [{ name: 'calendario-lunar', c: drawLuaMonth() }], cap: capLuaMonth() } : { cs: [{ name: 'lua-de-hoje', c: drawLuaDay() }], cap: capLuaDay() };
  if (type === 'anos') return { cs: [{ name: 'parabens', c: drawBirthday() }], cap: capBirthday() };
  if (type === 'horas') return { cs: [{ name: 'horas-planetarias', c: drawHours() }], cap: capHours() };
}
function renderLegacy() { // antigo, substituído por render() em ui.js
  if (!TYPE_MODES[ST.type].includes(ST.mode)) ST.mode = TYPE_MODES[ST.type][0];
  document.querySelectorAll('#types button').forEach(b => b.classList.toggle('on', b.dataset.t === ST.type));
  document.querySelectorAll('#modes button').forEach(b => { b.hidden = !TYPE_MODES[ST.type].includes(b.dataset.m); b.classList.toggle('on', b.dataset.m === ST.mode); });
  $('#modes').hidden = TYPE_MODES[ST.type].length < 2;
  $('#when').textContent = periodLabel();
  const { cs, cap } = buildPost(); ST.canvases = cs; ST.cap = cap;
  const strip = $('#strip'); strip.innerHTML = '';
  cs.forEach((x, i) => { const im = new Image(); im.src = stampOnce(x.c).toDataURL('image/jpeg', .9); im.alt = x.name; im.className = ST.fmt; im.onclick = () => openViewer(i); strip.appendChild(im); });
  $('#count').textContent = cs.length + (cs.length > 1 ? ' fotos' : ' foto');
  $('#reel').hidden = ST.type !== 'top';
  $('#sum').innerHTML = ST.type === 'top' ? `<b>${ST.rank[0].sign.g}&#xFE0E; ${ST.rank[0].sign.n}</b> lidera · <span>${skyShort()}</span>` : `<span>${skyShort()}</span>`;
  $('#cap').value = cap;
}

// ---------- Partilhar / guardar ----------
// assinatura fixa em tudo o que sai da app (imagens, PDFs e vídeos): «✦ ceudehoje.com»
const SITE_MARK = '✦ ceudehoje.com';
function stampMark(ctx, W, H) {
  const fs = Math.max(14, Math.round(W * .019)); ctx.save(); ctx.globalAlpha = 1; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.font = `600 ${fs}px Manrope, sans-serif`;
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, fs * .22); ctx.strokeStyle = 'rgba(10,6,30,.55)'; const y = H - Math.max(12, Math.round(fs * .9)), x = W - Math.round(W * .03);
  ctx.strokeText(SITE_MARK, x, y); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(SITE_MARK, x, y); ctx.restore();
}
function stampOnce(c) { if (c && !c._stamped) { try { stampMark(c.getContext('2d'), c.width, c.height); c._stamped = 1; } catch (e) { } } return c; }
const blobOf = (c, q = .92) => new Promise(r => stampOnce(c).toBlob(r, 'image/jpeg', q));
function copySync(txt) { const ta = $('#cap'); ta.value = txt; ta.focus(); ta.select(); try { return document.execCommand('copy'); } catch (e) { return false; } }
async function copyCap() { try { await navigator.clipboard.writeText(ST.cap); toast('Legenda copiada'); } catch (e) { if (copySync(ST.cap)) toast('Legenda copiada'); else { ($('#capWrap') || { classList: { add() { } } }).classList.add('on'); toast('Seleciona o texto e copia'); } } }
let JSZipP = null;
function loadZip() { return JSZipP || (JSZipP = new Promise((res, rej) => { if (window.JSZip) return res(window.JSZip); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = () => res(window.JSZip); s.onerror = () => { JSZipP = null; rej(); }; document.head.appendChild(s); })); }
async function saveBlob(blob, name) {
  if (DL) { try { await DL.save({ filename: name, data: blob }); toast('Guardado'); return true; } catch (e) { if (e && (e.code === 'declined' || e.code === 'rate_limited')) return false; } }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); toast('Guardado'); return true; } catch (e) { toast('Carrega sem soltar na imagem para guardar'); return false; }
}
async function shareFiles(files, txt) {
  copySync(txt);
  try { if (navigator.canShare && navigator.canShare({ files })) { const withTxt = txt && navigator.canShare({ files, text: txt }); await navigator.share(withTxt ? { files, text: txt } : { files }); toast(withTxt ? 'Se o texto não aparecer, está copiado: cola-o 📋' : 'Legenda copiada: cola-a no Facebook'); return true; } } catch (e) { if (e && e.name === 'AbortError') return true; }
  return false;
}
let VIEW = 0;
function openViewer(i) {
  VIEW = i; const x = ST.canvases[i];
  $('#viewImg').src = $('#strip').children[i].src; $('#viewN').textContent = `${i + 1} de ${ST.canvases.length}`;
  $('#viewPrev').disabled = i === 0; $('#viewNext').disabled = i === ST.canvases.length - 1;
  if (!$('#viewDlg').open) $('#viewDlg').showModal();
}
async function shareOne() {
  const x = ST.canvases[VIEW], f = new File([await blobOf(x.c)], `${x.name}.jpg`, { type: 'image/jpeg' });
  if (await shareFiles([f], ST.cap)) return;
  await saveBlob(f, f.name); toast('Imagem guardada e legenda copiada');
}
async function saveOne() { const x = ST.canvases[VIEW]; await saveBlob(await blobOf(x.c), `${x.name}.jpg`); }
async function share() {
  const files = await Promise.all(ST.canvases.map(async x => new File([await blobOf(x.c)], `${x.name}.jpg`, { type: 'image/jpeg' })));
  if (await shareFiles(files, ST.cap)) return;
  if (files.length === 1) { await saveBlob(files[0], files[0].name); toast('Foto guardada e legenda copiada'); return; }
  await saveZip(files); toast('Fotos guardadas e legenda copiada');
}
async function saveZip(files) {
  try {
    const Z = await loadZip(), z = new Z();
    files = files || await Promise.all(ST.canvases.map(async x => new File([await blobOf(x.c)], `${x.name}.jpg`)));
    files.forEach(f => z.file(f.name, f)); z.file('legenda.txt', ST.cap);
    await saveBlob(await z.generateAsync({ type: 'blob' }), `${ST.type}-${ST.mode}-${ST.date}.zip`);
  } catch (e) { for (const x of ST.canvases.slice(0, 1)) await saveBlob(await blobOf(x.c), x.name + '.jpg'); }
}
async function savePack(n) {
  const types = [...document.querySelectorAll('#packTypes input:checked')].map(i => i.value);
  if (!types.length) { $('#packMsg').textContent = 'Escolhe pelo menos um tipo.'; return; }
  const btns = document.querySelectorAll('#pack button'); btns.forEach(b => b.disabled = true);
  const keep = { date: ST.date, mode: ST.mode, type: ST.type };
  try {
    const Z = await loadZip(), z = new Z(); let all = '';
    for (let i = 0; i < n; i++) {
      ST.date = shiftDate(keep.date, i, 'dia'); const dir = z.folder(ST.date);
      for (const t of types) {
        ST.type = t; ST.mode = 'dia'; const { cs, cap } = buildPost(t), sub = types.length > 1 ? dir.folder(t) : dir;
        for (const x of cs) sub.file(x.name + '.jpg', await blobOf(x.c, .88));
        sub.file('legenda.txt', cap); all += `\n\n######## ${niceDate(ST.date).toUpperCase()} · ${t.toUpperCase()} ########\n\n` + cap;
      }
      $('#packMsg').textContent = `A preparar ${i + 1}/${n}…`; await new Promise(r => setTimeout(r, 0));
    }
    z.file('todas-as-legendas.txt', all.trim()); $('#packMsg').textContent = 'A comprimir…';
    await saveBlob(await z.generateAsync({ type: 'blob' }), `ceu-de-hoje-${keep.date}-${n}-dias.zip`);
    $('#packMsg').textContent = `Pronto: ${n} dias, uma pasta por dia.`;
  } catch (e) { $('#packMsg').textContent = 'Não foi possível criar o pacote aqui (precisa de internet).'; }
  Object.assign(ST, keep); btns.forEach(b => b.disabled = false); render();
}

// ---------- REEL ----------
const ease = t => 1 - Math.pow(1 - t, 3);
function reelMime() { const opts = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']; return window.MediaRecorder ? opts.find(m => MediaRecorder.isTypeSupported(m)) : null; }
function reelFrame(ctx, base, t) {
  const W = 1080, H = 1920, S = true; ctx.drawImage(base, 0, 0);
  const a0 = ease(Math.min(1, t / 0.8));
  ctx.save(); ctx.globalAlpha = a0; ctx.translate(W / 2, 0); ctx.scale(0.9 + 0.1 * a0, 0.9 + 0.1 * a0); ctx.translate(-W / 2, 0);
  titleBlock(ctx, W, S, topTitle(), periodLabel(), skyShort(), 170); ctx.restore();
  const L = topLayout(S, H);
  for (let i = 11; i >= 0; i--) {
    const ti = 1.6 + (11 - i) * 0.85, p = Math.max(0, Math.min(1, (t - ti) / 0.45));
    if (p <= 0) continue;
    const e = ease(p), glow = i < 3 && t > 12.2 ? 0.5 + 0.5 * Math.sin((t - 12.2) * 5) : (i === 0 ? (1 - p) : 0);
    topRow(ctx, ST.rank[i], i, L.P + (1 - e) * 340, L.top + i * L.rowH, W - 2 * L.P, L.rowH, S, e, glow);
  }
  if (t > 12.3) { ctx.save(); ctx.globalAlpha = Math.min(1, (t - 12.3) / 0.5); footer(ctx, W, H, S, 'Tudo sobre o teu signo no post  ·  Segue ' + brand()); ctx.restore(); }
}
async function makeReel() {
  const btn = $('#reel'); computeTop();
  const base = document.createElement('canvas'); base.width = 1080; base.height = 1920; const bctx = base.getContext('2d');
  bg(bctx, 1080, 1920, ST.date + ST.mode + 'reel', ['#7a5cff', '#2a1d6a']); wheel(bctx, 540, 300, 360, .08);
  const r = await recordAnim((ctx, t) => reelFrame(ctx, base, t), 15, 1080, 1920, btn, '🎬 A criar…'); if (!r) return;
  const ext = r.ext, blob = r.blob;
  const v = $('#reelVid'); v.src = URL.createObjectURL(blob); $('#reelDlg').showModal();
  $('#reelShare').onclick = async () => { const f = new File([blob], `reel-${ST.date}.${ext}`, { type: blob.type }); if (!(await shareFiles([f], ST.cap))) { await saveBlob(f, f.name); toast('Vídeo guardado e legenda copiada'); } };
  $('#reelInfo').textContent = ext === 'webm' ? 'Formato WebM: o Facebook aceita. No iPhone, guarda primeiro e publica a partir do computador se não abrir.' : 'Formato MP4: pronto para os Reels.';
}

// ---------- O MEU CÉU ----------
function calcMine() {
  const d = $('#bDate').value, t = $('#bTime').value, ci = CITIES[+$('#bCity').value];
  if (!d) { $('#ascOut').innerHTML = '<p>Indica a data de nascimento.</p>'; return; }
  store.set('ceu_me', JSON.stringify({ d, t, c: $('#bCity').value }));
  const [y, m, dd] = dParts(d), [h, mi] = (t || '12:00').split(':').map(Number), ms = localToUtcMs(y, m, dd, h, mi, ci[3]);
  const natal = natalChart(ms, ci), P = personalDay(natal, todayStr(), ST.modern);
  const cell = (l, s) => `<div class="trio"><span>${l}</span><b>${SIGNS[s].g}&#xFE0E;</b><em>${SIGNS[s].n}</em></div>`;
  const rd = P.byAsc, base = t ? rd : readDay(P.sunSign, todayStr(), ST.modern);
  let html = `<div class="trios">${cell('Sol', P.sunSign)}${cell('Lua', P.moonSign)}${t ? cell('Ascendente', P.ascSign) : ''}</div>`;
  html += `<h3>Hoje, só para ti</h3>`;
  html += P.aspects.length ? '<ul>' + P.aspects.filter(a => t || a.np !== 'asc').map(a => `<li>${a.txt}</li>`).join('') + '</ul>' : '<p>Dia calmo no teu mapa: nenhum trânsito forte.</p>';
  html += `<h3>${t ? 'Pelo teu ascendente em ' + SIGNS[P.ascSign].n : 'Pelo teu signo solar'}</h3><p class="hl">“${base.headline}”</p>`;
  html += `<p>❤️ ${starStr(base.stars.amor)} ${base.love}<br>💼 ${starStr(base.stars.trabalho)} ${base.work}<br>💰 ${starStr(base.stars.dinheiro)} ${base.money}<br>⚡ ${starStr(base.stars.energia)} ${base.energy}</p>`;
  if (!t) html += '<p class="note">Sem a hora de nascimento não dá para calcular o ascendente.</p>';
  $('#ascOut').innerHTML = html;
}

// ---------- Init ----------
async function initLegacy() { // antigo, substituído por init() em ui.js
  $('#brand').value = ST.brand; $('#fmt').value = ST.fmt; $('#modern').checked = ST.modern; $('#skyOn').checked = ST.sky; $('#coverOn').checked = ST.cover;
  const opts = CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join(''); $('#bCity').innerHTML = opts; $('#cityHours').innerHTML = opts; $('#cityHours').value = ST.city;
  $('#brand').oninput = e => { ST.brand = e.target.value.trim(); store.set('ceu_brand', ST.brand); clearTimeout(init.t); init.t = setTimeout(render, 400); };
  $('#fmt').onchange = e => { ST.fmt = e.target.value; store.set('ceu_fmt', ST.fmt); render(); };
  $('#modern').onchange = e => { ST.modern = e.target.checked; store.set('ceu_modern', ST.modern ? '1' : '0'); render(); };
  $('#skyOn').onchange = e => { ST.sky = e.target.checked; store.set('ceu_sky', ST.sky ? '1' : '0'); render(); };
  $('#coverOn').onchange = e => { ST.cover = e.target.checked; store.set('ceu_cover', ST.cover ? '1' : '0'); render(); };
  $('#cityHours').onchange = e => { ST.city = +e.target.value; store.set('ceu_city', ST.city); render(); };
  $('#prev').onclick = () => { ST.date = shiftDate(ST.date, -1, ST.mode); render(); };
  $('#next').onclick = () => { ST.date = shiftDate(ST.date, 1, ST.mode); render(); };
  $('#when').onclick = () => { ST.date = todayStr(); render(); };
  document.querySelectorAll('#types button').forEach(b => b.onclick = () => { ST.type = b.dataset.t; render(); });
  document.querySelectorAll('#modes button').forEach(b => b.onclick = () => { ST.mode = b.dataset.m; render(); });
  $('#share').onclick = share; $('#copy').onclick = copyCap; $('#zip').onclick = () => saveZip(); $('#reel').onclick = makeReel;
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => $('#' + b.dataset.open).showModal());
  document.querySelectorAll('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  document.querySelectorAll('#pack button').forEach(b => b.onclick = () => savePack(+b.dataset.n));
  $('#ascGo').onclick = calcMine;
  $('#viewShare').onclick = shareOne; $('#viewSave').onclick = saveOne;
  $('#viewPrev').onclick = () => openViewer(Math.max(0, VIEW - 1)); $('#viewNext').onclick = () => openViewer(Math.min(ST.canvases.length - 1, VIEW + 1));
  try { const me = JSON.parse(store.get('ceu_me') || 'null'); if (me) { $('#bDate').value = me.d; $('#bTime').value = me.t; $('#bCity').value = me.c; } } catch (e) { }
  ST.date = todayStr();
  try { await Promise.race([Promise.all(['700 40px Cinzel', 'italic 600 40px "Cormorant Garamond"', '500 20px Manrope', '600 20px Manrope', '700 20px Manrope', '800 20px Manrope'].map(f => document.fonts.load(f)).concat([document.fonts.load('40px "Noto Sans Symbols"', '♈♉♊♋♌♍♎♏♐♑♒♓☉☽☿♀♂♃♄'), document.fonts.load('40px "Noto Sans Symbols 2"', '♅♆♇★✂✓✕')])), new Promise(r => setTimeout(r, 3000))]); } catch (e) { }
  render();
}

