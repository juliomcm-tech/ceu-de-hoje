const SOUL_SHOP = false; // encomendas (porta-chaves / carta): ligar quando houver fluxo de encomenda
// ---------- CARTA DA ALMA: a impressão digital celeste de cada pessoa ----------
// Tudo é calculado no telemóvel a partir do nome e do nascimento. Nada é enviado para servidor nenhum.
const SOUL_COL = [null, ['Vermelho-rubi', '#ff5d73'], ['Laranja-âmbar', '#ffa24a'], ['Amarelo-sol', '#ffd75e'], ['Verde-esmeralda', '#4fd39a'], ['Azul-turquesa', '#4fd8e6'], ['Rosa-quartzo', '#ff9cc8'], ['Violeta', '#b48cff'], ['Dourado', '#ffd27a'], ['Prata-lunar', '#dfe6ff']];
const SOUL_EL = {
  fogo: { n: 'Fogo', e: '🔥', c: ['#2a0710', '#6e1a1c', '#ff8a3d'] },
  terra: { n: 'Terra', e: '🌿', c: ['#07180f', '#20412a', '#a8d46b'] },
  ar: { n: 'Ar', e: '🌬️', c: ['#0d1233', '#2b3a7c', '#b9d4ff'] },
  agua: { n: 'Água', e: '🌊', c: ['#06172a', '#0f4a66', '#5fd0d6'] }
};
const SOUL_NUM_W = [null, 'pioneira', 'conciliadora', 'criativa', 'construtora', 'livre', 'protetora', 'sábia', 'poderosa', 'generosa'];
const TXT = '︎'; // força os símbolos dos signos a aparecer como texto (não como emoji)

const soulN9 = n => n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n;
function soulArcana(d) { const [y, m, dd] = d.split('-').map(Number); let n = y + m + dd; while (n > 22) n = String(n).split('').reduce((a, b) => a + +b, 0); return n === 22 ? 0 : n; }
function soulSerial(str) {
  let h1 = 2166136261, h2 = 5381; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = (Math.imul(h2, 33) + c) | 0; }
  const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', enc = x => { x >>>= 0; let s = ''; for (let i = 0; i < 4; i++) { s += A[x & 31]; x >>>= 5; } return s; };
  return enc(h1) + enc(h2);
}
function soulPrint(serial) { const r = seeded('fp' + serial), b = []; for (let i = 0; i < 48; i++) b.push(r() < .55 ? 1 : 0); b[0] = 1; return b; } // anel único: a impressão digital da carta
// p = { name, d: 'AAAA-MM-DD', t: 'HH:MM' (opcional), c: índice da cidade }
function soulOf(p) {
  if (!p || !p.d) return null;
  const ci = CITIES[+p.c || 0], [y, m, dd] = dParts(p.d), [hh, mi] = (p.t || '12:00').split(':').map(Number), ms = localToUtcMs(y, m, dd, hh, mi, ci[3]);
  const nat = natalChart(ms, ci), s = Math.floor(nat.sun / 30) % 12, mo = Math.floor(nat.moon / 30) % 12, asc = p.t ? Math.floor(nat.asc / 30) % 12 : null;
  const lp = lifePath(p.d), n = soulN9(lp), ar = soulArcana(p.d), first = [...((p.name || '').trim().split(/\s+/)[0] || 'Alma').replace(/~/g, '')].slice(0, 16).join(''), sp = SPECIES.find(x => x[0] === p.sp) ? p.sp : '';
  return { first, s, m: mo, asc, lp, n, ar, el: SIGNS[s].el, stone: SIGN_EXTRA[s].pedra, col: SOUL_COL[n], cn: chineseSign(p.d), serial: soulSerial(nrm(sp ? String(p.name || '').trim().replace(/\s+/g, ' ') : p.name || '') + '|' + p.d + '|' + (p.t || '') + '|' + (p.c || 0) + (sp ? '|' + sp : '')), pet: sp || null, sos: sp && p.sos ? String(p.sos).slice(0, 40) : '' };
}
const soulNameSz = (nm, base = 17) => { const n = [...nm].length; return n <= 13 ? base : +(base * 13 / n).toFixed(1); }; // nomes compridos encolhem e cabem na faixa
const soulKey = o => o.s * 108 + o.m * 9 + (o.n - 1);
const soulWant = o => ({ s: (o.s + 6) % 12, m: (o.m + 6) % 12, n: 10 - o.n });
function soulLevel(a, b) { const w = soulWant(a); return (b.s === w.s) + (b.m === w.m) + (b.n === w.n); }
function soulShape(o) { // constelação partilhada por um par de almas complementares; cada uma tem metade
  const ka = soulKey(o), kb = soulKey(soulWant(o)), r = seeded('alma' + Math.min(ka, kb) + '-' + Math.max(ka, kb));
  const half = x0 => { const P = []; for (let i = 0; i < 4; i++) P.push([x0 + r() * .3, .16 + i * .21 + (r() - .5) * .12]); return P; };
  const L = half(.1), R = half(.6); return { L, R, mine: ka < kb ? 'L' : 'R' };
}
const soulCode = o => o.s.toString(36) + o.m.toString(36) + o.n + o.ar.toString(36) + (o.asc == null ? 'x' : o.asc.toString(36)) + o.serial + '~' + encodeURIComponent(o.first) + (o.pet ? '~' + o.pet : '');
function soulParse(code) {
  const m = String(code || '').match(/^([0-9ab])([0-9ab])([1-9])([0-9a-l])([0-9abx])([0-9A-Z]{8})~(.{1,80})$/); if (!m) return null;
  let first; try { first = decodeURIComponent(m[7]); } catch (e) { first = 'Alma'; }
  let pet = null; const pk = first.match(/^(.*)~([a-z]{2,10})$/); if (pk && SPECIES.find(x => x[0] === pk[2])) { first = pk[1]; pet = pk[2]; }
  const s = parseInt(m[1], 36), n = +m[3];
  return { s, m: parseInt(m[2], 36), n, ar: parseInt(m[4], 36), asc: m[5] === 'x' ? null : parseInt(m[5], 36), serial: m[6], first: [...first.replace(/[<>~]/g, '')].slice(0, 16).join('') || 'Alma', pet, el: SIGNS[s].el, stone: SIGN_EXTRA[s].pedra, col: SOUL_COL[n] };
}

function soulSVG(o, opt = {}) {
  const E = SOUL_EL[o.el] || SOUL_EL.ar, [c0, c1, c2] = E.c, G = '#f2c76e', G2 = '#fff1c4', C = o.col ? o.col[1] : G, r = seeded('pó' + o.serial), W = 300, H = 500;
  let stars = ''; for (let i = 0; i < 70; i++) { const x = 14 + r() * 272, y = 14 + r() * 472, a = (.25 + r() * .6).toFixed(2), rr = (.35 + r() * 1.1).toFixed(2); stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" fill="#fff" opacity="${a}"/>`; }
  // constelação
  const sh = soulShape(o), box = (p) => [64 + p[0] * 172, 58 + p[1] * 160], mineP = (sh.mine === 'L' ? sh.L : sh.R).map(box), otherP = (sh.mine === 'L' ? sh.R : sh.L).map(box);
  const path = P => P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const join = sh.mine === 'L' ? [mineP[3], otherP[0]] : [otherP[3], mineP[0]];
  const cons = `<path d="${path(otherP)}" fill="none" stroke="${G2}" stroke-width=".9" stroke-dasharray="2 4" opacity=".38"/>${otherP.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="none" stroke="${G2}" stroke-width=".8" opacity=".45"/>`).join('')}
    <path d="M${join[0][0].toFixed(1)} ${join[0][1].toFixed(1)} L${join[1][0].toFixed(1)} ${join[1][1].toFixed(1)}" stroke="${C}" stroke-width="1" stroke-dasharray="1 3" opacity=".7"/>
    <path d="${path(mineP)}" fill="none" stroke="${G}" stroke-width="1.6" filter="url(#sg)"/>${mineP.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i % 2 ? 3.2 : 4.2}" fill="${G2}" filter="url(#sg)"/>`).join('')}`;
  // medalhão: raios = número da alma, lua e ascendente à volta
  const cx = 150, cy = 312; let rays = ''; for (let i = 0; i < o.n * 4 + 8; i++) { const a = i / (o.n * 4 + 8) * Math.PI * 2, r1 = 66, r2 = i % 4 ? 80 : 92; rays += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="${C}" stroke-width="${i % 4 ? .8 : 1.6}" opacity="${i % 4 ? .5 : .9}"/>`; }
  let ticks = ''; for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; ticks += `<circle cx="${(cx + Math.cos(a) * 56).toFixed(1)}" cy="${(cy + Math.sin(a) * 56).toFixed(1)}" r="${i === o.s ? 3 : 1.3}" fill="${i === o.s ? G2 : G}"/>`; }
  const at = (k, rad) => { const a = (k * 30 - 90) * Math.PI / 180; return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]; };
  const mp = at(o.m, 56), ap = o.asc != null ? at(o.asc, 56) : null;
  const moon = `<g transform="translate(${mp[0].toFixed(1)} ${mp[1].toFixed(1)})"><circle r="9" fill="${c0}" stroke="${G}" stroke-width="1"/><path d="M2.5 -6 A6.5 6.5 0 1 0 2.5 6 A5 5 0 1 1 2.5 -6Z" fill="${G2}"/></g>`;
  const ascM = ap ? `<g transform="translate(${ap[0].toFixed(1)} ${ap[1].toFixed(1)})"><circle r="7" fill="${c0}" stroke="${G}" stroke-width="1"/><path d="M0 -4 L3.5 2.5 L-3.5 2.5Z" fill="${G2}"/></g>` : '';
  const t = (x, y, s, txt, f, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${s}" fill="${f}" ${extra}>${txt}</text>`;
  const AR = TAROT[o.ar] ? TAROT[o.ar][0] : '';
  return svgClean(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg${o.serial}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset=".65" stop-color="${c0}"/><stop offset="1" stop-color="#05030c"/></radialGradient>
    <radialGradient id="sky${o.serial}" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${c1}" stop-opacity=".9"/><stop offset="1" stop-color="#05030c"/></radialGradient>
    <radialGradient id="md${o.serial}" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${C}" stop-opacity=".55"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="${c0}"/></radialGradient>
    <linearGradient id="gd${o.serial}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".35" stop-color="${G}"/><stop offset=".7" stop-color="#b8892f"/><stop offset="1" stop-color="#fff0b8"/></linearGradient>
    <filter id="sg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" rx="18" fill="url(#bg${o.serial})"/>${stars}
  <rect x="7" y="7" width="286" height="486" rx="14" fill="none" stroke="url(#gd${o.serial})" stroke-width="3.5"/>
  <rect x="15" y="15" width="270" height="470" rx="10" fill="none" stroke="${G}" stroke-width=".8" opacity=".7"/>
  ${[[15, 15], [285, 15], [15, 485], [285, 485]].map(([x, y]) => `<path d="M${x} ${y} m-6 0 l6 -6 l6 6 l-6 6z" fill="url(#gd${o.serial})"/>`).join('')}
  ${t(150, 37, 10.5, 'CARTA DA ALMA', G, 'letter-spacing="3.5" font-weight="700"')}
  ${t(150, 50, 8, 'Nº ' + o.serial.slice(0, 4) + '·' + o.serial.slice(4), G2, 'letter-spacing="2" opacity=".75"')}
  <circle cx="150" cy="138" r="88" fill="url(#sky${o.serial})" stroke="url(#gd${o.serial})" stroke-width="2"/>
  <circle cx="150" cy="138" r="82" fill="none" stroke="${G}" stroke-width=".5" opacity=".5" stroke-dasharray="1 3"/>
  ${cons}
  ${rays}
  <circle cx="${cx}" cy="${cy}" r="64" fill="url(#md${o.serial})" stroke="url(#gd${o.serial})" stroke-width="2.4"/>
  <circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${G}" stroke-width=".7" opacity=".6"/>
  ${ticks}
  ${t(cx, cy + 17, 46, SIGNS[o.s].g + TXT, G2, 'filter="url(#sg)"')}
  ${moon}${ascM}
  <path d="M40 404 L260 404 L270 420 L260 436 L40 436 L30 420Z" fill="${c0}" stroke="url(#gd${o.serial})" stroke-width="1.6"/>
  ${opt.noText ? '' : t(150, 426, soulNameSz(o.first), esc(o.first.toUpperCase()), G2, 'letter-spacing="3" font-weight="700"')}
  ${t(150, 456, 10, esc(AR) + ' · ' + esc(o.stone), G, 'letter-spacing="1"')}
  ${t(150, 472, 9, 'Alma ' + SOUL_NUM_W[o.n] + ' · ' + E.n, G2, 'opacity=".8" letter-spacing="1"')}
</svg>`);
}

// Versão 2: profundidade (portal em túnel, céu em poço, medalhão em relevo, fita com sombra)
const soulPaw = (x, y, s, f, extra = '') => `<g transform="translate(${x.toFixed ? x.toFixed(1) : x} ${y.toFixed ? y.toFixed(1) : y}) scale(${s})" fill="${f}" ${extra}><ellipse cx="0" cy="1.6" rx="2.3" ry="1.9"/><circle cx="-2.5" cy="-1.4" r="1"/><circle cx="-.9" cy="-2.7" r="1"/><circle cx=".9" cy="-2.7" r="1"/><circle cx="2.5" cy="-1.4" r="1"/></g>`; // pegada (cartas dos patudos)
function soulSVG2(o, opt = {}) {
  const E = SOUL_EL[o.el] || SOUL_EL.ar, [c0, c1, c2] = E.c, G = '#f2c76e', G2 = '#fff1c4', C = o.col ? o.col[1] : G, r = seeded('pó' + o.serial), W = 300, H = 500, id = o.serial;
  const t = (x, y, s, txt, f, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${s}" fill="${f}" ${extra}>${txt}</text>`;
  // estrelas de fundo (longe = pequenas e ténues)
  let stars = ''; for (let i = 0; i < 60; i++) { const x = 20 + r() * 260, y = 20 + r() * 460, a = (.2 + r() * .5).toFixed(2); stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.3 + r() * .9).toFixed(2)}" fill="#fff" opacity="${a}"/>`; }
  // túnel: molduras que recuam para dentro
  let tunnel = ''; for (let k = 0; k < 6; k++) { const ins = 18 + k * 7, op = (.75 - k * .11).toFixed(2); tunnel += `<rect x="${ins}" y="${ins}" width="${W - 2 * ins}" height="${H - 2 * ins}" rx="${14 - k}" fill="none" stroke="${k ? G : `url(#gd${id})`}" stroke-width="${k ? .7 : 1.4}" opacity="${op}"/>`; }
  // poço do céu
  const sx = 150, sy = 150, SR = 92;
  let well = ''; for (let k = 0; k < 7; k++) { const rr = SR - k * 6; well += `<circle cx="${sx}" cy="${sy}" r="${rr}" fill="none" stroke="${k ? c2 : `url(#gd${id})`}" stroke-width="${k ? .6 : 2.6}" opacity="${k ? (.5 - k * .06).toFixed(2) : 1}"/>`; }
  let deep = ''; for (let i = 0; i < 45; i++) { const a = r() * 6.283, d = Math.pow(r(), .7) * (SR - 14); deep += `<circle cx="${(sx + Math.cos(a) * d).toFixed(1)}" cy="${(sy + Math.sin(a) * d).toFixed(1)}" r="${(.25 + (d / SR) * .9).toFixed(2)}" fill="#fff" opacity="${(.25 + (d / SR) * .6).toFixed(2)}"/>`; }
  const fp = soulPrint(o.serial); let ring = ''; for (let i = 0; i < 48; i++) if (fp[i]) { const a0 = (i / 48) * Math.PI * 2 - Math.PI / 2, a1 = a0 + Math.PI * 2 / 48 * .72, R1 = SR + 10; ring += `<path d="M${(sx + Math.cos(a0) * R1).toFixed(1)} ${(sy + Math.sin(a0) * R1).toFixed(1)} A${R1} ${R1} 0 0 1 ${(sx + Math.cos(a1) * R1).toFixed(1)} ${(sy + Math.sin(a1) * R1).toFixed(1)}" stroke="${i % 6 ? G : C}" stroke-width="${i % 6 ? 1.6 : 2.4}" fill="none" stroke-linecap="round" opacity=".9"/>`; }
  const nx = 35 + (fp.slice(0, 8).reduce((a, b, i) => a + b * (1 << i), 0) % 31), ny = 35 + (fp.slice(8, 16).reduce((a, b, i) => a + b * (1 << i), 0) % 31);
  const sh = soulShape(o), box = p => [sx - 70 + p[0] * 140, sy - 66 + p[1] * 132], mineP = (sh.mine === 'L' ? sh.L : sh.R).map(box), otherP = (sh.mine === 'L' ? sh.R : sh.L).map(box);
  const path = P => P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '), join = sh.mine === 'L' ? [mineP[3], otherP[0]] : [otherP[3], mineP[0]];
  const cons = `<path d="${path(otherP)}" fill="none" stroke="${G2}" stroke-width=".9" stroke-dasharray="2 4" opacity=".4"/>${otherP.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.4" fill="none" stroke="${G2}" stroke-width=".8" opacity=".5"/>`).join('')}
    <path d="M${join[0][0].toFixed(1)} ${join[0][1].toFixed(1)} L${join[1][0].toFixed(1)} ${join[1][1].toFixed(1)}" stroke="${C}" stroke-width="1" stroke-dasharray="1 3" opacity=".8"/>
    <path d="${path(mineP)}" fill="none" stroke="${G}" stroke-width="1.7" filter="url(#gl${id})"/>${mineP.map((p, i) => o.pet ? soulPaw(p[0], p[1], i % 2 ? 1.1 : 1.45, G2, `filter="url(#gl${id})"`) : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i % 2 ? 3 : 4}" fill="${G2}" filter="url(#gl${id})"/>`).join('')}`;
  // medalhão em relevo
  const cx = 150, cy = 330;
  let rays = ''; for (let i = 0; i < o.n * 4 + 8; i++) { const a = i / (o.n * 4 + 8) * Math.PI * 2, r1 = 64, r2 = i % 4 ? 74 : 84; rays += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="${C}" stroke-width="${i % 4 ? .8 : 1.7}" stroke-linecap="round" opacity="${i % 4 ? .45 : .95}"/>`; }
  let ticks = ''; for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; ticks += `<circle cx="${(cx + Math.cos(a) * 50).toFixed(1)}" cy="${(cy + Math.sin(a) * 50).toFixed(1)}" r="${i === o.s ? 2.6 : 1.1}" fill="${i === o.s ? G2 : G}"/>`; }
  const at = (k, rad) => { const a = (k * 30 - 90) * Math.PI / 180; return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]; };
  const gem = (p, inner) => `<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})" filter="url(#ds${id})"><circle r="10" fill="url(#bv${id})"/><circle r="7.6" fill="${c0}"/>${inner}</g>`;
  const moon = gem(at(o.m, 60), `<path d="M2.2 -5.2 A5.6 5.6 0 1 0 2.2 5.2 A4.3 4.3 0 1 1 2.2 -5.2Z" fill="${G2}"/>`);
  const ascM = o.asc != null ? gem(at(o.asc, 60), `<path d="M0 -3.8 L3.4 2.6 L-3.4 2.6Z" fill="${G2}"/>`) : '';
  const AR = TAROT[o.ar] ? TAROT[o.ar][0] : '';
  const DEFS = `  <defs>
    <radialGradient id="bg${id}" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="${c1}"/><stop offset=".6" stop-color="${c0}"/><stop offset="1" stop-color="#030208"/></radialGradient>
    <radialGradient id="vg${id}" cx="50%" cy="50%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <radialGradient id="wl${id}" cx="${nx}%" cy="${ny}%" r="55%"><stop offset="0" stop-color="${c2}" stop-opacity=".35"/><stop offset=".35" stop-color="${c1}" stop-opacity=".9"/><stop offset=".8" stop-color="#030208"/><stop offset="1" stop-color="#000"/></radialGradient>
    <radialGradient id="rim${id}" cx="50%" cy="50%" r="50%"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    <linearGradient id="gd${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6cf"/><stop offset=".3" stop-color="${G}"/><stop offset=".62" stop-color="#9c7124"/><stop offset=".85" stop-color="#f4d58a"/><stop offset="1" stop-color="#7d5a1c"/></linearGradient>
    <linearGradient id="bv${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6cf"/><stop offset=".45" stop-color="${G}"/><stop offset="1" stop-color="#5e4210"/></linearGradient>
    <radialGradient id="cf${id}" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="${C}" stop-opacity=".9"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c0}"/></radialGradient>
    <linearGradient id="sh${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="gl${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="ds${id}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="1.5" dy="3" stdDeviation="2.4" flood-color="#000" flood-opacity=".7"/></filter>
    <filter id="dd${id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".75"/></filter>
    <clipPath id="wc${id}"><circle cx="${sx}" cy="${sy}" r="${SR - 2}"/></clipPath>
    <mask id="mh${id}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${sx}" cy="${sy}" r="${SR}" fill="#000"/></mask>
  </defs>`;
  const BG = `<rect width="${W}" height="${H}" rx="18" fill="url(#bg${id})"/>${stars}
  ${tunnel}
  <rect width="${W}" height="${H}" rx="18" fill="url(#vg${id})"/>`;
  const FRAME = `<rect x="5" y="5" width="290" height="490" rx="15" fill="none" stroke="url(#gd${id})" stroke-width="5"/>
  <rect x="5" y="5" width="290" height="490" rx="15" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>
  ${[[18, 18], [282, 18], [18, 482], [282, 482]].map(([x, y]) => `<g filter="url(#ds${id})"><path d="M${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} L${x - 8} ${y}Z" fill="url(#bv${id})"/><circle cx="${x}" cy="${y}" r="2" fill="${C}"/></g>`).join('')}
  ${t(150, 40, 10.5, o.pet ? 'ALMA DE PATUDO' : 'CARTA DA ALMA', G, 'letter-spacing="3.5" font-weight="700"')}${o.pet ? soulPaw(56, 37, 1.2, G) + soulPaw(244, 37, 1.2, G) : ''}`;
  const BEZEL = `<g filter="url(#dd${id})"><circle cx="${sx}" cy="${sy}" r="${SR + 2}" fill="none" stroke="url(#bv${id})" stroke-width="5"/></g>
  ${ring}
  <path d="M${sx - SR + 6} ${sy - 10} A${SR - 6} ${SR - 6} 0 0 1 ${sx + SR - 6} ${sy - 10}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>`;
  const WELL = `<circle cx="${sx}" cy="${sy}" r="${SR}" fill="url(#wl${id})"/>
  <g clip-path="url(#wc${id})">${deep}${well}${soulMemStars(o, opt.mem || 0)}${cons}</g>
  <circle cx="${sx}" cy="${sy}" r="${SR}" fill="url(#rim${id})"/>`;
  const FRONT = `${rays}
  <g filter="url(#dd${id})"><circle cx="${cx}" cy="${cy}" r="62" fill="url(#bv${id})"/></g>
  <circle cx="${cx}" cy="${cy}" r="56" fill="url(#cf${id})"/>
  <circle cx="${cx}" cy="${cy}" r="56" fill="url(#rim${id})" opacity=".6"/>
  <circle cx="${cx}" cy="${cy}" r="42" fill="none" stroke="${G}" stroke-width=".7" opacity=".6"/>
  ${ticks}
  ${t(cx + 1.2, cy + 18.5, 46, SIGNS[o.s].g + TXT, '#000', 'opacity=".55"')}
  ${t(cx, cy + 17, 46, SIGNS[o.s].g + TXT, G2, 'filter="url(#gl' + id + ')"')}
  ${moon}${ascM}`;
  const RIBBON = `<g filter="url(#dd${id})"><path d="M22 420 L36 404 L36 436Z" fill="#6b4c16"/><path d="M278 420 L264 404 L264 436Z" fill="#6b4c16"/><path d="M36 400 L264 400 L276 420 L264 440 L36 440 L24 420Z" fill="url(#bv${id})"/></g>
  <path d="M40 404 L260 404 L270 420 L260 436 L40 436 L30 420Z" fill="${c0}"/>
  ${opt.noText ? '' : t(150, 427, soulNameSz(o.first, o.pet ? 15 : 17), esc(o.first.toUpperCase()), G2, 'letter-spacing="3" font-weight="700"')}${o.pet ? soulPaw(48, 420, 1.15, G) + soulPaw(252, 420, 1.15, G) : ''}
  ${t(150, 461, 10, esc(AR) + ' · ' + esc(o.stone), G, 'letter-spacing="1"')}
  ${t(150, 476, 8.5, 'Alma ' + SOUL_NUM_W[o.n] + ' · ' + (o.pet ? (SPECIES.find(x => x[0] === o.pet) || [0, 0, ''])[2] : E.n) + ' · Nº ' + o.serial.slice(0, 4) + '·' + o.serial.slice(4), G2, 'opacity=".75" letter-spacing="1"')}`;
  const SHEEN = `<rect width="${W}" height="${H}" rx="18" fill="url(#sh${id})" class="soulsheen"/>`;
  const wrapS = inner => svgClean(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}${inner}</svg>`);
  // camadas para o efeito 3D na app: fundo do poço (atrás), cartão com buraco, medalhão (à frente)
  if (opt.layer === 'back') return wrapS(`<circle cx="${sx}" cy="${sy}" r="${SR + 3}" fill="#030208"/>${WELL}`);
  if (opt.layer === 'base') return wrapS(`<g mask="url(#mh${id})">${BG}</g>${FRAME}${BEZEL}${RIBBON}`);
  if (opt.layer === 'front') return wrapS(FRONT);
  return wrapS(`${BG}${FRAME}${WELL}${BEZEL}${FRONT}${RIBBON}${SHEEN}`);
}

// ---------- Verso com o nosso QR (selo celeste) ----------
function soulQR(text, x, y, size, ink, paper) { // QR desenhado à nossa maneira: pontos redondos e olhos com estrela
  const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(), Z = 3, m = size / (n + Z * 2); let out = paper === 'none' ? '' : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${m * 1.6}" fill="${paper}"/>`;
  const eye = (r, c) => r < 7 && c < 7 || r < 7 && c >= n - 7 || r >= n - 7 && c < 7;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c) && !eye(r, c)) out += `<circle cx="${(x + (c + Z + .5) * m).toFixed(2)}" cy="${(y + (r + Z + .5) * m).toFixed(2)}" r="${(m * .5).toFixed(2)}" fill="${ink}"/>`;
  for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) { const X = x + (c + Z) * m, Y = y + (r + Z) * m; out += `<rect x="${X + m * .5}" y="${Y + m * .5}" width="${m * 6}" height="${m * 6}" rx="${m * .5}" fill="none" stroke="${ink}" stroke-width="${m}"/><rect x="${X + m * 2}" y="${Y + m * 2}" width="${m * 3}" height="${m * 3}" rx="${m * .5}" fill="${ink}"/>`; }
  return out;
}
const soulLink = o => 'https://ceudehoje.com/#alma=' + soulCode(o) + (o.sos ? '&sos=' + encodeURIComponent(o.sos) : ''); // patudos: contacto do humano para quem o encontrar
const soulSosOf = h => { const m = String(h || '').match(/[&?]sos=([^&\s]+)/); if (!m) return ''; try { return decodeURIComponent(m[1]).replace(/[<>]/g, '').slice(0, 40); } catch (e) { return ''; } };
// Fragilidades e proteções simbólicas (tradição astrológica)
const SOUL_WEAK = ['impaciência e impulsividade', 'teimosia e apego', 'dispersão e ansiedade', 'mágoas guardadas', 'orgulho ferido', 'autocrítica e preocupação', 'indecisão, agradar a todos', 'ciúme e desconfiança', 'promessas a mais, fugir', 'dureza contigo, cansaço', 'distância das emoções', 'absorver a dor dos outros'];
const SOUL_HEART = { fogo: 'explodes e depois arrependes-te', terra: 'fechas-te e guardas tudo', ar: 'pensas demais no que sentes', agua: 'afogas-te nas emoções' };
const SOUL_AFF = ['Respiro antes de agir: a minha força é escolher o momento.', 'Solto o que já não me serve e confio no que vem.', 'Uma coisa de cada vez: a minha mente encontra o centro.', 'Perdoo, solto e guardo só o que me faz bem.', 'Brilho por dentro, mesmo quando ninguém está a ver.', 'Sou suficiente tal como sou hoje.', 'A minha escolha também conta.', 'Confio, e deixo a luz entrar.', 'Fico, e descubro a aventura de estar presente.', 'Mereço descansar e celebrar o caminho.', 'Deixo-me sentir e deixo que cuidem de mim.', 'Cuido de mim antes de cuidar do mundo.'];
const SOUL_DAY = { mars: 'terça-feira', venus: 'sexta-feira', mercury: 'quarta-feira', moon: 'segunda-feira', sun: 'domingo', jupiter: 'quinta-feira', saturn: 'sábado' };
const soulMetal = s => SIGN_EXTRA[s].metal.replace(/\s*\(.*\)/, '');
function soulSigil(o, cx, cy, R, col) { // selo de proteção: as letras do nome ligam 9 pontos num círculo (sigilo numerológico)
  const L = nrm(o.first).replace(/[^a-z]/g, '').split('').map(c => ((c.charCodeAt(0) - 97) % 9)), pts = [...Array(9)].map((_, i) => { const a = (i / 9) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
  const seq = L.filter((v, i) => i === 0 || v !== L[i - 1]); if (seq.length < 2) seq.push((seq[0] + o.n) % 9);
  const d = seq.map((v, i) => (i ? 'L' : 'M') + pts[v][0].toFixed(1) + ' ' + pts[v][1].toFixed(1)).join(' '), a = pts[seq[0]], z = pts[seq[seq.length - 1]];
  return `<circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="none" stroke="${col}" stroke-width=".8" opacity=".7"/>${pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r=".9" fill="${col}" opacity=".6"/>`).join('')}<path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="2.2" fill="${col}"/><path d="M${(z[0] - 2.5).toFixed(1)} ${(z[1] - 2.5).toFixed(1)} L${(z[0] + 2.5).toFixed(1)} ${(z[1] + 2.5).toFixed(1)} M${(z[0] + 2.5).toFixed(1)} ${(z[1] - 2.5).toFixed(1)} L${(z[0] - 2.5).toFixed(1)} ${(z[1] + 2.5).toFixed(1)}" stroke="${col}" stroke-width="1.3"/>`;
}
// Verso: «Amuleto da alma». O QR é a Lua cheia da carta (pontos = crateras) e lê-se com qualquer câmara.
function soulBackSVG(o) {
  const E = SOUL_EL[o.el] || SOUL_EL.ar, [c0, c1, c2] = E.c, G = '#f2c76e', G2 = '#fff1c4', C = o.col ? o.col[1] : G, id = 'b' + o.serial, W = 300, H = 500, r = seeded('vs' + o.serial), fp = soulPrint(o.serial);
  const t = (x, y, sz, txt, f, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${sz}" fill="${f}" ${extra}>${txt}</text>`;
  let stars = ''; for (let i = 0; i < 80; i++) stars += `<circle cx="${(16 + r() * 268).toFixed(1)}" cy="${(16 + r() * 468).toFixed(1)}" r="${(.3 + r() * 1).toFixed(2)}" fill="#fff" opacity="${(.2 + r() * .55).toFixed(2)}"/>`;
  const cx = 150, cy = 146, MR = 80, QS = 106; let ring = '';
  for (let i = 0; i < 48; i++) if (fp[i]) { const R = MR + 10, a0 = (i / 48) * Math.PI * 2 - Math.PI / 2, a1 = a0 + Math.PI * 2 / 48 * .72; ring += `<path d="M${(cx + Math.cos(a0) * R).toFixed(1)} ${(cy + Math.sin(a0) * R).toFixed(1)} A${R} ${R} 0 0 1 ${(cx + Math.cos(a1) * R).toFixed(1)} ${(cy + Math.sin(a1) * R).toFixed(1)}" stroke="${i % 6 ? G : C}" stroke-width="${i % 6 ? 1.8 : 2.8}" fill="none" stroke-linecap="round"/>`; }
  let rays = ''; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, r1 = MR + 16, r2 = MR + (i % 3 ? 22 : 30); rays += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="${G}" stroke-width="${i % 3 ? .6 : 1.2}" opacity=".6"/>`; }
  const W2 = SIGNS[o.m].el, row = (y, k, v) => `<text x="58" y="${y}" font-family="Georgia,serif" font-size="7.5" fill="${G}" letter-spacing="1.5">${k}</text><text x="242" y="${y}" text-anchor="end" font-family="Georgia,serif" font-size="10" fill="${G2}">${esc(v)}</text>`;
  return svgClean(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs><radialGradient id="g${id}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset=".6" stop-color="${c0}"/><stop offset="1" stop-color="#030208"/></radialGradient>
  <radialGradient id="mn${id}" cx="42%" cy="38%" r="62%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".72" stop-color="#fff3d6"/><stop offset="1" stop-color="#e8cf98"/></radialGradient>
  <radialGradient id="mg${id}" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="${G2}" stop-opacity=".35"/><stop offset="1" stop-color="${G2}" stop-opacity="0"/></radialGradient>
  <linearGradient id="gd${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6cf"/><stop offset=".3" stop-color="${G}"/><stop offset=".62" stop-color="#9c7124"/><stop offset=".85" stop-color="#f4d58a"/><stop offset="1" stop-color="#7d5a1c"/></linearGradient>
  <filter id="d${id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".6"/></filter></defs>
  <rect width="${W}" height="${H}" rx="18" fill="url(#g${id})"/>${stars}
  <rect x="5" y="5" width="290" height="490" rx="15" fill="none" stroke="url(#gd${id})" stroke-width="5"/>
  <rect x="16" y="16" width="268" height="468" rx="10" fill="none" stroke="${G}" stroke-width=".7" opacity=".6"/>
  ${t(150, 38, 9.5, o.pet ? (o.sos ? 'SE ME ENCONTRARES, LÊ-ME' : 'LÊ A ALMA DO PATUDO') : 'LÊ A MINHA ALMA', G, 'letter-spacing="' + (o.pet && o.sos ? 2 : 3.5) + '" font-weight="700"')}
  ${rays}${ring}
  <circle cx="${cx}" cy="${cy}" r="${MR + 8}" fill="url(#mg${id})"/>
  <g filter="url(#d${id})"><circle cx="${cx}" cy="${cy}" r="${MR}" fill="url(#mn${id})" stroke="url(#gd${id})" stroke-width="2"/></g>
  ${[[0, 67, 6], [90, 66, 4.5], [180, 68, 5.5], [270, 66, 4], [45, 74, 3], [225, 74, 3.5], [135, 74, 2.5], [315, 74, 3]].map(([ang, d, rr]) => { const a = ang * Math.PI / 180; return `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" r="${rr}" fill="#d9bd82" opacity=".45"/>`; }).join('')}
  ${soulQR(soulLink(o), cx - QS / 2, cy - QS / 2, QS, '#1a1240', 'none')}
  ${t(150, 262, 9.5, 'AMULETO DA ALMA', G, 'letter-spacing="3.5" font-weight="700"')}
  ${soulSigil(o, 150, 296, 18, G2)}
  ${t(150, 336, 8, 'FRAGILIDADE', G, 'letter-spacing="2" opacity=".85"')}
  ${t(150, 350, 10.5, esc(cap1(SOUL_WEAK[o.s])), G2)}
  ${t(150, 364, 9, 'coração: ' + esc(SOUL_HEART[W2]), G2, 'opacity=".8" font-style="italic"')}
  <line x1="58" y1="374" x2="242" y2="374" stroke="${G}" stroke-width=".5" opacity=".5"/>
  ${row(388, 'PEDRA', o.stone)}${row(402, 'METAL', soulMetal(o.s))}${row(416, 'PLANTA', SIGN_EXTRA[o.s].planta)}${row(430, 'DIA', cap1(SOUL_DAY[SIGNS[o.s].ruler] || ''))}
  ${t(150, 450, 9, '«' + esc(SOUL_AFF[o.s]) + '»', G2, 'font-style="italic"')}
  ${t(150, 472, 8, esc(o.first.toUpperCase()) + ' · Nº ' + o.serial.slice(0, 4) + '·' + o.serial.slice(4) + ' · ceudehoje.com', G, 'letter-spacing="1.2" opacity=".85"')}
</svg>`);
}

// ---------- Leitura da alma ----------
const SOUL_SUN = ['Coragem que abre caminho: és de quem começa, arrisca e puxa os outros.', 'Calma que dura: és porto seguro, sabes esperar e fazes as coisas crescer.', 'Mente que voa: curiosidade sem fim, palavra fácil e mil interesses.', 'Coração que protege: cuidas, lembras-te de tudo e fazes de qualquer sítio um lar.', 'Luz que aquece: generosidade, presença e vontade de fazer os outros brilhar.', 'Mãos que cuidam do pormenor: tens olho para o que os outros não veem e tornas tudo melhor.', 'Alma que harmoniza: procuras beleza, justiça e o meio-termo certo.', 'Profundidade que transforma: sentes tudo a fundo e renasces das cinzas.', 'Fogo que procura sentido: liberdade, aventura e fé no que vem.', 'Montanha que se sobe: ambição tranquila, responsabilidade e palavra dada.', 'Mente que inventa: original, livre e com olhos postos no futuro.', 'Mar que sente tudo: intuição, compaixão e uma imaginação sem margens.'];
const SOUL_MOON = { fogo: 'sentes depressa e com intensidade: precisas de entusiasmo e de quem acompanhe o teu ritmo', terra: 'sentes com os pés no chão: precisas de segurança, rotinas e gestos concretos de carinho', ar: 'sentes através das palavras: precisas de conversa, leveza e espaço para respirar', agua: 'sentes como uma maré: precisas de intimidade, ternura e de quem perceba o que não dizes' };
const SOUL_ASC = { fogo: 'chegas com energia e os outros veem-te como alguém decidido', terra: 'transmites confiança e calma logo à primeira vista', ar: 'passas simpatia e leveza: é fácil chegar até ti', agua: 'ao início guardas-te um pouco, mas inspiras confiança e mistério' };
function soulReading(o) {
  const sec = (ic, h, p) => `<div class="soulsec"><b>${ic} ${h}</b><p>${p}</p></div>`, I = NUM_INFO[o.n] || {}, A = TAROT[o.ar] || ['', '', ''];
  return sec(SIGNS[o.s].g + TXT, `Sol em ${SIGNS[o.s].n}: a tua essência`, SOUL_SUN[o.s])
    + sec('☾', `Lua em ${SIGNS[o.m].n}: o teu coração`, cap1(SOUL_MOON[SIGNS[o.m].el]) + '.')
    + (o.asc != null ? sec('▲', `Ascendente em ${SIGNS[o.asc].n}: como te veem`, cap1(SOUL_ASC[SIGNS[o.asc].el]) + '.') : '')
    + sec('✦', `Alma ${SOUL_NUM_W[o.n]} (número ${o.lp || o.n})`, (I.e || '') + (I.f ? ` Forças: ${I.f}.` : ''))
    + sec('🃏', `Arcano de nascimento: ${A[0]}`, `A carta que te acompanha desde que nasceste fala de ${A[2]}.`)
    + sec('🛡️', 'O teu amuleto da alma', `A tua fragilidade: <b>${SOUL_WEAK[o.s]}</b>; no coração, ${SOUL_HEART[SIGNS[o.m].el]}. A tradição junta-te a <b>${o.stone}</b>, o <b>${soulMetal(o.s).toLowerCase()}</b>, a planta <b>${SIGN_EXTRA[o.s].planta.toLowerCase()}</b> e a ${SOUL_DAY[SIGNS[o.s].ruler] || ''}. O teu lema: «${SOUL_AFF[o.s]}» <span class="note">São símbolos e lembretes, não poderes mágicos 😉</span>`)
    + sec('💎', `Pedra: ${o.stone} · cor da alma: ${o.col ? o.col[0] : ''}`, `${SOUL_EL[o.el].e} Elemento ${SOUL_EL[o.el].n}. Leva a tua pedra ou a tua cor contigo nos dias importantes.`);
}
function soulCapToday() { const n = SMEM.all().filter(x => x.open && x.open <= todayStr() && x.open >= dayStr(noonJd(todayStr()) - 7)).length; return n ? `<button class="soulwant capnow" id="soulCapGo"><b>💌 ${n === 1 ? 'Abriu uma cápsula do tempo' : `Abriram ${n} cápsulas do tempo`}</b><p>A tua alma guardou uma memória para ti. Toca para a ler.</p></button>` : ''; }
function soulWantTxt(o) { const w = soulWant(o); return `☉ ${SIGNS[w.s].n} · ☾ ${SIGNS[w.m].n} · nº ${w.n}`; }

// ---------- Carta 3D (camadas) ----------
function soul3dHtml(o, back) {
  const mem = SMEM.all().filter(memOpen).length;
  return `<div class="soul3d${back ? ' flip' : ''}" id="soul3d"><div class="sface sfront"><div class="sl sbk">${soulSVG2(o, { layer: 'back', mem })}</div><div class="sl">${soulSVG2(o, { layer: 'base' })}</div><div class="sl sfr">${soulSVG2(o, { layer: 'front' })}</div><div class="ssheen"></div></div><div class="sface sback">${soulBackSVG(o)}<div class="ssheen"></div></div></div>`;
}
let _soulTilt = null;
function bindSoulTilt() {
  const el = $('#soul3d'); if (!el) return; let rx = 0, ry = 0;
  const apply = () => { el.style.setProperty('--rx', rx.toFixed(2) + 'deg'); el.style.setProperty('--ry', ry.toFixed(2) + 'deg'); el.style.setProperty('--sx', (50 + ry * 2.4).toFixed(1) + '%'); el.style.setProperty('--sy', (50 - rx * 2.4).toFixed(1) + '%'); };
  el.onpointermove = e => { const b = el.getBoundingClientRect(); ry = ((e.clientX - b.left) / b.width - .5) * 30; rx = -((e.clientY - b.top) / b.height - .5) * 24; apply(); };
  el.onpointerleave = () => { rx = 0; ry = 0; apply(); };
  if (_soulTilt) window.removeEventListener('deviceorientation', _soulTilt);
  _soulTilt = e => { if (e.gamma == null) return; ry = Math.max(-18, Math.min(18, e.gamma * .6)); rx = Math.max(-14, Math.min(14, (e.beta - 45) * -.4)); apply(); };
  window.addEventListener('deviceorientation', _soulTilt);
}
async function soulMotionOk() { try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') await DeviceOrientationEvent.requestPermission(); } catch (e) { } }

// ---------- Abrir a minha carta ----------
function soulMoonDoubt() { // sem hora de nascimento, a Lua pode ter mudado de signo nesse dia
  const p = P.get(); if (!p || !p.d || p.t) return ''; const a = soulOf(Object.assign({}, p, { t: '00:00' })), z = soulOf(Object.assign({}, p, { t: '23:59' }));
  return a.m === z.m ? '' : `<div class="soulwant"><b>🌙 A tua Lua está indecisa</b><p>No dia em que nasceste a Lua passou de ${SIGNS[a.m].n} para ${SIGNS[z.m].n}. Sem a hora de nascimento, usei o meio-dia.</p><p class="note">Se souberes a hora, junta-a no teu perfil: a carta fica certa (e muda, por isso faz isto antes de a partilhar ou imprimir).</p></div>`;
}
async function soulSendLink(o, msg = '💫 Esta é a minha Carta da Alma. Abre e descobre se és a minha metade:') {
  soulSeal(o);
  const url = soulLink(o), txt = `${msg} ${url}`; try { if (navigator.share) { await navigator.share({ title: 'A minha Carta da Alma', text: msg, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(txt); } catch (e) { if (!copySync(txt)) { toast('Não deu para copiar'); return; } } toast('Link copiado 📋');
}
// Selo: a partir da 1.ª partilha / link / chip, a carta fica fixa (mudar o perfil já não a muda)
const soulSealed = () => { try { const j = JSON.parse(store.get('ceu_soul_seal') || 'null'); return j && j.o && j.o.serial ? j : null; } catch (e) { return null; } };
function soulSeal(o) { if (!o || o.pet || soulSealed()) return; store.set('ceu_soul_seal', JSON.stringify({ o, d: todayStr() })); }
function soulFresh() { const p = P.get(); return p && p.d ? soulOf(p) : null; }
function soulMe() { const j = soulSealed(); if (j) return j.o; return soulFresh(); }
function soulSealBox(o) {
  const j = soulSealed(); if (!j) return '';
  const f = soulFresh(), changed = f && f.serial !== j.o.serial, dd = j.d.split('-').reverse().join('/');
  return `<div class="soulwant"><b>🔏 Carta selada desde ${dd}</b><p>${changed ? 'Mudaste o teu perfil, mas a tua carta continua a mesma: é ela que está nos links, no QR e nos chips que já partilhaste.' : 'Desde que a partilhaste, esta é para sempre a tua carta, mesmo que mudes o perfil.'}</p>${changed ? '<button class="btn" id="soulRedo" style="width:100%">↻ Refazer a minha carta com o perfil novo</button>' : ''}</div>`;
}
function openSoul() {
  const dlg = $('#soulDlg'), o = soulMe();
  if (!o) { soulWelcome(true); return; }
  const first = !store.get('ceu_soul_seen');
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="soulX" aria-label="Fechar">✕</button>
    <p class="soulhint" id="soulHint">${first ? 'A tua alma tem uma carta só tua. Toca para a revelar ✨' : 'Inclina o telemóvel ou passa o dedo pela carta'}</p>
    <div class="soulstage">${soul3dHtml(o, first)}</div>
    <div class="soulbtns"><button class="btn" id="soulFlip">↻ Ver o verso</button><button class="btn main" id="soulSh">📤 Partilhar</button><button class="btn" id="soulLk">🔗 Enviar o link</button>${'NDEFReader' in window ? '<button class="btn" id="soulNfc">📶 Gravar num chip NFC</button>' : ''}${SOUL_SHOP ? '<button class="btn soon" data-soon="porta-chaves">🔑 Encomendar porta-chaves <small>brevemente</small></button><button class="btn soon" data-soon="carta">🃏 Encomendar a carta <small>brevemente</small></button>' : ''}</div>
    <div class="soulinfo" id="soulInfo"${first ? ' hidden' : ''}>
      ${soulTodayHtml(o)}${soulSealBox(o) || soulMoonDoubt()}
      <div class="soulwant"><b>💞 A tua metade perfeita</b><p>${soulWantTxt(o)}</p><p class="note">Só cerca de 1 em cada 1300 pessoas tem estas três ligações contigo. Partilha a tua carta: quem a ler descobre se é a tua metade.</p></div>
      ${soulCapToday()}<div class="soulbtns"><button class="btn" id="soulVault">🔐 Cofre da alma (${SMEM.all().length})</button><button class="btn" id="soulRead">🔭 Ler a carta de alguém</button><button class="btn" id="soulLinks">💫 As minhas ligações (${soulLinks().length})</button><button class="btn" id="soulFam">👨‍👩‍👧 Alma da família</button></div>
      <h3 class="soulh">A leitura da tua alma</h3>${soulReading(o)}
      <p class="note">Nº ${o.serial.slice(0, 4)}·${o.serial.slice(4)} · a tua carta é calculada a partir do teu nome e nascimento e é só tua. Inspirada na tradição astrológica, para te divertires e refletires.</p>
    </div></div>`;
  dlg.showModal(); bindSoulTilt();
  $('#soulX').onclick = () => dlg.close();
  const card = $('#soul3d');
  card.onclick = async () => { if (first && !store.get('ceu_soul_seen')) { await soulMotionOk(); store.set('ceu_soul_seen', todayStr()); card.classList.add('reveal'); card.classList.remove('flip'); $('#soulHint').textContent = 'Esta é a tua alma. Inclina o telemóvel ✨'; try { confetti(); } catch (e) { } setTimeout(() => { $('#soulInfo').hidden = false; }, 900); } };
  $('#soulFlip').onclick = async () => { await soulMotionOk(); card.classList.toggle('flip'); $('#soulFlip').textContent = card.classList.contains('flip') ? '↻ Ver a frente' : '↻ Ver o verso'; };
  $('#soulSh').onclick = () => shareSoul(o);
  $('#soulLk').onclick = () => soulSendLink(o);
  if ($('#soulRedo')) $('#soulRedo').onclick = () => { if (!confirmBox('Refazer a tua Carta da Alma com o perfil novo?\n\nVais ter uma carta nova. Os links, QR e chips que já partilhaste continuam a abrir a carta antiga, que deixa de ser a tua.')) return; try { localStorage.removeItem('ceu_soul_seal'); } catch (e) { } toast('✨ A tua carta nova está pronta'); openSoul(); };
  if ($('#soulNfc')) $('#soulNfc').onclick = () => soulWriteNfc(o);
  dlg.querySelectorAll('[data-soon]').forEach(b => b.onclick = () => toast(b.dataset.soon === 'carta' ? '🃏 Em breve vais poder encomendar a tua carta impressa a sério ✨' : '🔑 Em breve vais poder encomendar o teu porta-chaves da alma ✨', 4000));
  $('#soulVault').onclick = () => soulVault(); if ($('#soulCapGo')) $('#soulCapGo').onclick = () => soulVault();
  $('#soulRead').onclick = () => soulReader();
  $('#soulLinks').onclick = () => soulLinksView(); $('#soulFam').onclick = familySoulView;
}

// ---------- Partilhar (frente + selo QR) ----------
function svgImg(svg) { return new Promise(res => { const im = new Image(); im.onload = () => (im.decode ? im.decode().then(() => res(im), () => res(im)) : res(im)); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }); }
async function shareSoul(o) {
  soulSeal(o);
  await fontsReady(); const [c, ctx, W, H] = newCanvas(1080, 1350), E = SOUL_EL[o.el];
  bg(ctx, W, H, 'alma' + o.serial, [E.c[1], '#07050f']);
  const fr = await svgImg(soulSVG2(o)), bk = await svgImg(soulBackSVG(o)); if (!fr) { toast('Não deu para criar a imagem'); return; }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.drawImage(fr, 50, 160, 520, 867); ctx.restore();
  if (bk) { ctx.save(); ctx.translate(815, 600); ctx.rotate(.04); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.drawImage(bk, -215, -358, 430, 717); ctx.restore(); }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 46px Cinzel'; ctx.fillText(o.pet ? `A ALMA DE ${o.first.toUpperCase()}` : 'A MINHA CARTA DA ALMA', W / 2, 100);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; ctx.fillText(o.pet ? 'Procura o seu humano perfeito:' : 'Procuro a minha metade:', W / 2, 1150);
  ctx.fillStyle = '#f7e08a'; ctx.font = '700 40px Manrope'; ctx.fillText(soulWantTxt(o), W / 2, 1206);
  ctx.fillStyle = '#d9d0ff'; ctx.font = '500 28px Manrope'; ctx.fillText('Lê o QR e descobre se és tu 💞', W / 2, 1252);
  brandFoot(ctx, W, H, H - 40);
  shareCanvases([{ c, name: 'carta-da-alma' }], o.pet ? `🐾 Esta é a Carta da Alma de ${o.first}, única no mundo. Procura o seu humano perfeito: ${soulWantTxt(o)}. Lê o QR ou abre ${soulLink(o)} e descobre se és tu! #CéuDeHoje #CartaDaAlma` : `💫 A minha Carta da Alma é única. Procuro a minha metade: ${soulWantTxt(o)}. Lê o QR ou abre ${soulLink(o)} e descobre se és tu! #CéuDeHoje #CartaDaAlma`);
}

// ---------- Leitor do Céu ----------
const soulLinks = () => { try { return JSON.parse(store.get('ceu_soul_links') || '[]'); } catch (e) { return []; } };
function soulPairTxt(l, me, other) { // humanos e patudos: o mesmo céu, outras palavras
  const [h, p] = soulLvlTxt(l); if (!me.pet && !other.pet) return [h, p];
  if (l < 3) return [h, p.replace('aprendem muito um com o outro', 'têm muito para aprender juntos')];
  if (me.pet && other.pet) return ['🐾 Melhores amigos de alma', `${me.first} e ${other.first} têm constelações que encaixam: Sol, Lua e número complementares. Amigos para a vida.`];
  const pet = me.pet ? me : other, hum = me.pet ? other : me;
  return ['💛 Humano e patudo de alma', `${hum.first} é o humano perfeito de ${pet.first}: Sol, Lua e número complementares. Uma ligação que acontece a cerca de 1 em cada 1300.`];
}
const SPET_SUN = ['corajoso e impaciente: quer ser o primeiro em tudo e corre antes de pensar', 'calmo e guloso: adora rotinas, sestas longas e o colo de sempre', 'curioso e brincalhão: tudo é novidade e aborrece-se depressa', 'meigo e caseiro: protege a família e gosta do seu cantinho', 'vaidoso e generoso: adora atenção e ser o centro da festa', 'atento e arrumadinho: repara em tudo e gosta das coisas no lugar', 'sociável e encantador: dá-se bem com todos e detesta conflitos', 'intenso e leal: escolhe o seu humano e é para sempre', 'aventureiro e feliz: quer explorar, passear e conhecer mundo', 'paciente e teimoso: faz as coisas à sua maneira e no seu tempo', 'independente e original: tem manias só dele e surpreende sempre', 'sonhador e sensível: sente o teu humor antes de ti'];
const SPET_MOON = { fogo: 'mostra o que sente na hora: festa, saltos e reclamações sonoras', terra: 'sente-se seguro com rotina, comida certa e mãos conhecidas', ar: 'acalma-se com companhia, conversa e coisas novas para ver', agua: 'é um coração mole: precisa de mimo, calma e do teu cheiro por perto' };
const SPET_NUM = ['', 'líder da matilha', 'companheiro de colo', 'palhaço da casa', 'guardião fiel', 'explorador incansável', 'cuidador da família', 'pensador misterioso', 'pequeno chefe', 'alma velha e sábia'];
function soulPetReading(o) {
  const sec = (ic, h, p) => `<div class="soulsec"><b>${ic} ${h}</b><p>${p}</p></div>`, sp = SPECIES.find(x => x[0] === o.pet) || ['', '🐾', 'Patudo'];
  return sec(SIGNS[o.s].g + TXT, `Sol em ${SIGNS[o.s].n}: a essência de ${esc(o.first)}`, cap1(SPET_SUN[o.s]) + '.')
    + sec('☾', `Lua em ${SIGNS[o.m].n}: o coração`, cap1(SPET_MOON[SIGNS[o.m].el]) + '.')
    + sec('✦', `Alma ${SOUL_NUM_W[o.n]} (número ${o.n})`, `Na família, é o <b>${SPET_NUM[o.n]}</b>.`)
    + sec('💞', 'O humano perfeito', `Procura alguém com ${soulWantTxt(o)}. Tem esses três? É o humano da alma de ${esc(o.first)} ${sp[1]}`)
    + sec('💎', `Pedra: ${o.stone} · cor: ${o.col ? o.col[0] : ''}`, `${SOUL_EL[o.el].e} Elemento ${SOUL_EL[o.el].n}. Uma coleira, uma manta ou uma medalha nesta cor ficam-lhe a matar.`);
}
function soulLvlTxt(l) { return l === 3 ? ['✨ Almas gémeas', 'As vossas constelações encaixam na perfeição: Sol, Lua e número complementares. Acontece a cerca de 1 em cada 1300 pessoas.'] : l === 2 ? ['🌗 Constelação quase completa', 'Duas das três ligações da alma: uma ligação rara e forte.'] : l === 1 ? ['🌙 Um fio de luz', 'Uma ligação da alma em comum: há algo que vos une.'] : ['⭐ Céus diferentes', 'As vossas constelações não se tocam, e isso também é bonito: aprendem muito um com o outro.']; }
function scanQR() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices) return Promise.resolve(null);
  return (async () => {
    let det; try { det = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { return null; }
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); } catch (e) { toast('Sem acesso à câmara'); return null; }
    const dl = $('#scanDlg'), h2 = dl.querySelector('h2'), pp = dl.querySelector('p'), o2 = h2.textContent, op = pp.textContent; h2.textContent = '🔭 Leitor do Céu'; pp.textContent = 'Aponta a câmara ao QR do verso da Carta da Alma.';
    const v = $('#scanVid'); v.srcObject = stream; await v.play(); dl.showModal();
    return new Promise(res => {
      let done = false; const stop = val => { if (done) return; done = true; stream.getTracks().forEach(t => t.stop()); h2.textContent = o2; pp.textContent = op; if (dl.open) dl.close(); res(val); };
      $('#scanCancel').onclick = () => stop(null); dl.onclose = () => stop(null);
      const loop = async () => { if (done) return; try { const c = await det.detect(v); const hit = c.find(x => /#alma=/.test(x.rawValue)); if (hit) return stop(hit.rawValue); } catch (e) { } requestAnimationFrame(loop); }; loop();
    });
  })();
}
function soulReader(petMe) {
  const dlg = $('#soulDlg');
  dlg.innerHTML = `<div class="soulwrap"><h2>🔭 Leitor do Céu</h2><p>Lê a Carta da Alma de alguém e descobre se as vossas constelações encaixam.</p>
    ${'BarcodeDetector' in window ? '<button class="btn main" id="srCam" style="width:100%">📷 Ler o QR com a câmara</button>' : '<p class="note">📷 Aponta a câmara normal do telemóvel ao QR da carta: abre logo aqui.</p>'}
    <label style="display:block;margin-top:12px">Ou cola o link da carta<input type="text" id="srTxt" placeholder="https://ceudehoje.com/#alma=…"></label>${navigator.clipboard && navigator.clipboard.readText ? '<button class="btn" id="srPaste" style="width:100%;margin-top:8px">📋 Colar o link que copiei</button>' : ''}
    <div class="dlgfoot"><button class="btn" id="srBack">Voltar</button><button class="btn main" id="srGo">Ler a carta</button></div></div>`;
  if (!dlg.open) dlg.showModal();
  $('#srBack').onclick = petMe ? () => dlg.close() : openSoul;
  if (petMe) dlg.querySelector('h2').textContent = '🔭 Leitor do Céu · ' + petMe.first;
  const go = v => { const m = String(v || '').match(/alma=([^\s&]+)/) || [null, String(v || '').trim()]; const other = soulParse(decodeURIComponent(m[1] || '').replace(/\s/g, '') .replace(/%7E/gi, '~')) || soulParse(m[1]); if (!other) { toast('Esse link não é de uma Carta da Alma'); return; } soulMatch(other, { me: petMe, sos: soulSosOf(v) }); };
  $('#srGo').onclick = () => go($('#srTxt').value);
  if ($('#srPaste')) $('#srPaste').onclick = async () => { try { const v = await navigator.clipboard.readText(); if (!/alma=/.test(v || '')) return toast('Não encontrei um link de carta copiado. Cola-o à mão na caixa 👆'); $('#srTxt').value = v; go(v); } catch (e) { toast('Não consegui ler o que copiaste: cola à mão na caixa 👆'); } };
  if ($('#srCam')) $('#srCam').onclick = async () => { const v = await scanQR(); if (v) go(v); else if (!dlg.open) dlg.showModal(); };
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#smCopy'); if (!b) return; const t = b.dataset.l || ''; (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Link copiado ✓ Agora abre a app e cola-o em «Ler uma carta»', 5000), () => { prompt('Copia este link:', t); }); });
function soulMatch(other, opt = {}) {
  const dlg = $('#soulDlg'), me = opt.me || soulMe(), petMode = !!opt.me;
  const inApp = opt.fromLink && !opt.sos ? `<div class="soulinapp"><b>📲 Tens a app Céu de Hoje instalada?</b><p>Este link abriu no navegador, por isso a ligação fica guardada só aqui. Para ficar na tua app: copia o link e, na app, vai a <b>Carta da Alma → Ler uma carta → 📋 Colar</b>.</p><button class="btn main" id="smCopy" data-l="${esc(soulLink(other))}">📋 Copiar o link desta carta</button></div>` : '';
  const sosB = opt.sos && other.pet ? `<div class="soulsos"><b>🆘 Encontraste ${esc(other.first)}?</b><p>O humano deixou este contacto:</p><p class="big">${esc(opt.sos)}</p>${/\d{6,}/.test(opt.sos.replace(/\s/g, '')) ? `<a class="btn main" href="tel:${opt.sos.replace(/[^\d+]/g, '')}">📞 Ligar agora</a>` : ''}<p class="note">Obrigado por ajudares ${esc(other.first)} a voltar a casa 💛</p></div>` : '';
  if (!me) { dlg.innerHTML = `<div class="soulwrap"><h2>${other.pet ? '🐾' : '💫'} A carta de ${esc(other.first)}</h2>${sosB}${inApp}<div class="soulpair one">${soulSVG2(other)}</div><p>Para veres se as vossas almas encaixam, cria primeiro a tua carta: só precisas do teu nome e data de nascimento.</p>${other.pet ? soulPetReading(other) : soulReading(Object.assign({ lp: other.n }, other))}<div class="dlgfoot"><button class="btn" id="smX">Fechar</button><button class="btn main" id="smPf">Criar a minha carta</button></div></div>`; if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; $('#smX').onclick = () => dlg.close(); $('#smPf').onclick = () => soulWelcome(true, () => soulMatch(other, opt)); return; }
  if (other.serial === me.serial) { toast(petMode ? `Essa é a carta de ${me.first} 😄` : 'Essa é a tua própria carta 😄'); return petMode ? dlg.close() : openSoul(); }
  const l = soulLevel(me, other), [h, p] = soulPairTxt(l, me, other), pct = bond(me.s, other.s).pct, w = soulWant(me);
  if (!petMode) { const prev = soulLinks().find(x => x.serial === other.serial), L = soulLinks().filter(x => x.serial !== other.serial); L.unshift({ serial: other.serial, first: other.first, code: soulCode(other), l, pct, d: todayStr(), near: !!(prev && prev.near), pet: other.pet || '' }); store.set('ceu_soul_links', JSON.stringify(L.slice(0, 5000))); soulMilestone(); }
  const chk = (ok, txt) => `<li class="${ok ? 'ok' : ''}">${ok ? '✦' : '·'} ${txt}</li>`;
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="smX" aria-label="Fechar">✕</button>${sosB}${inApp}<h2>${h}</h2>
    <div class="soulpair lvl${l}"><div class="sp a">${soulSVG2(me)}</div><div class="sp b">${soulSVG2(other)}</div>${l === 3 ? '<div class="spglow"></div><svg class="spbridge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" vector-effect="non-scaling-stroke" d="M33 30 Q50 6 67 30"/></svg><i class="spstar">✦</i>' : l === 2 ? '<svg class="spbridge half" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" vector-effect="non-scaling-stroke" d="M33 30 Q50 6 67 30"/></svg>' : ''}</div>
    <p>${p}</p>
    <ul class="soulchk">${chk(other.s === w.s, `Sol: ${SIGNS[me.s].n} ↔ ${SIGNS[other.s].n}`)}${chk(other.m === w.m, `Lua: ${SIGNS[me.m].n} ↔ ${SIGNS[other.m].n}`)}${chk(other.n === w.n, `Números da alma: ${me.n} + ${other.n}${other.n + me.n === 10 ? ' = 10' : ''}`)}</ul>
    <p class="note">Compatibilidade dos signos: ${pct}%.${petMode ? '' : ' A ligação ficou guardada na tua carta, em "As minhas ligações".'}</p>
    <h3 class="soulh">A alma de ${esc(other.first)}</h3>${other.pet ? soulPetReading(other) : soulReading(Object.assign({ lp: other.n }, other))}
    <button class="btn" id="smRet" style="width:100%;margin-top:6px">💌 Enviar ${petMode ? 'a carta de ' + esc(me.first) : 'a minha carta'} a ${esc(other.first)}</button><div class="dlgfoot"><button class="btn" id="smBack">${petMode ? 'Voltar' : 'A minha carta'}</button><button class="btn main" id="smSh">📤 Partilhar</button></div></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  if (l === 3) try { confetti(); } catch (e) { }
  $('#smX').onclick = () => dlg.close(); $('#smBack').onclick = petMode ? () => dlg.close() : openSoul; $('#smSh').onclick = () => shareSoulMatch(me, other, l, pct); $('#smRet').onclick = () => soulSendLink(me, petMode ? `🐾 Li a tua Carta da Alma com a de ${me.first}: ${l} de 3 ligações! Lê a dela e vê do teu lado:` : `💫 Li a tua Carta da Alma: ${l} de 3 ligações entre nós! Agora lê a minha e vê do teu lado:`);
}
async function shareSoulMatch(me, other, l, pct) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(1080, 1350); bg(ctx, W, H, 'par' + me.serial + other.serial, ['#4a2a8a', '#07050f']);
  const a = await svgImg(soulSVG2(me)), b = await svgImg(soulSVG2(other)), [h] = soulLvlTxt(l);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.translate(320, 640); ctx.rotate(-.07); ctx.drawImage(a, -200, -333, 400, 667); ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.translate(760, 640); ctx.rotate(.07); ctx.drawImage(b, -200, -333, 400, 667); ctx.restore();
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 44px Cinzel'; ctx.fillText('LEITOR DO CÉU', W / 2, 110);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 700 64px "Cormorant Garamond"'; ctx.fillText(h.replace(/^\S+\s/, ''), W / 2, 1100);
  ctx.fillStyle = '#d9d0ff'; ctx.font = '600 34px Manrope'; ctx.fillText(`${me.first} + ${other.first} · ${l} de 3 ligações da alma · ${pct}%`, W / 2, 1160);
  brandFoot(ctx, W, H, H - 40);
  shareCanvases([{ c, name: 'leitor-do-ceu' }], `🔭 O Leitor do Céu leu as nossas Cartas da Alma: ${h} (${l} de 3 ligações). Descobre a tua em ceudehoje.com #CartaDaAlma`);
}
function soulLinksView() {
  const dlg = $('#soulDlg'), L = soulLinks();
  dlg.innerHTML = `<div class="soulwrap"><h2>💫 As minhas ligações</h2><p class="note">Cada carta que lês fica gravada na tua alma: pessoas e patudos 🐾.</p>
    ${L.length ? `<p class="note">Toca na ☆ para guardares alguém <b>perto</b> (fica no centro da constelação). 🗑 tira alguém do teu céu. Toca no símbolo à esquerda para dizer quem é: ❤️ amor, 🏡 família, 🤝 amigo.</p><div class="soullist">${L.map((x, i) => [x, i]).sort((a, b) => (b[0].near ? 1 : 0) - (a[0].near ? 1 : 0)).map(([x, i]) => { const kd = linkKind(x); return `<div class="soulrow"><button class="slkind" data-k="${i}" aria-label="Quem é ${esc(x.first)}">${kd !== 'outra' ? kindIc(kd) : '✦'}</button><button class="soulli" data-i="${i}"><span class="lv lv${x.l}">${'✦'.repeat(x.l) || '·'}</span><b>${esc(x.first)}</b><i>${soulLvlTxt(x.l)[0].replace(/^\S+\s/, '')} · ${x.pct}% · ${x.d.split('-').reverse().join('/')}</i></button><button class="slnear${x.near ? ' on' : ''}" data-n="${i}" aria-label="Guardar perto">${x.near ? '★' : '☆'}</button><button class="sldel" data-d="${i}" aria-label="Tirar ${esc(x.first)}">🗑</button></div>`; }).join('')}</div>
    <div class="sttwo"><button class="btn" id="slShare">📤 Partilhar constelação</button><button class="btn" id="slTat">🖋️ Criar tatuagem</button></div>` : '<p>Ainda não leste nenhuma carta. Pede a alguém o link ou o QR da Carta da Alma (também de patudos 🐾).</p>'}
    <div class="dlgfoot"><button class="btn" id="slBack">A minha carta</button><button class="btn main" id="slRead">🔭 Ler uma carta</button></div></div>`;
  $('#slBack').onclick = openSoul; $('#slRead').onclick = soulReader; if ($('#slShare')) { $('#slShare').onclick = soulStarsShare; $('#slTat').onclick = soulTattooView; }
  dlg.querySelectorAll('.soulli').forEach(b => b.onclick = () => { const o = soulParse(L[+b.dataset.i].code); if (o) soulMatch(o); });
  dlg.querySelectorAll('.slnear').forEach(b => b.onclick = () => { const A = soulLinks(), x = A[+b.dataset.n]; if (!x) return; x.near = !x.near; store.set('ceu_soul_links', JSON.stringify(A)); toast(x.near ? `★ ${x.first} fica perto de ti` : `${x.first} voltou ao teu céu`); soulLinksView(); });
  dlg.querySelectorAll('.slkind').forEach(b => b.onclick = () => { // escolher quem é: aparece no mapa e na tatuagem com o seu símbolo
    const x = L[+b.dataset.k], row = b.closest('.soulrow'); if (!x || !row) return;
    if (linkPet(x)) return toast(`${x.first} é um patudo ${petIc(linkPet(x))}: fica com o seu símbolo`);
    row.innerHTML = `<div class="sldelc"><span><b>${esc(x.first)}</b> é…</span>${SOUL_KINDS.map(k => `<button class="btn" data-kk="${k[0]}">${k[1]} ${k[2]}</button>`).join('')}</div>`;
    row.querySelectorAll('[data-kk]').forEach(z => z.onclick = () => { const A = soulLinks(), y = A.find(q => q.serial === x.serial); if (y) { y.kind = z.dataset.kk; store.set('ceu_soul_links', JSON.stringify(A)); } soulLinksView(); });
  });
  dlg.querySelectorAll('.sldel').forEach(b => b.onclick = () => { // confirmação ali mesmo, sem janelas do sistema
    const x = L[+b.dataset.d], row = b.closest('.soulrow'); if (!x || !row) return;
    row.innerHTML = `<div class="sldelc"><span>Tirar <b>${esc(x.first)}</b> da tua constelação?</span><button class="btn" data-no>Não</button><button class="btn main" data-yes>Tirar</button></div>`;
    row.querySelector('[data-no]').onclick = soulLinksView;
    row.querySelector('[data-yes]').onclick = () => { store.set('ceu_soul_links', JSON.stringify(soulLinks().filter(z => z.serial !== x.serial))); toast(`${x.first} saiu do teu céu. Há sempre novas estrelas ✦`); soulLinksView(); };
  });
}
window.addEventListener('hashchange', () => { if (/^#alma=/.test(location.hash)) checkSoulLink(); }); // link aberto com a app já aberta (ex.: medalha de um patudo perdido)
function checkSoulLink() { const m = location.hash.match(/^#alma=(.+)$/); if (!m) return false; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } const sos = soulSosOf(m[1]); let code = m[1].split('&')[0]; try { code = decodeURIComponent(code); } catch (e) { } const o = soulParse(code); if (o) setTimeout(() => soulMatch(o, { sos, fromLink: !isStandalone() }), 300); return true; }
function soulBoxHtml() {
  const o = soulMe();
  if (!o) return `<button class="soulbox" id="soulBoxGo"><div><b>💫 Cria a tua Carta da Alma</b><span>Uma carta só tua, feita do teu nome e do teu nascimento.</span></div></button>`;
  const m = soulDayMsg(o), st = soulStars(), ppl = soulTodayPeople().slice(0, 2);
  return `<button class="soulbox today" id="soulBoxGo">${soulSVG2(o)}<div><b>💫 A tua alma hoje</b><span>${esc(m.txt)}</span><em>${st.n ? `✦ ${st.n} ${st.n === 1 ? 'estrela' : 'estrelas'}` : '✦ acende a 1.ª estrela'}${ppl.map(x => ` · ${x.ic} ${esc(x.nm)}`).join('')}</em></div></button>`;
}
document.addEventListener('click', e => { // toque numa estrela: quem é
  const g = e.target.closest && e.target.closest('.sst'); if (!g) return; const x = soulLinks().find(y => y.serial === g.dataset.s), w = $('#sstWho'); if (!x || !w) return;
  document.querySelectorAll('.sst.on').forEach(z => z.classList.remove('on')); g.classList.add('on');
  const kd = linkKind(x); w.hidden = false; w.innerHTML = `<span class="lv lv${x.l}">${kd !== 'outra' ? kindIc(kd) : '✦'.repeat(x.l) || '·'}</span><div><b>${x.near ? '★ ' : ''}${esc(x.first)}</b><i>${x.l === 3 ? 'Alma gémea' : soulLvlTxt(x.l)[0].replace(/^\S+\s/, '')} · lida a ${x.d.split('-').reverse().join('/')}</i></div><button class="btn" id="sstOpen">Ver</button>`;
  $('#sstOpen').onclick = () => { const o = soulParse(x.code); if (o) soulMatch(o); };
});
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#stShare')) soulStarsShare(); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#soulBoxGo')) { if (soulMe()) openSoul(); else soulWelcome(true); } });

// ---------- Cofre da alma: memórias e cápsulas do tempo (guardadas só neste telemóvel) ----------
const SMEM = { all: () => { try { return JSON.parse(store.get('ceu_soul_mem') || '[]'); } catch (e) { return []; } }, save: L => store.set('ceu_soul_mem', JSON.stringify(L.slice(-500))) };
const memOpen = x => !x.open || x.open <= todayStr();
function soulMemStars(o, n) { // cada memória acende uma estrela no céu da carta
  if (!n) return ''; const r = seeded('mem' + o.serial), C = o.col ? o.col[1] : '#f2c76e'; let s = '';
  for (let i = 0; i < Math.min(n, 24); i++) { const a = r() * 6.283, d = 18 + r() * 62, x = 150 + Math.cos(a) * d, y = 150 + Math.sin(a) * d; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${C}" opacity=".22"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="#fff"/>`; }
  return s;
}
function soulVault(focus) {
  const dlg = $('#soulDlg'), L = SMEM.all().sort((a, b) => (b.d || '').localeCompare(a.d || '')), t = todayStr(), next = new Date(); next.setFullYear(next.getFullYear() + 1); const nx = next.toISOString().slice(0, 10);
  const locked = L.filter(x => !memOpen(x)), opened = L.filter(memOpen);
  const fmt = d => d.split('-').reverse().join('/'), days = d => Math.max(0, Math.round(noonJd(d) - noonJd(t)));
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="svX" aria-label="Fechar">✕</button><h2>🔐 Cofre da alma</h2>
    <p class="note">Grava memórias na tua carta: cada uma acende uma estrela no teu céu. Ficam só neste telemóvel (e na cópia de segurança).</p>
    <div class="vaultnew"><textarea id="svTxt" maxlength="600" rows="3" placeholder="Uma memória que a tua alma não pode esquecer…"></textarea>
      <label class="chk"><input type="checkbox" id="svCap"> ⏳ Cápsula do tempo: só abre numa data</label>
      <label id="svDw" hidden>Abre a<input type="date" id="svDate" min="${dayStr(noonJd(t) + 1)}" value="${nx}"></label>
      <button class="btn main" id="svSave" style="width:100%">✨ Gravar na minha alma</button></div>
    ${locked.length ? `<h3 class="soulh">⏳ Cápsulas por abrir</h3>${locked.map(x => `<div class="vmem lock"><b>🔒 Abre a ${fmt(x.open)}</b><span>${days(x.open) === 1 ? 'Falta 1 dia' : `Faltam ${days(x.open)} dias`} · gravada a ${fmt(x.d)}</span></div>`).join('')}` : ''}
    ${opened.length ? `<h3 class="soulh">✨ Memórias gravadas (${opened.length})</h3>${opened.map(x => `<div class="vmem${x.open ? ' cap' : ''}"><b>${x.open ? '💌 Cápsula aberta · ' : ''}${fmt(x.d)}</b><p>${esc(x.t).replace(/\n/g, '<br>')}</p><button class="vdel" data-id="${x.id}" aria-label="Apagar">🗑️</button></div>`).join('')}` : '<p class="note">Ainda não gravaste nenhuma memória.</p>'}
    <div class="dlgfoot"><button class="btn" id="svBack">A minha carta</button></div></div>`;
  if (!dlg.open) dlg.showModal();
  $('#svX').onclick = () => dlg.close(); $('#svBack').onclick = openSoul;
  $('#svCap').onchange = e => { $('#svDw').hidden = !e.target.checked; };
  $('#svSave').onclick = () => {
    const txt = $('#svTxt').value.trim(); if (!txt) { toast('Escreve a memória primeiro'); return; }
    const cap = $('#svCap').checked, od = $('#svDate').value; if (cap && (!od || od <= t)) { toast('Escolhe uma data futura'); return; }
    const M = SMEM.all(); M.push({ id: 'm' + Date.now().toString(36), d: t, t: txt, open: cap ? od : '' }); SMEM.save(M);
    toast(cap ? `⏳ Cápsula fechada até ${fmt(od)}` : '✨ Memória gravada na tua alma'); soulVault();
  };
  dlg.querySelectorAll('.vdel').forEach(b => b.onclick = () => { if (!confirmBox('Apagar esta memória da tua alma?')) return; SMEM.save(SMEM.all().filter(x => x.id !== b.dataset.id)); soulVault(); });
  if (focus) setTimeout(() => $('#svTxt').focus(), 200);
}
function soulAlerts() { return SMEM.all().filter(x => x.open && x.open >= todayStr()).map(x => ({ d: x.open, t: '💫 A tua alma tem uma memória para ti', b: 'Uma cápsula do tempo abriu hoje. Vem lê-la ✨', tag: 'cap-' + x.id, url: './?alma', h: 9 })); }

// ---------- Gravar a carta num chip NFC (porta-chaves, carta impressa) ----------
async function soulWriteNfc(o) {
  if (!('NDEFReader' in window)) { toast('Este telemóvel não grava chips NFC pelo navegador (só Android com Chrome)', 5000); return; }
  if (!confirmBox(o.pet ? `Encosta o chip NFC (medalha ou porta-chaves) à parte de trás do telemóvel depois de carregares em OK.\n\nQuem o encostar ao telemóvel abre a carta de ${o.first}${o.sos ? ' e vê o teu contacto' : ''}. Qualquer telemóvel com NFC lê, sem app.` : 'Encosta o chip NFC à parte de trás do telemóvel depois de carregares em OK. A tua carta fica gravada no chip: quem o encostar ao telemóvel abre a tua Carta da Alma.')) return; soulSeal(o);
  try { const nd = new NDEFReader(); toast('📶 Encosta o chip ao telemóvel…', 8000); await nd.write({ records: [{ recordType: 'url', data: soulLink(o) }] }); toast('✨ Carta gravada no chip!'); try { navigator.vibrate && navigator.vibrate([80, 40, 80]); } catch (e) { } }
  catch (e) { toast(e && e.name === 'NotAllowedError' ? 'Sem autorização para usar o NFC' : 'Não deu para gravar: tenta encostar melhor o chip', 5000); }
}

// ---------- Estúdio: carrossel de 4 cartões a explicar a Carta da Alma ----------
async function soulPromoCanvases() {
  await fontsReady();
  const me = soulMe() || soulOf({ name: 'Júlio Melo', d: '1985-03-20', t: '14:30', c: '0' }), w = soulWant(me);
  const twin = Object.assign({}, me, { s: w.s, m: w.m, n: w.n, serial: '7QK2M9XA', first: 'Alma gémea', ar: 3, asc: null, el: SIGNS[w.s].el, stone: SIGN_EXTRA[w.s].pedra, col: SOUL_COL[w.n] });
  const other = soulOf({ name: 'Marta Silva', d: '1987-09-22', t: '08:10', c: '1' });
  const [F, B, T, O] = await Promise.all([svgImg(soulSVG2(me)), svgImg(soulBackSVG(me)), svgImg(soulSVG2(twin)), svgImg(soulSVG2(other))]);
  const page = (k, kick, t1, t2, sub) => {
    const [c, ctx, W, H] = newCanvas(1080, 1350); bg(ctx, W, H, 'promo' + k + me.serial, ['#4a2a8a', '#07050f']); ctx.textAlign = 'center';
    ctx.fillStyle = '#f2c76e88'; ctx.font = '700 24px Manrope'; ctx.textAlign = 'right'; ctx.fillText(k + '/4', W - 40, 54); ctx.textAlign = 'center';
    ctx.fillStyle = '#f2c76e'; ctx.font = '700 26px Manrope'; try { ctx.letterSpacing = '8px'; } catch (e) { } ctx.fillText(kick, W / 2, 84); try { ctx.letterSpacing = '0px'; } catch (e) { }
    ctx.fillStyle = '#f7e08a'; ctx.font = '700 76px "Cormorant Garamond"'; ctx.fillText(t1, W / 2, 178); ctx.fillText(t2, W / 2, 256);
    ctx.fillStyle = '#ddd5ff'; ctx.font = '500 31px Manrope'; sub.forEach((l, i) => ctx.fillText(l, W / 2, 322 + i * 42));
    return [c, ctx, W, H];
  };
  const card = (ctx, im, cx, top, w, rot) => { if (!im) return; const h = w * 5 / 3; ctx.save(); ctx.translate(cx, top + h / 2); ctx.rotate(rot); ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); };
  const pills = (ctx, W, y, rows) => { ctx.font = '600 26px Manrope'; rows.forEach((row, ri) => { const ws = row.map(t => ctx.measureText(t).width + 48), tot = ws.reduce((a, b) => a + b, 0) + (row.length - 1) * 12; let x = (W - tot) / 2; row.forEach((t, i) => { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.strokeStyle = 'rgba(242,199,110,.55)'; ctx.lineWidth = 1.5; rr(ctx, x, y + ri * 66 - 38, ws[i], 54, 27); ctx.fill(); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#fff3cf'; ctx.textAlign = 'center'; ctx.fillText(t, x + ws[i] / 2, y + ri * 66 - 2); x += ws[i] + 12; }); }); };
  const foot = (ctx, W, H) => { ctx.textAlign = 'center'; ctx.fillStyle = '#cfc6f2'; ctx.font = '500 22px Manrope'; ctx.fillText('Grátis · sem registo · ceudehoje.com', W / 2, H - 92); brandFoot(ctx, W, H, H - 44); };
  const out = [];
  { const [c, ctx, W, H] = page(1, 'CARTA DA ALMA', 'Tens uma carta', 'só tua no universo', ['Feita do teu nome e do momento em que nasceste.', 'Não existe outra igual.']); card(ctx, F, W / 2, 400, 400, -.05); pills(ctx, W, 1130, [['☉ Sol · ☾ Lua · ▲ Ascendente', '🃏 Arcano de nascimento'], ['🛡️ Proteções do teu signo', '✦ Nº de série único']]); foot(ctx, W, H); out.push(c); }
  { const [c, ctx, W, H] = page(2, 'A TUA METADE', 'Algures existe', 'a tua alma gémea', ['A tua carta tem meia constelação.', 'A outra metade só existe em 1 de cada 1300 pessoas.']); card(ctx, F, 335, 420, 370, -.1); card(ctx, T, 745, 420, 370, .1); const g = ctx.createRadialGradient(540, 590, 10, 540, 590, 90); g.addColorStop(0, 'rgba(255,247,208,.9)'); g.addColorStop(1, 'rgba(242,199,110,0)'); ctx.fillStyle = g; ctx.fillRect(400, 450, 280, 280); pills(ctx, W, 1110, [['☉ Sóis opostos', '☾ Luas opostas', '✦ Números que somam 10']]); foot(ctx, W, H); out.push(c); }
  { const [c, ctx, W, H] = page(3, 'AMULETO DA ALMA', 'Cada signo tem', 'as suas fragilidades', ['No verso da tua carta está o teu amuleto:', 'as proteções certas para o teu signo e coração.']); card(ctx, B, 300, 430, 380, -.07);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 22px Manrope'; ctx.fillText('O TEU AMULETO', 545, 500); ctx.font = '600 30px Manrope'; ctx.fillStyle = '#fff3cf';
    [['🛡️ A tua fragilidade', 'e a do teu coração'], ['💎 A tua pedra'], ['⚙️ O teu metal'], ['🌿 A tua planta'], ['📅 O teu dia'], ['✒️ Um selo feito', 'com as letras do teu nome']].reduce((y, l) => { ctx.fillStyle = '#fff3cf'; ctx.font = '600 30px Manrope'; ctx.fillText(l[0], 545, y); if (l[1]) { ctx.fillStyle = '#cfc6f2'; ctx.font = '500 26px Manrope'; ctx.fillText(l[1], 590, y + 36); return y + 86; } return y + 50; }, 556);
    ctx.fillStyle = '#f7e08a'; ctx.font = 'italic 600 34px "Cormorant Garamond"'; ctx.fillText('«e o teu lema da alma»', 545, 1000); foot(ctx, W, H); out.push(c); }
  { const [c, ctx, W, H] = page(4, 'LEITOR DO CÉU', 'Lê a alma', 'de quem gostas', ['O QR é a Lua cheia do verso da carta.', 'Aponta a câmara e descobre se as almas encaixam.']); card(ctx, B, 330, 420, 330, -.08); card(ctx, O, 750, 440, 330, .08);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff3cf'; ctx.font = '600 30px Manrope'; ['1. Cria a tua carta em ceudehoje.com', '2. Partilha: «procuro a minha metade»', '3. Guarda memórias no 🔐 Cofre da alma', '4. Leva o teu amuleto contigo 🛡️'].forEach((l, i) => ctx.fillText(l, 150, 1030 + i * 44)); brandFoot(ctx, W, H, H - 44); out.push(c); }
  return out;
}


// ---------- Carta da Alma dos patudos (aba 💫 Alma de cada animal) ----------
const petSoulOf = a => a && a.d ? soulOf({ name: a.name, d: a.d, t: a.t, c: 0, sp: a.sp || 'outro', sos: a.sos }) : null;
function petSoulBox(a) {
  const o = petSoulOf(a); if (!o) return '<p class="note">Põe a data de nascimento (ou de adoção) em ✏️ Editar para criar a carta.</p>';
  const me = soulMe(), l = me ? soulLevel(me, o) : 0, w = me ? soulWant(me) : null, chk = (ok, txt) => `<li class="${ok ? 'ok' : ''}">${ok ? '✦' : '·'} ${txt}</li>`;
  return `<div class="petsoul"><p class="soulhint">A alma de ${esc(a.name)} tem uma carta só sua. Toca para virar 🐾</p>
    <button class="pscard" id="psCard" aria-label="Virar a carta">${soulSVG2(o)}</button>
    <div class="soulbtns"><button class="btn main" id="psSh">📤 Partilhar</button><button class="btn" id="psLk">🔗 Enviar o link</button>${'NDEFReader' in window ? '<button class="btn" id="psNfc">📶 Gravar na medalha (NFC)</button>' : ''}</div>
    ${me ? `<div class="soulwant"><b>${l === 3 ? '💛 És o humano da alma de ' + esc(a.name) + '!' : `Tu e ${esc(a.name)}: ${l} de 3 ligações da alma`}</b><ul class="soulchk">${chk(o.s === w.s, `Sol: ${SIGNS[me.s].n} ↔ ${SIGNS[o.s].n}`)}${chk(o.m === w.m, `Lua: ${SIGNS[me.m].n} ↔ ${SIGNS[o.m].n}`)}${chk(o.n === w.n, `Números: ${me.n} + ${o.n}${me.n + o.n === 10 ? ' = 10' : ''}`)}</ul><button class="btn" id="psMe" style="width:100%">✨ Ver as duas cartas juntas</button></div>` : '<p class="note">Cria a tua Carta da Alma (no teu perfil) para veres se és o humano da alma de ' + esc(a.name) + '.</p>'}
    <div class="soulwant"><b>💞 O humano perfeito de ${esc(a.name)}</b><p>${soulWantTxt(o)}</p><button class="btn" id="psRead" style="width:100%">🔭 Ler outra carta (pessoa ou patudo)</button></div>
    <div class="box"><h3>🆘 Se ${esc(a.name)} se perder</h3><p class="note">Este contacto fica escrito no link, no QR do verso e no chip NFC da medalha: quem encontrar ${esc(a.name)} encosta o telemóvel e vê-o, sem app nem veterinário. Põe só o que não te importas que um desconhecido veja.</p>
      <label>Contacto (opcional)<input type="text" id="psSos" maxlength="40" value="${esc(a.sos || '')}" placeholder="Ex.: Ana · 912 345 678"></label><button class="btn" id="psSosOk" style="width:100%">Guardar contacto</button>
      <p class="note">Não substitui o microchip oficial: é uma ajuda extra, que qualquer pessoa consegue ler.</p></div>
    <h3 class="soulh">A leitura da alma de ${esc(a.name)}</h3>${soulPetReading(o)}
    <p class="note">Nº ${o.serial.slice(0, 4)}·${o.serial.slice(4)} · calculada a partir do nome, da espécie e do nascimento de ${esc(a.name)}: não há outra igual. Inspirada na tradição astrológica, para te divertires.</p></div>`;
}
function bindPetSoul(a, i) {
  const o = petSoulOf(a); if (!o || !$('#psCard')) return; let back = false;
  $('#psCard').onclick = () => { back = !back; const c = $('#psCard'); c.classList.add('flip'); setTimeout(() => { c.innerHTML = back ? soulBackSVG(o) : soulSVG2(o); c.classList.remove('flip'); }, 180); };
  $('#psSh').onclick = () => shareSoul(o);
  $('#psLk').onclick = () => soulSendLink(o, `🐾 Esta é a Carta da Alma de ${o.first}. Abre e descobre se és o humano (ou o amigo) da alma dele:`);
  if ($('#psNfc')) $('#psNfc').onclick = () => soulWriteNfc(o);
  if ($('#psMe')) $('#psMe').onclick = () => soulMatch(o);
  $('#psRead').onclick = () => soulReader(o);
  $('#psSosOk').onclick = () => { const l = P.list('ceu_pets'); if (!l[i]) return; l[i].sos = $('#psSos').value.trim().replace(/[<>]/g, '').slice(0, 40); P.setList('ceu_pets', l); toast(l[i].sos ? '🆘 Contacto guardado: já vai no link, no QR e no chip' : 'Contacto removido'); openPet(i, false, false); };
}

// ---------- Primeira visita: nome + data → a tua carta, logo ----------
function soulWelcome(force, after) {
  if (!force && (P.get() || store.get('ceu_welcome'))) return false;
  const dlg = $('#soulDlg'), ci = +(ST.city || 0), demo = ['9b5axQK4M2P7A~Sofia', '617gxZX7Q4K1A~Inês', '0b99xMMYRA17J~Tiago'].map(soulParse).filter(Boolean);
  dlg.innerHTML = `<div class="soulwrap wlc"><div class="wlcards">${demo.map((o, k) => `<div class="wc wc${k}">${soulSVG2(o)}</div>`).join('')}</div>
    <h2>✨ A tua alma tem uma carta. Só tua.</h2><p>Diz-me o teu nome e quando nasceste: em segundos revelo a tua <b>Carta da Alma</b>, única no mundo, e quem tem a outra metade da tua constelação.</p>
    <div class="form"><label>O teu nome<input type="text" id="wName" maxlength="24" placeholder="Como te chamas?" autocomplete="given-name"></label><label>Data de nascimento<input type="date" id="wDate" max="${todayStr()}"></label>
    <div class="two"><label>Hora (se souberes)<input type="time" id="wTime"></label><label>Onde nasceste<select id="wCity">${CITIES.map((c, i) => `<option value="${i}"${i === ci ? ' selected' : ''}>${c[0]}</option>`).join('')}</select></label></div></div>
    <button class="btn main" id="wGo" style="width:100%;padding:14px;font-size:16px">✨ Revelar a minha carta</button>
    <p class="note" style="text-align:center">Sem registo e sem contas: fica só neste telemóvel.</p>${force ? '' : '<button class="btn ghost" id="wSkip" style="width:100%">Agora não, só quero espreitar</button>'}</div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  $('#wGo').onclick = () => {
    const name = $('#wName').value.trim(), d = $('#wDate').value; if (!name) { toast('Como te chamas?'); $('#wName').focus(); return; } if (!d) { toast('Falta a data de nascimento'); return; }
    const old = P.get() || {}; P.set(Object.assign({}, old, { name, d, t: $('#wTime').value, c: $('#wCity').value })); store.set('ceu_welcome', '1'); render();
    if (after) after(); else openSoul();
  };
  if ($('#wSkip')) $('#wSkip').onclick = () => { store.set('ceu_welcome', '1'); dlg.close(); };
  return true;
}

// ---------- Alma da família: quem encaixa com quem lá em casa ----------
const FAM_RELS = REL_GROUPS.filter(g => g[0] === 'Família' || g[0] === 'Amor').flatMap(g => g[1]);
function familySouls() {
  const me = soulMe(), M = [];
  if (me) M.push({ nm: me.first, ic: '⭐', rl: 'Eu', o: me });
  P.list('ceu_bdays').filter(x => x.d && FAM_RELS.includes(x.rel)).forEach(x => { const o = soulOf({ name: x.name, d: x.d, t: x.t, c: x.c || 0 }); if (o) M.push({ nm: o.first, ic: ['marido', 'mulher', 'namorado', 'namorada'].includes(x.rel) ? '💞' : '🏡', rl: (RELS.find(r => r[0] === x.rel) || [])[2] || '', o }); });
  P.list('ceu_pets').filter(a => a.d).forEach(a => { const o = petSoulOf(a); if (o) M.push({ nm: o.first, ic: (SPECIES.find(s => s[0] === a.sp) || [0, '🐾'])[1], rl: (SPECIES.find(s => s[0] === a.sp) || [0, 0, 'Patudo'])[2], o }); });
  const pairs = []; for (let i = 0; i < M.length; i++) for (let j = i + 1; j < M.length; j++) { const a = M[i].o, b = M[j].o, l = Math.max(soulLevel(a, b), soulLevel(b, a)); pairs.push({ i, j, l, pct: bond(a.s, b.s).pct }); }
  pairs.sort((x, y) => y.l - x.l || y.pct - x.pct);
  const tot = M.map((_, k) => pairs.filter(p => p.i === k || p.j === k).reduce((s, p) => s + p.l, 0)), star = M.length > 1 ? tot.indexOf(Math.max(...tot)) : -1;
  return { M, pairs, star };
}
function familySoulView() {
  const dlg = $('#soulDlg'), F = familySouls(), { M, pairs, star } = F;
  const lbl = p => { const a = M[p.i].o, b = M[p.j].o; return p.l === 3 ? soulPairTxt(3, a, b)[0] : soulLvlTxt(p.l)[0]; };
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="fsX" aria-label="Fechar">✕</button><h2>👨‍👩‍👧 A alma da família</h2>
    ${M.length < 2 ? `<p>Para veres quem encaixa com quem, junta a família nos <b>🎂 Anos</b> (com a relação: mãe, filho, marido…) e os patudos em <b>🐾 Animais</b>.</p><div class="dlgfoot"><button class="btn main" id="fsBack">Voltar</button></div>` : `
    <p class="note">${M.length} almas lá em casa · as ligações contam Sol, Lua e número complementares.</p>
    <div class="famgrid">${M.map((m, k) => `<div class="fm${k === star ? ' star' : ''}">${soulSVG2(m.o)}<b>${m.ic} ${esc(m.nm)}</b><i>${k === star ? '✨ estrela da família' : esc(m.rl || '')}</i></div>`).join('')}</div>
    <h3 class="soulh">As ligações mais fortes</h3><div class="soullist">${pairs.slice(0, 10).map(p => `<button class="soulli" data-i="${p.i}" data-j="${p.j}"><span class="lv lv${p.l}">${'✦'.repeat(p.l) || '·'}</span><b>${esc(M[p.i].nm)} + ${esc(M[p.j].nm)}</b><i>${lbl(p).replace(/^\S+\s/, '')} · ${p.pct}%</i></button>`).join('')}</div>
    ${star >= 0 ? `<p class="note">A estrela da família é quem tem mais ligações com todos: ${esc(M[star].nm)} ✨</p>` : ''}
    <div class="dlgfoot"><button class="btn" id="fsBack">A minha carta</button><button class="btn main" id="fsSh">📤 Partilhar</button></div>`}</div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  $('#fsBack').onclick = () => soulMe() ? openSoul() : dlg.close(); if ($('#fsX')) $('#fsX').onclick = () => dlg.close();
  dlg.querySelectorAll('.soulli[data-j]').forEach(b => b.onclick = () => { const a = M[+b.dataset.i].o, c = M[+b.dataset.j].o; soulMatch(c, { me: a }); });
  if ($('#fsSh')) $('#fsSh').onclick = () => shareFamilySoul(F);
}
async function shareFamilySoul({ M, pairs, star }) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(1080, 1350); bg(ctx, W, H, 'familia' + M.map(m => m.o.serial).join(''), ['#4a2a8a', '#07050f']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 46px Cinzel'; ctx.fillText('A ALMA DA FAMÍLIA', W / 2, 100);
  const show = M.slice(0, 6), n = show.length, cw = Math.min(250, (W - 120) / Math.min(n, 3) - 20), ch = cw * 5 / 3, rows = Math.ceil(n / 3);
  for (let k = 0; k < n; k++) { const r = Math.floor(k / 3), inRow = Math.min(3, n - r * 3), col = k - r * 3, x = W / 2 + (col - (inRow - 1) / 2) * (cw + 30), y = 150 + r * (ch + 70);
    const im = await svgImg(soulSVG2(show[k].o)); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; if (im) ctx.drawImage(im, x - cw / 2, y, cw, ch); ctx.restore();
    ctx.fillStyle = k === star ? '#f7e08a' : '#fff'; ctx.font = '700 30px Manrope'; ctx.fillText(show[k].nm + (k === star ? ' ✨' : ''), x, y + ch + 40); }
  let y = 150 + rows * (ch + 70) + 30; ctx.fillStyle = '#d9d0ff'; ctx.font = '600 32px Manrope';
  pairs.filter(p => p.i < 6 && p.j < 6).slice(0, Math.max(1, Math.floor((H - 120 - y) / 50))).forEach(p => { ctx.fillText(`${'✦'.repeat(p.l) || '·'}  ${M[p.i].nm} + ${M[p.j].nm} · ${p.l} de 3`, W / 2, y); y += 50; });
  brandFoot(ctx, W, H, H - 40);
  shareCanvases([{ c, name: 'alma-da-familia' }], `👨‍👩‍👧 A alma da nossa família no Céu de Hoje: ${star >= 0 ? M[star].nm + ' é a estrela da família ✨ ' : ''}Descobre a tua em ceudehoje.com #CartaDaAlma`);
}

// ---------- A alma hoje: mensagem do dia · coleção de ligações · o dia de vocês ----------
const moonSignOn = d => Math.floor((((moonLon(noonJd(d)) % 360) + 360) % 360) / 30);
const SOUL_DAY_MSG = {
  sun: ['A Lua passa pelo teu Sol: o dia tem a tua cara. Faz uma coisa só por ti.', 'Hoje brilhas mais do que pensas: a Lua está no teu signo. Mostra-te.', 'Lua no teu Sol: bom dia para começares o que andas a adiar.'],
  moon: ['A Lua volta à tua Lua: o coração fala alto. Ouve-o sem pressa.', 'Dia de sentir: a Lua está em casa no teu coração. Liga a quem te faz bem.', 'A tua Lua está acesa: dá-te colo e deixa que te deem.'],
  half: ['A Lua passa pela tua metade: bom dia para dizeres o que sentes.', 'Hoje o céu aproxima-te de quem te completa. Repara em quem aparece.', 'A tua metade está iluminada: um gesto pequeno vale muito hoje.'],
  fogo: ['Lua em fogo: há energia para agir. Escolhe uma coisa e vai.', 'Céu de fogo: coragem para dizer sim (ou não) sem rodeios.', 'Dia quente no céu: mexe o corpo e o resto acompanha.'],
  terra: ['Lua em terra: dia de pôr ordem e cuidar do corpo.', 'Céu de terra: devagar se vai longe. Termina o que começaste.', 'Dia de chão firme: uma refeição calma e uma tarefa feita já te ganham o dia.'],
  ar: ['Lua em ar: conversas, ideias e novidades. Diz o que pensas.', 'Céu de ar: uma mensagem pode mudar o teu dia. Escreve-a.', 'Dia leve no céu: aprende uma coisa nova, nem que seja pequena.'],
  agua: ['Lua em água: tudo se sente mais. Sê gentil contigo.', 'Céu de água: confia no que sentes antes de pensares.', 'Dia de marés: protege a tua energia e escolhe bem as companhias.']
};
const SOUL_PDAY = ['', 'começos', 'parcerias', 'alegria', 'trabalho', 'mudança', 'família', 'silêncio', 'conquista', 'fechar ciclos'];
const PET_DAY = { fogo: ['dia de brincadeira: um passeio mais longo sabe-lhe bem', 'muita energia hoje: deixa-o correr e gastar', 'quer ação: dez minutos de jogo valem ouro'], terra: ['dia de rotina e mimo: comida certa e sesta ao teu lado', 'quer calma e o cantinho de sempre', 'dia de escova e festinhas sem pressa'], ar: ['dia curioso: um brinquedo novo ou outro caminho no passeio', 'anda distraído: conversa com ele e brinquem juntos', 'dia de novidades: deixa-o cheirar e explorar'], agua: ['dia sensível: precisa de colo e da tua voz calma', 'hoje sente tudo: fica um bocadinho mais perto dele', 'dia de mimo: a tua presença acalma-o'] };
const PAIR_DAY = { junta: ['a Lua junta-vos: bom dia para um programa a dois', 'o céu aproxima-vos: digam o que sentem', 'dia de sintonia: aproveitem um momento só vossos'], fogo: ['dia de fazerem algo juntos, sem planos', 'energia a dois: riam-se de alguma coisa', 'um desafio ou um jogo aproxima-vos'], terra: ['dia de paciência e de pequenos cuidados', 'um gesto prático diz "gosto de ti"', 'uma refeição juntos, sem ecrãs, sabe bem'], ar: ['dia de conversa: pergunta como foi o dia', 'uma mensagem a meio do dia sabe bem', 'partilhem uma ideia ou um plano novo'], agua: ['dia sensível: um abraço diz mais do que palavras', 'ouçam-se sem pressa de responder', 'um elogio sincero muda o dia'] };
const soulRot = (L, key, d) => { let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0; return L[(h + Math.floor(noonJd(d))) % L.length]; }; // muda todos os dias, nunca repete dois dias seguidos
function soulDayMsg(o, d = todayStr()) {
  const tm = moonSignOn(d), w = soulWant(o), pick = a => soulRot(a, 'dia' + o.serial, d);
  const k = tm === o.s ? 'sun' : tm === o.m ? 'moon' : tm === w.s || tm === w.m ? 'half' : SIGNS[tm].el;
  const ds = d.replace(/\D/g, '').split('').reduce((a, b) => a + +b, 0), pd = ((o.n + ds - 1) % 9) + 1;
  return { txt: pick(SOUL_DAY_MSG[k] || SOUL_DAY_MSG.ar), k, tm, pd };
}
function soulPairDay(a, b, d = todayStr()) { // a = eu, b = pessoa ou patudo
  const tm = moonSignOn(d), pick = L => soulRot(L, 'par' + a.serial + b.serial, d), el = SIGNS[tm].el;
  if (b.pet) return pick(PET_DAY[el]);
  const wa = soulWant(a), wb = soulWant(b); if ([wa.s, wa.m].includes(tm) && [b.s, b.m].includes(tm) || [wb.s, wb.m].includes(tm) && [a.s, a.m].includes(tm)) return pick(PAIR_DAY.junta);
  return pick(PAIR_DAY[el]);
}
function soulTodayPeople() { const F = familySouls(), me = soulMe(); if (!me) return []; return F.M.filter(m => m.o.serial !== me.serial).map(m => ({ nm: m.nm, ic: m.ic, txt: soulPairDay(me, m.o) })); }
const SOUL_MS = [[1, 'Primeira estrela'], [3, 'Pequena constelação'], [5, 'Cinco almas'], [10, 'Dez estrelas'], [25, 'Céu cheio'], [50, 'Galáxia'], [100, 'Via Láctea'], [250, 'Constelação de constelações'], [500, 'Universo inteiro'], [1000, 'Alma do cosmos']];
function soulStars() { const L = soulLinks(), n = L.length, best = L.reduce((m, x) => Math.max(m, x.l), 0), next = SOUL_MS.find(m => m[0] > n), got = SOUL_MS.filter(m => m[0] <= n); return { n, best, next, got, l3: L.filter(x => x.l === 3).length }; }
const linkPet = x => x.pet != null ? x.pet : ((soulParse(x.code) || {}).pet || ''); // ligações antigas não guardavam a espécie: tira-se do código
const petIc = sp => (SPECIES.find(z => z[0] === sp) || [, '🐾'])[1];
// ---------- Quem é cada estrela: amor ❤️, família 🏡, amigos 🤝, patudos (pata, gato, ave, peixe, cavalo) ----------
const SOUL_KINDS = [['amor', '❤️', 'Amor'], ['familia', '🏡', 'Família'], ['amigo', '🤝', 'Amigo'], ['trabalho', '💼', 'Trabalho'], ['outra', '✦', 'Outra']];
const KIND_SYM = { // desenhos de traço fino num quadrado de ~10 unidades centrado em 0,0 (servem para o mapa, a imagem e a tatuagem)
  amor: { d: 'M0 3.6C-4.8 .3-5.3-3.4-2.7-4.2-1.3-4.6-.3-3.8 0-2.7.3-3.8 1.3-4.6 2.7-4.2 5.3-3.4 4.8.3 0 3.6Z', f: 1 },
  familia: { d: 'M0-4.4 4.2-.7H3V3.8H.9V1.2H-.9V3.8H-3V-.7H-4.2Z', f: 1 },
  amigo: { d: 'M.9 0A2.6 2.6 0 1 1-4.3 0 2.6 2.6 0 1 1 .9 0M4.3 0A2.6 2.6 0 1 1-.9 0 2.6 2.6 0 1 1 4.3 0', f: 0, w: 1.1 },
  gato: { d: 'M-3.7-.8-3.5-4.6-1.3-2.7Q0-3.1 1.3-2.7L3.5-4.6 3.7-.8Q4.1 3.7 0 3.7-4.1 3.7-3.7-.8Z', f: 1 },
  ave: { d: 'M-4.8-.2Q-2.4-3.2 0 .6 2.4-3.2 4.8-.2', f: 0, w: 1.2 },
  peixe: { d: 'M-4.2 0Q-1.4-3.2 2 0-1.4 3.2-4.2 0ZM1.7 0 4.6-2.4V2.4Z', f: 1 },
  cavalo: { d: 'M-2.9-3.6V.1A2.9 2.9 0 0 0 2.9.1V-3.6', f: 0, w: 1.3 }
};
const PAW_D = 'M0 3.5A2.3 1.9 0 1 1 0-.3 2.3 1.9 0 1 1 0 3.5ZM-2.5-.4A1 1 0 1 1-2.5-2.4 1 1 0 1 1-2.5-.4ZM-.9-1.7A1 1 0 1 1-.9-3.7 1 1 0 1 1-.9-1.7ZM.9-1.7A1 1 0 1 1 .9-3.7 1 1 0 1 1 .9-1.7ZM2.5-.4A1 1 0 1 1 2.5-2.4 1 1 0 1 1 2.5-.4Z';
let _kindMemo = { k: '', L: [] };
function soulPeopleKinds() { // as pessoas que guardaste nos aniversários, com a relação que escolheste
  const raw = store.get('ceu_bdays') || ''; if (_kindMemo.k === raw) return _kindMemo.L;
  const grp = r => { const g = REL_GROUPS.find(g => g[1].includes(r)); return g ? { 'Família': 'familia', 'Amor': 'amor', 'Amigos': 'amigo', 'Trabalho': 'trabalho' }[g[0]] || '' : ''; };
  const L = P.list('ceu_bdays').filter(x => x.d && x.rel).map(x => { try { const o = soulOf({ name: x.name, d: x.d, t: x.t, c: x.c || 0 }); return o && { o, kind: grp(x.rel) }; } catch (e) { return null; } }).filter(x => x && x.kind);
  _kindMemo = { k: raw, L }; return L;
}
function linkKind(x) { // 'p:cao' para patudos; senão amor/familia/amigo/trabalho/outra
  const pet = linkPet(x); if (pet) return 'p:' + pet;
  if (x.kind) return x.kind;
  const o = soulParse(x.code); if (!o) return 'outra';
  const m = soulPeopleKinds().find(p => p.o.serial === o.serial) || soulPeopleKinds().find(p => nrm(p.o.first) === nrm(o.first) && p.o.s === o.s && p.o.n === o.n); // a mesma pessoa mesmo que tenha escrito o nome ou a hora de outra forma
  return m ? m.kind : 'outra';
}
const kindSym = k => k.startsWith('p:') ? (KIND_SYM[k.slice(2)] || { d: PAW_D, f: 1 }) : KIND_SYM[k] || null;
const kindIc = k => k.startsWith('p:') ? petIc(k.slice(2)) : (SOUL_KINDS.find(z => z[0] === k) || [, '✦'])[1];
function kindSvg(k, x, y, s, cls) { const S = kindSym(k); if (!S) return ''; return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})" d="${S.d}" class="${cls}${S.f ? '' : ' sko'}" ${S.f ? 'stroke="none"' : `stroke-width="${S.w}" stroke-linecap="round"`}/>`; }
function kindCanvas(ctx, k, x, y, s, col) { const S = kindSym(k); if (!S) return false; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const p = new Path2D(S.d); if (S.f) { ctx.fillStyle = col; ctx.fill(p); } else { ctx.strokeStyle = col; ctx.lineWidth = S.w; ctx.lineCap = 'round'; ctx.stroke(p); } ctx.restore(); return true; }
// roda do zodíaco partilhada (traço fino): anel duplo, faixa dos signos, decanatos, cardeais e órbitas. R = raio exterior
const WHEEL_R = 77.5; // em unidades do mapa; as estrelas ficam até 58 (≈ .75R), longe da faixa dos signos
function wheelCanvas(ctx, cx, cy, R, col, o = {}) {
  const A = d => d * Math.PI / 180, at = (d, r) => [cx + Math.cos(A(d)) * r, cy + Math.sin(A(d)) * r], a0 = o.alpha == null ? 1 : o.alpha, k = o.w || 1;
  const ln = (p, q, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); };
  const spark = (p, r) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * .16 : r; ctx.lineTo(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round';
  ctx.globalAlpha = a0; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.lineWidth = 1.75 * k; ctx.beginPath(); ctx.arc(cx, cy, R * .965, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, R * .8, 0, 7); ctx.stroke();
  for (let i = 0; i < 12; i++) ln(at(180 - i * 30, R * .8), at(180 - i * 30, R * .965), 1.75 * k);
  for (let d = 0; d < 360; d += 5) { if (d % 30 === 0 || d % 30 === 15) continue; const l = d % 10 === 0 ? R * .035 : R * .02; ln(at(d, R * .965 - l), at(d, R * .965), 1.5 * k); }
  ctx.globalAlpha = a0 * (o.galpha || 1); ctx.font = `${Math.round(R * .088)}px "Noto Sans Symbols","Noto Sans Symbols 2","Segoe UI Symbol",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) { const p = at(180 - i * 30 - 15, R * .875); ctx.fillText(SIGNS[i].g + TXT, p[0], p[1] + 1); }
  ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = a0;
  [[-90, 1], [0, 0], [90, 1], [180, 0]].forEach(([d, big]) => spark(at(d, R + R * .052), (big ? 14 : 11) * R / 430));
  [28, 52].forEach(rr => { const r = rr / WHEEL_R * R, n = Math.round(2 * Math.PI * r / 16); for (let i = 0; i < n; i++) { const p = at(i / n * 360, r); ctx.beginPath(); ctx.arc(p[0], p[1], 1.6 * k, 0, 7); ctx.fill(); } });
  ctx.restore();
}
function soulCheckMap() { // verificação: cada estrela está na fatia do seu signo e à distância certa do centro
  const Y = soulStarLayout(40), bad = [];
  Y.shown.forEach((x, i) => { const o = soulParse(x.code); if (!o) return; const p = Y.P[i + 1], deg = Math.atan2(p[1] - Y.C[1], p[0] - Y.C[0]) * 180 / Math.PI, s = Math.floor((((180 - deg) % 360) + 360) % 360 / 30), r = Math.hypot(p[0] - Y.C[0], p[1] - Y.C[1]);
    if (s !== o.s) bad.push(`${x.first}: está em ${SIGNS[s].n}, é ${SIGNS[o.s].n}`); if (r > 58.01) bad.push(`${x.first}: fora do círculo (${r.toFixed(1)})`); });
  return bad;
}
const ZOD_R = [52, 40, 28, 16]; // distância ao centro por nº de ligações (0..3): almas gémeas bem perto
function soulStarLayout(cap = 40) { // mapa astral real: direção = signo solar de cada um (roda do zodíaco como nos mapas natais: Carneiro à esquerda, sentido anti-horário), distância = ligação contigo
  const L = soulLinks(), n = L.length, top = x => !!(x.near || x.l === 3 || ['amor', 'familia'].includes(linkKind(x)) || linkPet(x)), C = [100, 100], R = 72;
  const shown = L.filter(top).concat(L.filter(x => !top(x))).slice(0, cap), k = shown.length; // almas gémeas, patudos e quem está perto nunca saem do mapa
  const ang = s => (180 - s * 30 - 15) * Math.PI / 180, pol = (a, r) => [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r];
  const meta = shown.map(x => { const o = soulParse(x.code) || { s: 0 }, rnd = seeded('zp' + x.serial), base = ZOD_R[x.l || 0] - (x.near && x.l < 3 ? 5 : 0); return { s: o.s, g: o.s + '_' + (x.l || 0), base, a: ang(o.s) + (rnd() - .5) * .28, r: base + (rnd() - .5) * 4 }; });
  const gsz = {}; meta.forEach(m => gsz[m.g] = (gsz[m.g] || 0) + 1); meta.forEach(m => m.band = Math.min(22, 7 + (gsz[m.g] - 1) * 1.8)); // almas gémeas ficam todas no signo oposto ao teu: quando há muitas, o grupo ganha espaço para fora
  for (let it = 0; it < 80; it++) { // quem calha no mesmo signo e nível afasta-se um pouco, sem sair da sua fatia
    let moved = false;
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
      const A = pol(meta[i].a, meta[i].r), B = pol(meta[j].a, meta[j].r), dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || .01; if (d >= 14) continue;
      moved = true; const push = (14 - d) / 2, ux = dx / d, uy = dy / d;
      [[i, -1], [j, 1]].forEach(([q, sg]) => { const m = meta[q], p = pol(m.a, m.r), np = [p[0] + ux * push * sg, p[1] + uy * push * sg]; m.a = Math.atan2(np[1] - C[1], np[0] - C[0]); m.r = Math.hypot(np[0] - C[0], np[1] - C[1]); });
    }
    meta.forEach(m => { const c = ang(m.s); let da = Math.atan2(Math.sin(m.a - c), Math.cos(m.a - c)); da = Math.max(-.24, Math.min(.24, da)); m.a = c + da; m.r = Math.max(Math.max(9, m.base - 7), Math.min(m.base + m.band, 58, m.r)); });
    if (!moved) break;
  }
  const P = [C].concat(meta.map(m => pol(m.a, m.r)));
  const lines = []; for (let r = 1; r <= k; r++) { let j0 = 0, dm = 1e9; for (let j = 0; j < r; j++) { const dd = (P[r][0] - P[j][0]) ** 2 + (P[r][1] - P[j][1]) ** 2; if (dd < dm) { dm = dd; j0 = j; } } lines.push([j0, r]); } // cada estrela liga-se à vizinha mais próxima
  const zod = SIGNS.map((g, s) => [g.g, ...pol(ang(s), 64)]);
  return { L, n, shown, k, ghosts: 0, P, lines, top, C, R, zod, rings: ZOD_R.map(r => r), named: x => k <= 14 || top(x), sz: k > 20 ? .62 : 1 };
}
function soulStarsSVG(n, cap = 40) { // a tua constelação na roda do zodíaco (o mesmo desenho da tatuagem, nas cores do tema)
  const Y = soulStarLayout(cap), { P, C } = Y, f = v => v.toFixed(1), z = Y.sz, R = WHEEL_R, at = (d, r) => [C[0] + Math.cos(d * Math.PI / 180) * r, C[1] + Math.sin(d * Math.PI / 180) * r];
  const lb = [[C[0] - 6, C[1] - 6, C[0] + 6, C[1] + 12]], lab = (t, x, y) => { const w = [...t].length * 2.9 + 2, b = [x - w / 2, y - 5, x + w / 2, y + 1]; if (lb.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) return ''; lb.push(b); return `<text class="ssn" x="${f(x)}" y="${f(y)}">${esc(t)}</text>`; };
  let s = `<circle class="zr0" cx="${C[0]}" cy="${C[1]}" r="${R}"/><circle class="zr1" cx="${C[0]}" cy="${C[1]}" r="${f(R * .965)}"/><circle class="zr1" cx="${C[0]}" cy="${C[1]}" r="${f(R * .8)}"/>`;
  for (let i = 0; i < 12; i++) { const p = at(180 - i * 30, R * .8), q = at(180 - i * 30, R * .965); s += `<line class="zs" x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"/>`; }
  for (let d = 0; d < 360; d += 5) { if (d % 30 === 0 || d % 30 === 15) continue; const l = d % 10 === 0 ? R * .035 : R * .02, p = at(d, R * .965 - l), q = at(d, R * .965); s += `<line class="zt" x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"/>`; }
  for (let i = 0; i < 12; i++) { const p = at(180 - i * 30 - 15, R * .875); s += `<text class="zg" x="${f(p[0])}" y="${f(p[1] + 2.4)}">${SIGNS[i].g}${TXT}</text>`; }
  [-90, 0, 90, 180].forEach(d => { const p = at(d, R + 4); s += `<path class="zc" d="M${f(p[0])} ${f(p[1] - 2.6)}L${f(p[0] + .45)} ${f(p[1] - .45)} ${f(p[0] + 2.6)} ${f(p[1])} ${f(p[0] + .45)} ${f(p[1] + .45)} ${f(p[0])} ${f(p[1] + 2.6)} ${f(p[0] - .45)} ${f(p[1] + .45)} ${f(p[0] - 2.6)} ${f(p[1])} ${f(p[0] - .45)} ${f(p[1] - .45)}Z"/>`; });
  [28, 52].forEach(rr => { const nn = Math.round(2 * Math.PI * rr / 3.2); for (let i = 0; i < nn; i++) { const p = at(i / nn * 360, rr); s += `<circle class="zo" cx="${f(p[0])}" cy="${f(p[1])}" r=".32"/>`; } });
  Y.lines.forEach(([a, b]) => { s += `<line class="sl" x1="${f(P[a][0])}" y1="${f(P[a][1])}" x2="${f(P[b][0])}" y2="${f(P[b][1])}"/>`; });
  s += `<circle class="sme" cx="${f(C[0])}" cy="${f(C[1])}" r="4.5"/><circle class="sg" cx="${f(C[0])}" cy="${f(C[1])}" r="1.8"/>` + (Y.k ? lab((soulMe() || {}).first || 'tu', C[0], C[1] + 9.5) : ''); // o ponto do centro és tu, com o teu nome
  Y.shown.forEach((x, i) => {
    const p = P[i + 1], c = `cx="${f(p[0])}" cy="${f(p[1])}"`, kd = linkKind(x), sym = kindSym(kd), gold = x.l === 3;
    s += `<g class="sst" data-s="${esc(x.serial)}">` + (sym ? `<circle ${c} r="${5.6 * z}" class="${gold ? 'sgh' : 'snh'}"/>` + kindSvg(kd, p[0], p[1], .82 * z, gold ? 'sk sk3' : 'sk') : gold ? `<circle ${c} r="${7 * z}" class="sgh"/><circle ${c} r="${4.2 * z}" class="sg"/>` : x.near ? `<circle ${c} r="${5 * z}" class="snh"/><circle ${c} r="${3.2 * z}" class="s1"/>` : `<circle ${c} r="${(x.l === 2 ? 2.9 : 2.2) * z}" class="${x.l ? 's1' : 's0'}"/>`)
      + (Y.named(x) ? lab(x.first, p[0], p[1] + (sym || gold ? 10 : 8) * (z < 1 ? .8 : 1)) : '') + `<circle ${c} r="9" fill="transparent"/><title>${esc(x.first)}</title></g>`;
  });
  if (n > cap) s += `<text class="ssn more" x="${C[0] + R}" y="${C[1] + R + 6}">+${n - cap}</text>`;
  return `<svg viewBox="${C[0] - R - 8} ${C[1] - R - 8} ${2 * R + 16} ${2 * R + 16}" class="soulstars" aria-hidden="true">${s}</svg>`;
}
const STAR_TONES = { // os 4 tons da app, para a imagem da constelação
  astral: { nm: 'Astral', bg: ['#2b1f66', '#06061a'], ink: '#eeedff', mute: '#b9b9e6', acc: '#f2c76e', star: '#fff1c4', dust: '#ffffff', neb: ['#7b5cff', '#ff6fb5', '#3fb8ff'], spk: ['#ffffff', '#f2c76e'] },
  branco: { nm: 'Branco', bg: ['#ffffff', '#ececf6'], ink: '#1d1d2b', mute: '#6a6a85', acc: '#c99a2e', star: '#2c2c44', dust: '#5a5a7a', neb: ['#c9b8ff', '#ffd9a0', '#a8d8ff'], spk: ['#c99a2e', '#8a7cd6'] },
  menta: { nm: 'Menta', bg: ['#f4fdf9', '#c9efdd'], ink: '#12332a', mute: '#4f7a6c', acc: '#2bb58a', star: '#13795b', dust: '#13795b', neb: ['#7fe6c1', '#a8e6ff', '#d4f7a8'], spk: ['#2bb58a', '#13795b'] },
  pink: { nm: 'Pink', bg: ['#fff6f9', '#ffd3e3'], ink: '#3a1029', mute: '#8f5a75', acc: '#ff5a8a', star: '#c2185b', dust: '#c2185b', neb: ['#ff8fb1', '#d7a8ff', '#ffc2a8'], spk: ['#ff5a8a', '#c2185b'] }
};
function soulSky(ctx, W, H, T, rnd) { // céu em todos os tons: nebulosas, via láctea, poeira de estrelas e brilhos
  const dark = T.bg[1] === '#06061a';
  T.neb.forEach((col, k) => { const x = W * (.15 + rnd() * .7), y = H * (.15 + k * .28 + rnd() * .1), r = 260 + rnd() * 260, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col + (dark ? '40' : '55')); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
  const band = (t, off) => [t * W, H * .82 - t * H * .62 + off]; // via láctea na diagonal
  ctx.fillStyle = T.dust; for (let i = 0; i < 420; i++) { const [x, y] = band(rnd(), (rnd() + rnd() + rnd() - 1.5) * 150); ctx.globalAlpha = (dark ? .1 : .18) + rnd() * (dark ? .35 : .4); ctx.beginPath(); ctx.arc(x, y, .5 + rnd() * 1.3, 0, 7); ctx.fill(); }
  for (let i = 0; i < 230; i++) { ctx.globalAlpha = (dark ? .12 : .25) + rnd() * .45; ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, .6 + rnd() * (rnd() < .1 ? 2.6 : 1.5), 0, 7); ctx.fill(); }
  for (let i = 0; i < 22; i++) { const x = rnd() * W, y = rnd() * H, r = 5 + rnd() * 11; ctx.globalAlpha = .45 + rnd() * .45; ctx.fillStyle = T.spk[i % 2]; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); ctx.globalAlpha *= .35; ctx.beginPath(); ctx.arc(x, y, r * .55, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
let _appIcon; const appIcon = async () => _appIcon !== undefined ? _appIcon : (_appIcon = await loadImg('icon-192.png').catch(() => null));
async function soulBrandBand(ctx, W, y, T) { // publicidade do Céu de Hoje em todas as imagens partilhadas: ícone, nome e site
  const ic = await appIcon(), rr = (a, b, w, h, r) => ctx.roundRect ? ctx.roundRect(a, b, w, h, r) : ctx.rect(a, b, w, h), bw = 760, bh = 92, x = (W - bw) / 2, dark = T.bg[1] === '#06061a';
  ctx.save(); ctx.globalAlpha = dark ? .14 : .7; ctx.fillStyle = dark ? '#ffffff' : '#ffffff'; ctx.beginPath(); rr(x, y, bw, bh, 46); ctx.fill(); ctx.globalAlpha = .55; ctx.strokeStyle = T.acc; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  const ix = x + 22, iy = y + 14, is = 64;
  if (ic) { ctx.save(); ctx.beginPath(); rr(ix, iy, is, is, 16); ctx.clip(); ctx.drawImage(ic, ix, iy, is, is); ctx.restore(); } else { ctx.fillStyle = T.acc; ctx.font = '52px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✦', ix + is / 2, iy + 50); }
  ctx.textAlign = 'left'; ctx.fillStyle = T.acc; ctx.font = '700 32px Cinzel'; ctx.fillText('CÉU DE HOJE', ix + is + 22, y + 44);
  ctx.fillStyle = T.ink; ctx.font = '600 23px Manrope'; ctx.fillText('Faz a tua constelação grátis · ceudehoje.com', ix + is + 22, y + 74); ctx.textAlign = 'center';
}
async function soulStarsCanvas(tone, story) { // story = 1080×1920 (Instagram/Facebook/WhatsApp estados), senão post 4:5
  await fontsReady(); const T = STAR_TONES[tone] || STAR_TONES.astral, me = soulMe(), Y = soulStarLayout(40), [c, ctx, W, H] = newCanvas(1080, story ? 1920 : 1350); ctx.__noTheme = true;
  const G = story ? { t1: 290, t2: 372, cy: 940, sc: 5.9, s1: 1470, s2: 1516, ft: 1580 } : { t1: 110, t2: 185, cy: 662, sc: 5.3, s1: 1160, s2: 1206, ft: 1238 }; // nos stories, o topo e o fundo ficam tapados pelos botões da app
  const gr = ctx.createRadialGradient(W / 2, G.cy - 130, 60, W / 2, G.cy - 30, H * .75); gr.addColorStop(0, T.bg[0]); gr.addColorStop(1, T.bg[1]); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  soulSky(ctx, W, H, T, seeded('cst' + (me ? me.serial : '')));
  ctx.textAlign = 'center'; ctx.fillStyle = T.acc; ctx.font = '700 40px Cinzel'; ctx.fillText('A MINHA CONSTELAÇÃO', W / 2, G.t1);
  ctx.fillStyle = T.ink; ctx.font = 'italic 700 60px "Cormorant Garamond"'; ctx.fillText(me ? `O céu de ${me.first}` : 'O meu céu', W / 2, G.t2);
  // da grelha do desenho para a imagem
  const P = Y.P, cx = 540, cy = G.cy, sc = G.sc, Q = P.map(p => [cx + (p[0] - Y.C[0]) * sc, cy + (p[1] - Y.C[1]) * sc]); // roda fixa: o mapa tem sempre o mesmo tamanho, com 3 ou 300 estrelas
  wheelCanvas(ctx, cx, cy, WHEEL_R * sc, T.acc, { alpha: .55, galpha: 1.4, w: .9 });
  ctx.strokeStyle = T.acc; ctx.lineWidth = 2.2; ctx.globalAlpha = .5; Y.lines.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...Q[a]); ctx.lineTo(...Q[b]); ctx.stroke(); }); ctx.globalAlpha = 1;
  const dot = (p, r, col, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; };
  const paw = (p, s, col) => { ctx.fillStyle = col; ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 1.6, 2.3, 1.9, 0, 0, 7); ctx.fill(); [[-2.5, -1.4], [-.9, -2.7], [.9, -2.7], [2.5, -1.4]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 1, 0, 7); ctx.fill(); }); ctx.restore(); };
  const boxes = [], label = (txt, p, dy, col, font) => { ctx.font = font; const w = ctx.measureText(txt).width, b = [p[0] - w / 2 - 4, p[1] + dy - 26, p[0] + w / 2 + 4, p[1] + dy + 6]; if (b[0] < 20 || b[2] > W - 20 || boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) return; boxes.push(b); ctx.fillStyle = col; ctx.fillText(txt, p[0], p[1] + dy); };
  // tu, no centro
  dot(Q[0], 30, T.acc, .18); ctx.strokeStyle = T.acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Q[0][0], Q[0][1], 17, 0, 7); ctx.stroke(); dot(Q[0], 7, T.acc);
  boxes.push([Q[0][0] - 30, Q[0][1] - 30, Q[0][0] + 30, Q[0][1] + 30]);
  const order = Y.shown.map((x, i) => [x, i]).sort((a, b) => (Y.top(b[0]) - Y.top(a[0])) || (a[1] - b[1]));
  order.forEach(([x, i]) => { const p = Q[i + 1], pet = linkPet(x); const z = Y.sz, kd = linkKind(x); if (kindSym(kd)) { dot(p, 26 * z, x.l === 3 ? T.acc : T.star, .16); kindCanvas(ctx, kd, p[0], p[1], 3.9 * z, x.l === 3 ? T.acc : T.star); } else if (x.l === 3) { dot(p, 30 * z, T.acc, .22); dot(p, 15 * z, T.acc); } else if (x.near) { dot(p, 22 * z, T.star, .16); dot(p, 11 * z, T.star); } else dot(p, (x.l === 2 ? 9 : 7) * z, T.star, x.l ? 1 : .7); boxes.push([p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12]); });
  label(me ? me.first : 'tu', Q[0], 62, T.ink, '700 30px Manrope');
  order.forEach(([x, i]) => { const p = Q[i + 1], big = kindSym(linkKind(x)) || x.l === 3 || x.near; label(x.first, p, (big ? 56 : 40) * (Y.sz < 1 ? .75 : 1), Y.top(x) ? T.ink : T.mute, `${Y.top(x) ? 700 : 600} ${Y.sz < 1 ? 22 : big ? 28 : 24}px Manrope`); });
  const pets = Y.L.filter(x => linkPet(x)).length, l3 = Y.L.filter(x => x.l === 3).length;
  ctx.fillStyle = T.ink; ctx.font = '700 36px Manrope'; ctx.fillText(`✦ ${Y.n} ${Y.n === 1 ? 'estrela acesa' : 'estrelas acesas'}`, W / 2, G.s1);
  const sub = [l3 ? `${l3} alma${l3 > 1 ? 's' : ''} gémea${l3 > 1 ? 's' : ''}` : '', pets ? `${pets} patudo${pets > 1 ? 's' : ''}` : '', Y.n > 40 ? `+${Y.n - 40} fora do desenho` : ''].filter(Boolean).join(' · ');
  if (sub) { ctx.fillStyle = T.mute; ctx.font = '600 28px Manrope'; ctx.fillText(sub, W / 2, G.s2); }
  await soulBrandBand(ctx, W, G.ft, T); c._stamped = 1; // a marca já vai na faixa: sem o carimbo pequeno por cima
  return c;
}
function soulStarsShare() {
  const dlg = $('#soulDlg'); if (!soulLinks().length) return toast('Lê uma carta primeiro: cada uma acende uma estrela ✦');
  let tone = STAR_TONES[store.get('ceu_theme')] ? store.get('ceu_theme') : 'astral', story = false, cv = null;
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="ssX" aria-label="Fechar">✕</button><h2>✦ Partilhar a minha constelação</h2><p class="note">Escolhe o tom. Os nomes de quem leste aparecem na imagem.</p>
    <div class="sttones">${Object.entries(STAR_TONES).map(([k, t]) => `<button data-t="${k}"${k === tone ? ' class="on"' : ''}><i style="background:linear-gradient(135deg,${t.bg[0]},${t.bg[1]});border-color:${t.acc}"></i>${t.nm}</button>`).join('')}</div>
    <div class="stfmt"><button data-f="0" class="on">📱 Post <i>4:5</i></button><button data-f="1">🎬 Story <i>9:16</i></button></div><img id="ssPrev" class="stprev" alt="A tua constelação"><div class="dlgfoot"><button class="btn" id="ssBack">Voltar</button><button class="btn main" id="ssGo">📤 Partilhar</button></div></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  const draw = async () => { cv = await soulStarsCanvas(tone, story); const im = $('#ssPrev'); if (im) im.src = cv.toDataURL('image/jpeg', .82); };
  dlg.querySelectorAll('.stfmt button').forEach(b => b.onclick = () => { story = b.dataset.f === '1'; dlg.querySelectorAll('.stfmt button').forEach(z => z.classList.toggle('on', z === b)); draw(); });
  dlg.querySelectorAll('.sttones button').forEach(b => b.onclick = () => { tone = b.dataset.t; dlg.querySelectorAll('.sttones button').forEach(z => z.classList.toggle('on', z === b)); draw(); });
  $('#ssX').onclick = () => dlg.close(); $('#ssBack').onclick = soulLinksView;
  $('#ssGo').onclick = async () => { if (!cv) await draw(); shareCanvases([{ c: cv, name: story ? 'a-minha-constelacao-story' : 'a-minha-constelacao' }], `✦ A minha constelação no Céu de Hoje: ${soulLinks().length} estrelas acesas. Cada carta da alma que leio acende uma. Lê a tua em ceudehoje.com #CartaDaAlma`); };
  draw();
}
// ---------- Tatuagem da constelação: traço fino, minimalista, pronta para levar ao tatuador ----------
async function soulTattooCanvas(o = {}) { // o.style: 'fino'|'pontos' · o.names: 0|1|2 · o.frame: 'nada'|'lua'|'circulo' · o.ink: 'preto'|'branco'
  await fontsReady(); const Y = soulStarLayout(40), me = soulMe(), [c, ctx, W, H] = newCanvas(1080, 1350); ctx.__noTheme = true;
  const paper = o.ink === 'branco' ? '#0d0d12' : '#fbfaf7', ink = o.ink === 'branco' ? '#f4f1ea' : '#16141a', rnd = seeded('tat' + (me ? me.serial : '') + Y.n);
  ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
  // enquadrar só a constelação, centrada; com moldura fica mais pequena para caber lá dentro
  const P = Y.P, xs = P.map(p => p[0]), ys = P.map(p => p[1]), mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys), bx = (mx + Mx) / 2, by = (my + My) / 2;
  const R0 = Math.max(8, ...P.map(p => Math.hypot(p[0] - bx, p[1] - by))), fr = o.frame || 'nada';
  let sc = Math.min(24, 760 / Math.max(Mx - mx, 1), 760 / Math.max(My - my, 1)); if (fr === 'lua') sc = Math.min(sc, 250 / R0); if (fr === 'circulo') sc = Math.min(sc, 330 / R0);
  const wheel = fr === 'roda'; if (wheel) sc = 5.5; // roda: as estrelas ficam no sítio real do signo de cada pessoa
  const cx = W / 2, cy = wheel ? 590 : 590, ox = wheel ? Y.C[0] : bx, oy = wheel ? Y.C[1] : by, Q = P.map(p => [cx + (p[0] - ox) * sc, cy + (p[1] - oy) * sc]), Rd = wheel ? 59 * sc : R0 * sc;
  const z = wheel ? 1 : Math.max(.7, Math.min(1.2, sc / 11)), lw = wheel ? 2 : 2.2 * Math.min(1, z);
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw;
  const dot = (p, r) => { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); };
  const line = (a, b, w = lw) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.lineWidth = lw; };
  const spark = (p, r, k = 4, inner = .2) => { ctx.beginPath(); for (let i = 0; i < k * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / k, rr = i % 2 ? r * inner : r; ctx.lineTo(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
  const flare = (p, r) => { spark(p, r * 1.9, 4, .045); spark(p, r * .95, 4, .2); ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4); spark([0, 0], r * .55, 4, .12); ctx.restore(); }; // alma gémea: um brilho de 8 pontas, finas e longas // alma gémea: estrela com raios finos
  const paw = (p, s) => { ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 1.6, 2.3, 1.9, 0, 0, 7); ctx.fill(); [[-2.5, -1.4], [-.9, -2.7], [.9, -2.7], [2.5, -1.4]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 1, 0, 7); ctx.fill(); }); ctx.restore(); };
  const rOf = i => { if (!i) return 22 * z; const x = Y.shown[i - 1]; return (kindSym(linkKind(x)) ? 16 : x.l === 3 ? 34 : x.near ? 13 : x.l === 2 ? 10 : 7) * z; };
  // moldura
  const fc = [cx, cy];
  if (wheel) wheelCanvas(ctx, cx, cy, WHEEL_R * sc, ink); // roda em traço fino com as regras dos tatuadores: traço ≥1,5 px, 1 mm (≈7 px) entre traços, símbolos ≥35 px
  if (fr === 'circulo') { const R = Rd + 70; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fc[0], fc[1], R, -Math.PI / 2 + .09, Math.PI * 1.5 - .09); ctx.stroke(); spark([fc[0], fc[1] - R], 11, 4, .18); dot([fc[0] - 30, fc[1] - R + 2], 1.8); dot([fc[0] + 30, fc[1] - R + 2], 1.8); ctx.lineWidth = lw; }
  if (fr === 'lua') { const R = Rd / .6, ic = [fc[0] + R * .28, fc[1] - R * .18], ir = R * .95; ctx.lineWidth = 1.6;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(ic[0] + ir, ic[1]); ctx.arc(ic[0], ic[1], ir, 0, Math.PI * 2, true); ctx.closePath(); ctx.clip('evenodd'); ctx.beginPath(); ctx.arc(fc[0], fc[1], R, 0, 7); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(fc[0], fc[1], R, 0, 7); ctx.clip(); ctx.beginPath(); ctx.arc(ic[0], ic[1], ir, 0, 7); ctx.stroke(); ctx.restore(); ctx.lineWidth = lw; }
  // linhas: param antes das estrelas (o respiro do traço fino)
  const segs = [];
  Y.lines.forEach(([a, b]) => {
    const A = Q[a], B = Q[b], d = Math.hypot(B[0] - A[0], B[1] - A[1]); if (d < 1) return; const ux = (B[0] - A[0]) / d, uy = (B[1] - A[1]) / d, ga = Math.min(rOf(a), 24 * z) + 8 * z, gb = Math.min(rOf(b), 24 * z) + 8 * z; if (d <= ga + gb) return;
    const p0 = [A[0] + ux * ga, A[1] + uy * ga], p1 = [B[0] - ux * gb, B[1] - uy * gb]; segs.push([p0, p1]);
    if (o.style === 'pontos') { const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(2, Math.round(L / (10 * z))); for (let k = 0; k <= n; k++) dot([p0[0] + (p1[0] - p0[0]) * k / n, p0[1] + (p1[1] - p0[1]) * k / n], 1.6 * z); }
    else line(p0, p1);
  });
  // tu: um pequeno Sol
  ctx.beginPath(); ctx.arc(Q[0][0], Q[0][1], 12 * z, 0, 7); ctx.stroke(); dot(Q[0], 3.4 * z);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r1 = 17 * z, r2 = (k % 2 ? 21 : 25) * z; line([Q[0][0] + Math.cos(a) * r1, Q[0][1] + Math.sin(a) * r1], [Q[0][0] + Math.cos(a) * r2, Q[0][1] + Math.sin(a) * r2], 1.4 * z); }
  Y.shown.forEach((x, i) => { const p = Q[i + 1], kd = linkKind(x);
    if (kindSym(kd)) { kindCanvas(ctx, kd, p[0], p[1], 3 * z, ink); if (x.l === 3) spark([p[0] + 17 * z, p[1] - 15 * z], 7 * z, 4, .18); } else if (x.l === 3) flare(p, 15 * z); else if (x.near) { dot(p, 4 * z); ctx.lineWidth = 1.2 * z; ctx.beginPath(); ctx.arc(p[0], p[1], 10 * z, 0, 7); ctx.stroke(); ctx.lineWidth = lw; } else if (x.l === 2) spark(p, 10 * z, 4, .2); else dot(p, (x.l ? 4.2 : 3) * z);
  });
  // nomes
  const boxes = Q.map((p, i) => { const r = Math.min(rOf(i), 26 * z); return [p[0] - r, p[1] - r, p[0] + r, p[1] + r]; });
  const hitL = b => segs.some(([A, B]) => { for (let t = 0; t <= 1; t += .04) { const x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t; if (x > b[0] && x < b[2] && y > b[1] && y < b[3]) return true; } return false; });
  if (o.names) {
    const fs = Math.round((o.names === 1 ? 28 : 25) * Math.max(.85, Math.min(1.1, z))); ctx.font = `${o.names === 1 ? '' : 'italic '}500 ${fs}px "Cormorant Garamond", serif`; ctx.textAlign = 'center'; if ('letterSpacing' in ctx) ctx.letterSpacing = o.names === 1 ? '4px' : '2px';
    const nm = t => o.names === 1 ? [...t][0].toUpperCase() : t;
    [[me ? me.first : '', 0]].concat(Y.shown.map((x, i) => [x.first, i + 1])).forEach(([t, i]) => { if (!t) return; const s = nm(t), w = ctx.measureText(s).width, p = Q[i], r = Math.min(rOf(i), 26 * z) + 8;
      const cand = [[0, r + fs * .8], [0, -r], [r + w / 2, fs * .35], [-r - w / 2, fs * .35], [r * .8 + w / 2, r * .8 + fs * .6], [-r * .8 - w / 2, r * .8 + fs * .6], [r * .8 + w / 2, -r * .7], [-r * .8 - w / 2, -r * .7]];
      for (const [dx, dy] of cand) { const x = p[0] + dx, y = p[1] + dy, b = [x - w / 2 - 4, y - fs * .8, x + w / 2 + 4, y + fs * .25]; if (b[0] < 30 || b[2] > W - 30 || hitL(b) || boxes.some((q, k) => k !== i && b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])) continue; boxes.push(b); ctx.fillText(s, x, y); break; }
    });
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  // poeira de estrelas: poucos pontos, longe das estrelas, linhas e nomes
  const area = wheel ? 58 * sc : fr === 'nada' ? Rd + 90 : fr === 'lua' ? Rd / .6 * .62 + 30 : Rd + 52, dust = [];
  for (let t = 0; t < 600 && dust.length < (wheel ? 6 : 22); t++) { const a = rnd() * 7, rr = Math.sqrt(rnd()) * area, p = [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; if (p[1] > 1120 || p[1] < 70) continue; const b = [p[0] - 14, p[1] - 14, p[0] + 14, p[1] + 14];
    if (boxes.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]) || hitL(b) || dust.some(d => Math.hypot(d[0] - p[0], d[1] - p[1]) < 46)) continue; dust.push(p); }
  dust.forEach((p, k) => { if (k % 7 === 0) spark(p, 6 * z, 4, .2); else dot(p, (k % 3 ? 1.4 : 2.2) * z); });
  // legenda: o teu signo, o teu nome e quantas estrelas
  const ly = Math.min(1150, wheel ? cy + WHEEL_R * sc + 118 : (fr === 'nada' ? Math.max(...Q.map(p => p[1])) + 110 : fr === 'lua' ? cy + Rd / .6 + 70 : cy + Rd + 130));
  ctx.textAlign = 'center'; ctx.fillStyle = ink; ctx.font = `500 ${wheel ? 36 : 28}px "Cormorant Garamond", serif`; if ('letterSpacing' in ctx) ctx.letterSpacing = wheel ? '12px' : '9px';
  const sg = me ? SIGNS[me.s].g + TXT : '✦'; ctx.fillText(`${me ? me.first.toUpperCase() : ''}`, W / 2, ly);
  ctx.font = '30px "Noto Sans Symbols","Noto Sans Symbols 2","Segoe UI Symbol",sans-serif'; if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'; if (!wheel) ctx.fillText(sg, W / 2, ly - 44); // na roda o signo já está lá
  spark([W / 2, ly + 24], 7, 4, .18); line([W / 2 - 70, ly + 24], [W / 2 - 18, ly + 24], 1.5); line([W / 2 + 18, ly + 24], [W / 2 + 70, ly + 24], 1.5);
  ctx.globalAlpha = .75; ctx.font = 'italic 500 24px "Cormorant Garamond", serif'; ctx.fillText(`${Y.n} ${Y.n === 1 ? 'estrela' : 'estrelas'} · ${roman(new Date().getFullYear())}`, W / 2, ly + 62); ctx.globalAlpha = 1;
  // assinatura discreta (o tatuador recorta se quiser)
  ctx.globalAlpha = .5; ctx.font = '700 20px Cinzel'; if ('letterSpacing' in ctx) ctx.letterSpacing = '6px'; ctx.fillText('CÉU DE HOJE', W / 2, H - 84); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.globalAlpha = .4; ctx.font = '500 19px Manrope'; ctx.fillText('Constelação desenhada em ceudehoje.com', W / 2, H - 52); ctx.globalAlpha = 1;
  c._stamped = 1; return c;
}
const roman = n => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
function soulTattooView() {
  const dlg = $('#soulDlg'); if (!soulLinks().length) return toast('Lê uma carta primeiro: cada uma acende uma estrela ✦');
  const o = { style: 'fino', names: 1, frame: 'roda', ink: 'preto' }; let cv = null;
  const seg = (k, opts) => `<div class="tatseg" data-k="${k}">${opts.map(([v, t]) => `<button data-v="${v}"${String(o[k]) === String(v) ? ' class="on"' : ''}>${t}</button>`).join('')}</div>`;
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="ttX" aria-label="Fechar">✕</button><h2>🖋️ A tua constelação em tatuagem</h2><p class="note">Traço fino e minimalista, feita das pessoas que leste: não há outra igual. Leva a imagem ao teu tatuador.</p>
    ${seg('style', [['fino', '✒️ Traço fino'], ['pontos', '⋯ Pontilhado']])}${seg('names', [[0, 'Sem nomes'], [1, 'Iniciais'], [2, 'Nomes']])}${seg('frame', [['roda', '☸ Zodíaco'], ['lua', '☾ Lua'], ['circulo', '◯ Círculo'], ['nada', 'Livre']])}${seg('ink', [['preto', '⚫ Tinta preta'], ['branco', '⚪ Tinta branca']])}
    <img id="ttPrev" class="stprev" alt="A tua tatuagem"><p class="note">☉ tu · ✦ alma gémea · ✧ 2 ligações · 🐾 patudo · ◎ quem guardaste perto. A forma muda com cada carta que lês.</p>
    <div class="dlgfoot"><button class="btn" id="ttBack">Voltar</button><button class="btn main" id="ttGo">📤 Partilhar</button></div></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  const draw = async () => { cv = await soulTattooCanvas(o); const im = $('#ttPrev'); if (im) im.src = cv.toDataURL('image/jpeg', .85); };
  dlg.querySelectorAll('.tatseg button').forEach(b => b.onclick = () => { const k = b.parentNode.dataset.k; o[k] = k === 'names' ? +b.dataset.v : b.dataset.v; b.parentNode.querySelectorAll('button').forEach(z => z.classList.toggle('on', z === b)); draw(); });
  $('#ttX').onclick = () => dlg.close(); $('#ttBack').onclick = soulLinksView;
  $('#ttGo').onclick = async () => { if (!cv) await draw(); shareCanvases([{ c: cv, name: 'tatuagem-constelacao' }], `🖋️ A minha constelação em tatuagem, feita das almas que li no Céu de Hoje. Não existe outra igual. Faz a tua em ceudehoje.com #CartaDaAlma #tatuagem`); };
  draw();
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#stTat')) soulTattooView(); });
function soulMilestone(prevN) { // marcos novos depois de ler uma carta
  const st = soulStars(), seen = (store.get('ceu_soul_ms') || '').split(',').filter(Boolean), add = [];
  st.got.forEach(m => { if (!seen.includes('n' + m[0])) add.push(['n' + m[0], `⭐ ${m[1]}! ${m[0]} ${m[0] === 1 ? 'estrela acesa' : 'estrelas acesas'}`]); });
  if (st.best >= 2 && !seen.includes('l2')) add.push(['l2', '🌗 Primeira constelação quase completa!']);
  if (st.l3 && !seen.includes('l3')) add.push(['l3', '✨ Encontraste uma alma gémea!']);
  if (!add.length) return; store.set('ceu_soul_ms', seen.concat(add.map(a => a[0])).join(','));
  setTimeout(() => toast(add[add.length - 1][1], 4500), 1200);
}
function soulTodayHtml(o) { // a secção "Hoje" dentro da carta
  const m = soulDayMsg(o), st = soulStars(), ppl = soulTodayPeople();
  return `<div class="soulwant soultoday"><b>☀️ A tua alma hoje</b><p class="stmsg">${esc(m.txt)}</p><p class="note">Lua em ${SIGNS[m.tm].n} · dia pessoal ${m.pd}: ${SOUL_PDAY[m.pd]}</p>
    ${ppl.length ? `<div class="stppl"><b>💞 O dia de vocês</b>${ppl.slice(0, 8).map(x => `<p><span>${x.ic}</span> <b>${esc(x.nm)}</b>: ${esc(x.txt)}</p>`).join('')}</div>` : ''}
    <div class="stcol"><b>✦ A tua constelação de ligações</b>${soulStarsSVG(st.n)}<div class="sstwho" id="sstWho" hidden></div><p>${st.n ? `<b>${st.n}</b> ${st.n === 1 ? 'estrela acesa' : 'estrelas acesas'}${st.l3 ? ` · ${st.l3} alma${st.l3 > 1 ? 's' : ''} gémea${st.l3 > 1 ? 's' : ''} ✨` : ''}` : 'Ainda nenhuma estrela: cada carta que lês acende uma.'}${st.next ? ` · faltam ${st.next[0] - st.n} para «${st.next[1]}»` : ''}</p>${st.n ? '<div class="sttwo"><button class="btn" id="stShare">📤 Partilhar</button><button class="btn" id="stTat">🖋️ Criar tatuagem</button></div>' : ''}</div></div>`;
}
