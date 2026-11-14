// ===== Sabias que…? (padrões teus + baú de curiosidades), viagens × ciclo × céu, modo gravidez =====
const BAU = [
  ['🌌', 'Os signos já não batem certo com as estrelas', 'O eixo da Terra oscila devagar (cerca de 1 grau a cada 72 anos). Por isso, hoje o Sol passa diante de cada constelação quase um mês depois das datas do horóscopo ocidental, que foram fixadas há mais de 2000 anos.'],
  ['⛎', 'Existe um 13.º signo esquecido', 'O Sol também atravessa a constelação de Ofiúco (o Serpentário), mais ou menos entre 29 de novembro e 17 de dezembro. A astrologia ocidental ficou com 12 signos para dividir o ano em partes iguais.'],
  ['🌙', 'A Lua está a fugir de nós', 'Afasta-se da Terra cerca de 3,8 cm por ano, mais ou menos o que as tuas unhas crescem no mesmo tempo.'],
  ['🌗', 'Vemos sempre a mesma face da Lua', 'A Lua demora o mesmo tempo a rodar sobre si própria e a dar a volta à Terra. Por isso há um lado que nunca vemos daqui (não é escuro, só está virado para o outro lado).'],
  ['📅', 'Os dias da semana em português são únicos', 'Quase todas as línguas latinas usam os planetas (lunes, martes, mercoledì…). Em português ficaram «segunda-feira», «terça-feira»… por influência de São Martinho de Dume, bispo de Braga no século VI, que não queria nomes de deuses pagãos no calendário.'],
  ['🪐', 'Cada dia da semana tem um planeta', 'Segunda é da Lua (lunes), terça de Marte (martes), quarta de Mercúrio, quinta de Júpiter, sexta de Vénus, sábado de Saturno (Saturday) e domingo do Sol (Sunday). Eram os 7 «astros errantes» que os antigos viam no céu.'],
  ['🤪', '«Lunático» vem da Lua', 'Durante séculos acreditou-se que a Lua Cheia mexia com a cabeça das pessoas. A palavra latina «lunaticus» quer dizer, literalmente, «afetado pela Lua».'],
  ['💫', '«Desastre» quer dizer «má estrela»', 'Vem de «dis-astro»: um astro mal posicionado. E a gripe chama-se «influenza» em italiano porque se pensava que vinha da influência das estrelas.'],
  ['🔵', 'A «Lua azul» não é azul', 'É o nome da segunda Lua Cheia dentro do mesmo mês. Acontece mais ou menos a cada 2 a 3 anos, daí a expressão inglesa «once in a blue moon» (muito raramente).'],
  ['🗓️', 'Há meses de fevereiro sem Lua Cheia', 'O ciclo da Lua dura 29,5 dias e fevereiro pode ter só 28. Quando isso acontece, janeiro e março ficam com duas Luas Cheias cada um.'],
  ['🩸', '«Menstruação» e «mês» são da mesma família', 'Ambas vêm do latim «mensis» (mês), aparentado com a palavra grega para Lua. O ciclo da Lua (29,5 dias) e o ciclo menstrual médio são parecidos, mas os estudos não mostram que andem sincronizados.'],
  ['👶', 'A Lua Cheia não faz nascer mais bebés', 'É uma crença antiga nas maternidades, mas os grandes estudos com milhões de partos não encontram diferença nenhuma.'],
  ['📆', 'Só uns 4% dos bebés nascem na data prevista', 'A maioria nasce nas duas semanas à volta dessa data. Por isso o signo do bebé muitas vezes só se sabe mesmo no dia.'],
  ['☀️', 'O Sol é quase tudo', 'Tem cerca de 99,8% de toda a massa do Sistema Solar. A Terra, Júpiter e o resto cabem nos 0,2% que sobram.'],
  ['⏱️', 'O Sol que vês já é passado', 'A luz do Sol demora cerca de 8 minutos e 20 segundos a chegar até nós. Se o Sol desaparecesse, só darias por isso uns 8 minutos depois.'],
  ['♀️', 'Em Vénus, um dia é mais longo do que um ano', 'Vénus demora 243 dias terrestres a rodar sobre si própria e só 225 a dar a volta ao Sol. E roda ao contrário: lá, o Sol nasce a oeste.'],
  ['☿', 'Mercúrio não anda para trás', 'O retrógrado é um efeito de perspetiva das órbitas, como quando ultrapassas um carro na autoestrada e ele parece recuar. Acontece 3 ou 4 vezes por ano, durante umas 3 semanas.'],
  ['🛁', 'Saturno flutuaria na água', 'É tão leve para o tamanho que tem (menos denso do que a água) que, numa banheira gigante, ficaria a boiar.'],
  ['♄', 'A «crise dos 30» tem nome na astrologia', 'Saturno demora cerca de 29,5 anos a dar a volta ao Sol. Volta à posição em que estava quando nasceste por volta dos 29-30 anos: é o famoso «retorno de Saturno», associado a fazer balanços e a crescer.'],
  ['🐉', 'O horóscopo chinês tem 12 animais por causa de Júpiter', 'Júpiter demora quase 12 anos a dar a volta ao Sol, e os antigos astrónomos chineses usavam esse ciclo para contar os anos.'],
  ['🧧', 'O ano chinês não começa a 1 de janeiro', 'Começa na Lua Nova entre 21 de janeiro e 20 de fevereiro. Quem nasce em janeiro ou início de fevereiro pode ter o animal do ano anterior.'],
  ['🌑', 'Os eclipses repetem-se de 18 em 18 anos', 'Ao fim de 18 anos e 11 dias (o ciclo «saros»), o Sol, a Terra e a Lua voltam quase à mesma posição e repete-se um eclipse muito parecido.'],
  ['🎯', 'Os eclipses totais são uma coincidência incrível', 'O Sol é cerca de 400 vezes maior do que a Lua, mas também está cerca de 400 vezes mais longe. Por isso, vistos daqui, parecem do mesmo tamanho e a Lua tapa-o na perfeição.'],
  ['🇪🇸', 'A Península está em época de eclipses', 'A 12 de agosto de 2026 houve um eclipse total do Sol em Espanha, o primeiro lá desde 1905. E já há outro marcado: 2 de agosto de 2027, no sul de Espanha.'],
  ['💎', 'As pedras de cada mês foram escolhidas por joalheiros', 'A lista moderna de uma pedra por mês foi fixada em 1912 por uma associação de joalheiros nos Estados Unidos. As listas antigas variavam de país para país.'],
  ['⚖️', 'Balança é o único signo que é um objeto', 'Todos os outros são animais ou pessoas (Gémeos, Virgem, Aquário…). E Capricórnio, nas imagens antigas, é metade cabra, metade peixe.'],
  ['🎂', 'O paradoxo do aniversário', 'Basta juntar 23 pessoas para haver mais de 50% de hipóteses de duas fazerem anos no mesmo dia. Com 70 pessoas, é quase certo (99,9%).'],
  ['🐸', 'Nascer a 29 de fevereiro', 'A probabilidade é de 1 em 1461. Quem nasce nesse dia só tem o «dia certo» de 4 em 4 anos.'],
  ['🃏', 'O Tarot começou por ser um jogo', 'Nasceu em Itália no século XV como jogo de cartas (os «tarocchi»). Só no século XVIII começou a ser usado para ler o futuro.'],
  ['🔢', 'Na numerologia há números que não se reduzem', 'O 11, o 22 e o 33 são os «números mestres»: na tradição, não se somam até dar um só algarismo.'],
  ['🐶', 'O nariz do teu cão é único', 'As marcas no focinho de cada cão são como uma impressão digital: não há dois iguais.'],
  ['🐱', 'Os gatos miam para nós', 'Entre gatos adultos quase não há miados. O miado é sobretudo uma forma que eles desenvolveram para falar com os humanos.'],
  ['📚', 'Há uma palavra para comprar livros e não os ler', 'Em japonês chama-se «tsundoku»: ir juntando livros que ficam à espera na estante. Se te identificas, não estás sozinho(a).'],
  ['📖', 'O cheiro a livro velho tem um quê de baunilha', 'Com o tempo, o papel liberta compostos químicos parecidos com os da baunilha e das amêndoas. É por isso que as livrarias antigas cheiram tão bem.'],
  ['🗺️', 'Portugal tem das fronteiras mais antigas do mundo', 'A fronteira com Espanha está praticamente igual desde o Tratado de Alcanizes, em 1297.'],
  ['✈️', 'O jet lag é pior a ir para leste', 'Para o corpo é mais fácil esticar o dia (ir para oeste) do que encurtá-lo (ir para leste).'],
  ['⭐', 'A Estrela Polar não é a mais brilhante', 'A mais brilhante do céu noturno é Sírius. E a Polar vai mudar: daqui a uns 12 000 anos, a estrela que vai apontar o norte é Vega.'],
  ['🔭', 'Olhar para as estrelas é olhar para o passado', 'A luz de muitas estrelas que vês partiu há centenas ou milhares de anos. Algumas podem já nem existir.'],
  ['🌍', 'Estamos mais perto do Sol em janeiro', 'A Terra passa no ponto mais próximo do Sol no início de janeiro. O inverno não tem a ver com a distância, mas com a inclinação da Terra.'],
  ['🌅', 'O pôr do sol mais cedo não é no dia mais curto', 'Em Portugal, o Sol põe-se mais cedo no início de dezembro, umas duas semanas antes do solstício de inverno. E nasce mais tarde já em janeiro.'],
  ['🌕', 'A Lua no horizonte é uma ilusão', 'Parece enorme quando nasce, mas tem o mesmo tamanho do que lá em cima. É o cérebro que se engana ao compará-la com casas e árvores.'],
  ['🌝', 'A Superlua é mesmo maior', 'Quando a Lua Cheia calha no ponto mais próximo da Terra, pode parecer até 14% maior e 30% mais brilhante do que quando está mais longe.'],
  ['✨', 'A «estrela do pastor» é um planeta', 'O ponto mais brilhante ao anoitecer ou ao amanhecer costuma ser Vénus. Depois da Lua, é o astro mais brilhante do céu noturno.'],
  ['🌕', 'Numa vida inteira há umas 990 Luas Cheias', 'Em 80 anos vês cerca de 990. Quantas já terás visto com atenção?'],
  ['🍂', 'A Lua das Colheitas', 'É a Lua Cheia mais perto do equinócio de outono. Nasce cedo várias noites seguidas, e dava luz extra aos agricultores para acabarem as colheitas.'],
  ['🗓️', 'O equinócio não é sempre no dia 21', 'Pode calhar entre 19 e 21 de março, e entre 22 e 23 de setembro. Por isso as datas dos signos mudam um dia de ano para ano.']
];
// ---------- coisas sobre ti, a partir da data de nascimento ----------
function lifeFacts() {
  const me = P.get(); if (!me || !me.d) return [];
  const out = [], t = todayStr(), days = Math.round(noonJd(t) - noonJd(me.d)), yrs = days / 365.25, nf = n => n.toLocaleString('pt-PT'), b = skyFor(me.d), wd = WDAY[wdOf(me.d)];
  const d10 = dayStr(noonJd(me.d) + 10000), d20 = dayStr(noonJd(me.d) + 20000);
  out.push(['🗓️', `Já viveste ${nf(days)} dias`, d10 > t ? `O teu dia 10 000 vai ser a ${niceDate(d10)} de ${d10.slice(0, 4)}. Merece festa!` : d20 > t ? `O teu dia 10 000 foi a ${niceDate(d10)} de ${d10.slice(0, 4)}. O dia 20 000 vai ser a ${niceDate(d20)} de ${d20.slice(0, 4)}.` : `O teu dia 20 000 foi a ${niceDate(d20)} de ${d20.slice(0, 4)}.`]);
  out.push(['🌕', `Já viveste cerca de ${nf(Math.floor(days / 29.53))} Luas Cheias`, `E já deste ${Math.floor(yrs)} voltas ao Sol: perto de ${nf(Math.round(yrs * 0.94))} mil milhões de quilómetros pelo espaço, sem sair do sítio.`]);
  out.push(['💓', 'O teu coração já bateu', `perto de ${days * 0.1 >= 1000 ? (days * 0.1 / 1000).toFixed(1).replace('.', ',') + ' mil milhões' : nf(Math.round(days * 0.1)) + ' milhões'} de vezes (contando umas 100 mil batidas por dia).`]);
  out.push([moonEmoji(b.phase.elong), `Nasceste em ${moonPhaseName(b.phase.elong)}`, `A Lua estava ${Math.round(b.phase.illum * 100)}% iluminada, em ${SIGNS[b.moon.sign].n}. Foi ${numa(wdOf(me.d))} ${wd[0].toLowerCase()}, o dia de ${wd[1]}: ${wd[2]}.`]);
  if (b.mercury.rx) out.push(['☿', 'Nasceste com Mercúrio retrógrado', 'Acontece a cerca de 1 em cada 5 pessoas. Na astrologia, são pessoas que pensam duas vezes, reveem tudo e têm ideias fora do comum.']);
  const age19 = Math.ceil((Math.floor(yrs) + 1) / 19) * 19;
  out.push(['🔁', `Aos ${age19} anos, a Lua vai repetir-se`, `De 19 em 19 anos, a Lua volta quase à mesma fase no mesmo dia do ano. No teu aniversário de ${age19} anos (${+me.d.slice(0, 4) + age19}), vais ter uma Lua parecida com a do dia em que nasceste.`]);
  const sat = dayStr(noonJd(me.d) + 29.46 * 365.25), sat2 = dayStr(noonJd(me.d) + 58.9 * 365.25);
  out.push(['♄', sat > t ? `O teu retorno de Saturno vem aí` : 'Já tiveste o teu retorno de Saturno', sat > t ? `Por volta de ${MESES[+sat.slice(5, 7) - 1]} de ${sat.slice(0, 4)}, Saturno volta onde estava quando nasceste: a famosa fase de balanço dos 29-30 anos.` : `Foi por volta de ${MESES[+sat.slice(5, 7) - 1]} de ${sat.slice(0, 4)}, aos 29 anos. ${sat2 > t ? `O segundo vem por volta de ${sat2.slice(0, 4)}.` : ''}`]);
  let jn = noonJd(me.d); while (jn < noonJd(t)) jn += 11.86 * 365.25;
  out.push(['♃', 'O teu próximo regresso de Júpiter', `Júpiter, o planeta da sorte, volta ao sítio onde estava quando nasceste mais ou menos de 12 em 12 anos. O próximo é por volta de ${MESES[+dayStr(jn).slice(5, 7) - 1]} de ${dayStr(jn).slice(0, 4)}: na tradição, um ano de portas abertas.`]);
  const nb = (() => { const y = +t.slice(0, 4), c = y + me.d.slice(4); return c >= t ? c : (y + 1) + me.d.slice(4); })().replace(/-02-29$/, '-02-28');
  out.push(['🎂', `O teu próximo aniversário calha ${numa(wdOf(nb))} ${WDAY[wdOf(nb)][0].toLowerCase()}`, `${niceDate(nb)} de ${nb.slice(0, 4)}, com a Lua em ${SIGNS[skyFor(nb).moon.sign].n} (${moonPhaseName(skyFor(nb).phase.elong)}).`]);
  const sid = Math.floor(norm(b.sun.lon - 24) / 30);
  if (sid !== sunSignOf(me.d)) out.push(['🕉️', `Na astrologia indiana serias de ${SIGNS[sid].n}`, `A astrologia védica usa a posição real das estrelas, que hoje está uns 24 graus desviada. Por isso, para eles, o teu Sol estava em ${SIGNS[sid].n} e não em ${SIGNS[sunSignOf(me.d)].n}.`]);
  return out;
}
const numa = k => k === 0 || k === 6 ? 'num' : 'numa';
function moonEmoji(e) { return ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][Math.round(e / 45) % 8]; }
// ---------- padrões teus (só aparecem com dados suficientes) ----------
function cyPhaseOn(ds, o, st) {
  const S = st.S; let i = -1; for (let k = 0; k < S.length; k++) if (S[k].d <= ds) i = k; if (i < 0) return null;
  const day = Math.round(noonJd(ds) - noonJd(S[i].d)) + 1, L = S[i + 1] ? Math.round(noonJd(S[i + 1].d) - noonJd(S[i].d)) : st.avg; if (day > L || L > 60) return null;
  const ov = L - st.lut, per = S[i].e ? Math.round(noonJd(S[i].e) - noonJd(S[i].d)) + 1 : st.per;
  return day <= per ? 'menstrual' : day >= ov - 5 && day <= ov + 1 ? 'fertil' : day < ov - 5 ? 'folicular' : 'lutea';
}
function myPatterns() {
  const out = [], D = (() => { try { return DIA.all(); } catch (e) { return []; } })(), av = a => a.reduce((x, y) => x + y, 0) / a.length, f1 = n => n.toFixed(1).replace('.', ',');
  const PHN = { menstrual: 'no período', folicular: 'na fase folicular (depois do período)', fertil: 'na janela fértil', lutea: 'na fase lútea (antes do período)' };
  try { const o = CY.get(); if (o.on && D.length >= 10) { const st = cycleStats(o), g = {}; D.forEach(x => { const ph = cyPhaseOn(x.d, o, st); if (ph) (g[ph] = g[ph] || []).push(x.mood); }); const ok = Object.entries(g).filter(e => e[1].length >= 3).map(e => [e[0], av(e[1]), e[1].length]).sort((a, b) => b[1] - a[1]); if (ok.length >= 2 && ok[0][1] - ok[ok.length - 1][1] >= .5) out.push(['🌸', `Os teus dias mais bem-dispostos são ${PHN[ok[0][0]]}`, `No teu diário, o humor médio é ${f1(ok[0][1])} ${PHN[ok[0][0]]} e ${f1(ok[ok.length - 1][1])} ${PHN[ok[ok.length - 1][0]]}. Saber isto ajuda a marcar o que é importante nos teus melhores dias.`, 'p']); } } catch (e) { }
  if (D.length >= 8) { const full = D.filter(x => { const e = skyFor(x.d).phase.elong; return e > 165 && e < 195; }), rest = D.filter(x => !full.includes(x)); if (full.length >= 3 && rest.length >= 5) { const a = av(full.map(x => x.mood)), b = av(rest.map(x => x.mood)); if (Math.abs(a - b) >= .4) out.push(['🌕', a > b ? 'Andas mais feliz nas Luas Cheias' : 'As Luas Cheias pesam-te um bocadinho', `Nos dias de Lua Cheia o teu humor médio é ${f1(a)}; nos outros dias é ${f1(b)}. ${a > b ? 'Aproveita essas noites!' : 'Nessas noites, mais calma e menos decisões importantes.'}`, 'p']); } }
  if (D.length >= 14) { const w = [0, 1, 2, 3, 4, 5, 6].map(k => D.filter(x => wdOf(x.d) === k).map(x => x.mood)), ok = w.map((a, k) => [k, a.length >= 2 ? av(a) : null]).filter(x => x[1] != null).sort((a, b) => b[1] - a[1]); if (ok.length >= 3) out.push(['📅', `O teu melhor dia da semana é a ${DIAS[ok[0][0]].toLowerCase()}`, `É o dia em que o teu diário fica mais sorridente. O mais difícil costuma ser a ${DIAS[ok[ok.length - 1][0]].toLowerCase()}.`, 'p']); }
  if (D.length >= 10) { const tg = {}; D.forEach(x => (x.tags || []).forEach(t => (tg[t] = tg[t] || []).push(x.mood))); const all = av(D.map(x => x.mood)), best = Object.entries(tg).filter(e => e[1].length >= 3).map(e => [e[0], av(e[1])]).sort((a, b) => b[1] - a[1])[0]; if (best && best[1] - all >= .4) out.push(['💛', `«${best[0]}» faz-te bem`, `Nos dias em que escreves sobre «${best[0]}», o teu humor fica acima da tua média (${f1(best[1])} contra ${f1(all)}).`, 'p']); }
  try { const L = intList('livros').filter(x => x.status === 2 && x.ed); if (L.length >= 6) { const m = Array(12).fill(0); L.forEach(x => m[+x.ed.slice(5, 7) - 1]++); const top = m.indexOf(Math.max(...m)); if (m[top] >= 2) out.push(['📚', `${cap1(MESES[top])} é o teu mês de leitura`, `É o mês em que acabaste mais livros (${m[top]}). ${['dezembro', 'janeiro', 'fevereiro'].includes(MESES[top]) ? 'Mantinha e livro, a combinação perfeita.' : ['julho', 'agosto'].includes(MESES[top]) ? 'Livros de férias, os melhores.' : ''}`, 'p']);
    const d = L.filter(x => x.sd).map(x => ({ w: skyFor(x.sd).phase.elong < 180, n: Math.max(1, Math.round(noonJd(x.ed) - noonJd(x.sd))) })), a = d.filter(x => x.w), b = d.filter(x => !x.w); if (a.length >= 3 && b.length >= 3) { const ma = av(a.map(x => x.n)), mb = av(b.map(x => x.n)); if (Math.abs(ma - mb) >= 3) out.push(['🌙', `Lês mais depressa o que começas com Lua ${ma < mb ? 'crescente' : 'minguante'}`, `Livros começados com Lua crescente: ${Math.round(ma)} dias em média. Com Lua minguante: ${Math.round(mb)} dias. Coincidência ou não, fica a curiosidade 😉`, 'p']); } } } catch (e) { }
  try { const B = P.list('ceu_bdays').filter(x => x.d); if (B.length >= 5) { const c = Array(12).fill(0); B.forEach(x => c[sunSignOf(x.d)]++); const top = c.indexOf(Math.max(...c)); if (c[top] >= 2) out.push(['🎂', `Estás rodeado(a) de ${SIGNS[top].n}`, `É o signo mais comum na tua agenda: ${c[top]} pessoas. ${(() => { const me = P.get(); return me && me.d && sunSignOf(me.d) === top ? 'E tu também és! Atrais os teus.' : ''; })()}`, 'p']); const md = {}; B.forEach(x => { const k = x.d.slice(5); (md[k] = md[k] || []).push(x.name); }); const twin = Object.values(md).find(v => v.length >= 2); if (twin) out.push(['👯', `${twin[0]} e ${twin[1]} fazem anos no mesmo dia`, 'Com o paradoxo do aniversário, não é assim tão raro, mas dá jeito: uma só festa 🎉', 'p']); } } catch (e) { }
  try { const T = intList('viagens').filter(x => x.status === 2 && x.sd); if (T.length >= 4) { const m = Array(12).fill(0); T.forEach(x => m[+x.sd.slice(5, 7) - 1]++); const top = m.indexOf(Math.max(...m)); if (m[top] >= 2) out.push(['✈️', `${cap1(MESES[top])} é o teu mês de partir`, `Das tuas ${T.length} viagens, ${m[top]} começaram em ${MESES[top]}.`, 'p']); } } catch (e) { }
  return out;
}
function factPool() { return [...myPatterns(), ...lifeFacts().map(f => [...f, 'l']), ...BAU.map(f => [...f, 'b'])]; }
function factToday() { // um teu padrão novo tem prioridade; depois alterna entre ti e o baú
  const P0 = myPatterns(), seen = JSON.parse(store.get('ceu_factseen') || '[]'), fresh = P0.find(p => !seen.includes(p[1]));
  if (fresh) return [...fresh];
  const L = lifeFacts(), n = Math.round(noonJd(todayStr())), pool = n % 3 === 0 && L.length ? L.map(f => [...f, 'l']) : BAU.map(f => [...f, 'b']);
  return pool[Math.floor(seeded('fact' + todayStr())() * pool.length)];
}
const FACT_LBL = { p: 'Sobre ti, pelos teus dados', l: 'Sobre ti', b: 'Do baú' };
function factBox() {
  const f = ST.fact || factToday(); ST.fact = f;
  return `<div class="box fact"><h3>🧠 Sabias que…?</h3><small class="flbl">${FACT_LBL[f[3]]}</small><p class="ft"><span>${f[0]}</span><b>${esc(f[1])}</b></p><p>${esc(f[2])}</p><div class="drow"><button class="btn" id="fNext">🔄 Outra</button><button class="btn" id="fShare">📤 Partilhar</button></div><button class="link fall" id="fAll">📦 Abrir o baú: ${BAU.length} curiosidades e tudo sobre ti ›</button></div>`;
}
function bindFact() {
  if (!$('#fNext')) return;
  if (ST.fact && ST.fact[3] === 'p') { const s = JSON.parse(store.get('ceu_factseen') || '[]'); if (!s.includes(ST.fact[1])) { s.push(ST.fact[1]); store.set('ceu_factseen', JSON.stringify(s.slice(-60))); } }
  $('#fNext').onclick = () => { const pool = factPool(); let f; do f = pool[Math.floor(Math.random() * pool.length)]; while (pool.length > 1 && ST.fact && f[1] === ST.fact[1]); ST.fact = f; const box = $('#fNext').closest('.fact'); box.outerHTML = factBox(); bindFact(); };
  $('#fShare').onclick = async () => { const c = await drawFact(ST.fact); shareCanvases([{ name: 'sabias-que', c }], `🧠 Sabias que… ${ST.fact[1]}?\n\n${ST.fact[2]}\n\n✨ Céu de Hoje ${APP_URL}`); };
  $('#fAll').onclick = openBau;
}
function openBau() {
  const P0 = myPatterns(), L = lifeFacts(), row = f => `<div class="bau"><span>${f[0]}</span><div><b>${esc(f[1])}</b><p>${esc(f[2])}</p></div></div>`;
  $('#infoTitle').textContent = '📦 O baú do Sabias que';
  $('#infoBody').innerHTML = `${P0.length ? `<div class="box"><h3>🔍 Os teus padrões</h3>${P0.map(row).join('')}<p class="note">Saem do teu diário, ciclo, livros, viagens e agenda. São padrões, não causas.</p></div>` : '<div class="box"><h3>🔍 Os teus padrões</h3><p class="note">Escreve no diário e regista livros, viagens e o ciclo: com umas semanas de dados, a app começa a descobrir padrões só teus.</p></div>'}
    ${L.length ? `<div class="box"><h3>🙋 Sobre ti</h3>${L.map(row).join('')}</div>` : ''}<div class="box"><h3>📦 Curiosidades que quase ninguém sabe</h3>${BAU.map(row).join('')}</div>`;
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
async function drawFact(f) {
  await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'fact' + f[1], ['#5b3fd1', '#120c30']); ctx.textAlign = 'center';
  const fs = fitFont(ctx, f[1], W - 160, 66, 44, s => `700 ${s}px "Cormorant Garamond"`); ctx.font = `700 ${fs}px "Cormorant Garamond"`; const tl = linesOf(ctx, f[1], W - 160).slice(0, 3);
  ctx.font = '500 38px Manrope'; const bl = linesOf(ctx, f[2], W - 180).slice(0, 11);
  const total = 70 + 40 + 190 + tl.length * fs * 1.15 + 40 + bl.length * 56; let y = Math.max(110, (H - 90 - total) / 2 + 50);
  ctx.fillStyle = '#f2c76e'; ctx.font = '700 42px Cinzel'; ctx.fillText('SABIAS QUE…?', W / 2, y); y += 40;
  ctx.font = `140px ${EMOJI_F}`; ctx.fillText(f[0], W / 2, y + 150); y += 190 + fs;
  ctx.fillStyle = '#fff'; ctx.font = `700 ${fs}px "Cormorant Garamond"`; tl.forEach((l, i) => ctx.fillText(l, W / 2, y + i * fs * 1.15)); y += (tl.length - 1) * fs * 1.15 + 80;
  ctx.fillStyle = '#e8e1ff'; ctx.font = '500 38px Manrope'; bl.forEach((l, i) => ctx.fillText(l, W / 2, y + i * 56));
  brandFoot(ctx, W, H); return c;
}

// ---------- Viagens × ciclo × céu ----------
function predPeriods(fromD, toD) { // dias de período previstos num intervalo
  try { const o = CY.get(); if (!o.on || o.preg) return []; const st = cycleStats(o); if (!st.last) return []; const out = []; let n = noonJd(st.next); const end = noonJd(toD);
    if (st.ongoing) for (let k = 0; k < st.per; k++) out.push(dayStr(noonJd(st.last.d) + k));
    while (n <= end + st.per) { for (let k = 0; k < st.per; k++) out.push(dayStr(n + k)); n += st.avg; }
    return out.filter(d => d >= fromD && d <= toD); } catch (e) { return []; }
}
function tripWatch(x) {
  if (!x.sd || x.status === 2) return '';
  const a = x.sd, b = x.ed && x.ed >= x.sd ? x.ed : x.sd, days = daysIn(a, b).slice(0, 60), out = [], nd = d => niceDate(d).replace(/^[^,]+, /, '');
  const pp = predPeriods(a, b); if (pp.length) out.push(`🩸 Pelas tuas contas, o período deve calhar ${pp.length >= days.length ? 'durante a viagem toda' : `a partir de ${nd(pp[0])}${pp[0] === a ? ', logo no 1.º dia' : ''}`}. Leva o que precisas na mala 💗`);
  try { const o = CY.get(); if (o.preg) { const w = Math.floor((noonJd(a) - noonJd(o.preg.d)) / 7); if (w >= 0 && w <= 42) out.push(`🤰 Vais estar com ${w} semanas de gravidez.${w >= 28 ? ' Muitas companhias aéreas pedem uma declaração médica a partir das 28 semanas: confirma antes.' : ' Fala com o teu médico antes de viajar.'}`); } } catch (e) { }
  const rx = days.filter(d => skyFor(d).mercury.rx); if (rx.length) out.push(`☿ Mercúrio retrógrado ${rx.length === days.length ? 'a viagem toda' : `em ${rx.length} dia${rx.length > 1 ? 's' : ''} da viagem`}: confirma voos, reservas e documentos duas vezes.`);
  try { eventsBetween(a, b, false, true).forEach(e => { if (e.type !== 'lua') return; const d = dayStr(e.jd); if (e.eclipse) out.push(`${e.eclipse === 'solar' ? '🌑' : '🌕'} Há um eclipse ${e.eclipse} a ${nd(d)}! Vê se é visível do teu destino.`); else if (e.kind === 'cheia') out.push(`🌕 Lua Cheia a ${nd(d)}: noite perfeita para uma fotografia ou um jantar com vista.`); else if (e.kind === 'nova') out.push(`🌑 Lua Nova a ${nd(d)}: céu escuro, a melhor noite para ver estrelas longe das luzes.`); }); } catch (e) { }
  if (!out.length) return '';
  return `<div class="box tripw"><h3>🧳 Antes de ires</h3>${out.map(s => `<p>${s}</p>`).join('')}</div>`;
}

// ---------- Modo gravidez ----------
const PREG_SIZE = [null, null, null, null, 'uma semente de papoila', 'uma semente de sésamo', 'uma lentilha', 'um mirtilo', 'uma framboesa', 'uma cereja', 'um morango', 'um figo', 'uma lima', 'uma vagem de ervilhas', 'um limão', 'uma maçã', 'um abacate', 'uma romã', 'uma batata-doce', 'uma manga', 'uma banana', 'uma cenoura', 'uma papaia', 'uma toranja', 'uma maçaroca de milho', 'uma couve-flor', 'uma alface', 'uma couve', 'uma beringela', 'uma abóbora pequena', 'um repolho', 'um coco', 'uma jaca pequena', 'um ananás', 'um melão pequeno', 'um melão', 'uma alface romana', 'uma acelga', 'um alho-francês', 'uma abóbora', 'uma melancia pequena', 'uma melancia', 'uma melancia'];
const PREG_STEP = { 6: 'Nesta altura já se pode ver o coração a bater numa ecografia.', 8: 'Altura habitual da primeira consulta de gravidez, se ainda não foi.', 11: 'Entre as 11 e as 13 semanas e 6 dias faz-se a ecografia do 1.º trimestre.', 12: 'Fim do 1.º trimestre à vista: para muitas mães, os enjoos começam a acalmar.', 14: 'Começa o 2.º trimestre, muitas vezes o mais tranquilo.', 18: 'Entre as 18 e as 22 semanas podes começar a sentir os primeiros movimentos.', 20: 'Entre as 20 e as 22 semanas faz-se a ecografia morfológica, a mais detalhada.', 24: 'Entre as 24 e as 28 semanas costuma fazer-se a prova da glicose.', 28: 'Começa o 3.º trimestre. Boa altura para pensar no plano de parto.', 30: 'Entre as 30 e as 32 semanas faz-se a ecografia do 3.º trimestre.', 35: 'Entre as 35 e as 37 semanas costuma fazer-se a pesquisa do estreptococo.', 37: 'A partir das 37 semanas o bebé já é considerado de termo. A mala da maternidade está pronta?', 40: 'É a data prevista, mas só uns 4% dos bebés nascem neste dia.' };
function pregInfo(o) {
  const p = o.preg, t = noonJd(todayStr()), lmp = noonJd(p.d), due = p.due || dayStr(lmp + 280), dd = Math.round(t - lmp), w = Math.floor(dd / 7), d = dd % 7;
  const tri = w < 14 ? 1 : w < 28 ? 2 : 3, left = Math.round(noonJd(due) - t), sgs = [...new Set(daysIn(dayStr(noonJd(due) - 14), dayStr(noonJd(due) + 10)).map(x => sunSignOf(x)))];
  const step = Object.keys(PREG_STEP).map(Number).filter(k => k <= w).pop();
  return { w, d, tri, due, left, sign: sunSignOf(due), sgs, size: PREG_SIZE[Math.min(42, w)], step: step != null && w - step <= 2 ? PREG_STEP[step] : '' };
}
function pregBox(o) {
  const I = pregInfo(o), pct = Math.max(2, Math.min(100, (I.w * 7 + I.d) / 280 * 100)), nm = o.preg.name ? esc(o.preg.name) : 'o bebé';
  return `<div class="box cyc preg" style="--pc:#e98bc4"><h3>🤰 A minha gravidez</h3><div class="pgtop"><b>${I.w}<small>semanas${I.d ? ` e ${I.d} dia${I.d > 1 ? 's' : ''}` : ''}</small></b><div><p>${I.size ? `Esta semana, ${nm} tem o tamanho de <b>${I.size}</b>.` : 'Os primeiros dias de uma grande aventura 💗'}</p><small>${I.tri}.º trimestre</small></div></div><div class="drprog"><i style="width:${pct}%"></i></div>
    <div class="cyinfo"><div><span>📅 Data provável</span><b>${niceDate(I.due).replace(/^[^,]+, /, '')}</b><small>${I.left > 0 ? `faltam ${I.left} dias` : 'já pode ser a qualquer momento'}</small></div><div><span>✨ Signo do bebé</span><b>${SIGNS[I.sign].g} ${SIGNS[I.sign].n}</b><small>${I.sgs.length > 1 ? 'ou ' + I.sgs.filter(s => s !== I.sign).map(s => SIGNS[s].n).join(' / ') : ''}</small></div></div>
    ${I.step ? `<p class="due">${I.step}</p>` : ''}<div class="drow"><button class="btn main" id="pgMom">📸 Momento</button><button class="btn" id="pgMore">⋯ Mais</button></div></div>`;
}
function openPreg() {
  const o = CY.get(), I = pregInfo(o);
  $('#infoTitle').textContent = '🤰 A minha gravidez';
  $('#infoBody').innerHTML = `<div class="box"><h3>✨ O signo do bebé</h3><p>Pela data provável (${niceDate(I.due)}), ${o.preg.name ? esc(o.preg.name) : 'o bebé'} seria de <b>${SIGNS[I.sign].n}</b>: ${KID_SIGN[I.sign].c.charAt(0).toLowerCase() + KID_SIGN[I.sign].c.slice(1)}</p>${I.sgs.length > 1 ? `<p class="note">Como a maioria dos bebés nasce nas semanas à volta da data prevista, também pode ser de ${I.sgs.filter(s => s !== I.sign).map(s => SIGNS[s].n).join(' ou ')}. Só se sabe mesmo no dia!</p>` : ''}<button class="btn" id="pgShare" style="width:100%">📤 Partilhar o anúncio</button></div>
    <div class="box"><h3>✏️ Os dados</h3><div class="form"><label>Nome do bebé (se já houver)<input type="text" id="pgN" maxlength="24" value="${esc(o.preg.name || '')}"></label><label>1.º dia da última menstruação<input type="date" id="pgD" value="${o.preg.d}" max="${todayStr()}"></label><label>Data prevista pelo médico (se for diferente)<input type="date" id="pgDue" value="${o.preg.due || ''}"></label><button class="btn main" id="pgSave">Guardar</button></div><p class="note">A data prevista pela ecografia do 1.º trimestre é a mais certa: se o médico te deu outra, põe-na aqui.</p></div>
    <div class="box"><h3>👶 Já nasceu?</h3><button class="btn main" id="pgBorn" style="width:100%">🎉 O bebé nasceu!</button><p class="note">Cria a ficha do bebé nos filhos, com o mapa do céu, e os momentos da gravidez passam para ele(a).</p></div>
    <p class="note">💗 As semanas e exames são uma orientação geral: segue sempre o que te dizem o teu médico, enfermeira e o boletim de saúde da grávida. <button class="link" id="pgEnd">Terminar o acompanhamento da gravidez</button></p>`;
  const sv = fn => { const c = CY.get(); fn(c); CY.set(c); };
  $('#pgSave').onclick = () => { const d = $('#pgD').value; if (!d) { toast('Põe a data'); return; } sv(c => { c.preg.d = d; c.preg.due = $('#pgDue').value || ''; c.preg.name = $('#pgN').value.trim(); }); toast('Guardado 💗'); render(); openPreg(); };
  $('#pgShare').onclick = async () => { const c = await drawPreg(CY.get()); shareCanvases([{ name: 'vem-ai-um-bebe', c }], `🤰 Vem aí ${o.preg.name || 'um bebé'}! 💗\n\n✨ Céu de Hoje ${APP_URL}`); };
  $('#pgBorn').onclick = () => kidForm(null, { name: o.preg.name || '', d: todayStr(), rel: 'filha' }, x => { sv(c => { c.preg = null; c.ttc = false; }); try { const L = MOM.all(); L.forEach(m => { if (m.who === 'bebe') m.who = 'kid:' + x.name; }); MOM.save(L); } catch (e) { } toast('Bem-vindo(a), ' + x.name + '! 💛'); });
  $('#pgEnd').onclick = () => { if (!confirmBox('Terminar o acompanhamento da gravidez? Os momentos guardados ficam.')) return; sv(c => { c.preg = null; c.ttc = false; }); $('#infoDlg').close(); render(); };
  $('#infoDlg').scrollTop = 0; if (!$('#infoDlg').open) $('#infoDlg').showModal();
}
async function drawPreg(o) {
  const I = pregInfo(o); await fontsReady(); const [c, ctx, W, H] = newCanvas(); bg(ctx, W, H, 'preg' + o.preg.d, ['#ff8fc4', '#3a1040']);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2c76e'; ctx.font = '700 40px Cinzel'; ctx.fillText('VEM AÍ', W / 2, 170);
  ctx.fillStyle = '#fff'; const n = o.preg.name || 'um bebé'; ctx.font = `700 ${fitFont(ctx, n, W - 160, 120, 60, s => `700 ${s}px "Cormorant Garamond"`)}px "Cormorant Garamond"`; ctx.fillText(n, W / 2, 310);
  ctx.font = `200px ${EMOJI_F}`; ctx.fillText('👶', W / 2, 580);
  ctx.fillStyle = '#ffd9e6'; ctx.font = '600 40px Manrope'; ctx.fillText(`Data prevista: ${MESES[+I.due.slice(5, 7) - 1]} de ${I.due.slice(0, 4)}`, W / 2, 720);
  ctx.font = `110px ${SYMF}`; ctx.fillStyle = '#f2c76e'; ctx.fillText(SIGNS[I.sign].g + VS, W / 2, 900);
  ctx.fillStyle = '#fff'; ctx.font = 'italic 600 46px "Cormorant Garamond"'; ctx.fillText(`Um pequeno ${SIGNS[I.sign].n} a caminho?`, W / 2, 990);
  brandFoot(ctx, W, H); return c;
}
function bindPreg() {
  if ($('#pgMom')) $('#pgMom').onclick = () => momForm(null, 'bebe');
  if ($('#pgMore')) $('#pgMore').onclick = openPreg;
  if ($('#cyPos')) $('#cyPos').onclick = () => { const c = CY.get(), st = cycleStats(c); if (!st.last) return; c.preg = { d: st.last.d, due: '', name: '' }; CY.set(c); toast('Parabéns! 💗🤰'); render(); };
}
function pregAlerts() { // avisos com a app fechada: início de cada semana e exames
  try { const o = CY.get(); if (!o.on || !o.preg) return []; const lmp = noonJd(o.preg.d), out = [];
    for (let w = 4; w <= 41; w++) { const d = dayStr(lmp + w * 7), I = PREG_SIZE[w]; out.push({ d, t: `🤰 Começam hoje as ${w} semanas`, b: PREG_STEP[w] || (I ? `O bebé tem o tamanho de ${I}.` : ''), tag: 'preg-w' + w + '-' + o.preg.d, url: './?ciclo' }); }
    return out; } catch (e) { return []; }
}
