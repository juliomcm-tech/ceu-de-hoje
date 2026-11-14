// ===== O meu ciclo (menstrual), ligado à fertilidade e à Lua =====
const CY = {
  get() { try { return Object.assign({ starts: [], sym: {}, alerts: { period: true, fertile: false }, on: false }, JSON.parse(store.get('ceu_cycle') || '{}')); } catch (e) { return { starts: [], sym: {}, alerts: { period: true, fertile: false }, on: false }; } },
  set(o) { store.set('ceu_cycle', JSON.stringify(o)); }
};
const CY_SYM = ['🩸 Fluxo forte', '💧 Fluxo leve', '😣 Cólicas', '🤕 Dor de cabeça', '😴 Cansaço', '🎈 Inchaço', '😤 Irritação', '😢 Sensível', '😊 Bem-disposta', '⚡ Muita energia', '🍫 Desejos', '💗 Libido alta'];
// Sinais do corpo (modo quero engravidar): sig[data] = { lh: '+'|'-', mu: 'seco'|'cremoso'|'aquoso'|'clara', tp: 36.45 }
const CY_MU = [['seco', '🏜️ Seco / nada'], ['cremoso', '🧴 Cremoso'], ['aquoso', '💧 Aquoso'], ['clara', '🥚 Clara de ovo']];
function tempShift(sig, from, to) { // regra «3 acima de 6»: devolve o último dia baixo (ovulação provável)
  const T = Object.keys(sig || {}).filter(d => d >= from && (!to || d < to) && sig[d].tp > 34 && sig[d].tp < 39).sort().map(d => [d, +sig[d].tp]);
  for (let i = 6; i + 2 < T.length; i++) { const base = Math.max(...T.slice(i - 6, i).map(x => x[1])); if (T[i][1] > base && T[i + 1][1] > base && T[i + 2][1] >= base + .2) return T[i - 1][0]; }
  return null;
}
function bodyOv(sig, from, to) { // ovulação pelos sinais do corpo num ciclo [from, to)
  const tov = tempShift(sig, from, to); if (tov) return { d: tov, src: 'temp' };
  const lh = Object.keys(sig || {}).filter(d => d >= from && (!to || d < to) && sig[d].lh === '+').sort()[0];
  return lh ? { d: dayStr(noonJd(lh) + 1), src: 'lh', lh } : null;
}
function cycleStats(o) {
  o = o || CY.get(); const sig = o.sig || {};
  const S = o.starts.slice().sort((a, b) => a.d.localeCompare(b.d));
  const lens = []; for (let i = 1; i < S.length; i++) { const L = Math.round(noonJd(S[i].d) - noonJd(S[i - 1].d)); if (L >= 18 && L <= 60) lens.push(L); }
  const last6 = lens.slice(-6), avg = o.len || (last6.length ? Math.round(last6.reduce((a, b) => a + b, 0) / last6.length) : 28);
  const pl = S.filter(x => x.e).map(x => Math.round(noonJd(x.e) - noonJd(x.d)) + 1).filter(n => n >= 1 && n <= 12), per = pl.length ? Math.round(pl.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, pl.length)) : 5;
  const irregular = last6.length >= 3 && (Math.max(...last6) - Math.min(...last6) > 8);
  // fase lútea aprendida: dias entre a ovulação (pelos sinais) e o período seguinte
  const luts = []; for (let i = 0; i + 1 < S.length; i++) { const b = bodyOv(sig, S[i].d, S[i + 1].d); if (b) { const L = Math.round(noonJd(S[i + 1].d) - noonJd(b.d)); if (L >= 9 && L <= 17) luts.push(L); } }
  const lut = luts.length ? Math.round(luts.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, luts.length)) : 14;
  // precisão: quanto falhou cada previsão (só com pelo menos 1 ciclo antes)
  const acc = []; for (let i = 2; i < S.length; i++) { const pr = lens.length ? (() => { const L = []; for (let k = 1; k < i; k++) { const x = Math.round(noonJd(S[k].d) - noonJd(S[k - 1].d)); if (x >= 18 && x <= 60) L.push(x); } return L.slice(-6); })() : []; if (!pr.length) continue; const a = Math.round(pr.reduce((x, y) => x + y, 0) / pr.length); acc.push({ d: S[i].d, diff: Math.round(noonJd(S[i].d) - (noonJd(S[i - 1].d) + a)) }); }
  const last = S[S.length - 1] || null; if (!last) return { S, lens, avg, per, last: null, lut, luts, acc };
  const t = noonJd(todayStr()), l0 = noonJd(last.d); let next = l0 + avg;
  const body = bodyOv(sig, last.d, null); if (body) next = noonJd(body.d) + lut; // com a ovulação conhecida, o período vem ~fase lútea depois
  const late = Math.max(0, Math.round(t - next)); while (next < t && late > 20) next += avg;
  const ovC = body ? noonJd(body.d) : next - lut, fertC = [ovC - 5, ovC + 1], ov = t > ovC + 1 ? next + avg - lut : ovC, fert = [ov - 5, ov + 1], cur = Math.round(t - l0) + 1;
  const peak = (body && body.src === 'lh' && ov === ovC ? [noonJd(body.lh), ov] : [ov - 2, ov]).map(dayStr);
  const ongoing = !last.e && cur <= Math.max(per, 7);
  const phase = cur <= per || ongoing ? 'menstrual' : t >= fertC[0] && t <= fertC[1] ? (Math.abs(t - ovC) < .5 ? 'ovulacao' : 'fertil') : t < fertC[0] ? 'folicular' : 'lutea';
  const mu = (sig[todayStr()] || {}).mu, inPeak = t >= ovC - 2 && t <= ovC, inFert = t >= fertC[0] && t <= fertC[1];
  const conf = !!(body && body.src === 'temp' && t > ovC + 1), level = !ongoing && (inPeak || (!conf && (sig[todayStr()] || {}).lh === '+')) ? 'pico' : !ongoing && (inFert || (!conf && (mu === 'clara' || mu === 'aquoso'))) ? 'alta' : 'baixa';
  return { S, lens, avg, per, last, day: cur, next: dayStr(next), daysTo: Math.round(next - t), ov: dayStr(ov), fert: fert.map(dayStr), peak, phase, late, irregular, ongoing, lut, luts, acc, body, ovCur: dayStr(ovC), level, confirmed: conf };
}
const CY_PH = {
  menstrual: ['🩸', 'Menstruação', 'Corpo a pedir descanso: aconchego, água, calor na barriga e menos exigência contigo.', '#e0566f'],
  folicular: ['🌱', 'Fase folicular', 'A energia vai subindo: bom para começar coisas, treinar e ser criativa.', '#5fb98a'],
  fertil: ['🌸', 'Janela fértil', 'Os dias com mais probabilidade de engravidar. Muitas pessoas sentem-se mais confiantes e sociáveis.', '#e98bc4'],
  ovulacao: ['🥚', 'Ovulação (estimada)', 'O pico da janela fértil. Com os sinais do corpo registados, a estimativa fica mais certa.', '#d65fb0'],
  lutea: ['🌙', 'Fase lútea', 'A energia vai abrandando; nos últimos dias pode surgir TPM. Mais paciência e mimo para ti.', '#8a7bd6']
};
function cycleRing(st) {
  const R = 46, C = 2 * Math.PI * R, A = st.avg, seg = (from, to, col) => `<circle cx="55" cy="55" r="${R}" fill="none" stroke="${col}" stroke-width="10" stroke-dasharray="${C * (to - from + 1) / A} ${C}" stroke-dashoffset="${-C * (from - 1) / A}"/>`;
  const fo = A - st.lut - 5, ft = A - st.lut + 1, dpos = Math.min(A, st.day), ang = (dpos - .5) / A * 2 * Math.PI - Math.PI / 2;
  return `<div class="cyring"><svg viewBox="0 0 110 110" style="transform:rotate(-90deg)"><circle cx="55" cy="55" r="${R}" fill="none" stroke="var(--soft)" stroke-width="10"/>${seg(1, st.per, '#e0566f')}${seg(Math.max(1, fo), Math.min(A, ft), '#e98bc4')}</svg><i style="left:${55 + Math.cos(ang) * R}px;top:${55 + Math.sin(ang) * R}px"></i><b>${st.late ? '+' + st.late : st.day}<small>${st.late ? (st.late === 1 ? 'dia de atraso' : 'dias de atraso') : 'dia do ciclo'}</small></b></div>`;
}
const CY_LV = { pico: ['🔥', 'Dia de pico', 'Hoje é um dos dias com mais probabilidade de engravidar.'], alta: ['🌸', 'Fertilidade alta', 'Estás dentro da janela fértil.'], baixa: ['🌿', 'Fertilidade baixa (estimada)', 'Fora da janela fértil prevista.'] };
const cyNd = d => niceDate(d).replace(/^[^,]+, /, '');
function cyRange(a, b) { const [x, y] = [a, b].map(d => dParts(d)); return x[1] === y[1] ? `${x[2]} a ${y[2]} de ${MESES[y[1] - 1]}` : `${x[2]} ${MESES[x[1] - 1].slice(0, 3)} a ${y[2]} ${MESES[y[1] - 1].slice(0, 3)}`; }
function cySrc(st) {
  if (st.body && st.body.src === 'temp') return `🌡️ Ovulação confirmada pela temperatura (~${cyNd(st.body.d)})`;
  if (st.body) return `🔆 Teste positivo a ${cyNd(st.body.lh)}: o pico é nesse dia e no seguinte`;
  return `📅 Previsão pelo calendário${st.luts.length ? `, afinada com ${st.luts.length} ciclo${st.luts.length > 1 ? 's' : ''} teu${st.luts.length > 1 ? 's' : ''}` : ''}`;
}
function cyStarNight(st) { // toque astrológico: a noite mais romântica do céu dentro da janela (não muda a janela)
  const days = daysIn(st.fert[0], st.fert[1]).filter(d => d >= todayStr()); if (!days.length) return '';
  const best = days.map(d => [d, luaGuide(d).romance + luaGuide(d).fertilidade / 2]).sort((a, b) => b[1] - a[1])[0][0];
  return `💫 Noite mais bonita do céu na janela: <b>${niceDate(best)}</b>, Lua em ${SIGNS[skyFor(best).moon.sign].n}. Um toque especial; quem manda é o teu corpo.`;
}
function ttcBox(st) {
  const L = CY_LV[st.level], txt = st.level === 'baixa' && st.confirmed ? 'A temperatura indica que a ovulação deste ciclo já passou.' : L[2];
  return `<div class="ttc lv-${st.level}"><b>${L[0]} ${L[1]}</b><p>${txt}</p><p class="ttcpk">🎯 Dias de pico: <b>${cyRange(st.peak[0], st.peak[1])}</b></p><small>${cySrc(st)}</small>${(() => { const n = cyStarNight(st); return n ? `<p class="ttcstar">${n}</p>` : ''; })()}<button class="btn" id="cySig">📝 Registar os sinais de hoje</button></div>`;
}
function cycleBox() {
  const o = CY.get(); if (!o.on) return `<button class="yrow" id="cyOn">🌸 <span>O meu ciclo menstrual (opcional)</span><i>›</i></button>`;
  if (o.preg) return pregBox(o);
  const st = cycleStats(o), nd = d => niceDate(d).replace(/^[^,]+, /, '');
  if (!st.last) return `<div class="box cyc"><h3>🌸 O meu ciclo</h3><p>Marca o primeiro dia da tua última menstruação para começar.</p><div class="drow"><input type="date" id="cyFirst" max="${todayStr()}"><button class="btn main" id="cyFirstGo">Começar</button></div><p class="note">Fica só neste telemóvel. Podes proteger com o PIN nas Definições.</p></div>`;
  const P0 = CY_PH[st.phase];
  return `<div class="box cyc" style="--pc:${P0[3]}"><h3>🌸 O meu ciclo${o.ttc ? ' <small class="ttctag">👶 a tentar engravidar</small>' : ''}</h3><div class="cytop">${cycleRing(st)}<div><b class="cyph">${P0[0]} ${P0[1]}</b><p>${P0[2]}</p></div></div>
    ${st.late >= 3 ? `<p class="due soon">⏰ O período está ${st.late} dia${st.late > 1 ? 's' : ''} atrasado face à tua média. Pode ser só stress ou uma variação normal; se te preocupar, faz um teste ou fala com o teu médico.</p>` : ''}
    <div class="cyinfo"><div><span>🩸 Próximo período</span><b>${st.daysTo <= 0 ? 'a qualquer momento' : nd(st.next)}</b><small>${st.daysTo > 0 ? `daqui a ${st.daysTo} dia${st.daysTo > 1 ? 's' : ''}` : ''}</small></div><div><span>🌸 Janela fértil</span><b>${(() => { const [a, b] = st.fert.map(d => dParts(d)); return a[1] === b[1] ? `${a[2]}–${b[2]} de ${MESES[b[1] - 1]}` : `${a[2]} ${MESES[a[1] - 1].slice(0, 3)} – ${b[2]} ${MESES[b[1] - 1].slice(0, 3)}`; })()}</b><small>ovulação ~ ${nd(st.ov)}</small></div></div>
    ${o.ttc && (st.late >= 1 || st.daysTo <= 0) && !st.ongoing ? '<button class="btn main" id="cyPos" style="width:100%;margin-bottom:10px">🤰 Fiz o teste e deu positivo</button>' : ''}${o.ttc ? ttcBox(st) : ''}<div class="drow">${st.ongoing ? '<button class="btn main" id="cyEnd">✔️ Terminou hoje</button>' : '<button class="btn main" id="cyStart">🩸 Começou hoje</button>'}<button class="btn" id="cyMore">📅 Calendário e sintomas</button></div></div>`;
}
function cyCal(st, ym) {
  const [y, m] = ym.split('-').map(Number), dim = new Date(y, m, 0).getDate(), first = (new Date(y, m - 1, 1).getDay() + 6) % 7, o = CY.get(), out = [];
  const logged = new Set(); o.starts.forEach(s => { const e = s.e || dayStr(noonJd(s.d) + st.per - 1); for (let j = noonJd(s.d); j <= noonJd(e); j++) logged.add(dayStr(j)); });
  const pred = new Set(), fert = new Set(), ovs = new Set();
  if (st.last) { let n = noonJd(st.next); for (let c = 0; c < 4; c++) { for (let k = 0; k < st.per; k++) pred.add(dayStr(n + k)); const ov = n - st.lut; for (let k = -5; k <= 1; k++) fert.add(dayStr(ov + k)); ovs.add(dayStr(ov)); n += st.avg; } const ov0 = noonJd(st.ovCur); for (let k = -5; k <= 1; k++) fert.add(dayStr(ov0 + k)); ovs.add(st.ovCur); }
  for (let i = 0; i < first; i++) out.push('<span></span>');
  for (let d = 1; d <= dim; d++) { const ds = `${ym}-${String(d).padStart(2, '0')}`, sg = (o.sig || {})[ds] || {}, cls = logged.has(ds) ? 'p' : pred.has(ds) ? 'pp' : ovs.has(ds) ? 'ov' : fert.has(ds) ? 'f' : '', lua = luaGuide(ds).fertilidade >= 3 && fert.has(ds), mk = sg.lh === '+' ? '🔆' : sg.mu === 'clara' ? '🥚' : lua ? '🌙' : ''; out.push(`<span class="cd ${cls}${ds === todayStr() ? ' today' : ''}${(o.sym[ds] || []).length || sg.tp || sg.mu || sg.lh ? ' sy' : ''}" data-cd="${ds}">${d}${mk ? `<i>${mk}</i>` : ''}</span>`); }
  return `<div class="cyhead"><button class="arrow" data-cym="-1">‹</button><b>${MESES[m - 1][0].toUpperCase() + MESES[m - 1].slice(1)} ${y}</b><button class="arrow" data-cym="1">›</button></div><div class="cycal"><em>S</em><em>T</em><em>Q</em><em>Q</em><em>S</em><em>S</em><em>D</em>${out.join('')}</div><div class="cyleg"><span class="p">Período</span><span class="pp">Previsto</span><span class="f">Fértil</span><span class="ov">Ovulação</span><span>🌙 Lua favorável</span>${o.ttc ? '<span>🔆 Teste positivo</span><span>🥚 Muco clara de ovo</span>' : ''}</div>`;
}
function cyTempChart(o, st) {
  const sig = o.sig || {}, T = Object.keys(sig).filter(d => st.last && d >= st.last.d && sig[d].tp).sort().map(d => [d, +sig[d].tp]);
  if (T.length < 2) return `<p class="note">🌡️ Mede a temperatura logo ao acordar, antes de te levantares, sempre à mesma hora. Com uns dias registados aparece aqui o gráfico.</p>`;
  const W = 300, H = 90, lo = Math.min(...T.map(x => x[1])) - .1, hi = Math.max(...T.map(x => x[1])) + .1, d0 = noonJd(T[0][0]), span = Math.max(1, noonJd(T[T.length - 1][0]) - d0);
  const X = d => 10 + (noonJd(d) - d0) / span * (W - 20), Y = v => H - 10 - (v - lo) / (hi - lo) * (H - 20);
  const ovx = st.body && st.body.src === 'temp' ? `<line x1="${X(st.body.d)}" x2="${X(st.body.d)}" y1="4" y2="${H - 4}" stroke="#d65fb0" stroke-dasharray="3 3"/>` : '';
  return `<div class="wspark"><svg viewBox="0 0 ${W} ${H}">${ovx}<polyline fill="none" stroke="var(--gold)" stroke-width="2" points="${T.map(x => X(x[0]) + ',' + Y(x[1])).join(' ')}"/>${T.map(x => `<circle cx="${X(x[0])}" cy="${Y(x[1])}" r="3" fill="var(--gold)"/>`).join('')}</svg><small>🌡️ ${T[0][1].toFixed(2).replace(".", ",")}° → ${T[T.length - 1][1].toFixed(2).replace(".", ",")}° neste ciclo${ovx ? ' · a linha rosa marca a ovulação' : ''}</small></div>`;
}
function cyAccHtml(st) {
  if (!st.acc.length) return '<p class="note">🎯 A partir do 3.º período registado mostramos aqui se as previsões bateram certo.</p>';
  const a = st.acc.slice(-3).reverse(), w = x => x.diff === 0 ? 'chegou no dia previsto ✅' : Math.abs(x.diff) <= 1 ? `falhou só por 1 dia (${x.diff > 0 ? 'mais tarde' : 'mais cedo'}) ✅` : `chegou ${Math.abs(x.diff)} dias ${x.diff > 0 ? 'mais tarde' : 'mais cedo'} do que o previsto`;
  return `<div><b>🎯 As previsões bateram certo?</b>${a.map(x => `<p>${cyNd(x.d)}: ${w(x)}</p>`).join('')}</div>`;
}
function openCycle(ym, openDay) {
  const o = CY.get(), st = cycleStats(o); ym = ym || todayStr().slice(0, 7);
  $('#infoTitle').textContent = '🌸 O meu ciclo';
  $('#infoBody').innerHTML = `${cyCal(st, ym)}<p class="hint" style="text-align:left">Toca num dia para marcar o início do período ou os sintomas.</p><div id="cyDay"></div>
    <div class="box"><h3>📊 Os teus números</h3><p>Ciclo médio: <b>${st.avg} dias</b>${st.lens.length ? ` (a partir de ${Math.min(6, st.lens.length)} ciclo${st.lens.length > 1 ? 's' : ''})` : ' (valor inicial: ajusta abaixo)'} · Período: <b>${st.per} dias</b>${st.luts.length ? ` · Ovulação ${st.lut} dias antes do período (aprendido contigo)` : ''}</p>${cyAccHtml(st)}${st.irregular ? '<p class="note">Os teus ciclos variam bastante: as previsões são menos certas. Se forem muito irregulares (menos de 21 ou mais de 35 dias), vale a pena falar com o médico.</p>' : ''}<div class="drow"><label style="flex:1;margin:0">Ciclo (dias)<input type="number" id="cyLen" min="18" max="60" value="${o.len || ''}" placeholder="${st.avg} (automático)"></label><button class="btn" id="cyLenGo" style="align-self:flex-end">OK</button></div></div>
    <div class="box ttcbox"><h3>👶 Quero engravidar</h3><label class="chk"><input type="checkbox" id="cyTTC"${o.ttc ? ' checked' : ''}> Ligar o modo «quero engravidar»</label>
      ${o.ttc ? `${st.last ? ttcBox(st).replace('<button class="btn" id="cySig">📝 Registar os sinais de hoje</button>', '') : ''}${cyTempChart(o, st)}
      <details class="kpar"><summary>Como ler os 3 sinais do corpo</summary><p>🔆 <b>Teste de ovulação</b> (farmácia): quando dá positivo, a ovulação vem normalmente 1 a 2 dias depois. Esse dia e o seguinte são os melhores.</p><p>🥚 <b>Muco tipo clara de ovo</b> (transparente e elástico): aparece nos dias mais férteis, antes da ovulação.</p><p>🌡️ <b>Temperatura ao acordar</b>: sobe uns 0,2 a 0,5 °C depois da ovulação. Não avisa antes, mas confirma e ensina a app a prever melhor os próximos ciclos.</p><p>A janela fértil tem cerca de 6 dias: os 5 antes da ovulação e o próprio dia. Sem sinais registados, a app usa só o calendário, que é bem menos certo.</p></details>
      <p class="note">💗 Se estão a tentar há mais de 12 meses (ou 6 meses a partir dos 35 anos), ou se os ciclos são muito irregulares, falem com o médico de família. Não existem dias com fertilidade zero garantida.</p>` : '<p class="note">Mostra os dias de pico e deixa registar teste de ovulação, muco e temperatura para afinar as previsões.</p>'}</div>
    <div class="box"><h3>🔔 Avisos ao abrir a app</h3><label class="chk"><input type="checkbox" id="cyAP"${o.alerts.period ? ' checked' : ''}> 2 dias antes do período</label><label class="chk"><input type="checkbox" id="cyAF"${o.alerts.fertile ? ' checked' : ''}> Quando começa a janela fértil${o.ttc ? ' e os dias de pico' : ''}</label></div>
    ${st.S.length ? `<div class="box"><h3>🗓️ Últimos períodos</h3>${st.S.slice(-6).reverse().map(s => `<p>${niceDate(s.d).replace(/^[^,]+, /, '')} ${s.d.slice(0, 4)}${s.e ? ` → ${Math.round(noonJd(s.e) - noonJd(s.d)) + 1} dias` : ''} <button class="ib" data-cydel="${s.d}" title="Apagar">✕</button></p>`).join('')}</div>` : ''}
    <p class="note">🔒 Fica só neste telemóvel (e na tua cópia de segurança). As previsões são estimativas pelo calendário: <b>não servem como método contracetivo</b> nem substituem o médico. A Lua é tradição. <button class="link" id="cyOff">Desligar o ciclo</button></p>`;
  const save = fn => { const c = CY.get(); fn(c); CY.set(c); };
  $('#infoBody').querySelectorAll('[data-cym]').forEach(b => b.onclick = () => { const [y, m] = ym.split('-').map(Number), dd = new Date(y, m - 1 + +b.dataset.cym, 1); openCycle(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`); });
  $('#infoBody').querySelectorAll('[data-cd]').forEach(el => el.onclick = () => {
    const ds = el.dataset.cd, c = CY.get(), isStart = c.starts.some(s => s.d === ds), syms = c.sym[ds] || [];
    $('#cyDay').innerHTML = `<div class="box"><h3>${niceDate(ds)}</h3><div class="drow">${ds > todayStr() && !isStart ? '<p class="note">Este dia ainda não chegou: aqui vês a previsão.</p>' : `<button class="btn${isStart ? '' : ' main'}" id="cyTog">${isStart ? '✕ Não começou aqui' : '🩸 O período começou neste dia'}</button>${!isStart && ds <= todayStr() && c.starts.some(s => !s.e && s.d < ds) ? '<button class="btn" id="cyEndD">✔️ Terminou neste dia</button>' : ''}`}</div>${c.ttc && ds <= todayStr() ? (() => { const g = (c.sig || {})[ds] || {}; return `<div class="cysig"><b>🔆 Teste de ovulação</b><div class="chips" id="cyLH"><button class="qchip${g.lh === '-' ? ' on' : ''}" data-v="-">➖ Negativo</button><button class="qchip${g.lh === '+' ? ' on' : ''}" data-v="+">🔆 Positivo</button></div><b>💧 Muco</b><div class="chips" id="cyMU">${CY_MU.map(m => `<button class="qchip${g.mu === m[0] ? ' on' : ''}" data-v="${m[0]}">${m[1]}</button>`).join('')}</div><b>🌡️ Temperatura ao acordar</b><div class="drow"><input type="text" id="cyTP" inputmode="decimal" maxlength="5" placeholder="ex.: 36,45" value="${g.tp || ''}"><button class="btn" id="cyTPGo">OK</button></div></div>`; })() : ''}<b class="cysl">Sintomas</b><div class="chips cysym">${CY_SYM.map(s => `<button class="qchip${syms.includes(s) ? ' on' : ''}">${s}</button>`).join('')}</div></div>`;
    if ($('#cyTog')) $('#cyTog').onclick = () => { save(c2 => { if (isStart) c2.starts = c2.starts.filter(s => s.d !== ds); else c2.starts.push({ d: ds }); }); openCycle(ym); };
    if ($('#cyEndD')) $('#cyEndD').onclick = () => { save(c2 => { const s = c2.starts.filter(s => s.d < ds && !s.e).sort((a, b) => b.d.localeCompare(a.d))[0]; if (s) s.e = ds; }); openCycle(ym); };
    $('#cyDay').querySelectorAll('.cysym .qchip').forEach(b => b.onclick = () => { b.classList.toggle('on'); save(c2 => { c2.sym[ds] = [...$('#cyDay').querySelectorAll('.cysym .qchip.on')].map(z => z.textContent); if (!c2.sym[ds].length) delete c2.sym[ds]; }); });
    const sg = fn => save(c2 => { c2.sig = c2.sig || {}; const g = c2.sig[ds] = c2.sig[ds] || {}; fn(g); Object.keys(g).forEach(k => (g[k] === undefined || g[k] === '') && delete g[k]); if (!Object.keys(g).length) delete c2.sig[ds]; });
    const one = (id, key, after) => { if (!$(id)) return; $(id).querySelectorAll('.qchip').forEach(b => b.onclick = () => { const on = !b.classList.contains('on'); $(id).querySelectorAll('.qchip').forEach(z => z.classList.remove('on')); if (on) b.classList.add('on'); sg(g => g[key] = on ? b.dataset.v : undefined); if (after) after(on && b.dataset.v); render(); }); };
    one('#cyLH', 'lh', v => { if (v === '+') toast('🔆 Hoje e amanhã são os teus dias de pico'); });
    one('#cyMU', 'mu', v => { if (v === 'clara' || v === 'aquoso') toast('🌸 Sinal de dias férteis'); });
    if ($('#cyTPGo')) $('#cyTPGo').onclick = () => { const v = parseFloat(String($('#cyTP').value).replace(',', '.')); if ($('#cyTP').value && !(v >= 35 && v <= 38.5)) { toast('Temperatura entre 35 e 38,5 °C'); return; } sg(g => g.tp = v ? Math.round(v * 100) / 100 : undefined); toast('Guardado 🌡️'); render(); };
    $('#cyDay').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#cyLenGo').onclick = () => { const v = +$('#cyLen').value; save(c => { c.len = v >= 18 && v <= 60 ? v : 0; }); toast('Guardado'); openCycle(ym); render(); };
  $('#cyTTC').onchange = e => { save(c => c.ttc = e.target.checked); openCycle(ym); render(); };
  if (openDay) { const el = $('#infoBody').querySelector(`[data-cd="${openDay}"]`); if (el) setTimeout(() => el.click(), 50); }
  $('#cyAP').onchange = e => save(c => c.alerts.period = e.target.checked); $('#cyAF').onchange = e => save(c => c.alerts.fertile = e.target.checked);
  $('#infoBody').querySelectorAll('[data-cydel]').forEach(b => b.onclick = () => { if (confirmBox('Apagar este registo?')) { save(c => c.starts = c.starts.filter(s => s.d !== b.dataset.cydel)); openCycle(ym); render(); } });
  $('#cyOff').onclick = () => { if (!confirmBox('Desligar o ciclo? Os registos ficam guardados, só deixa de aparecer.')) return; save(c => c.on = false); $('#infoDlg').close(); render(); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
function bindCycle() {
  const save = fn => { const c = CY.get(); fn(c); CY.set(c); render(); };
  if ($('#cyOn')) $('#cyOn').onclick = () => save(c => c.on = true);
  if ($('#cyFirstGo')) $('#cyFirstGo').onclick = () => { const d = $('#cyFirst').value; if (!d) { toast('Escolhe a data'); return; } save(c => c.starts.push({ d })); };
  if ($('#cyStart')) $('#cyStart').onclick = () => { save(c => { if (!c.starts.some(s => s.d === todayStr())) c.starts.push({ d: todayStr() }); }); toast('Registado 🩸 Cuida bem de ti'); };
  if ($('#cyEnd')) $('#cyEnd').onclick = () => save(c => { const s = c.starts.slice().sort((a, b) => b.d.localeCompare(a.d))[0]; if (s) s.e = todayStr(); });
  if ($('#cyMore')) $('#cyMore').onclick = () => openCycle();
  if ($('#cySig')) $('#cySig').onclick = () => openCycle(null, todayStr());
}
function cycleAlerts() {
  const o = CY.get(); if (!o.on) return []; if (o.preg) return pregAlerts().filter(a => a.d === todayStr()).map(a => ({ ic: '🤰', t: a.t.replace(/^🤰 /, ''), s: a.b })); const st = cycleStats(o); if (!st.last) return []; const out = [];
  if (o.alerts.period && st.daysTo >= 0 && st.daysTo <= 2 && !st.ongoing) out.push({ ic: '🩸', t: st.daysTo === 0 ? 'O período pode chegar hoje' : `O período deve chegar daqui a ${st.daysTo} dia${st.daysTo > 1 ? 's' : ''}`, s: 'Leva o que precisas na mala 💗' });
  if (o.alerts.fertile && todayStr() === st.fert[0]) out.push({ ic: '🌸', t: 'Começa hoje a tua janela fértil', s: `Até ${niceDate(st.fert[1]).replace(/^[^,]+, /, '')} (estimativa)` });
  if (o.ttc && st.level === 'pico') out.push({ ic: '🔥', t: 'Hoje é dia de pico de fertilidade', s: `Dias de pico: ${cyRange(st.peak[0], st.peak[1])}` });
  if (o.ttc && st.level !== 'menstrual' && !st.ongoing && !(o.sig || {})[todayStr()] && st.day >= st.per && todayStr() <= st.fert[1] && todayStr() >= dayStr(noonJd(st.fert[0]) - 3)) out.push({ ic: '📝', t: 'Regista os sinais de hoje', s: 'Teste, muco ou temperatura afinam os teus dias de pico.' });
  return out;
}

// ---------- Avisos com a app fechada (o service worker lê esta lista) ----------
function alertEvents() {
  const ev = [], add = (d, t, b, tag, url) => ev.push({ d, t, b: b || '', tag, url: url || './' }), today = todayStr(), lim = dayStr(noonJd(today) + 70);
  try { pregAlerts().forEach(a => add(a.d, a.t, a.b, a.tag, a.url)); } catch (e) { }
  try { tarotAlerts().forEach(a => ev.push(a)); } catch (e) { }
  try { cdAlerts().forEach(a => ev.push(a)); } catch (e) { }
  try { soulAlerts().forEach(a => ev.push(a)); } catch (e) { }
  try { [...giftAlerts(), ...nightAlerts(), ...wrapAlerts(), ...weekAlerts(), ...routineAlerts()].forEach(a => ev.push(a)); } catch (e) { }
  try { const o = CY.get(); if (o.on && !o.preg) { const st = cycleStats(o); if (st.last) { if (o.alerts.period) { add(dayStr(noonJd(st.next) - 2), '🩸 O período deve chegar daqui a 2 dias', 'Leva o que precisas na mala 💗', 'cy-p2-' + st.next, './?ciclo'); add(st.next, '🩸 O período pode chegar hoje', 'Cuida bem de ti hoje 💗', 'cy-p0-' + st.next, './?ciclo'); } if (o.alerts.fertile) add(st.fert[0], '🌸 Começa hoje a tua janela fértil', `Até ${niceDate(st.fert[1]).replace(/^[^,]+, /, '')} (estimativa)`, 'cy-f-' + st.fert[0], './?ciclo'); if (o.ttc && o.alerts.fertile) add(st.peak[0], '🔥 Começam hoje os teus dias de pico', `${cyRange(st.peak[0], st.peak[1])}. Regista os sinais na app para afinar.`, 'cy-pk-' + st.peak[0], './?ciclo'); } } } catch (e) { }
  try { P.list('ceu_pets').forEach(a => ['vac', 'des'].forEach(k => { const n = careNext(a, k); if (!n) return; const lbl = `${CARE_T[k][1]} ${spOf(a)[0] === 'gata' ? 'da' : 'do'} ${a.name}`; add(dayStr(noonJd(n) - 1), `${CARE_T[k][0]} Amanhã: ${lbl}`, 'Já marcaste o veterinário?', `pet-${a.name}-${k}-${n}-1`, './?patudos'); add(n, `${CARE_T[k][0]} Hoje: ${lbl}`, 'Depois de tratar, carrega em ✅ Feito na app.', `pet-${a.name}-${k}-${n}-0`, './?patudos'); }));
    P.list('ceu_pets').filter(a => a.adopt).forEach(a => { for (const y of [+today.slice(0, 4), +today.slice(0, 4) + 1]) { const d = y + a.adopt.slice(4); if (d > a.adopt) add(d, `🏡 Faz ${y - +a.adopt.slice(0, 4)} ano${y - +a.adopt.slice(0, 4) > 1 ? 's' : ''} que ${a.name} chegou a casa!`, 'Toca para criar o cartaz do dia de adoção 🐾', `adopt-${a.name}-${y}`, './?patudos'); } }); } catch (e) { }
  try { skyAgenda(70).forEach(x => { if (x.rxStart) { add(dayStr(noonJd(x.d) - 1), '☿ Amanhã Mercúrio fica retrógrado', 'Revê mensagens e contratos com calma nas próximas semanas.', 'sky-rx-' + x.d); } if (/Eclipse/.test(x.t)) add(x.d, `${x.ic} Hoje há ${x.t.toLowerCase()}`, 'Dia de viragem: bom para refletir e recomeçar.', 'sky-ecl-' + x.d); }); } catch (e) { }
  const [y, m] = today.split('-').map(Number), nm = new Date(y, m, 1), nd = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, '0')}-01`;
  add(nd, `📊 O teu ${MESES[m - 1]} está pronto`, 'Livros, séries, momentos e humor do mês, num só resumo.', 'month-' + nd, './?resumo');
  if (m >= 11) add(`${y}-12-01`, `📖 O teu livro de ${y} já pode ser escrito`, '10 perguntas e a app junta o teu ano todo.', 'ybook-' + y, './?livro');
  return ev.filter(e => e.d >= today && e.d <= lim);
}

// ---------- O meu mês (resumo) ----------
function monthData(ym) {
  const inM = d => (d || '').startsWith(ym), books = intList('livros'), read = books.filter(x => x.status === 2 && inM(x.ed)), readDays = new Set(books.flatMap(x => x.log || []).filter(inM));
  const shows = intList('series'), seen = shows.filter(x => x.status === 2 && inM(x.ed)), eps = shows.reduce((a, x) => a + (x.eplog || []).filter(inM).length, 0);
  const trips = intList('viagens').filter(x => x.status >= 1 && inM(x.sd)), dreams = intList('viagens').filter(x => x.realized && inM(x.realized.d));
  const notes = DIA.all().filter(x => inM(x.d)), avgM = notes.length ? notes.reduce((a, x) => a + x.mood, 0) / notes.length : 0, tags = {}; notes.forEach(x => (x.tags || []).forEach(t => tags[t] = (tags[t] || 0) + 1)); const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  const moms = MOM.all().filter(x => inM(x.d)).sort((a, b) => a.d.localeCompare(b.d)); let cards = []; try { cards = [...new Set(JSON.parse(store.get('ceu_bdlog') || '[]').filter(b => inM(b.d)).map(b => b.n))]; } catch (e) { }
  const care = P.list('ceu_pets').reduce((a, p) => a + petCare(p).filter(c => inM(c.d)).length, 0), quotes = books.reduce((a, x) => a + (x.quotes || []).filter(q => inM(q.d)).length, 0);
  const [y, m] = ym.split('-').map(Number), lunations = eventsBetween(`${ym}-01`, dayStr(noonJd(`${ym}-01`) + new Date(y, m, 0).getDate() - 1), false, true).filter(e => e.type === 'lua' && (e.kind === 'cheia' || e.kind === 'nova'));
  return { ym, y, m, read, pages: read.reduce((a, x) => a + (+x.pages || 0), 0), readDays: readDays.size, seen, eps, trips, dreams, notes, avgM, topTag, moms, cards, care, quotes, lunations };
}
function monthHtml(D) {
  const mm = D.avgM ? MOARK(D.avgM) : null, nm = MESES[D.m - 1], items = [];
  if (D.read.length || D.readDays) items.push(`📚 <b>${D.read.length}</b> livro${D.read.length === 1 ? '' : 's'} lido${D.read.length === 1 ? '' : 's'}${D.pages ? ` · ${D.pages.toLocaleString('pt-PT')} páginas` : ''}${D.readDays ? ` · ${D.readDays} dias a ler` : ''}`);
  if (D.quotes) items.push(`✍️ <b>${D.quotes}</b> citação${D.quotes > 1 ? 'ões' : ''} guardada${D.quotes > 1 ? 's' : ''}`);
  if (D.seen.length || D.eps) items.push(`📺 <b>${D.seen.length}</b> série${D.seen.length === 1 ? '' : 's'} ou filme${D.seen.length === 1 ? '' : 's'} vistos${D.eps ? ` · ${D.eps} episódios` : ''}`);
  if (D.trips.length) items.push(`✈️ <b>${D.trips.length}</b> viage${D.trips.length > 1 ? 'ns' : 'm'}: ${D.trips.map(x => esc(x.title)).join(', ')}`);
  if (D.dreams.length) items.push(`✨ Sonho realizado: <b>${D.dreams.map(x => esc(x.title)).join(', ')}</b>`);
  if (D.moms.length) items.push(`📸 <b>${D.moms.length}</b> momento${D.moms.length > 1 ? 's' : ''}: ${D.moms.slice(0, 3).map(x => esc(x.title)).join(', ')}${D.moms.length > 3 ? '…' : ''}`);
  if (D.cards.length) items.push(`🎂 Deste os parabéns a <b>${D.cards.slice(0, 4).map(esc).join(', ')}</b>${D.cards.length > 4 ? ' e mais' : ''}`);
  if (D.care) items.push(`🐾 <b>${D.care}</b> registo${D.care > 1 ? 's' : ''} na caderneta dos patudos`);
  if (D.notes.length) items.push(`📔 <b>${D.notes.length}</b> nota${D.notes.length > 1 ? 's' : ''} no diário · humor ${mm[1]} ${mm[2].toLowerCase()}${D.topTag ? ` · falaste muito de ${D.topTag[0].toLowerCase()}` : ''}`);
  const sky = D.lunations.map(e => `${e.kind === 'cheia' ? '🌕 Lua Cheia' : '🌑 Lua Nova'} a ${+dayStr(e.jd).slice(8)}${e.eclipse ? ' (eclipse!)' : ''}`).join(' · ');
  return `<div class="mhead"><button class="arrow" data-mm="-1">‹</button><b>${nm[0].toUpperCase() + nm.slice(1)} ${D.y}</b><button class="arrow" data-mm="1">›</button></div>${items.length ? `<div class="box mlist">${items.map(i => `<p>${i}</p>`).join('')}</div>` : `<div class="box"><p>Ainda não há nada registado em ${nm}. Livros, séries, momentos e diário aparecem aqui sozinhos.</p></div>`}${sky ? `<div class="box"><h3>🌙 O céu do mês</h3><p>${sky}</p></div>` : ''}${items.length ? '<button class="btn main" id="mShare" style="width:100%">📤 Partilhar o meu mês</button>' : ''}`;
}
const MOARK = avg => MOODS.reduce((b, m) => Math.abs(m[0] - avg) < Math.abs(b[0] - avg) ? m : b, MOODS[0]);
async function drawMonth(D) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(), nm = MESES[D.m - 1], me = P.get() || {}; bg(ctx, W, H, 'mon' + D.ym, ['#ff8fb1', '#3a1d6a']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.fillText('O MEU MÊS', W / 2, 110); ctx.fillStyle = '#fff'; ctx.font = '700 110px Cinzel'; ctx.fillText(nm.toUpperCase(), W / 2, 240); ctx.font = 'italic 600 44px "Cormorant Garamond"'; ctx.fillStyle = '#e9e2ff'; ctx.fillText(`${D.y}${me.name ? ' · ' + me.name.split(' ')[0] : ''}`, W / 2, 300);
  const tiles = [[D.read.length, 'livros', '📚'], [D.seen.length + (D.eps ? 0 : 0), 'séries e filmes', '📺'], [D.moms.length, 'momentos', '📸'], [D.trips.length, 'viagens', '✈️'], [D.notes.length, 'notas', '📔'], [D.cards.length, 'parabéns', '🎂']].filter(t => t[0]);
  const show = tiles.length ? tiles.slice(0, 6) : [[0, 'por escrever', '✨']], cols = show.length <= 2 ? show.length : 3, tw = 290, th = 220, gx = 30, rows = Math.ceil(show.length / cols), x0 = W / 2 - (cols * tw + (cols - 1) * gx) / 2;
  show.forEach(([v, l, e], i) => { const x = x0 + (i % cols) * (tw + gx), y = 380 + Math.floor(i / cols) * (th + 30); ctx.fillStyle = '#ffffff14'; rr(ctx, x, y, tw, th, 26); ctx.fill(); ctx.font = `60px ${EMOJI_F}`; ctx.fillText(e, x + tw / 2, y + 80); ctx.fillStyle = '#f2c76e'; ctx.font = '700 70px Cinzel'; ctx.fillText(String(v), x + tw / 2, y + 160); ctx.fillStyle = '#e8e2ff'; ctx.font = '600 26px Manrope'; ctx.fillText(l, x + tw / 2, y + 200); });
  let y = 380 + rows * (th + 30) + 40; ctx.fillStyle = '#fff'; ctx.font = 'italic 600 42px "Cormorant Garamond"';
  const lines = []; if (D.dreams.length) lines.push(`✨ Sonho realizado: ${D.dreams.map(x => x.title).join(', ')}`); if (D.read[0]) lines.push(`📖 ${D.read.map(x => '«' + x.title + '»').slice(0, 2).join(' e ')}`); if (D.moms[0]) lines.push(`💛 ${D.moms[0].title}`); if (D.notes.length) { const mm = MOARK(D.avgM); lines.push(`${mm[1]} Um mês ${mm[2].toLowerCase()}`); }
  lines.slice(0, 4).forEach(l => { y = wrap(ctx, l, W / 2, y, W - 180, 54, 2, 'center') + 14; });
  ctx.textAlign = 'center'; brandFoot(ctx, W, H); return c;
}
function openMonth(ym) {
  const t = todayStr(); if (!ym) { const d = +t.slice(8); ym = d <= 5 ? (() => { const [y, m] = t.split('-').map(Number), p = new Date(y, m - 2, 1); return `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`; })() : t.slice(0, 7); }
  const D = monthData(ym); $('#infoTitle').textContent = '📊 O meu mês'; $('#infoBody').innerHTML = monthHtml(D);
  $('#infoBody').querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { const [y, m] = ym.split('-').map(Number), d = new Date(y, m - 1 + +b.dataset.mm, 1); const n = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; if (n > t.slice(0, 7)) return; openMonth(n); });
  if ($('#mShare')) $('#mShare').onclick = async () => { toast('A preparar…'); await shareCanvases([{ name: 'o-meu-mes-' + ym, c: await drawMonth(D) }], `📊 O meu ${MESES[D.m - 1]} ✨\n\nFeito com Céu de Hoje ${APP_URL}`); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
