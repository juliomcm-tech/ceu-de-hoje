// ===== Família (filhos) e amuletos dos signos =====
const KID_SIGN = [
  { c: 'Corajoso(a), rápido(a) e cheio(a) de energia. Quer ser o primeiro em tudo.', t: 'desporto, liderança, iniciativa', m: 'desafios e corridas: «aposto que não consegues…»', b: 'As birras são curtas e explosivas: dá-lhe espaço para arrefecer e depois fala. Gastar energia antes evita muitas.', s: 'Precisa de correr durante o dia para dormir bem à noite.' },
  { c: 'Calmo(a), meigo(a) e de rotinas. Adora conforto, colo e comida boa.', t: 'música, culinária, trabalhos manuais', m: 'recompensas concretas e rotinas previsíveis', b: 'Teimosia é o ponto fraco: não forces, dá duas opções e deixa escolher. Mudanças de surpresa custam-lhe.', s: 'Ritual da noite sempre igual: banho, história, mantinha.' },
  { c: 'Curioso(a), falador(a) e esperto(a). Pergunta «porquê?» mil vezes por dia.', t: 'línguas, leitura, comunicação', m: 'novidades, jogos de palavras, conversas', b: 'Aborrece-se depressa e aí porta-se mal: muda de atividade antes do tédio chegar.', s: 'A cabeça não pára: uma história calma ajuda a desligar.' },
  { c: 'Sensível, carinhoso(a) e muito ligado(a) à família. Sente tudo a dobrar.', t: 'artes, cuidar dos outros, imaginação', m: 'segurança, mimos e elogios sinceros', b: 'Quando se fecha, não é birra, é mágoa: abraço primeiro, conversa depois.', s: 'Gosta de um peluche ou de luz de presença: sentir-se protegido(a).' },
  { c: 'Alegre, criativo(a) e com jeito para palco. Adora atenção e aplausos.', t: 'teatro, dança, desenho', m: 'elogios ao esforço e um «palco» para brilhar', b: 'Se sente que não é visto(a), faz-se ver da pior maneira: dá-lhe atenção pelos bons motivos.', s: 'Dorme melhor depois de um momento só de vocês os dois.' },
  { c: 'Atento(a), organizado(a) e prestável. Repara em todos os pormenores.', t: 'ciências, puzzles, organização', m: 'tarefas com sentido e saber que ajudou', b: 'Exige muito de si: as birras vêm da frustração. Mostra que errar faz parte.', s: 'Quarto arrumado e rotina certa acalmam-lhe a cabeça.' },
  { c: 'Simpático(a), diplomata e amigo(a) de todos. Detesta conflitos e injustiças.', t: 'música, arte, trabalho em equipa', m: 'brincar com outros e ambientes bonitos', b: 'Indecisão gera birras: limita as escolhas a duas. Gritar em casa afeta-o(a) muito.', s: 'Ambiente calmo e música suave antes de dormir.' },
  { c: 'Intenso(a), observador(a) e leal. Guarda o que sente e tem uma vontade de ferro.', t: 'mistérios, ciência, investigação', m: 'confiança, segredos partilhados e verdade', b: 'Nunca mintas: perde a confiança. Nas birras, firmeza calma resulta melhor do que castigos.', s: 'Precisa de privacidade e de se sentir seguro(a) no seu canto.' },
  { c: 'Aventureiro(a), divertido(a) e otimista. Sempre pronto(a) para explorar.', t: 'viagens, desporto, aprender coisas novas', m: 'liberdade, natureza e histórias de outros sítios', b: 'Detesta sentir-se preso(a): explica o porquê das regras em vez de só as impor.', s: 'Ar livre durante o dia é o melhor remédio para o sono.' },
  { c: 'Responsável, maduro(a) para a idade e determinado(a). Gosta de conquistas.', t: 'construções, estratégia, metas', m: 'objetivos claros e reconhecimento do esforço', b: 'Leva tudo a sério: brinca com ele(a) e lembra-o(a) de que também é para ser criança.', s: 'Horários fixos dão-lhe tranquilidade.' },
  { c: 'Original, independente e cheio(a) de ideias fora da caixa.', t: 'tecnologia, invenções, causas', m: 'liberdade para criar e ser diferente', b: 'Faz o contrário se for obrigado(a): envolve-o(a) nas decisões e nas regras da casa.', s: 'Menos ecrãs à noite: a cabeça acelera.' },
  { c: 'Sonhador(a), sensível e muito imaginativo(a). Tem um coração enorme.', t: 'música, desenho, histórias', m: 'fantasia, carinho e brincadeiras criativas', b: 'Absorve as emoções da casa: quando está difícil, olha também para o ambiente à volta.', s: 'Histórias, música calma e água (banho morno) fazem milagres.' }];
const KID_MOON = { fogo: '🔥 Lua em signo de fogo: muita energia, gastem-na lá fora.', terra: '🌱 Lua em signo de terra: as rotinas acalmam, bom dia para arrumar e cozinhar juntos.', ar: '💨 Lua em signo de ar: curiosidade e conversa, bom para aprender e brincar com amigos.', agua: '🌊 Lua em signo de água: mais sensibilidade, mimos e paciência extra.' };
const gz = (t, rel) => String(t).replace(/(\p{L}+)\(a\)/gu, (m, w) => rel === 'filha' ? (/^o$/i.test(w) ? 'a' : /[oe]$/.test(w) ? w.slice(0, -1) + 'a' : w + 'a') : w);
const isKid = x => x.rel === 'filho' || x.rel === 'filha';
const kids = () => P.list('ceu_bdays').map((x, k) => ({ ...x, k })).filter(isKid);
const partner = () => P.list('ceu_bdays').find(x => ['marido', 'mulher', 'namorado', 'namorada'].includes(x.rel) && x.d);
function nameNum(n) { const s = nrm(n).replace(/[^a-z]/g, ''); if (!s) return 0; return redNum([...s].reduce((a, c) => a + ((c.charCodeAt(0) - 97) % 9) + 1, 0)); }
function kidSign(x) { return x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d); }
function bond(aS, bS) { const k = Math.min((aS - bS + 12) % 12, (bS - aS + 12) % 12); return { pct: Math.min(99, PAIR_BASE[k] + 6), k }; }
const BOND_TIP = { 0: 'São parecidos: entendem-se à primeira, mas cuidado para não chocarem nos mesmos defeitos.', 1: 'Signos vizinhos: aprendem muito um com o outro.', 2: 'Ligação leve e divertida: brincar juntos é o vosso superpoder.', 3: 'Ritmos diferentes: paciência e humor resolvem quase tudo.', 4: 'Sintonia natural: o mesmo elemento, o mesmo ritmo.', 5: 'Mundos diferentes: descobre o que o(a) entusiasma e entra no jogo.', 6: 'Opostos que se completam: o que te falta, ele(a) tem, e vice-versa.' };
function kidsBox() {
  const K = kids();
  return `<div class="box kids"><h3>👨‍👩‍👧 Os meus filhos</h3>${K.map(x => { const si = kidSign(x), age = ageOn(x.d); return `<div class="pet kid" data-kid="${x.k}"><span class="em">${x.rel === 'filha' ? '👧' : '👦'}</span><div><b>${esc(x.name)}</b><small>${G(SIGNS[si].g)} ${SIGNS[si].n} · ${age > 0 ? age + (age === 1 ? ' ano' : ' anos') : 'bebé'}</small></div><i>›</i></div>`; }).join('') || '<p class="note">Junta os teus filhos e descobre como é cada um pelo signo, como lidar no dia a dia e a vossa ligação.</p>'}<button class="btn" id="kidNew" style="width:100%;margin-top:6px">＋ Juntar filho ou filha</button></div>`;
}
function kidForm(k, preset, onSaved) {
  const x = k != null ? P.list('ceu_bdays')[k] : { name: '', rel: 'filha', d: '', t: '', c: (P.get() || {}).c || 0, par: null, ...(preset || {}) };
  $('#infoTitle').textContent = k != null ? '✏️ ' + x.name : '👶 Juntar filho ou filha';
  $('#infoBody').innerHTML = `<div class="form"><label>Nome<input type="text" id="kName" maxlength="24" value="${esc(x.name)}"></label><label>É<select id="kRel"><option value="filha"${x.rel === 'filha' ? ' selected' : ''}>Filha</option><option value="filho"${x.rel === 'filho' ? ' selected' : ''}>Filho</option></select></label><div class="two"><label>Data de nascimento<input type="date" id="kD" max="${todayStr()}" value="${x.d}"></label><label>Hora (opcional)<input type="time" id="kT" value="${x.t || ''}"></label></div><label>Onde nasceu<select id="kC">${CITIES.map((c, i) => `<option value="${i}"${+(x.c || 0) === i ? ' selected' : ''}>${c[0]}</option>`).join('')}</select></label>
    <details class="kpar"${x.par ? ' open' : ''}><summary>👤 O outro pai/mãe (opcional)</summary><p class="note">Só se não estiver na tua agenda: serve para mostrar também a ligação dele(a) com a criança.</p><div class="two"><label>Nome<input type="text" id="kPN" maxlength="24" value="${esc(x.par ? x.par.name : '')}"></label><label>Nascimento<input type="date" id="kPD" value="${x.par ? x.par.d : ''}"></label></div></details>
    <button class="btn main" id="kSave">Guardar</button>${k != null ? '<button class="btn" id="kDel">🗑️ Apagar</button>' : ''}<p class="note">Fica também na agenda de aniversários, com aviso no dia.</p></div>`;
  $('#kSave').onclick = () => { const n = $('#kName').value.trim(), d = $('#kD').value; if (!n || !d) { toast('Nome e data'); return; } const L = P.list('ceu_bdays'), o = { ...(k != null ? L[k] : {}), name: n, rel: $('#kRel').value, d, t: $('#kT').value, c: +$('#kC').value, par: $('#kPD').value ? { name: $('#kPN').value.trim(), d: $('#kPD').value } : null }; if (k != null) L[k] = o; else L.push(o); P.setList('ceu_bdays', L); try { syncAlertData(); } catch (e) { } toast('Guardado 💛'); if (onSaved) onSaved(o); render(); if (k != null) openKid(k); else $('#infoDlg').close(); };
  if ($('#kDel')) $('#kDel').onclick = () => { if (!confirmBox('Apagar ' + x.name + '?')) return; const L = P.list('ceu_bdays'); L.splice(k, 1); P.setList('ceu_bdays', L); $('#infoDlg').close(); render(); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
const MOON_KID = { fogo: 'precisa de se sentir admirado(a) e de espaço para mexer; zanga-se depressa e esquece depressa', terra: 'precisa de rotina, comida a horas e mimo físico; quando está triste fica calado(a) e quer colo', ar: 'precisa de falar sobre o que sente e de companhia; sai da tristeza com conversa e brincadeira', agua: 'sente tudo muito: precisa de abraços, segurança e de não ser apressado(a)' };
const ASC_KID = { fogo: 'chega aos sítios cheio(a) de energia e faz amigos num instante', terra: 'começa por observar e só depois ganha confiança', ar: 'é comunicativo(a) e simpático(a) com toda a gente', agua: 'é tímido(a) ao início e precisa de tempo para se abrir' };
function kidNatal(x) {
  const ci = CITIES[+(x.c ?? (P.get() || {}).c ?? 0)] || CITIES[0], [y, m, d] = dParts(x.d);
  if (x.t) { const [hh, mi] = x.t.split(':').map(Number), ms = localToUtcMs(y, m, d, hh, mi, ci[3]), jd = jdFromMs(ms); return { moon: Math.floor(moonLon(jd) / 30), asc: Math.floor(ascendant(ms, ci[1], ci[2]) / 30), exact: true }; }
  const m0 = Math.floor(moonLon(jdFromMs(localToUtcMs(y, m, d, 0, 1, ci[3]))) / 30), m1 = Math.floor(moonLon(jdFromMs(localToUtcMs(y, m, d, 23, 59, ci[3]))) / 30);
  return { moon: Math.floor(moonLon(jdFromMs(localToUtcMs(y, m, d, 12, 0, ci[3]))) / 30), moon2: m0 !== m1 ? [m0, m1] : null, asc: null, exact: false };
}
function kidHtml(x) { return gz(kidHtml0(x), x.rel); }
function kidHtml0(x) {
  const si = kidSign(x), S = SIGNS[si], K = KID_SIGN[si], age = ageOn(x.d), cn = chineseSign(x.d), nn = nameNum(x.name), rd = readDay(si, todayStr(), ST.modern), sky = skyFor(todayStr()), me = P.get(), pa = partner();
  const lvl = rd.overall >= 70 ? '😄 Dia de boa disposição: bom para combinar programas novos.' : rd.overall <= 50 ? '🫶 Dia mais sensível: menos pressão, mais colo e paciência.' : '🙂 Dia normal: rotina e um bocadinho de brincadeira a meio.';
  const bl = (who, wS, lbl) => { const b = bond(wS, si); return `<div class="bond"><span>${G(SIGNS[wS].g)}</span><div><b>${lbl} ${SIGNS[wS].n} + ${esc(x.name.split(' ')[0])} ${S.n}: ${b.pct}%</b><small>${BOND_TIP[b.k]}</small></div></div>`; };
  return `<div class="pethero kidh" style="--c:${elc(S)}"><span class="em">${x.rel === 'filha' ? '👧' : '👦'}</span><h3>${esc(x.name)}</h3><p><b>${G(S.g)} ${S.n}</b> · ${cn.e} ${cn.n} · ${age > 0 ? age + (age === 1 ? ' ano' : ' anos') : 'bebé'} · 🎂 ${daysToBirthday(x.d) === 0 ? '<b>hoje!</b>' : 'em ' + daysToBirthday(x.d) + ' dias'}</p></div>
    <div class="box"><h3>☀️ Hoje</h3><p>${lvl}</p><p>${KID_MOON[SIGNS[sky.moon.sign].el]}</p></div>
    <div class="box"><h3>🌟 Como é</h3><p>${K.c}</p><p>Talentos a puxar: <b>${K.t}</b>.</p></div>
    ${(() => { const N = kidNatal(x), M = SIGNS[N.moon]; return `<div class="box"><h3>🌙 O lado emocional · Lua em ${N.moon2 ? SIGNS[N.moon2[0]].n + ' ou ' + SIGNS[N.moon2[1]].n : M.n}</h3><p>${cap1(MOON_KID[M.el])}.</p>${N.moon2 ? '<p class="note">Nesse dia a Lua mudou de signo: com a hora de nascimento fica certinho.</p>' : ''}</div>${N.asc != null ? `<div class="box"><h3>✨ Como se mostra · Ascendente em ${SIGNS[N.asc].n}</h3><p>Na escola e com quem não conhece, ${ASC_KID[SIGNS[N.asc].el]}.</p></div>` : '<p class="note" style="margin:-4px 0 10px">💡 Põe a hora de nascimento (✏️ Editar) para ver também o ascendente: como se mostra aos outros.</p>'}`; })()}
    <div class="box"><h3>🧸 Como lidar</h3><p>💡 <b>O que o(a) motiva:</b> ${K.m}.</p><p>🌪️ <b>Birras e comportamento:</b> ${K.b}</p><p>🌙 <b>Sono:</b> ${K.s}</p></div>
    ${(() => { const op = x.par && x.par.d ? x.par : pa; return me && me.d || op ? `<div class="box"><h3>💞 A vossa ligação</h3>${me && me.d ? bl('me', sunSignOf(me.d), 'Tu,') : ''}${op ? bl('pa', sunSignOf(op.d), esc((op.name || 'Pai/mãe').split(' ')[0]) + ',') : ''}</div>` : ''; })()}
    ${nn ? `<div class="box"><h3>🔤 O nome ${esc(x.name.split(' ')[0])}</h3><p>Pela numerologia, o nome vibra no <b>${nn}</b>: ${NUM_INFO[nn].w.toLowerCase()} (${NUM_MEAN[nn]}).</p></div>` : ''}
    ${momentsBox('kid:' + x.name, 'Momentos de ' + esc(x.name.split(' ')[0]))}
    <div class="tools"><button class="btn main" id="kShare">📤 Partilhar a nossa ligação</button><button class="btn" id="kCard">🪪 Enviar o cartão (fica guardado na app de quem recebe)</button><button class="btn" id="kPoster">🎉 Cartaz de parabéns</button><button class="btn" id="kEdit">✏️ Editar</button></div>`;
}
async function drawKid(x) {
  await fontsReady(); const si = kidSign(x), S = SIGNS[si], me = P.get(), [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'kid' + x.name, EL_COL[S.el]);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText(me && me.d ? 'A NOSSA LIGAÇÃO' : 'O SIGNO D' + (x.rel === 'filha' ? 'A MINHA FILHA' : 'O MEU FILHO'), W / 2, 120);
  if (me && me.d) { const ms = sunSignOf(me.d), b = bond(ms, si); ctx.font = `150px ${SYMF}`; ctx.fillStyle = EL_COL[SIGNS[ms].el][0]; ctx.fillText(SIGNS[ms].g + VS, W / 2 - 260, 400); ctx.fillStyle = EL_COL[S.el][0]; ctx.fillText(S.g + VS, W / 2 + 260, 400); ctx.font = `110px ${EMOJI_F}`; ctx.fillText('💛', W / 2, 390); ctx.fillStyle = '#fff'; ctx.font = '700 44px Cinzel'; ctx.fillText((me.name || 'Eu').split(' ')[0].toUpperCase(), W / 2 - 260, 500); ctx.fillText(x.name.split(' ')[0].toUpperCase(), W / 2 + 260, 500); ctx.font = 'italic 600 32px "Cormorant Garamond"'; ctx.fillStyle = '#d8d0f5'; ctx.fillText(SIGNS[ms].n, W / 2 - 260, 548); ctx.fillText(S.n, W / 2 + 260, 548); ctx.fillStyle = '#f2c76e'; ctx.font = '700 170px Cinzel'; ctx.fillText(b.pct + '%', W / 2, 770); ctx.font = 'italic 600 42px "Cormorant Garamond"'; ctx.fillStyle = '#fff'; wrap(ctx, gz(BOND_TIP[b.k], x.rel), W / 2, 880, W - 200, 56, 3, 'center'); }
  else { ctx.font = `200px ${SYMF}`; ctx.fillStyle = EL_COL[S.el][0]; ctx.fillText(S.g + VS, W / 2, 480); ctx.fillStyle = '#fff'; ctx.font = '700 80px Cinzel'; ctx.fillText(x.name.toUpperCase(), W / 2, 640); }
  ctx.textAlign = 'center'; ctx.font = '500 34px Manrope'; ctx.fillStyle = '#eee'; wrap(ctx, gz(KID_SIGN[si].c, x.rel), W / 2, me && me.d ? 1080 : 760, W - 200, 48, 3, 'center');
  brandFoot(ctx, W, H); return c;
}
function openKid(k) {
  const x = P.list('ceu_bdays')[k]; if (!x) return; $('#infoTitle').textContent = ''; $('#infoBody').innerHTML = kidHtml(x); $('#infoDlg').scrollTop = 0;
  $('#kShare').onclick = async () => { const me = P.get(), si = kidSign(x); toast('A preparar…'); await shareCanvases([{ name: 'ligacao-' + x.name.toLowerCase(), c: await drawKid(x) }], me && me.d ? `${(me.name || 'Eu').split(' ')[0]} ${SIGNS[sunSignOf(me.d)].g} 💛 ${x.name} ${SIGNS[si].g}: ${bond(sunSignOf(me.d), si).pct}% de ligação!\n\nFeito com Céu de Hoje ✨ ${APP_URL}` : `${x.name} é ${SIGNS[si].n} ${SIGNS[si].g}\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  $('#kPoster').onclick = () => { $('#infoDlg').close(); ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday({ name: x.name, rel: x.rel, d: x.d, t: x.t, showAge: true, from: ((P.get() || {}).name || '').split(' ')[0] }, false); };
  $('#kEdit').onclick = () => kidForm(k); $('#kCard').onclick = () => sharePerson(x); bindMoms($('#infoBody'));
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
function bindKids() { if ($('#kidNew')) $('#kidNew').onclick = () => kidForm(null); bindMoms(); document.querySelectorAll('[data-kid]').forEach(el => el.onclick = () => openKid(+el.dataset.kid)); }
function oracleKids(t) { const K0 = kids(), x0 = K0.find(k => t.includes(nrm(k.name.split(' ')[0]))) || (/filha/.test(t) && K0.find(k => k.rel === 'filha')) || (/filho\b/.test(t) && K0.find(k => k.rel === 'filho')) || K0[0]; const r = oracleKids0(t, x0); return r && x0 ? gz(r, x0.rel) : r; }
function oracleKids0(t, x0) {
  if (!/filh|crianc|miud|birra|comporta|escola|trabalhos de casa|portar|educar|adolesc/.test(t) || /fertil|gravid|engravid/.test(t)) return null;
  const x = x0, sky = skyFor(todayStr()), moon = KID_MOON[SIGNS[sky.moon.sign].el];
  if (!x) return `👨‍👩‍👧 ${moon}<br><small>Junta os teus filhos em «O meu espaço» e respondo pelo signo de cada um.</small>`;
  const si = kidSign(x), KS = KID_SIGN[si], nm = x.name.split(' ')[0];
  if (/birra|comporta|portar|teim|desobed|grita|zang/.test(t)) return `🌪️ ${nm} é ${SIGNS[si].n}: ${KS.b}<br>${moon}`;
  if (/dorm|sono|noite|deitar/.test(t)) return `🌙 ${nm} (${SIGNS[si].n}): ${KS.s}<br>${moon}`;
  if (/escola|estud|trabalhos de casa|nota|teste|aprend/.test(t)) return `📚 ${nm} (${SIGNS[si].n}) aprende melhor com ${KS.m}. Talentos a puxar: ${KS.t}.<br>${moon}`;
  const rd = readDay(si, todayStr(), ST.modern);
  return `${x.rel === 'filha' ? '👧' : '👦'} ${nm} hoje: ${rd.overall >= 70 ? 'boa disposição, aproveitem para algo novo' : rd.overall <= 50 ? 'dia mais sensível, menos pressão e mais colo' : 'dia normal, rotina com um pouco de brincadeira'}. O que o(a) motiva: ${KS.m}.<br>${moon}`;
}

// ---------- Amuletos e bem-estar de cada signo ----------
const SIGN_EXTRA = [
  { sob: 'Bolo de chocolate picante', esp: 'Pimenta e malagueta', pedra: 'Rubi', metal: 'Ferro', planta: 'Cato', corpo: 'cabeça', cuid: 'pausas para os olhos e água à mão: a tensão vai para a cabeça' },
  { sob: 'Tarte de maçã com canela', esp: 'Canela', pedra: 'Esmeralda', metal: 'Cobre', planta: 'Rosa', corpo: 'garganta e pescoço', cuid: 'chá morno e alongar o pescoço' },
  { sob: 'Mousse de limão', esp: 'Anis', pedra: 'Ágata', metal: 'Mercúrio (prata)', planta: 'Lavanda', corpo: 'braços, mãos e respiração', cuid: 'respirar fundo 5 vezes antes de responder a tudo' },
  { sob: 'Arroz-doce da avó', esp: 'Noz-moscada', pedra: 'Pedra-da-lua', metal: 'Prata', planta: 'Lírio', corpo: 'estômago', cuid: 'comer devagar e sem stress à mesa' },
  { sob: 'Leite-creme queimado', esp: 'Açafrão', pedra: 'Citrino', metal: 'Ouro', planta: 'Girassol', corpo: 'coração e costas', cuid: 'uma caminhada ao sol e postura direita' },
  { sob: 'Salada de frutas', esp: 'Erva-doce', pedra: 'Safira', metal: 'Mercúrio (prata)', planta: 'Hortelã', corpo: 'barriga e digestão', cuid: 'chá de hortelã e menos pressa ao comer' },
  { sob: 'Pastel de nata', esp: 'Baunilha', pedra: 'Quartzo-rosa', metal: 'Cobre', planta: 'Orquídea', corpo: 'rins e equilíbrio', cuid: 'beber mais água e equilibrar trabalho e descanso' },
  { sob: 'Fondant de chocolate negro', esp: 'Cravinho', pedra: 'Topázio', metal: 'Ferro', planta: 'Hibisco', corpo: 'zona íntima e emoções guardadas', cuid: 'escrever o que sentes em vez de guardar' },
  { sob: 'Crepes com laranja', esp: 'Cardamomo', pedra: 'Turquesa', metal: 'Estanho', planta: 'Dente-de-leão', corpo: 'ancas e pernas', cuid: 'alongar as pernas e mexer o corpo' },
  { sob: 'Bolo de bolacha', esp: 'Cominhos', pedra: 'Ónix', metal: 'Chumbo (cinzento)', planta: 'Hera', corpo: 'joelhos, ossos e pele', cuid: 'hidratar a pele e aliviar os ombros' },
  { sob: 'Gelado de frutos vermelhos', esp: 'Gengibre', pedra: 'Ametista', metal: 'Alumínio', planta: 'Bambu', corpo: 'circulação e tornozelos', cuid: 'levantar e mexer de hora a hora' },
  { sob: 'Doce de ovos', esp: 'Sálvia', pedra: 'Água-marinha', metal: 'Estanho', planta: 'Nenúfar', corpo: 'pés e sono', cuid: 'pés em água morna e dormir bem' }];
const EL_FRUIT = { fogo: ['Laranja', 'Morango', 'Romã', 'Manga', 'Cereja', 'Ananás'], terra: ['Maçã', 'Pera', 'Figo', 'Banana', 'Uvas', 'Castanhas'], ar: ['Kiwi', 'Limão', 'Mirtilos', 'Tangerina', 'Maracujá', 'Ameixa'], agua: ['Melancia', 'Melão', 'Pêssego', 'Framboesa', 'Coco', 'Lichia'] };
const EL_FOOD = { fogo: ['Caril suave com arroz', 'Frango no churrasco com salada', 'Chili com feijão', 'Espetadas com pimentos'], terra: ['Sopa de legumes e pão caseiro', 'Lasanha de forno', 'Bacalhau com grão', 'Arroz de pato'], ar: ['Salada colorida com sementes', 'Wrap de frango e abacate', 'Sushi ou poke', 'Massa com pesto'], agua: ['Caldo verde', 'Peixe grelhado com batata-doce', 'Risoto de cogumelos', 'Canja quentinha'] };
const DAY_ANIMAL = ['🦊 Raposa: astúcia', '🦉 Coruja: sabedoria', '🐬 Golfinho: alegria', '🐢 Tartaruga: paciência', '🦋 Borboleta: mudança', '🐝 Abelha: trabalho em equipa', '🦁 Leão: coragem', '🐺 Lobo: lealdade', '🐎 Cavalo: liberdade', '🕊️ Pomba: paz', '🐘 Elefante: memória e família', '🦢 Cisne: elegância', '🐇 Coelho: sorte', '🦅 Águia: visão'];
const BAD_FIX = { amor: 'manda uma mensagem carinhosa sem esperar resposta e evita conversas difíceis hoje', trabalho: 'faz uma lista de 3 coisas e esquece o resto; revê antes de enviar', dinheiro: 'nada de compras por impulso: espera 24 horas antes de pagar', energia: 'deita-te mais cedo e troca o café da tarde por um chá' };
function signExtras(rd) {
  const si = rd.si, S = SIGNS[si], X = SIGN_EXTRA[si], r = seeded('ex' + ST.date + si), pickL = L => L[Math.floor(r() * L.length)];
  const fruit = pickL(EL_FRUIT[S.el]), food = pickL(EL_FOOD[S.el]), ani = DAY_ANIMAL[Math.floor(r() * DAY_ANIMAL.length)];
  const v = verdict(rd), ks = ['amor', 'trabalho', 'dinheiro', 'energia'], worst = ks.reduce((a, b) => rd.area[b] < rd.area[a] ? b : a);
  return `<section class="amul"><h4>🍀 Amuletos de hoje</h4><div class="amg"><span>🍓<b>${fruit}</b><i>fruta do dia</i></span><span>🍲<b>${food}</b><i>prato do dia</i></span><span>🍰<b>${X.sob}</b><i>sobremesa do signo</i></span><span>🌶️<b>${X.esp}</b><i>especiaria</i></span><span>💎<b>${X.pedra}</b><i>pedra</i></span><span>⚙️<b>${X.metal}</b><i>metal</i></span><span>🌿<b>${X.planta}</b><i>planta</i></span><span>${ani.split(' ')[0]}<b>${ani.split(' ')[1].replace(':', '')}</b><i>animal do dia: ${ani.split(': ')[1]}</i></span></div></section>
  <section><h4>🧘 Bem-estar</h4><p>${S.n} rege ${X.corpo}: hoje, ${X.cuid}.</p><p class="note">Tradição astrológica, não é conselho médico.</p></section>
  ${v.k !== 'bom' ? `<section class="fix"><h4>🩹 Se o dia apertar</h4><p>• ${cap1(BAD_FIX[worst])}.</p><p>• Conforto à mesa: ${food.toLowerCase()} e ${fruit.toLowerCase()} de sobremesa.</p><p>• Leva contigo algo ${X.pedra.toLowerCase().includes('rosa') ? 'cor-de-rosa' : 'da cor do dia'} ou uma ${X.pedra.toLowerCase()} se tiveres: um lembrete para respirar.</p></section>` : ''}`;
}

// ---------- Compatibilidade pelos nomes ----------
const soulNum = n => { const s = nrm(n).replace(/[^aeiou]/g, ''); return s ? redNum([...s].reduce((a, c) => a + ((c.charCodeAt(0) - 97) % 9) + 1, 0)) : 0; };
const baseN = n => ({ 11: 2, 22: 4, 33: 6 })[n] || n, grpN = n => [1, 5, 7].includes(baseN(n)) ? 'ação' : [2, 4, 8].includes(baseN(n)) ? 'mente' : 'coração';
function nameMatch(a, b) {
  const ea = nameNum(a), eb = nameNum(b), sa = soulNum(a), sb = soulNum(b); if (!ea || !eb) return null;
  let pct = baseN(ea) === baseN(eb) ? 93 : grpN(ea) === grpN(eb) ? 86 : 62 + ((ea * eb + sa + sb) % 20);
  if (sa && sb && (sa === sb || grpN(sa) === grpN(sb))) pct += 5;
  pct = Math.max(55, Math.min(99, pct));
  const fa = a.trim().split(' ')[0], fb = b.trim().split(' ')[0], Ia = NUM_INFO[ea], Ib = NUM_INFO[eb];
  const common = [...new Set(nrm(fa).replace(/[^a-z]/g, ''))].filter(c => nrm(fb).includes(c)).length;
  const txt = baseN(ea) === baseN(eb) ? `Os dois nomes vibram no ${ea}: ${Ia.w.toLowerCase()}. Pensam e sentem de forma parecida, entendem-se sem esforço.` : grpN(ea) === grpN(eb) ? `Os nomes são da mesma família de números (${grpN(ea)}): ${fa} traz ${Ia.w.toLowerCase()} e ${fb} traz ${Ib.w.toLowerCase()}. Combinação natural.` : `Energias diferentes que se completam: ${fa} traz ${Ia.w.toLowerCase()}, ${fb} traz ${Ib.w.toLowerCase()}. O segredo é respeitar o ritmo de cada um.`;
  const soul = sa && sb ? (sa === sb ? `No coração (vogais) vibram os dois no ${sa}: desejam as mesmas coisas.` : `No coração (vogais): ${fa} ${sa} (${NUM_INFO[sa].w.toLowerCase()}), ${fb} ${sb} (${NUM_INFO[sb].w.toLowerCase()}).`) : '';
  return { a: a.trim(), b: b.trim(), fa, fb, ea, eb, sa, sb, pct, txt, soul, common };
}
function nameMatchBox(m) { return `<div class="box nmatch"><h3>🔤 Pelos nomes</h3><div class="nmr"><div><b>${esc(m.fa)}</b><span>${m.ea}</span></div><em>${m.pct}%</em><div><b>${esc(m.fb)}</b><span>${m.eb}</span></div></div><p>${esc(m.txt)}</p>${m.soul ? `<p>${esc(m.soul)}</p>` : ''}${m.common ? `<p class="note">Têm ${m.common} letra${m.common > 1 ? 's' : ''} em comum no primeiro nome ✨</p>` : ''}</div>`; }
async function drawNameMatch(m, D) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'nm' + m.a + m.b, ['#ff6b98', '#3a1040']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText('A LIGAÇÃO DOS NOSSOS NOMES', W / 2, 120);
  ctx.fillStyle = '#fff'; fitFont(ctx, m.fa.toUpperCase(), 440, 80, 36, s => `700 ${s}px Cinzel`); ctx.fillText(m.fa.toUpperCase(), W / 2 - 250, 330); fitFont(ctx, m.fb.toUpperCase(), 440, 80, 36, s => `700 ${s}px Cinzel`); ctx.fillText(m.fb.toUpperCase(), W / 2 + 250, 330);
  ctx.font = `90px ${EMOJI_F}`; ctx.fillText('💞', W / 2, 330);
  [[m.ea, W / 2 - 250], [m.eb, W / 2 + 250]].forEach(([n, x]) => { ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, 450, 54, 0, 7); ctx.stroke(); ctx.fillStyle = '#f2c76e'; ctx.font = '700 52px Cinzel'; ctx.fillText(String(n), x, 468); });
  if (D) { ctx.font = `64px ${SYMF}`; ctx.fillStyle = EL_COL[D.A.el][0]; ctx.fillText(D.A.g + VS, W / 2 - 250, 590); ctx.fillStyle = EL_COL[D.B.el][0]; ctx.fillText(D.B.g + VS, W / 2 + 250, 590); }
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 190px Cinzel'; ctx.fillText(m.pct + '%', W / 2, 830);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 600 42px "Cormorant Garamond"'; wrap(ctx, m.txt, W / 2, 940, W - 180, 56, 4, 'center');
  if (D) { ctx.textAlign = 'center'; ctx.font = '600 32px Manrope'; ctx.fillStyle = '#ffd9e6'; ctx.fillText(`Pelos signos (${D.A.n} + ${D.B.n}): ${D.today}%`, W / 2, H - 150); }
  brandFoot(ctx, W, H); return c;
}
// seletor de signos bonito
function signPicker(cur, cb) {
  $('#infoTitle').textContent = 'Escolhe o signo';
  $('#infoBody').innerHTML = `<div class="signgrid">${SIGNS.map((s, i) => `<button data-sg="${i}"${i === cur ? ' class="on"' : ''} style="--c:${elc(s)}"><span>${G(s.g)}</span><b>${s.n}</b><i>${s.r}</i></button>`).join('')}</div>`;
  $('#infoBody').querySelectorAll('[data-sg]').forEach(b => b.onclick = () => { $('#infoDlg').close(); cb(+b.dataset.sg); });
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
}

// ---------- Fotos guardadas à parte (IndexedDB), para não encher a memória ----------
const PHDB = { db: null, open() { return this.db || (this.db = new Promise((res, rej) => { const r = indexedDB.open('ceu-fotos', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('f', mode), s = t.objectStore('f'), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
  put(k, v) { return this.tx('readwrite', s => s.put(v, k)); }, get(k) { return this.tx('readonly', s => s.get(k)); }, del(k) { return this.tx('readwrite', s => s.delete(k)); },
  async all() { const db = await this.open(); return new Promise((res, rej) => { const out = {}, t = db.transaction('f', 'readonly'), c = t.objectStore('f').openCursor(); c.onsuccess = () => { const cu = c.result; if (cu) { out[cu.key] = cu.value; cu.continue(); } }; t.oncomplete = () => res(out); t.onerror = () => rej(t.error); }); } };
async function fileToJpeg(f, max = 900, q = .78) { const u = URL.createObjectURL(f), im = await loadImg(u); URL.revokeObjectURL(u); if (!im) return ''; const s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', q); }

// ---------- Momentos (memórias com dia e hora) ----------
const MOM = { all: () => P.list('ceu_moments'), save: l => P.setList('ceu_moments', l) };
const MOM_IDEAS = { kid: ['Primeiro sorriso', 'Primeiro dente', 'Primeiros passos', 'Primeira palavra', 'Primeiro dia de escola', 'Primeira bicicleta', 'Primeira namorada/o', 'Uma frase que disse'], me: ['Mudei de emprego', 'Uma conquista', 'Uma viagem especial', 'Um dia feliz', 'Uma decisão importante', 'Um recomeço'], pet: ['Chegou a casa', 'Primeiro passeio', 'Uma travessura', 'Aprendeu um truque'], preg: ['Teste positivo', 'Contámos à família', 'Primeira ecografia', 'Ouvimos o coração', 'Primeiro pontapé', 'Soubemos se é menino ou menina', 'Escolhemos o nome', 'Chá de bebé'] };
function whoList() { const me = P.get() || {}, L = [{ id: 'me', n: (me.name || 'Eu').split(' ')[0] + ' (eu)', k: 'me', e: '🙋' }]; kids().forEach(x => L.push({ id: 'kid:' + x.name, n: x.name, k: 'kid', e: x.rel === 'filha' ? '👧' : '👦' })); const pa = partner(); if (pa) L.push({ id: 'p:' + pa.name, n: pa.name, k: 'me', e: '💞' }); P.list('ceu_pets').forEach(a => L.push({ id: 'pet:' + a.name, n: a.name, k: 'pet', e: spOf(a)[1] })); try { const cy = CY.get(); if (cy.preg) L.splice(1, 0, { id: 'bebe', n: cy.preg.name || 'Bebé (gravidez)', k: 'preg', e: '🤰' }); } catch (e) { } L.push({ id: 'fam', n: 'Família', k: 'me', e: '👨‍👩‍👧' }); return L; }
const whoOf = id => whoList().find(w => w.id === id) || { id, n: id.replace(/^\w+:/, ''), e: '✨', k: 'me' };
function ageAt(birth, ds) { if (!birth) return ''; const [y1, m1, d1] = dParts(birth), [y2, m2, d2] = dParts(ds); let m = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0); if (m < 0) return ''; const y = Math.floor(m / 12); m %= 12; return y ? `${y} ano${y > 1 ? 's' : ''}${m ? ` e ${m} mes${m > 1 ? 'es' : ''}` : ''}` : `${m} mes${m !== 1 ? 'es' : ''}`; }
function birthOf(id) { if (id === 'me') return (P.get() || {}).d; if (id.startsWith('kid:')) { const k = kids().find(x => 'kid:' + x.name === id); return k && k.d; } if (id.startsWith('pet:')) { const a = P.list('ceu_pets').find(x => 'pet:' + x.name === id); return a && a.d; } return ''; }
function momRow(m) { const w = whoOf(m.who), sky = skyFor(m.d), ag = ageAt(birthOf(m.who), m.d); return `<div class="mom" data-mid="${m.id}"><span class="me">${m.ph ? '📸' : w.e}</span><div><b>${esc(m.title)}</b><small>${esc(w.n)} · ${niceDate(m.d).replace(/-feira/, '')}${m.t ? ' às ' + m.t : ''}${ag ? ' · ' + ag : ''} · 🌙 ${SIGNS[sky.moon.sign].n}</small>${m.txt ? `<p>${esc(m.txt.length > 120 ? m.txt.slice(0, 118) + '…' : m.txt)}</p>` : ''}</div></div>`; }
function momentsBox(filter, title) {
  const L = MOM.all().filter(m => !filter || m.who === filter).sort((a, b) => (b.d + (b.t || '')).localeCompare(a.d + (a.t || '')));
  return `<div class="box moms"><h3>📸 ${title || 'Momentos'} ${L.length ? `<small>(${L.length})</small>` : ''}</h3>${L.slice(0, 4).map(momRow).join('') || '<p class="note">Guarda os momentos que não queres esquecer, com dia e hora. Um dia vais adorar reler.</p>'}<div class="drow"><button class="btn main" data-momadd="${filter || ''}">＋ Novo momento</button>${L.length ? `<button class="btn" data-mombook="${filter || ''}">📖 ${L.length > 4 ? 'Ver todos / livro' : 'Livro'}</button>` : ''}</div></div>`;
}
function momForm(m, who) {
  const W = whoList(), cur = m ? m.who : (who || 'me'), kind = whoOf(cur).k; let photo = null;
  $('#infoTitle').textContent = m ? '✏️ Momento' : '📸 Novo momento';
  $('#infoBody').innerHTML = `<div class="form"><label>De quem é<select id="mWho">${W.map(w => `<option value="${w.id}"${w.id === cur ? ' selected' : ''}>${w.e} ${esc(w.n)}</option>`).join('')}</select></label>
    <label>O que aconteceu<input type="text" id="mTi" maxlength="70" value="${esc(m ? m.title : '')}" placeholder="Ex.: Primeiros passos"></label><div class="chips" id="mIdeas">${(MOM_IDEAS[kind] || MOM_IDEAS.me).map(s => `<button type="button" class="qchip">${s}</button>`).join('')}</div>
    <div class="two"><label>Dia<input type="date" id="mD" value="${m ? m.d : todayStr()}" max="${todayStr()}"></label><label>Hora<input type="time" id="mT" value="${m ? m.t || '' : new Date().toTimeString().slice(0, 5)}"></label></div>
    <label>Conta como foi<textarea id="mTx" rows="4" maxlength="1500" placeholder="O que sentiste, quem estava, o que disse…">${esc(m ? m.txt || '' : '')}</textarea></label>
    <label class="btn ghost" style="text-align:center;cursor:pointer">📷 ${m && m.ph ? 'Trocar a foto' : 'Juntar foto'}<input type="file" id="mPh" accept="image/*" hidden></label><div id="mPhP"></div>
    <button class="btn main" id="mSave">Guardar momento</button>${m ? '<button class="btn" id="mDel">🗑️ Apagar</button>' : ''}</div>`;
  if (m && m.ph) PHDB.get(m.ph).then(v => v && ($('#mPhP').innerHTML = `<img src="${v}" alt="" class="mphp">`));
  $('#mIdeas').querySelectorAll('.qchip').forEach(b => b.onclick = () => { $('#mTi').value = b.textContent; });
  $('#mPh').onchange = async e => { const f = e.target.files[0]; if (!f) return; photo = await fileToJpeg(f); if (photo) $('#mPhP').innerHTML = `<img src="${photo}" alt="" class="mphp">`; };
  $('#mSave').onclick = async () => { const ti = $('#mTi').value.trim(); if (!ti) { toast('Escreve o que aconteceu'); return; } const L = MOM.all(), id = m ? m.id : 'm' + Date.now().toString(36), o = { id, who: $('#mWho').value, title: ti, d: $('#mD').value || todayStr(), t: $('#mT').value, txt: $('#mTx').value.trim(), ph: m ? m.ph || '' : '' };
    if (photo) { try { await PHDB.put('mom-' + id, photo); o.ph = 'mom-' + id; } catch (er) { toast('Não consegui guardar a foto'); } }
    const j = L.findIndex(x => x.id === id); if (j >= 0) L[j] = o; else L.push(o); MOM.save(L); $('#infoDlg').close(); toast('Momento guardado 💛'); render(); };
  if ($('#mDel')) $('#mDel').onclick = async () => { if (!confirmBox('Apagar este momento?')) return; MOM.save(MOM.all().filter(x => x.id !== m.id)); if (m.ph) try { await PHDB.del(m.ph); } catch (e) { } $('#infoDlg').close(); render(); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
function momList(filter) {
  const L = MOM.all().filter(m => !filter || m.who === filter).sort((a, b) => (b.d + (b.t || '')).localeCompare(a.d + (a.t || ''))), w = filter ? whoOf(filter) : null;
  $('#infoTitle').textContent = `📸 ${w ? 'Momentos de ' + w.n.replace(' (eu)', '') : 'Todos os momentos'}`;
  $('#infoBody').innerHTML = `<div class="moms">${L.map(momRow).join('')}</div><div class="anoact" style="grid-template-columns:1fr 1fr"><button class="btn main" id="mbPdf">📖 Livro em PDF</button><button class="btn" id="mbImg">📤 Partilhar páginas</button></div><p class="note">Do primeiro ao último momento, com o céu de cada dia. Perfeito para guardar ou oferecer um dia ${w && w.k === 'kid' ? 'ao ' + w.n : ''}.</p>`;
  bindMoms($('#infoBody'));
  const build = () => buildMomBook(filter);
  $('#mbPdf').onclick = async () => { const b = $('#mbPdf'); b.disabled = true; b.textContent = 'A criar…'; try { const pg = await build(), pdf = await pagesToPdf(pg), f = new File([pdf], `momentos-${(w ? w.n : 'familia').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`, { type: 'application/pdf' }); let ok = false; try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); ok = true; } } catch (e) { if (e && e.name === 'AbortError') ok = true; } if (!ok) await saveBlob(f, f.name); } finally { b.disabled = false; b.textContent = '📖 Livro em PDF'; } };
  $('#mbImg').onclick = async () => { const pg = await build(); shareCanvases(pg, `📸 ${w ? 'Os momentos de ' + w.n : 'Os nossos momentos'} 💛\n\nFeito com Céu de Hoje ✨ ${APP_URL}`); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
function bindMoms(root) {
  (root || document).querySelectorAll('[data-momadd]').forEach(b => b.onclick = () => momForm(null, b.dataset.momadd || 'me'));
  (root || document).querySelectorAll('[data-mombook]').forEach(b => b.onclick = () => momList(b.dataset.mombook || null));
  (root || document).querySelectorAll('.mom[data-mid]').forEach(el => el.onclick = () => momForm(MOM.all().find(m => m.id === el.dataset.mid)));
}
async function buildMomBook(filter) {
  await fontsReady();
  const L = MOM.all().filter(m => !filter || m.who === filter).sort((a, b) => (a.d + (a.t || '')).localeCompare(b.d + (b.t || ''))), w = filter ? whoOf(filter) : null, W = 1080, H = 1350, pages = [];
  const page = fn => { const [c, ctx] = newCanvas(W, H); fn(ctx); pages.push({ name: `momentos-${String(pages.length + 1).padStart(2, '0')}`, c }); };
  const nm = w ? w.n.replace(' (eu)', '') : 'A nossa família', birth = filter ? birthOf(filter) : '';
  page(ctx => { const el = birth ? SIGNS[sunSignOf(birth)].el : 'agua'; bg(ctx, W, H, 'mb' + nm, EL_COL[el]); wheel(ctx, W / 2, 560, 320, .3); ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 32px Cinzel'; ctx.fillText('O LIVRO DE', W / 2, 230); ctx.fillStyle = '#fff'; fitFont(ctx, nm.toUpperCase(), W - 200, 110, 46, s => `700 ${s}px Cinzel`); ctx.fillText(nm.toUpperCase(), W / 2, 350); if (birth) { const sg = SIGNS[sunSignOf(birth)]; ctx.font = `140px ${SYMF}`; ctx.fillStyle = EL_COL[sg.el][0]; ctx.fillText(sg.g + VS, W / 2, 640); ctx.fillStyle = '#e9e2ff'; ctx.font = 'italic 600 44px "Cormorant Garamond"'; ctx.fillText(`Nasceu a ${niceDate(birth).replace(/^[^,]+, /, '')} de ${birth.slice(0, 4)}`, W / 2, 780); } ctx.fillStyle = '#f2c76e'; ctx.font = 'italic 600 52px "Cormorant Garamond"'; ctx.fillText(`${L.length} momento${L.length > 1 ? 's' : ''}`, W / 2, 900); if (L.length) { ctx.font = '600 32px Manrope'; ctx.fillStyle = '#d8d0f5'; ctx.fillText(`${L[0].d.slice(0, 4)}${L[L.length - 1].d.slice(0, 4) !== L[0].d.slice(0, 4) ? ' — ' + L[L.length - 1].d.slice(0, 4) : ''}`, W / 2, 970); } brandFoot(ctx, W, H, H - 90); });
  const photos = {}; for (const m of L) if (m.ph) try { const v = await PHDB.get(m.ph); if (v) photos[m.id] = await loadImg(v); } catch (e) { }
  L.forEach((m, i) => page(ctx => {
    paper(ctx, W, H, 'm' + i); const sky = skyFor(m.d), ag = ageAt(birthOf(m.who), m.d), wh = whoOf(m.who); let y = 170;
    ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '700 26px Cinzel'; ctx.fillText(`${niceDate(m.d).replace(/^[^,]+, /, '').toUpperCase()} DE ${m.d.slice(0, 4)}${m.t ? ' · ' + m.t : ''}`, W / 2, y); y += 40;
    if (!filter || ag) { ctx.font = '600 24px Manrope'; ctx.fillStyle = '#6b5a44'; ctx.fillText([!filter ? wh.n : '', ag ? (wh.k === 'me' ? '' : 'com ' + ag) : ''].filter(Boolean).join(' · '), W / 2, y); y += 30; }
    ctx.fillStyle = INK; fitFont(ctx, m.title, W - 220, 66, 36, s => `italic 600 ${s}px "Cormorant Garamond"`); ctx.fillText(m.title, W / 2, y + 60); y += 110;
    const im = photos[m.id];
    if (im) { const maxH = m.txt ? 560 : 760, fw = Math.min(800, maxH * im.width / im.height), fh = fw * im.height / im.width; ctx.save(); ctx.translate(W / 2, y + fh / 2 + 20); ctx.rotate((i % 2 ? 1 : -1) * .025); ctx.shadowColor = '#0005'; ctx.shadowBlur = 24; ctx.fillStyle = '#fffdf8'; ctx.fillRect(-fw / 2 - 18, -fh / 2 - 18, fw + 36, fh + 36); ctx.shadowColor = 'transparent'; ctx.drawImage(im, -fw / 2, -fh / 2, fw, fh); ctx.restore(); y += fh + 80; }
    if (m.txt) { const room = H - 230 - y; let sz = im ? 38 : 48; ctx.font = `italic 500 ${sz}px "Cormorant Garamond"`; let Ls; while ((Ls = linesOf(ctx, m.txt, W - 280)).length * sz * 1.35 > room && sz > 24) { sz -= 2; ctx.font = `italic 500 ${sz}px "Cormorant Garamond"`; }
      const bh = Ls.length * sz * 1.35, y0 = im ? y : y + Math.max(0, (room - bh) / 2 - 40); ctx.fillStyle = INK; ctx.textAlign = 'center'; Ls.slice(0, Math.floor(room / (sz * 1.35))).forEach((l, j) => ctx.fillText(l, W / 2, y0 + j * sz * 1.35)); if (!im) { ctx.fillStyle = GOLD; ctx.font = '700 120px "Cormorant Garamond"'; ctx.globalAlpha = .35; ctx.fillText('“', W / 2, y0 - 40); ctx.globalAlpha = 1; } }
    else if (!im) { ctx.save(); ctx.globalAlpha = .14; ctx.textAlign = 'center'; ctx.font = `300px ${EMOJI_F}`; ctx.fillText(wh.e, W / 2, H / 2 + 160); ctx.restore(); }
    ctx.textAlign = 'center'; ctx.font = 'italic 500 26px "Cormorant Garamond"'; ctx.fillStyle = '#6b5a44'; ctx.fillText(`Nesse dia a Lua estava em ${SIGNS[sky.moon.sign].n} (${moonPhaseName(sky.phase.elong)})`, W / 2, H - 130);
    pageNum(ctx, W, H, i + 2);
  }));
  page(ctx => { bg(ctx, W, H, 'mbf' + nm, EL_COL.agua); ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'italic 600 64px "Cormorant Garamond"'; ctx.fillText('Continua…', W / 2, 640); ctx.font = `80px ${SYMF}`; ctx.fillStyle = '#f2c76e'; ctx.fillText('✦', W / 2, 780); ctx.font = '500 28px Manrope'; ctx.fillStyle = '#d8d0f5'; ctx.fillText('Feito com a app Céu de Hoje', W / 2, H - 150); });
  return pages;
}

// ---------- Partilhar uma pessoa (cartão + ligação para juntar à agenda) ----------
function personLink(x) { const o = { n: x.name, d: x.d, t: x.t || '', s: x.rel === 'filha' || ['mae', 'mulher', 'namorada', 'irma', 'avof', 'tia', 'sobrinha', 'prima', 'neta', 'bfff', 'amiga'].includes(x.rel) ? 'f' : 'm' }; return APP_URL + '#add=' + btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
async function sharePerson(x) {
  const si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), S = SIGNS[si]; await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'pp' + x.name, EL_COL[S.el]);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 30px Cinzel'; ctx.fillText('CARTÃO ASTRAL', W / 2, 130); ctx.font = `220px ${SYMF}`; ctx.fillStyle = EL_COL[S.el][0]; ctx.fillText(S.g + VS, W / 2, 470); ctx.fillStyle = '#fff'; fitFont(ctx, x.name.toUpperCase(), W - 160, 100, 44, s => `700 ${s}px Cinzel`); ctx.fillText(x.name.toUpperCase(), W / 2, 640);
  ctx.font = 'italic 600 52px "Cormorant Garamond"'; ctx.fillStyle = '#e9e2ff'; ctx.fillText(`${S.n} · ${chineseSign(x.d).n} ${chineseSign(x.d).e}`, W / 2, 720); ctx.font = '600 34px Manrope'; ctx.fillText(`Nascido(a) a ${x.d.split('-').reverse().join('/')}${x.t ? ' às ' + x.t : ''}`.replace('Nascido(a)', isKid(x) ? (x.rel === 'filha' ? 'Nascida' : 'Nascido') : 'Nascido(a)'), W / 2, 800);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; wrap(ctx, isKid(x) ? gz(KID_SIGN[si].c, x.rel) : `Número da vida: ${lifePath(x.d)} (${NUM_MEAN[lifePath(x.d)]}).`, W / 2, 920, W - 200, 54, 4, 'center');
  ctx.textAlign = 'center'; ctx.font = '600 30px Manrope'; ctx.fillStyle = '#f2c76e'; ctx.fillText('Abre a ligação para guardar na tua app ✨', W / 2, H - 140); brandFoot(ctx, W, H);
  await shareCanvases([{ name: 'cartao-' + x.name.toLowerCase(), c }], `✨ ${x.name}: ${S.n} ${S.g}\nGuarda este cartão na tua app Céu de Hoje (fica com a data e o aniversário):\n${personLink(x)}`);
}
function checkAddLink() {
  const m = /#add=([^&]+)/.exec(location.hash); if (!m) return;
  let o; try { o = JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch (e) { return; } history.replaceState(null, '', location.pathname + location.search);
  if (!o || !o.n || !/^\d{4}-\d\d-\d\d$/.test(o.d)) return;
  const si = o.t ? sunSignAt(o.d, o.t) : sunSignOf(o.d), me = P.get(), opts = REL_GROUPS.filter(g => g[0] !== 'Animais').flatMap(g => g[1]).map(r => `<option value="${r}">${(RELS.find(z => z[0] === r) || [])[2]}</option>`).join('');
  $('#infoTitle').textContent = '✨ Cartão recebido';
  $('#infoBody').innerHTML = `<div class="pethero" style="--c:${elc(SIGNS[si])}"><span class="em">${G(SIGNS[si].g)}</span><h3>${esc(o.n)}</h3><p>${SIGNS[si].n} · ${o.d.split('-').reverse().join('/')}${o.t ? ' às ' + o.t : ''}</p></div><div class="form"><label>Quem é para ti?<select id="adRel"><option value="eu">Sou eu! (o meu perfil)</option>${opts}</select></label><button class="btn main" id="adGo">Guardar na minha app</button></div>`;
  $('#adGo').onclick = () => { const rel = $('#adRel').value; if (rel === 'eu') { const p = P.get() || {}; if (p.d && p.d !== o.d && !confirmBox('Já tens um perfil. Substituir pelos dados do cartão?')) return; P.set({ ...p, name: o.n, d: o.d, t: o.t }); } else { const L = P.list('ceu_bdays'); if (!L.some(x => x.name === o.n && x.d === o.d)) L.push({ name: o.n, rel, d: o.d, t: o.t }); P.setList('ceu_bdays', L); try { syncAlertData(); } catch (e) { } } $('#infoDlg').close(); toast('Guardado ✨'); render(); };
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
