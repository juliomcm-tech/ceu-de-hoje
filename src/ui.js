// ===== App de telemóvel =====
const APP_VERSION = '14.11.2026 14:00';
const TABS = { top: ['dia', 'semana', 'mes', 'ano'], pares: ['dia'], lua: ['dia', 'mes'], anos: ['dia'], horas: ['dia'], eu: ['dia'] };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const G = g => `${g}&#xFE0E;`;
const starsH = n => `<span class="stars">${'★'.repeat(n)}<i>${'☆'.repeat(5 - n)}</i></span>`;
const elc = sg => EL_COL[sg.el][0];
let SHEET = 0;

// ---------- Vistas ----------
function vTop() {
  computeTop();
  const alert = dayAlert();
  let h = ST.pets ? `<div class="alert">🐾 O dia dos animais de estimação, pelo signo de cada um. Sabes quando nasceu o teu? Junta-o em ✨ Eu.</div><p class="hint">Toca no signo do teu animal para abrir o cartão</p>` : `<div class="alert">📣 ${esc(alert)}</div><p class="hint">Toca no teu signo para abrir o cartão completo</p>`;
  ST.rank.forEach((rd, i) => {
    const v = verdict(rd), c = elc(rd.sign);
    const ex = rd.mode === 'dia' ? `Sorte <b>${rd.lucky}</b> · <span class="dot" style="background:${PL[rd.fav].hex}"></span>${PL[rd.fav].cor} · ${G(PL[rd.fav].g)} ${PL[rd.fav].n} · Aliado ${G(SIGNS[rd.ally].g)} ${SIGNS[rd.ally].n}`
      : `${rd.mode === 'ano' ? 'Melhor mês' : 'Melhor dia'} <b>${rd.bestDay}</b> · Amor <b>${rd.bestLove}</b> · <span class="dot" style="background:${PL[rd.fav].hex}"></span>${PL[rd.fav].cor}`;
    h += `<article class="sc${i < 3 ? ' r' + (i + 1) : ''}" data-i="${i}" style="--c:${c}">
      <div class="sc-h"><span class="rk">${i + 1}</span><span class="gl">${G(rd.sign.g)}</span><div class="nm"><b>${rd.sign.n}</b><small>${rd.sign.r} · ${rd.keyword}</small></div>${starsH(toStars(rd.overall))}</div>
      <div class="vd ${v.k}"><b>${v.icon}</b> ${esc(v.txt)}</div>
      <p class="ph">“${esc(rd.headline)}”</p>
      <div class="ar4">${AREAS4(rd).map(([l, k, t]) => `<div><span>${l}</span>${starsH(rd.stars[k])}<p>${esc(firstSentence(t))}</p></div>`).join('')}</div>
      <div class="ex">${ex}</div><span class="more">Abrir ›</span></article>`;
  });
  return migBox() + todayStrip() + (ST.date === todayStr() ? bdayBanner() : '') + h;
}
function vPares() {
  const PR = pairsDay(ST.date, ST.modern);
  const me = P.get(), mySi = me && me.d ? sunSignOf(me.d) : 0, sOpt = sel => SIGNS.map((s, i) => `<option value="${i}"${i === sel ? ' selected' : ''}>${s.n}</option>`).join('');
  const pa = ST.pkA ?? mySi, pb = ST.pkB ?? 4, sb = (side, i) => `<button class="spk" data-side="${side}" style="--c:${elc(SIGNS[i])}"><span>${G(SIGNS[i].g)}</span><b>${SIGNS[i].n}</b><i>▾</i></button>`;
  let h = soulBoxHtml() + `<div class="pickbox"><div class="pick2">${sb('A', pa)}<em>💞</em>${sb('B', pb)}</div><div class="pick2 names"><input type="text" id="nmA" maxlength="40" placeholder="Nome (opcional)" value="${esc(ST.nmA ?? (me && me.name ? me.name.split(' ')[0] : ''))}"><em>🔤</em><input type="text" id="nmB" maxlength="40" placeholder="Nome (opcional)" value="${esc(ST.nmB || '')}"></div><button class="btn main" id="pkGo">💞 Ver compatibilidade</button><p class="note">Escolhe os signos e, se quiseres, escreve os nomes: vês a ligação pelos dois.</p></div><h2 class="vt">💞 Quem combina hoje</h2>`;
  PR.top.forEach((p, i) => h += `<div class="pair r${i + 1}" data-a="${p.a}" data-b="${p.b}"><div class="pg"><span style="color:${elc(SIGNS[p.a])}">${G(SIGNS[p.a].g)}</span><b>${p.score}%</b><span style="color:${elc(SIGNS[p.b])}">${G(SIGNS[p.b].g)}</span></div><div class="pn">${SIGNS[p.a].n} + ${SIGNS[p.b].n}</div><small>${cap1(PAIR_TXT[p.k])}</small><span class="open">Ver tudo ›</span></div>`);
  h += `<div class="warn">Paciência hoje: ${G(SIGNS[PR.worst.a].g)} ${SIGNS[PR.worst.a].n} + ${G(SIGNS[PR.worst.b].g)} ${SIGNS[PR.worst.b].n} (${PR.worst.score}%)</div>`;
  h += `<h2 class="vt">O par ideal de cada signo</h2><div class="list">`;
  PR.best.forEach((p, i) => { const o = p.a === i ? p.b : p.a; h += `<div class="li" data-a="${i}" data-b="${o}"><span class="g" style="color:${elc(SIGNS[i])}">${G(SIGNS[i].g)}</span><b>${SIGNS[i].n}</b><span class="hrt">♥</span><span class="g" style="color:${elc(SIGNS[o])}">${G(SIGNS[o].g)}</span><span>${SIGNS[o].n}</span><em>${p.score}%</em></div>`; });
  return h + '</div>';
}
function moonImg(e, px) { const c = document.createElement('canvas'); c.width = c.height = px * 2; drawMoon(c.getContext('2d'), px, px, px - 3, e); return c.toDataURL(); }
function vLua() {
  if (ST.mode === 'mes') {
    const [y0, m0] = dParts(ST.date), [a, b] = periodRange(ST.date, 'mes'), days = daysIn(a, b), first = (new Date(Date.UTC(y0, m0 - 1, 1)).getUTCDay() + 6) % 7;
    const evs = periodEvents(a, b, false).filter(e => e.type === 'lua');
    const cat = ST.luaCat || 'cabelo', G2 = days.map(d => luaGuide(d)[cat]);
    let h = `<h2 class="vt">🌙 Calendário lunar · ${cap1(MESES[m0 - 1])}</h2><div class="chips">${LUA_CATS.map(([k, ic, nm]) => `<button class="qchip${k === cat ? ' on' : ''}" data-cat="${k}">${ic} ${nm.replace(' (tradição)', '')}</button>`).join('')}</div>
      <div class="box"><p><b>${LUA_CATS.find(c => c[0] === cat)[1]} Melhores dias:</b> ${days.filter((d, i) => G2[i] >= 3).map(d => +d.slice(8)).join(', ') || '—'}<br><span style="color:var(--mute)">Bons: ${days.filter((d, i) => G2[i] === 2).map(d => +d.slice(8)).join(', ') || '—'}</span></p><p class="hint" style="text-align:left;margin:4px 0 0">${LUA_WHY[cat]}</p></div><div class="cal">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => `<span class="wd">${d}</span>`).join('')}`;
    for (let i = 0; i < first; i++) h += '<span></span>';
    days.forEach(d => { const D = lunarDay(d), ev = evs.find(e => dayStr(e.jd) === d && (e.kind === 'nova' || e.kind === 'cheia')); const gv = luaGuide(d)[cat]; h += `<span class="cd${d === todayStr() ? ' today' : ''}${gv >= 3 ? ' top' : gv === 2 ? ' ok' : gv === 0 ? ' no' : ''}" style="--c:${EL_COL[D.el][0]}"><b>${+d.slice(8)}</b><img src="${moonImg(D.e, 14)}" alt="">${D.hairGood ? '<i>✂</i>' : ''}${ev ? `<em>${ev.eclipse ? 'eclipse' : ev.kind}</em>` : ''}</span>`; });
    h += `</div><div class="leg"><span style="--c:${EL_COL.fogo[0]}">Fruto</span><span style="--c:${EL_COL.terra[0]}">Raiz</span><span style="--c:${EL_COL.ar[0]}">Flor</span><span style="--c:${EL_COL.agua[0]}">Folha</span><span>✂ cabelo forte</span></div>`;
    h += '<div class="box"><h3>Fases do mês</h3>' + evs.map(e => `<p>${{ nova: '🌑 Lua Nova', crescente: '🌓 Quarto Crescente', cheia: '🌕 Lua Cheia', minguante: '🌗 Quarto Minguante' }[e.kind]}${e.eclipse ? ' · eclipse ' + e.eclipse : ''} — dia ${new Date(msFromJd(e.jd)).getUTCDate()}, em ${SIGN_IN[e.sign]}</p>`).join('') + '</div>';
    return h;
  }
  const D = lunarDay(ST.date), c = EL_COL[D.el][0];
  const nx = periodEvents(ST.date, dayStr(noonJd(ST.date) + 30), false).filter(e => e.type === 'lua' && e.jd > noonJd(ST.date)).slice(0, 3);
  return `<div class="moonhero"><img src="${moonImg(D.e, 70)}" alt=""><h2>Lua em ${SIGN_IN[D.sign]}</h2><p>${D.ph} · ${Math.round(D.s.phase.illum * 100)}% iluminada${D.ingress ? `<br>entra em ${SIGN_IN[D.ingress.to]} às ${fmtHM(+D.ingress.time, city()[3])}` : ''}</p><span class="chip" style="--c:${c}">${D.type[0]}</span><small>Semear: ${D.type[1]}</small></div>
    <div class="box"><h3>📋 Guia de hoje</h3><div class="lg">${LUA_CATS.map(([k, ic, nm]) => { const v = luaGuide(ST.date)[k]; return `<button class="lgi" data-cat="${k}" style="--c:${LUA_COL[v]}"><span>${ic}</span><b>${nm}</b><em>${LUA_LBL[v]}</em></button>`; }).join('')}</div><p class="hint" style="text-align:left">Toca numa categoria para veres os melhores dias do mês.</p></div>
    ${fertBox()}
    ${skyAgendaBox()}
    <div class="box"><h3>✂ Cabelo</h3><p>${D.hair}</p></div>
    <div class="box ok"><h3>Bom para</h3>${D.good.map(g => `<p>✓ ${g}</p>`).join('')}</div>
    ${D.bad.length ? `<div class="box no"><h3>Evitar</h3>${D.bad.map(g => `<p>✕ ${g}</p>`).join('')}</div>` : ''}
    <div class="box"><h3>Próximas fases</h3>${nx.map(e => `<p>${{ nova: '🌑 Lua Nova', crescente: '🌓 Quarto Crescente', cheia: '🌕 Lua Cheia', minguante: '🌗 Quarto Minguante' }[e.kind]}${e.eclipse ? ' (eclipse)' : ''} · ${new Date(msFromJd(e.jd)).getUTCDate()} ${MESES[new Date(msFromJd(e.jd)).getUTCMonth()].slice(0, 3)} · ${SIGN_IN[e.sign]}</p>`).join('')}</div>`;
}
function vHoras() {
  const ci = city(), PH = planetaryHours(ST.date, ci); if (!PH) return '<p class="hint">Sem nascer do sol nesta data e cidade.</p>';
  const now = Date.now(), cur = PH.hours.find(h => now >= h.start && now < h.end);
  let h = `<h2 class="vt">⏳ Horas planetárias</h2><p class="sub2">${ci[0]} · ☀️ ${fmtHM(PH.rise, ci[3])} · 🌇 ${fmtHM(PH.set, ci[3])} · dia de ${PL[PH.ruler].n} ${G(PL[PH.ruler].g)}</p>`;
  if (cur) h += `<div class="now" style="--c:${PL[cur.p].hex}"><span>${G(PL[cur.p].g)}</span><div><small>AGORA, ATÉ ÀS ${fmtHM(cur.end, ci[3])}</small><b>Hora de ${PL[cur.p].n}</b><p>boa para ${HOUR_USE[cur.p]}</p></div></div>`;
  for (const p of ['venus', 'jupiter', 'mercury', 'sun', 'mars', 'moon', 'saturn']) {
    const hs = PH.hours.filter(x => x.p === p);
    h += `<div class="hr" style="--c:${PL[p].hex}"><span class="g">${G(PL[p].g)}</span><div><b>${PL[p].n}</b><small>${HOUR_USE[p]}</small></div><p>${hs.map(x => `<span${cur && x === cur ? ' class="on"' : ''}>${fmtHM(x.start, ci[3])}</span>`).join('')}</p></div>`;
  }
  return h;
}
function vAgenda() {
  const today = todayStr(), ym = ST.agMonth || today.slice(0, 7), [yy, mm] = ym.split('-').map(Number), all = agendaAll();
  const days = new Date(Date.UTC(yy, mm, 0)).getUTCDate(), first = (new Date(Date.UTC(yy, mm - 1, 1)).getUTCDay() + 6) % 7;
  const inMonth = all.filter(x => +x.d.slice(5, 7) === mm).sort((a, b) => +a.d.slice(8) - +b.d.slice(8));
  const ico = x => x.kind === 'a' ? spOf(P.list('ceu_pets')[x.k] || {}).at(1) : x.kind === 'me' ? '✨' : relIcon(x);
  let h = `<div class="agnav"><button class="arrow" id="agPrev">‹</button><b>${cap1(MESES[mm - 1])} ${yy}</b><button class="arrow" id="agNext">›</button></div><div class="cal ag">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => `<span class="wd">${d}</span>`).join('')}`;
  for (let i = 0; i < first; i++) h += '<span></span>';
  for (let d = 1; d <= days; d++) { const ds = `${ym}-${String(d).padStart(2, '0')}`, xs = inMonth.filter(x => +x.d.slice(8) === d); h += `<span class="ac${ds === today ? ' today' : ''}${xs.length ? ' has' : ''}" data-d="${d}"><b>${d}</b>${xs.slice(0, 3).map(x => `<i>${esc(ico(x))}</i>`).join('')}</span>`; }
  h += `</div><h2 class="vt">🎂 Em ${MESES[mm - 1]}</h2>`;
  h += inMonth.length ? `<div class="aglist">${inMonth.map(x => { const age = ageOn(x.d, `${yy}-${x.d.slice(5)}`), si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), dd = daysToBirthday(x.d); return `<div class="agi" data-kind="${x.kind}" data-k="${x.k ?? ''}" id="ag-${+x.d.slice(8)}"><span class="day">${+x.d.slice(8)}</span><div class="who"><b>${esc(x.name)}</b><small>${esc(relLabel(x))} · ${age > 0 ? 'faz ' + age : 'nasceu'} · ${G(SIGNS[si].g)} ${SIGNS[si].n}${dd === 0 ? ' · <em>HOJE</em>' : ''}</small></div><a class="ib" href="${waLink(x)}" target="_blank" rel="noopener" title="WhatsApp">💬</a><button class="ib mk" title="Cartaz">🎉</button></div>`; }).join('')}</div>` : '<p class="hint">Ninguém faz anos neste mês.</p>';
  const next = all.map(x => ({ ...x, dd: daysToBirthday(x.d) })).sort((a, b) => a.dd - b.dd).slice(0, 5);
  if (next.length) h += `<h2 class="vt">⏭️ Próximos</h2><div class="list">${next.map(x => `<div class="li bd agx" data-kind="${x.kind}" data-k="${x.k ?? ''}"><span class="g">${esc(ico(x))}</span><b>${esc(x.name)}</b><span></span><span></span><span>${esc(relLabel(x))}</span><em>${x.dd === 0 ? 'HOJE 🎂' : x.dd === 1 ? 'amanhã' : 'em ' + x.dd + ' dias'}</em></div>`).join('')}</div>`;
  const ppl = P.list('ceu_bdays').map((x, k) => ({ ...x, k })).sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  if (ppl.length) h += `<details class="box allp"><summary>👥 Todas as pessoas (${ppl.length}) · toca para abrir</summary><div class="list">${ppl.map(x => `<div class="li bd agx" data-kind="p" data-k="${x.k}"><span class="g">${esc(relIcon(x))}</span><b>${esc(x.name)}</b><span></span><span></span><span>${esc(relLabel(x))}</span><em>›</em></div>`).join('')}</div></details>`;
  const st = alertState(), ps = store.get('ceu_psync') === '1';
  h += `<div class="tools" style="margin-top:14px"><button class="btn main" id="agAdd">＋ Adicionar aniversário</button></div><div class="agtools"><button class="btn" id="agVcf">📇 Importar dos contactos</button><button class="btn" id="agWeek">📅 A minha semana</button></div>
    <div class="box alerts"><h3>🔔 Alertas</h3>
    <div class="arow"><span>${'✅'}</span><div><b>Janela ao abrir a app</b><small>No dia (e na véspera) aparece logo à frente.</small></div></div>
    <div class="arow"><span>${st === 'granted' ? '✅' : '⚪'}</span><div><b>Notificação no telemóvel</b><small>${st === 'granted' ? (ps ? 'Ligada: avisa mesmo com a app fechada (Android, app instalada).' : 'Ligada quando abres a app. Instala a app no Chrome para avisar também com ela fechada.') : st === 'denied' ? 'Bloqueada nas definições do Chrome.' : st === 'none' ? 'Não disponível neste telemóvel: usa o calendário.' : 'Desligada.'}</small></div>${st === 'default' ? '<button class="btn main" id="agNotif">Ligar</button>' : ''}</div>
    <div class="arow"><span>📲</span><div><b>Calendário do telemóvel</b><small>O mais seguro, também no iPhone: avisa todos os anos às 9h do dia e na véspera.</small></div><button class="btn" id="agIcs">Pôr</button></div></div>`;
  return h;
}
function openPerson(k, preset) {
  const l = P.list('ceu_bdays'), x = k === null ? { name: '', rel: 'amigo', d: '', t: '', tel: '', relTxt: '', ...(preset || {}) } : l[k];
  const groups = REL_GROUPS.filter(g => g[0] !== 'Animais').map(g => `<optgroup label="${g[0]}">${g[1].map(r => `<option value="${r}"${x.rel === r && !x.relTxt ? ' selected' : ''}>${(RELS.find(z => z[0] === r) || [])[2]}</option>`).join('')}</optgroup>`).join('');
  $('#perBody').innerHTML = `<div class="form"><label>Nome<input type="text" id="xName" maxlength="24" value="${esc(x.name)}" placeholder="Ex.: João"></label>
    <label>Ligação<select id="xRel">${groups}<option value="outro"${x.relTxt ? ' selected' : ''}>Outra…</option></select></label>
    <label id="xRelTxtL"${x.relTxt ? '' : ' hidden'}>Escreve a ligação<input type="text" id="xRelTxt" maxlength="24" value="${esc(x.relTxt || '')}" placeholder="Ex.: Vizinha, Professor, Treinador"></label>
    <label>Data de nascimento${x.md ? ` <small>(faz anos a ${+x.md.slice(3)} de ${MESES[+x.md.slice(0, 2) - 1]}: falta só o ano)</small>` : ''}<input type="date" id="xDate" max="${todayStr()}" value="${x.d}"></label><label>Hora (opcional)<input type="time" id="xTime" value="${x.t || ''}"></label>
    <label>Telemóvel (opcional, para o WhatsApp)<input type="tel" id="xTel" inputmode="tel" value="${esc(x.tel || '')}" placeholder="9xx xxx xxx"></label></div>`;
  $('#perTitle').textContent = k === null ? 'Novo aniversário' : 'Editar ' + x.name; $('#perDel').hidden = k === null; $('#perSave').hidden = false;
  $('#xRel').onchange = () => $('#xRelTxtL').hidden = $('#xRel').value !== 'outro';
  if (k !== null) { $('#perBody').insertAdjacentHTML('beforeend', '<button class="btn" id="xCard" style="width:100%;margin-top:8px">🪪 Enviar o cartão (a pessoa guarda na app dela)</button>'); $('#xCard').onclick = () => sharePerson(l[k]); }
  $('#perSave').onclick = () => { const n = $('#xName').value.trim(), d = $('#xDate').value; if (!n || !d) { toast('Nome e data'); return; } const rel = $('#xRel').value, o = { name: n, rel: rel === 'outro' ? 'amigo' : rel, relTxt: rel === 'outro' ? $('#xRelTxt').value.trim() || 'Outro' : '', d, t: $('#xTime').value, tel: $('#xTel').value.trim() }; const L = P.list('ceu_bdays'); if (k === null) L.push(o); else L[k] = { ...L[k], ...o }; P.setList('ceu_bdays', L); $('#perDlg').close(); ST.agMonth = d.slice(0, 4) <= todayStr().slice(0, 4) ? todayStr().slice(0, 5) + d.slice(5, 7) : ST.agMonth; toast('Guardado 🎂'); render(); if (k !== null) openPersonSheet(k); };
  $('#perDel').onclick = () => { const L = P.list('ceu_bdays'); L.splice(k, 1); P.setList('ceu_bdays', L); $('#perDlg').close(); render(); };
  $('#perDlg').showModal();
}
function bindAgenda() {
  const sh = n => { const [y, m] = (ST.agMonth || todayStr().slice(0, 7)).split('-').map(Number), t = new Date(Date.UTC(y, m - 1 + n, 1)); ST.agMonth = t.toISOString().slice(0, 7); render(); };
  $('#agPrev').onclick = () => sh(-1); $('#agNext').onclick = () => sh(1);
  $('#agAdd').onclick = () => openPerson(null); $('#agVcf').onclick = openImportVcf; $('#agWeek').onclick = openWeekView;
  if ($('#agNotif')) $('#agNotif').onclick = enableAlerts;
  $('#agIcs').onclick = async () => { if (!agendaAll().filter(x => x.kind !== 'me').length) { toast('Adiciona primeiro aniversários'); return; } const f = new File([icsAll()], 'aniversarios-ceu-de-hoje.ics', { type: 'text/calendar' }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e.name === 'AbortError') return; } try { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); toast('Abre o ficheiro para juntar ao calendário'); } catch (e) { toast('Não foi possível aqui: abre a app no Chrome'); } };
  document.querySelectorAll('.ac.has').forEach(c => c.onclick = () => { const el = document.getElementById('ag-' + c.dataset.d); el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el && el.classList.add('flash'); setTimeout(() => el && el.classList.remove('flash'), 1200); });
  const all = agendaAll();
  document.querySelectorAll('.agx').forEach(el => el.onclick = () => { const k = +el.dataset.k; if (el.dataset.kind === 'p') { ST.perTab = 'hoje'; openPersonSheet(k); } else if (el.dataset.kind === 'a') { ST.petTab = 'hoje'; openPet(k); } else { ST.type = 'eu'; render(); } });
  document.querySelectorAll('.agi').forEach(el => {
    const x = all.find(z => z.kind === el.dataset.kind && String(z.k ?? '') === el.dataset.k);
    el.querySelector('.mk').onclick = e => { e.stopPropagation(); ST.anosView = 'criar'; render(); showBday({ name: x.kind === 'me' ? (x.name || 'Tu') : x.name, rel: x.rel, d: x.d, t: x.t, showAge: true, from: x.kind === 'me' ? '' : ((P.get() || {}).name || '').split(' ')[0] }, false); };
    el.querySelector('.ib[href]').onclick = e => e.stopPropagation();
    el.onclick = () => x.kind === 'p' ? (ST.perTab = 'hoje', openPersonSheet(x.k)) : x.kind === 'a' ? (ST.petTab = 'hoje', openPet(x.k)) : (ST.type = 'eu', render());
  });
}
function fertBox() {
  const g = luaGuide(ST.date).fertilidade, next = luaBest('fertilidade', ST.date, dayStr(noonJd(ST.date) + 30)).slice(0, 5);
  const p = P.get(), mine = p && p.d ? daysIn(ST.date, dayStr(noonJd(ST.date) + 30)).filter(d => skyFor(d).moon.sign === sunSignOf(p.d)).slice(0, 3) : [];
  const nd = d => { const [y, m, dd] = dParts(d); return `${dd} ${MESES[m - 1].slice(0, 3)}`; };
  return `<div class="box fert"><h3>👶 Fertilidade</h3><p>Hoje, pela tradição lunar: <b style="color:${LUA_COL[g]}">${LUA_LBL[g]}</b>.</p>
    <p>Próximos dias «férteis» da Lua: <b>${next.map(nd).join(' · ') || '—'}</b></p>${mine.length ? `<p>Lua no teu signo (${SIGNS[sunSignOf(p.d)].n}), dias de mais energia para ti: <b>${mine.map(nd).join(' · ')}</b></p>` : ''}
    ${(() => { const c = CY.get(), st = c.on ? cycleStats(c) : null; if (!st || !st.last) return ''; const lua = daysIn(st.fert[0], st.fert[1]).filter(d => luaGuide(d).fertilidade >= 3).map(d => +d.slice(8)); return `<p>🌸 Pelo teu ciclo, a janela fértil é de <b>${niceDate(st.fert[0]).replace(/^[^,]+, /, '')} a ${niceDate(st.fert[1]).replace(/^[^,]+, /, '')}</b>${lua.length ? `, e a Lua também ajuda nos dias <b>${lua.join(', ')}</b> 🌙` : ''}.</p>`; })()}
    <button class="btn" id="fertCalc" style="width:100%;margin-top:6px">📅 ${CY.get().on && CY.get().starts.length ? 'Ver o meu ciclo' : 'Calcular a janela fértil pelo ciclo'}</button>
    <p class="note">A astrologia é só tradição e entretenimento. A fertilidade real depende da ovulação e da saúde de cada um. Se estão a tentar há mais de 12 meses (ou 6 meses a partir dos 35 anos), falem com o médico de família ou um especialista em fertilidade.</p></div>`;
}
function openFert() {
  if (CY.get().on && CY.get().starts.length) { openCycle(); return; }
  $('#fertBody').innerHTML = `<p>Uma estimativa pelo método do calendário. Os dados não ficam guardados. <button class="link" id="fToCy">Prefiro acompanhar o meu ciclo na app 🌸</button></p><div class="form"><label>Primeiro dia da última menstruação<input type="date" id="fLast" max="${todayStr()}"></label><label>Duração habitual do ciclo (dias)<input type="number" id="fLen" min="21" max="40" value="28" inputmode="numeric"></label><button class="btn main" id="fGo">Calcular</button></div><div id="fOut"></div>`;
  if ($('#fToCy')) $('#fToCy').onclick = () => { const c = CY.get(); c.on = true; if ($('#fLast').value && !c.starts.some(s => s.d === $('#fLast').value)) c.starts.push({ d: $('#fLast').value }); if (+$('#fLen').value) c.len = +$('#fLen').value; CY.set(c); $('#fertDlg').close(); ST.type = 'eu'; ST.euView = 'me'; render(); openCycle(); };
  $('#fGo').onclick = () => {
    const last = $('#fLast').value, len = Math.max(21, Math.min(40, +$('#fLen').value || 28)); if (!last) { toast('Indica a data'); return; }
    const W = fertWindow(last, len), nd = d => { const [y, m, dd] = dParts(d); return `${dd} de ${MESES[m - 1]}`; };
    $('#fOut').innerHTML = W.map((w, i) => { const lua = daysIn(w.from, w.to).filter(d => luaGuide(d).fertilidade >= 3).map(d => +d.slice(8)); return `<div class="box"><h3>${i === 0 ? 'Este ciclo' : i === 1 ? 'Ciclo seguinte' : 'Daqui a dois ciclos'}</h3><p>🌸 Janela fértil estimada: <b>${nd(w.from)} a ${nd(w.to)}</b></p><p>🥚 Ovulação provável: <b>${nd(w.ov)}</b></p><p>📅 Próxima menstruação: ${nd(w.next)}</p>${lua.length ? `<p>🌙 Coincide com dias «férteis» da Lua: ${lua.join(', ')}</p>` : ''}</div>`; }).join('') + `<p class="note">É uma estimativa: ciclos irregulares, stress ou doença mudam a ovulação. Testes de ovulação da farmácia e o acompanhamento médico são mais fiáveis.</p>`;
  };
  $('#fertDlg').showModal();
}
function vAnos() {
  const seg = `<div class="seg2"><button data-av="agenda"${ST.anosView !== 'criar' ? ' class="on"' : ''}>📅 Agenda</button><button data-av="criar"${ST.anosView === 'criar' ? ' class="on"' : ''}>🎉 Criar cartaz</button></div>`;
  if (ST.anosView !== 'criar') return seg + vAgenda();
  return seg + vCriar();
}
function vCriar() {
  const list = P.list('ceu_bdays').map((x, ix) => ({ ...x, ix, dd: daysToBirthday(x.d) })).sort((a, b) => a.dd - b.dd);
  const relOpts = RELS.filter(r => r[0] !== 'eu').map(r => `<option value="${r[0]}">${r[2]}</option>`).join('');
  let h = `<h2 class="vt">🎉 Criar parabéns</h2><p class="sub2">Cartaz e vídeo com o nome, o signo, a idade e a numerologia de quem faz anos.</p>
    <div class="form"><label>Nome<input type="text" id="bdName" maxlength="24" placeholder="Ex.: João"></label>
    <label>Quem é?<select id="bdRel">${relOpts}</select></label>
    <label>Data de nascimento<input type="date" id="bdDate" min="1900-01-01" max="${todayStr()}"></label>
    <label>Estilo do cartaz<select id="bdStyle"><option value="plain"${store.get('ceu_bdstyle') !== 'astral' ? ' selected' : ''}>🎈 Festa, sem astrologia (layout surpresa)</option><option value="astral"${store.get('ceu_bdstyle') === 'astral' ? ' selected' : ''}>✨ Astral, com signo e numerologia</option></select></label>
    <label class="chk"><input type="checkbox" id="bdAge" checked> Mostrar a idade</label>
    <label>De (opcional)<input type="text" id="bdFrom" maxlength="24" placeholder="O teu nome" value="${esc((P.get() || {}).name || '')}"></label>
    <button class="btn main" id="bdGo">Criar cartaz</button></div><div id="bdOut"></div>`;
  if (list.length) h += `<h2 class="vt">📅 Próximos aniversários</h2><div class="list">${list.map((x, i) => `<div class="li bd" data-k="${i}"><span class="g">${G(SIGNS[sunSignOf(x.d)].g)}</span><b>${esc(x.name)}</b><span></span><span></span><span>${(RELS.find(r => r[0] === x.rel) || RELS[0])[2]}</span><em>${x.dd === 0 ? 'HOJE 🎂' : x.dd === 1 ? 'amanhã' : 'em ' + x.dd + ' dias'}</em><button class="bded" data-ix="${x.ix}" aria-label="Abrir">›</button></div>`).join('')}</div>`;
  const B = birthday(ST.date, ST.modern), sg = SIGNS[B.si];
  h += `<div class="bday" style="--c:${elc(sg)}"><p class="pre">Se fazes anos hoje…</p><h2>Parabéns!</h2><span class="bg">${G(sg.g)}</span><p>Sol a ${B.deg}° de ${sg.n} · o teu novo ano astral</p><p class="ph">“${esc(B.headline)}”</p></div><div class="box">${B.lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;
  return h;
}
const bdDraw = (Bd, fmt) => { const [c, ctx, W, H, S] = mk(fmt); (Bd.theme === 'plain' ? drawPlainFrame : drawBdayFrame)(ctx, W, H, S, Bd, 99); return c; };
const bdFrame = Bd => (ctx, t) => (Bd.theme === 'plain' ? drawPlainFrame : drawBdayFrame)(ctx, 1080, 1920, true, Bd, t);
const bdCap = Bd => Bd.theme === 'plain' ? capPlain(Bd) : capBday(Bd);
function showBday(o, save, seed) {
  if (!o.name || !o.d) { toast('Escreve o nome e a data'); return; }
  logBday(o);
  const style = o.style || store.get('ceu_bdstyle') || 'plain'; o.style = style;
  let Bd = makeBday(o); if (style === 'plain') Bd = plainize(Bd, seed ?? Math.floor(Math.random() * 1e6)); ST.bd = Bd; ST.bdO = o;
  if (save) { const l = P.list('ceu_bdays'), j = l.findIndex(x => x.name === o.name && x.d === o.d); if (j >= 0) l[j] = { ...l[j], rel: o.rel }; else l.push({ name: o.name, rel: o.rel, d: o.d, t: o.t || '' }); P.setList('ceu_bdays', l); }
  const c = bdDraw(Bd, 'feed');
  $('#bdOut').innerHTML = `<img class="poster" src="${stampOnce(c).toDataURL('image/jpeg', .9)}" alt="Cartaz de ${esc(Bd.name)}"><div class="row2"><button class="btn main" id="bdShare">Partilhar cartaz</button><button class="btn" id="bdVideo">🎬 Criar reel</button></div>${Bd.theme === 'plain' ? '<button class="btn" id="bdAgain" style="width:100%;margin-top:8px">🎲 Outro layout e outras frases</button>' : ''}`;
  if ($('#bdAgain')) $('#bdAgain').onclick = () => showBday(o, false);
  $('#bdShare').onclick = () => shareCanvases([{ name: 'parabens-' + norm2(Bd.name).replace(/\W+/g, '-'), c: bdDraw(Bd, ST.fmt === 'story' ? 'story' : 'feed') }], bdCap(Bd));
  $('#bdVideo').onclick = async () => {
    const v = await recordAnim(bdFrame(Bd), 10, 1080, 1920, $('#bdVideo'), '🎬 A gravar…'); if (!v) return;
    $('#reelVid').src = URL.createObjectURL(v.blob); $('#reelInfo').innerHTML = v.ext === 'mp4' ? 'Reel de parabéns pronto (vertical 9:16, 10 segundos, MP4). Serve para Reels e Stories do Instagram e do Facebook, e para o Estado do WhatsApp. Junta a música lá dentro, na própria app.' : 'Reel pronto (9:16), mas este telemóvel gravou em <b>WebM</b>: o Facebook e o WhatsApp aceitam, o Instagram pode recusar. Atualiza o Chrome para gravar em MP4.'; $('#reelDlg').showModal();
    $('#reelShare').onclick = async () => { const f = new File([v.blob], `parabens-${norm2(Bd.name).replace(/\W+/g, '-')}.${v.ext}`, { type: v.blob.type }); if (!(await shareFiles([f], bdCap(Bd)))) { await saveBlob(f, f.name); toast('Vídeo guardado'); } };
  };
  $('#bdOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function vEu() {
  const seg = `<div class="seg2"><button data-ev="me"${ST.euView !== 'diario' ? ' class="on"' : ''}>✨ O meu espaço</button><button data-ev="diario"${ST.euView === 'diario' ? ' class="on"' : ''}>📔 Diário</button><button data-ev="int"${ST.euView === 'int' ? ' class="on"' : ''}>📚 Interesses</button></div>`;
  if (ST.euView === 'diario') return seg + vDiario();
  if (ST.euView === 'int') return seg + vInteresses();
  return seg + vEuMe();
}
function vEuMe() {
  const p = P.get(), opts = sel => CITIES.map((c, i) => `<option value="${i}"${+sel === i ? ' selected' : ''}>${c[0]}</option>`).join('');
  if (!p || !p.d || ST.editProfile) {
    return `<h2 class="vt">✨ O meu espaço</h2><p class="sub2">Sem registo e sem palavras-passe: os teus dados ficam só neste telemóvel.</p>
    <div class="form"><label>O teu nome<input type="text" id="pName" maxlength="24" value="${esc(p ? p.name || '' : '')}" placeholder="Como te chamas?"></label>
    <label>Data de nascimento<input type="date" id="bDate" min="1900-01-01" max="${todayStr()}" value="${p ? p.d || '' : ''}"></label>
    <label>Hora de nascimento (opcional, para o ascendente)<input type="time" id="bTime" value="${p ? p.t || '' : ''}"></label>
    <label>Onde nasceste<select id="bCity">${opts(p ? p.c : 0)}</select></label>
    <label>📚 Livro favorito<input type="text" id="pFB" maxlength="60" value="${esc(p ? p.favBook || '' : '')}"></label><label>🎬 Série ou filme favorito<input type="text" id="pFS" maxlength="60" value="${esc(p ? p.favShow || '' : '')}"></label>
    <label>📍 Lugar favorito<input type="text" id="pFP" maxlength="60" value="${esc(p ? p.favPlace || '' : '')}"></label><label>✈️ Viagem de sonho<input type="text" id="pDT" maxlength="60" value="${esc(p ? p.dream || '' : '')}"></label>
    <button class="btn main" id="pSave">Guardar</button></div>`;
  }
  const first = p.name ? p.name.split(' ')[0] : '', si = sunSignOf(p.d), ci = CITIES[+p.c || 0], today = todayStr();
  const [y, m, dd] = dParts(p.d), [hh, mi] = (p.t || '12:00').split(':').map(Number), ms = localToUtcMs(y, m, dd, hh, mi, ci[3]);
  const natal = natalChart(ms, ci), PD = personalDay(natal, today, ST.modern), base = p.t ? PD.byAsc : readDay(si, today, ST.modern);
  const keepPets = ST.pets; ST.pets = false; computeTop(); ST.pets = keepPets; const pos = ST.rank.findIndex(r => r.si === si), rd = ST.rank[pos], v = verdict(rd);
  const dtb = daysToBirthday(p.d), lp = lifePath(p.d), py = personalYear(p.d, +today.slice(0, 4)), pdn = numDay(p.d, today);
  const cell = (l, s) => `<div class="trio"><span>${l}</span><b>${G(SIGNS[s].g)}</b><em>${SIGNS[s].n}</em></div>`;
  let h = bdayBanner() + `<div class="hello"><div><small>${niceDate(today)}</small><h2>Olá${first ? ', ' + esc(first) : ''}! ${G(SIGNS[si].g)}</h2><small class="cnlink" id="cnGo">Signo chinês: ${chineseSign(p.d).e} ${chineseSign(p.d).n} (${chineseSign(p.d).el}) ›</small></div><button class="link" id="pEdit">editar</button></div>`;
  h += euChips() + bkCard() + yearCard() + `<button class="yrow" id="monGo">📊 <span>O meu mês</span><i>›</i></button>` + factBox() + cdBox() + routinesBox();
  if (dtb !== 0) h += `<div class="count">🎂 Faltam <b>${dtb}</b> dia${dtb > 1 ? 's' : ''} para o teu aniversário</div>`;
  h += `<article class="sc mine" id="myCard" style="--c:${elc(rd.sign)}"><div class="sc-h"><span class="rk">${pos + 1}º</span><span class="gl">${G(rd.sign.g)}</span><div class="nm"><b>${rd.sign.n} hoje</b><small>${pos + 1}º lugar no Top do Dia · toca para abrir</small></div>${starsH(toStars(rd.overall))}</div><div class="vd ${v.k}"><b>${v.icon}</b> ${esc(v.txt)}</div><p class="ph">“${esc(rd.headline)}”</p></article>`;
  if (p.favBook || p.favShow || p.favPlace || p.dream) h += `<div class="box favs"><h3>❤️ Os meus favoritos</h3>${p.favBook ? `<p>📚 ${esc(p.favBook)}</p>` : ''}${p.favShow ? `<p>🎬 ${esc(p.favShow)}</p>` : ''}${p.favPlace ? `<p>📍 ${esc(p.favPlace)}</p>` : ''}${p.dream ? `<p>✈️ Sonho: ${esc(p.dream)}</p>` : ''}</div>`;
  h += `<div class="trios">${cell('Sol', PD.sunSign)}${cell('Lua', PD.moonSign)}${p.t ? cell('Ascendente', PD.ascSign) : '<div class="trio"><span>Ascendente</span><b>?</b><em>põe a hora</em></div>'}</div>`;
  h += `<div class="box"><h3>Hoje, só para ti</h3>${PD.aspects.filter(a => p.t || a.np !== 'asc').map(a => `<p>${esc(a.txt)}</p>`).join('') || '<p>Dia calmo no teu mapa: nenhum trânsito forte.</p>'}</div>`;
  if (p.t) h += `<div class="box"><h3>Pelo teu ascendente em ${SIGNS[PD.ascSign].n}</h3><p class="ph">“${esc(base.headline)}”</p><p>❤️ ${starsH(base.stars.amor)} ${esc(firstSentence(base.love))}</p><p>💼 ${starsH(base.stars.trabalho)} ${esc(firstSentence(base.work))}</p></div>`;
  h += tarotMini();
  h += `<div class="box num"><h3>🔢 Numerologia</h3><div class="nums"><button data-num="lp"><b>${lp}</b><span>Número da vida</span><i class="tap">toca para ver ›</i></button><button data-num="py"><b>${py}</b><span>Ano pessoal</span><i class="tap">toca para ver ›</i></button><button data-num="dia"><b>${pdn}</b><span>Dia de hoje</span><i class="tap">toca para ver ›</i></button></div><p>${cap1(NUM_MEAN[lp])}. Estás num ${YEAR_MEAN[py]}. Hoje: ${DAY_MEAN[pdn]}.</p></div>`;
  h += `<div class="box oracle"><h3>🔮 Oráculo</h3><p class="sub3">Pergunta o que quiseres sobre o teu dia. Responde com os cálculos do céu, sem internet.</p><div id="chat">${(ST.chat || []).map(c => `<div class="msg ${c.who}">${c.txt}</div>`).join('')}</div>
    <div class="chips">${ORACLE_SUGGEST.map(q => `<button class="qchip">${q}</button>`).join('')}</div><form id="askF" class="ask"><input type="text" id="askQ" placeholder="Escreve a tua pergunta…" autocomplete="off"><button class="btn main">↑</button></form></div>`;
  h += cycleBox() + momentsBox(null, 'Momentos') + kidsBox();
  const pets = P.list('ceu_pets');
  h += `<div class="box" id="sec-pets"><h3>🐾 Os meus animais</h3>${pets.map((a, i) => { const s = spOf(a), ps = sunSignAt(a.d, a.t), r2 = petize(readDay(ps, today, ST.modern)), v2 = petVerdict(r2), dd = daysToBirthday(a.d); return `<div class="pet" data-k="${i}"><span class="em">${s[1]}</span><div><b>${esc(a.name)} <span class="g2" style="color:${elc(SIGNS[ps])}">${G(SIGNS[ps].g)}</span></b><small>${s[2]} · ${SIGNS[ps].n} · ${dd === 0 ? '🎂 faz anos hoje!' : 'anos em ' + dd + ' dias'}</small><small class="vv ${v2.k}">${esc(v2.txt)}</small></div><span class="chev">›</span></div>`; }).join('') || '<p>Junta o teu animal para veres o signo, o dia dele e criares o cartaz de anos.</p>'}
    <button class="btn" id="petNew" style="width:100%;margin-top:6px">＋ Juntar animal</button></div>`;
  return h;
}
function bdayBanner() {
  const L = todaysBirthdays(); if (!L.length) return '';
  return `<div class="party">🎂 <b>Hoje faz${L.length > 1 ? 'em' : ''} anos:</b>${L.map((x, i) => `<div class="bdrow"><span>${esc(x.label)}</span><button class="btn main bdmk" data-k="${i}">Criar cartaz</button></div>`).join('')}</div>`;
}
function bindBanner() { const L = todaysBirthdays(); document.querySelectorAll('.bdmk').forEach(b => b.onclick = e => { e.stopPropagation(); const o = L[+b.dataset.k].o; ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday(o, false); }); }
function openPet(i, isNew, edit) {
  const pets = P.list('ceu_pets'), a = isNew ? { name: '', sp: 'cao', d: '', t: '' } : pets[i];
  const spOpts = SPECIES.map(s => `<option value="${s[0]}"${spOf(a)[0] === s[0] ? ' selected' : ''}>${s[1]} ${s[2]}</option>`).join('');
  let h = `<div class="form"><label>Nome<input type="text" id="aName" maxlength="20" value="${esc(a.name)}" placeholder="Ex.: Bobi"></label><label>Espécie<select id="aSp">${spOpts}</select></label>
    <label class="chk" id="aMixL"><input type="checkbox" id="aMix"${a.mix ? ' checked' : ''}> 🧬 É cruzado (mistura de duas raças)</label><label id="aBreedL">Raça<select id="aBreed"></select></label><div class="two" id="aMixBox" hidden><label>Raça 1<select id="aMix1"></select></label><label>Raça 2<select id="aMix2"></select></label></div><label id="aBreedTxtL" hidden>Escreve a raça<input type="text" id="aBreedTxt" maxlength="30" value="${esc(a.breed || '')}" placeholder="Ex.: Lop, Canário, Ruivo…"></label>
    <label>Data de nascimento (ou de adoção)<input type="date" id="aDate" max="${todayStr()}" value="${a.d}"></label><label>Hora (opcional)<input type="time" id="aTime" value="${a.t || ''}"></label><label>Dia de adoção (opcional)<input type="date" id="aAdoptD" max="${todayStr()}" value="${a.adopt || ''}"></label></div>`;
  if (!isNew && a.d && !edit) {
    const s = spOf(a), ps = sunSignAt(a.d, a.t), cn = chineseSign(a.d), age = ageOn(a.d), ha = humanAge(a), dd = daysToBirthday(a.d);
    const r2 = petize(readDay(ps, todayStr(), ST.modern)), v2 = petVerdict(r2);
    h = `<div class="pethero" style="--c:${elc(SIGNS[ps])}"><span class="em">${s[1]}</span><h3>${esc(a.name)}</h3><p>${s[2]}${a.breed ? ' · ' + esc(a.breed) : ''} · <b>${G(SIGNS[ps].g)} ${SIGNS[ps].n}</b> · ${cn.e} ${cn.n} (${cn.el})</p>
      <p>${age > 0 ? age + (age === 1 ? ' ano' : ' anos') : 'Menos de 1 ano'}${ha ? ` · ≈ ${ha} anos humanos` : ''} · ${dd === 0 ? '🎂 <b>faz anos hoje!</b>' : `🎂 anos em ${dd} dias`}</p></div>
      <div class="vd ${v2.k}"><b>${v2.icon}</b> ${esc(v2.txt)}</div><p class="ph">“${esc(r2.headline)}”</p><div class="tip">💡 <b>Dica do dia:</b> ${esc(petTip(r2, a.name))}</div>
      <div class="ar4" style="--c:${elc(SIGNS[ps])}">${AREAS4(r2).map(([l, k, t]) => `<div><span>${l}</span>${starsH(r2.stars[k])}<p>${esc(t)}</p></div>`).join('')}</div>
      </div>`;
    const tab = ST.petTab || 'hoje', wh = walkHours(todayStr()), ad = a.adopt ? ageOn(a.adopt) : 0, add = a.adopt ? daysToBirthday(a.adopt) : null;
    const top = h.slice(0, h.indexOf('<div class="vd'));
    const hoje = h.slice(h.indexOf('<div class="vd')).replace(/<\/div>`?;?$/, '') + (wh.length ? `<div class="box walk"><h3>${s[0] === 'cao' ? '🦮 Melhores horas para passear' : '🌤️ Melhores horas para brincar'}</h3>${wh.map(w => `<p><b>${w.t}</b> · ${w.why}</p>`).join('')}<p class="note">Pelas horas planetárias de ${CITIES[ST.city || 0][0]}.</p></div>` : '');
    h = top + `<div class="seg2 ptabs"><button data-pt="hoje"${tab === 'hoje' ? ' class="on"' : ''}>☀️ Hoje</button><button data-pt="cad"${tab === 'cad' ? ' class="on"' : ''}>📋 Caderneta</button><button data-pt="mais"${tab === 'mais' ? ' class="on"' : ''}>💞 Mais</button></div>`;
    if (tab === 'hoje') h += hoje;
    if (tab === 'cad') h += careBox(a, i) + `<button class="btn" id="aVet" style="width:100%">📄 Ficha para o veterinário (PDF)</button>`;
    if (tab === 'mais') h += ownerPetBox(a) + `<div class="box adopt"><h3>🏡 Dia de adoção</h3>${a.adopt ? `<p>Chegou a casa a <b>${niceDate(a.adopt)}</b>${ad > 0 ? ` · ${ad} ano${ad > 1 ? 's' : ''} de família` : ''}.</p><p>${add === 0 ? '🎉 <b>É hoje!</b>' : `Faltam ${add} dias para festejar.`}</p><button class="btn" id="aAdopt" style="width:100%">🎉 Cartaz do dia de adoção</button>` : '<p class="note">Foi adotado(a)? Põe a data em ✏️ Editar e festejamos também esse dia.</p>'}</div>` + `<div class="box prof"><h3>🧬 Perfil ${a.breed ? '· ' + esc(a.breed) : ''}</h3>${breedProfile(a).map(l => `<p>${esc(l)}</p>`).join('')}<p>No horóscopo chinês é ${cn.e} ${cn.n} (${cn.el}).</p></div>
      ` + `<div class="tools"><button class="btn main" id="aPoster">🎉 Criar cartaz de parabéns</button><button class="btn" id="aCard">🃏 Abrir o cartão do dia</button><button class="btn" id="aLost">🆘 Cartaz de perdido</button><button class="btn" id="aEdit">✏️ Editar</button><button class="btn" id="aDel">🗑️ Apagar</button></div>` + '<div id="petMore"></div>';
  }
  $('#petBody').innerHTML = h;
  const fillBreeds = () => { if (!$('#aBreed')) return; const sp = $('#aSp').value, L = BREEDS[sp], mix = $('#aMix').checked && !!L; $('#aMixL').hidden = !L; $('#aMixBox').hidden = !mix; if (L) { const M = L.slice(1).map(b => b[0]); $('#aMix1').innerHTML = M.map(n => `<option${a.mix && a.mix[0] === n ? ' selected' : ''}>${n}</option>`).join(''); $('#aMix2').innerHTML = M.map((n, j) => `<option${a.mix ? (a.mix[1] === n ? ' selected' : '') : (j === 1 ? ' selected' : '')}>${n}</option>`).join(''); }
    if (mix) { $('#aBreed').parentElement.hidden = true; $('#aBreedTxtL').hidden = true; return; }
    if (L) { $('#aBreed').innerHTML = L.map(b => `<option${b[0] === a.breed ? ' selected' : ''}>${b[0]}</option>`).join('') + `<option value="__outra"${a.breed && !L.find(b => b[0] === a.breed) ? ' selected' : ''}>Outra…</option>`; $('#aBreed').parentElement.hidden = false; } else { $('#aBreed').parentElement.hidden = true; } $('#aBreedTxtL').hidden = !!L && $('#aBreed').value !== '__outra'; };
  if ($('#aSp')) { $('#aMix').onchange = fillBreeds; $('#aSp').onchange = fillBreeds; $('#aBreed').onchange = () => $('#aBreedTxtL').hidden = $('#aBreed').value !== '__outra'; fillBreeds(); }
  $('#petTitle').textContent = isNew ? 'Juntar animal' : edit ? 'Editar ' + a.name : '';
  $('#petSave').hidden = !(isNew || edit);
  const save = () => { const n = $('#aName').value.trim(), d = $('#aDate').value; if (!n || !d) { toast('Nome e data do animal'); return; } const l = P.list('ceu_pets'), sp = $('#aSp').value, mix = BREEDS[sp] && $('#aMix').checked ? [$('#aMix1').value, $('#aMix2').value] : null; if (mix && mix[0] === mix[1]) { toast('Escolhe duas raças diferentes'); return; } const br = mix ? `${mix[0].replace(/ \(.*\)/, '')} × ${mix[1].replace(/ \(.*\)/, '')}` : BREEDS[sp] && $('#aBreed').value !== '__outra' ? $('#aBreed').value : $('#aBreedTxt').value.trim(), o = { name: n, sp, breed: br, mix, d, t: $('#aTime').value, adopt: $('#aAdoptD').value || '' }; if (isNew) l.push(o); else l[i] = { ...l[i], ...o }; P.setList('ceu_pets', l); $('#petDlg').close(); toast('Guardado 🐾'); render(); };
  $('#petSave').onclick = save;
  document.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => { ST.petTab = b.dataset.pt; openPet(i, false, false); });
  if ($('.care')) bindCare(i); bindOwnerPet(a);
  if ($('#aVet')) $('#aVet').onclick = () => vetPdf(i);
  if ($('#aLost')) $('#aLost').onclick = () => lostForm(i);
  if ($('#aAdopt')) $('#aAdopt').onclick = async () => { toast('A preparar…'); await shareCanvases([{ name: 'adocao-' + a.name.toLowerCase(), c: await drawAdopt(a) }], `🏡 Faz ${ageOn(a.adopt)} ano${ageOn(a.adopt) > 1 ? 's' : ''} que ${a.name} chegou a casa! 🐾\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  if ($('#aPoster')) {
    const s = spOf(a), p = P.get();
    $('#aPoster').onclick = () => { $('#petDlg').close(); ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday({ name: a.name, rel: s[0] === 'cao' ? 'cao' : s[0] === 'gato' ? 'gato' : 'pet', d: a.d, t: a.t, showAge: true, from: p && p.name ? p.name.split(' ')[0] : '' }, false); };
    $('#aCard').onclick = () => { $('#petDlg').close(); const kp = ST.pets; ST.pets = true; computeTop(); ST.pets = kp; openSheet(ST.rank.findIndex(r => r.si === sunSignAt(a.d, a.t)), `${spOf(a)[1]} ${a.name}`); };
    $('#aEdit').onclick = () => openPetEdit(i);
    $('#aDel').onclick = () => { const l = P.list('ceu_pets'); l.splice(i, 1); P.setList('ceu_pets', l); $('#petDlg').close(); render(); };
  }
  if (!$('#petDlg').open) $('#petDlg').showModal();
}
function openPetEdit(i) { openPet(i, false, true); }
function vDiario() {
  const all = DIA.all(), ed = ST.dEdit ? all.find(x => x.id === ST.dEdit) : null, n = ed || { d: todayStr(), mood: 0, txt: '', tags: [] };
  const q = norm2(ST.dQ || ''), list = all.filter(x => !q || norm2(x.txt).includes(q) || (x.tags || []).some(t => norm2(t).includes(q))).sort((a, b) => b.d.localeCompare(a.d) || b.ts - a.ts);
  const mem = memories(all), ins = diaryInsights(all, todayStr().slice(0, 7)), emo = m => (MOODS.find(x => x[0] === m) || [0, '·'])[1];
  let h = `<div class="box diary"><h3>${ed ? '✏️ Editar nota' : '📔 Como te sentes hoje?'}</h3>
    <div class="moods">${MOODS.map((m, i) => `<button class="md${n.moodI === i || (!('moodI' in n) && n.mood === m[0] && n.moodE === m[1]) ? ' on' : ''}" data-mi="${i}" title="${m[2]}"><span>${m[1]}</span><small>${m[2]}</small></button>`).join('')}</div>
    <textarea id="dTxt" rows="5" placeholder="Escreve à vontade: o que aconteceu, o que sentiste, o que te vai na cabeça…">${esc(n.txt)}</textarea>
    <div class="tagsel">${D_TAGS.map(t => `<button class="tg${(n.tags || []).includes(t) ? ' on' : ''}">${t}</button>`).join('')}</div>
    <div class="drow"><input type="date" id="dDate" max="${todayStr()}" value="${n.d}"><button class="btn main" id="dSave">${ed ? 'Guardar' : 'Guardar nota'}</button></div>${ed ? '<div class="drow"><button class="btn" id="dCancel">Cancelar</button><button class="btn" id="dDel">🗑️ Apagar</button></div>' : ''}
    <p class="note">🔒 Fica só neste telemóvel. Podes proteger a app com um PIN nas definições.</p></div><div id="dFb"></div>`;
  if (mem.length) h += `<div class="box"><h3>🕰️ Memórias</h3>${mem.map(m => `<div class="dn" data-id="${m.x.id}"><span>${emo(m.x.mood)}</span><div><small>${m.lbl} · ${niceDate(m.x.d)}</small><p>${esc(m.x.txt.slice(0, 140))}${m.x.txt.length > 140 ? '…' : ''}</p></div></div>`).join('')}</div>`;
  if (ins) h += `<div class="box"><h3>📊 O teu mês</h3><p>${ins.n} nota${ins.n > 1 ? 's' : ''} · humor médio ${'★'.repeat(Math.round(ins.avg))}${'☆'.repeat(5 - Math.round(ins.avg))}</p>${ins.topTags.length ? `<p>Temas mais presentes: <b>${ins.topTags.join(', ')}</b></p>` : ''}${ins.nc >= 3 && ins.nm >= 3 ? `<p>🌙 Com a Lua a crescer andas ${ins.cresc > ins.ming + 0.3 ? 'mais animado' : ins.cresc < ins.ming - 0.3 ? 'mais em baixo' : 'igual'} do que com a Lua a minguar.</p>` : ''}${ins.bestWd ? `<p>O teu melhor dia da semana tem sido <b>${ins.bestWd}</b>.</p>` : ''}</div>`;
  h += `<div class="box"><h3>📚 As minhas notas</h3><input type="search" id="dQ" placeholder="Procurar nas notas…" value="${esc(ST.dQ || '')}">${list.length ? list.slice(0, 60).map(x => `<div class="dn" data-id="${x.id}"><span>${emo(x.mood)}</span><div><small>${niceDate(x.d)}${(x.tags || []).length ? ' · ' + x.tags.join(', ') : ''}</small><p>${esc(x.txt.slice(0, 120))}${x.txt.length > 120 ? '…' : ''}</p></div></div>`).join('') : '<p class="hint">Ainda não há notas.</p>'}
    <div class="drow"><button class="btn" id="dExp">📤 Cópia de segurança</button><label class="btn" style="text-align:center">📥 Repor<input type="file" id="dImp" accept="application/json,.json" hidden></label></div>
    <p class="note">Não sou psicólogo: sou um espaço para pensares e veres padrões. Se precisares, fala com alguém de confiança ou com um profissional. Aconselhamento psicológico do SNS 24: <a href="tel:808242424">808 24 24 24</a>, opção 4.</p></div>`;
  return h;
}
function bindDiario() {
  const all = DIA.all(), ed = ST.dEdit ? all.find(x => x.id === ST.dEdit) : null;
  let mi = ed ? MOODS.findIndex(m => m[0] === ed.mood && m[1] === ed.moodE) : -1;
  document.querySelectorAll('.md').forEach(b => b.onclick = () => { mi = +b.dataset.mi; document.querySelectorAll('.md').forEach(x => x.classList.toggle('on', x === b)); });
  document.querySelectorAll('.tg').forEach(b => b.onclick = () => b.classList.toggle('on'));
  $('#dSave').onclick = () => {
    const txt = $('#dTxt').value.trim(); if (!txt && mi < 0) { toast('Escreve algo ou escolhe como te sentes'); return; }
    const m = MOODS[mi < 0 ? 2 : mi], tags = [...document.querySelectorAll('.tg.on')].map(b => b.textContent), L = DIA.all();
    const note = { id: ed ? ed.id : 'n' + Date.now().toString(36), d: $('#dDate').value || todayStr(), mood: m[0], moodE: m[1], txt, tags, ts: Date.now() };
    if (ed) L[L.findIndex(x => x.id === ed.id)] = note; else L.push(note); DIA.save(L); ST.dEdit = null; render(); dreamCheckText(note.txt, note.d);
    $('#dFb').innerHTML = `<div class="box fb"><h3>💬 Para ti</h3>${diaryFeedback(note, DIA.all())}</div>`; $('#dFb').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if ($('#dCancel')) { $('#dCancel').onclick = () => { ST.dEdit = null; render(); }; $('#dDel').onclick = () => { if (!confirmBox('Apagar esta nota?')) return; DIA.save(DIA.all().filter(x => x.id !== ed.id)); ST.dEdit = null; render(); }; }
  $('#dQ').oninput = e => { ST.dQ = e.target.value; clearTimeout(bindDiario.t); bindDiario.t = setTimeout(() => { render(); const q = $('#dQ'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 350); };
  document.querySelectorAll('.dn').forEach(el => el.onclick = () => { const x = DIA.all().find(z => z.id === el.dataset.id); $('#noteBody').innerHTML = `<p class="hint" style="text-align:left">${niceDate(x.d)} · ${x.moodE || ''} ${(MOODS.find(m => m[1] === x.moodE) || [0, '', ''])[2]}${(x.tags || []).length ? ' · ' + x.tags.join(', ') : ''}</p><p class="ntxt">${esc(x.txt).replace(/\n/g, '<br>')}</p><div class="box fb"><h3>💬 Para ti</h3>${diaryFeedback(x, DIA.all())}</div>`; $('#noteEdit').onclick = () => { $('#noteDlg').close(); ST.dEdit = x.id; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }; $('#noteDlg').showModal(); });
  $('#dExp').onclick = doBackup;
  $('#dImp').onchange = e => e.target.files[0] && doRestore(e.target.files[0]);
}
function vInteresses() {
  const t = ST.intTab || 'livros', C = INT[t], L = intList(t), S = intStats(t);
  let h = `<div class="itabs">${Object.entries(INT).map(([k, v]) => `<button data-it="${k}"${k === t ? ' class="on"' : ''}>${v.ic} ${k === 'livros' ? 'Livros' : k === 'series' ? 'Séries' : (k === 'colecoes' ? 'Coleções' : 'Viagens')}</button>`).join('')}</div>`;
  if (t === 'colecoes') { const own = L.filter(x => x.status === 2 || x.status === 3), pcs = own.reduce((a, x) => a + (+x.pcs || 0), 0), val = own.reduce((a, x) => a + (+String(x.price || '').replace(',', '.') || 0), 0); h += `<div class="box istats"><div><b>${own.length}</b><span>tenho</span></div><div><b>${L.filter(x => x.status === 0).length}</b><span>quero</span></div>${pcs ? `<div><b>${pcs.toLocaleString('pt-PT')}</b><span>peças</span></div>` : ''}${val ? `<div><b>${Math.round(val).toLocaleString('pt-PT')} €</b><span>investido</span></div>` : ''}</div><div class="box"><h3>🔎 Já tenho isto?</h3><p class="note">Na loja, lê o código de barras da caixa: digo-te logo se já está na tua coleção.</p><div class="addrow"><button class="btn main" id="colScan">📷 Ler código de barras</button></div><input type="search" id="colQ" placeholder="Ou procura por nome, nº do set ou marca…" value="${esc(ST.colQ || '')}" style="width:100%;margin-top:8px"><div id="colRes"></div></div>`; } else
  h += `<div class="box istats"><div><b>${S.done}</b><span>${C.verb[2].toLowerCase()}${S.done === 1 ? '' : 's'}</span></div><div><b>${S.year}</b><span>em ${todayStr().slice(0, 4)}</span></div><div><b>${S.doing}</b><span>${C.doing}</span></div><div><b>${t === 'viagens' ? S.countries.length : S.avgDays ?? '–'}</b><span>${t === 'viagens' ? 'países' : 'dias em média'}</span></div></div>`;
  if (S.topG || S.topA) h += `<p class="hint" style="text-align:left">${S.topG ? `O teu género preferido: <b>${S.topG[0]}</b>. ` : ''}${S.topA && t === 'livros' ? `Autor(a) mais lido(a): <b>${esc(S.topA[0])}</b>.` : ''}</p>`;
  if (t === 'livros') { const R = readingToday(ST.date); h += `<div class="box"><h3>📖 Hoje para ler: <span style="color:${LUA_COL[R.v]}">${LUA_LBL[R.v]}</span></h3><p>${esc(R.why)}</p>${R.hrs.length ? `<p>Melhores horas (Mercúrio e Lua): <b>${R.hrs.join(' · ')}</b></p>` : ''}</div>`; }
  if (t === 'livros') h += `<div class="seg2 vw"><button data-vw="lista"${ST.bookView === 'estante' ? '' : ' class="on"'}>📋 Lista</button><button data-vw="estante"${ST.bookView === 'estante' ? ' class="on"' : ''}>📚 Estante</button><button data-vw="stats"${ST.bookView === 'stats' ? ' class="on"' : ''}>📊 Números</button></div>`;
  if (t === 'livros' && ST.bookView !== 'estante') h += goalBox() + lentReminders();
  if (t === 'viagens') h += `<div class="seg2 vw"><button data-tv="lista"${!ST.tripView || ST.tripView === 'lista' ? ' class="on"' : ''}>📋 Lista</button><button data-tv="sonhos"${ST.tripView === 'sonhos' ? ' class="on"' : ''}>✨ Sonhos</button><button data-tv="pass"${ST.tripView === 'pass' ? ' class="on"' : ''}>🛂 Passaporte</button></div>`;
  if (t === 'viagens' && ST.tripView === 'pass') return h + vPassport();
  if (t === 'viagens' && ST.tripView === 'sonhos') return h + vDreams();
  if (t === 'livros' && ST.bookView !== 'stats') h += libSearchHtml();
  if (t === 'series') h += tvTodayBox(ST.date);
  if (t === 'colecoes') h += `<div class="seg2 vw"><button data-cv="lista"${ST.colView === 'estante' ? '' : ' class="on"'}>📋 Lista</button><button data-cv="estante"${ST.colView === 'estante' ? ' class="on"' : ''}>🗄️ Estantes</button></div>`;
  h += `<div id="intOnline"></div><div class="addrow"><button class="btn main" id="intAdd">＋ Adicionar ${C.one}</button>${t === 'livros' ? '<button class="btn" id="intScan" title="Ler código de barras">📷</button>' : ''}</div>`;
  if (t === 'livros' && ST.bookView === 'estante') { SHT = 'livros'; return h + vShelf(); }
  if (t === 'colecoes' && ST.colView === 'estante') { SHT = 'colecoes'; return h + vShelf(); }
  if (t === 'livros' && ST.bookView === 'stats') return h + vBookStats();
  for (const st of [1, 3, 0, 2, 4].filter(n => n < C.verb.length)) {
    const g0 = L.filter(x => x.status === st && !(t === 'viagens' && x.realized)).sort((a, b) => (b.ed || b.sd || '').localeCompare(a.ed || a.sd || ''));
    if (!g0.length) continue;
    const lim = (ST.intMore || {})[t + st] || 60, g = g0.slice(0, lim), more = g0.length - g.length;
    h += `<h2 class="vt">${C.verb[st]} <small>(${g0.length})</small></h2><div class="ilist">${g.map(x => `${(() => { const cc = t === 'viagens' ? countryOf(x) : null; return `<div class="iit${cc ? ' flg' : ''}" data-id="${x.id}"${cc ? ` style="--fl:${flagBg(cc)}"` : ''}>${x.cover ? `<img src="${esc(x.cover)}" alt="" loading="lazy">` : `<span class="ph0${cc ? ' fl' : ''}">${cc ? flagOf(cc[1]) : t === 'series' && x.kind !== 'filme' ? '📺' : C.ic}</span>`}`; })()}<div><b>${esc(x.title)}</b><small>${esc(x.by || '')}${x.place ? ' · ' + esc(x.place) : ''}${x.genre ? ' · ' + x.genre : ''}</small>${x.rating ? `<span class="stars">${'★'.repeat(x.rating)}<i>${'☆'.repeat(5 - x.rating)}</i></span>` : ''}${st === 2 && durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et)) ? `<small>⏱ ${C.done} em ${durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et))}</small>` : ''}${t === 'series' && epInfo(x) ? `<small>📺 ${epInfo(x)}</small>` : ''}${x.next ? `<small class="nx">📺 Próximo episódio: ${x.next}</small>` : ''}${t === 'livros' && (x.status === 1 || x.status === 3) ? progH(x) : ''}</div></div>`).join('')}</div>`;
    if (more > 0) h += `<button class="btn ghost imore" data-more="${t + st}" style="width:100%;margin:6px 0 12px">Mostrar mais ${Math.min(more, 60)} (faltam ${more})</button>`;
  }
  if (!L.length) h += `<p class="hint">${t === 'livros' ? 'A tua pequena biblioteca começa aqui. Junta o livro que estás a ler ou os que já leste.' : t === 'series' ? 'Junta as séries e os filmes que vês ou queres ver.' : t === 'colecoes' ? 'Junta aqui os teus LEGO, Funko, discos, perfumes… o que colecionares. Com o código de barras, na loja sabes logo se já tens.' : 'Junta as viagens que fizeste e as que sonhas fazer.'}</p>`;
  return h;
}
function bindInteresses() {
  const t = ST.intTab || 'livros';
  document.querySelectorAll('[data-it]').forEach(b => b.onclick = () => { ST.intTab = b.dataset.it; render(); });
  if ($('#intAdd')) $('#intAdd').onclick = () => openItem(t, null, true);
  document.querySelectorAll('[data-more]').forEach(b => b.onclick = () => { ST.intMore = ST.intMore || {}; ST.intMore[b.dataset.more] = ((ST.intMore[b.dataset.more]) || 60) + 60; render(); });
  if (t === 'colecoes') bindCollections();
  document.querySelectorAll('[data-vw]').forEach(b => b.onclick = () => { ST.bookView = b.dataset.vw; render(); });
  document.querySelectorAll('[data-tv]').forEach(b => b.onclick = () => { ST.tripView = b.dataset.tv; render(); });
  bindGoal(); bindLibSearch(); bindDreams(); if ($('#ppShare')) $('#ppShare').onclick = async () => { toast('A preparar o passaporte…'); const P2 = passportStamps(); await shareCanvases([{ name: 'passaporte', c: await drawPassport() }], `🛂 O meu passaporte: ${P2.S.map(s => flagOf(s.iso)).join(' ')}\n${P2.S.length} países · ${P2.euPct}% da Europa\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  if ($('#intScan')) $('#intScan').onclick = async () => { try { const code = await scanBarcode(); if (!code) return; toast('A procurar o livro…'); const b = await isbnLookup(code); if (!b) { toast('Não está nas bases abertas — preenche ou fotografa a capa 📷', 4000); openItem('livros', null, true, { isbn: code, status: 2, notFound: 1 }); return; } openItem('livros', null, true, { ...b, isbn: code, status: 2 }); } catch (e) { toast('Sem câmara ou sem internet'); } };
  if ((t === 'livros' && ST.bookView === 'estante') || (t === 'colecoes' && ST.colView === 'estante')) { SHT = t; bindShelf(); }
  document.querySelectorAll('[data-cv]').forEach(b => b.onclick = () => { ST.colView = b.dataset.cv; render(); });
  if (t === 'livros' && ST.bookView === 'stats') bindReadShare(ST.statYear || todayStr().slice(0, 4));
  if (t === 'livros' && ST.bookView === 'stats') { $('#syPrev').onclick = () => { ST.statYear = +(ST.statYear || todayStr().slice(0, 4)) - 1; render(); }; $('#syNext').onclick = () => { ST.statYear = +(ST.statYear || todayStr().slice(0, 4)) + 1; render(); }; }
  document.querySelectorAll('.iit').forEach(el => el.onclick = () => openItem(t, el.dataset.id, false));
  document.querySelectorAll('.tvpick').forEach(el => el.onclick = () => openItem('series', el.dataset.id, false));
  if (ONLINE()) loadIntOnline(t);
}
async function loadIntOnline(t) {
  const box = $('#intOnline'); if (!box) return; const L = intList(t); let h = '';
  try {
    if (t === 'livros') {
      const authors = [...new Set(L.filter(x => x.rating >= 4 || x.status === 2).map(x => x.by).filter(Boolean))];
      if (authors.length) { const news = await cachedDaily('ceu_news', () => authorNews(authors)); const hv = new Set(L.map(x => norm2(x.title))); const nn = news.filter(n => !hv.has(norm2(n.title))).slice(0, 4); if (nn.length) h += `<div class="box"><h3>📢 Novidades dos teus autores</h3>${nn.map(n => `<div class="sug">${n.cover ? `<img src="${n.cover}" alt="">` : '<span class="ph0">📚</span>'}<div><b>${esc(n.title)}</b><small>${esc(n.by)} · ${n.year}</small></div><button class="ib addsug" data-t="${esc(n.title)}" data-b="${esc(n.by)}" data-c="${esc(n.cover)}">＋</button></div>`).join('')}</div>`; }
      const S = intStats(t); if (S.topG) { const sg = await cachedDaily('ceu_sug_' + S.topG[0], () => bookSuggest(S.topG[0], L)); if (sg.length) h += `<div class="box"><h3>💡 Sugestões de ${S.topG[0].toLowerCase()}</h3>${sg.map(n => `<div class="sug">${n.cover ? `<img src="${n.cover}" alt="">` : '<span class="ph0">📚</span>'}<div><b>${esc(n.title)}</b><small>${esc(n.by)}</small></div><button class="ib addsug" data-t="${esc(n.title)}" data-b="${esc(n.by)}" data-c="${esc(n.cover)}">＋</button></div>`).join('')}</div>`; }
    }
    if (t === 'series') {
      const tv = L.filter(x => x.tvmaze && x.status !== 2); let changed = false;
      for (const x of tv) { try { const e = await cachedDaily('ceu_ep_' + x.tvmaze, () => nextEpisode(x.tvmaze)); const nv = e ? `${e.date.slice(8)}/${e.date.slice(5, 7)} (T${e.s}E${e.n})` : ''; if (x.next !== nv) { x.next = nv; changed = true; } } catch (e) { } }
      if (changed) { const all = intList(t); tv.forEach(x => { const i = all.findIndex(z => z.id === x.id); if (i >= 0) all[i].next = x.next; }); intSave(t, all); }
      const soon = tv.filter(x => x.next); if (soon.length) h += `<div class="box"><h3>📺 Próximos episódios</h3>${soon.map(x => `<p><b>${esc(x.title)}</b> · ${x.next}</p>`).join('')}</div>`;
    }
  } catch (e) { }
  box.innerHTML = h;
  box.querySelectorAll('.addsug').forEach(b => b.onclick = () => openItem(t, null, true, { title: b.dataset.t, by: b.dataset.b, cover: b.dataset.c, status: 0 }));
}
function openItem(t, id, edit, preset) {
  const C = INT[t], L = intList(t), x = id ? L.find(z => z.id === id) : Object.assign({ title: '', by: '', genre: '', status: t === 'viagens' || t === 'colecoes' ? 2 : 1, rating: 0, sd: todayStr(), st: '', ed: '', et: '', comment: '', cover: '', place: '' }, preset || {});
  $('#intTitle').textContent = id ? (edit ? 'Editar' : '') : `Novo ${C.one}`;
  if (!edit) {
    const dur = durTxt(dtJoin(x.sd, x.st), dtJoin(x.ed, x.et)), sky = x.sd ? skyFor(x.sd) : null;
    const cc = t === 'viagens' ? countryOf(x) : null;
    $('#intBody').innerHTML = `<div class="ihero${cc ? ' flg' : ''}"${cc ? ` style="--fl:${flagBg(cc)}"` : ''}>${x.cover ? `<img src="${esc(x.cover)}" alt="">` : `<span class="ph1${cc ? ' fl' : ''}">${cc ? flagOf(cc[1]) : C.ic}</span>`}<h3>${esc(x.title)}</h3><p>${esc(x.by || '')}${x.place ? ' · ' + esc(x.place) : ''}${x.genre ? ' · ' + x.genre : ''}</p><span class="stars big">${'★'.repeat(x.rating || 0)}<i>${'☆'.repeat(5 - (x.rating || 0))}</i></span><span class="chip" style="--c:var(--gold)">${x.realized ? '✨ Sonho realizado' : C.verb[x.status]}</span><div class="itacts"><button class="btn ghost" id="itShare">📤 Imagem</button><button class="btn ghost" id="itReel">🎬 Reel</button></div>${t === 'livros' && x.isbn ? `<a class="wooklnk" href="${wookLink(x.isbn)}" target="_blank" rel="noopener">🔎 Ver na Wook</a>` : ''}</div>
      ${x.sd ? `<div class="box"><p>▶️ Início: <b>${niceDate(x.sd)}${x.st ? ' às ' + x.st : ''}</b></p>${x.ed ? `<p>🏁 Fim: <b>${niceDate(x.ed)}${x.et ? ' às ' + x.et : ''}</b></p>` : ''}${dur ? `<p>⏱ ${C.done} em <b>${dur}</b>.</p>` : ''}</div>` : ''}${astroBox(t, x)}
      ${t === 'livros' && (x.status === 1 || x.status === 3) ? `<div class="box"><h3>📖 A tua leitura</h3>${progH(x)}<div class="drow"><input type="number" id="logPg" inputmode="numeric" placeholder="Página onde vais" value="${x.page || ''}"><button class="btn main" id="logGo">Li hoje</button></div></div>` : ''}
      ${t === 'series' && x.kind !== 'filme' && (x.status === 1 || x.status === 3) ? `<div class="box"><h3>📺 Onde vais</h3><p>${epInfo(x) || 'Ainda sem episódios registados.'}</p><button class="btn main" id="epPlus" style="width:100%">＋1 episódio visto</button></div>` : ''}${t === 'livros' ? quotesBox(x) + lendBox(x) : ''}${t === 'colecoes' ? `<div class="box"><h3>🧱 Detalhes</h3>${x.ref ? `<p>Nº / referência: <b>${esc(x.ref)}</b></p>` : ''}${+x.pcs ? `<p>Peças: <b>${(+x.pcs).toLocaleString('pt-PT')}</b></p>` : ''}${x.price ? `<p>Preço pago: <b>${esc(x.price)} €</b></p>` : ''}${x.isbn ? `<p>Código de barras: <b>${esc(x.isbn)}</b></p>` : ''}<p>📍 Onde está: <b>${esc(placeTxt(x, 'colecoes'))}</b></p></div>` : ''}${x.comment ? `<div class="box"><h3>💬 O teu comentário</h3><p>${esc(x.comment).replace(/\n/g, '<br>')}</p></div>` : ''}${x.next ? `<div class="box"><p>📺 Próximo episódio: <b>${x.next}</b></p></div>` : ''}`;
    $('#intSave').textContent = '✏️ Editar'; $('#intSave').onclick = () => openItem(t, id, true); $('#intDel').hidden = true;
    $('#itShare').onclick = () => shareItem(t, x); $('#itReel').onclick = () => makeItemReel(t, x, $('#itReel'));
    if ($('#epPlus')) $('#epPlus').onclick = () => { const all = intList(t), o = all.find(z => z.id === id); o.ep = (+o.ep || 0) + 1; o.eplog = (o.eplog || []).concat(todayStr()); o.status = 1; intSave(t, all); const td = o.eplog.filter(d => d === todayStr()).length; toast(td >= 3 ? `🍿 Maratona! ${td} episódios hoje` : `Episódio ${o.ep} ✓`); openItem(t, id, false); render(); }; if (t === 'livros') { bindQuotes(t, id); bindLend(t, id); }
    if ($('#logGo')) $('#logGo').onclick = () => { const all = intList(t), o = all.find(z => z.id === id), pg = +$('#logPg').value || +o.page || 0; o.page = pg; o.lastRead = todayStr(); o.log = [...new Set([...(o.log || []), todayStr()])]; o.status = 1; if (o.pages && pg >= +o.pages) { o.status = 2; o.ed = todayStr(); toast(`Terminado! ${INT[t].done} em ${durTxt(dtJoin(o.sd, o.st), dtJoin(o.ed, o.et)) || '—'} 🎉`); } else toast('Leitura registada 📖'); intSave(t, all); openItem(t, id, false); render(); };
    if (!$('#intDlg').open) $('#intDlg').showModal(); return;
  }
  const gOpt = GENRES[t].map(g => `<option${g === x.genre ? ' selected' : ''}>${g}</option>`).join('');
  $('#intBody').innerHTML = `${ONLINE() && t !== 'viagens' && t !== 'colecoes' ? `<div class="srch"><input type="search" id="iQ" placeholder="🔎 Procurar ${t === 'livros' ? 'livro ou autor' : 'série'} na internet…"><div id="iRes"></div></div>` : ''}
    ${t === 'livros' || t === 'colecoes' ? `${t === 'livros' && x.notFound ? `<p class="hint">📕 Não encontrei o ISBN ${esc(x.isbn)} nas bases abertas. <b>Carrega em 📷 e tira uma foto à capa</b>: eu leio o título e o autor, tu só confirmas. Ou procura o código <a href="${googleLink(x.isbn)}" target="_blank" rel="noopener">no Google</a> / <a href="${wookLink(x.isbn)}" target="_blank" rel="noopener">na Wook</a>.</p>` : ''}<div class="cvrow"><div id="cvPrev">${x.cover ? `<img src="${esc(x.cover)}" alt="">` : '<span>📕</span>'}</div><div class="cvbtns"><button type="button" class="btn ${x.notFound ? 'main' : 'ghost'}" id="cvCam">📷 ${t === 'colecoes' ? 'Tirar foto' : 'Fotografar a capa'}</button><input type="file" id="cvFile" accept="image/*" hidden><input type="url" id="cvUrl" placeholder="ou cola o link da imagem da capa" value="${x.cover && !x.cover.startsWith('data:') ? esc(x.cover) : ''}"><button class="btn ghost" id="cvDel" type="button"${x.cover ? '' : ' hidden'}>Tirar capa</button></div></div><div id="ocrBox"></div>` : ''}
    <div class="form"><label>${t === 'viagens' ? 'Destino / nome da viagem' : 'Título'}<input type="text" id="iT" maxlength="80" value="${esc(x.title)}"></label>
    ${t === 'series' ? `<label>É</label><div class="seg2 kindsel"><button type="button" data-kind="serie"${x.kind !== 'filme' ? ' class="on"' : ''}>📺 Série</button><button type="button" data-kind="filme"${x.kind === 'filme' ? ' class="on"' : ''}>🎬 Filme</button></div>` : ''}
    <label>${C.by}<input type="text" id="iB" maxlength="60" value="${esc(x.by)}"></label>${t === 'series' ? `<div class="chips plats">${['Netflix', 'HBO Max', 'Disney+', 'Prime Video', 'Apple TV+', 'SkyShowtime', 'Filmin', 'RTP Play', 'SIC', 'TVI', 'Cinema', 'YouTube'].map(p => `<button type="button" class="qchip">${p}</button>`).join('')}</div><div class="two" id="sEp"${x.kind === 'filme' ? ' hidden' : ''}><label>Temporada<input type="number" id="iSe" min="1" max="99" inputmode="numeric" value="${x.season || ''}"></label><label>Episódio<input type="number" id="iEp" min="0" max="999" inputmode="numeric" value="${x.ep || ''}"></label></div>` : ''}${t === 'viagens' ? `<label>Cidade / lugar<input type="text" id="iP" maxlength="60" value="${esc(x.place || '')}"></label>` : ''}
    ${t === 'colecoes' ? `<div class="chips plats colb">${['LEGO', 'Funko', 'Playmobil', 'Hot Wheels', 'Pokémon', 'Vinil', 'Perfume', 'Relógio'].map(p => `<button type="button" class="qchip">${p}</button>`).join('')}</div><div class="two"><label>Nº / referência<input type="text" id="iRef" maxlength="30" value="${esc(x.ref || '')}" placeholder="Ex.: 42115"></label><label>Peças<input type="number" id="iPcs" min="0" max="99999" inputmode="numeric" value="${x.pcs || ''}"></label></div><label>Preço pago (€)<input type="text" id="iPr" inputmode="decimal" maxlength="10" value="${esc(x.price || '')}"></label><label>Código de barras (EAN)</label><div class="drow isbnrow"><input type="text" id="iIsbn" inputmode="numeric" maxlength="17" value="${esc(x.isbn || '')}" placeholder="Escreve ou lê com a câmara"><button type="button" class="btn" id="iIsbnScan" title="Ler com a câmara">📷</button></div>` : ''}
    ${t === 'livros' ? `<div class="two"><label>Nº de páginas<input type="number" id="iPg" min="1" max="5000" inputmode="numeric" value="${x.pages || ''}"></label><label>Página atual<input type="number" id="iCp" min="0" max="5000" inputmode="numeric" value="${x.page || ''}"></label></div>` : ''}
    ${t === 'livros' ? `<label>ISBN / código de barras</label><div class="drow isbnrow"><input type="text" id="iIsbn" inputmode="numeric" maxlength="17" value="${esc(x.isbn || '')}" placeholder="Escreve ou lê com a câmara"><button type="button" class="btn" id="iIsbnScan" title="Ler com a câmara">📷</button></div><button type="button" class="link" id="iIsbnLook" style="margin:4px 0 0">🔎 Preencher os dados a partir deste código</button>` : ''}
    <label>${t === 'viagens' ? 'Tipo' : 'Género'}<select id="iG"><option value="">—</option>${gOpt}</select></label>
    <label>Estado<select id="iS">${C.verb.map((v, i) => `<option value="${i}"${i === x.status ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>Avaliação</label><div class="rate">${[1, 2, 3, 4, 5].map(n => `<button data-r="${n}"${n <= x.rating ? ' class="on"' : ''}>★</button>`).join('')}</div>
    <div class="two"><label>Início<input type="date" id="iSD" value="${x.sd || ''}"></label><label>Hora<input type="time" id="iST" value="${x.st || ''}"></label></div>
    <div class="two"><label>Fim<input type="date" id="iED" value="${x.ed || ''}"></label><label>Hora<input type="time" id="iET" value="${x.et || ''}"></label></div>
    <label>Comentário<textarea id="iC" rows="3" maxlength="1000">${esc(x.comment || '')}</textarea></label>
    ${t === 'livros' || t === 'colecoes' ? (() => { SHT = t; const lk = t === 'colecoes' ? 'ceu_lastcolshelf' : 'ceu_lastshelf', S = SHELF.get(), pe = x.pos ? x.pos.e : +(store.get(lk) || '0').split(',')[0] || 0, pp = x.pos ? x.pos.p : +(store.get(lk) || '0,0').split(',')[1] || 0; return `<label>Lugar na estante</label><div class="two"><select id="iPE">${[...Array(S.e)].map((_, i) => `<option value="${i}"${i === pe ? ' selected' : ''}>${esc(S.names[i] || 'Estante ' + (i + 1))}</option>`).join('')}</select><select id="iPP">${[...Array(S.p)].map((_, i) => `<option value="${i}"${i === pp ? ' selected' : ''}>Prateleira ${i + 1}</option>`).join('')}</select></div>`; })() : ''}</div>`;
  let rating = x.rating || 0, cover = x.cover || '', tvm = x.tvmaze || null;
  const setCv = c => { cover = c || ''; if ($('#cvPrev')) { $('#cvPrev').innerHTML = cover ? `<img src="${esc(cover)}" alt="">` : '<span>📕</span>'; $('#cvDel').hidden = !cover; } };
  if ($('#cvCam')) $('#cvCam').onclick = async () => { const f = await frameCamera({ tip: 'Encaixa a capa do livro dentro da moldura' }); if (!f || typeof f === 'string') return; try { const dt = new DataTransfer(); dt.items.add(f); $('#cvFile').files = dt.files; } catch (e) { $('#cvFile').__f = f; } $('#cvFile').dispatchEvent(new Event('change')); };
  if ($('#cvFile')) { $('#cvFile').onchange = async e => { if (!e.target.files[0] && e.target.__f) { const ff = e.target.__f; e.target.__f = null; Object.defineProperty(e, 'target', { value: { files: [ff] } }); } const f = e.target.files[0]; if (!f) return; try { setCv(await photoToCover(f)); $('#cvUrl').value = ''; } catch (er) { toast('Não consegui ler a foto'); return; } if (t !== 'livros') { toast('Foto guardada 📸'); return; } if ($('#iT').value.trim()) { toast('Capa guardada 📕'); $('#ocrBox').innerHTML = `<button class="btn ghost" id="ocrGo" type="button">🔎 Ler título e autor desta capa</button>`; $('#ocrGo').onclick = () => readCover(f); } else readCover(f); };
    const readCover = async f => { const ob = $('#ocrBox'); if (!ONLINE()) { ob.innerHTML = '<p class="hint">Para ler a capa abre a app pelo endereço do GitHub, com internet.</p>'; return; } ob.innerHTML = '<p class="hint ocrw">🔎 A ler a capa… <small>(a primeira vez demora um bocadinho)</small></p>';
      try { const r = await ocrCover(f, (i, n) => { const s = ob.querySelector('.ocrw'); if (s) s.innerHTML = `🔎 A ler a capa (${i}/${n})… <small>(a primeira vez demora um bocadinho)</small>`; }); if (!r.title && !r.by && !r.words.length) { ob.innerHTML = '<p class="hint">Não consegui ler o texto da capa 😕 Tenta com mais luz e a capa direita, ou escreve à mão.</p>'; return; }
        if (r.title) $('#iT').value = r.title; if (r.by) $('#iB').value = r.by;
        ob.innerHTML = `<p class="hint">✍️ Li: <i>${esc(r.words.slice(0, 8).join(' '))}</i>. A procurar o livro…</p><div id="ocrRes"></div>`;
        let R = []; const got = await Promise.allSettled(r.queries.map(q => searchBooks(q))); got.forEach(g => g.status === 'fulfilled' && R.push(...g.value));
        const seen = new Set(); R = ocrRank(R.filter(b => { const k = nrm(b.title + '|' + b.by); if (seen.has(k)) return false; seen.add(k); return true; }), r.words).slice(0, 6);
        const top = R[0] && R[0].sc >= 2 ? R[0] : null;
        ob.querySelector('.hint').innerHTML = top ? `✨ Parece ser <b>${esc(top.title)}</b>${top.by ? ' de ' + esc(top.by) : ''}. Toca para confirmar, ou escolhe outro.` : `✍️ Li: <i>${esc(r.words.slice(0, 8).join(' '))}</i>. Confirma ou corrige o título e o autor.`;
        $('#ocrRes').innerHTML = (R.length ? `${R.map((b, i) => `<div class="sug${i === 0 && top ? ' best' : ''}" data-i="${i}">${b.cover ? `<img src="${b.cover}" alt="">` : '<span class="ph0">📚</span>'}<div><b>${esc(b.title)}</b><small>${esc(b.by)}${b.year ? ' · ' + b.year : ''}${b.pages ? ' · ' + b.pages + ' pág.' : ''}</small></div></div>`).join('')}` : '<p class="hint">Não encontrei nas bases abertas.</p>') + `<p class="hint"><a href="${googleLink(r.words.slice(0, 6).join(' '))}" target="_blank" rel="noopener">🔎 Procurar no Google</a>${$('#iIsbn') && $('#iIsbn').value.replace(/\D/g, '').length >= 10 ? ` · <a href="${wookLink($('#iIsbn').value.replace(/\D/g, ''))}" target="_blank" rel="noopener">Ver na Wook</a>` : ''}</p>`;
        $('#ocrRes').querySelectorAll('.sug').forEach(el => el.onclick = () => { const b = R[+el.dataset.i]; $('#iT').value = b.title; if (b.by) $('#iB').value = b.by; if (b.pages && $('#iPg') && !$('#iPg').value) $('#iPg').value = b.pages; if (!cover && b.cover) setCv(b.cover); $('#ocrRes').innerHTML = `<p class="hint">✓ ${esc(b.title)}</p>`; });
      } catch (er) { console.error(er); ob.innerHTML = `<p class="hint">${navigator.onLine === false ? 'Sem internet: liga os dados ou o Wi-Fi e tenta outra vez.' : 'O leitor de capas falhou neste telemóvel 😕 Tenta outra vez, ou escreve o título à mão.'}<br><small style="opacity:.6">Detalhe: ${esc(String(er && (er.message || er)).slice(0, 120))}</small></p><button class="btn ghost" id="ocrRetry" type="button">🔄 Tentar outra vez</button>`; $('#ocrRetry').onclick = async () => { await resetOcr(false); readCover(f); }; } }; $('#cvUrl').onchange = () => { const v = $('#cvUrl').value.trim(); if (/^https?:\/\//.test(v)) setCv(v); }; $('#cvDel').onclick = () => { setCv(''); $('#cvUrl').value = ''; }; }
  document.querySelectorAll('.rate button').forEach(b => b.onclick = () => { rating = +b.dataset.r === rating ? 0 : +b.dataset.r; document.querySelectorAll('.rate button').forEach(z => z.classList.toggle('on', +z.dataset.r <= rating)); });
  if ($('#iQ')) $('#iQ').oninput = () => { clearTimeout(openItem.t); const q = $('#iQ').value.trim(); if (q.length < 3) { $('#iRes').innerHTML = ''; return; } openItem.t = setTimeout(async () => { try { $('#iRes').innerHTML = '<p class="hint">A procurar…</p>'; const R = t === 'livros' ? await searchBooks(q) : await searchShows(q); $('#iRes').innerHTML = R.map((r, i) => `<div class="sug" data-i="${i}">${r.cover ? `<img src="${r.cover}" alt="">` : `<span class="ph0">${C.ic}</span>`}<div><b>${esc(r.title)}</b><small>${esc(r.by)}${r.year ? ' · ' + r.year : ''}</small></div></div>`).join('') || '<p class="hint">Sem resultados.</p>'; $('#iRes').querySelectorAll('.sug').forEach(el => el.onclick = () => { const r = R[+el.dataset.i]; $('#iT').value = r.title; $('#iB').value = r.by; cover = r.cover; if ($('#cvPrev')) setCv(r.cover); if (r.pages && $('#iPg') && !$('#iPg').value) $('#iPg').value = r.pages; tvm = r.tvmaze || null; $('#iRes').innerHTML = `<p class="hint">✓ ${esc(r.title)}</p>`; }); } catch (e) { $('#iRes').innerHTML = '<p class="hint">Sem ligação à internet.</p>'; } }, 450); };
  if ($('#iIsbnScan')) { $('#iIsbnScan').onclick = async () => { try { const c = await scanBarcode(); if (c) { $('#iIsbn').value = String(c).replace(/\D/g, ''); toast('Código lido ✓'); } } catch (e) { toast('Sem acesso à câmara'); } };
    if ($('#iIsbnLook')) $('#iIsbnLook').onclick = async () => { const c = $('#iIsbn').value.replace(/\D/g, ''); if (c.length < 10) { toast('Primeiro escreve ou lê o código'); return; } if (!ONLINE()) { toast('Precisa de internet'); return; } toast('A procurar…'); let b = null; try { b = await isbnLookup(c); } catch (e) { } if (!b) { toast('Não está nas bases abertas: preenche à mão ou fotografa a capa', 4000); return; } if (!$('#iT').value) $('#iT').value = b.title || ''; if (!$('#iB').value) $('#iB').value = b.by || ''; if (b.pages && $('#iPg') && !$('#iPg').value) $('#iPg').value = b.pages; if (b.cover && !cover) setCv(b.cover); toast('Dados preenchidos ✓'); }; }
  let kind = x.kind || 'serie'; document.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { kind = b.dataset.kind; document.querySelectorAll('[data-kind]').forEach(z => z.classList.toggle('on', z === b)); if ($('#sEp')) $('#sEp').hidden = kind === 'filme'; });
  document.querySelectorAll('.plats .qchip').forEach(b => b.onclick = () => { $('#iB').value = b.textContent; });
  $('#iS').onchange = () => { if ($('#iS').value === '2' && !$('#iED').value) $('#iED').value = todayStr(); };
  $('#intSave').textContent = 'Guardar'; $('#intDel').hidden = !id;
  $('#intSave').onclick = () => {
    const ti = $('#iT').value.trim(); if (!ti) { toast('Escreve o título'); return; }
    const npos = (t === 'livros' || t === 'colecoes') && $('#iPE') ? (() => { const e = +$('#iPE').value, p = +$('#iPP').value; store.set(t === 'colecoes' ? 'ceu_lastcolshelf' : 'ceu_lastshelf', e + ',' + p); return x.pos && x.pos.e === e && x.pos.p === p ? x.pos : { e, p, i: 1e6 }; })() : x.pos;
    const o = { pages: $('#iPg') ? $('#iPg').value : x.pages || '', page: $('#iCp') ? $('#iCp').value : x.page || '', lastRead: x.lastRead || '', log: x.log || [], pos: npos, isbn: $('#iIsbn') ? $('#iIsbn').value.replace(/[^\dXx]/g, '') : x.isbn || '', id: id || 'i' + Date.now().toString(36), title: ti, by: $('#iB').value.trim(), place: $('#iP') ? $('#iP').value.trim() : '', genre: $('#iG').value, status: +$('#iS').value, rating, sd: $('#iSD').value, st: $('#iST').value, ed: $('#iED').value, et: $('#iET').value, comment: $('#iC').value.trim(), cover, tvmaze: tvm, next: x.next || '', quotes: x.quotes || [], lent: x.lent, lentLog: x.lentLog, realized: x.realized, ts0: x.ts0 || x.ts || Date.now(), ...(t === 'colecoes' ? { ref: $('#iRef') ? $('#iRef').value.trim() : '', pcs: $('#iPcs') ? $('#iPcs').value : '', price: $('#iPr') ? $('#iPr').value.trim() : '' } : {}), ...(t === 'series' ? { kind, season: $('#iSe') ? $('#iSe').value : x.season || '', ep: $('#iEp') ? $('#iEp').value : x.ep || '', eplog: x.eplog || [] } : {}), ts: Date.now() };
    const all = intList(t), jx = id ? all.findIndex(z => z.id === id) : -1; if (jx >= 0) all[jx] = o; else all.push(o); intSave(t, all); $('#intDlg').close(); if (t === 'viagens' && o.status >= 1) dreamCheck(o); toast(o.status === 2 && o.ed ? `${C.done} em ${durTxt(dtJoin(o.sd, o.st), dtJoin(o.ed, o.et)) || '—'} 🎉` : 'Guardado'); render();
  };
  $('#intDel').onclick = () => { if (!confirmBox('Apagar?')) return; intSave(t, intList(t).filter(z => z.id !== id)); $('#intDlg').close(); render(); };
  if (!$('#intDlg').open) $('#intDlg').showModal();
}
function progH(x) {
  const last = [x.lastRead, ...(x.log || [])].filter(Boolean).sort().pop() || x.sd, pct = x.pages && x.page ? Math.min(100, Math.round(+x.page / +x.pages * 100)) : null, ds = daysSince(last);
  return `<div class="prog">${pct !== null ? `<i><b style="width:${pct}%"></b></i><small>Página ${x.page} de ${x.pages} · ${pct}%</small>` : ''}${ds !== null ? `<small class="${ds >= 7 ? 'late' : ''}">${x.status === 3 ? '⏸️ Em pausa · ' : ''}${ds === 0 ? 'Leste hoje ✨' : ds === 1 ? 'Leste ontem' : `Há ${ds} dias que não pegas neste livro`}</small>` : ''}</div>`;
}
function vBookStats() {
  const y = String(ST.statYear || todayStr().slice(0, 4)), B = bookStats(y), mx = Math.max(1, ...B.months), mn = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  let h = `<div class="agnav"><button class="arrow" id="syPrev">‹</button><b>${y}</b><button class="arrow" id="syNext">›</button></div>`;
  h += readShareBox(y);
  h += `<div class="box lvl"><div class="lv">${B.lvl[1]}</div><p><b>${B.yr.length}</b> livro${B.yr.length === 1 ? '' : 's'} lido${B.yr.length === 1 ? '' : 's'} em ${y}${B.next ? ` · faltam ${B.next[0] - B.yr.length} para «${B.next[1].replace(/^\S+ /, '')}»` : ''}</p>${B.streak > 1 ? `<p>🔥 ${B.streak} dias seguidos a ler!</p>` : ''}</div>`;
  h += `<div class="box"><h3>📅 Livros por mês</h3><div class="mbars">${B.months.map((v, k) => `<div><b>${v || ''}</b><i style="height:${v / mx * 100}%"></i><span>${mn[k]}</span></div>`).join('')}</div></div>`;
  h += `<div class="sgrid"><div><b>${B.pagesY.toLocaleString('pt-PT')}</b><span>páginas em ${y}</span></div><div><b>${(B.words / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} mil</b><span>palavras (estimativa)</span></div><div><b>${B.avgPages || '–'}</b><span>páginas por livro</span></div><div><b>${B.avgDays || '–'}</b><span>dias por livro</span></div><div><b>${B.speed || '–'}</b><span>páginas por dia</span></div><div><b>${B.avgR ? B.avgR.toFixed(1) + '★' : '–'}</b><span>nota média</span></div></div>`;
  h += `<div class="box">${B.topA ? `<p>✍️ Autor(a) preferido(a): <b>${esc(B.topA[0])}</b> (${B.topA[1].n} livro${B.topA[1].n > 1 ? 's' : ''})</p>` : ''}${B.topG ? `<p>🏷️ Género preferido: <b>${B.topG[0]}</b></p>` : ''}${B.fastest ? `<p>⚡ Mais rápido: <b>${esc(B.fastest.x.title)}</b> em ${B.fastest.d} dia${B.fastest.d > 1 ? 's' : ''}</p>` : ''}${B.longest ? `<p>🧱 Mais grosso: <b>${esc(B.longest.title)}</b> (${B.longest.pages} páginas)</p>` : ''}<p>📆 Dias com leitura registada: <b>${B.readDays}</b></p></div>`;
  if (B.reading.length || B.paused.length) h += `<div class="box"><h3>📖 Em curso</h3>${B.reading.concat(B.paused).map(x => `<div class="sug"><div><b>${esc(x.title)}</b>${progH(x)}</div></div>`).join('')}</div>`;
  if (B.quit.length) h += `<div class="box"><h3>🚪 Desisti (${B.quit.length})</h3><p>${B.quit.map(x => esc(x.title)).join(' · ')}</p><p class="note">Não faz mal: a vida é curta para livros que não nos agarram.</p></div>`;
  if (!B.done.length) h += '<p class="hint">Marca livros como «Lido», com datas e páginas, para veres aqui os teus números.</p>';
  return h;
}
function askOracle(q) {
  if (!q.trim()) return; const p = P.get(); ST.chat = (ST.chat || []).concat([{ who: 'me', txt: esc(q) }, { who: 'or', txt: oracle(q, p) }]).slice(-12);
  $('#chat').innerHTML = ST.chat.map(c => `<div class="msg ${c.who}">${c.txt}</div>`).join(''); $('#askQ').value = ''; $('#chat').lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function bindEu() {
  document.querySelectorAll('[data-ev]').forEach(b => b.onclick = () => { ST.euView = b.dataset.ev; render(); });
  if (ST.euView === 'diario') { bindDiario(); return; }
  if (ST.euView === 'int') { bindInteresses(); return; }
  if ($('#pSave')) { $('#pSave').onclick = () => { const d = $('#bDate').value; if (!d) { toast('Indica a data de nascimento'); return; } P.set({ name: $('#pName').value.trim(), d, t: $('#bTime').value, c: $('#bCity').value, favBook: $('#pFB').value.trim(), favShow: $('#pFS').value.trim(), favPlace: $('#pFP').value.trim(), dream: $('#pDT').value.trim() }); ST.editProfile = false; toast('Guardado neste telemóvel ✨'); render(); }; return; }
  $('#pEdit').onclick = () => { ST.editProfile = true; render(); };
  if ($('#monGo')) $('#monGo').onclick = () => openMonth(); if ($('#cnGo')) $('#cnGo').onclick = openChinese; bindTarot(); bindTarotNew(); bindMore(); bindFact(); bindEuChips(); bindRoutines(); document.querySelectorAll('[data-num]').forEach(b => b.onclick = () => openNum(b.dataset.num));
  const p = P.get(), si = sunSignOf(p.d);
  $('#myCard').onclick = () => { const kp = ST.pets; ST.pets = false; computeTop(); ST.pets = kp; openSheet(ST.rank.findIndex(r => r.si === si)); };
  if (false) $('#myPoster').onclick = () => { ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday({ name: p.name || 'Tu', rel: 'eu', d: p.d, showAge: true, from: '' }, false); };
  $('#askF').onsubmit = e => { e.preventDefault(); askOracle($('#askQ').value); };
  document.querySelectorAll('.oracle .qchip').forEach(b => b.onclick = () => askOracle(b.textContent));
  $('#petNew').onclick = () => openPet(0, true); bindKids(); bindCycle(); bindPreg();
  document.querySelectorAll('.pet:not(.kid)').forEach(el => el.onclick = () => { ST.petTab = 'hoje'; openPet(+el.dataset.k); });
}
function bindAnos() {
  document.querySelectorAll('.seg2 button').forEach(b => b.onclick = () => { ST.anosView = b.dataset.av; render(); });
  if (ST.anosView !== 'criar') { bindAgenda(); return; }
  $('#bdStyle').onchange = () => store.set('ceu_bdstyle', $('#bdStyle').value);
  $('#bdGo').onclick = () => showBday({ name: $('#bdName').value.trim(), rel: $('#bdRel').value, d: $('#bdDate').value, showAge: $('#bdAge').checked, from: $('#bdFrom').value.trim(), style: $('#bdStyle').value }, true);
  document.querySelectorAll('.bded').forEach(b => b.onclick = e => { e.stopPropagation(); ST.perTab = 'hoje'; openPersonSheet(+b.dataset.ix); });
  document.querySelectorAll('.li.bd').forEach(el => el.onclick = () => { const x = P.list('ceu_bdays').map(x => ({ ...x, dd: daysToBirthday(x.d) })).sort((a, b) => a.dd - b.dd)[+el.dataset.k]; $('#bdName').value = x.name; $('#bdRel').value = x.rel; $('#bdDate').value = x.d; showBday({ name: x.name, rel: x.rel, d: x.d, showAge: true, from: $('#bdFrom').value.trim() }, false); });
}

const VIEWS = { top: vTop, pares: vPares, lua: vLua, anos: vAnos, horas: vHoras, eu: vEu };

let _syncT = 0;
function render() {
  if (Date.now() - _syncT > 15000) { _syncT = Date.now(); setTimeout(() => { try { syncAlertData(); } catch (e) { } }, 1500); }
  syncAlertData();
  if (!TABS[ST.type].includes(ST.mode)) ST.mode = TABS[ST.type][0];
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === ST.type));
  document.querySelectorAll('#modes button').forEach(b => { b.hidden = !TABS[ST.type].includes(b.dataset.m); b.classList.toggle('on', b.dataset.m === ST.mode); });
  $('#modes').hidden = TABS[ST.type].length < 2;
  $('#datenav').hidden = ST.type === 'eu' || ST.type === 'anos' && false;
  $('#shareBtn').style.visibility = ST.type === 'eu' ? 'hidden' : 'visible';
  $('#who').hidden = ST.type !== 'top';
  document.querySelectorAll('#who button').forEach(b => b.classList.toggle('on', (b.dataset.w === 'a') === !!ST.pets));
  $('#when').textContent = ST.type === 'top' || ST.type === 'lua' ? periodLabel() : niceDate(ST.date);
  $('#view').innerHTML = VIEWS[ST.type]();
  if (ST.type === 'top') { document.querySelectorAll('.sc').forEach(a => a.onclick = () => openSheet(+a.dataset.i)); bindTodayStrip(); bindMig(); }
  if (ST.type === 'pares') { document.querySelectorAll('.pair,.li[data-a]').forEach(el => el.onclick = () => openPair(el.dataset.a, el.dataset.b)); const me2 = P.get(); document.querySelectorAll('.spk').forEach(b => b.onclick = () => { const side = b.dataset.side, cur = side === 'A' ? (ST.pkA ?? (me2 && me2.d ? sunSignOf(me2.d) : 0)) : (ST.pkB ?? 4); ST.nmA = $('#nmA').value; ST.nmB = $('#nmB').value; signPicker(cur, v => { if (side === 'A') ST.pkA = v; else ST.pkB = v; render(); }); }); $('#pkGo').onclick = () => { ST.nmA = $('#nmA').value.trim(); ST.nmB = $('#nmB').value.trim(); ST.pkA = ST.pkA ?? (me2 && me2.d ? sunSignOf(me2.d) : 0); ST.pkB = ST.pkB ?? 4; openPair(ST.pkA, ST.pkB, ST.nmA && ST.nmB ? [ST.nmA, ST.nmB] : null); }; }
  bindBanner();
  if (ST.type === 'lua') { document.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { ST.luaCat = b.dataset.cat; ST.mode = 'mes'; render(); }); if ($('#fertCalc')) $('#fertCalc').onclick = openFert; }
  if (ST.type === 'eu') bindEu();
  if (ST.type === 'anos') bindAnos();
}

// ---------- Cartão do signo ----------
function capOne(rd, i) {
  const v = verdict(rd);
  return [`${rd.sign.g} ${rd.sign.n.toUpperCase()} · ${topTitle()} · ${periodLabel()}`, `${i + 1}º lugar ${starStr(toStars(rd.overall))}`, '', `✨ ${rd.headline}`, `${{ bom: '✅', misto: '⚖️', cuidado: '⚠️' }[v.k]} ${v.txt}`, '',
    `❤️ Amor ${starStr(rd.stars.amor)}\n${rd.love}`, '', `💼 Trabalho ${starStr(rd.stars.trabalho)}\n${rd.work}`, '', `💰 Dinheiro ${starStr(rd.stars.dinheiro)}\n${rd.money}`, '', `⚡ Energia ${starStr(rd.stars.energia)}\n${rd.energy}`, '', `🔮 ${rd.advice}`,
    rd.mode === 'dia' ? `🍀 Sorte ${rd.lucky} · 🎨 ${PL[rd.fav].cor} · 🤝 ${SIGNS[rd.ally].n}` : `📆 ${rd.mode === 'ano' ? 'Melhor mês' : 'Melhor dia'}: ${rd.bestDay} · 🎨 ${PL[rd.fav].cor}`, '',
    `👉 Segue ${brand()} · marca alguém de ${rd.sign.n}!`, `#horoscopo #signos #${rd.sign.tag}`].join('\n');
}
function openSheet(i, title) {
  $('#sheet').classList.remove('nonav');
  SHEET = (i + 12) % 12; const rd = ST.rank[SHEET], v = verdict(rd); $('#sheet')._extra = null;
  const keep = ST.fmt; ST.fmt = 'feed'; const c = drawSign(rd, SHEET); ST.fmt = keep;
  $('#sheetTitle').textContent = title || `${SHEET + 1}º · ${rd.sign.n}${rd.pet ? ' 🐾' : ''}`;
  const sec = (ic, l, k, t) => `<section><h4>${ic} ${l} ${starsH(rd.stars[k])}</h4><p>${esc(t)}</p></section>`;
  $('#sheetBody').innerHTML = `<img class="card" src="${stampOnce(c).toDataURL('image/jpeg', .9)}" alt="Cartão de ${rd.sign.n}">
    <div class="det"><button class="link spkx" id="shSpk">🔊 Ouvir</button><div class="vd ${v.k}"><b>${v.icon}</b> ${esc(v.txt)}</div>
    ${AREAS4(rd).map(([l, k, t], j) => sec((rd.pet ? ['🥰', '🎾', '🍖', '🐾'] : ['❤️', '💼', '💰', '⚡'])[j], l, k, t)).join('')}
    <section><h4>🔮 Conselho</h4><p>${esc(rd.advice)}</p></section>${rd.pet ? '' : signExtras(rd)}
    ${rd.pet || rd.mode !== 'dia' ? '' : loveDoHtml(rd)}${rd.highlights && rd.highlights.length ? `<section><h4>📅 Em destaque</h4>${rd.highlights.map(x => `<p>${esc(x)}</p>`).join('')}</section>` : ''}</div>`;
  if ($('#shSpk')) $('#shSpk').onclick = e => speakText(`${rd.sign.n}. ${rd.headline}. No amor: ${firstSentence(rd.love)} No trabalho: ${firstSentence(rd.work)} No dinheiro: ${firstSentence(rd.money)} Conselho: ${rd.advice}`, e.currentTarget, '🔊 Ouvir');
  $('#sheetBody').scrollTop = 0; $('#sheet').dataset.canvas = '';
  $('#sheet')._canvas = c; $('#sheet')._cap = capOne(rd, SHEET); $('#sheet')._name = `${rd.sign.tag}-${ST.date}`;
  if (!$('#sheet').open) $('#sheet').showModal();
}

function openPair(a, b, names) {
  const D = pairDetail(+a, +b, ST.date), bar = (l, k) => `<div class="pbar"><span>${l}</span><i><b style="width:${D.areas[k]}%"></b></i><em>${D.areas[k]}%</em></div>`;
  const nd = d => { const [y, m, dd] = dParts(d); return `${DIAS[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()].toLowerCase().replace('-feira', '')}, ${dd}`; };
  const c = drawPairCard(D, 'feed');
  $('#sheetTitle').textContent = `${D.A.n} + ${D.B.n}`;
  $('#sheetBody').innerHTML = `<div class="phero"><div class="pg"><span style="color:${elc(D.A)}">${G(D.A.g)}</span><b>${D.today}%</b><span style="color:${elc(D.B)}">${G(D.B.g)}</span></div><p>${D.elLbl} · ${D.summary}</p><p class="ph">“${esc(D.el)}”</p></div>
    ${names && nameMatch(names[0], names[1]) ? nameMatchBox(nameMatch(names[0], names[1])) : ''}<div class="box"><h3>💞 Compatibilidade</h3>${bar('❤️ Amor', 'amor')}${bar('🤝 Amizade', 'amizade')}${bar('💼 Trabalho', 'trabalho')}${bar('🔥 Paixão', 'paixao')}${bar('💬 Comunicação', 'comunicacao')}</div>
    <div class="box ok"><h3>Pontos fortes</h3>${D.force.map(x => `<p>✓ ${x}</p>`).join('')}</div><div class="box no"><h3>Desafios</h3>${D.chal.map(x => `<p>! ${x}</p>`).join('')}</div>
    <div class="box"><h3>🌙 Hoje para os dois</h3>${D.sky.map(x => `<p>${esc(x)}</p>`).join('')}<p><b>💡 ${esc(D.advice)}</b></p></div>
    <div class="box"><h3>📅 Esta semana</h3><div class="wk">${D.week.map(([d, v]) => `<div${d === D.best[0] ? ' class="best"' : ''}><i style="height:${Math.max(8, v - 30)}%"></i><b>${v}</b><span>${nd(d).split(',')[0].slice(0, 3)}</span></div>`).join('')}</div><p>Melhor dia para os dois: <b>${nd(D.best[0])}</b> (${D.best[1]}%).</p></div>
    <div class="box"><h3>🪐 Ritmo e regentes</h3><p>${esc(D.mod)}</p><p>${esc(D.rel)}</p></div>
    <img class="card" src="${stampOnce(c).toDataURL('image/jpeg', .9)}" alt="Cartão do par">`;
  $('#sheet')._canvas = c; $('#sheet')._cap = capPair(D); $('#sheet')._name = `par-${D.A.tag}-${D.B.tag}`; $('#sheet')._extra = null;
  const NM = names ? nameMatch(names[0], names[1]) : null; if (NM) { $('#sheetTitle').textContent = `${NM.fa} + ${NM.fb}`; drawNameMatch(NM, D).then(nc => { $('#sheet')._extra = [{ name: 'nomes', c: nc }]; $('#sheet')._cap = `🔤 ${NM.fa} + ${NM.fb}: ${NM.pct}% pelos nomes · ${D.A.n} + ${D.B.n}: ${D.today}% pelos signos 💞\n\n` + capPair(D); const im = document.createElement('img'); im.className = 'card'; im.src = nc.toDataURL('image/jpeg', .9); const bx = $('#sheetBody .nmatch'); if (bx) bx.after(im); }); }
  $('#sheet').classList.add('nonav'); $('#sheetBody').scrollTop = 0;
  if (!$('#sheet').open) $('#sheet').showModal();
}

// ---------- Partilhar ----------
const SHARE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
async function shareCanvases(list, cap) {
  copySync(cap); ST.cap = cap;
  const files = await Promise.all(list.map(async x => new File([await blobOf(x.c)], `${x.name}.jpg`, { type: 'image/jpeg' })));
  try { if (navigator.canShare && navigator.canShare({ files })) { const withTxt = cap && navigator.canShare({ files, text: cap }); await navigator.share(withTxt ? { files, text: cap } : { files }); toast(withTxt ? 'Se o texto não aparecer, está copiado: cola-o 📋' : 'Texto copiado: cola-o na publicação'); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  // sem partilha nativa: mostrar as imagens para guardar
  ST.canvases = list;
  $('#imgsBody').innerHTML = list.map((x, i) => `<figure><img src="${stampOnce(x.c).toDataURL('image/jpeg', .9)}" alt=""><button class="btn" data-k="${i}">Guardar</button></figure>`).join('');
  $('#imgsBody').querySelectorAll('button').forEach(b => b.onclick = async () => { const x = list[+b.dataset.k]; await saveBlob(await blobOf(x.c), x.name + '.jpg'); });
  $('#imgs').showModal(); toast('Texto copiado');
}
async function shareCurrent() {
  const btn = $('#shareBtn'); btn.disabled = true;
  try { if (ST.type === 'anos' && ST.bd) { await shareCanvases([{ name: 'parabens', c: bdDraw(ST.bd, ST.fmt === 'story' ? 'story' : 'feed') }], bdCap(ST.bd)); return; } const { cs, cap } = buildPost(ST.type); await shareCanvases(cs, cap); } finally { btn.disabled = false; }
}

// ---------- Janela de aniversários ----------
function showTodayDlg(force) {
  const key = 'ceu_seen_' + todayStr(), T = bdaysOn(0), M = bdaysOn(1), CD = careDue(3), YN = yearNudge(), AD = adoptToday(), CYA = cycleAlerts(), MN = +todayStr().slice(8) <= 3 && !store.get('ceu_monseen_' + todayStr().slice(0, 7)), TAR = P.get() && !tarOpened(), sig = `${T.length + M.length}|${CD.length}|${YN ? 1 : 0}|${AD.length}|${CYA.length}|${MN ? 1 : 0}|${TAR ? 1 : 0}`;
  if (!T.length && !M.length && !CD.length && !YN && !AD.length && !CYA.length && !MN && !TAR) return false;
  if (!force && store.get(key) === sig) return false;
  const card = (x, tom) => { const si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), age = ageOn(x.d, dayStr(noonJd(todayStr()) + (tom ? 1 : 0))), em = x.kind === 'a' ? spOf(P.list('ceu_pets')[x.k] || {})[1] : x.kind === 'me' ? '🥳' : relIcon(x);
    return `<div class="tcard${tom ? ' tom' : ''}" style="--c:${elc(SIGNS[si])}"><span class="av">${esc(em)}</span><div class="who"><b>${esc(x.kind === 'me' ? 'Tu!' : x.name)}</b><small>${esc(x.kind === 'me' ? 'O teu dia' : relLabel(x))} · ${age > 0 ? (tom ? 'faz ' : 'faz ') + age + (age === 1 ? ' ano' : ' anos') : ''} · ${G(SIGNS[si].g)} ${SIGNS[si].n}</small></div>
      ${tom ? '' : `<div class="tacts"><button class="btn main" data-a="c">🎉 Cartaz</button><button class="btn" data-a="v">🎬 Vídeo</button>${x.kind === 'me' ? '' : `<a class="btn" href="${waLink(x)}" target="_blank" rel="noopener">💬 WhatsApp</a>`}</div>`}</div>`; };
  $('#todayBody').innerHTML = (T.length ? `<div class="tbig">🎂</div><h2>Hoje é dia de festa!</h2>${T.map(x => card(x, false)).join('')}` : '') + (M.length ? `<h3 class="tmh">⏰ Amanhã faz${M.length > 1 ? 'em' : ''} anos</h3>${M.map(x => card(x, true)).join('')}` : '');
  if (TAR) { const f = factToday(); $('#todayBody').innerHTML = `<div class="ttar"><div class="tcd back" id="tdTar">${deckSVG(0, { back: true })}<span class="tsh"></span>${SPARK(4)}</div><div><small>✨ ${niceDate(todayStr())}</small><b>A tua carta de hoje está virada para baixo</b><button class="btn main" id="tdTarGo">🃏 Revelar</button></div></div>` + $('#todayBody').innerHTML + (f ? `<div class="tfact"><b>🧠 Sabias que… ${esc(f[1])}?</b><p>${esc(f[2])}</p></div>` : ''); }
  if (MN) { const [yy, mm] = todayStr().split('-').map(Number), pm = MESES[(mm + 10) % 12]; $('#todayBody').innerHTML += `<div class="tcard ynudge"><span class="av">📊</span><div class="who"><b>O teu ${pm} está pronto</b><small>Livros, séries, momentos e humor do mês.</small></div><div class="tacts"><button class="btn main" id="monTd">Ver</button></div></div>`; store.set('ceu_monseen_' + todayStr().slice(0, 7), '1'); }
  if (CYA.length) $('#todayBody').innerHTML += `<h3 class="tmh">${CY.get().preg ? '🤰 A tua gravidez' : '🌸 O teu ciclo'}</h3>${CYA.map(a => `<div class="tcard care1"><span class="av">${a.ic}</span><div class="who"><b>${a.t}</b><small>${a.s}</small></div></div>`).join('')}`;
  if (AD.length) $('#todayBody').innerHTML += `<h3 class="tmh">🏡 Dia de adoção</h3>${AD.map((o, j) => `<div class="tcard care1"><span class="av">${spOf(o.a)[1]}</span><div class="who"><b>Faz ${o.yrs} ano${o.yrs > 1 ? 's' : ''} que ${esc(o.a.name)} chegou a casa!</b><small>Dia de festa 🐾</small></div><div class="tacts"><button class="btn main" data-adp="${j}">🎉 Cartaz</button></div></div>`).join('')}`;
  if (CD.length) $('#todayBody').innerHTML += `<h3 class="tmh">🐾 Cuidados dos patudos</h3>${CD.map((c, j) => `<div class="tcard care1"><span class="av">${CARE_T[c.k][0]}</span><div class="who"><b>${CARE_T[c.k][1]} ${spOf(c.a)[0] === 'gata' ? 'da' : 'do'} ${esc(c.a.name)}</b><small>${cap1(dueTxt(c.dd))} · ${niceDate(c.n).replace(/-feira/, '')}</small></div><div class="tacts"><button class="btn main" data-cd="${j}" data-a="done">✅ Feito</button><button class="btn" data-cd="${j}" data-a="open">Abrir</button></div></div>`).join('')}`;
  if (YN) $('#todayBody').innerHTML += `<div class="tcard ynudge"><span class="av">📖</span><div class="who"><b>O teu livro de ${anoYear()} já pode ser escrito ✨</b><small>10 perguntas e a app junta o teu ano todo num mini-livro.</small></div><div class="tacts"><button class="btn main" id="ynGo">Criar agora</button></div></div>`;
  $('#todayBody').querySelectorAll('[data-cd]').forEach(b => b.onclick = () => { const c = CD[+b.dataset.cd]; if (b.dataset.a === 'open') { $('#todayDlg').close(); ST.petTab = 'cad'; openPet(c.i, false, false); return; } const l = P.list('ceu_pets'); l[c.i].care = petCare(l[c.i]).concat({ id: 'c' + Date.now().toString(36), k: c.k, d: todayStr(), note: '', next: dayStr(noonJd(todayStr()) + CARE_T[c.k][2]) }); P.setList('ceu_pets', l); b.closest('.tcard').remove(); toast('Registado 🐾'); });
  $('#todayBody').querySelectorAll('[data-adp]').forEach(b => b.onclick = async () => { const o = AD[+b.dataset.adp]; await shareCanvases([{ name: 'adocao', c: await drawAdopt(o.a) }], `🏡 Faz ${o.yrs} ano${o.yrs > 1 ? 's' : ''} que ${o.a.name} chegou a casa! 🐾\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); });
  ['#tdTar', '#tdTarGo'].forEach(id => { if ($(id)) $(id).onclick = () => { $('#todayDlg').close(); openTarot(true); }; });
  if ($('#monTd')) $('#monTd').onclick = () => { $('#todayDlg').close(); openMonth(); };
  if ($('#ynGo')) $('#ynGo').onclick = () => { store.set('ceu_ynudge_' + anoYear(), '1'); $('#todayDlg').close(); ST.type = 'eu'; ST.euView = 'me'; render(); openAno(); };
  if (YN) store.set('ceu_ynudge_' + anoYear(), '1');
  const from = ((P.get() || {}).name || '').split(' ')[0];
  $('#todayBody').querySelectorAll('.tcard:not(.tom):not(.care1):not(.ynudge)').forEach((el, i) => {
    const x = T[i], o = { name: x.kind === 'me' ? (x.name || 'Tu') : x.name, rel: x.rel, d: x.d, t: x.t, showAge: true, from: x.kind === 'me' ? '' : from };
    el.querySelector('[data-a=c]').onclick = () => { $('#todayDlg').close(); ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday(o, false); };
    el.querySelector('[data-a=v]').onclick = () => { $('#todayDlg').close(); ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday(o, false); setTimeout(() => $('#bdVideo') && $('#bdVideo').click(), 300); };
  });
  $('#todayDlg').onclose = () => store.set(key, sig);
  $('#todayDlg').showModal(); return true;
}

function applyTheme() { const t = store.get('ceu_theme') || 'astral'; document.documentElement.dataset.theme = t; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = { astral: '#06061a', branco: '#f7f7fb', pink: '#fff0f5', menta: '#effaf5' }[t] || '#06061a'; }

// ---------- Init ----------
async function init() {
  $('#appVer').textContent = 'Versão ' + APP_VERSION;
  $('#shareBtn').innerHTML = SHARE_SVG; $('#sheetShare').innerHTML = SHARE_SVG + '<span>Partilhar</span>';
  $('#brand').value = ST.brand; $('#fmt').value = ST.fmt; $('#modern').checked = ST.modern; $('#skyOn').checked = ST.sky;
  const opts = CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join(''); $('#cityHours').innerHTML = opts; $('#cityHours').value = ST.city;
  $('#brand').oninput = e => { ST.brand = e.target.value.trim(); store.set('ceu_brand', ST.brand); };
  $('#fmt').onchange = e => { ST.fmt = e.target.value; store.set('ceu_fmt', ST.fmt); };
  $('#modern').onchange = e => { ST.modern = e.target.checked; store.set('ceu_modern', ST.modern ? '1' : '0'); render(); };
  $('#skyOn').onchange = e => { ST.sky = e.target.checked; store.set('ceu_sky', ST.sky ? '1' : '0'); };
  $('#cityHours').onchange = e => { ST.city = +e.target.value; store.set('ceu_city', ST.city); render(); };
  $('#prev').onclick = () => { ST.date = shiftDate(ST.date, -1, ST.type === 'top' || ST.type === 'lua' ? ST.mode : 'dia'); render(); };
  $('#next').onclick = () => { ST.date = shiftDate(ST.date, 1, ST.type === 'top' || ST.type === 'lua' ? ST.mode : 'dia'); render(); };
  $('#when').onclick = () => { ST.date = todayStr(); render(); };
  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { ST.type = b.dataset.t; render(); window.scrollTo({ top: 0 }); });
  document.querySelectorAll('#modes button').forEach(b => b.onclick = () => { ST.mode = b.dataset.m; render(); });
  $('#shareBtn').onclick = shareCurrent;
  const pinUi = () => { $('#pinState').textContent = hasPin() ? '🔒 PIN ativo' : 'Sem PIN'; $('#pinDel').hidden = !hasPin(); };
  pinUi();
  $('#pinSet').onclick = async () => { const v = $('#pinNew').value.trim(); if (!/^\d{4,6}$/.test(v)) { toast('O PIN tem de ter 4 a 6 números'); return; } await setPin(v); store.set('ceu_pinlen', String(v.length)); $('#pinNew').value = ''; pinUi(); toast('PIN guardado 🔒'); };
  $('#pinDel').onclick = async () => { await setPin(''); pinUi(); toast('PIN removido'); };
  $('#themeSel').value = store.get('ceu_theme') || 'astral';
  $('#themeSel').onchange = e => { store.set('ceu_theme', e.target.value); applyTheme(); };
  ST.pets = store.get('ceu_pets_mode') === '1';
  document.querySelectorAll('#who button').forEach(b => b.onclick = () => { ST.pets = b.dataset.w === 'a'; store.set('ceu_pets_mode', ST.pets ? '1' : '0'); render(); });
  document.querySelectorAll('.installBtn').forEach(b => { b.onclick = doInstall; b.hidden = isStandalone(); });
  $('#installHelp').innerHTML = isIOS() ? '<p><b>iPhone:</b> abre no Safari ou no Chrome, toca em <b>Partilhar</b> (□↑) e escolhe <b>«Adicionar ao ecrã principal»</b>.</p>' : '<p><b>Android (Chrome):</b> toca nos <b>⋮</b> em cima à direita e escolhe <b>«Instalar app»</b> ou <b>«Adicionar ao ecrã principal»</b>.</p>';
  if (!isStandalone() && !store.get('ceu_inst_hide')) { $('#instBanner').hidden = false; $('#instClose').onclick = () => { $('#instBanner').hidden = true; store.set('ceu_inst_hide', '1'); }; $('#instGo').onclick = doInstall; }
  $('#sheetShare').onclick = () => shareCanvases(($('#sheet')._extra || []).concat([{ name: $('#sheet')._name, c: $('#sheet')._canvas }]), $('#sheet')._cap);
  $('#sheetPrev').onclick = () => openSheet(SHEET - 1); $('#sheetNext').onclick = () => openSheet(SHEET + 1);
  let tx = null; $('#sheetBody').addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  $('#sheetBody').addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 70) openSheet(SHEET + (dx < 0 ? 1 : -1)); tx = null; });
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { b.closest('dialog') && b.closest('dialog').close(); $('#' + b.dataset.open).showModal(); });
  document.querySelectorAll('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  document.querySelectorAll('#pack button').forEach(b => b.onclick = () => savePack(+b.dataset.n));
  document.querySelectorAll('[data-open="menu"]').forEach(b => b.addEventListener('click', () => setTimeout(() => { bindBackupMenu(); voiceMenu(); if ($('#pushMenu')) { $('#pushMenu').innerHTML = pushBox(); bindPushBox(); } }, 0)));
  $('#reel').onclick = () => { $('#menu').close(); ST.type = 'top'; render(); makeReel(); };
  $('#studioBtn').onclick = () => { $('#menu').close(); openStudio(); }; $('#tourBtn').onclick = () => { $('#menu').close(); maybeTour(true); }; $('#testAl').onclick = testAlert;
  $('#copyCap').onclick = () => { const { cap } = buildPost(ST.type === 'eu' ? 'top' : ST.type); ST.cap = cap; copyCap(); };
  applyTheme();
  if (hasPin()) await lockScreen();
  ST.date = todayStr();
  if (/aniversarios/.test(location.search + location.hash)) { ST.type = 'anos'; ST.anosView = 'agenda'; }
  const qs = location.search; if (/[?&]alma($|&)/.test(qs)) setTimeout(openSoul, 600); if (/carta/.test(qs)) setTimeout(() => openTarot(!tarOpened()), 600); if (/[?&]semana($|&)/.test(qs)) setTimeout(() => openTarot(!store.get('ceu_tarw_' + mondayOf(todayStr())), true), 600); if (/asemana/.test(qs)) setTimeout(openWeekView, 600); if (/semana-lua/.test(qs)) { ST.type = 'eu'; ST.euView = 'me'; setTimeout(() => { const n = document.querySelector('#sec-rout'); n && n.scrollIntoView({ block: 'start' }); }, 700); } if (/posts/.test(qs)) setTimeout(() => openStudio(), 600); if (/noite/.test(qs)) setTimeout(openNight, 600); if (/wrapped/.test(qs)) setTimeout(() => openWrapped(), 600); if (/ciclo|resumo|livro|patudos/.test(qs)) { ST.type = 'eu'; ST.euView = 'me'; setTimeout(() => { if (/ciclo/.test(qs)) (CY.get().preg ? openPreg() : openCycle()); else if (/resumo/.test(qs)) openMonth(); else if (/livro/.test(qs)) openAno(); }, 700); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') return; const t = todayStr(); if (ST._day && ST._day !== t) { if (ST.date === ST._day) ST.date = t; ST._day = t; render(); setTimeout(() => showTodayDlg(false), 400); } });
  ST._day = todayStr(); setTimeout(() => pushSync(false), 4000); try { if (navigator.storage && navigator.storage.persist && hasPersonalData()) navigator.storage.persist(); } catch (e) { }
  render();
  if (/^#mig=/.test(location.hash)) setTimeout(checkMigLink, 300); else if (/#add=/.test(location.hash)) setTimeout(checkAddLink, 400); else if (/#casal=/.test(location.hash)) checkCoupleLink(); else if (/^#alma=/.test(location.hash)) checkSoulLink(); else if (!isOldHost()) setTimeout(() => { if (!showTodayDlg(false)) maybeTour(); }, 600);
  setTimeout(() => { try { if (alertState() === 'granted' && navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('check-bdays'); } catch (e) { } }, 1500);
  try { await Promise.race([Promise.all(['700 40px Cinzel', 'italic 600 40px "Cormorant Garamond"', '500 20px Manrope', '600 20px Manrope', '700 20px Manrope', '800 20px Manrope'].map(f => document.fonts.load(f)).concat([document.fonts.load('40px "Noto Sans Symbols"', '♈♉♊♋♌♍♎♏♐♑♒♓☉☽☿♀♂♃♄'), document.fonts.load('40px "Noto Sans Symbols 2"', '♅♆♇★✂✓✕')])), new Promise(r => setTimeout(r, 3000))]); } catch (e) { }
  if (/github\.io$|(^|\.)ceudehoje\.com$|\.pages\.dev$|^localhost$/.test(location.hostname) && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => { r.update(); setInterval(() => r.update(), 30 * 60 * 1000); }).catch(() => { });
    let reloaded = false; const hadCtl = !!navigator.serviceWorker.controller; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || !hadCtl) return; const busy = () => !!document.querySelector('dialog[open]') || /INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || ''); const go = () => { if (!reloaded) { reloaded = true; location.reload(); } }; if (!busy()) go(); else { toast('✨ Há uma versão nova: atualiza quando acabares (ou fecha e abre a app).', 6000); const iv = setInterval(() => { if (!busy() && document.visibilityState === 'hidden') { clearInterval(iv); go(); } }, 4000); } });
  }
}
init();
