// ===== Estante virtual =====
let SHT = 'livros'; // que estante está em uso: livros ou coleções (cada uma tem a sua)
const shKey = () => SHT === 'colecoes' ? 'ceu_colshelf' : 'ceu_shelf';
const SHELF = {
  get() { let o; try { o = Object.assign({ e: 1, p: 4, names: [], look: 'capas', wood: 'madeira', cfg: [] }, JSON.parse(store.get(shKey()) || '{}')); } catch (e) { o = { e: 1, p: 4, names: [], look: 'capas', wood: 'madeira', cfg: [] }; } o.cfg = o.cfg || []; return o; },
  set(o) { store.set(shKey(), JSON.stringify(o)); }
};
const shP = (S, e) => (S.cfg[e] && S.cfg[e].p) || S.p, shW = (S, e) => (S.cfg[e] && S.cfg[e].w) || 'l';
const SORTS = [['manual', 'A minha ordem'], ['az', 'Título A–Z'], ['autor', 'Autor A–Z'], ['rate', 'Avaliação'], ['recent', 'Mais recentes']];
const col = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; const hues = [8, 25, 42, 140, 165, 200, 220, 260, 285, 330]; return `hsl(${hues[h % hues.length]} ${35 + h % 25}% ${30 + (h >> 4) % 18}%)`; };
function sortBooks(L, s) {
  const c = new Intl.Collator('pt'), A = L.slice();
  if (s === 'az') A.sort((a, b) => c.compare(a.title, b.title));
  if (s === 'autor') A.sort((a, b) => c.compare(a.by || 'zzz', b.by || 'zzz') || c.compare(a.title, b.title));
  if (s === 'rate') A.sort((a, b) => (b.rating || 0) - (a.rating || 0) || c.compare(a.title, b.title));
  if (s === 'recent') A.sort((a, b) => (b.ed || b.sd || '').localeCompare(a.ed || a.sd || ''));
  return A;
}
function normShelf() { // garante que todos os livros têm lugar e numeração seguida
  const S = SHELF.get(), L = intList(SHT); let changed = false;
  const cap = S.look === 'capas' ? 5 : 10, count = (e, p) => L.filter(x => x.pos && x.pos.e === e && x.pos.p === p && !x._new).length;
  L.forEach(x => { if (x.pos && (x.pos.e >= S.e || x.pos.p >= shP(S, x.pos.e))) { const ne = Math.min(S.e - 1, x.pos.e); x.pos = { e: ne, p: Math.min(shP(S, ne) - 1, x.pos.p), i: 1e6 + x.pos.i }; changed = true; } });
  L.filter(x => !x.pos).sort((a, b) => (a.ts || 0) - (b.ts || 0)).forEach(x => { let spot = null; for (let e = 0; e < S.e && !spot; e++) for (let p = 0; p < shP(S, e) && !spot; p++) if (count(e, p) < cap * ({ s: .6, m: .8, l: 1 }[shW(S, e)])) spot = { e, p }; spot = spot || { e: S.e - 1, p: shP(S, S.e - 1) - 1 }; x.pos = { ...spot, i: 1e6 + count(spot.e, spot.p) }; changed = true; });
  for (let e = 0; e < S.e; e++) for (let p = 0; p < shP(S, e); p++) L.filter(x => x.pos.e === e && x.pos.p === p).sort((a, b) => a.pos.i - b.pos.i).forEach((x, i) => { if (x.pos.i !== i) { x.pos.i = i; changed = true; } });
  if (changed) intSave(SHT, L); return L;
}
function bookEl(x, look) {
  const st = x.lent ? '<i class="bdg l">🤝</i>' : x.status === 1 ? '<i class="bdg">a ler</i>' : x.status === 0 ? '<i class="bdg w">quero</i>' : '', ln = x.lent ? ' lent' : '';
  const gp = x.pos && x.pos.g ? ` style="margin-left:${x.pos.g}%"` : '';
  if (look === 'capas' && x.cover) return `<div class="bk cv${ln}" data-id="${x.id}"${gp}><img src="${esc(x.cover)}" alt="${esc(x.title)}" draggable="false" loading="lazy">${st}</div>`;
  const len = x.title.length, h = 78 + (len % 4) * 6, w = 24 + Math.min(16, Math.floor(len / 6) * 2);
  return `<div class="bk sp${ln}" data-id="${x.id}" style="--bc:${col(x.title + x.by)};height:${h}px;width:${w}px${x.pos && x.pos.g ? `;margin-left:${x.pos.g}%` : ''}" title="${esc(x.title)}"><span>${esc(x.title)}</span>${st}</div>`;
}
function vShelf() {
  const S = SHELF.get(), sort = ST.shelfSort || 'manual', look = S.look;
  let L = sort === 'manual' ? normShelf() : intList(SHT);
  let h = `<div class="shtools"><select id="shSort">${SORTS.map(([k, n]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${n}</option>`).join('')}</select><div class="seg3"><button data-look="capas"${look === 'capas' ? ' class="on"' : ''}>Capas</button><button data-look="lombadas"${look === 'lombadas' ? ' class="on"' : ''}>Lombadas</button></div></div>
    <div class="woods">${[['madeira', 'Madeira'], ['branca', 'Branca'], ['preta', 'Preta']].map(([k, n]) => `<button data-wood="${k}" class="wd-${k}${S.wood === k ? ' on' : ''}">${n}</button>`).join('')}</div>`;
  if (sort === 'manual') h += `<div class="shcfg"><span>Estantes</span><button class="ib" data-c="e-">−</button><b>${S.e}</b><button class="ib" data-c="e+">＋</button></div><p class="hint">Carrega sem soltar num ${SHT === 'colecoes' ? 'artigo' : 'livro'} e arrasta-o para onde quiseres, até para o meio ou para a ponta da prateleira. Toca no nome da estante para mudar a largura e as prateleiras.</p>`;
  if (!L.length) return h + `<p class="hint">Ainda não há ${SHT === 'colecoes' ? 'artigos' : 'livros'} na estante.</p>`;
  if (sort === 'manual') {
    for (let e = 0; e < S.e; e++) {
      h += `<div class="estante wood-${S.wood} w-${shW(S, e)}"><div class="eh" data-est="${e}">${esc(S.names[e] || 'Estante ' + (e + 1))} <span>✏️</span></div>`;
      for (let p = 0; p < shP(S, e); p++) { const row = L.filter(x => x.pos.e === e && x.pos.p === p).sort((a, b) => a.pos.i - b.pos.i); h += `<div class="prat" data-e="${e}" data-p="${p}">${row.map(x => bookEl(x, look)).join('')}</div>`; }
      h += '</div>';
    }
  } else {
    const A = sortBooks(L, sort), per = look === 'capas' ? 5 : 9;
    h += `<div class="estante wood-${S.wood}">`; for (let i = 0; i < A.length; i += per) h += `<div class="prat auto">${A.slice(i, i + per).map(x => bookEl({ ...x, pos: x.pos ? { ...x.pos, g: 0 } : x.pos }, look)).join('')}</div>`; h += '</div>';
  }
  return h;
}
function bindShelf() {
  $('#shSort').onchange = e => { ST.shelfSort = e.target.value; render(); };
  document.querySelectorAll('[data-look]').forEach(b => b.onclick = () => { const S = SHELF.get(); S.look = b.dataset.look; SHELF.set(S); render(); });
  document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const S = SHELF.get(), c = b.dataset.c; if (c === 'e+') S.e = Math.min(10, S.e + 1); if (c === 'e-') S.e = Math.max(1, S.e - 1); if (c === 'p+') S.p = Math.min(12, S.p + 1); if (c === 'p-') S.p = Math.max(1, S.p - 1); SHELF.set(S); render(); });
  document.querySelectorAll('[data-wood]').forEach(b => b.onclick = () => { const S = SHELF.get(); S.wood = b.dataset.wood; SHELF.set(S); render(); });
  document.querySelectorAll('[data-est]').forEach(el => el.onclick = () => editEstante(+el.dataset.est));
  const manual = (ST.shelfSort || 'manual') === 'manual';
  document.querySelectorAll('.bk').forEach(el => el.addEventListener('pointerdown', ev => bookDown(ev, el, manual)));
}
let DRAG = null;
function bookDown(ev, el, manual) {
  const sx = ev.clientX, sy = ev.clientY, touch = ev.pointerType !== 'mouse'; let timer = null, moved = false;
  const begin = (x, y) => {
    timer = null; if (!manual) return;
    const r = el.getBoundingClientRect(), g = el.cloneNode(true); g.classList.add('ghost'); g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; document.body.appendChild(g);
    const ph = document.createElement('div'); ph.className = 'bk phd'; ph.style.width = r.width + 'px'; ph.style.height = r.height + 'px'; el.after(ph); el.classList.add('lift');
    DRAG = { el, g, ph, dx: x - r.left, dy: y - r.top }; moveGhost(x, y); try { navigator.vibrate && navigator.vibrate(15); } catch (e) { }
  };
  if (manual) timer = setTimeout(() => begin(sx, sy), touch ? 300 : 150);
  const onMove = e => {
    const x = e.clientX, y = e.clientY;
    if (!DRAG) { if (Math.hypot(x - sx, y - sy) > 10) { moved = true; if (timer) { clearTimeout(timer); timer = null; } } return; }
    e.preventDefault(); moveGhost(x, y); placeAt(x, y);
    const m = 70; if (y < m) window.scrollBy(0, -12); else if (y > innerHeight - m - 70) window.scrollBy(0, 12);
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); document.removeEventListener('touchmove', block, { passive: false });
    if (timer) { clearTimeout(timer); timer = null; if (!moved) pullOut(el); return; }
    if (!DRAG) { if (!moved && !manual) pullOut(el); return; }
    const row = DRAG.ph.parentElement, kids = [...row.children].filter(c => c !== DRAG.el && !c.classList.contains('ghost')), gap = DRAG.gap || 0;
    const idx = kids.indexOf(DRAG.ph), e2 = +row.dataset.e, p2 = +row.dataset.p, id = DRAG.el.dataset.id;
    DRAG.g.remove(); DRAG.ph.remove(); DRAG.el.classList.remove('lift'); DRAG = null;
    const L = intList(SHT), me = L.find(x => x.id === id), from = { ...me.pos };
    L.filter(x => x.id !== id && x.pos && x.pos.e === from.e && x.pos.p === from.p && x.pos.i > from.i).forEach(x => x.pos.i--);
    L.filter(x => x.id !== id && x.pos && x.pos.e === e2 && x.pos.p === p2 && x.pos.i >= idx).forEach(x => x.pos.i++);
    me.pos = { e: e2, p: p2, i: idx, g: gap }; intSave(SHT, L); render(); toast(SHT === 'colecoes' ? 'Arrumado 🧱' : 'Arrumado 📚');
  };
  const block = e => { if (DRAG) e.preventDefault(); };
  window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
  document.addEventListener('touchmove', block, { passive: false });
}
function moveGhost(x, y) { DRAG.g.style.transform = `translate(${x - DRAG.dx}px, ${y - DRAG.dy}px) rotate(-4deg) scale(1.08)`; }
function placeAt(x, y) {
  DRAG.g.style.display = 'none'; const t = document.elementFromPoint(x, y); DRAG.g.style.display = '';
  const row = t && t.closest('.prat:not(.auto)'); if (!row) return;
  const kids = [...row.querySelectorAll('.bk:not(.phd):not(.lift)')]; let before = null;
  for (const k of kids) { const r = k.getBoundingClientRect(); if (y < r.bottom + 6 && x < r.left + r.width / 2) { before = k; break; } }
  if (before) { if (DRAG.ph.nextSibling !== before) row.insertBefore(DRAG.ph, before); } else if (row.lastElementChild !== DRAG.ph) row.appendChild(DRAG.ph);
  // espaço livre à esquerda do livro (para o pôr ao meio, à direita, onde quiseres)
  DRAG.ph.style.marginLeft = '0'; const rr = row.getBoundingClientRect(), cs = getComputedStyle(row), padL = parseFloat(cs.paddingLeft) || 0, inner = rr.width - padL - (parseFloat(cs.paddingRight) || 0);
  const prev = DRAG.ph.previousElementSibling && !DRAG.ph.previousElementSibling.classList.contains('ghost') ? DRAG.ph.previousElementSibling : null, gapCss = parseFloat(cs.columnGap || cs.gap) || 0;
  const natural = prev ? prev.getBoundingClientRect().right + gapCss : rr.left + padL, want = x - DRAG.dx;
  const used = [...row.children].filter(c => c !== DRAG.el && !c.classList.contains('ghost')).reduce((a, c) => a + c.getBoundingClientRect().width + (c === DRAG.ph ? 0 : parseFloat(c.style.marginLeft ? c.style.marginLeft : 0) / 100 * inner) + gapCss, 0);
  let gap = Math.max(0, Math.min(want - natural, inner - used)); if (gap < 10) gap = 0; DRAG.gap = inner ? +(gap / inner * 100).toFixed(1) : 0; DRAG.ph.style.marginLeft = DRAG.gap + '%';
}
// ---- ISBN e código de barras ----
async function isbnLookup(isbn) {
  isbn = String(isbn).replace(/\D/g, '');
  const gb = v => ({ pages: v.pageCount || '', title: v.title + (v.subtitle && v.title.length < 30 ? '' : ''), by: (v.authors || [])[0] || '', cover: v.imageLinks ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail || '').replace('http:', 'https:').replace('&edge=curl', '') : '' });
  const olCover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
  let best = null; const better = r => { if (!r || !r.title) return; if (!best) best = r; else { if (!best.cover && r.cover) best.cover = r.cover; if (!best.pages && r.pages) best.pages = r.pages; if (!best.by && r.by) best.by = r.by; } };
  // 1) Google Books (melhor para edições portuguesas)
  try { const g = await jget(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`); const v = g.items && g.items[0] && g.items[0].volumeInfo; if (v) better(gb(v)); } catch (e) { }
  if (best && best.cover && best.by) return best;
  // 2) Open Library: pesquisa
  try { const j = await jget(`https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name,cover_i,number_of_pages_median&limit=1`); const d = (j.docs || [])[0]; if (d) better({ pages: d.number_of_pages_median || '', title: d.title, by: (d.author_name || [])[0] || '', cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '' }); } catch (e) { }
  if (best && best.cover && best.by) return best;
  // 3) Open Library: ficha da edição
  try { const e = await jget(`https://openlibrary.org/isbn/${isbn}.json`); if (e && e.title) { let by = e.by_statement || ''; try { if (e.authors && e.authors[0]) { const a = await jget(`https://openlibrary.org${e.authors[0].key}.json`); by = a.name || by; } } catch (x) { } better({ pages: e.number_of_pages || '', title: e.title, by, cover: e.covers && e.covers[0] > 0 ? `https://covers.openlibrary.org/b/id/${e.covers[0]}-M.jpg` : olCover }); } } catch (e) { }
  // 4) Google Books pesquisa livre
  if (!best) try { const g = await jget(`https://www.googleapis.com/books/v1/volumes?q=${isbn}`); const v = g.items && g.items[0] && g.items[0].volumeInfo; if (v) better(gb(v)); } catch (e) { }
  return best;
}
// ===== Ler a capa (OCR) =====
const COVER_NOISE = /\b(editora|edi[cç][oõ]es|editorial|leya|bertrand|presen[cç]a|porto|asa|quixote|alfaguara|planeta|booket|c[ií]rculo|gradiva|relógio|rel[oó]gio d.?[aá]gua|tinta.da.china|livros do brasil|penguin|vintage|harper|romance|best.?seller|vencedor|pr[eé]mio|autor[a]? de|milh[oõ]es|exemplares|edi[cç][aã]o|volume|livro|cole[cç][aã]o|bolso|traduç|tradu[cç][aã]o|pref[aá]cio|www|\.pt|\.com)\b/i;
const tcase = s => s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s\-'’])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E|A|O|Os|As|Em|No|Na|Sobre|Para|Por|Com|Um|Uma|The|Of|And)\b/g, (w, _, i) => w.toLowerCase()).replace(/^\p{L}/u, c => c.toUpperCase()) : s;
function parseCover(lines) {
  // lines: [{text, conf, h, y}]
  const L = lines.map(l => ({ ...l, text: l.text.replace(/[^\p{L}\p{N}'’\-:,.!? ]/gu, ' ').replace(/\s+/g, ' ').trim() }))
    .filter(l => l.text.replace(/[^\p{L}]/gu, '').length >= 2 && l.conf >= 45 && !/^[\p{L}]{1,2}$/u.test(l.text)).sort((a, b) => a.y - b.y);
  const G = [];
  for (const l of L) { const g = G[G.length - 1]; if (g && Math.abs(l.h - g.h) / g.h < .22 && l.y - g.yEnd < g.h * 1.1) { g.text += ' ' + l.text; g.yEnd = l.y + l.h; g.n++; } else G.push({ text: l.text, h: l.h, y: l.y, yEnd: l.y + l.h, n: 1, conf: l.conf }); }
  const clean = G.filter(g => !COVER_NOISE.test(g.text));
  const nameLike = g => { const w = g.text.split(' ').filter(Boolean); return g.n === 1 && w.length >= 2 && w.length <= 5 && !/\d/.test(g.text) && w.every(x => /^\p{Lu}/u.test(x) || /^(de|da|do|dos|das|e|van|von|del)$/i.test(x)); };
  const bySize = [...clean].sort((a, b) => b.h - a.h);
  let title = bySize[0] || null, author = null;
  const names = clean.filter(nameLike);
  if (title && nameLike(title) && bySize[1]) { // autor em grande (ex.: SARAMAGO no topo)? o título costuma ser o bloco grande que não é nome
    const alt = bySize.find(g => g !== title && !nameLike(g) && g.h > title.h * .55);
    if (alt) { author = title; title = alt; }
  }
  if (!author) author = names.filter(g => g !== title).sort((a, b) => b.h - a.h)[0] || null;
  return { title: title ? tcase(title.text) : '', by: author ? tcase(author.text) : '', query: [title && title.text, author && author.text].filter(Boolean).join(' ') || bySize.slice(0, 2).map(g => g.text).join(' '), raw: G.map(g => g.text) };
}

let _ocrW = null;
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function ocrWorker() {
  if (_ocrW) return _ocrW;
  const base = new URL('ocr/', location.href).href;
  try {
    if (!window.Tesseract) await loadScript(base + 'tesseract.min.js');
    _ocrW = await Tesseract.createWorker('por', 1, { workerPath: base + 'worker.min.js', corePath: base, langPath: base });
  } catch (e) {
    if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    _ocrW = await Tesseract.createWorker('por', 1);
  }
  return _ocrW;
}
function fileToCanvas(file, max = 1400, invert = false) {
  return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onerror = rej; im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const g = c.getContext('2d'); if (invert) g.filter = 'invert(1) grayscale(1) contrast(1.4)'; else g.filter = 'grayscale(1) contrast(1.25)'; g.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c); }; im.src = u; });
}
const ocrGood = x => x.confidence >= 55 && /\p{L}{2,}/u.test(x.text);
function ocrLines(data) { return (data.blocks || []).flatMap(b => b.paragraphs.flatMap(p => p.lines)).map(l => { const ws = (l.words || []).filter(ocrGood); return { text: ws.map(x => x.text).join(' '), conf: ws.length ? ws.reduce((s, x) => s + x.confidence, 0) / ws.length : 0, h: ws.length ? Math.max(...ws.map(x => x.bbox.y1 - x.bbox.y0)) : 0, y: l.bbox.y0, words: ws.map(x => x.text) }; }).filter(l => l.text); }
async function ocrCover0(file, onStep, passesOverride) {
  const w = await ocrWorker(); try { await w.setParameters({ tessedit_pageseg_mode: '11' }); } catch (e) { }
  const passes = passesOverride || [[1400, false], [1400, true], [800, false]], all = [], parsed = [];
  for (let i = 0; i < passes.length; i++) {
    if (onStep) onStep(i + 1, passes.length);
    const { data } = await w.recognize(await fileToCanvas(file, passes[i][0], passes[i][1]), {}, { blocks: true });
    const L = ocrLines(data); all.push(...L); const r = parseCover(L); parsed.push(r);
    if (i === 1 && parsed.some(p => p.title && p.by)) break;
  }
  try { await w.setParameters({ tessedit_pageseg_mode: '3' }); } catch (e) { }
  const best = parsed.find(p => p.title && p.by) || parsed.find(p => p.title) || parsed[0] || { title: '', by: '', raw: [] };
  const seen = new Set(), words = [];
  all.flatMap(l => l.words).forEach(t => { const k = nrm(t).replace(/[^a-z0-9]/g, ''); if (k.length >= 3 && !seen.has(k) && !COVER_NOISE.test(t)) { seen.add(k); words.push(t.replace(/[^\p{L}\p{N}'-]/gu, '')); } });
  const longW = [...words].sort((x, y) => y.length - x.length).slice(0, 6), names = parsed.map(p => p.by).filter(Boolean);
  const queries = [...new Set([best.query, [best.title, names[0]].filter(Boolean).join(' '), longW.join(' '), names[0] && (names[0] + ' ' + longW.filter(x => !names[0].includes(x)).slice(0, 2).join(' '))].filter(q => q && q.trim().length > 3))].slice(0, 4);
  return { ...best, raw: [...new Set(parsed.flatMap(p => p.raw))], words, queries };
}
async function resetOcr(useCdn) { try { if (_ocrW) await _ocrW.terminate(); } catch (e) { } _ocrW = null; if (useCdn) { if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'); _ocrW = await Tesseract.createWorker('por', 1); } }
async function ocrCover(file, onStep) {
  try { return await ocrCover0(file, onStep); }
  catch (e1) {
    console.warn('OCR falhou, a tentar de novo', e1);
    try { await resetOcr(false); return await ocrCover0(file, onStep, [[1000, false]]); }
    catch (e2) { console.warn('OCR falhou outra vez, a usar o servidor alternativo', e2); await resetOcr(true); return await ocrCover0(file, onStep, [[1000, false]]); }
  }
}
function ocrRank(results, words) {
  const W = words.map(w => nrm(w).replace(/[^a-z0-9]/g, '')).filter(w => w.length >= 3);
  return results.map(r => { const T = nrm(r.title + ' ' + r.by).split(/[^a-z0-9]+/).filter(Boolean); const Dd = nrm(r.desc || ''); const sc = W.reduce((s, w) => s + (T.some(t => t.startsWith(w) || (w.length >= 5 && t.includes(w)) || (w.length >= 5 && w.startsWith(t) && t.length >= 4)) ? 1 : (w.length >= 4 && Dd.includes(w) ? .5 : 0)), 0); return { ...r, sc }; }).sort((x, y) => y.sc - x.sc);
}

function googleLink(q) { return `https://www.google.com/search?q=${encodeURIComponent(q + ' livro')}`; }
function wookLink(q) { return `https://www.google.com/search?q=${encodeURIComponent(q + ' site:wook.pt')}`; }
function photoToCover(file) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => { const w = 280, h = Math.round(im.height * w / im.width), c = document.createElement('canvas'); c.width = w; c.height = Math.min(h, 460); c.getContext('2d').drawImage(im, 0, 0, w, h); res(c.toDataURL('image/jpeg', .78)); }; im.src = fr.result; }; fr.readAsDataURL(file); });
}
async function scanBarcode() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices) { const v = window.prompt ? prompt('Escreve o ISBN (13 números, atrás do livro):') : null; return v; }
  const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] });
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  const v = $('#scanVid'); v.srcObject = stream; await v.play(); $('#scanDlg').showModal();
  return new Promise(res => {
    let done = false; const stop = val => { if (done) return; done = true; stream.getTracks().forEach(t => t.stop()); $('#scanDlg').close(); res(val); };
    $('#scanCancel').onclick = () => stop(null); $('#scanDlg').onclose = () => stop(null);
    const loop = async () => { if (done) return; try { const c = await det.detect(v); const code = c.find(x => /^\d{10,13}$/.test(x.rawValue)); if (code) return stop(code.rawValue); } catch (e) { } requestAnimationFrame(loop); }; loop();
  });
}

function pullOut(el) { el.classList.add('pull'); setTimeout(() => { el.classList.remove('pull'); openItem(SHT, el.dataset.id, false); }, 260); }

function editEstante(e) {
  const S = SHELF.get();
  $('#estBody').innerHTML = `<div class="form"><label>Nome<input type="text" id="esN" maxlength="24" value="${esc(S.names[e] || '')}" placeholder="Estante ${e + 1} (ex.: Sala, Quarto)"></label>
    <label>Largura<select id="esW">${[['s', 'Estreita'], ['m', 'Normal'], ['l', 'Larga']].map(([k, n]) => `<option value="${k}"${shW(S, e) === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <label>Prateleiras<input type="number" id="esP" min="1" max="12" value="${shP(S, e)}" inputmode="numeric"></label></div>`;
  $('#estSave').onclick = () => { const S2 = SHELF.get(); S2.names[e] = $('#esN').value.trim(); S2.cfg[e] = { w: $('#esW').value, p: Math.max(1, Math.min(12, +$('#esP').value || 4)) }; SHELF.set(S2); $('#estDlg').close(); render(); };
  $('#estDlg').showModal();
}

// ---------- Câmara com moldura (câmara ou galeria; só o que está dentro da moldura vai para a app) ----------
async function decodeSmall(file, max = 2000) {
  try { if (window.createImageBitmap) { const bm = await createImageBitmap(file); const k = Math.min(1, max / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); bm.close && bm.close(); return c; } } catch (e) { }
  const u = URL.createObjectURL(file), im = await loadImg(u); URL.revokeObjectURL(u); if (!im) return null; const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c;
}
async function frameCamera(opts = {}) {
  const ratio = opts.ratio || 2 / 3; let stream = null, mode = 'cam', src = null, s = 1, tx = 0, ty = 0;
  let dlg = document.getElementById('camDlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'camDlg'; document.body.appendChild(dlg); }
  dlg.innerHTML = '<div class="camwrap"><video id="camV" playsinline muted autoplay></video><canvas id="camC" hidden></canvas><div class="camframe" id="camF"><i></i><i></i><i></i><i></i></div><p class="camtip" id="camTip"></p></div><div class="cambar"><button class="btn" id="camX">Cancelar</button><button class="camshot" id="camGo" aria-label="Tirar foto"></button><label class="btn" id="camG">🖼️ Galeria<input type="file" id="camFile" accept="image/*" hidden></label></div>';
  const v = dlg.querySelector('#camV'), C = dlg.querySelector('#camC'), F = dlg.querySelector('#camF'), tip = dlg.querySelector('#camTip'), wrap = dlg.querySelector('.camwrap');
  F.style.setProperty('--r', ratio); tip.textContent = opts.tip || 'Encaixa a capa dentro da moldura';
  dlg.showModal();
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false }); v.srcObject = stream; try { await v.play(); } catch (e) { } }
  catch (e) { mode = 'none'; v.hidden = true; tip.textContent = 'Sem acesso à câmara: escolhe a foto na 🖼️ Galeria'; }
  const stopCam = () => { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; v.srcObject = null; };
  const draw = () => { if (mode !== 'img') return; const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); C.width = r.width * dpr; C.height = r.height * dpr; const g = C.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, r.width, r.height); const fr = F.getBoundingClientRect(), cx = fr.left - r.left + fr.width / 2 + tx, cy = fr.top - r.top + fr.height / 2 + ty; g.drawImage(src, cx - src.width * s / 2, cy - src.height * s / 2, src.width * s, src.height * s); };
  const fit = () => { const fr = F.getBoundingClientRect(); s = Math.max(fr.width / src.width, fr.height / src.height); tx = ty = 0; draw(); };
  // arrastar e aproximar (dedos ou rato)
  const pts = new Map(); let last = null;
  C.onpointerdown = e => { C.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = null; };
  C.onpointermove = e => { if (!pts.has(e.pointerId)) return; const p0 = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { tx += e.clientX - p0[0]; ty += e.clientY - p0[1]; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (last) { const k = d / last; const fr = F.getBoundingClientRect(), min = Math.max(fr.width / src.width, fr.height / src.height) * .5; s = Math.max(min, Math.min(s * k, min * 12)); } last = d; }
    draw(); };
  C.onpointerup = C.onpointercancel = e => { pts.delete(e.pointerId); last = null; };
  C.onwheel = e => { e.preventDefault(); s *= e.deltaY < 0 ? 1.08 : .93; draw(); };
  return new Promise(res => {
    const done = val => { stopCam(); window.removeEventListener('resize', draw); dlg.close(); res(val); };
    window.addEventListener('resize', draw);
    dlg.querySelector('#camX').onclick = () => done(null); dlg.oncancel = e => { e.preventDefault(); done(null); };
    dlg.querySelector('#camFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; tip.textContent = 'A abrir a foto…'; const c = await decodeSmall(f, 2200); if (!c) { tip.textContent = 'Não consegui abrir essa foto 😕'; return; } stopCam(); src = c; mode = 'img'; v.hidden = true; C.hidden = false; tip.textContent = 'Arrasta e aproxima com dois dedos até a capa encher a moldura'; requestAnimationFrame(fit); };
    dlg.querySelector('#camGo').onclick = () => {
      const fr = F.getBoundingClientRect(); let cut;
      if (mode === 'cam') { const vw = v.videoWidth, vh = v.videoHeight; if (!vw) return; const vr = v.getBoundingClientRect(), sc = Math.max(vr.width / vw, vr.height / vh), ox = vr.left + (vr.width - vw * sc) / 2, oy = vr.top + (vr.height - vh * sc) / 2; cut = [v, Math.max(0, (fr.left - ox) / sc), Math.max(0, (fr.top - oy) / sc), fr.width / sc, fr.height / sc]; }
      else if (mode === 'img') { const cx = fr.left + fr.width / 2 + tx, cy = fr.top + fr.height / 2 + ty, ix = cx - src.width * s / 2, iy = cy - src.height * s / 2; cut = [src, (fr.left - ix) / s, (fr.top - iy) / s, fr.width / s, fr.height / s]; }
      else { tip.textContent = 'Escolhe primeiro uma foto na 🖼️ Galeria'; return; }
      const W = Math.min(1400, Math.round(cut[3])), H = Math.round(W / ratio), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.drawImage(cut[0], cut[1], cut[2], cut[3], cut[4], 0, 0, W, H);
      dlg.classList.add('flash'); setTimeout(() => dlg.classList.remove('flash'), 200);
      c.toBlob(b => done(b ? new File([b], 'capa.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', .92);
    };
  });
}

// ---------- Procurar nos meus livros (título, autor ou código de barras) ----------
function placeTxt(x, which) {
  if (which) SHT = which; const S = SHELF.get(); if (!x.pos) return 'ainda sem lugar na estante';
  const row = intList(SHT).filter(z => z.pos && z.pos.e === x.pos.e && z.pos.p === x.pos.p).sort((a, b) => a.pos.i - b.pos.i), i = row.findIndex(z => z.id === x.id), n = row.length, np = shP(S, x.pos.e);
  const est = S.e > 1 || S.names[x.pos.e] ? `${S.names[x.pos.e] ? '«' + S.names[x.pos.e] + '»' : 'Estante ' + (x.pos.e + 1)} → ` : '';
  const shelf = x.pos.p === 0 ? 'prateleira de cima' : x.pos.p === np - 1 ? 'prateleira de baixo' : `${x.pos.p + 1}.ª prateleira a contar de cima`;
  const t = s => '«' + (s.length > 28 ? s.slice(0, 26) + '…' : s) + '»', L = row[i - 1], Rr = row[i + 1];
  const zone = n === 1 ? (x.pos.g > 30 ? 'sozinho, mais ao meio' : 'sozinho na prateleira') : i === 0 ? `o primeiro à esquerda${Rr ? ', antes de ' + t(Rr.title) : ''}` : i === n - 1 ? `o último à direita, depois de ${t(L.title)}` : `${i + 1}.º a contar da esquerda, entre ${t(L.title)} e ${t(Rr.title)}`;
  return `${est}${shelf} → ${zone}`;
}
function libFind(q) {
  const n = nrm(q).trim(), dig = q.replace(/\D/g, ''); if (!n) return [];
  return intList('livros').filter(x => (dig.length >= 8 && (x.isbn || '').replace(/\D/g, '') === dig) || nrm(x.title).includes(n) || nrm(x.by || '').includes(n) || n.split(/\s+/).every(w => nrm(x.title + ' ' + (x.by || '')).includes(w)));
}
function libSearchHtml() { return `<div class="libsearch"><input type="search" id="libQ" placeholder="🔎 Já tenho? Título, autor ou código" value="${esc(ST.libQ || '')}" autocomplete="off"><button class="btn" id="libScan" title="Ler código de barras">📷</button></div><div id="libRes"></div>`; }
function libShow(q, fromScan) {
  const box = $('#libRes'); if (!box) return; ST.libQ = q; if (!q.trim()) { box.innerHTML = ''; return; }
  const R = libFind(q), C = INT.livros;
  box.innerHTML = R.length ? `<div class="box libr"><h3>📚 ${R.length === 1 ? 'Tens este livro' : `Encontrei ${R.length} livros`}</h3>${R.map(x => { const dur = durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et)); return `<div class="sug" data-lid="${x.id}">${x.cover ? `<img src="${esc(x.cover)}" alt="">` : '<span class="ph0">📕</span>'}<div><b>${esc(x.title)}</b><small>${esc(x.by || '')}${x.by ? ' · ' : ''}${C.verb[x.status]}${x.status === 2 && x.ed ? ' em ' + niceDate(x.ed).replace(/^[^,]+, /, '') + ' de ' + x.ed.slice(0, 4) : ''}${dur && x.status === 2 ? ' · ' + dur : ''}</small><small>📍 ${placeTxt(x, 'livros')}${x.lent ? ` · 🤝 com ${esc(x.lent.to)}` : ''}</small></div></div>`; }).join('')}</div>`
    : `<div class="box libr"><p>${fromScan ? '🆕 Ainda não tens este livro.' : 'Não encontrei nenhum livro teu com isso.'}</p>${fromScan ? `<button class="btn main" id="libAdd" style="width:100%">＋ Juntar este livro</button>` : ''}</div>`;
  box.querySelectorAll('[data-lid]').forEach(el => el.onclick = () => openItem('livros', el.dataset.lid, false));
  if ($('#libAdd')) $('#libAdd').onclick = async () => { const code = q.replace(/\D/g, ''); toast('A procurar o livro…'); let b = null; try { b = await isbnLookup(code); } catch (e) { } openItem('livros', null, true, b ? { ...b, isbn: code, status: 0 } : { isbn: code, status: 0, notFound: 1 }); };
}
function bindLibSearch() {
  if (!$('#libQ')) return; $('#libQ').oninput = () => libShow($('#libQ').value); if (ST.libQ) libShow(ST.libQ);
  $('#libScan').onclick = async () => { try { const code = await scanBarcode(); if (!code) return; $('#libQ').value = code; libShow(code, true); } catch (e) { toast('Sem acesso à câmara'); } };
}
