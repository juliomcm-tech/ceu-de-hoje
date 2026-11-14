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
  const lp = lifePath(p.d), n = soulN9(lp), ar = soulArcana(p.d), first = (p.name || '').trim().split(/\s+/)[0] || 'Alma';
  return { first, s, m: mo, asc, lp, n, ar, el: SIGNS[s].el, stone: SIGN_EXTRA[s].pedra, col: SOUL_COL[n], cn: chineseSign(p.d), serial: soulSerial(nrm(p.name || '') + '|' + p.d + '|' + (p.t || '') + '|' + (p.c || 0)) };
}
const soulKey = o => o.s * 108 + o.m * 9 + (o.n - 1);
const soulWant = o => ({ s: (o.s + 6) % 12, m: (o.m + 6) % 12, n: 10 - o.n });
function soulLevel(a, b) { const w = soulWant(a); return (b.s === w.s) + (b.m === w.m) + (b.n === w.n); }
function soulShape(o) { // constelação partilhada por um par de almas complementares; cada uma tem metade
  const ka = soulKey(o), kb = soulKey(soulWant(o)), r = seeded('alma' + Math.min(ka, kb) + '-' + Math.max(ka, kb));
  const half = x0 => { const P = []; for (let i = 0; i < 4; i++) P.push([x0 + r() * .3, .16 + i * .21 + (r() - .5) * .12]); return P; };
  const L = half(.1), R = half(.6); return { L, R, mine: ka < kb ? 'L' : 'R' };
}
const soulCode = o => o.s.toString(36) + o.m.toString(36) + o.n + o.ar.toString(36) + (o.asc == null ? 'x' : o.asc.toString(36)) + o.serial + '~' + encodeURIComponent(o.first);
function soulParse(code) {
  const m = String(code || '').match(/^([0-9ab])([0-9ab])([1-9])([0-9a-l])([0-9abx])([0-9A-Z]{8})~(.{1,80})$/); if (!m) return null;
  let first; try { first = decodeURIComponent(m[7]); } catch (e) { first = 'Alma'; }
  const s = parseInt(m[1], 36), n = +m[3];
  return { s, m: parseInt(m[2], 36), n, ar: parseInt(m[4], 36), asc: m[5] === 'x' ? null : parseInt(m[5], 36), serial: m[6], first: first.replace(/[<>]/g, '').slice(0, 24) || 'Alma', el: SIGNS[s].el, stone: SIGN_EXTRA[s].pedra, col: SOUL_COL[n] };
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
  ${opt.noText ? '' : t(150, 426, 17, esc(o.first.toUpperCase()), G2, 'letter-spacing="3" font-weight="700"')}
  ${t(150, 456, 10, esc(AR) + ' · ' + esc(o.stone), G, 'letter-spacing="1"')}
  ${t(150, 472, 9, 'Alma ' + SOUL_NUM_W[o.n] + ' · ' + E.n, G2, 'opacity=".8" letter-spacing="1"')}
</svg>`);
}

// Versão 2: profundidade (portal em túnel, céu em poço, medalhão em relevo, fita com sombra)
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
    <path d="${path(mineP)}" fill="none" stroke="${G}" stroke-width="1.7" filter="url(#gl${id})"/>${mineP.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i % 2 ? 3 : 4}" fill="${G2}" filter="url(#gl${id})"/>`).join('')}`;
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
  ${t(150, 40, 10.5, 'CARTA DA ALMA', G, 'letter-spacing="3.5" font-weight="700"')}`;
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
  ${opt.noText ? '' : t(150, 427, 17, esc(o.first.toUpperCase()), G2, 'letter-spacing="3" font-weight="700"')}
  ${t(150, 461, 10, esc(AR) + ' · ' + esc(o.stone), G, 'letter-spacing="1"')}
  ${t(150, 476, 8.5, 'Alma ' + SOUL_NUM_W[o.n] + ' · ' + E.n + ' · Nº ' + o.serial.slice(0, 4) + '·' + o.serial.slice(4), G2, 'opacity=".75" letter-spacing="1"')}`;
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
const soulLink = o => 'https://ceudehoje.com/#alma=' + soulCode(o);
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
  ${t(150, 38, 9.5, 'LÊ A MINHA ALMA', G, 'letter-spacing="3.5" font-weight="700"')}
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
function soulMe() { const p = P.get(); return p && p.d ? soulOf(p) : null; }
function openSoul() {
  const dlg = $('#soulDlg'), o = soulMe();
  if (!o) { dlg.innerHTML = `<div class="soulwrap"><h2>💫 A tua Carta da Alma</h2><p>Para criar a tua carta única preciso do teu nome e da tua data de nascimento (e, se souberes, da hora).</p><div class="dlgfoot"><button class="btn" id="soulX">Fechar</button><button class="btn main" id="soulPf">Preencher o meu perfil</button></div></div>`; dlg.showModal(); $('#soulX').onclick = () => dlg.close(); $('#soulPf').onclick = () => { dlg.close(); ST.tab = 'eu'; render(); }; return; }
  const first = !store.get('ceu_soul_seen');
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="soulX" aria-label="Fechar">✕</button>
    <p class="soulhint" id="soulHint">${first ? 'A tua alma tem uma carta só tua. Toca para a revelar ✨' : 'Inclina o telemóvel ou passa o dedo pela carta'}</p>
    <div class="soulstage">${soul3dHtml(o, first)}</div>
    <div class="soulbtns"><button class="btn" id="soulFlip">↻ Ver o verso</button><button class="btn main" id="soulSh">📤 Partilhar</button><button class="btn" id="soulLk">🔗 Enviar o link</button>${'NDEFReader' in window ? '<button class="btn" id="soulNfc">📶 Gravar num chip NFC</button>' : ''}<button class="btn soon" data-soon="porta-chaves">🔑 Encomendar porta-chaves <small>brevemente</small></button><button class="btn soon" data-soon="carta">🃏 Encomendar a carta <small>brevemente</small></button></div>
    <div class="soulinfo" id="soulInfo"${first ? ' hidden' : ''}>
      <div class="soulwant"><b>💞 A tua metade perfeita</b><p>${soulWantTxt(o)}</p><p class="note">Só cerca de 1 em cada 1300 pessoas tem estas três ligações contigo. Partilha a tua carta: quem a ler descobre se é a tua metade.</p></div>
      ${soulCapToday()}<div class="soulbtns"><button class="btn" id="soulVault">🔐 Cofre da alma (${SMEM.all().length})</button><button class="btn" id="soulRead">🔭 Ler a carta de alguém</button><button class="btn" id="soulLinks">💫 As minhas ligações (${soulLinks().length})</button></div>
      <h3 class="soulh">A leitura da tua alma</h3>${soulReading(o)}
      <p class="note">Nº ${o.serial.slice(0, 4)}·${o.serial.slice(4)} · a tua carta é calculada a partir do teu nome e nascimento e é só tua. Inspirada na tradição astrológica, para te divertires e refletires.</p>
    </div></div>`;
  dlg.showModal(); bindSoulTilt();
  $('#soulX').onclick = () => dlg.close();
  const card = $('#soul3d');
  card.onclick = async () => { if (first && !store.get('ceu_soul_seen')) { await soulMotionOk(); store.set('ceu_soul_seen', todayStr()); card.classList.add('reveal'); card.classList.remove('flip'); $('#soulHint').textContent = 'Esta é a tua alma. Inclina o telemóvel ✨'; try { confetti(); } catch (e) { } setTimeout(() => { $('#soulInfo').hidden = false; }, 900); } };
  $('#soulFlip').onclick = async () => { await soulMotionOk(); card.classList.toggle('flip'); $('#soulFlip').textContent = card.classList.contains('flip') ? '↻ Ver a frente' : '↻ Ver o verso'; };
  $('#soulSh').onclick = () => shareSoul(o);
  $('#soulLk').onclick = async () => { const url = soulLink(o), msg = '💫 Esta é a minha Carta da Alma. Abre e descobre se és a minha metade:', txt = `${msg} ${url}`; try { if (navigator.share) { await navigator.share({ title: 'A minha Carta da Alma', text: msg, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } copyAny(txt); toast('Link copiado 📋'); };
  if ($('#soulNfc')) $('#soulNfc').onclick = () => soulWriteNfc(o);
  dlg.querySelectorAll('[data-soon]').forEach(b => b.onclick = () => toast(b.dataset.soon === 'carta' ? '🃏 Em breve vais poder encomendar a tua carta impressa a sério ✨' : '🔑 Em breve vais poder encomendar o teu porta-chaves da alma ✨', 4000));
  $('#soulVault').onclick = () => soulVault(); if ($('#soulCapGo')) $('#soulCapGo').onclick = () => soulVault();
  $('#soulRead').onclick = () => soulReader();
  $('#soulLinks').onclick = () => soulLinksView();
}

// ---------- Partilhar (frente + selo QR) ----------
function svgImg(svg) { return new Promise(res => { const im = new Image(); im.onload = () => (im.decode ? im.decode().then(() => res(im), () => res(im)) : res(im)); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }); }
async function shareSoul(o) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(1080, 1350), E = SOUL_EL[o.el];
  bg(ctx, W, H, 'alma' + o.serial, [E.c[1], '#07050f']);
  const fr = await svgImg(soulSVG2(o)), bk = await svgImg(soulBackSVG(o)); if (!fr) { toast('Não deu para criar a imagem'); return; }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.drawImage(fr, 50, 160, 520, 867); ctx.restore();
  if (bk) { ctx.save(); ctx.translate(815, 600); ctx.rotate(.04); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.drawImage(bk, -215, -358, 430, 717); ctx.restore(); }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 46px Cinzel'; ctx.fillText('A MINHA CARTA DA ALMA', W / 2, 100);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; ctx.fillText('Procuro a minha metade:', W / 2, 1150);
  ctx.fillStyle = '#f7e08a'; ctx.font = '700 40px Manrope'; ctx.fillText(soulWantTxt(o), W / 2, 1206);
  ctx.fillStyle = '#d9d0ff'; ctx.font = '500 28px Manrope'; ctx.fillText('Lê o QR e descobre se és tu 💞', W / 2, 1252);
  brandFoot(ctx, W, H, H - 40);
  shareCanvases([{ c, name: 'carta-da-alma' }], `💫 A minha Carta da Alma é única. Procuro a minha metade: ${soulWantTxt(o)}. Lê o QR ou abre ${soulLink(o)} e descobre se és tu! #CéuDeHoje #CartaDaAlma`);
}

// ---------- Leitor do Céu ----------
const soulLinks = () => { try { return JSON.parse(store.get('ceu_soul_links') || '[]'); } catch (e) { return []; } };
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
function soulReader() {
  const dlg = $('#soulDlg');
  dlg.innerHTML = `<div class="soulwrap"><h2>🔭 Leitor do Céu</h2><p>Lê a Carta da Alma de alguém e descobre se as vossas constelações encaixam.</p>
    ${'BarcodeDetector' in window ? '<button class="btn main" id="srCam" style="width:100%">📷 Ler o QR com a câmara</button>' : '<p class="note">📷 Aponta a câmara normal do telemóvel ao QR da carta: abre logo aqui.</p>'}
    <label style="display:block;margin-top:12px">Ou cola o link da carta<input type="text" id="srTxt" placeholder="https://ceudehoje.com/#alma=…"></label>
    <div class="dlgfoot"><button class="btn" id="srBack">Voltar</button><button class="btn main" id="srGo">Ler a carta</button></div></div>`;
  if (!dlg.open) dlg.showModal();
  $('#srBack').onclick = openSoul;
  const go = v => { const m = String(v || '').match(/alma=([^\s&]+)/) || [null, String(v || '').trim()]; const other = soulParse(decodeURIComponent(m[1] || '').replace(/\s/g, '') .replace(/%7E/gi, '~')) || soulParse(m[1]); if (!other) { toast('Esse link não é de uma Carta da Alma'); return; } soulMatch(other); };
  $('#srGo').onclick = () => go($('#srTxt').value);
  if ($('#srCam')) $('#srCam').onclick = async () => { const v = await scanQR(); if (v) go(v); else if (!dlg.open) dlg.showModal(); };
}
function soulMatch(other) {
  const dlg = $('#soulDlg'), me = soulMe();
  if (!me) { dlg.innerHTML = `<div class="soulwrap"><h2>💫 A carta de ${esc(other.first)}</h2><div class="soulpair one">${soulSVG2(other)}</div><p>Para veres se as vossas almas encaixam, cria primeiro a tua carta: só precisas do teu nome e data de nascimento.</p>${soulReading(Object.assign({ lp: other.n }, other))}<div class="dlgfoot"><button class="btn" id="smX">Fechar</button><button class="btn main" id="smPf">Criar a minha carta</button></div></div>`; if (!dlg.open) dlg.showModal(); $('#smX').onclick = () => dlg.close(); $('#smPf').onclick = () => { dlg.close(); ST.tab = 'eu'; render(); }; return; }
  if (other.serial === me.serial) { toast('Essa é a tua própria carta 😄'); return openSoul(); }
  const l = soulLevel(me, other), [h, p] = soulLvlTxt(l), pct = bond(me.s, other.s).pct, w = soulWant(me);
  const L = soulLinks().filter(x => x.serial !== other.serial); L.unshift({ serial: other.serial, first: other.first, code: soulCode(other), l, pct, d: todayStr() }); store.set('ceu_soul_links', JSON.stringify(L.slice(0, 500)));
  const chk = (ok, txt) => `<li class="${ok ? 'ok' : ''}">${ok ? '✦' : '·'} ${txt}</li>`;
  dlg.innerHTML = `<div class="soulwrap"><button class="tclose" id="smX" aria-label="Fechar">✕</button><h2>${h}</h2>
    <div class="soulpair lvl${l}"><div class="sp a">${soulSVG2(me)}</div><div class="sp b">${soulSVG2(other)}</div>${l === 3 ? '<div class="spglow"></div>' : ''}</div>
    <p>${p}</p>
    <ul class="soulchk">${chk(other.s === w.s, `Sol: ${SIGNS[me.s].n} ↔ ${SIGNS[other.s].n}`)}${chk(other.m === w.m, `Lua: ${SIGNS[me.m].n} ↔ ${SIGNS[other.m].n}`)}${chk(other.n === w.n, `Números da alma: ${me.n} + ${other.n}${other.n + me.n === 10 ? ' = 10' : ''}`)}</ul>
    <p class="note">Compatibilidade dos signos: ${pct}%. A ligação ficou guardada na tua carta, em "As minhas ligações".</p>
    <h3 class="soulh">A alma de ${esc(other.first)}</h3>${soulReading(Object.assign({ lp: other.n }, other))}
    <div class="dlgfoot"><button class="btn" id="smBack">A minha carta</button><button class="btn main" id="smSh">📤 Partilhar</button></div></div>`;
  if (!dlg.open) dlg.showModal();
  if (l === 3) try { confetti(); } catch (e) { }
  $('#smX').onclick = () => dlg.close(); $('#smBack').onclick = openSoul; $('#smSh').onclick = () => shareSoulMatch(me, other, l, pct);
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
  dlg.innerHTML = `<div class="soulwrap"><h2>💫 As minhas ligações</h2><p class="note">Cada carta que lês fica gravada na tua alma.</p>
    ${L.length ? `<div class="soullist">${L.map((x, i) => `<button class="soulli" data-i="${i}"><span class="lv lv${x.l}">${'✦'.repeat(x.l) || '·'}</span><b>${esc(x.first)}</b><i>${soulLvlTxt(x.l)[0].replace(/^\S+\s/, '')} · ${x.pct}% · ${x.d.split('-').reverse().join('/')}</i></button>`).join('')}</div>` : '<p>Ainda não leste nenhuma carta. Pede a alguém o link ou o QR da Carta da Alma.</p>'}
    <div class="dlgfoot"><button class="btn" id="slBack">A minha carta</button><button class="btn main" id="slRead">🔭 Ler uma carta</button></div></div>`;
  $('#slBack').onclick = openSoul; $('#slRead').onclick = soulReader;
  dlg.querySelectorAll('.soulli').forEach(b => b.onclick = () => { const o = soulParse(L[+b.dataset.i].code); if (o) soulMatch(o); });
}
function checkSoulLink() { const m = location.hash.match(/^#alma=(.+)$/); if (!m) return false; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } let code = m[1]; try { code = decodeURIComponent(code); } catch (e) { } const o = soulParse(code); if (o) setTimeout(() => soulMatch(o), 300); return true; }
function soulBoxHtml() {
  const o = soulMe();
  return `<button class="soulbox" id="soulBoxGo">${o ? soulSVG2(o) : ''}<div><b>💫 ${o ? 'A tua Carta da Alma' : 'Cria a tua Carta da Alma'}</b><span>${o ? 'Única no mundo. Descobre quem tem a metade da tua constelação.' : 'Uma carta só tua, feita do teu nome e do teu nascimento.'}</span></div></button>`;
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#soulBoxGo')) openSoul(); });

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
  if (!confirmBox('Encosta o chip NFC à parte de trás do telemóvel depois de carregares em OK. A tua carta fica gravada no chip: quem o encostar ao telemóvel abre a tua Carta da Alma.')) return;
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

