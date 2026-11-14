// ===== Mensagens de parabéns e prendas, ritual da noite, mapa do casal, «O meu ano» (Wrapped) =====
const isFem = x => ((RELS.find(r => r[0] === x.rel) || [])[1]) === 'f' || /a$/.test(x.relTxt || '');
const gx = (t, f) => String(t).replace(/(\p{L}+)\(a\)/gu, (m, w) => f ? (/^o$/i.test(w) ? 'a' : /[oe]$/.test(w) ? w.slice(0, -1) + 'a' : w + 'a') : w);
const PARTNER = /^(mulher|marido|namorada|namorado|noiva|noivo|companheira|companheiro)$/;
const callOf = x => PARTNER.test(x.rel) ? 'meu amor' : { mae: 'mãe', pai: 'pai', avof: 'avó', avom: 'avô' }[x.rel] || x.name.split(' ')[0];
const SQ = [['pela tua coragem', 'A tua coragem'], ['pela tua calma e o teu bom gosto', 'A tua calma'], ['pela tua alegria e pela tua conversa', 'A tua conversa'], ['pelo teu coração enorme', 'O teu coração enorme'], ['pelo teu brilho', 'O teu brilho'], ['pelo cuidado que tens com todos', 'O teu cuidado com todos'], ['pela tua elegância e pelo teu equilíbrio', 'A tua elegância'], ['pela tua intensidade e lealdade', 'A tua lealdade'], ['pela tua alegria e espírito livre', 'A tua alegria'], ['pela tua força e determinação', 'A tua força'], ['pela tua originalidade', 'A tua originalidade'], ['pela tua sensibilidade e ternura', 'A tua ternura']];
const FUNNY = ['cheio(a) de pica', 'teimoso(a), mas adorável', 'a falar pelos cotovelos', 'um docinho de pessoa', 'a estrela de qualquer festa', 'perfeccionista até nos parabéns', 'indeciso(a) entre bolo e gelado', 'misterioso(a) como sempre', 'pronto(a) para a próxima aventura', 'a trabalhar mais do que toda a gente', 'maluco(a) da melhor maneira', 'a sonhar acordado(a)'];
const GIFTS = [['🥊 Uma experiência radical (karting, paintball, escalada)', '🎧 Auscultadores para treinar', '🌶️ Um jantar picante num sítio novo', '⌚ Um relógio desportivo'], ['🧀 Um cabaz gourmet', '🕯️ Velas perfumadas e uma manta macia', '💆 Uma massagem num spa', '🌿 Uma planta bonita para casa'], ['📚 Um livro do momento', '🎟️ Bilhetes para um espetáculo de humor', '🎲 Um jogo de tabuleiro divertido', '📱 Um gadget curioso'], ['📸 Um álbum de fotografias de família', '🍰 Um bolo caseiro feito por ti', '🏡 Algo bonito para a casa', '💌 Uma carta escrita à mão'], ['💎 Uma peça de joalharia', '🌟 Um jantar especial em que é o centro das atenções', '👗 Roupa com estilo', '🎭 Bilhetes para teatro ou concerto'], ['📓 Um caderno bonito e canetas boas', '🧘 Uma aula de ioga ou pilates', '☕ Uma máquina de café de qualidade', '🌱 Um kit de chás ou ervas aromáticas'], ['🎨 Uma peça de arte ou um quadro', '🌸 Perfume', '🍷 Um jantar romântico', '🎶 Um disco em vinil'], ['🔮 Um baralho de Tarot ou um livro de mistério', '🕯️ Um fim de semana a dois, só vocês', '🖤 Algo elegante e intenso', '🛁 Um kit de banho relaxante'], ['✈️ Uma escapadinha surpresa', '🗺️ Um mapa para raspar os países visitados', '🎒 Uma mochila de viagem', '📖 Um livro de viagens ou filosofia'], ['💼 Uma carteira ou agenda de qualidade', '⌚ Um relógio clássico', '🥃 Uma garrafa especial', '🏔️ Um passeio na natureza'], ['🤖 Um gadget de tecnologia', '🎟️ Bilhetes para um evento diferente', '🪐 Um telescópio ou planetário', '🎨 Uma oficina criativa'], ['🎨 Material de pintura', '🎵 Uma playlist e um concerto', '🌊 Um dia na praia ou num lago', '🧜 Um colar com um cristal']];
function bdMsg(x, style, n) {
  const si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), S = SIGNS[si].n, f = isFem(x), C = callOf(x), N = x.name.split(' ')[0], A = ageOn(x.d, nextBirthday(x.d)), q = SQ[si], mo = SIGNS[skyFor(x.d).moon.sign].n, me = ((P.get() || {}).name || '').split(' ')[0];
  const T = { carinhosa: [`Parabéns, ${C}! 💛 Que este novo ano te traga tudo o que mereces, e mereces muito. Que sorte a minha ter-te na minha vida, ${q[0]}. Um beijinho enorme${me ? ', ' + me : ''}.`, `Feliz aniversário, ${C}! 🎂 ${q[1]} faz o mundo à tua volta mais bonito. Que os teus ${A} anos sejam cheios de saúde, amor e gargalhadas. 💛`, `${cap1(C)}, hoje o dia é teu! 🌷 Desejo-te um ano leve, cheio de abraços e de sonhos cumpridos. Conta sempre comigo. Parabéns! 💛`],
    divertida: [`Parabéns, ${C}! 🎉 ${A} anos e continuas ${FUNNY[si]}. O bolo é por tua conta, as velas por minha 😄🎂`, `Atenção, atenção: hoje faz anos ${f ? 'a' : 'o'} ${S} mais ${['enérgic(a)', 'teimos(a)', 'faladador(a)', 'querid(a)', 'vaidos(a)', 'organizad(a)', 'indecis(a)', 'intens(a)', 'aventureir(a)', 'trabalhador(a)', 'original', 'sonhador(a)'][si].replace(/\(a\)/, f ? 'a' : 'o').replace('faladadora', 'faladora').replace('faladadoro', 'falador').replace('trabalhadoro', 'trabalhador').replace('sonhadoro', 'sonhador')} que conheço! 🥳 Parabéns, ${N}!`, `${cap1(C)}, mais uma volta ao Sol e nem uma ruga de mau feitio… quase 😜 Parabéns e que venha a festa! 🎂`],
    astral: [`Parabéns, ${C}! ✨ Hoje o Sol volta ao sítio onde estava quando nasceste: começa o teu novo ano astral. ${q[1]} de ${S} vai brilhar ainda mais este ano. 🌟`, `Feliz aniversário, ${C}! 🌙 Que as estrelas de ${S} te tragam um ano de sorte, amor e caminhos abertos. Que Júpiter te proteja! 💫`, `${cap1(C)}, nasceste com a Lua em ${mo} e isso explica muita coisa 😉 Que este novo ano astral seja dos melhores. Parabéns! ✨`] };
  const L = T[style]; return gx(L[((n % L.length) + L.length) % L.length], f);
}
function nextBirthday(d) { const t = todayStr(), y = +t.slice(0, 4), c = y + d.slice(4); return (c >= t ? c : (y + 1) + d.slice(4)).replace(/-02-29$/, '-02-28'); }
function openBdMsg(k, style = 'carinhosa', n = 0) {
  const x = P.list('ceu_bdays')[k]; if (!x) return; const txt = bdMsg(x, style, n), tel = (x.tel || '').replace(/\D/g, ''), num = tel ? (tel.length === 9 ? '351' + tel : tel) : '';
  $('#infoTitle').textContent = '💬 Mensagem para ' + x.name.split(' ')[0];
  $('#infoBody').innerHTML = `<div class="box"><div class="seg2">${[['carinhosa', '💛 Carinhosa'], ['divertida', '😄 Divertida'], ['astral', '✨ Astral']].map(s => `<button data-ms="${s[0]}"${s[0] === style ? ' class="on"' : ''}>${s[1]}</button>`).join('')}</div><textarea id="msgT" rows="6">${esc(txt)}</textarea>
    <div class="drow"><a class="btn main" id="msgWa" target="_blank" rel="noopener" href="https://wa.me/${num}?text=${encodeURIComponent(txt)}">💬 WhatsApp</a><button class="btn" id="msgCp">📋 Copiar</button><button class="btn" id="msgNx">🔄 Outra</button></div><p class="note">Podes editar à vontade antes de enviar.${num ? '' : ' Guarda o telemóvel da pessoa (Editar) para abrir logo a conversa dela.'}</p></div>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
  document.querySelectorAll('[data-ms]').forEach(b => b.onclick = () => openBdMsg(k, b.dataset.ms, 0));
  $('#msgNx').onclick = () => openBdMsg(k, style, n + 1); $('#msgCp').onclick = () => copyAny($('#msgT').value);
  $('#msgT').oninput = () => $('#msgWa').href = `https://wa.me/${num}?text=${encodeURIComponent($('#msgT').value)}`;
}
function giftBox(x) { const si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), dd = daysToBirthday(x.d); return `<div class="box gifts"><h3>🎁 Ideias de prenda para ${esc(x.name.split(' ')[0])}${dd <= 14 ? ` <small>(faltam ${dd} dias)</small>` : ''}</h3>${GIFTS[si].map(g => `<p>${g}</p>`).join('')}<p class="note">Pelo signo de ${SIGNS[si].n}. A melhor prenda continua a ser lembrares-te 💛</p></div>`; }
function giftAlerts() { const t0 = noonJd(todayStr()); return P.list('ceu_bdays').filter(x => x.d).map(x => { const nb = nextBirthday(x.d), d = dayStr(noonJd(nb) - 7); return { d, t: `🎁 Faltam 7 dias para os anos de ${x.name.split(' ')[0]}`, b: `Ideias de prenda pelo signo de ${SIGNS[sunSignOf(x.d)].n} na app.`, tag: 'gift-' + x.name + nb, url: './?aniversarios' }; }).filter(e => noonJd(e.d) >= t0); }

// ---------- Ritual da noite ----------
function openNight() {
  const t = todayStr(), s = skyFor(t), tm = skyFor(dayStr(noonJd(t) + 1)), dlg = $('#tarDlg'), me = P.get() || {};
  dlg.innerHTML = `<button class="tx" id="tarX" aria-label="Fechar">✕</button><div class="night"><div class="nmoon"><img src="${moonImg(s.phase.elong, 90)}" alt=""></div><h2>Boa noite${me.name ? ', ' + esc(me.name.split(' ')[0]) : ''}</h2><p>${moonEmoji(s.phase.elong)} ${moonPhaseName(s.phase.elong)} em ${SIGNS[s.moon.sign].n}, ${Math.round(s.phase.illum * 100)}% iluminada.</p>
    <div class="nstep" id="nBreath"><div class="bcirc" id="bC"><span id="bT">Toca para respirar</span></div><small>4 respirações lentas, com voz e música</small></div><div class="nmix" onclick="event.stopPropagation()"><label>🎵 Música<input type="range" id="nMv" min="0.04" max="0.5" step="0.02" value="${store.get('ceu_mvol') || .16}"></label><label>🗣️ Voz<input type="range" id="nVv" min="0.2" max="1" step="0.05" value="${store.get('ceu_vvol') || .7}"></label></div>
    <div class="nstep"><h3>🙏 Três coisas boas de hoje</h3>${[1, 2, 3].map(i => `<input type="text" id="g${i}" maxlength="80" placeholder="${['Uma coisa que me fez sorrir…', 'Alguém por quem sou grato(a)…', 'Algo que correu bem…'][i - 1]}">`).join('')}<button class="btn main" id="gSave" style="width:100%">Guardar no diário</button></div>
    <div class="nstep"><h3>🌙 Amanhã</h3><p>A Lua passa a estar em ${SIGNS[tm.moon.sign].n}: ${{ fogo: 'acorda com energia para começar coisas', terra: 'bom dia para pôr ordem e ser prático(a)', ar: 'dia de conversas e ideias', agua: 'dia de emoções e intuição: vai com calma' }[SIGNS[tm.moon.sign].el]}.</p></div>
    <label class="chk nal"><input type="checkbox" id="nAl"${store.get('ceu_night_alert') === '1' ? ' checked' : ''}> Lembrar-me do ritual ao fim do dia</label></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0;
  $('#tarX').onclick = () => { stopBreath(); dlg.close(); };
  $('#nBreath').onclick = () => startBreath();
  $('#nMv').oninput = e => { store.set('ceu_mvol', e.target.value); if (AMB.ctx && AMB.nodes[0]) AMB.nodes[0].gain.setTargetAtTime(+e.target.value, AMB.ctx.currentTime, .2); }; $('#nVv').oninput = e => store.set('ceu_vvol', e.target.value);
  $('#gSave').onclick = () => { const v = [1, 2, 3].map(i => $('#g' + i).value.trim()).filter(Boolean); if (!v.length) { toast('Escreve pelo menos uma'); return; } const L = DIA.all(), m = (MOODS.find(z => z[0] === 4) || [4, '🙂']); L.push({ id: 'n' + Date.now().toString(36), d: todayStr(), mood: 4, moodE: '🙏', txt: '🙏 Três coisas boas de hoje:\n' + v.map((x, i) => `${i + 1}. ${x}`).join('\n'), tags: ['gratidão'], ts: Date.now() }); DIA.save(L); toast('Guardado no diário 🙏'); [1, 2, 3].forEach(i => $('#g' + i).value = ''); };
  $('#nAl').onchange = e => { store.set('ceu_night_alert', e.target.checked ? '1' : '0'); try { syncAlertData(); } catch (er) { } };
}
let _br = null;
function stopBreath() { if (_br) { clearTimeout(_br.t); _br = null; } try { speechSynthesis.cancel(); } catch (e) { } ambientStop(); }
function startBreath() {
  if (_br) { stopBreath(); $('#bT').textContent = 'Toca para respirar'; $('#bC').className = 'bcirc'; return; }
  _br = { n: 0 }; ambientStart(); const say = w => { try { const u = new SpeechSynthesisUtterance(w); u.lang = 'pt-PT'; u.rate = .8; u.volume = +(store.get('ceu_vvol') || .7) * .8; const v = store.get('ceu_voice'); if (v) { const vv = speechSynthesis.getVoices().find(z => z.voiceURI === v); if (vv) u.voice = vv; } speechSynthesis.speak(u); } catch (e) { } };
  const steps = [['Inspira…', 'in', 4000], ['Segura…', 'hold', 3000], ['Expira devagar…', 'out', 6000]];
  const go = k => { if (!_br) return; if (k >= steps.length) { if (++_br.n >= 4) { $('#bT').textContent = 'Dorme bem 🌙'; $('#bC').className = 'bcirc'; say('Dorme bem.'); _br.t = setTimeout(() => { ambientStop(); _br = null; }, 4000); return; } k = 0; } const [w, c, ms] = steps[k]; $('#bT').textContent = w; $('#bC').className = 'bcirc ' + c; say(w.replace('…', '')); _br.t = setTimeout(() => go(k + 1), ms); };
  _br.t = setTimeout(() => go(0), 1200);
}
function nightAlerts() { if (store.get('ceu_night_alert') !== '1') return []; const t0 = noonJd(todayStr()); return Array.from({ length: 30 }, (_, k) => { const d = dayStr(t0 + k); return { d, t: '🌙 Esta noite: o teu ritual da noite', b: 'Antes de dormir: respira, agradece e vê a Lua de hoje.', tag: 'night-' + d, url: './?noite', h: 18 }; }); }

// ---------- Mapa do casal (Sol, Lua, Vénus, Marte) ----------
const VEN_S = ['ama com paixão e gosta de conquistar', 'ama com calma, mimo e lealdade', 'ama com conversa, humor e leveza', 'ama a cuidar, com ternura e proteção', 'ama com generosidade e gosta de ser admirado(a)', 'ama com pequenos gestos e atenção aos detalhes', 'ama com romance, beleza e equilíbrio', 'ama com intensidade e entrega total', 'ama com liberdade e aventura', 'ama com compromisso e seriedade', 'ama com amizade e originalidade', 'ama com sonho, magia e sensibilidade'];
const MAR_S = ['deseja ação, desafio e energia', 'deseja segurança, toque e prazer sem pressa', 'deseja estímulo mental e variedade', 'deseja intimidade e sentir-se em casa', 'deseja admiração e paixão com estilo', 'deseja dedicação e cuidado', 'deseja harmonia e sedução elegante', 'deseja profundidade e mistério', 'deseja aventura e espontaneidade', 'deseja ambição partilhada e constância', 'deseja liberdade e surpresa', 'deseja romance e ligação de alma'];
const ASP = k => [0, 2, 4].includes(k) ? ['💚', 'harmonia'] : k === 6 ? ['🔥', 'atração dos opostos'] : k === 3 ? ['⚡', 'faísca: tensão que puxa'] : ['🌀', 'diferentes, aprendem um com o outro'];
const kOf = (a, b) => Math.min((a - b + 12) % 12, (b - a + 12) % 12);
function synastry(dA, dB) {
  const A = skyFor(dA), B = skyFor(dB), r = (x, y) => ({ k: kOf(x, y), a: ASP(kOf(x, y)) });
  const items = [['☀️ Sol com Sol', 'a essência', r(A.sun.sign, B.sun.sign)], ['🌙 Lua com Lua', 'as emoções e a vida em casa', r(A.moon.sign, B.moon.sign)], ['💘 A tua Vénus com o Marte do teu par', 'a química', r(A.venus.sign, B.mars.sign)], ['💘 O teu Marte com a Vénus do teu par', 'a química', r(A.mars.sign, B.venus.sign)], ['💞 Vénus com Vénus', 'a forma de amar', r(A.venus.sign, B.venus.sign)]];
  const sc = Math.round(items.reduce((s, it) => s + ({ 0: 92, 2: 85, 4: 95, 6: 80, 3: 62, 1: 66, 5: 64 }[it[2].k]), 0) / items.length);
  return { A, B, items, sc };
}
function coupleMapBox(x) {
  const me = P.get(); if (!me || !me.d || !PARTNER.test(x.rel)) return ''; const Y = synastry(me.d, x.d), N = esc(x.name.split(' ')[0]), f = isFem(x);
  return `<div class="box cmap"><h3>💑 O vosso mapa</h3><p class="bigpct">${Y.sc}%</p><div class="vm"><div><b>Tu</b><p>♀ Vénus em ${SIGNS[Y.A.venus.sign].n}: ${gx(VEN_S[Y.A.venus.sign], false)}.</p><p>♂ Marte em ${SIGNS[Y.A.mars.sign].n}: ${MAR_S[Y.A.mars.sign]}.</p></div><div><b>${N}</b><p>♀ Vénus em ${SIGNS[Y.B.venus.sign].n}: ${gx(VEN_S[Y.B.venus.sign], f)}.</p><p>♂ Marte em ${SIGNS[Y.B.mars.sign].n}: ${MAR_S[Y.B.mars.sign]}.</p></div></div>
    ${Y.items.map(it => `<p class="asp">${it[2].a[0]} <b>${it[0].replace('do teu par', 'de ' + N)}</b>, ${it[1]}: ${it[2].a[1]}.</p>`).join('')}<button class="btn" id="cmSh" style="width:100%">📤 Partilhar o nosso mapa</button><p class="note">Vénus e Marte calculados pela data de nascimento. Com a hora, a Lua fica mais certa.</p></div>`;
}
async function shareCoupleMap(x) {
  const me = P.get(), Y = synastry(me.d, x.d), nA = (me.name || 'Eu').split(' ')[0], nB = x.name.split(' ')[0]; await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'cm' + x.name, ['#b03a5b', '#12050c']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 36px Cinzel'; ctx.fillText('O NOSSO MAPA DO AMOR', W / 2, 110); ctx.fillStyle = '#fff'; ctx.font = '700 70px "Cormorant Garamond"'; ctx.fillText(`${nA} + ${nB}`, W / 2, 210);
  ctx.fillStyle = '#f7e08a'; ctx.font = '700 150px Cinzel'; ctx.fillText(Y.sc + '%', W / 2, 390);
  [[nA, Y.A, W / 4], [nB, Y.B, W * 3 / 4]].forEach(([n, S, x0]) => { ctx.fillStyle = '#fff'; ctx.font = '700 44px "Cormorant Garamond"'; ctx.fillText(n, x0, 500); ctx.font = `64px ${SYMF}`; ctx.fillStyle = '#ff9db5'; ctx.fillText('♀' + VS, x0 - 70, 600); ctx.fillStyle = '#ff8a3d'; ctx.fillText('♂' + VS, x0 + 70, 600); ctx.fillStyle = '#efeaff'; ctx.font = '600 30px Manrope'; ctx.fillText(SIGNS[S.venus.sign].n, x0 - 70, 650); ctx.fillText(SIGNS[S.mars.sign].n, x0 + 70, 650); });
  const LB = ['Lua com Lua', `Vénus de ${nA} + Marte de ${nB}`, `Marte de ${nA} + Vénus de ${nB}`]; let y = 760; Y.items.slice(1, 4).forEach((it, j) => { ctx.fillStyle = '#fff'; ctx.font = '500 32px Manrope'; ctx.fillText(`${it[2].a[0]} ${LB[j]}`, W / 2, y); ctx.fillStyle = '#ffd9e6'; ctx.font = 'italic 600 34px "Cormorant Garamond"'; ctx.fillText(it[2].a[1], W / 2, y + 44); y += 130; });
  brandFoot(ctx, W, H); shareCanvases([{ name: 'o-nosso-mapa', c }], `💑 O nosso mapa do amor: ${Y.sc}%\n♀ Vénus e ♂ Marte de ${nA} e ${nB}\n\nVê o vosso em ${APP_URL}`);
}

// ---------- «O meu ano» (estilo Wrapped) ----------
function wrapSlides(y) {
  const Y = yearData(y), me = P.get() || {}, first = (me.name || '').split(' ')[0], S = [];
  const t = todayStr(), end = String(y) === t.slice(0, 4) ? t : y + '-12-31', cnt = {};
  try { for (let jd = noonJd(y + '-01-01'); jd <= noonJd(end); jd++) { const i = dailyCard({ ...me }, dayStr(jd)).i; cnt[i] = (cnt[i] || 0) + 1; } } catch (e) { }
  const topCard = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  S.push({ c: '#6a2fd1', big: String(y), t: `O ano de ${first || 'ti'}`, s: 'Vamos ver o que viveste ✨' });
  if (Y.read.length) S.push({ c: '#1f7a5c', big: String(Y.read.length), t: Y.read.length === 1 ? 'livro lido' : 'livros lidos', s: `${Y.pages ? Y.pages.toLocaleString('pt-PT') + ' páginas' : ''}${Y.favB ? `${Y.pages ? ' · ' : ''}o favorito: «${Y.favB.title}»` : ''}` });
  if (Y.shows.length) S.push({ c: '#b0306a', big: String(Y.shows.length), t: Y.shows.length === 1 ? 'série ou filme' : 'séries e filmes', s: Y.favS ? `O que mais adoraste: «${Y.favS.title}»` : '' });
  if (Y.trips.length) S.push({ c: '#1f5fa8', big: String(Y.trips.length), t: Y.trips.length === 1 ? 'viagem' : 'viagens', s: Y.countries.length ? Y.countries.map(c => flagOf(c[1]) + ' ' + (CNAME[c[1]] || cap1(c[0]))).join(', ') : '' });
  if (Y.dreamsY && Y.dreamsY.length) S.push({ c: '#c4741d', big: '✨', t: `${Y.dreamsY.length} ${Y.dreamsY.length === 1 ? 'sonho realizado' : 'sonhos realizados'}`, s: Y.dreamsY.map(x => x.title).join(', ') });
  if (Y.notes.length) S.push({ c: '#8a2fd1', big: String(Y.notes.length), t: 'notas no diário', s: Y.bestM ? `O teu mês mais feliz: ${MESES[Y.bestM[0] - 1]} 💛` : '' });
  if (topCard) S.push({ c: TCOL[+topCard[0]][0], card: +topCard[0], t: 'A carta que mais te saiu', s: `${TAROT[+topCard[0]][0]}, ${topCard[1]} vezes. ${TDAY[+topCard[0]][3]}` });
  const bd = Y.cards.length; if (Y.ppl.length) S.push({ c: '#d14a7a', big: String(Y.ppl.length), t: 'pessoas especiais na agenda', s: bd ? `Criaste ${bd} cartaz${bd > 1 ? 'es' : ''} de parabéns 🎂` : 'Ninguém ficou sem parabéns 🎂' });
  if (Y.pets.length) S.push({ c: '#2a8a6a', big: Y.pets.map(p => spOf(p)[1]).join(''), t: Y.pets.length === 1 ? 'o teu patudo' : 'os teus patudos', s: Y.pets.map(p => p.name).join(', ') });
  S.push({ c: '#3a2a8a', big: Y.cnNext.e, t: `${y + 1} é o ano ${/^(Cabra|Serpente)$/.test(Y.cnNext.n) ? 'da' : 'do'} ${Y.cnNext.n}`, s: 'Que venha um ano ainda mais bonito 🌟' });
  return S;
}
async function drawWrapSlide(ctx, W, H, sl, p) {
  bg(ctx, W, H, 'wr' + sl.t, [sl.c, '#07050f']); ctx.textAlign = 'center'; const e = v => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3), a = e(p * 2.2);
  ctx.globalAlpha = a; if (sl.card != null) { const im = await cardImg(sl.card); if (im) { const w = 520 + 40 * e(p); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; drawCardOn(ctx, im, sl.card, W / 2 - w / 2, 330, w); ctx.restore(); } }
  else { const big = sl.big; ctx.fillStyle = '#f7e08a'; ctx.font = /\p{Extended_Pictographic}/u.test(big) ? `${big.length > 4 ? 170 : 300}px ${EMOJI_F}` : `700 ${big.length > 4 ? 220 : 340}px Cinzel`; ctx.fillText(big, W / 2, 900 - 40 * (1 - e(p * 1.6))); }
  ctx.fillStyle = '#fff'; ctx.font = '700 84px "Cormorant Garamond"'; wrap(ctx, sl.t, W / 2, sl.card != null ? 1300 : 1120, W - 140, 92, 2, 'center');
  ctx.globalAlpha = e((p - .25) * 2); ctx.fillStyle = '#ffe9a8'; ctx.font = '500 44px Manrope'; wrap(ctx, sl.s || '', W / 2, sl.card != null ? 1480 : 1330, W - 160, 58, 3, 'center'); ctx.globalAlpha = 1;
  drawSparkles(ctx, W, H, p * 5, 22, 'ws' + sl.t); brandFoot(ctx, W, H, H - 80);
}
function openWrapped(y) {
  y = y || +todayStr().slice(0, 4); const S = wrapSlides(y), dlg = $('#tarDlg'); let k = 0, t0 = 0, raf = 0;
  dlg.innerHTML = `<button class="tx" id="tarX" aria-label="Fechar">✕</button><div class="wrap"><div class="wbars">${S.map(() => '<i><b></b></i>').join('')}</div><canvas id="wrC" width="1080" height="1920"></canvas><div class="wnav"><button id="wPrev" aria-label="Anterior"></button><button id="wNext" aria-label="Seguinte"></button></div><div class="drow wbtn"><button class="btn main" id="wVid">🎬 Vídeo para Stories</button><button class="btn" id="wImg">📤 Este ecrã</button></div></div>`;
  if (!dlg.open) dlg.showModal(); const c = $('#wrC'), ctx = c.getContext('2d'), DUR = 4200;
  const frame = async ts => { if (!dlg.open) return; if (!t0) t0 = ts; const p = Math.min(1, (ts - t0) / DUR); await drawWrapSlide(ctx, 1080, 1920, S[k], p); dlg.querySelectorAll('.wbars i').forEach((b, j) => b.firstChild.style.width = (j < k ? 100 : j === k ? p * 100 : 0) + '%'); if (p >= 1 && k < S.length - 1) { k++; t0 = 0; } raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);
  $('#tarX').onclick = () => { cancelAnimationFrame(raf); dlg.close(); };
  $('#wNext').onclick = () => { if (k < S.length - 1) { k++; t0 = 0; } }; $('#wPrev').onclick = () => { if (k > 0) k--; t0 = 0; };
  $('#wImg').onclick = () => { const cc = document.createElement('canvas'); cc.width = 1080; cc.height = 1920; drawWrapSlide(cc.getContext('2d'), 1080, 1920, S[k], 1).then(() => shareCanvases([{ name: 'o-meu-ano-' + (k + 1), c: cc }], `✨ O meu ${y} no Céu de Hoje\n\nVê o teu em ${APP_URL}`)); };
  $('#wVid').onclick = async e => { for (const s of S) if (s.card != null) await cardImg(s.card); const per = 3.2, tot = per * S.length; const r = await recordAnim((cx, t) => { const i = Math.min(S.length - 1, Math.floor(t / per)); /* desenho síncrono: as imagens já estão em cache */ drawWrapSlideSync(cx, 1080, 1920, S[i], (t - i * per) / per); }, tot, 1080, 1920, e.currentTarget, '🎬'); if (!r) return; const f = new File([r.blob], `o-meu-${y}.${r.ext}`, { type: r.blob.type }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (er) { if (er && er.name === 'AbortError') return; } saveBlob(r.blob, f.name); };
}
const _cardSync = {}; // versão síncrona para o vídeo (usa as imagens já carregadas)
function drawWrapSlideSync(ctx, W, H, sl, p) {
  bg(ctx, W, H, 'wr' + sl.t, [sl.c, '#07050f']); ctx.textAlign = 'center'; const e = v => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3), a = e(p * 2.2); ctx.globalAlpha = a;
  if (sl.card != null) { const im = _cardSync[sl.card]; if (im) { const w = 520 + 40 * e(p); drawCardOn(ctx, im, sl.card, W / 2 - w / 2, 330, w); } }
  else { const big = sl.big; ctx.fillStyle = '#f7e08a'; ctx.font = /\p{Extended_Pictographic}/u.test(big) ? `${big.length > 4 ? 170 : 300}px ${EMOJI_F}` : `700 ${big.length > 4 ? 220 : 340}px Cinzel`; ctx.fillText(big, W / 2, 900 - 40 * (1 - e(p * 1.6))); }
  ctx.fillStyle = '#fff'; ctx.font = '700 84px "Cormorant Garamond"'; wrap(ctx, sl.t, W / 2, sl.card != null ? 1300 : 1120, W - 140, 92, 2, 'center');
  ctx.globalAlpha = e((p - .25) * 2); ctx.fillStyle = '#ffe9a8'; ctx.font = '500 44px Manrope'; wrap(ctx, sl.s || '', W / 2, sl.card != null ? 1480 : 1330, W - 160, 58, 3, 'center'); ctx.globalAlpha = 1;
  drawSparkles(ctx, W, H, p * 5, 22, 'ws' + sl.t); brandFoot(ctx, W, H, H - 80);
}
const _ci0 = cardImg; cardImg = function (i, back) { const pr = _ci0(i, back); pr.then(im => { if (im && !back) _cardSync[i] = im; }); return pr; };
function wrapAlerts() { const y = +todayStr().slice(0, 4), d = y + '-12-01'; return d >= todayStr() ? [{ d, t: `🎁 O teu ${y} em vídeo está pronto`, b: 'Os teus livros, viagens, a carta que mais te saiu… pronto para Stories.', tag: 'wrap-' + y, url: './?wrapped', h: 10 }] : []; }
