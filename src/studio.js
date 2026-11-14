// ===== Estúdio de posts, Tarot (3 cartas, casal, semana), ouvir o dia, ano astral, contagens, sonhos, visita guiada =====
const SG = i => SIGNS[i].g + VS;
const copyAny = async t => { try { await navigator.clipboard.writeText(t); toast('Legenda copiada 📋'); } catch (e) { if (copySync(t)) toast('Legenda copiada 📋'); else toast('Não deu para copiar'); } };
const TAGS = '#horoscopo #signos #astrologia #zodiaco #tarot #lua';
const mondayOf = ds => dayStr(noonJd(ds) - ((wdOf(ds) + 6) % 7));

// ---------- conteúdos ----------
const QUANDO = {
  'é segunda-feira': ['Já começou a semana a correr', 'Nem fala antes do café', 'Já mudou de plano três vezes', 'Saudades do sofá de domingo', 'Chega atrasado, mas com estilo', 'Já tem a semana numa lista', 'Não sabe que roupa vestir', 'Olhar que diz «nem penses»', 'Já marcou o fim de semana', 'Já trabalhou duas horas', 'Esqueceu-se que era segunda', 'Ainda está a sonhar'],
  'têm fome': ['Fica zangado em 3 segundos', 'Já está a comer', 'Só fala de comida', 'Cozinha para a família toda', 'Quer o restaurante mais caro', 'Lê os ingredientes todos', 'Não decide onde comer', 'Come em silêncio e não partilha', 'Prova tudo o que há', 'Primeiro acaba o trabalho', 'Inventa uma receita estranha', 'Come chocolate e chora'],
  'chega o Natal': ['Abre as prendas antes do tempo', 'Só pensa nos doces', 'Manda 200 mensagens de Boas Festas', 'Chora a ver fotos antigas', 'Quer a árvore mais bonita da rua', 'Embrulhos perfeitos, com laço', 'Decoração toda a condizer', 'Adivinha as prendas pelo peso', 'Passa o Natal noutro país', 'Fez o orçamento em julho', 'Natal alternativo, sem regras', 'Ainda acredita no Pai Natal'],
  'estão apaixonados': ['Declara-se no primeiro dia', 'Prepara um jantar romântico', 'Escreve mensagens enormes', 'Já imaginou o casamento', 'Quer ser o centro das atenções', 'Analisa cada palavra do outro', 'Anda nas nuvens o dia todo', 'Intenso, ciumento e leal', 'Leva-te numa aventura', 'Mostra amor com ações', 'Diz que não, mas está caidinho', 'Escreve poemas e vê filmes românticos'],
  'alguém lhes mexe nas coisas': ['Explode na hora', 'Silêncio que mete medo', 'Nem repara', 'Fica magoado uma semana', '«Isso é MEU!»', 'Sabe exatamente o que mudou', 'Diz que não faz mal (faz)', 'Nunca esquece', 'Empresta tudo, sem stress', 'Já tinha tudo trancado', 'Nem sabe onde tem as coisas', 'Pede desculpa por estar no caminho'],
  'ficam sem bateria': ['Pânico total', 'Nem dá por isso', 'Pede carregador a toda a gente', 'Liga à mãe antes que acabe', 'Tira a powerbank com estilo', 'Tem sempre carregador na mala', 'Não sabe o que fazer à vida', 'Aproveita para desaparecer', 'Ótimo, mais aventura', 'Carregou ontem à noite, claro', 'Aproveita para ler um livro', 'Nem sabe onde pôs o telemóvel']
};
const SKY_TIPS = { rx: ['Confirma voos, reservas e mensagens', 'Lê bem antes de assinar', 'Faz cópias de segurança', 'Bom para rever e terminar coisas antigas'], cheia: ['Liberta o que já não te serve', 'Emoções à flor da pele: respira', 'Noite ótima para fotografar a Lua', 'Agradece o que já conseguiste'], nova: ['Escreve 3 desejos para este mês', 'Começa um projeto novo', 'Organiza a casa e a cabeça', 'Planta uma ideia e cuida dela'], ecl: ['Mudanças inesperadas abrem portas', 'Evita decisões precipitadas', 'Observa o que termina e o que começa', 'Nunca olhes para o Sol sem proteção'], dir: ['Mensagens e planos voltam a fluir', 'Bom para assinar o que adiaste', 'Retoma projetos parados', 'Ainda vai devagar uns dias: paciência'], sol: ['Nova energia no ar', 'Bom momento para recomeçar', 'Celebra os aniversariantes do signo', 'Ajusta os teus planos ao novo ritmo'] };
const POST_TYPES = [['sorte', '🍀 3 signos com mais sorte'], ['quando', '😂 Os signos quando…'], ['escolhe', '🃏 Escolhe 1, 2 ou 3'], ['revela', '✨ Resposta do 1, 2 ou 3'], ['par', '💞 Identifica o teu par'], ['ceu', '🌕 Alerta do céu'], ['alma', '💫 Carta da Alma (4 cartões)']];
const POST_PLAN = [['ceu', 'Domingo: o céu da semana'], ['sorte', 'Segunda: começa a semana com sorte'], ['quando', 'Terça: humor para comentar'], ['escolhe', 'Quarta: pergunta interativa'], ['revela', 'Quinta: a resposta de ontem'], ['par', 'Sexta: identifica o teu par'], ['quando', 'Sábado: humor de fim de semana']];
// ---------- desenho dos posts ----------
function postHead(ctx, W, kicker, title, y = 120) {
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 34px Cinzel'; ctx.fillText(kicker.toUpperCase(), W / 2, y);
  ctx.fillStyle = '#fff'; const fs = fitFont(ctx, title, W - 140, 74, 44, s => `700 ${s}px "Cormorant Garamond"`); ctx.font = `700 ${fs}px "Cormorant Garamond"`; const L = linesOf(ctx, title, W - 140).slice(0, 2); L.forEach((l, i) => ctx.fillText(l, W / 2, y + 80 + i * fs * 1.05)); return y + 80 + (L.length - 1) * fs * 1.05 + 40;
}
async function drawPost(type, opt = {}) {
  if (type === 'alma') { const cs = await soulPromoCanvases(); return { c: cs[0], cs, cap: `💫 Sabias que tens uma carta só tua no universo? Feita do teu nome e do momento em que nasceste, com um nº de série que mais ninguém tem.\n\n🛡️ No verso está o teu amuleto da alma: a tua fragilidade, a tua pedra, o teu metal, a tua planta e um selo feito com as letras do teu nome.\n\n👀 Algures existe a pessoa com a outra metade da tua constelação… 1 em cada 1300.\n\nCria a tua grátis em ceudehoje.com e partilha: «procuro a minha metade» 💞\n\n#CartaDaAlma #CéuDeHoje ${TAGS}` }; }
  await fontsReady(); const [c, ctx, W, H] = newCanvas(), t = todayStr(), seed = 'post' + type + t;
  const glyph = (i, x, y, s) => { ctx.font = `${s}px ${SYMF}`; ctx.fillStyle = elc(SIGNS[i]); ctx.fillText(SG(i), x, y); };
  if (type === 'sorte') {
    bg(ctx, W, H, seed, ['#2f8a4a', '#0a1f14']); const R = SIGNS.map((_, i) => readAny(i, t, 'semana', ST.modern)).sort((a, b) => b.overall - a.overall).slice(0, 3);
    let y = postHead(ctx, W, 'Esta semana', 'Os 3 signos com mais sorte') + 30; const md = ['🥇', '🥈', '🥉'];
    R.forEach((r, k) => { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(ctx, 70, y, W - 140, 270, 34); ctx.fill(); ctx.restore(); ctx.textAlign = 'left'; ctx.font = `64px ${EMOJI_F}`; ctx.fillText(md[k], 100, y + 90); glyph(r.si, 230, y + 105, 96);
      ctx.fillStyle = '#fff'; ctx.font = '700 56px "Cormorant Garamond"'; ctx.fillText(SIGNS[r.si].n, 360, y + 85); ctx.fillStyle = '#ffe9a8'; ctx.font = '600 28px Manrope'; ctx.fillText(r.keyword, 360, y + 125);
      ctx.fillStyle = '#eef'; ctx.font = 'italic 500 30px Manrope'; wrap(ctx, `«${firstSentence(r.headline)}»`, 100, y + 180, W - 200, 38, 2, 'left'); y += 300; });
    brandFoot(ctx, W, H); return { c, cap: `🍀 Os 3 signos com mais sorte esta semana:\n🥇 ${SIGNS[R[0].si].n}\n🥈 ${SIGNS[R[1].si].n}\n🥉 ${SIGNS[R[2].si].n}\n\nO teu está na lista? Comenta o teu signo 👇\n\n${TAGS}` };
  }
  if (type === 'quando') {
    const th = opt.theme || Object.keys(QUANDO)[Math.floor(seeded(seed)() * 6)], L = QUANDO[th]; bg(ctx, W, H, seed, ['#c2457a', '#2a0a20']);
    postHead(ctx, W, 'Os signos quando…', `…${th}`, 100); const cw = (W - 120) / 3, ch = 245;
    for (let i = 0; i < 12; i++) { const x = 60 + (i % 3) * cw, y = 290 + Math.floor(i / 3) * ch; ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(ctx, x + 8, y, cw - 16, ch - 18, 26); ctx.fill(); ctx.restore(); ctx.textAlign = 'center'; glyph(i, x + cw / 2, y + 70, 54); ctx.fillStyle = '#f2c76e'; ctx.font = '700 24px Manrope'; ctx.fillText(SIGNS[i].n.toUpperCase(), x + cw / 2, y + 108); ctx.fillStyle = '#fff'; ctx.font = '500 25px Manrope'; wrap(ctx, L[i], x + cw / 2, y + 145, cw - 40, 31, 3, 'center'); }
    brandFoot(ctx, W, H); return { c, cap: `😂 Os signos quando ${th}…\n\nQual é o teu? Identifica quem é mesmo assim 👇\n\n${TAGS} #humor`, theme: th };
  }
  if (type === 'escolhe' || type === 'revela') {
    const ds = type === 'revela' ? dayStr(noonJd(t) - (wdOf(t) === 4 ? 1 : 0)) : t, r = seeded('fb3' + mondayOf(ds)), ids = []; while (ids.length < 3) { const k = Math.floor(r() * 22); if (!ids.includes(k)) ids.push(k); }
    bg(ctx, W, H, seed, ['#4a1d8a', '#0a0616']); const y0 = postHead(ctx, W, type === 'escolhe' ? 'Escolhe uma carta' : 'A tua resposta', type === 'escolhe' ? 'Escolhe 1, 2 ou 3' : 'O que te saiu?', 100);
    const cw = 290, gap = 35, x0 = (W - 3 * cw - 2 * gap) / 2, cy = y0 + 20;
    for (let k = 0; k < 3; k++) { const im = await cardImg(type === 'revela' ? ids[k] : 0, type !== 'revela'), x = x0 + k * (cw + gap); if (im) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; drawCardOn(ctx, im, type === 'revela' ? ids[k] : null, x, cy, cw); ctx.restore(); }
      ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 64px Cinzel'; ctx.fillText(String(k + 1), x + cw / 2, cy + cw * 5 / 3 + 75);
      if (type === 'revela') { ctx.fillStyle = '#fff'; ctx.font = '500 25px Manrope'; wrap(ctx, TDAY[ids[k]][3], x + cw / 2, cy + cw * 5 / 3 + 120, cw, 31, 3, 'center'); } }
    if (type === 'escolhe') { ctx.fillStyle = '#efeaff'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; ctx.textAlign = 'center'; ctx.fillText('Respira, segue a intuição e comenta o número 👇', W / 2, H - 150); }
    brandFoot(ctx, W, H);
    return { c, cap: type === 'escolhe' ? `🃏 Escolhe 1, 2 ou 3!\n\nSegue a tua intuição e comenta o número 👇\nAmanhã revelo a mensagem de cada carta ✨\n\n${TAGS}` : `✨ A resposta de ontem:\n\n1️⃣ ${TAROT[ids[0]][0]}: ${TDAY[ids[0]][3]}\n2️⃣ ${TAROT[ids[1]][0]}: ${TDAY[ids[1]][3]}\n3️⃣ ${TAROT[ids[2]][0]}: ${TDAY[ids[2]][3]}\n\nQual escolheste? Bateu certo? 👇\n\n${TAGS}` };
  }
  if (type === 'par') {
    const si = Math.round(noonJd(t)) % 12, a = (si + 4) % 12, b = (si + 8) % 12, opp = (si + 6) % 12; bg(ctx, W, H, seed, [elc(SIGNS[si]), '#12081e']);
    postHead(ctx, W, 'Identifica o teu par', `${SIGNS[si].n} combina com…`, 110);
    ctx.textAlign = 'center'; glyph(si, W / 2, 520, 200); ctx.fillStyle = '#fff'; ctx.font = '700 60px "Cormorant Garamond"'; ctx.fillText(SIGNS[si].n, W / 2, 610);
    ctx.font = `80px ${EMOJI_F}`; ctx.fillText('💞', W / 2, 730);
    [[a, W / 2 - 240], [b, W / 2 + 240]].forEach(([s, x]) => { glyph(s, x, 880, 130); ctx.fillStyle = '#fff'; ctx.font = '700 48px "Cormorant Garamond"'; ctx.fillText(SIGNS[s].n, x, 950); });
    ctx.fillStyle = '#ffe9a8'; ctx.font = '500 32px Manrope'; ctx.fillText(`e a atração dos opostos: ${SIGNS[opp].n} 🔥`, W / 2, 1050);
    ctx.fillStyle = '#fff'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; ctx.fillText('Identifica o teu par nos comentários 👇', W / 2, 1150); brandFoot(ctx, W, H);
    return { c, cap: `💞 ${SIGNS[si].n} combina com ${SIGNS[a].n} e ${SIGNS[b].n} (do mesmo elemento), e sente a atração dos opostos com ${SIGNS[opp].n} 🔥\n\nÉs ${SIGNS[si].n}? Identifica o teu par 👇\n\n${TAGS} #amor` };
  }
  // céu
  const A = skyAgenda(30), e = A.find(x => x.big) || A[0]; bg(ctx, W, H, seed, ['#1d3a8a', '#05060f']);
  if (!e) { postHead(ctx, W, 'O céu desta semana', 'Semana calma no céu'); brandFoot(ctx, W, H); return { c, cap: `🌌 Semana calma no céu. Aproveita!\n\n${TAGS}` }; }
  const k = /direto/.test(e.t) ? 'dir' : /retrógrado/.test(e.t) ? 'rx' : /Eclipse/.test(e.t) ? 'ecl' : /Cheia/.test(e.t) ? 'cheia' : /Nova/.test(e.t) ? 'nova' : 'sol', when = niceDate(e.d);
  let y = postHead(ctx, W, '⚠️ Alerta do céu', e.t, 110); ctx.textAlign = 'center'; ctx.font = `200px ${/[☿♀♂♃♄]/.test(e.ic) ? SYMF : EMOJI_F}`; ctx.fillStyle = '#f7e08a'; ctx.fillText(e.ic + (/[☿♀♂♃♄]/.test(e.ic) ? VS : ''), W / 2, y + 220);
  ctx.fillStyle = '#ffe9a8'; ctx.font = '700 44px Manrope'; ctx.fillText(cap1(when), W / 2, y + 320); y += 400;
  SKY_TIPS[k].forEach(tp => { ctx.textAlign = 'left'; ctx.fillStyle = '#f2c76e'; ctx.font = `40px ${EMOJI_F}`; ctx.fillText('✦', 130, y); ctx.fillStyle = '#fff'; ctx.font = '500 36px Manrope'; wrap(ctx, tp, 190, y, W - 300, 44, 2, 'left'); y += 95; });
  brandFoot(ctx, W, H); return { c, cap: `${e.ic} ${e.t}: ${when}!\n\n${SKY_TIPS[k].map(x => '✦ ' + x).join('\n')}\n\nGuarda este post e partilha com quem precisa de saber 🔔\n\n${TAGS}` };
}
function openStudio(type) {
  const wd = wdOf(todayStr()), sug = POST_PLAN[wd][0]; type = type || ST.postType || sug; ST.postType = type;
  $('#infoTitle').textContent = '📣 Estúdio de posts';
  $('#infoBody').innerHTML = `<div class="box stu"><p class="note">📅 Hoje (${WDAY[wd][0].toLowerCase()}) sugerimos: <b>${POST_TYPES.find(x => x[0] === sug)[1]}</b></p><div class="chips stc">${POST_TYPES.map(x => `<button class="qchip${x[0] === type ? ' on' : ''}" data-pt="${x[0]}">${x[1]}</button>`).join('')}</div>
    ${type === 'quando' ? `<select id="stTh">${Object.keys(QUANDO).map(k => `<option${k === ST.postTheme ? ' selected' : ''}>${k}</option>`).join('')}</select>` : ''}
    <div class="stprev" id="stPrev"><p class="note">A desenhar…</p></div><label>Legenda (podes editar)<textarea id="stCap" rows="6"></textarea></label>
    <div class="drow"><button class="btn main" id="stSh">📤 Partilhar</button><button class="btn" id="stCp">📋 Copiar legenda</button></div></div>
    <div class="box"><h3>🗓️ O plano da semana</h3>${POST_PLAN.map((p, k) => `<p class="${k === wd ? 'today' : ''}">${k === wd ? '👉 ' : ''}${p[1]}</p>`).join('')}<p class="note">As imagens saem nas cores do teu ambiente e com o nome da tua página (Definições → Para quem publica). Os signos com sorte e os alertas são calculados com o céu real.</p></div>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal(); $('#infoDlg').scrollTop = 0;
  document.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => openStudio(b.dataset.pt));
  if ($('#stTh')) $('#stTh').onchange = () => { ST.postTheme = $('#stTh').value; openStudio('quando'); };
  drawPost(type, { theme: ST.postTheme }).then(r => { ST._post = r; $('#stPrev').innerHTML = r.cs ? `<div class="stmulti">${r.cs.map(x => `<img src="${stampOnce(x).toDataURL('image/jpeg', .8)}" alt="">`).join('')}</div><p class="note">4 cartões: publica-os juntos, em carrossel.</p>` : `<img src="${stampOnce(r.c).toDataURL('image/jpeg', .85)}" alt="">`; $('#stCap').value = r.cap; });
  $('#stSh').onclick = () => ST._post && shareCanvases(ST._post.cs ? ST._post.cs.map((c, i) => ({ name: `carta-da-alma-${i + 1}`, c })) : [{ name: 'post-' + type, c: ST._post.c }], $('#stCap').value);
  $('#stCp').onclick = () => copyAny($('#stCap').value);
}

// ---------- Tarot: elementos, 3 cartas, casal, semana ----------
const PEL = { 'Urano e o elemento Ar': 'ar', 'Mercúrio': 'ar', 'a Lua': 'agua', 'Vénus': 'terra', 'Júpiter': 'fogo', 'Neptuno e o elemento Água': 'agua', 'Marte': 'fogo', 'o Sol': 'fogo', 'Plutão e o elemento Fogo': 'fogo', 'Saturno': 'terra' };
const cardEl = i => { const r = TRULE[i]; return typeof r === 'number' ? SIGNS[r].el : PEL[r]; };
const EL_N = { fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água' };
const EL_DUO = { 'fogo+fogo': 'Paixão a dobrar: muita energia e entusiasmo, só cuidado com as faíscas.', 'terra+terra': 'Uma base sólida: confiança, rotina boa e planos concretos a dois.', 'ar+ar': 'Conversa sem fim: ideias, riso e cumplicidade mental.', 'agua+agua': 'Ligação profunda: sentem-se um ao outro sem precisar de palavras.', 'fogo+terra': 'Um sonha, o outro constrói: juntos tornam reais os planos.', 'ar+fogo': 'O ar aviva o fogo: aventura, novidade e muita química.', 'agua+fogo': 'Vapor! Emoção intensa: equilibrem paixão com ternura.', 'ar+terra': 'Ideias com os pés no chão: ótima dupla para decidir coisas.', 'agua+terra': 'A água faz a terra florescer: carinho, cuidado e segurança.', 'agua+ar': 'Coração e cabeça: ouçam-se com paciência e completam-se.' };
const elPair = (a, b) => EL_DUO[[a, b].sort().join('+')] || EL_DUO[[b, a].sort().join('+')] || '';
function spreadIds(seed) { const r = seeded(seed), ids = []; while (ids.length < 3) { const k = Math.floor(r() * 22); if (!ids.includes(k)) ids.push(k); } return ids; }
const POS3 = [['🕰️', 'Passado', 'O que te trouxe até aqui'], ['🌟', 'Presente', 'O que está a acontecer'], ['🔮', 'Futuro', 'Para onde caminhas']];
function openSpread() {
  const me = P.get() || {}, ids = spreadIds('t3' + (me.name || '') + todayStr()), key = 'ceu_tar3_' + todayStr(), done = (store.get(key) || '').split('').map(Number), dlg = $('#tarDlg');
  dlg.innerHTML = `<button class="tx" id="tarX" aria-label="Fechar">✕</button><div class="t3stage"><p class="thint">Pensa numa pergunta ou situação…<br><b>e vira as três cartas</b></p><div class="t3row">${ids.map((i, k) => `<div class="t3c"><small>${POS3[k][0]} ${POS3[k][1]}</small><div class="tflip t3f${done.includes(k) ? ' on' : ''}" data-k="${k}"><div class="tface tbk">${deckSVG(0, { back: true })}<span class="tsh"></span></div><div class="tface tfr">${cardHtml(i, 'tbig')}</div></div></div>`).join('')}</div><div class="tspk">${SPARK(14)}</div></div><div class="tinfo" id="t3Info"></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; $('#tarX').onclick = () => dlg.close();
  const info = () => { const D = (store.get(key) || '').split('').map(Number); $('#t3Info').innerHTML = `<div class="tdet">${[0, 1, 2].filter(k => D.includes(k)).map(k => `<div class="t3r"><h4>${POS3[k][0]} ${POS3[k][1]}: ${TAROT[ids[k]][0]}</h4><small>${POS3[k][2]}</small><p>${TDAY[ids[k]][0]}</p>${k === 2 ? `<p class="tcy">✨ ${TDAY[ids[k]][3]}</p>` : ''}</div>`).join('')}${D.length === 3 ? `<div class="tfy"><h4>A tua leitura</h4><p>Vens de <b>${TAROT[ids[0]][0]}</b>, vives agora <b>${TAROT[ids[1]][0]}</b> e caminhas para <b>${TAROT[ids[2]][0]}</b>. Passas de uma energia de ${EL_N[cardEl(ids[1])]} para ${EL_N[cardEl(ids[2])]}: ${{ fogo: 'é tempo de agir com coragem.', terra: 'é tempo de construir com calma.', ar: 'é tempo de pensar, falar e decidir.', agua: 'é tempo de sentir e confiar na intuição.' }[cardEl(ids[2])]}</p></div><div class="drow"><button class="btn main" id="t3Sh">📤 Partilhar</button></div>` : ''}</div>`; if ($('#t3Sh')) $('#t3Sh').onclick = () => shareSpread(ids); };
  info();
  dlg.querySelectorAll('.t3f').forEach(el => el.onclick = () => { if (el.classList.contains('on')) return; el.classList.add('on'); const k = +el.dataset.k, D = (store.get(key) || '').split('').filter(Boolean); if (!D.includes(String(k))) D.push(String(k)); store.set(key, D.join('')); try { navigator.vibrate && navigator.vibrate(25); } catch (e) { } setTimeout(info, 700); });
}
async function shareSpread(ids) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 't3' + ids.join(), ['#4a1d8a', '#07050f']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 36px Cinzel'; ctx.fillText('A MINHA TIRAGEM DE HOJE', W / 2, 110);
  const cw = 300, gap = 30, x0 = (W - 3 * cw - 2 * gap) / 2;
  for (let k = 0; k < 3; k++) { const im = await cardImg(ids[k]), x = x0 + k * (cw + gap); if (im) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; drawCardOn(ctx, im, ids[k], x, 190, cw); ctx.restore(); } ctx.fillStyle = '#ffe9a8'; ctx.font = '700 30px Manrope'; ctx.fillText(POS3[k][1].toUpperCase(), x + cw / 2, 190 + cw * 5 / 3 + 55); }
  drawSparkles(ctx, W, 760, 1.1, 18, 's3'); ctx.fillStyle = '#fff'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; wrap(ctx, `«${TDAY[ids[2]][3]}»`, W / 2, 1010, W - 160, 56, 2, 'center');
  brandFoot(ctx, W, H); shareCanvases([{ name: 'tiragem-3-cartas', c }], `🃏 A minha tiragem de hoje:\n🕰️ Passado: ${TAROT[ids[0]][0]}\n🌟 Presente: ${TAROT[ids[1]][0]}\n🔮 Futuro: ${TAROT[ids[2]][0]}\n\nFaz a tua em ${APP_URL}`);
}
// carta do casal (link sem contas)
const b64e = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, ''), b64d = s => JSON.parse(decodeURIComponent(escape(atob(s))));
function coupleSend() {
  const me = P.get() || {}, n = (me.name || '').split(' ')[0] || 'Alguém', i = dailyCard(me).i, url = APP_URL + '#casal=' + b64e({ n, i, d: todayStr() });
  const txt = `💑 Tirei uma carta para nós os dois. Agora tira tu a tua e vê a nossa leitura de hoje:\n${url}`;
  (async () => { try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } copyAny(txt); })();
}
function checkCoupleLink() {
  const m = location.hash.match(/casal=([A-Za-z0-9+/_-]+)/); if (!m) return; let o; try { o = b64d(m[1].replace(/-/g, '+').replace(/_/g, '/')); } catch (e) { return; }
  history.replaceState(null, '', location.pathname + location.search); if (o.i == null || !TAROT[o.i]) return; setTimeout(() => openCouple(o), 700);
}
function openCouple(o) {
  const me = P.get() || {}, mine = o.j != null ? o.j : dailyCard(me.name ? me : { name: 'par' + o.n }).i, back = o.j != null, dlg = $('#tarDlg'), myN = (me.name || '').split(' ')[0] || 'Tu';
  const A = back ? o.j : o.i, B = back ? o.i : mine, nA = back ? o.m : o.n, nB = back ? o.n : myN;
  dlg.innerHTML = `<button class="tx" id="tarX" aria-label="Fechar">✕</button><div class="t3stage"><p class="thint">💑 <b>${esc(o.n)}</b> tirou uma carta para vocês os dois.<br>${back ? 'E aqui está a resposta!' : 'Agora toca na tua.'}</p><div class="t3row two"><div class="t3c"><small>${esc(nA)}</small><div class="tflip t3f on"><div class="tface tbk">${deckSVG(0, { back: true })}</div><div class="tface tfr">${cardHtml(A, 'tbig')}</div></div></div><div class="t3c"><small>${esc(nB)}</small><div class="tflip t3f${back ? ' on' : ''}" id="cpMine"><div class="tface tbk">${deckSVG(0, { back: true })}<span class="tsh"></span></div><div class="tface tfr">${cardHtml(B, 'tbig')}</div></div></div></div><div class="tspk">${SPARK(14)}</div></div><div class="tinfo" id="cpInfo"></div>`;
  if (!dlg.open) dlg.showModal(); $('#tarX').onclick = () => dlg.close();
  const show = () => { const ea = cardEl(A), eb = cardEl(B); $('#cpInfo').innerHTML = `<div class="tdet"><h2>A vossa leitura</h2><small>${TAROT[A][0]} + ${TAROT[B][0]} · ${EL_N[ea]} e ${EL_N[eb]}</small><div class="tfy"><p>💞 ${elPair(ea, eb)}</p><p>✨ ${esc(nA)}: ${TDAY[A][1]}</p><p>✨ ${esc(nB)}: ${TDAY[B][1]}</p><p class="tcy">O conselho para os dois: ${TDAY[B][3].charAt(0).toLowerCase() + TDAY[B][3].slice(1)}</p></div><div class="drow">${back ? '' : '<button class="btn main" id="cpBack">💌 Enviar a resposta</button>'}<button class="btn" id="cpSh">📤 Partilhar</button></div>${me.d ? '' : '<p class="note">Instala a Céu de Hoje e põe a tua data: amanhã há carta nova para ti ✨</p>'}</div>`;
    if ($('#cpBack')) $('#cpBack').onclick = () => { const url = APP_URL + '#casal=' + b64e({ n: myN, i: B, j: o.i, m: o.n, d: todayStr() }); const txt = `💌 Já tirei a minha! Vê a nossa leitura:\n${url}`; (async () => { try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } copyAny(txt); })(); };
    $('#cpSh').onclick = () => shareCouple(A, B, nA, nB); };
  if (back) show(); else $('#cpMine').onclick = () => { if ($('#cpMine').classList.contains('on')) return; $('#cpMine').classList.add('on'); setTimeout(show, 800); };
}
async function shareCouple(A, B, nA, nB) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'cp' + A + B, ['#b03a5b', '#12050c']); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 36px Cinzel'; ctx.fillText('A NOSSA CARTA DE HOJE', W / 2, 110);
  const cw = 380, x0 = W / 2 - cw - 25; for (const [k, i, n] of [[0, A, nA], [1, B, nB]]) { const im = await cardImg(i), x = x0 + k * (cw + 50); if (im) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; drawCardOn(ctx, im, i, x, 170, cw); ctx.restore(); } ctx.fillStyle = '#fff'; ctx.font = '700 40px "Cormorant Garamond"'; ctx.fillText(n, x + cw / 2, 170 + cw * 5 / 3 + 55); }
  ctx.font = `70px ${EMOJI_F}`; ctx.fillText('💞', W / 2, 520); ctx.fillStyle = '#fff'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; wrap(ctx, elPair(cardEl(A), cardEl(B)), W / 2, 1060, W - 150, 50, 3, 'center');
  brandFoot(ctx, W, H); shareCanvases([{ name: 'carta-do-casal', c }], `💑 A nossa carta de hoje: ${TAROT[A][0]} + ${TAROT[B][0]}\n${elPair(cardEl(A), cardEl(B))}\n\nFaz a vossa em ${APP_URL}`);
}
const weekCardI = () => Math.floor(seeded('wk' + ((P.get() || {}).name || '') + mondayOf(todayStr()))() * 22);

// ---------- Ouvir o meu dia ----------
function dayScript() {
  const me = P.get() || {}, t = todayStr(), s = skyFor(t), first = (me.name || '').split(' ')[0], out = [];
  out.push(`${new Date().getHours() < 13 ? 'Bom dia' : new Date().getHours() < 20 ? 'Boa tarde' : 'Boa noite'}${first ? ', ' + first : ''}. Hoje é ${niceDate(t).toLowerCase()}.`);
  if (me.d) { const si = sunSignOf(me.d), r = readDay(si, t, ST.modern); out.push(`Para ${SIGNS[si].n}: ${r.headline}`); out.push(`No amor: ${firstSentence(r.love)}`); out.push(`No trabalho: ${firstSentence(r.work || r.trabalho || '')}`); }
  out.push(`A Lua está em ${SIGNS[s.moon.sign].n}, ${moonPhaseName(s.phase.elong)}.`);
  out.push(tarOpened() ? `A tua carta de hoje é ${TAROT[dailyCard(me).i][0]}. ${TDAY[dailyCard(me).i][3]}` : 'A tua carta de hoje está à tua espera. Abre-a quando quiseres.');
  try { const L = todaysBirthdays(); if (L.length) out.push(`Hoje faz anos: ${L.map(x => x.name || x.label).join(', ')}. Não te esqueças de dar os parabéns!`); } catch (e) { }
  out.push('Tem um dia bonito!'); return out.join(' ').replace(/\s+/g, ' ').replace(/[«»“”]/g, '');
}
// voz: a melhor voz de Portugal que o telemóvel tiver, leitura calma frase a frase e música suave por baixo
function getVoicesP() { const S = window.speechSynthesis; if (!S) return Promise.resolve([]); const v = S.getVoices(); if (v.length) return Promise.resolve(v); return new Promise(r => { const t = setTimeout(() => r(S.getVoices()), 1500); S.onvoiceschanged = () => { clearTimeout(t); r(S.getVoices()); }; }); }
const isPT = v => /^pt[-_]PT/i.test(v.lang), isPTany = v => /^pt/i.test(v.lang);
function voiceScore(v) { return (isPT(v) ? 100 : isPTany(v) ? 5 : 0) + (/natural|neural|online|enhanced|premium|melhorad|wavenet/i.test(v.name) ? 25 : 0) + (/joana|catarina|raquel|in[eê]s|fernanda|helia|beatriz|ana/i.test(v.name) ? 8 : 0) + (v.localService ? 2 : 0); }
async function bestVoice() { const V = (await getVoicesP()).filter(isPT), want = store.get('ceu_voice'), chosen = want && V.find(v => v.voiceURI === want); return chosen || null; } // null = pedir «pt-PT» ao telemóvel
const useSystemVoice = () => !store.get('ceu_voice'); // vazio = a voz escolhida nas definições do telemóvel
const AMB = { ctx: null, nodes: [], t: 0 };
function ambientStart() {
  if (store.get('ceu_music') === '0') return; try {
    const C = AMB.ctx = new (window.AudioContext || window.webkitAudioContext)(), out = C.createGain(); out.gain.value = 0; out.connect(C.destination); out.gain.linearRampToValueAtTime(+(store.get('ceu_mvol') || .16), C.currentTime + 2.5);
    const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = .6; lp.connect(out);
    const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = .07; lg.gain.value = 350; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const chords = [[174.6, 261.6, 329.6, 440], [196, 293.7, 349.2, 440], [164.8, 246.9, 329.6, 392], [174.6, 261.6, 349.2, 440]];
    const voices = [0, 1, 2, 3].map(k => { const o = C.createOscillator(), g = C.createGain(); o.type = k ? 'sine' : 'triangle'; o.frequency.value = chords[0][k]; o.detune.value = (k - 1.5) * 4; g.gain.value = k ? .5 : .35; o.connect(g); g.connect(lp); o.start(); return o; });
    let ci = 0; AMB.t = setInterval(() => { ci = (ci + 1) % chords.length; voices.forEach((o, k) => o.frequency.setTargetAtTime(chords[ci][k], C.currentTime, 1.2)); const n = [523.3, 587.3, 659.3, 784, 880][Math.floor(Math.random() * 5)], b = C.createOscillator(), bg2 = C.createGain(); b.type = 'sine'; b.frequency.value = n; bg2.gain.setValueAtTime(0, C.currentTime); bg2.gain.linearRampToValueAtTime(.12, C.currentTime + .02); bg2.gain.exponentialRampToValueAtTime(.0005, C.currentTime + 3.5); b.connect(bg2); bg2.connect(out); b.start(); b.stop(C.currentTime + 3.6); }, 4200);
    AMB.nodes = [out, lfo, ...voices];
  } catch (e) { }
}
function ambientStop() { clearInterval(AMB.t); const C = AMB.ctx; if (!C) return; try { AMB.nodes[0].gain.cancelScheduledValues(C.currentTime); AMB.nodes[0].gain.setTargetAtTime(0, C.currentTime, .6); setTimeout(() => { try { C.close(); } catch (e) { } }, 2500); } catch (e) { } AMB.ctx = null; }
let _spkRun = 0;
async function speakText(text, btn, label) {
  const S = window.speechSynthesis; if (!S) { toast('Este telemóvel não lê em voz alta'); return; }
  if (S.speaking || _spkRun) { _spkRun = 0; S.cancel(); ambientStop(); if (btn) btn.textContent = label; return; }
  const v = await bestVoice();
  const run = ++_spkRun, parts = text.match(/[^.!?]+[.!?]*/g) || [text]; if (btn) btn.textContent = '⏹️ Parar'; ambientStart();
  const say = k => { if (run !== _spkRun) return; if (k >= parts.length) { setTimeout(() => { if (run === _spkRun) { _spkRun = 0; ambientStop(); if (btn) btn.textContent = label; } }, 900); return; }
    const u = new SpeechSynthesisUtterance(parts[k].trim()); if (v) u.voice = v; u.lang = 'pt-PT'; u.rate = +(store.get('ceu_vrate') || .9); u.pitch = 1; u.volume = +(store.get('ceu_vvol') || .7);
    u.onend = () => setTimeout(() => say(k + 1), /[.!?]$/.test(parts[k].trim()) ? 420 : 150); u.onerror = () => say(k + 1); S.speak(u); };
  setTimeout(() => say(0), store.get('ceu_music') === '0' ? 0 : 1400);
}
function speakDay(btn) { return speakText(dayScript(), btn, '🔊 Ouvir o meu dia'); }
function voiceHelp(none) {
  $('#infoTitle').textContent = '🔊 Voz portuguesa';
  $('#infoBody').innerHTML = `<div class="box"><p>A app pede sempre <b>português de Portugal</b>. Se ouves sotaque do Brasil, é porque o motor de voz do telemóvel (muitas vezes o da Samsung) ainda não tem a voz de Portugal, e usa a do Brasil no lugar dela. Resolve-se uma vez, de graça:</p><div class="vsteps"><p><b>Passo 1:</b> nas Definições do telemóvel, procura <b>«texto para voz»</b> (nos Samsung: Gestão geral → Idioma → Texto para voz).</p><p><b>Passo 2:</b> em «Motor preferido», escolhe <b>Serviços de voz da Google</b> (Speech Services by Google). Se não aparecer, instala-o grátis na Play Store.</p><p><b>Passo 3:</b> toca na ⚙️ ao lado → Instalar dados de voz → <b>Português (Portugal)</b> → descarrega e escolhe a voz que mais gostares.</p><p><b>Passo 4:</b> no Idioma do texto para voz, escolhe <b>Português (Portugal)</b>.</p><p><b>Passo 5:</b> fecha a app e o Chrome por completo (nas apps recentes) e volta a abrir.</p><p class="note">No iPhone: Definições → Acessibilidade → Conteúdo falado → Vozes → Português (Portugal) → Joana ou Catarina (melhorada).</p></div></div>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
async function voiceMenu() {
  const box = $('#voiceMenu'); if (!box) return; const V = (await getVoicesP()).filter(isPT).sort((a, b) => voiceScore(b) - voiceScore(a)), cur = store.get('ceu_voice') || '';
  const nm = v => esc(v.name.replace(/Microsoft |Google |Online |\(.*?\)|\s*-\s*Portug.*$/g, '').trim() || v.name);
  box.innerHTML = `<select id="vSel"><option value=""${cur ? '' : ' selected'}>🇵🇹 Português (Portugal)</option>${V.map(v => `<option value="${esc(v.voiceURI)}"${cur === v.voiceURI ? ' selected' : ''}>🇵🇹 ${nm(v)}${/natural|neural|online|enhanced|premium|melhorad/i.test(v.name) ? ' ✨' : ''}</option>`).join('')}</select>
    <label>Velocidade<select id="vRate">${[['.82', 'Muito calma'], ['.9', 'Calma'], ['1', 'Normal']].map(r => `<option value="${r[0]}"${(store.get('ceu_vrate') || '.9') === r[0] ? ' selected' : ''}>${r[1]}</option>`).join('')}</select></label>
    <label class="chk"><input type="checkbox" id="vMus"${store.get('ceu_music') === '0' ? '' : ' checked'}> 🎵 Música suave por baixo</label>
    <label>🎵 Volume da música<select id="vMv">${[['.08', 'Baixo'], ['.16', 'Médio'], ['.28', 'Alto'], ['.4', 'Muito alto']].map(r => `<option value="${r[0]}"${(store.get('ceu_mvol') || '.16') === r[0] ? ' selected' : ''}>${r[1]}</option>`).join('')}</select></label>
    <label>🗣️ Volume da voz<select id="vVv">${[['.45', 'Suave'], ['.7', 'Médio'], ['1', 'Alto']].map(r => `<option value="${r[0]}"${(store.get('ceu_vvol') || '.7') === r[0] ? ' selected' : ''}>${r[1]}</option>`).join('')}</select></label><button class="btn" id="vTry" style="width:100%">▶️ Experimentar</button>
    <p class="note">A app pede sempre português de Portugal. Se mesmo assim ouvires sotaque do Brasil, é porque o telemóvel ainda não tem a voz de Portugal instalada. <button class="link" id="vHelp">Como instalar (2 minutos) ›</button></p>`;
  $('#vSel').onchange = () => { const v = $('#vSel').value; if (v) store.set('ceu_voice', v); else localStorage.removeItem('ceu_voice'); };
  $('#vRate').onchange = () => store.set('ceu_vrate', $('#vRate').value);
  $('#vMus').onchange = e => store.set('ceu_music', e.target.checked ? '1' : '0'); $('#vMv').onchange = () => { store.set('ceu_mvol', $('#vMv').value); if (AMB.ctx && AMB.nodes[0]) AMB.nodes[0].gain.setTargetAtTime(+$('#vMv').value, AMB.ctx.currentTime, .3); }; $('#vVv').onchange = () => store.set('ceu_vvol', $('#vVv').value);
  $('#vTry').onclick = e => speakText(`Olá${(P.get() || {}).name ? ', ' + P.get().name.split(' ')[0] : ''}. Esta é a voz do Céu de Hoje. Hoje a Lua está em ${SIGNS[skyFor(todayStr()).moon.sign].n}. Tem um dia bonito.`, e.currentTarget, '▶️ Experimentar');
  $('#vHelp').onclick = () => { $('#menu').close(); voiceHelp(false); };
}

// ---------- O meu ano astral (aniversário) ----------
const HOUSE_J = ['tu próprio(a): confiança e um novo começo', 'dinheiro e valor próprio', 'aprender, conversar e pequenas viagens', 'casa e família', 'amor, filhos e criatividade', 'saúde, rotina e trabalho do dia a dia', 'relações e parcerias', 'transformação e recursos partilhados', 'grandes viagens, estudos e fé', 'carreira e reconhecimento', 'amigos, grupos e sonhos', 'descanso, espiritualidade e fechar ciclos'];
function yearCardOf(d, y) { let n = +d.slice(8) + +d.slice(5, 7) + String(y).split('').reduce((a, b) => a + +b, 0); while (n > 22) n = String(n).split('').reduce((a, b) => a + +b, 0); return n === 22 ? 0 : n; }
const isMyBday = () => { const me = P.get(), t = todayStr(), y = +t.slice(0, 4), lp = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; return !!(me && me.d && (me.d.slice(5) === t.slice(5) || (me.d.slice(5) === '02-29' && !lp && t.slice(5) === '02-28'))); };
function yearAstral() {
  const me = P.get(); if (!me || !me.d) return null; const t = todayStr(), y = +t.slice(0, 4), lastB = (me.d.slice(5) <= t.slice(5) ? y : y - 1) + me.d.slice(4), s = skyFor(lastB.replace(/-02-29$/, '-02-28')), si = sunSignOf(me.d);
  const hj = (s.jupiter.sign - si + 12) % 12, hs = (s.saturn.sign - si + 12) % 12, yc = yearCardOf(me.d, +lastB.slice(0, 4)), py = personalYear(me.d, +lastB.slice(0, 4));
  return { from: lastB, age: ageOn(me.d, lastB), yc, py, jup: [SIGNS[s.jupiter.sign].n, HOUSE_J[hj]], sat: [SIGNS[s.saturn.sign].n, HOUSE_J[hs]], moon: SIGNS[s.moon.sign].n };
}
function openYearAstral() {
  const Y = yearAstral(); if (!Y) return; const party = isMyBday();
  $('#infoTitle').textContent = '✨ O meu ano astral';
  $('#infoBody').innerHTML = `${party ? `<div class="party bigp">🎉 <b>Parabéns!</b> Hoje começa um ano novo só teu.</div>` : ''}<div class="box"><p class="note">De aniversário a aniversário: o teu ano dos ${Y.age} anos, desde ${niceDate(Y.from)} de ${Y.from.slice(0, 4)}.</p>
    <div class="tcrow">${cardHtml(Y.yc, 'tsm')}<div><small>A carta do teu ano</small><br><b class="tcn">${TAROT[Y.yc][0]}</b><p>${TDAY[Y.yc][0]}</p></div></div></div>
    <div class="box"><h3>🪐 Os planetas do teu ano</h3><p>♃ <b>Júpiter, o planeta da sorte</b>, estava em ${Y.jup[0]} no teu aniversário: o teu ano abre portas em <b>${Y.jup[1]}</b>.</p><p>♄ <b>Saturno, o professor</b>, estava em ${Y.sat[0]}: o trabalho e a lição do ano estão em <b>${Y.sat[1]}</b>.</p><p>🌙 A Lua estava em ${Y.moon}: o tom emocional do teu ano.</p></div>
    <div class="box"><h3>🔢 O teu ano pessoal: ${Y.py}</h3><p>${NUM_INFO && NUM_INFO.py && NUM_INFO.py[Y.py] ? NUM_INFO.py[Y.py] : (typeof DAY_MEAN !== 'undefined' ? cap1(DAY_MEAN[Y.py] || '') : '')}</p></div>
    <button class="btn main" id="yaSh" style="width:100%">📤 Partilhar o meu ano</button><p class="note">A «carta do ano» soma o teu dia e mês de nascimento com o ano do aniversário, como na tradição do Tarot.</p>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal(); $('#infoDlg').scrollTop = 0;
  if (party) confetti(); $('#yaSh').onclick = async () => { await fontsReady(); const im = await cardImg(Y.yc), [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'ya' + Y.from, ['#c99a2a', '#140a02']); ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 36px Cinzel'; ctx.fillText(party ? 'HOJE COMEÇA O MEU ANO' : 'O MEU ANO ASTRAL', W / 2, 110); if (im) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; drawCardOn(ctx, im, Y.yc, W / 2 - 200, 160, 400); ctx.restore(); } drawSparkles(ctx, W, 860, 1.4, 20, 'ya'); ctx.fillStyle = '#fff'; ctx.font = '600 36px Manrope'; ctx.fillText(`♃ Sorte em: ${Y.jup[1].split(':')[0]}`, W / 2, 940); ctx.fillText(`♄ Lição em: ${Y.sat[1].split(':')[0]}`, W / 2, 995); ctx.fillStyle = '#ffe9a8'; ctx.font = 'italic 600 44px "Cormorant Garamond"'; wrap(ctx, `«${TDAY[Y.yc][3]}»`, W / 2, 1090, W - 160, 52, 2, 'center'); brandFoot(ctx, W, H); shareCanvases([{ name: 'o-meu-ano-astral', c }], `✨ O meu ano astral: ${TAROT[Y.yc][0]}\n♃ Sorte em ${Y.jup[1].split(':')[0]}\n\nDescobre o teu em ${APP_URL}`); };
}
function confetti() { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const box = document.createElement('div'); box.className = 'confetti'; box.innerHTML = Array.from({ length: 60 }, (_, k) => `<i style="left:${Math.random() * 100}%;background:${['#f2c76e', '#ff7aa8', '#7ad0ff', '#9be27a', '#c49aff'][k % 5]};animation-delay:${Math.random() * .8}s;animation-duration:${2.4 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join(''); document.body.appendChild(box); setTimeout(() => box.remove(), 4800); }

// ---------- Contagens decrescentes ----------
const CD = { all: () => { try { return JSON.parse(store.get('ceu_countdown') || '[]'); } catch (e) { return []; } }, save: L => store.set('ceu_countdown', JSON.stringify(L)) };
function cdBox() {
  const L = CD.all().filter(x => x.d >= todayStr()).sort((a, b) => a.d.localeCompare(b.d)), t = noonJd(todayStr());
  return `<div class="box cdb" id="sec-cd"><h3>⏳ Contagens</h3>${L.length ? L.map(x => { const n = Math.round(noonJd(x.d) - t); return `<div class="cdr" data-id="${x.id}"><span>${esc(x.e || '⏳')}</span><div><b>${esc(x.t)}</b><small>${niceDate(x.d)} ${x.d.slice(0, 4)} · ${moonEmoji(skyFor(x.d).phase.elong)} Lua em ${SIGNS[skyFor(x.d).moon.sign].n}</small></div><em>${n === 0 ? 'HOJE!' : n === 1 ? 'amanhã' : n + '<small>dias</small>'}</em></div>`; }).join('') : '<p class="note">O casamento, as férias, um concerto… conta os dias e partilha.</p>'}<button class="btn" id="cdNew" style="width:100%;margin-top:6px">＋ Nova contagem</button></div>`;
}
function cdForm(id) {
  const L = CD.all(), x = L.find(z => z.id === id) || { id: 'c' + Date.now(), t: '', d: '', e: '🎉' };
  $('#infoTitle').textContent = id ? '⏳ ' + x.t : '⏳ Nova contagem';
  $('#infoBody').innerHTML = `<div class="form"><label>O quê?<input type="text" id="cdT" maxlength="40" value="${esc(x.t)}" placeholder="Ex.: As nossas férias"></label><label>Quando?<input type="date" id="cdD" min="${todayStr()}" value="${x.d}"></label><div class="chips" id="cdE">${['🎉', '💍', '✈️', '🏖️', '🎂', '🎄', '🎵', '👶', '🏠', '🎓', '⚽', '💖'].map(e => `<button class="qchip${e === x.e ? ' on' : ''}">${e}</button>`).join('')}</div><button class="btn main" id="cdS">Guardar</button>${id ? '<div class="drow"><button class="btn" id="cdSh">📤 Partilhar</button><button class="btn" id="cdX">Apagar</button></div>' : ''}</div>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal();
  let em = x.e; $('#cdE').querySelectorAll('.qchip').forEach(b => b.onclick = () => { $('#cdE').querySelectorAll('.qchip').forEach(z => z.classList.remove('on')); b.classList.add('on'); em = b.textContent; });
  $('#cdS').onclick = () => { const t = $('#cdT').value.trim(), d = $('#cdD').value; if (!t || !d) { toast('Põe o nome e a data'); return; } const o = { id: x.id, t, d, e: em }, M = CD.all(), j = M.findIndex(z => z.id === x.id); if (j >= 0) M[j] = o; else M.push(o); CD.save(M); try { syncAlertData(); } catch (e) { } $('#infoDlg').close(); render(); toast('Guardado ⏳'); };
  if (id) { $('#cdX').onclick = () => { if (!confirmBox('Apagar esta contagem?')) return; CD.save(CD.all().filter(z => z.id !== id)); $('#infoDlg').close(); render(); }; $('#cdSh').onclick = () => shareCd(x); }
}
async function shareCd(x) {
  await fontsReady(); const n = Math.round(noonJd(x.d) - noonJd(todayStr())), [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'cd' + x.id, ['#2a6fd1', '#060a1a']); ctx.textAlign = 'center';
  ctx.font = `150px ${EMOJI_F}`; ctx.fillText(x.e || '⏳', W / 2, 300); ctx.fillStyle = '#fff'; ctx.font = '700 64px "Cormorant Garamond"'; wrap(ctx, x.t, W / 2, 420, W - 160, 70, 2, 'center');
  ctx.fillStyle = '#f7e08a'; ctx.font = '700 280px Cinzel'; ctx.fillText(n === 0 ? 'HOJE' : String(n), W / 2, 800); ctx.fillStyle = '#fff'; ctx.font = '600 52px Manrope'; ctx.fillText(n === 0 ? 'é o grande dia!' : n === 1 ? 'dia… é amanhã!' : 'dias', W / 2, 890);
  ctx.fillStyle = '#d6e4ff'; ctx.font = '500 34px Manrope'; ctx.fillText(`${cap1(niceDate(x.d))} · Lua em ${SIGNS[skyFor(x.d).moon.sign].n}`, W / 2, 1000); brandFoot(ctx, W, H);
  shareCanvases([{ name: 'contagem', c }], `${x.e} ${x.t}: ${n === 0 ? 'é HOJE!' : `faltam ${n} dias!`}\n\n✨ Céu de Hoje ${APP_URL}`);
}
function cdAlerts() { return CD.all().flatMap(x => [{ d: dayStr(noonJd(x.d) - 1), t: `${x.e} É amanhã: ${x.t}!`, b: 'Está quase ✨', tag: 'cd1-' + x.id + x.d, url: './' }, { d: x.d, t: `${x.e} É hoje: ${x.t}!`, b: 'Aproveita cada momento 💛', tag: 'cd0-' + x.id + x.d, url: './' }]); }

// ---------- Diário de sonhos ----------
const DREAM_SYM = [['água|mar|rio|chuva|onda', '💧 Água: as tuas emoções. Calma = paz interior; agitada = algo a mexer contigo.'], ['voar|voava|voar', '🕊️ Voar: vontade de liberdade e de ultrapassar limites.'], ['cair|caía|queda', '🍂 Cair: medo de perder o controlo ou insegurança num assunto.'], ['dente|dentes', '🦷 Dentes: preocupação com a imagem ou com mudanças.'], ['casa', '🏠 Casa: tu próprio(a). Cada divisão é uma parte da tua vida.'], ['cobra|serpente', '🐍 Cobra: transformação, cura ou algo escondido a vir ao de cima.'], ['cão|cachorro', '🐶 Cão: lealdade, amizade e proteção.'], ['gato', '🐱 Gato: independência e intuição.'], ['bebé|bebe|criança', '👶 Bebé: um começo novo, um projeto a nascer.'], ['casamento|noiva|noivo', '💍 Casamento: união de partes de ti, compromisso.'], ['morte|morrer|morreu|funeral', '🦋 Morte: nos sonhos, quase sempre é o fim de uma fase e o início de outra.'], ['perseguir|perseguido|fugir', '🏃 Ser perseguido(a): algo que estás a evitar enfrentar.'], ['exame|teste|escola', '📝 Exame: sentes-te avaliado(a) ou com medo de falhar.'], ['dinheiro|moedas|ouro', '💰 Dinheiro: valor próprio e segurança.'], ['fogo|incêndio|chamas', '🔥 Fogo: paixão, raiva ou purificação.'], ['carro|conduzir', '🚗 Carro: o rumo da tua vida e quem está ao volante.'], ['comboio|avião|viagem', '✈️ Viagem: mudança e caminho novo.'], ['nu|nua|despido', '🙈 Estar sem roupa: medo de te mostrares como és.'], ['ex|antigo namorado|antiga namorada', '💔 Ex: algo do passado ainda por arrumar, nem sempre a pessoa em si.'], ['grávida|gravidez', '🤰 Gravidez: algo a crescer dentro de ti, uma ideia ou um projeto.'], ['aranha', '🕷️ Aranha: criatividade, paciência ou sentir-te preso(a) numa teia.'], ['peixe|peixes', '🐟 Peixe: abundância e intuição.'], ['lua', '🌙 Lua: o teu lado intuitivo e emocional.'], ['sol', '☀️ Sol: alegria, clareza e sucesso.'], ['cabelo', '💇 Cabelo: força pessoal e imagem.'], ['porta|portas', '🚪 Porta: oportunidades e escolhas.'], ['escada|escadas', '🪜 Escadas: subir = progresso; descer = olhar para dentro.'], ['flor|flores|jardim', '🌸 Flores: beleza, amor e coisas a florescer.'], ['sangue', '🩸 Sangue: energia vital, paixão ou cansaço.'], ['perdido|perdida|perder-me', '🧭 Estar perdido(a): indecisão sobre o caminho.']];
const DR = { all: () => { try { return JSON.parse(store.get('ceu_dreams') || '[]'); } catch (e) { return []; } }, save: L => store.set('ceu_dreams', JSON.stringify(L.slice(-300))) };
const dreamSyms = txt => { const t = ' ' + (txt || '').toLowerCase() + ' '; return DREAM_SYM.filter(s => new RegExp('[^a-zà-ú](' + s[0] + ')[^a-zà-ú]').test(t)).map(s => s[1]); };
function openDreams(edit) {
  const L = DR.all().slice().reverse(), t = todayStr(), m = skyFor(dayStr(noonJd(t) - 1)), mn = `${moonEmoji(m.phase.elong)} Esta noite a Lua estava em ${SIGNS[m.moon.sign].n} (${moonPhaseName(m.phase.elong)}).`;
  $('#infoTitle').textContent = '🌙 Diário de sonhos';
  $('#infoBody').innerHTML = `<div class="box"><p class="note">${mn} Escreve logo ao acordar, antes que o sonho fuja.</p><textarea id="drT" rows="4" placeholder="Sonhei que…"></textarea><div id="drSy"></div><button class="btn main" id="drS" style="width:100%">Guardar o sonho</button></div>${L.length ? `<div class="box"><h3>Os teus sonhos</h3>${L.slice(0, 30).map(x => `<div class="drr"><small>${niceDate(x.d)} ${x.d.slice(0, 4)} · ${moonEmoji(skyFor(x.d).phase.elong)}</small><p>${esc(x.t)}</p>${dreamSyms(x.t).slice(0, 3).map(s => `<span class="dsy">${s.split(':')[0]}</span>`).join('')}</div>`).join('')}</div>` : ''}<p class="note">Os símbolos seguem leituras populares dos sonhos: servem para pensar, não são regras.</p>`;
  if (!$('#infoDlg').open) $('#infoDlg').showModal(); $('#infoDlg').scrollTop = 0;
  $('#drT').oninput = () => { const S = dreamSyms($('#drT').value); $('#drSy').innerHTML = S.map(s => `<p class="dsyp">${s}</p>`).join(''); };
  $('#drS').onclick = () => { const v = $('#drT').value.trim(); if (!v) { toast('Escreve o sonho'); return; } const M = DR.all(); M.push({ id: 'd' + Date.now(), d: t, t: v }); DR.save(M); toast('Sonho guardado 🌙'); openDreams(); };
}

// ---------- Arrumação: «Hoje para ti», atalhos e visita guiada ----------
function todayStrip() {
  const me = P.get(); if (!me || !me.d || ST.date !== todayStr() || ST.mode !== 'dia' || ST.pets) return '';
  const si = sunSignOf(me.d), pos = (ST.rank || []).findIndex(r => r.si === si), s = skyFor(todayStr()), L = (() => { try { return todaysBirthdays(); } catch (e) { return []; } })(), first = (me.name || '').split(' ')[0];
  return `<div class="tstrip"><div class="tsh1"><b>${isMyBday() ? '🎂 Parabéns' : 'Olá'}${first ? ', ' + esc(first) : ''}!</b><span><button class="link" id="wk1">📅 Semana</button> · <button class="link" id="spk1">🔊 Ouvir</button></span></div><div class="tsg">
    <button data-go="sign"><span>${G(SIGNS[si].g)}</span><b>${pos >= 0 ? pos + 1 + '.º' : ''}</b><small>${SIGNS[si].n} hoje</small></button>
    <button data-go="tarot"><span>🃏</span><b>${tarOpened() ? TAROT[dailyCard(me).i][0].replace(/^(O|A|Os) /, '') : 'Abrir'}</b><small>a tua carta</small></button>
    <button data-go="lua"><span>${moonEmoji(s.phase.elong)}</span><b>${SIGNS[s.moon.sign].n}</b><small>Lua</small></button>
    <button data-go="anos"><span>🎂</span><b>${L.length || '—'}</b><small>${L.length === 1 ? 'faz anos' : 'aniversários'}</small></button></div>${isMyBday() ? '<button class="btn main" id="yaGo" style="width:100%;margin-top:8px">✨ Ver o meu ano astral</button>' : ''}${new Date().getHours() >= 20 || new Date().getHours() < 4 ? '<button class="btn nightb" id="ntGo" style="width:100%;margin-top:8px">🌙 Ritual da noite</button>' : ''}</div>`;
}
function bindTodayStrip() {
  if (!$('#spk1')) return; $('#spk1').onclick = e => speakText(dayScript(), e.currentTarget, '🔊 Ouvir'); if ($('#wk1')) $('#wk1').onclick = openWeekView; if ($('#yaGo')) $('#yaGo').onclick = openYearAstral; if ($('#ntGo')) $('#ntGo').onclick = openNight;
  document.querySelectorAll('.tsg [data-go]').forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === 'tarot') openTarot(!tarOpened()); else if (g === 'sign') { const si = sunSignOf(P.get().d), el = document.querySelector(`.sc[data-i="${ST.rank.findIndex(r => r.si === si)}"]`); el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { ST.type = g; render(); scrollTo(0, 0); } });
  if (isMyBday() && !store.get('ceu_conf_' + todayStr())) { store.set('ceu_conf_' + todayStr(), '1'); setTimeout(confetti, 400); }
}
function euChips() { return `<div class="euchips">${[['💫', 'Alma', 'soul'], ['🃏', 'Carta', 'tarot'], ['📅', 'Semana', 'week'], ['🌙', 'Noite', 'night'], ['🎁', 'O meu ano', 'wrap'], ['⏳', 'Contagens', 'cd'], ['💭', 'Sonhos', 'dreams'], ['✂️', 'Rotinas', 'rout'], ['🌸', 'Ciclo', 'cyc'], ['🐾', 'Animais', 'pets'], ['🔢', 'Números', 'num'], ['🔮', 'Oráculo', 'oracle'], ['📣', 'Posts', 'posts'], ['✨', 'Ano astral', 'ya']].map(c => `<button data-jump="${c[2]}">${c[0]}<span>${c[1]}</span></button>`).join('')}</div>`; }
function bindEuChips() {
  document.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => { const k = b.dataset.jump; if (k === 'soul') return openSoul(); if (k === 'dreams') return openDreams(); if (k === 'night') return openNight(); if (k === 'week') return openWeekView(); if (k === 'wrap') return openWrapped(); if (k === 'posts') return openStudio(); if (k === 'ya') return openYearAstral();
    const el = { tarot: '.box.tarot', rout: '#sec-rout', cd: '#sec-cd', cyc: '.box.cyc', pets: '#sec-pets', num: '.box.num', oracle: '.box.oracle' }[k]; const n = el && document.querySelector(el); n && n.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  if ($('#cdNew')) $('#cdNew').onclick = () => cdForm(null); document.querySelectorAll('.cdr').forEach(r => r.onclick = () => cdForm(r.dataset.id));
  if ($('#t3Go')) $('#t3Go').onclick = openSpread; if ($('#cpGo')) $('#cpGo').onclick = coupleStart; if ($('#wkGo')) $('#wkGo').onclick = () => openTarot(!store.get('ceu_tarw_' + mondayOf(todayStr())), true);
}
const TOUR = [['✨', 'Bem-vindo(a) ao Céu de Hoje', 'O céu verdadeiro, calculado no teu telemóvel. Sem registo e sem anúncios: os teus dados ficam só contigo.'], ['🌟', 'Hoje', 'No início vês o teu signo, a tua carta do dia, a Lua e quem faz anos. Toca em «🔊 Ouvir o meu dia» e a app lê-te tudo.'], ['🧭', 'Em baixo, os separadores', 'Top dos signos, Pares, Lua, Aniversários, Horas e o teu espaço ✨ Eu, onde guardas o diário, o ciclo, livros, viagens e animais.']];
function maybeTour(force) {
  if (!force && (store.get('ceu_tour') || !P.get())) return; let k = 0; const d = $('#infoDlg');
  const show = () => { $('#infoTitle').textContent = ''; $('#infoBody').innerHTML = `<div class="tour"><span>${TOUR[k][0]}</span><h2>${TOUR[k][1]}</h2><p>${TOUR[k][2]}</p><div class="tdots">${TOUR.map((_, j) => `<i${j === k ? ' class="on"' : ''}></i>`).join('')}</div><button class="btn main" id="tNext">${k < TOUR.length - 1 ? 'Seguinte' : 'Começar ✨'}</button></div>`; $('#tNext').onclick = () => { if (++k >= TOUR.length) { store.set('ceu_tour', '1'); d.close(); } else show(); }; };
  show(); if (!d.open) d.showModal();
}

// ---------- Ficha de cada pessoa (igual aos animais: Hoje · Mapa · Mais, e Editar no fim) ----------
function openPersonSheet(k) {
  const L = P.list('ceu_bdays'), x = L[k]; if (!x) return; const si = x.t ? sunSignAt(x.d, x.t) : sunSignOf(x.d), S = SIGNS[si], cn = chineseSign(x.d), age = ageOn(x.d), dd = daysToBirthday(x.d), first = x.name.split(' ')[0];
  const rd = readDay(si, todayStr(), ST.modern), v = verdict(rd), tab = ST.perTab || 'hoje', me = P.get(), ms = me && me.d ? sunSignOf(me.d) : null;
  const born = skyFor(x.d), isKid = /^(filho|filha|neto|neta)$/.test(x.rel);
  let h = `<div class="pethero" style="--c:${elc(S)}"><span class="em">${esc(relIcon(x))}</span><h3>${esc(x.name)}</h3><p>${esc(relLabel(x))} · <b>${G(S.g)} ${S.n}</b> · ${cn.e} ${cn.n} (${cn.el})</p><p>${age > 0 ? age + (age === 1 ? ' ano' : ' anos') : 'Menos de 1 ano'} · ${dd === 0 ? '🎂 <b>faz anos hoje!</b>' : dd === 1 ? '🎂 faz anos <b>amanhã</b>' : `🎂 anos em ${dd} dias`}</p></div>
    <div class="seg2 ptabs"><button data-xt="hoje"${tab === 'hoje' ? ' class="on"' : ''}>☀️ Hoje</button><button data-xt="mapa"${tab === 'mapa' ? ' class="on"' : ''}>🪐 Mapa</button><button data-xt="mais"${tab === 'mais' ? ' class="on"' : ''}>💞 Mais</button></div>`;
  if (tab === 'hoje') {
    let pair = ''; if (ms != null) { const p = pairsDay(todayStr(), ST.modern).pairs.find(q => (q.a === Math.min(ms, si) && q.b === Math.max(ms, si))); pair = `<div class="box"><h3>💞 Tu e ${esc(first)} hoje</h3><p class="bigpct">${p ? p.score : bond(ms, si).pct}%</p><p>${BOND_TIP[bond(ms, si).k]}</p><button class="btn" id="xPair" style="width:100%">Ver a compatibilidade completa</button></div>`; }
    h += `<button class="link spkx" id="xSpk">🔊 Ouvir o dia de ${esc(first)}</button><div class="vd ${v.k}"><b>${v.icon}</b> ${esc(v.txt)}</div><p class="ph">“${esc(rd.headline)}”</p><div class="ar4" style="--c:${elc(S)}">${AREAS4(rd).map(([l, kk, t]) => `<div><span>${l}</span>${starsH(rd.stars[kk])}<p>${esc(firstSentence(t))}</p></div>`).join('')}</div>${pair}${dd <= 14 ? giftBox(x) : ''}`;
  }
  if (tab === 'mapa') {
    const nn = nameNum(x.name), lp = lifePath(x.d);
    h += coupleMapBox(x) + `<div class="trios"><div class="trio"><span>Sol</span><b>${G(S.g)}</b><em>${S.n}</em></div><div class="trio"><span>Lua</span><b>${G(SIGNS[born.moon.sign].g)}</b><em>${SIGNS[born.moon.sign].n}</em></div><div class="trio"><span>Elemento</span><b>${{ fogo: '🔥', terra: '🌿', ar: '💨', agua: '💧' }[S.el]}</b><em>${{ fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água' }[S.el]}</em></div></div>
      <div class="box"><h3>🌙 Lua de nascimento</h3><p>Nasceu em ${moonPhaseName(born.phase.elong)}, com a Lua em ${SIGNS[born.moon.sign].n}${x.t ? '' : ' (sem a hora, a Lua pode estar no signo vizinho)'}: ${{ fogo: 'sente tudo com intensidade e entusiasmo', terra: 'precisa de segurança e de gestos concretos', ar: 'precisa de conversa e de liberdade', agua: 'é muito sensível e intuitivo(a)' }[SIGNS[born.moon.sign].el]}.</p></div>
      <div class="box num"><h3>🔢 Numerologia</h3><div class="nums"><div><b>${lp}</b><span>Número da vida</span></div><div><b>${nn}</b><span>Número do nome</span></div><div><b>${personalYear(x.d, +todayStr().slice(0, 4))}</b><span>Ano pessoal</span></div></div></div>
      <div class="box">${signExtras(rd)}</div>`;
  }
  if (tab === 'mais') {
    h += `<div class="tools"><button class="btn main" id="xMsg">💬 Mensagem de parabéns pronta</button><button class="btn" id="xPoster">🎉 Criar cartaz de parabéns</button><button class="btn" id="xGift">🎁 Ideias de prenda</button>${x.tel ? `<a class="btn" href="${waLink(x)}" target="_blank" rel="noopener">💬 Dar os parabéns no WhatsApp</a>` : ''}<button class="btn" id="xCard2">🪪 Enviar o cartão (a pessoa guarda na app dela)</button>${isKid ? '<button class="btn" id="xKid">👶 Ficha completa da criança</button>' : ''}<button class="btn" id="xEdit">✏️ Editar</button><button class="btn" id="xDel">🗑️ Apagar</button></div>`;
  }
  $('#perTitle').textContent = ''; $('#perBody').innerHTML = h; $('#perSave').hidden = true; $('#perDel').hidden = true;
  document.querySelectorAll('[data-xt]').forEach(b => b.onclick = () => { ST.perTab = b.dataset.xt; openPersonSheet(k); $('#perDlg').scrollTop = 0; });
  if ($('#xPair')) $('#xPair').onclick = () => { $('#perDlg').close(); openPair(ms, si, [((me && me.name) || '').split(' ')[0], first]); };
  if ($('#xPoster')) $('#xPoster').onclick = () => { $('#perDlg').close(); ST.type = 'anos'; ST.anosView = 'criar'; render(); showBday({ name: x.name, rel: x.rel, d: x.d, t: x.t, showAge: true, from: ((me && me.name) || '').split(' ')[0] }, false); };
  if ($('#xCard2')) $('#xCard2').onclick = () => sharePerson(x);
  if ($('#xMsg')) $('#xMsg').onclick = () => openBdMsg(k); if ($('#xGift')) $('#xGift').onclick = () => { $('#infoTitle').textContent = '🎁 Ideias de prenda'; $('#infoBody').innerHTML = giftBox(x); $('#infoDlg').showModal(); };
  if ($('#cmSh')) $('#cmSh').onclick = () => shareCoupleMap(x);
  if ($('#xSpk')) $('#xSpk').onclick = e => speakText(`${first}, ${S.n}. ${rd.headline}. No amor: ${firstSentence(rd.love)} No trabalho: ${firstSentence(rd.work || '')}`, e.currentTarget, '🔊 Ouvir o dia de ' + first);
  if ($('#xKid')) $('#xKid').onclick = () => { $('#perDlg').close(); const i = kids().findIndex(z => z.name === x.name && z.d === x.d); openKid(i >= 0 ? i : 0); };
  if ($('#xEdit')) $('#xEdit').onclick = () => openPerson(k);
  if ($('#xDel')) $('#xDel').onclick = () => { if (!confirmBox(`Apagar ${x.name}?`)) return; const M = P.list('ceu_bdays'); M.splice(k, 1); P.setList('ceu_bdays', M); $('#perDlg').close(); render(); };
  if (!$('#perDlg').open) $('#perDlg').showModal();
}
// carta do casal: primeiro viras a tua, depois envias
function coupleStart() {
  const me = P.get() || {}, i = dailyCard(me).i, dlg = $('#tarDlg'), pr = P.list('ceu_bdays').find(x => /^(mulher|marido|namorada|namorado|noiva|noivo|companheira|companheiro)$/.test(x.rel)), pn = pr ? pr.name.split(' ')[0] : 'o teu par';
  dlg.innerHTML = `<button class="tx" id="tarX" aria-label="Fechar">✕</button><div class="tstage"><p class="thint">💑 A carta do casal<br><b>Pensa em ${esc(pn)}… e toca na carta</b></p><div class="tglow"></div><div class="tflip" id="cpFlip"><div class="tface tbk">${deckSVG(0, { back: true })}<span class="tsh"></span></div><div class="tface tfr">${cardHtml(i, 'tbig')}</div></div><div class="tspk">${SPARK(16)}</div><div class="tburst" id="cpBurst"></div></div><div class="tinfo" id="cpI"></div>`;
  if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; $('#tarX').onclick = () => dlg.close();
  $('#cpFlip').onclick = () => { const st = dlg.querySelector('.tstage'); if (st.classList.contains('open')) return; st.classList.add('open'); try { navigator.vibrate && navigator.vibrate([20, 40, 30]); } catch (e) { }
    $('#cpBurst').innerHTML = Array.from({ length: 22 }, (_, k) => `<b style="--a:${k * 360 / 22}deg;--d:${120 + (k % 5) * 30}px"></b>`).join('');
    setTimeout(() => { dlg.querySelector('.thint').innerHTML = `<b>${TAROT[i][0]}</b>`; $('#cpI').innerHTML = `<div class="tdet"><p>A tua carta para o casal hoje é <b>${TAROT[i][0]}</b>: ${TDAY[i][1]}</p><div class="tfy"><h4>Agora é a vez de ${esc(pn)}</h4><p>Envia-lhe a tua carta. Quando ${esc(pn)} virar a carta, aparece a vossa leitura a dois 💞</p></div><button class="btn main" id="cpSend" style="width:100%">💌 Enviar a ${esc(pn)}</button></div>`; $('#cpSend').onclick = coupleSend; }, 900);
  };
}
