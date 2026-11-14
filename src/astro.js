// ===== Motor astronómico (Meeus + elementos orbitais JPL, válido 1800–2050) =====
const D2R = Math.PI / 180;
const norm = x => ((x % 360) + 360) % 360;
const sinD = x => Math.sin(x * D2R), cosD = x => Math.cos(x * D2R);
const jdFromMs = ms => ms / 86400000 + 2440587.5;
const msFromJd = jd => (jd - 2440587.5) * 86400000;
function angDiff(a, b) { let d = norm(a - b); if (d > 180) d -= 360; return d; }

function sunLon(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T, M = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * sinD(M) + (0.019993 - 0.000101 * T) * sinD(2 * M) + 0.000289 * sinD(3 * M);
  return norm(L0 + C - 0.00569 - 0.00478 * sinD(125.04 - 1934.136 * T));
}
const MOON_T = [[6.288774, 0, 0, 1, 0], [1.274027, 2, 0, -1, 0], [0.658314, 2, 0, 0, 0], [0.213618, 0, 0, 2, 0], [-0.185116, 0, 1, 0, 0], [-0.114332, 0, 0, 0, 2], [0.058793, 2, 0, -2, 0], [0.057066, 2, -1, -1, 0], [0.053322, 2, 0, 1, 0], [0.045758, 2, -1, 0, 0], [-0.040923, 0, 1, -1, 0], [-0.034720, 1, 0, 0, 0], [-0.030383, 0, 1, 1, 0], [0.015327, 2, 0, 0, -2], [-0.012528, 0, 0, 1, 2], [0.010980, 0, 0, 1, -2], [0.010675, 4, 0, -1, 0], [0.010034, 0, 0, 3, 0], [0.008548, 4, 0, -2, 0], [-0.007888, 2, 1, -1, 0], [-0.006766, 2, 1, 0, 0], [-0.005163, 1, 0, -1, 0], [0.004987, 1, 1, 0, 0], [0.004036, 2, -1, 1, 0]];
function moonLon(jd) {
  const T = (jd - 2451545) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T, D = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T, Mp = 134.9633964 + 477198.8675055 * T, F = 93.2720950 + 483202.0175233 * T;
  let lon = Lp; for (const [a, d, m, mp, f] of MOON_T) lon += a * sinD(d * D + m * M + mp * Mp + f * F);
  return norm(lon);
}
const EL = {
  mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0],
  mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  pluto: [39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684, -0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]
};
function helio(name, T) {
  const e0 = EL[name];
  const a = e0[0] + e0[6] * T, e = e0[1] + e0[7] * T, I = e0[2] + e0[8] * T, L = e0[3] + e0[9] * T, wb = e0[4] + e0[10] * T, Om = e0[5] + e0[11] * T;
  const w = wb - Om; let M = norm(L - wb); if (M > 180) M -= 360; const Mr = M * D2R;
  let E = Mr + e * Math.sin(Mr); for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = cosD(w), sw = sinD(w), cO = cosD(Om), sO = sinD(Om), cI = cosD(I), sI = sinD(I);
  return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, (sw * sI) * xp + (cw * sI) * yp];
}
function planetLon(name, jd) {
  const T = (jd - 2451545) / 36525, p = helio(name, T), E = helio('earth', T);
  return norm(Math.atan2(p[1] - E[1], p[0] - E[0]) / D2R + 1.3970 * T);
}
const CLASSIC = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const OUTER = ['uranus', 'neptune', 'pluto'];
const ALLP = CLASSIC.concat(OUTER);
const lonOf = (p, jd) => p === 'sun' ? sunLon(jd) : p === 'moon' ? moonLon(jd) : planetLon(p, jd);
const meanNode = jd => norm(125.0445479 - 1934.1362891 * ((jd - 2451545) / 36525));

function skyAtJd(jd) {
  const s = {};
  for (const p of ALLP) {
    const lon = lonOf(p, jd), sp = angDiff(lonOf(p, jd + 0.5), lonOf(p, jd - 0.5));
    s[p] = { lon, sign: Math.floor(lon / 30), deg: lon % 30, rx: p !== 'sun' && p !== 'moon' && sp < 0 };
  }
  const el = norm(s.moon.lon - s.sun.lon); s.phase = { elong: el, illum: (1 - cosD(el)) / 2 };
  return s;
}
const noonJd = ds => { const [y, m, d] = ds.split('-').map(Number); return jdFromMs(Date.UTC(y, m - 1, d, 12)); };
const dayStr = jd => new Date(msFromJd(jd)).toISOString().slice(0, 10);
const _skyCache = {};
function skyFor(ds) {
  if (_skyCache[ds]) return _skyCache[ds];
  const jd = noonJd(ds), s = skyAtJd(jd);
  const j0 = jd - 0.5, s0 = Math.floor(moonLon(j0) / 30), s1 = Math.floor(moonLon(j0 + 1) / 30);
  s.moonSignStart = s0; s.moonIngress = null;
  if (s0 !== s1) { let lo = j0, hi = j0 + 1; for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (Math.floor(moonLon(mid) / 30) === s0) lo = mid; else hi = mid; } s.moonIngress = { to: s1, time: new Date(msFromJd(hi)) }; }
  s.date = ds;
  return (_skyCache[ds] = s);
}

// ---- Acontecimentos num intervalo de dias [ds0, ds1] ----
const ASPECTS = [[0, 'conj'], [60, 'sext'], [90, 'quad'], [120, 'tri'], [180, 'opo']];
function bisect(f, lo, hi) { let flo = f(lo); for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2, fm = f(mid); if ((fm < 0) === (flo < 0)) { lo = mid; flo = fm; } else hi = mid; } return (lo + hi) / 2; }
function eventsBetween(ds0, ds1, modern, noAspects) {
  const list = modern ? ALLP : CLASSIC, ev = [];
  const j0 = noonJd(ds0) - 0.5, j1 = noonJd(ds1) + 0.5;
  // luas novas / cheias / quartos
  for (let j = j0; j < j1; j += noAspects ? 0.5 : 0.25) {
    const st = noAspects ? 0.5 : 0.25;
    for (const [tgt, kind] of [[0, 'nova'], [180, 'cheia'], [90, 'crescente'], [270, 'minguante']]) {
      const f = x => angDiff(moonLon(x) - sunLon(x), tgt);
      const a = f(j), b = f(j + st);
      if (a < 0 && b >= 0 && Math.abs(a - b) < 30) {
        const t = bisect(f, j, j + st), ml = moonLon(t), node = meanNode(t), sl = sunLon(t);
        const dn = Math.min(Math.abs(angDiff(sl, node)), Math.abs(angDiff(sl, node + 180)));
        const eclipse = (kind === 'nova' && dn < 15.4) ? 'solar' : (kind === 'cheia' && dn < 11.5) ? 'lunar' : null;
        ev.push({ type: 'lua', kind, jd: t, sign: Math.floor(ml / 30), eclipse });
      }
    }
  }
  // ingressos e estações
  let prev = null;
  for (let j = noonJd(ds0) - 1; j <= noonJd(ds1); j += 1) {
    const cur = {};
    for (const p of list) if (p !== 'moon') { const l = lonOf(p, j); cur[p] = { sign: Math.floor(l / 30), rx: p !== 'sun' && angDiff(lonOf(p, j + 0.5), lonOf(p, j - 0.5)) < 0 }; }
    if (prev) for (const p in cur) {
      if (cur[p].sign !== prev[p].sign) ev.push({ type: 'ingresso', p, jd: j, sign: cur[p].sign, rx: cur[p].rx });
      if (cur[p].rx !== prev[p].rx) ev.push({ type: 'estacao', p, jd: j, rx: cur[p].rx, sign: cur[p].sign });
    }
    prev = cur;
  }
  // aspetos exatos entre planetas (sem a Lua)
  const ps = noAspects ? [] : list.filter(p => p !== 'moon');
  for (let a = 0; a < ps.length; a++) for (let b = a + 1; b < ps.length; b++) {
    const P = ps[a], Q = ps[b];
    for (const [A, name] of ASPECTS) {
      if ((P === 'sun' && (Q === 'mercury' || Q === 'venus')) && A !== 0) continue;
      if (P === 'mercury' && Q === 'venus' && A > 60) continue;
      for (const tgt of A === 0 || A === 180 ? [A] : [A, -A]) {
        const f = x => angDiff(angDiff(lonOf(P, x), lonOf(Q, x)), tgt);
        for (let j = noonJd(ds0) - 0.5; j < noonJd(ds1) + 0.5; j += 1) {
          const u = f(j), v = f(j + 1);
          if (Math.abs(u) < 8 && Math.abs(v) < 8 && ((u < 0) !== (v < 0))) ev.push({ type: 'aspeto', p: P, q: Q, asp: name, jd: bisect(f, j, j + 1) });
        }
      }
    }
  }
  return ev.filter(e => e.jd >= j0 && e.jd < j1).sort((x, y) => x.jd - y.jd);
}

// ---- Ascendente ----
function ascendant(ms, lat, lonE) {
  const jd = jdFromMs(ms), T = (jd - 2451545) / 36525;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T);
  const th = norm(gmst + lonE), eps = 23.4392911 - 0.0130042 * T;
  return norm(Math.atan2(cosD(th), -(sinD(th) * cosD(eps) + Math.tan(lat * D2R) * sinD(eps))) / D2R);
}
function tzOffsetMin(ms, tz) {
  const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)).forEach(x => p[x.type] = x.value);
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ms) / 60000;
}
function localToUtcMs(y, mo, d, h, mi, tz) { let ms = Date.UTC(y, mo - 1, d, h, mi); for (let i = 0; i < 3; i++) ms = Date.UTC(y, mo - 1, d, h, mi) - tzOffsetMin(ms, tz) * 60000; return ms; }
