// ===== Extras: horas planetárias, pares, Lua, aniversários, ano, mapa pessoal =====
const CITIES = [['Lisboa', 38.72, -9.14, 'Europe/Lisbon'], ['Porto', 41.15, -8.61, 'Europe/Lisbon'], ['Braga', 41.55, -8.42, 'Europe/Lisbon'], ['Coimbra', 40.21, -8.43, 'Europe/Lisbon'], ['Aveiro', 40.64, -8.65, 'Europe/Lisbon'], ['Viseu', 40.66, -7.91, 'Europe/Lisbon'], ['Leiria', 39.74, -8.81, 'Europe/Lisbon'], ['Santarém', 39.24, -8.69, 'Europe/Lisbon'], ['Setúbal', 38.52, -8.89, 'Europe/Lisbon'], ['Évora', 38.57, -7.91, 'Europe/Lisbon'], ['Beja', 38.02, -7.86, 'Europe/Lisbon'], ['Faro', 37.02, -7.93, 'Europe/Lisbon'], ['Viana do Castelo', 41.69, -8.83, 'Europe/Lisbon'], ['Vila Real', 41.30, -7.74, 'Europe/Lisbon'], ['Bragança', 41.81, -6.76, 'Europe/Lisbon'], ['Guarda', 40.54, -7.27, 'Europe/Lisbon'], ['Castelo Branco', 39.82, -7.49, 'Europe/Lisbon'], ['Portalegre', 39.29, -7.43, 'Europe/Lisbon'], ['Funchal', 32.65, -16.91, 'Atlantic/Madeira'], ['Ponta Delgada', 37.74, -25.67, 'Atlantic/Azores'], ['Angra do Heroísmo', 38.65, -27.22, 'Atlantic/Azores'], ['Luanda', -8.84, 13.23, 'Africa/Luanda'], ['Maputo', -25.97, 32.57, 'Africa/Maputo'], ['São Paulo', -23.55, -46.63, 'America/Sao_Paulo'], ['Rio de Janeiro', -22.91, -43.17, 'America/Sao_Paulo'], ['Paris', 48.86, 2.35, 'Europe/Paris'], ['Londres', 51.51, -0.13, 'Europe/London'], ['Genebra', 46.20, 6.14, 'Europe/Zurich'], ['Luxemburgo', 49.61, 6.13, 'Europe/Luxembourg']];
const MES_N = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const fmtHM = (ms, tz) => new Date(ms).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: tz });

// ---------- Sol: altitude, nascer e pôr ----------
function sunAlt(ms, lat, lonE) {
  const jd = jdFromMs(ms), T = (jd - 2451545) / 36525, eps = 23.4392911 - 0.0130042 * T, l = sunLon(jd);
  const ra = Math.atan2(cosD(eps) * sinD(l), cosD(l)) / D2R, dec = Math.asin(sinD(eps) * sinD(l)) / D2R;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545)), H = norm(gmst + lonE - ra);
  return Math.asin(sinD(lat) * sinD(dec) + cosD(lat) * cosD(dec) * cosD(H)) / D2R;
}
function sunEvents(ds, city) {
  const [y, m, d] = ds.split('-').map(Number), t0 = localToUtcMs(y, m, d, 0, 0, city[3]), f = ms => sunAlt(ms, city[1], city[2]) + 0.833;
  let rise = null, set = null;
  for (let t = t0; t < t0 + 864e5; t += 6e5) {
    const a = f(t), b = f(t + 6e5);
    if (a < 0 && b >= 0 && !rise) rise = bisect(f, t, t + 6e5);
    if (a >= 0 && b < 0 && !set) set = bisect(f, t, t + 6e5);
  }
  return { rise, set };
}
const CHALDEAN = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
const HOUR_USE = { venus: 'amor e beleza', jupiter: 'dinheiro e pedidos', mercury: 'conversas, papéis e leitura', mars: 'coragem e desporto', sun: 'brilhar e liderar', moon: 'família e descanso', saturn: 'disciplina e arrumações' };
function planetaryHours(ds, city) {
  const today = sunEvents(ds, city), next = sunEvents(dayStr(noonJd(ds) + 1), city);
  if (!today.rise || !today.set || !next.rise) return null;
  const [y, m, d] = ds.split('-').map(Number), dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  let idx = CHALDEAN.indexOf(DAY_RULER[dow]); const hours = [];
  const dl = (today.set - today.rise) / 12, nl = (next.rise - today.set) / 12;
  for (let i = 0; i < 24; i++) {
    const start = i < 12 ? today.rise + i * dl : today.set + (i - 12) * nl, end = start + (i < 12 ? dl : nl);
    hours.push({ p: CHALDEAN[idx % 7], start, end, night: i >= 12 }); idx++;
  }
  return { hours, rise: today.rise, set: today.set, ruler: DAY_RULER[dow] };
}

// ---------- Compatibilidade do dia ----------
const PAIR_BASE = [75, 50, 80, 42, 90, 48, 65];
const PAIR_TXT = { 0: 'iguais que se entendem sem palavras', 1: 'vizinhos que se completam', 2: 'conversa fácil e cumplicidade', 3: 'atração com faíscas — paciência!', 4: 'harmonia natural, mesmo elemento', 5: 'diferentes, mas aprendem um com o outro', 6: 'opostos que se atraem' };
function pairsDay(ds, modern) {
  const reads = SIGNS.map((_, i) => readDay(i, ds, modern)), sky = skyFor(ds), pairs = [];
  for (let a = 0; a < 12; a++) for (let b = a; b < 12; b++) {
    const k = Math.min((b - a + 12) % 12, (a - b + 12) % 12);
    let s = 0.6 * PAIR_BASE[k] + 0.4 * (reads[a].area.amor + reads[b].area.amor) / 2;
    for (const x of [a, b]) { const km = Math.min((sky.moon.sign - x + 12) % 12, (x - sky.moon.sign + 12) % 12); if ([0, 2, 4].includes(km)) s += 3; if (km === 3) s -= 3; }
    if (sky.venus.sign === a || sky.venus.sign === b) s += 5;
    if (sky.mars.sign === a || sky.mars.sign === b) s += k === 3 || k === 6 ? -4 : 3;
    pairs.push({ a, b, k, score: clamp(Math.round(s * 0.97), 30, 98) });
  }
  pairs.sort((x, y) => y.score - x.score);
  const best = SIGNS.map((_, i) => pairs.filter(p => (p.a === i || p.b === i) && p.a !== p.b)[0]);
  const top = []; for (const p of pairs) { if (p.a === p.b) continue; if (top.some(q => [q.a, q.b].includes(p.a) || [q.a, q.b].includes(p.b))) continue; top.push(p); if (top.length === 3) break; }
  return { pairs, top, worst: pairs.filter(p => p.a !== p.b).slice(-1)[0], best, reads };
}

// ---------- Calendário lunar ----------
const DAY_TYPE = { fogo: ['Dia de fruto', 'tomate, feijão, morangos e árvores de fruto'], terra: ['Dia de raiz', 'cenoura, batata, cebola e alho'], ar: ['Dia de flor', 'flores, brócolos e plantas aromáticas'], agua: ['Dia de folha', 'alface, couve, espinafres e relva'] };
function lunarDay(ds) {
  const s = skyFor(ds), e = s.phase.elong, waxing = e < 180, ph = moonPhaseName(e), el = SIGNS[s.moon.sign].el;
  const nearNew = e < 18 || e > 342, nearFull = Math.abs(e - 180) < 18;
  const good = [], bad = [];
  let hair;
  if (nearNew) { hair = 'Evitar cortar o cabelo'; bad.push('Cortar o cabelo'); }
  else if (nearFull) hair = 'Cortar para dar volume e brilho';
  else if (waxing) hair = (el === 'fogo' || el === 'terra') ? 'Ótimo para cortar: cresce forte e rápido' : 'Bom para cortar: cresce mais depressa';
  else hair = 'Bom para cortar se quiseres que o corte dure';
  if (waxing && !nearNew) good.push('Semear e plantar o que cresce para cima', 'Começar projetos e negócios');
  if (!waxing) good.push('Semear raízes, podar e colher para guardar', 'Começar uma dieta ou desintoxicar', 'Depilação e cortar as unhas (cresce mais devagar)', 'Pintar e arrumar a casa');
  if (nearNew || nearFull) good.push('Pescar (dizem os pescadores)');
  if (nearNew) good.push('Definir intenções para o mês');
  if (nearFull) { bad.push('Discussões — as emoções estão ao rubro'); good.push('Fechar ciclos e agradecer'); }
  if (waxing && !nearNew) bad.push('Podar árvores');
  if (!waxing) bad.push('Começar algo que precisa de crescer');
  return { s, e, waxing, ph, el, type: DAY_TYPE[el], hair, good: good.slice(0, 4), bad: bad.slice(0, 2), hairGood: waxing && !nearNew && !nearFull && (el === 'fogo' || el === 'terra'), sign: s.moon.sign, ingress: s.moonIngress };
}

// ---------- Ano ----------
function yearReads(year, modern) {
  const a = `${year}-01-01`, b = `${year}-12-31`, days = daysIn(a, b).filter((_, i) => i % 2 === 0);
  const ev = eventsBetween(a, b, modern, true);
  return SIGNS.map((sg, si) => {
    const r = seeded(year + 'ano' + si), month = Array.from({ length: 12 }, () => ({ amor: 0, trabalho: 0, dinheiro: 0, energia: 0, n: 0 }));
    for (const d of days) { const sky = skyFor(d), H = housesOf(si, sky), ar = scoreDay(si, sky, H), mo = +d.slice(5, 7) - 1; for (const k in ar) month[mo][k] += ar[k]; month[mo].n++; }
    const area = { amor: 0, trabalho: 0, dinheiro: 0, energia: 0 };
    month.forEach(m => { for (const k in area) { m[k] /= m.n; area[k] += m[k] / 12; } });
    for (const k in area) area[k] = Math.round(area[k]);
    const bestM = k => month.map((m, i) => [i, m[k]]).sort((x, y) => y[1] - x[1]).slice(0, 2).map(x => MES_N[x[0]]).join(' e ');
    const sky0 = skyFor(a), sky1 = skyFor(`${year}-07-01`), H0 = housesOf(si, sky0), H1 = housesOf(si, sky1);
    const jH = H0.jupiter, jH2 = H1.jupiter, sH = H0.saturn;
    const headline = `Ano de sorte n${AREA[jH]}${jH2 !== jH ? ' e, a partir do verão, n' + AREA[jH2] : ''}.`;
    const love = ([5, 7].includes(jH) || [5, 7].includes(jH2) ? 'Júpiter abençoa o amor este ano: abre o coração. ' : [5, 7].includes(sH) ? 'Saturno pede maturidade no amor: relações sérias ganham força, as frágeis são testadas. ' : '') + `Melhores meses para o amor: ${bestM('amor')}.`;
    const work = ([10, 6].includes(sH) ? 'Saturno pede trabalho duro, mas o reconhecimento chega. ' : [10, 6].includes(jH) || [10, 6].includes(jH2) ? 'Júpiter traz oportunidades de carreira: arrisca. ' : '') + `Meses fortes no trabalho: ${bestM('trabalho')}.`;
    const money = ([2, 8, 11].includes(jH) || [2, 8, 11].includes(jH2) ? 'Ano favorável para as finanças com Júpiter. ' : [2, 8].includes(sH) ? 'Saturno pede um orçamento rigoroso. ' : '') + `Melhores meses para o dinheiro: ${bestM('dinheiro')}.`;
    const energy = (sH === 1 ? 'Saturno no teu signo: ano de maturidade — cuida do descanso. ' : jH === 1 || jH2 === 1 ? 'Júpiter no teu signo: ano de expansão e otimismo! ' : '') + `Meses de mais energia: ${bestM('energia')}.`;
    const hi = [];
    for (const e of ev) {
      const h = ((e.sign - si + 12) % 12) + 1, when = MES_N[new Date(msFromJd(e.jd)).getUTCMonth()];
      if (e.type === 'lua' && e.eclipse) hi.push(`${e.eclipse === 'solar' ? '🌑 Eclipse solar' : '🌕 Eclipse lunar'} em ${SIGN_IN[e.sign]} (${when}): ${e.eclipse === 'solar' ? 'recomeço n' : 'viragem n'}${AREA[h]}.`);
      if (e.type === 'ingresso' && ['jupiter', 'saturn'].concat(modern ? OUTER : []).includes(e.p) && !e.rx) hi.push(`${PL[e.p].g} ${PL[e.p].n} entra em ${SIGN_IN[e.sign]} (${when}): ${PL[e.p].kw} passa a focar-se n${AREA[h]}.`);
    }
    const mr = ev.filter(e => e.type === 'estacao' && e.p === 'mercury' && e.rx).map(e => MES_N[new Date(msFromJd(e.jd)).getUTCMonth()]);
    if (mr.length) hi.push(`☿ Mercúrio retrógrado em ${mr.join(', ')}: revê contratos e viagens.`);
    const ru = modern ? sg.mod : sg.ruler;
    const stars = {}; for (const k in area) stars[k] = toStars(area[k]);
    const x = extras(si, sky1, H1, r);
    const bestAll = month.map((m, i) => [i, (m.amor + m.trabalho + m.dinheiro + m.energia) / 4]).sort((p, q) => q[1] - p[1]);
    return Object.assign({ mode: 'ano', si, sign: sg, H: H1, area, stars, overall: avg(area), headline, keyword: KEYWORD[jH], love, work, money, energy, highlights: hi.slice(0, 5), advice: `Júpiter (casa ${jH}) expande ${AREA[jH]}; Saturno (casa ${sH}) consolida ${AREA[sH]}.`, bestDay: MES_N[bestAll[0][0]], bestLove: bestM('amor').split(' e ')[0], ruler: ru }, x);
  });
}

// ---------- Aniversariantes do dia ----------
function birthday(ds, modern) {
  const s = skyFor(ds), si = s.sun.sign, end = dayStr(noonJd(ds) + 365);
  const ev = eventsBetween(ds, end, modern, true), month = [];
  for (let i = 0; i < 12; i++) {
    const dd = dayStr(noonJd(ds) + i * 30.4 + 15), sky = skyFor(dd), H = housesOf(si, sky), ar = scoreDay(si, sky, H);
    month.push({ m: new Date(msFromJd(noonJd(dd))).getUTCMonth(), ...ar });
  }
  const best = k => month.slice().sort((a, b) => b[k] - a[k]).slice(0, 2).map(x => MES_N[x.m]);
  const H = housesOf(si, s), jH = H.jupiter, sH = H.saturn;
  const jIn = ev.find(e => e.type === 'ingresso' && e.p === 'jupiter' && !e.rx);
  const lines = [];
  lines.push(`🍀 Júpiter traz sorte n${AREA[jH]}` + (jIn ? `, e a partir de ${MES_N[new Date(msFromJd(jIn.jd)).getUTCMonth()]} n${AREA[((jIn.sign - si + 12) % 12) + 1]}.` : '.'));
  lines.push(`🏛️ Saturno pede esforço n${AREA[sH]}: o que construíres aí fica.`);
  const ecl = ev.filter(e => e.type === 'lua' && e.eclipse).slice(0, 2).map(e => `${MES_N[new Date(msFromJd(e.jd)).getUTCMonth()]} (n${AREA[((e.sign - si + 12) % 12) + 1]})`);
  if (ecl.length) lines.push(`🌑 Eclipses que marcam viragens: ${ecl.join(' e ')}.`);
  lines.push(`❤️ Melhores meses para o amor: ${best('amor').join(' e ')}.`);
  lines.push(`💼 Para o trabalho: ${best('trabalho').join(' e ')} · 💰 Dinheiro: ${best('dinheiro').join(' e ')}.`);
  const deg = Math.floor(s.sun.deg);
  return { si, deg, lines, best: { amor: best('amor'), trabalho: best('trabalho'), dinheiro: best('dinheiro') }, jH, sH, headline: `Um ano de sorte n${AREA[jH]}.` };
}

// ---------- Mapa pessoal ----------
const NATAL_PTS = [['sun', 'o teu Sol', 'a tua confiança'], ['moon', 'a tua Lua', 'as tuas emoções'], ['asc', 'o teu Ascendente', 'a tua imagem'], ['venus', 'a tua Vénus', 'o teu amor'], ['mars', 'o teu Marte', 'a tua energia'], ['mercury', 'o teu Mercúrio', 'a tua mente']];
function natalChart(ms, city) {
  const jd = jdFromMs(ms), n = {}; for (const p of ALLP) n[p] = lonOf(p, jd);
  n.asc = ascendant(ms, city[1], city[2]); return n;
}
function personalDay(natal, ds, modern) {
  const jd = noonJd(ds), tr = {}, list = (modern ? ALLP : CLASSIC);
  for (const p of list) tr[p] = lonOf(p, jd);
  const out = [];
  for (const t of list) for (const [np, lab, theme] of NATAL_PTS) {
    const d = Math.abs(angDiff(tr[t], natal[np]));
    for (const [A, name] of ASPECTS) {
      const orb = Math.abs(d - A), max = t === 'moon' ? 4 : t === 'sun' || t === 'mercury' || t === 'venus' || t === 'mars' ? 2 : 1.5;
      if (orb <= max) {
        const harm = name === 'tri' || name === 'sext' || (name === 'conj' && !['saturn', 'mars', 'pluto'].includes(t));
        const w = { moon: 1, sun: 2, mercury: 2, venus: 3, mars: 3, jupiter: 5, saturn: 5, uranus: 4, neptune: 4, pluto: 4 }[t] * (1 - orb / (max + 0.5)) * (np === 'sun' || np === 'asc' || np === 'moon' ? 1.3 : 1);
        out.push({ t, np, asp: name, harm, w, txt: `${PL[t].g} ${PL[t].n} ${ASP_TXT[name][0]} ${lab}: ${harm ? PL[t].kw + ' favorece ' + theme : PL[t].kw + ' testa ' + theme}.` });
      }
    }
  }
  out.sort((a, b) => b.w - a.w);
  const ascSign = Math.floor(natal.asc / 30);
  return { aspects: out.slice(0, 5), byAsc: readDay(ascSign, ds, modern), ascSign, sunSign: Math.floor(natal.sun / 30), moonSign: Math.floor(natal.moon / 30) };
}
