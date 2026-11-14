// ===== Animais, perfil, numerologia, oráculo, parabéns, instalação =====

// ---------- ANIMAIS ----------
const PET_MOON = [null,
  ['Hoje é a estrela da casa: quer atenção total!', 'Dia de mimo a dobrar.'], ['Pensa na tigela: apetite em alta.', 'Quer o seu cantinho e as suas coisas.'],
  ['Curioso e conversador: vai «falar» contigo.', 'Passeios curtos e cheiros novos.'], ['Caseiro: o sofá é o melhor sítio do mundo.', 'Quer a família toda por perto.'],
  ['Brincalhão ao máximo: tira os brinquedos!', 'Dia de travessuras.'], ['Rotina é tudo: horas certas para comer e passear.', 'Bom dia para cuidar do pelo e das unhas.'],
  ['Quer companhia: não gosta de ficar sozinho.', 'Pode fazer um novo amigo de quatro patas.'], ['Instinto apurado: anda desconfiado.', 'Esconde-se e observa tudo.'],
  ['Aventureiro: quer explorar sítios novos.', 'Um passeio diferente faz-lhe bem.'], ['Quer mostrar quem manda lá em casa.', 'Dia bom para treinar e aprender truques.'],
  ['Sociável: adora visitas e outros animais.', 'Feliz no meio da festa.'], ['Dorminhoco: deixa-o descansar.', 'Precisa de sossego e de um cantinho calmo.']];
const PET_TXT = {
  amor: [['Pode estar mais distante: dá-lhe espaço.'], ['Mimos q.b.: respeita o espaço dele.', 'Gosta de festas, mas no tempo dele.'], ['Carinhoso como nunca: aproveita para miminhos.', 'Vai querer colo o dia todo.']],
  trabalho: [['Pouca vontade de brincar: não insistas.'], ['Uma sessão curta de brincadeira chega.', 'Brincar um pouco antes de jantar faz-lhe bem.'], ['Energia para brincar e aprender truques.', 'Dia perfeito para um brinquedo novo.']],
  dinheiro: [['Pode comer menos; se durar mais de um dia, fala com o veterinário.'], ['Come bem, dentro da rotina.', 'Apetite normal: mantém as horas certas.'], ['Apetite em alta: cuidado com os petiscos a mais!', 'Vai pedir petiscos com olhos de anjo.']],
  energia: [['Dia de sofá: passeios curtos.'], ['Passeio normal, ao ritmo dele.', 'Um passeio tranquilo chega.'], ['Pronto para um passeio longo!', 'Energia a mil: corre, salta, explora.']]
};
const PET_TRAIT = ['é corajoso e não para quieto', 'adora comer e dormir', 'é curioso e brincalhão', 'é muito apegado à família', 'gosta de ser o centro das atenções', 'é limpinho e gosta de rotina', 'é meigo e sociável', 'é leal e protetor', 'adora aventuras e passeios', 'é sério e obediente', 'é independente e original', 'é sensível e sonhador'];
const PET_KW = ['', 'Estrela da casa', 'Apetite', 'Curiosidade', 'Sofá', 'Brincadeira', 'Rotina', 'Companhia', 'Instinto', 'Aventura', 'Treino', 'Visitas', 'Soneca'];
function petize(rd) {
  const r = seeded('pet' + ST.date + ST.mode + rd.si), lv = n => n >= 4 ? 2 : n >= 3 ? 1 : 0, o = Object.assign({}, rd, { pet: true });
  o.headline = rd.mode === 'dia' ? pick(PET_MOON[rd.H.moon], r) : pick(PET_MOON[((rd.H.sun || 1))], r);
  o.keyword = PET_KW[rd.mode === 'dia' ? rd.H.moon : rd.H.sun] || rd.keyword;
  o.love = pick(PET_TXT.amor[lv(rd.stars.amor)], r); o.work = pick(PET_TXT.trabalho[lv(rd.stars.trabalho)], r);
  o.money = pick(PET_TXT.dinheiro[lv(rd.stars.dinheiro)], r); o.energy = pick(PET_TXT.energia[lv(rd.stars.energia)], r);
  o.advice = `${petTip(rd)} Como bom ${rd.sign.n}, ${PET_TRAIT[rd.si]}.`;
  o.highlights = null; return o;
}
const PET_GOOD = { amor: 'dia de muito carinho', trabalho: 'ótimo para brincar e treinar', dinheiro: 'vai adorar a refeição', energia: 'perfeito para passear' };
const PET_BAD = { amor: 'pode estar mais sensível, dá-lhe espaço', trabalho: 'evita brincadeiras brutas', dinheiro: 'atenção ao que come', energia: 'nada de grandes esforços' };
function petVerdict(rd) {
  const ks = ['amor', 'trabalho', 'dinheiro', 'energia'], best = ks.reduce((a, b) => rd.area[b] > rd.area[a] ? b : a), worst = ks.reduce((a, b) => rd.area[b] < rd.area[a] ? b : a);
  if (rd.overall >= 70) return { k: 'bom', col: '#7ee0a6', icon: '✓', txt: `Dia feliz: ${PET_GOOD[best]}.` };
  if (rd.overall <= 50 || rd.area[worst] <= 40) return { k: 'cuidado', col: '#ffb36b', icon: '!', txt: `Dia sensível: ${PET_BAD[worst]}.` };
  return { k: 'misto', col: '#ffe3a3', icon: '≈', txt: `${cap1(PET_GOOD[best])}; ${PET_BAD[worst]}.` };
}

// ---------- NUMEROLOGIA ----------
const redNum = n => { while (n > 9 && ![11, 22, 33].includes(n)) n = String(n).split('').reduce((a, b) => a + +b, 0); return n; };
const digits = s => String(s).replace(/\D/g, '').split('').reduce((a, b) => a + +b, 0);
const lifePath = d => redNum(digits(d));
const personalYear = (d, y) => redNum(digits(d.slice(5)) + digits(String(y)));
const numDay = (d, today) => redNum(personalYear(d, +today.slice(0, 4)) + digits(today.slice(5)));
const NUM_MEAN = { 1: 'liderança e coragem', 2: 'harmonia e parcerias', 3: 'criatividade e alegria', 4: 'trabalho e estabilidade', 5: 'liberdade e mudança', 6: 'amor e família', 7: 'sabedoria e intuição', 8: 'sucesso e prosperidade', 9: 'generosidade e coração grande', 11: 'inspiração (número mestre)', 22: 'grande construtor (número mestre)', 33: 'amor sem limites (número mestre)' };
const YEAR_MEAN = { 1: 'ano de recomeços', 2: 'ano de paciência e parcerias', 3: 'ano de alegria e expressão', 4: 'ano de trabalho e bases sólidas', 5: 'ano de mudanças e liberdade', 6: 'ano de família e amor', 7: 'ano de reflexão e aprendizagem', 8: 'ano de colheita e dinheiro', 9: 'ano de fechar ciclos', 11: 'ano de inspiração', 22: 'ano de grandes obras', 33: 'ano de amor' };
const DAY_MEAN = { 1: 'começa algo novo', 2: 'coopera e ouve', 3: 'diverte-te e cria', 4: 'organiza e trabalha', 5: 'arrisca e muda a rotina', 6: 'cuida de quem amas', 7: 'reflete e descansa', 8: 'trata de dinheiro', 9: 'fecha assuntos pendentes', 11: 'confia na intuição', 22: 'pensa em grande', 33: 'ajuda alguém' };
const sunSignOf = d => { const [y, m, dd] = d.split('-').map(Number); return Math.floor(sunLon(jdFromMs(Date.UTC(y, m - 1, dd, 12))) / 30); };

// ---------- PERFIL ----------
const P = {
  get() { try { const p = JSON.parse(store.get('ceu_profile') || 'null'); if (p) return p; const me = JSON.parse(store.get('ceu_me') || 'null'); return me ? { name: '', d: me.d, t: me.t, c: me.c } : null; } catch (e) { return null; } },
  set(p) { store.set('ceu_profile', JSON.stringify(p)); },
  list(k) { try { return JSON.parse(store.get(k) || '[]'); } catch (e) { return []; } },
  setList(k, v) { store.set(k, JSON.stringify(v)); }
};
function daysToBirthday(d, today = todayStr()) {
  const [ty, tm, td] = dParts(today), [, m, dd] = dParts(d), lp = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, at = y => Date.UTC(y, m - 1, m === 2 && dd === 29 && !lp(y) ? 28 : dd); // 29 fev festeja-se a 28 nos anos comuns
  let next = at(ty); const t0 = Date.UTC(ty, tm - 1, td);
  if (next < t0) next = at(ty + 1);
  return Math.round((next - t0) / 864e5);
}
const ageOn = (d, today = todayStr()) => { const [y, m, dd] = dParts(d), [ty, tm, td] = dParts(today); return ty - y - ((tm < m || (tm === m && td < dd)) ? 1 : 0); };

// ---------- ORÁCULO ----------
const norm2 = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SIGN_KEYS = ['carneiro|aries', 'touro', 'gemeos', 'caranguejo|cancer', 'leao', 'virgem', 'balanca|libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'];
const ORACLE_SUGGEST = ['Como vai o meu amor hoje?', 'Ele gosta de mim? Sim ou não', 'Que signos combinam comigo?', 'Qual é o meu ascendente?', 'Quando é a próxima lua cheia?', 'Posso cortar o cabelo hoje?', 'Qual o melhor dia desta semana para o trabalho?', 'Como lidar com o meu filho hoje?', 'Mercúrio está retrógrado?', 'Qual é o meu signo chinês?'];
function oracle(q, prof) {
  const t = norm2(q), name = prof && prof.name ? prof.name.split(' ')[0] : '';
  const mySign = prof && prof.d ? sunSignOf(prof.d) : null;
  const signs = SIGN_KEYS.map((k, i) => new RegExp('\\b(' + k + ')\\b').test(t) ? i : -1).filter(i => i >= 0);
  const has = re => re.test(t);
  const kq = typeof oracleKids === 'function' ? oracleKids(t) : null; if (kq) return kq;
  const xq = typeof oracleExtra === 'function' ? oracleExtra(t, prof) : null; if (xq) return xq;
  let ds = todayStr(), when = 'hoje';
  if (has(/amanha/)) { ds = dayStr(noonJd(ds) + 1); when = 'amanhã'; } else if (has(/ontem/)) { ds = dayStr(noonJd(ds) - 1); when = 'ontem'; }
  const target = signs.length && !has(/combin|compat|dou-me|dou me|entendo|par\b/) ? signs[0] : mySign;
  const hi = name ? name + ', ' : '';
  if (target === null && !has(/lua|cabelo|semear|retrog|mercurio|hora|fertil|gravid|engravid|bebe/)) return `Para te responder melhor, guarda primeiro a tua data de nascimento aqui em cima, ou diz-me o teu signo na pergunta (ex.: «Como vai o amor para Leão?»).`;
  const rd = target !== null ? readDay(target, ds, ST.modern) : null, sg = target !== null ? SIGNS[target] : null;
  const st = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const areaOf = () => has(/amor|namor|paixao|relac|crush|casar|beij|ex\b|coracao|romance/) ? 'amor' : has(/trabalh|emprego|chefe|entrevista|negocio|carreira|patrao|promoc|curso|exame/) ? 'trabalho' : has(/dinheiro|euromilh|lotari|totoloto|compr|invest|salario|divid|credito|financ|aposta/) ? 'dinheiro' : has(/saude|energia|cansad|dormir|treino|ginasio|doente|dieta/) ? 'energia' : null;
  const area = areaOf();
  if (has(/^(ola|oi|bom dia|boa tarde|boa noite)/)) return `Olá${name ? ' ' + name : ''}! ✨ Pergunta-me sobre o amor, o trabalho, o dinheiro, a sorte, a Lua ou com quem combinas.`;
  if (signs.length >= 1 && has(/combin|compat|dou-me|dou me|entendo|par\b|com (o|a) /) && (mySign !== null || signs.length >= 2)) {
    const a = signs.length >= 2 ? signs[0] : mySign, b = signs.length >= 2 ? signs[1] : signs[0];
    const PD = pairsDay(ds, ST.modern), p = PD.pairs.find(x => (x.a === Math.min(a, b) && x.b === Math.max(a, b)));
    return `${hi}${SIGNS[a].n} ${G(SIGNS[a].g)} + ${SIGNS[b].n} ${G(SIGNS[b].g)} ${when}: <b>${p.score}%</b>. ${cap1(PAIR_TXT[p.k])}${/[!.]$/.test(PAIR_TXT[p.k]) ? '' : '.'} ${p.score >= 80 ? 'Os astros aprovam! 💞' : p.score >= 60 ? 'Há química, com um pouco de paciência.' : 'Hoje pede calma e diálogo.'}`;
  }
  if (has(/fertil|gravid|engravid|bebe|filho/)) {
    const best = luaBest('fertilidade', ds, dayStr(noonJd(ds) + 30)).slice(0, 4).map(d => +d.slice(8));
    return `👶 Pela tradição lunar, os dias com a Lua em signos de água e em Touro são os mais «férteis»: nos próximos 30 dias, dias ${best.join(', ')}.<br><small>A Lua não decide a fertilidade: a janela fértil real depende da ovulação. Vê a calculadora pelo ciclo no separador 🌙 Lua e, se estão a tentar há mais de 12 meses (6 meses a partir dos 35 anos), falem com o médico de família ou um especialista.</small>`;
  }
  if (has(/cabelo|cortar|semear|plantar|horta|podar|lua/)) {
    const D = lunarDay(ds); return `🌙 ${when[0].toUpperCase() + when.slice(1)} a Lua está em ${SIGN_IN[D.sign]} (${D.ph}). ✂ ${D.hair}. 🌱 ${D.type[0]}: bom para semear ${D.type[1]}.`;
  }
  if (has(/retrog|mercurio/)) {
    const s = skyFor(ds), rx = (ST.modern ? ALLP : CLASSIC).filter(p => s[p].rx).map(p => PL[p].n);
    const nxt = eventsBetween(ds, dayStr(noonJd(ds) + 120), false, true).filter(e => e.type === 'estacao' && e.p === 'mercury')[0];
    return `${s.mercury.rx ? '☿ Sim, Mercúrio está retrógrado: revê mensagens e contratos.' : '☿ Não, Mercúrio está direto.'} ${rx.length ? 'Retrógrados agora: ' + rx.join(', ') + '.' : ''} ${nxt ? `Muda de sentido a ${new Date(msFromJd(nxt.jd)).getUTCDate()} de ${MESES[new Date(msFromJd(nxt.jd)).getUTCMonth()]}.` : ''}`;
  }
  if (has(/hora|agora|quando ligar|a que horas/) && !has(/melhor dia/)) {
    const PH = planetaryHours(todayStr(), city()), now = Date.now(), cur = PH && PH.hours.find(h => now >= h.start && now < h.end);
    const want = area === 'amor' ? 'venus' : area === 'dinheiro' ? 'jupiter' : area === 'trabalho' ? 'mercury' : null;
    const nx = want && PH ? PH.hours.find(h => h.p === want && h.end > now) : null;
    return `⏳ ${cur ? `Agora é a hora de ${PL[cur.p].n} (boa para ${HOUR_USE[cur.p]}) até às ${fmtHM(cur.end, city()[3])}.` : ''} ${nx ? `Para ${area}, espera pela hora de ${PL[want].n}: ${fmtHM(nx.start, city()[3])}.` : ''}`;
  }
  if (has(/numerolog|numero da vida|caminho de vida/) && prof && prof.d) {
    const lp = lifePath(prof.d), py = personalYear(prof.d, +todayStr().slice(0, 4)), pd = numDay(prof.d, todayStr());
    return `🔢 ${hi}o teu número da vida é <b>${lp}</b> (${NUM_MEAN[lp]}). Estás num ${YEAR_MEAN[py]} (ano pessoal ${py}) e hoje é dia ${pd}: ${DAY_MEAN[pd]}.`;
  }
  if (has(/sorte|numero/)) return `🍀 ${hi}${when}, o número da sorte de ${sg.n} é <b>${rd.lucky}</b>, a cor é ${PL[rd.fav].cor.toLowerCase()} e o astro a favor é ${PL[rd.fav].n}.${has(/euromilh|lotari|totoloto|aposta/) ? ' Lembra-te: os astros dão boa energia, mas não escolhem números vencedores — joga só por diversão.' : ''}`;
  if (has(/quando|melhor dia|que dia/)) {
    const k = area || 'amor', days = [...Array(14)].map((_, i) => dayStr(noonJd(todayStr()) + i)), sc = days.map(d => [d, scoreDay(target, skyFor(d), housesOf(target, skyFor(d)))[k]]).sort((a, b) => b[1] - a[1]);
    const nd = d => { const [y, m, dd] = dParts(d); return `${DIAS[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()].toLowerCase()}, ${dd} de ${MESES[m - 1]}`; };
    return `📅 ${hi}nos próximos 14 dias, o melhor dia de ${sg.n} para ${k === 'energia' ? 'a energia' : 'o ' + k} é <b>${nd(sc[0][0])}</b>. Também é bom ${nd(sc[1][0])}.`;
  }
  if (has(/devo|vou conseguir|sera que|vale a pena|arrisc|sim ou nao/)) {
    const v = rd.overall + (area ? rd.area[area] - 60 : 0) + (seeded(t + ds)() * 16 - 8);
    const ans = v >= 72 ? 'Sim! Os astros estão do teu lado.' : v >= 58 ? 'Sim, mas com calma e sem pressas.' : v >= 46 ? 'Talvez. Espera por um dia melhor se puderes.' : 'Hoje não. Dá tempo ao tempo.';
    return `🔮 ${hi}${hi ? ans[0].toLowerCase() + ans.slice(1) : ans} ${area ? `${cap1(area)} ${when}: ${st(rd.stars[area])}.` : `${sg.n} ${when}: ${st(toStars(rd.overall))}.`}`;
  }
  if (area) { const tx = { amor: rd.love, trabalho: rd.work, dinheiro: rd.money, energia: rd.energy }[area]; return `${hi}${area} para ${sg.n} ${when}: ${st(rd.stars[area])}<br>${tx}${has(/euromilh|lotari|totoloto|aposta|ganhar/) ? `<br><small>Os astros não escolhem números vencedores: joga só por diversão. Número da sorte de hoje: ${rd.lucky}.</small>` : ''}${area === 'energia' && has(/doente|dor/) ? '<br><small>Isto é só astrologia: se não te sentes bem, fala com um médico.</small>' : ''}`; }
  if (signs.length && has(/como e|como sao|caracter|personalidade/)) return `${G(sg.g)} ${sg.n} (${sg.r}): elemento ${sg.el === 'agua' ? 'água' : sg.el}, regido por ${PL[sg.ruler].n}. A sua força é a ${['coragem', 'lealdade', 'alegria', 'ternura', 'generosidade', 'dedicação', 'elegância', 'intensidade', 'boa disposição', 'determinação', 'originalidade', 'sensibilidade'][target]}.`;
  const v = verdict(rd);
  return `${hi}${sg.n} ${when}: ${st(toStars(rd.overall))}<br>“${rd.headline}”<br>${v.txt}`;
}

// ---------- PARABÉNS (cartaz e vídeo) ----------
const REL_ICON = { pai: '👨', mae: '👩', filho: '👦', filha: '👧', marido: '💍', mulher: '💍', namorado: '💞', namorada: '💞', bffm: '💛', bfff: '💛', amigo: '🤝', amiga: '🤝', irmao: '🧑', irma: '👩‍🦰', avom: '👴', avof: '👵', tio: '🧔', tia: '👱‍♀️', sobrinho: '🧒', sobrinha: '👧', primo: '🙋‍♂️', prima: '🙋‍♀️', neto: '👶', neta: '👶', sogro: '👴', sogra: '👵', padrinho: '🤵', madrinha: '👰', afilhado: '🧒', afilhada: '👧', colegam: '💼', colegaf: '💼', chefem: '👔', chefef: '👔', patrao: '👔', patroa: '👔', vizinho: '🏠', vizinha: '🏠', professor: '🎓', professora: '🎓' };
const relIcon = x => REL_ICON[x.rel] || (x.relTxt ? '🌟' : (x.name || '?')[0].toUpperCase());
const RELS = [['eu', 'x', 'Para mim', 'Hoje o dia é teu!'], ['pai', 'm', 'Pai', 'Ao melhor pai do mundo'], ['mae', 'f', 'Mãe', 'À melhor mãe do mundo'], ['filho', 'm', 'Filho', 'Ao meu filho'], ['filha', 'f', 'Filha', 'À minha filha'],
  ['marido', 'm', 'Marido', 'Ao amor da minha vida'], ['mulher', 'f', 'Esposa / mulher', 'Ao amor da minha vida'], ['namorado', 'm', 'Namorado', 'Ao meu amor'], ['namorada', 'f', 'Namorada', 'Ao meu amor'],
  ['bffm', 'm', 'Melhor amigo', 'Ao meu melhor amigo'], ['bfff', 'f', 'Melhor amiga', 'À minha melhor amiga'], ['amigo', 'm', 'Amigo', 'A um grande amigo'], ['amiga', 'f', 'Amiga', 'A uma grande amiga'],
  ['irmao', 'm', 'Irmão', 'Ao meu irmão'], ['irma', 'f', 'Irmã', 'À minha irmã'], ['avom', 'm', 'Avô', 'Ao melhor avô'], ['avof', 'f', 'Avó', 'À melhor avó'], ['tio', 'm', 'Tio', 'Ao meu tio'], ['tia', 'f', 'Tia', 'À minha tia'],
  ['sobrinho', 'm', 'Sobrinho', 'Ao meu sobrinho'], ['sobrinha', 'f', 'Sobrinha', 'À minha sobrinha'], ['primo', 'm', 'Primo', 'Ao meu primo'], ['prima', 'f', 'Prima', 'À minha prima'], ['neto', 'm', 'Neto', 'Ao meu neto'], ['neta', 'f', 'Neta', 'À minha neta'],
  ['afilhado', 'm', 'Afilhado', 'Ao meu afilhado'], ['afilhada', 'f', 'Afilhada', 'À minha afilhada'], ['padrinho', 'm', 'Padrinho', 'Ao meu padrinho'], ['madrinha', 'f', 'Madrinha', 'À minha madrinha'], ['sogro', 'm', 'Sogro', 'Ao meu sogro'], ['sogra', 'f', 'Sogra', 'À minha sogra'],
  ['colegam', 'm', 'Colega', 'Ao melhor colega'], ['colegaf', 'f', 'Colega', 'À melhor colega'], ['chefem', 'm', 'Chefe', 'Ao nosso chefe'], ['chefef', 'f', 'Chefe', 'À nossa chefe'], ['patrao', 'm', 'Patrão', 'Ao nosso patrão'], ['patroa', 'f', 'Patroa', 'À nossa patroa'],
  ['cao', 'p', '🐶 Cão', 'Ao melhor cão do mundo'], ['gato', 'p', '🐱 Gato', 'Ao gato mais lindo do mundo'], ['pet', 'p', '🐾 Outro animal', 'Ao meu companheiro de quatro patas']];
const REL_CAT = { pai: 'velho', mae: 'velho', avom: 'velho', avof: 'velho', tio: 'velho', tia: 'velho', sogro: 'velho', sogra: 'velho', padrinho: 'velho', madrinha: 'velho', filho: 'novo', filha: 'novo', neto: 'novo', neta: 'novo', sobrinho: 'novo', sobrinha: 'novo', afilhado: 'novo', afilhada: 'novo', marido: 'par', mulher: 'par', namorado: 'par', namorada: 'par', bffm: 'amigo', bfff: 'amigo', amigo: 'amigo', amiga: 'amigo', irmao: 'irmao', irma: 'irmao', primo: 'irmao', prima: 'irmao', colegam: 'trab', colegaf: 'trab', chefem: 'trab', chefef: 'trab', patrao: 'trab', patroa: 'trab', cao: 'pet', gato: 'pet', pet: 'pet', eu: 'eu' };
const REL_WISH = { velho: ['Obrigado por tudo o que me ensinaste.', 'És o meu exemplo de todos os dias.'], novo: ['Que nunca percas esse brilho.', 'O mundo é teu: vai com tudo!'], par: ['Cada dia ao teu lado é um presente.', 'És a minha pessoa favorita no universo.'], amigo: ['Obrigado por estares sempre lá.', 'Amigos assim são estrelas raras.'], irmao: ['Crescemos juntos e ainda bem!', 'Para sempre a minha equipa.'], trab: ['Obrigado pela boa energia de todos os dias.', 'Que este ano traga ainda mais conquistas.'], pet: ['Obrigado por todo o amor sem condições.', 'A casa é mais feliz contigo.'], eu: ['Que este novo ano astral seja o teu melhor.', 'Celebra-te: mereces tudo de bom.'] };
const SIGN_FORCE = ['coragem', 'lealdade', 'alegria', 'ternura', 'generosidade', 'dedicação', 'elegância', 'intensidade', 'boa disposição', 'determinação', 'originalidade', 'sensibilidade'];
function makeBday(o) {
  const rel = RELS.find(r => r[0] === o.rel) || RELS[0], si = o.t ? sunSignAt(o.d, o.t) : sunSignOf(o.d), cat = REL_CAT[rel[0]];
  const today = todayStr(), age = ageOn(o.d, today) + (daysToBirthday(o.d, today) === 0 ? 0 : 1);
  const [ty] = dParts(today), [, m, dd] = dParts(o.d), bd = `${daysToBirthday(o.d) > 300 && dParts(today)[1] > m ? ty + 1 : ty}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  const B = birthday(bd, ST.modern), lp = lifePath(o.d), r = seeded(o.name + o.d + o.rel);
  const force = cat === 'pet' ? `Um ${SIGNS[si].n} que ${PET_TRAIT[si]}.` : `Toda a ${SIGN_FORCE[si]} de um ${SIGNS[si].n}.`;
  const cn = chineseSign(o.d);
  return { ...o, rel, cat, si, sign: SIGNS[si], cn, age, lp, B, dedication: rel[3], wish: pick(REL_WISH[cat], r), force, year: cat === 'pet' ? 'Um ano cheio de mimos, passeios e petiscos.' : `Este ano: ${B.headline.replace(/^Um ano/, 'um ano').replace(/\.$/, '')}.`, num: `Número da vida ${lp}: ${NUM_MEAN[lp]}` };
}
const ease2 = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
function drawBdayFrame(ctx, W, H, S, Bd, t) {
  const c = EL_COL[Bd.sign.el];
  bg(ctx, W, H, 'bd' + Bd.name + Bd.d, c);
  const r = seeded('cf' + Bd.name), cols = ['#f2c76e', '#ff6b98', '#6fd3ff', '#7ee0a6', '#c79bff', '#ffffff'];
  for (let i = 0; i < 90; i++) { const x0 = r() * W, sp = 120 + r() * 260, y = ((r() * H + t * sp) % (H + 40)) - 20, sz = 6 + r() * 10, rot = r() * 6 + t * (r() * 4 - 2); ctx.save(); ctx.translate(x0 + Math.sin(t * 2 + i) * 14, y); ctx.rotate(rot); ctx.fillStyle = cols[i % cols.length]; ctx.globalAlpha = .75; ctx.fillRect(-sz / 2, -sz / 4, sz, sz / 2); ctx.restore(); }
  ctx.globalAlpha = 1; ctx.textAlign = 'center';
  const k = v => ease(Math.max(0, Math.min(1, v)));
  const top = S ? 210 : 110;
  ctx.globalAlpha = k(ease2(t, 0.3, 1.2)); ctx.fillStyle = '#f2c76e'; ctx.font = '700 28px Cinzel'; ctx.fillText(brand().toUpperCase(), W / 2, top - 40);
  ctx.fillStyle = '#ffe3a3'; ctx.font = `italic 600 ${S ? 82 : 72}px "Cormorant Garamond"`; ctx.fillText('Feliz Aniversário', W / 2, top + 50);
  const a2 = k(ease2(t, 1.2, 2.4)); ctx.globalAlpha = a2; ctx.save(); ctx.translate(W / 2, top + (S ? 190 : 175)); ctx.scale(.7 + .3 * a2, .7 + .3 * a2);
  ctx.fillStyle = '#fff'; let fs = S ? 120 : 108; ctx.font = `700 ${fs}px Cinzel`; while (ctx.measureText(Bd.name.toUpperCase()).width > W - 120 && fs > 50) { fs -= 6; ctx.font = `700 ${fs}px Cinzel`; } ctx.fillText(Bd.name.toUpperCase(), 0, 0); ctx.restore();
  ctx.globalAlpha = k(ease2(t, 2.0, 3.0)); ctx.fillStyle = '#c9c9ee'; ctx.font = `600 ${S ? 34 : 30}px Manrope`; ctx.fillText(Bd.dedication, W / 2, top + (S ? 260 : 245));
  // círculo da idade / signo
  const cy = top + (S ? 520 : 480), a3 = k(ease2(t, 2.8, 3.8)), R = (S ? 170 : 158) * (0.6 + 0.4 * a3);
  ctx.globalAlpha = a3; const g = ctx.createRadialGradient(W / 2, cy, 10, W / 2, cy, R * 1.4); g.addColorStop(0, c[0] + '66'); g.addColorStop(1, c[0] + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, cy, R * 1.4, 0, 7); ctx.fill();
  ctx.strokeStyle = '#f2c76e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, 7); ctx.stroke();
  ctx.textBaseline = 'middle';
  if (Bd.showAge && Bd.age > 0) { ctx.fillStyle = '#fff'; ctx.font = `800 ${S ? 150 : 128}px Manrope`; ctx.fillText(String(Bd.age), W / 2, cy - 14); ctx.fillStyle = '#ffe3a3'; ctx.font = `700 ${S ? 34 : 30}px Manrope`; ctx.fillText('ANOS', W / 2, cy + (S ? 80 : 68)); }
  else { ctx.fillStyle = '#fff6e0'; ctx.font = `${S ? 150 : 130}px ${SYMF}`; ctx.fillText(Bd.sign.g + VS, W / 2, cy + 8); }
  ctx.textBaseline = 'alphabetic';
  // signo e número
  let y = cy + (S ? 170 : 158) + (S ? 90 : 84);
  ctx.globalAlpha = k(ease2(t, 3.6, 4.6)); ctx.fillStyle = c[0]; ctx.font = `700 ${S ? 34 : 30}px Manrope, ${SYMF}`; ctx.fillText(`${Bd.sign.g}${VS} ${Bd.sign.n}  ·  ${Bd.cat === 'pet' ? 'Signo chinês: ' + Bd.cn.n : Bd.num.split(':')[0]}`, W / 2, y);
  y += S ? 90 : 86; const lines = [Bd.force, Bd.wish, Bd.year, Bd.cat === 'pet' ? '' : cap1(Bd.num.split(': ')[1]) + '.'].filter(Boolean);
  ctx.font = `italic 600 ${S ? 46 : 44}px "Cormorant Garamond"`;
  lines.forEach((l, i) => { ctx.globalAlpha = k(ease2(t, 4.6 + i * 0.7, 5.4 + i * 0.7)); ctx.fillStyle = i === 2 ? '#ffe3a3' : '#ececfb'; y = wrap(ctx, l, W / 2, y, W - 150, S ? 54 : 52, 2, 'center') + (S ? 18 : 16); });
  ctx.globalAlpha = k(ease2(t, 7.4, 8.2)); ctx.fillStyle = '#f2c76e'; ctx.font = `700 ${S ? 30 : 26}px Manrope`;
  ctx.textAlign = 'center'; ctx.fillText(Bd.from ? `Com carinho, ${Bd.from} ❤` : 'Partilha e deseja-lhe um dia feliz ❤', W / 2, H - (S ? 230 : 70));
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
function drawBday(Bd, fmt) { const [c, ctx, W, H, S] = mk(fmt); drawBdayFrame(ctx, W, H, S, Bd, 99); return c; }
function capBday(Bd) {
  return [`🎉 FELIZ ANIVERSÁRIO, ${Bd.name.toUpperCase()}!`, `${Bd.dedication} ${Bd.sign.g}`, '', Bd.force, Bd.wish, Bd.year, Bd.cat === 'pet' ? '' : `🔢 ${Bd.num}.`, '', Bd.from ? `Com carinho, ${Bd.from} ❤️` : '', `✨ Feito com ${brand()}`].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');
}
// Vídeo: primeiro MP4 verdadeiro (WebCodecs, fotograma a fotograma: fluido mesmo em telemóveis lentos e com duração certa);
// se o navegador não suportar, cai para a gravação em tempo real (MediaRecorder).
function loadMuxer() { if (window.Mp4Muxer) return Promise.resolve(true); return new Promise(r => { const s = document.createElement('script'); s.src = 'mp4-muxer.min.js'; s.onload = () => r(!!window.Mp4Muxer); s.onerror = () => r(false); document.head.appendChild(s); }); }
async function encodeMp4(drawFn, dur, W, H, btn, label) {
  if (!('VideoEncoder' in window) || !('VideoFrame' in window)) return null;
  const fps = 30; let cfg = null;
  for (const codec of ['avc1.640028', 'avc1.4D0028', 'avc1.42E028']) { const c = { codec, width: W, height: H, bitrate: 8e6, framerate: fps }; try { if ((await VideoEncoder.isConfigSupported(c)).supported) { cfg = c; break; } } catch (e) { } }
  if (!cfg || !(await loadMuxer())) return null;
  const { Muxer, ArrayBufferTarget } = Mp4Muxer, target = new ArrayBufferTarget(), muxer = new Muxer({ target, video: { codec: 'avc', width: W, height: H, frameRate: fps }, fastStart: 'in-memory' });
  let err = null; const enc = new VideoEncoder({ output: (ch, meta) => muxer.addVideoChunk(ch, meta), error: e => err = e }); enc.configure(cfg);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'), N = Math.round(dur * fps), old = btn ? btn.textContent : '';
  if (btn) btn.disabled = true;
  try {
    for (let n = 0; n <= N; n++) {
      if (err) throw err;
      drawFn(ctx, Math.min(n / fps, dur)); stampMark(ctx, W, H);
      const vf = new VideoFrame(c, { timestamp: Math.round(n * 1e6 / fps), duration: Math.round(1e6 / fps) }); enc.encode(vf, { keyFrame: n % 60 === 0 }); vf.close();
      while (enc.encodeQueueSize > 6) await new Promise(r => setTimeout(r, 4));
      if (n % 6 === 0) { if (btn) btn.textContent = `${label} ${Math.round(n / N * 100)}%`; await new Promise(r => setTimeout(r, 0)); }
    }
    await enc.flush(); if (err) throw err; muxer.finalize();
  } finally { try { enc.close(); } catch (e) { } if (btn) { btn.disabled = false; btn.textContent = old; } }
  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), ext: 'mp4' };
}
async function recordAnim(drawFn, dur, W, H, btn, label) {
  try { const v = await encodeMp4(drawFn, dur, W, H, btn, label); if (v && v.blob.size > 1000) return v; } catch (e) { console.warn('mp4', e); }
  const mime = reelMime(); if (!mime || !HTMLCanvasElement.prototype.captureStream) { toast('Este navegador não grava vídeo — usa o Chrome'); return null; }
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'); drawFn(ctx, 0);
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime, videoBitsPerSecond: 8e6 }), chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(r => rec.onstop = r); rec.start(250); const t0 = performance.now(), old = btn ? btn.textContent : '';
  if (btn) btn.disabled = true;
  await new Promise(res => { const step = () => { const t = (performance.now() - t0) / 1000; drawFn(ctx, Math.min(t, dur)); stampMark(ctx, W, H); if (btn) btn.textContent = `${label} ${Math.max(0, Math.ceil(dur - t))}s`; t < dur ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
  rec.stop(); await done; if (btn) { btn.disabled = false; btn.textContent = old; }
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: mime.includes('mp4') ? 'mp4' : 'webm' };
}

// ---------- INSTALAR ----------
let BIP = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); BIP = e; document.querySelectorAll('.installBtn').forEach(b => b.hidden = false); });
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
async function doInstall() { if (BIP) { BIP.prompt(); const r = await BIP.userChoice.catch(() => null); BIP = null; if (r && r.outcome === 'accepted') toast('App instalada 🎉'); } else $('#installDlg').showModal(); }

// ---------- Animais: espécies, idade humana, signo chinês ----------
const SPECIES = [['cao', '🐶', 'Cão'], ['gato', '🐱', 'Gato'], ['coelho', '🐰', 'Coelho'], ['ave', '🐦', 'Pássaro'], ['hamster', '🐹', 'Hamster'], ['tartaruga', '🐢', 'Tartaruga'], ['peixe', '🐠', 'Peixe'], ['cavalo', '🐴', 'Cavalo'], ['outro', '🐾', 'Outro']];
const spOf = a => SPECIES.find(s => s[0] === a.sp || s[1] === a.sp) || SPECIES[8];
function sunSignAt(d, t, c = 0) { const [y, m, dd] = dParts(d), [h, mi] = (t || '12:00').split(':').map(Number), ci = CITIES[+c] || CITIES[0]; return Math.floor(sunLon(jdFromMs(localToUtcMs(y, m, dd, h, mi, ci[3]))) / 30); }
function humanAge(a) {
  const yrs = (Date.UTC(...dParts(todayStr()).map((v, i) => i === 1 ? v - 1 : v)) - Date.UTC(...dParts(a.d).map((v, i) => i === 1 ? v - 1 : v))) / (365.25 * 864e5), s = spOf(a)[0];
  if (s !== 'cao' && s !== 'gato') return null;
  const h = yrs <= 1 ? yrs * 15 : yrs <= 2 ? 15 + (yrs - 1) * 9 : 24 + (yrs - 2) * (s === 'cao' ? 5 : 4);
  return Math.round(h);
}
const CN_ANIMALS = ['Rato', 'Boi', 'Tigre', 'Coelho', 'Dragão', 'Serpente', 'Cavalo', 'Cabra', 'Macaco', 'Galo', 'Cão', 'Porco'];
const CN_EMO = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐖'];
const CN_EL = ['Metal', 'Metal', 'Água', 'Água', 'Madeira', 'Madeira', 'Fogo', 'Fogo', 'Terra', 'Terra'];
function chineseNewYear(y) { // a Lua Nova entre 21 de janeiro e 20 de fevereiro
  const ev = eventsBetween(`${y}-01-20`, `${y}-02-21`, false, true).find(e => e.type === 'lua' && e.kind === 'nova');
  return ev ? dayStr(ev.jd + 1 / 3) : `${y}-02-05`; // hora da China (UTC+8)
}
function chineseSign(d) { let [y] = dParts(d); if (d < chineseNewYear(y)) y--; const i = ((y - 4) % 12 + 12) % 12; return { i, n: CN_ANIMALS[i], e: CN_EMO[i], el: CN_EL[y % 10] }; }
function todaysBirthdays() {
  const out = [], p = P.get();
  if (p && p.d && daysToBirthday(p.d) === 0) out.push({ label: `${p.name ? p.name.split(' ')[0] : 'Tu'} (tu!) 🥳`, o: { name: p.name || 'Tu', rel: 'eu', d: p.d, showAge: true, from: '' } });
  P.list('ceu_pets').forEach(a => { if (daysToBirthday(a.d) === 0) { const s = spOf(a); out.push({ label: `${s[1]} ${a.name}`, o: { name: a.name, rel: s[0] === 'cao' ? 'cao' : s[0] === 'gato' ? 'gato' : 'pet', d: a.d, showAge: true, from: p && p.name ? p.name.split(' ')[0] : '' } }); } });
  P.list('ceu_bdays').forEach(x => { if (daysToBirthday(x.d) === 0) out.push({ label: `${(RELS.find(r => r[0] === x.rel) || RELS[0])[2]} ${x.name}`, o: { name: x.name, rel: x.rel, d: x.d, showAge: true, from: p && p.name ? p.name.split(' ')[0] : '' } }); });
  return out;
}

// ---------- Raças ----------
// [nome, energia 1-5, feitio, cuidado]
const BREEDS = {
  cao: [['Sem raça definida', 3, 'esperto, resistente e cheio de personalidade', 'adapta-se a tudo, mas adora rotina e carinho'], ['Labrador Retriever', 5, 'meigo, brincalhão e guloso', 'precisa de passeios longos e de controlar os petiscos'], ['Golden Retriever', 4, 'doce, paciente e muito familiar', 'escova o pelo e brinca todos os dias'], ['Pastor Alemão', 5, 'inteligente, protetor e leal', 'precisa de treino e de desafios para a cabeça'], ['Bulldog Francês', 2, 'divertido, teimoso e muito apegado', 'cuidado com o calor e com exercício intenso'], ['Bulldog Inglês', 1, 'calmo, teimoso e carinhoso', 'evita calor e escadas, gosta de sestas'], ['Yorkshire Terrier', 3, 'corajoso, vivaço e vaidoso', 'escovar o pelo e cuidar dos dentes'], ['Chihuahua', 3, 'pequeno no tamanho, gigante na atitude', 'protege-o do frio e de quedas'], ['Caniche', 4, 'muito inteligente e elegante', 'tosquias regulares e jogos de inteligência'], ['Beagle', 5, 'curioso, alegre e farejador', 'trela sempre: segue o nariz para todo o lado'], ['Border Collie', 5, 'o cérebro dos cães: rápido e trabalhador', 'precisa de muito exercício e de tarefas'], ['Husky Siberiano', 5, 'aventureiro, falador e independente', 'muito exercício e cuidado com o calor'], ['Shih Tzu', 2, 'meigo, calmo e companheiro', 'escovar o pelo todos os dias'], ['Pug', 2, 'palhaço da casa, adora colo', 'cuidado com o calor e com o peso'], ['Boxer', 5, 'energético, brincalhão e protetor', 'brincadeiras ativas todos os dias'], ['Rottweiler', 4, 'calmo, confiante e muito protetor', 'treino desde cedo e muito exercício'], ['Teckel (salsicha)', 3, 'valente, teimoso e divertido', 'cuidado com saltos: protege as costas'], ['Spitz Alemão (Lulu)', 3, 'alerta, vaidoso e muito vivo', 'escovar o pelo e treinar o ladrar'], ["Cão d'Água Português", 5, 'nadador, inteligente e alegre', 'adora água e muito exercício'], ['Podengo Português', 4, 'caçador, ágil e independente', 'quintal bem vedado e passeios'], ['Serra da Estrela', 3, 'guardião calmo e muito leal', 'espaço e pelo bem cuidado'], ['Rafeiro do Alentejo', 2, 'guardião sereno e protetor', 'espaço e muita paciência no treino'], ['Staffordshire / Pitbull', 4, 'afetuoso, forte e muito leal', 'socialização e exercício diário'], ['Jack Russell', 5, 'incansável, esperto e destemido', 'muito exercício, senão inventa trabalho'], ['Maltês', 2, 'meigo, alegre e de colo', 'escovar o pelo e limpar os olhos'], ['Cocker Spaniel', 4, 'alegre, sensível e afetuoso', 'limpar as orelhas com frequência'], ['Dobermann', 5, 'elegante, atento e leal', 'exercício e treino consistente'], ['Pinscher Miniatura (Pincher)', 5, 'pequeno no tamanho, gigante na coragem: alerta, vaidoso e mandão', 'roupinha no frio e brincadeira para gastar energia'], ['Pinscher Alemão', 4, 'atento, rápido e muito ligado ao dono', 'exercício diário e regras claras'], ['Bichon Frisé', 3, 'alegre, fofo e sociável', 'escovar o pelo e não ficar muito tempo sozinho'], ['Schnauzer', 4, 'esperto, vigilante e divertido', 'tosquia regular e desafios para a cabeça'], ['West Highland Terrier', 4, 'confiante, curioso e brincalhão', 'cuidar da pele e muitos passeios'], ['Cavalier King Charles', 2, 'doce, meigo e de colo', 'atenção ao coração e às orelhas'], ['Lhasa Apso', 2, 'independente, digno e bom vigia', 'escovar o pelo comprido'], ['Pequinês', 1, 'orgulhoso, calmo e leal', 'evitar calor e esforço'], ['Boston Terrier', 3, 'simpático, divertido e esperto', 'cuidado com o calor'], ['Corgi', 4, 'esperto, guloso e cheio de atitude', 'controlar o peso e cuidar das costas'], ['Pastor Australiano', 5, 'inteligente, incansável e trabalhador', 'muito exercício e tarefas para fazer'], ['Pastor Belga Malinois', 5, 'intenso, focado e protetor', 'treino diário: precisa de missão'], ['Pastor de Shetland', 4, 'sensível, esperto e obediente', 'escovar e brincar com bola'], ['Dálmata', 5, 'energético, alegre e sociável', 'corrida diária e água fresca'], ['Galgo', 3, 'elegante, calmo em casa e veloz lá fora', 'corridas em sítio seguro e mantinha'], ['Weimaraner', 5, 'atlético, apegado e curioso', 'exercício e companhia'], ['Bull Terrier', 4, 'brincalhão, teimoso e palhaço', 'brincadeira e paciência no treino'], ['Basset Hound', 2, 'calmo, teimoso e farejador', 'controlar o peso e limpar as orelhas'], ['São Bernardo', 2, 'gigante, doce e protetor', 'espaço, fresquinho e cuidado com as articulações'], ['Terra Nova', 2, 'gentil, paciente e nadador', 'água para nadar e escovagem'], ['Samoiedo', 4, 'sorridente, sociável e brincalhão', 'escovar muito e evitar calor'], ['Akita', 3, 'reservado, leal e dominante', 'socialização desde cedo'], ['Shiba Inu', 4, 'independente, limpo e esperto', 'paciência e passeio com trela'], ['Cane Corso', 4, 'protetor, calmo e confiante', 'treino firme e carinhoso'], ['Perdigueiro Português', 5, 'caçador, meigo e apegado à família', 'campo e muito exercício'], ['Cão da Serra de Aires', 4, 'esperto, ágil e desconfiado de estranhos', 'trabalho e brincadeira'], ['Castro Laboreiro', 3, 'guardião, leal e corajoso', 'espaço e tarefa de vigiar'], ['Fila de São Miguel', 4, 'protetor, forte e dedicado', 'treino e socialização'], ['Setter Irlandês', 5, 'alegre, enérgico e afetuoso', 'corridas e escovagem'], ['Chow Chow', 2, 'independente, digno e reservado', 'evitar calor e escovar'], ['Boieiro de Berna', 3, 'gentil, calmo e familiar', 'fresquinho e escovagem'], ['Whippet', 3, 'meigo, discreto e rapidíssimo', 'casaco no frio e corridas'], ['Papillon', 4, 'alegre, esperto e curioso', 'brincadeira e cuidado com quedas'], ['Dogue Alemão', 2, 'gigante gentil e calmo', 'espaço e cuidado com o estômago'], ['Springer Spaniel', 5, 'entusiasta, brincalhão e incansável', 'muito exercício e água']],
  gato: [['Europeu Comum', 3, 'independente, caçador e esperto', 'brinquedos para caçar e um poleiro alto'], ['Persa', 1, 'calmo, doce e de sofá', 'escovar todos os dias e limpar os olhos'], ['Siamês', 4, 'falador, ciumento e muito apegado', 'companhia: detesta estar sozinho'], ['Maine Coon', 3, 'gigante gentil e sociável', 'escovar o pelo e espaço para trepar'], ['Bengal', 5, 'selvagem no ar, ativo e curioso', 'muita brincadeira e desafios'], ['Ragdoll', 2, 'meigo, relaxado e de colo', 'dentro de casa e muito carinho'], ['British Shorthair', 2, 'tranquilo, independente e fofo', 'controlar o peso e brincar um pouco'], ['Sphynx', 4, 'carente, brincalhão e quentinho', 'banhos e proteção do frio e do sol'], ['Angorá', 4, 'elegante, ativo e inteligente', 'escovar e brincar todos os dias'], ['Azul Russo', 2, 'tímido, leal e sereno', 'rotina tranquila e um cantinho só dele'], ['Scottish Fold', 2, 'doce, curioso e calmo', 'cuidar das articulações e das orelhas'], ['Abissínio', 5, 'curioso, atlético e explorador', 'espaços para trepar e muita atividade'], ['Norueguês da Floresta', 3, 'robusto, calmo e trepador', 'escovar e espaço para trepar'], ['Birmanês', 2, 'meigo, sociável e tranquilo', 'carinho e companhia'], ['Exótico', 1, 'calmo, doce e preguiçoso', 'limpar os olhos e brincar um pouco'], ['Devon Rex', 4, 'brincalhão, curioso e carente', 'mantinha quente e brincadeira'], ['Bombaim', 3, 'pantera em miniatura, meigo e esperto', 'brincadeira e atenção'], ['Chartreux', 2, 'calmo, observador e leal', 'rotina e sossego'], ['Savannah', 5, 'selvagem, saltador e muito ativo', 'espaço e muita brincadeira'], ['Himalaia', 1, 'doce, calmo e de colo', 'escovar todos os dias']]
};
for (const k in BREEDS) { const [f, ...r] = BREEDS[k]; BREEDS[k] = [f, ...r.sort((a, b) => a[0].localeCompare(b[0], 'pt'))]; }
const EL_PET = { fogo: 'tem fogo no sangue: corajoso e cheio de energia', terra: 'tem os pés na terra: calmo, guloso e de rotinas', ar: 'é de ar: curioso, sociável e brincalhão', agua: 'é de água: sensível, intuitivo e muito apegado' };
const PET_NAME_N = { 1: 'líder da matilha, gosta de mandar', 2: 'companheiro inseparável, sempre ao teu lado', 3: 'o palhaço da casa', 4: 'guardião das rotinas e da casa', 5: 'explorador, foge para descobrir tudo', 6: 'mimalho e protetor da família', 7: 'observador misterioso', 8: 'o chefe e dono do sofá', 9: 'coração enorme, gosta de todos', 11: 'sexto sentido apurado', 22: 'nasceu para ter uma missão', 33: 'terapeuta de quatro patas' };
const PET_MIX = { fogo: ['uma bola de energia com coração de ouro', 'corajoso e sempre pronto para brincar', 'o primeiro a correr para a porta'], terra: ['fiel às rotinas e ao comedouro', 'calmo, guloso e muito leal', 'o rei do conforto'], ar: ['curioso e sociável com toda a gente', 'esperto e fácil de ensinar', 'conversador, sempre a "dizer" coisas'], agua: ['sensível e muito colado a ti', 'meigo e intuitivo, sente o teu humor', 'carinhoso e um pouco ciumento'] };
function breedProfile(a) {
  const s = spOf(a)[0], ps = sunSignAt(a.d, a.t), sg = SIGNS[ps], list = BREEDS[s] || [], b = list.find(x => x[0] === a.breed);
  const lines = [];
  const mx = a.mix && a.mix.map(n => list.find(x => x[0] === n)).filter(Boolean);
  if (mx && mx.length === 2) {
    const [A, B] = mx, r = seeded('mix' + a.name + a.d), dom = r() < .5 ? 0 : 1, D = mx[dom], O = mx[1 - dom], short = n => n.replace(/ \(.*\)/, '');
    const enB = Math.round((A[1] + B[1]) / 2 + (D[1] - O[1]) * .25), en = Math.max(1, Math.min(5, enB + (sg.el === 'fogo' ? 1 : sg.el === 'terra' ? -1 : 0)));
    const tA = A[2].split(/, | e /), tB = B[2].split(/, | e /), pick = L => L[Math.floor(r() * L.length)];
    lines.push(`Cruzado de ${short(A[0])} e ${short(B[0])}: o melhor de dois mundos.`);
    lines.push(`Do ${short(D[0])} herdou o feitio mais forte (${D[2]}); do ${short(O[0])} ficou com um toque ${pick(dom ? tA : tB).trim()}.`);
    lines.push(`Como ${sg.n}, ${EL_PET[sg.el]}. ${en >= 4 ? 'Mistura cheia de energia: passeios e brincadeira todos os dias.' : en <= 2 ? 'Mistura tranquila: adora sossego e colo.' : 'Mistura equilibrada: tanto brinca como descansa.'}`);
    lines.push(`Energia: ${'●'.repeat(en)}${'○'.repeat(5 - en)} · Cuidados: ${D[3]}; ${O[3]}.`);
  } else if (b) {
    const en = Math.max(1, Math.min(5, b[1] + (sg.el === 'fogo' ? 1 : sg.el === 'terra' ? -1 : 0)));
    lines.push(`Como ${b[0]}, é ${b[2]}.`);
    lines.push(`Como ${sg.n}, ${EL_PET[sg.el]}. ${b[1] >= 4 && sg.el === 'fogo' ? 'Juntos dão uma verdadeira bomba de energia!' : b[1] <= 2 && sg.el === 'terra' ? 'Juntos dão o rei (ou a rainha) do sofá.' : b[1] >= 4 && sg.el === 'agua' ? 'Muita energia, mas também muita sensibilidade: precisa de ti por perto.' : 'A raça e o signo equilibram-se bem.'}`);
    lines.push(`Energia: ${'●'.repeat(en)}${'○'.repeat(5 - en)} · Cuidado especial: ${b[3]}.`);
  } else lines.push(`Como ${sg.n}, ${EL_PET[sg.el]}.`, a.breed ? `Raça: ${a.breed}.` : '');
  const nn = typeof nameNum === 'function' ? nameNum(a.name || '') : 0;
  if (nn) lines.push(`🔤 O nome ${a.name} vibra no ${nn}: ${PET_NAME_N[nn] || ''}. Com o dia ${+a.d.slice(8)} de ${MES_N[+a.d.slice(5, 7) - 1]} em ${sg.n}, é ${PET_MIX[sg.el][nn % 3]}.`);
  return lines.filter(Boolean);
}

// ---------- Agenda ----------
const REL_GROUPS = [['Família', ['pai', 'mae', 'filho', 'filha', 'irmao', 'irma', 'avom', 'avof', 'neto', 'neta', 'tio', 'tia', 'sobrinho', 'sobrinha', 'primo', 'prima', 'sogro', 'sogra', 'padrinho', 'madrinha', 'afilhado', 'afilhada']], ['Amor', ['marido', 'mulher', 'namorado', 'namorada']], ['Amigos', ['bffm', 'bfff', 'amigo', 'amiga']], ['Trabalho', ['colegam', 'colegaf', 'chefem', 'chefef', 'patrao', 'patroa']], ['Animais', ['cao', 'gato', 'pet']]];
const relLabel = x => x.relTxt || (RELS.find(r => r[0] === x.rel) || RELS[0])[2];
const APP_URL = 'https://ceudehoje.com/';
function agendaAll() {
  const out = P.list('ceu_bdays').map((x, i) => ({ ...x, kind: 'p', k: i }));
  P.list('ceu_pets').forEach((a, i) => { const s = spOf(a); out.push({ name: a.name, rel: s[0] === 'cao' ? 'cao' : s[0] === 'gato' ? 'gato' : 'pet', relTxt: s[1] + ' ' + s[2], d: a.d, t: a.t, kind: 'a', k: i }); });
  const p = P.get(); if (p && p.d) out.push({ name: p.name || 'Eu', rel: 'eu', relTxt: 'Eu ✨', d: p.d, t: p.t, kind: 'me' });
  return out;
}
function waText(x) {
  const Bd = makeBday({ name: x.name, rel: x.rel, d: x.d, showAge: true, from: '' });
  return `🎉 Parabéns, ${x.name}! ${Bd.cat === 'pet' ? '🐾' : '🎂'}\n${Bd.force} ${Bd.wish}\n✨ ${Bd.year}\n\nVê o teu signo do dia em ${APP_URL}`;
}
function waLink(x) { const tel = (x.tel || '').replace(/\D/g, ''); const num = tel ? (tel.length === 9 ? '351' + tel : tel) : ''; return `https://wa.me/${num}?text=${encodeURIComponent(waText(x))}`; }
function icsAll() {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ceu de Hoje//PT', 'CALSCALE:GREGORIAN'];
  agendaAll().filter(x => x.kind !== 'me').forEach((x, i) => {
    const [y, m, d] = dParts(x.d), ds = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`, nd = dayStr(noonJd(x.d) + 1).replace(/-/g, '');
    L.push('BEGIN:VEVENT', `UID:ceu-${ds}-${i}-${norm2(x.name).replace(/\W/g, '')}@ceudehoje`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${ds}`, `DTEND;VALUE=DATE:${nd}`, 'RRULE:FREQ=YEARLY', `SUMMARY:🎂 Anos: ${x.name} (${relLabel(x).replace(/[^\p{L}\s]/gu, '').trim()})`, `DESCRIPTION:Cria o cartaz em ${APP_URL}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Hoje faz anos!', 'TRIGGER:PT9H', 'END:VALARM', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã faz anos', 'TRIGGER:-PT15H', 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR'); return L.join('\r\n');
}

// ---------- Alertas de aniversário ----------
function bdaysOn(offset) {
  const ds = dayStr(noonJd(todayStr()) + offset), md = ds.slice(5);
  return agendaAll().filter(x => x.d.slice(5) === md || (md === '02-28' && x.d.slice(5) === '02-29' && !(+ds.slice(0, 4) % 4 === 0)));
}
async function syncAlertData() { // a agenda vai para o service worker poder avisar com a app fechada
  try {
    const data = agendaAll().map(x => ({ n: x.name, r: x.kind === 'me' ? 'tu' : relLabel(x).replace(/[^\p{L}\s]/gu, '').trim(), md: x.d.slice(5), y: +x.d.slice(0, 4) }));
    const c = await caches.open('ceu-data'); await c.put('./__agenda.json', new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
    let ev = []; try { ev = typeof alertEvents === 'function' ? alertEvents() : []; } catch (e) { } await c.put('./__events.json', new Response(JSON.stringify(ev), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) { }
  try { if ('setAppBadge' in navigator) { const n = bdaysOn(0).length; n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } } catch (e) { }
}
const alertState = () => !('Notification' in window) ? 'none' : Notification.permission;
async function enableAlerts() {
  if (!('Notification' in window)) { toast('Este telemóvel não deixa: usa os lembretes do calendário'); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Sem autorização para notificações'); render(); return; }
  await syncAlertData();
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) { try { await reg.periodicSync.register('ceu-bdays', { minInterval: 12 * 3600 * 1000 }); store.set('ceu_psync', '1'); } catch (e) { store.set('ceu_psync', '0'); } }
    reg.showNotification('🔔 Alertas ligados', { body: 'Vais receber um aviso no dia de anos de quem guardaste.', icon: 'icon-192.png', badge: 'badge-96.png', tag: 'ceu-test' });
  } catch (e) { new Notification('🔔 Alertas ligados', { body: 'Vais receber um aviso no dia de anos de quem guardaste.' }); }
  render();
}

// ---------- Pares em detalhe ----------
const MODAL = ['cardinal', 'fixo', 'mutavel', 'cardinal', 'fixo', 'mutavel', 'cardinal', 'fixo', 'mutavel', 'cardinal', 'fixo', 'mutavel'];
const MOD_TXT = { cardinal: 'gosta de começar e liderar', fixo: 'gosta de manter e ir até ao fim', mutavel: 'gosta de mudar e adaptar-se' };
const EL_NAME = { fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água' };
const EL_PAIR = { 'fogo-fogo': 'Paixão e aventura a dobrar: nunca há tédio, mas cuidado com o orgulho.', 'fogo-terra': 'O fogo traz o entusiasmo, a terra os pés no chão: aprendem muito um com o outro, com paciência.', 'ar-fogo': 'O ar alimenta o fogo: ideias, gargalhadas e planos sem fim.', 'agua-fogo': 'Vapor! Atração forte, mas sensibilidades diferentes: falem muito.', 'terra-terra': 'Estabilidade total: constroem juntos, devagar e com segurança.', 'ar-terra': 'Um é prático, o outro sonhador: completam-se se respeitarem os ritmos.', 'agua-terra': 'A água nutre a terra: carinho, lealdade e um lar acolhedor.', 'ar-ar': 'Conversa infinita e liberdade: amigos acima de tudo.', 'agua-ar': 'Cabeça e coração: um pensa, o outro sente; a ponte é a empatia.', 'agua-agua': 'Ligação profunda e intuitiva: entendem-se só com o olhar.' };
const K_FORCE = [['Entendem-se sem palavras', 'Os mesmos gostos e manias'], ['Completam-se no que falta a cada um', 'Ensinam-se coisas novas'], ['Comunicação fácil e muitas gargalhadas', 'Apoiam-se nos projetos'], ['Química e faíscas', 'Fazem-se crescer um ao outro'], ['Harmonia natural', 'Valores parecidos'], ['Curiosidade um pelo outro', 'Aprendem muito juntos'], ['Atração dos opostos', 'Equilibram-se mutuamente']];
const K_CHAL = [['Podem amplificar os defeitos um do outro'], ['Ritmos diferentes no dia a dia'], ['Podem acomodar-se na zona de conforto'], ['Choques de vontade', 'Têm de aprender a ceder'], ['Às vezes falta um desafio'], ['Mal-entendidos frequentes', 'Exigem ajustes constantes'], ['Puxam para lados diferentes', 'Precisam de compromisso']];
const K_AREAS = { amor: [75, 55, 82, 50, 92, 48, 70], amizade: [80, 60, 90, 55, 88, 58, 62], trabalho: [70, 72, 80, 58, 78, 64, 68], paixao: [70, 50, 72, 85, 80, 62, 90], comunicacao: [78, 58, 92, 52, 84, 50, 66] };
function pairDetail(a, b, ds) {
  const k = Math.min((b - a + 12) % 12, (a - b + 12) % 12), A = SIGNS[a], B = SIGNS[b], key = [A.el, B.el].sort().join('-');
  const areas = {}; for (const n in K_AREAS) { let v = K_AREAS[n][k]; if (A.el === B.el) v += 4; if (n === 'comunicacao' && (key === 'agua-fogo' || key === 'ar-terra')) v -= 6; if (n === 'paixao' && (A.el === 'fogo' || B.el === 'fogo')) v += 4; if (n === 'trabalho' && (A.el === 'terra' || B.el === 'terra')) v += 4; areas[n] = Math.max(30, Math.min(99, v)); }
  const PD = pairsDay(ds, ST.modern), lo = Math.min(a, b), hi = Math.max(a, b), today = PD.pairs.find(p => p.a === lo && p.b === hi).score;
  const week = [...Array(7)].map((_, i) => { const d = dayStr(noonJd(ds) + i); return [d, pairsDay(d, ST.modern).pairs.find(p => p.a === lo && p.b === hi).score]; });
  const best = week.slice().sort((x, y) => y[1] - x[1])[0];
  const s = skyFor(ds), km = x => Math.min((s.moon.sign - x + 12) % 12, (x - s.moon.sign + 12) % 12);
  const sky = [];
  if ([0, 2, 4].includes(km(a)) && [0, 2, 4].includes(km(b))) sky.push(`A Lua em ${SIGN_IN[s.moon.sign]} aproxima-vos: dia de cumplicidade.`);
  else if (km(a) === 3 || km(b) === 3) sky.push(`A Lua em ${SIGN_IN[s.moon.sign]} pode trazer pequenas irritações: paciência.`);
  else sky.push(`A Lua está em ${SIGN_IN[s.moon.sign]}: dia de emoções tranquilas entre os dois.`);
  if (s.venus.sign === a || s.venus.sign === b) sky.push(`Vénus está em ${SIGN_IN[s.venus.sign]}: o amor sorri a este par.`);
  if (s.venus.rx) sky.push('Vénus retrógrada: bom para rever a relação, não para decisões grandes.');
  if (s.mercury.rx) sky.push('Mercúrio retrógrado: atenção a mal-entendidos nas mensagens.');
  const advice = today >= 80 ? 'Planeiem algo a dois hoje: um jantar, um passeio, uma surpresa.' : today >= 60 ? 'Bom dia para uma conversa tranquila e um gesto de carinho.' : 'Deem espaço um ao outro hoje e falem com calma.';
  const rel = A.ruler === B.ruler ? `Os dois são regidos por ${PL[A.ruler].n}: falam a mesma língua.` : `${A.n} é regido por ${PL[A.ruler].n} (${PL[A.ruler].kw}), ${B.n} por ${PL[B.ruler].n} (${PL[B.ruler].kw}).`;
  const mod = MODAL[a] === MODAL[b] ? `Os dois têm o mesmo ritmo: cada um ${MOD_TXT[MODAL[a]]}.` : `${A.n} ${MOD_TXT[MODAL[a]]}; ${B.n} ${MOD_TXT[MODAL[b]]}.`;
  return { a, b, A, B, k, base: PAIR_BASE[k], today, week, best, areas, el: EL_PAIR[key], elLbl: `${EL_NAME[A.el]} + ${EL_NAME[B.el]}`, mod, rel, force: K_FORCE[k], chal: K_CHAL[k], sky, advice, summary: cap1(PAIR_TXT[k]).replace(/[.!]$/, '') };
}
function drawPairCard(D, fmt) {
  const [c, ctx, W, H, S] = mk(fmt); bg(ctx, W, H, 'pc' + D.a + D.b + ST.date, ['#ff5a8a', '#5c1638']);
  header(ctx, W, S, S ? 130 : 84, niceDate(ST.date));
  const cy = S ? 380 : 270; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${S ? 150 : 130}px ${SYMF}`; ctx.fillStyle = EL_COL[D.A.el][0]; ctx.fillText(D.A.g + VS, W / 2 - 260, cy); ctx.fillStyle = EL_COL[D.B.el][0]; ctx.fillText(D.B.g + VS, W / 2 + 260, cy);
  ctx.fillStyle = '#ff6b98'; ctx.font = `800 ${S ? 120 : 104}px Manrope`; ctx.fillText(D.today + '%', W / 2, cy); ctx.textBaseline = 'alphabetic';
  let y = cy + (S ? 150 : 130); ctx.fillStyle = '#fff'; ctx.font = '700 56px Cinzel'; ctx.fillText(`${D.A.n.toUpperCase()} + ${D.B.n.toUpperCase()}`, W / 2, y);
  y += 50; ctx.fillStyle = '#ffb3c9'; ctx.font = '600 28px Manrope'; ctx.fillText(`${D.elLbl} · ${D.summary}`, W / 2, y);
  y += S ? 80 : 60; ctx.fillStyle = '#ffe3a3'; ctx.font = 'italic 600 40px "Cormorant Garamond"'; y = wrap(ctx, '“' + D.el + '”', W / 2, y, W - 150, 46, 2, 'center') + (S ? 40 : 24);
  const L = [['Amor', 'amor'], ['Amizade', 'amizade'], ['Trabalho', 'trabalho'], ['Paixão', 'paixao'], ['Comunicação', 'comunicacao']];
  ctx.textAlign = 'left';
  for (const [l, k] of L) { const bw = W - 350 - 230; ctx.fillStyle = '#e6e6fb'; ctx.font = '700 27px Manrope'; ctx.fillText(l, 110, y + 10); ctx.fillStyle = '#ffffff18'; rr(ctx, 350, y - 12, bw, 26, 13); ctx.fill(); const gr = ctx.createLinearGradient(350, 0, 350 + bw, 0); gr.addColorStop(0, '#ff6b98'); gr.addColorStop(1, '#f2c76e'); ctx.fillStyle = gr; rr(ctx, 350, y - 12, bw * D.areas[k] / 100, 26, 13); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 26px Manrope'; ctx.textAlign = 'right'; ctx.fillText(D.areas[k] + '%', W - 110, y + 10); ctx.textAlign = 'left'; y += S ? 70 : 58; }
  y += 10; ctx.font = '600 27px Manrope';
  ctx.fillStyle = '#7ee0a6'; ctx.fillText('✓ ' + D.force.join(' · '), 110, y); y += 44;
  ctx.fillStyle = '#ffb36b'; ctx.fillText('! ' + D.chal.join(' · '), 110, y);
  footer(ctx, W, H, S, 'Marca o teu par 💞  ·  Segue ' + brand());
  return c;
}
function capPair(D) {
  return [`💞 ${D.A.n} ${D.A.g} + ${D.B.n} ${D.B.g} · ${D.today}% hoje`, `${D.elLbl}: ${D.el}`, '', `❤️ Amor ${D.areas.amor}% · 🤝 Amizade ${D.areas.amizade}% · 💼 Trabalho ${D.areas.trabalho}% · 🔥 Paixão ${D.areas.paixao}% · 💬 Comunicação ${D.areas.comunicacao}%`, '', `✅ ${D.force.join(' · ')}`, `⚠️ ${D.chal.join(' · ')}`, '', `🌙 ${D.sky[0]}`, `💡 ${D.advice}`, '', `👇 Marca o teu par! · Segue ${brand()}`, '#compatibilidade #signos #amor'].join('\n');
}

// ---------- Guia lunar (tradição) ----------
const LUA_CATS = [['cabelo', '✂️', 'Cortar o cabelo'], ['unhas', '💅', 'Unhas'], ['pele', '🧖', 'Pele e beleza'], ['depilacao', '🪒', 'Depilação'], ['dieta', '🥗', 'Dieta e detox'], ['exercicio', '🏃', 'Exercício'], ['romance', '💑', 'Romance'], ['fertilidade', '👶', 'Fertilidade (tradição)'], ['negocios', '💼', 'Começar projetos'], ['viagens', '✈️', 'Viagens'], ['limpeza', '🧹', 'Limpezas e arrumações'], ['horta', '🌱', 'Semear e plantar'], ['leitura', '📖', 'Leitura e estudo'], ['descanso', '🧘', 'Descanso']];
const LUA_LBL = ['Evitar', 'Neutro', 'Bom', 'Ótimo'], LUA_COL = ['#ff8fa3', '#9a9bcb', '#7ee0a6', '#f2c76e'];
function luaGuide(ds) {
  const s = skyFor(ds), e = s.phase.elong, wax = e < 180, nNew = e < 18 || e > 342, nFull = Math.abs(e - 180) < 18, si = s.moon.sign, el = SIGNS[si].el, n = SIGNS[si].n, inS = (...l) => l.includes(n);
  const g = {};
  g.cabelo = nNew ? 0 : wax ? 2 + (inS('Leão', 'Virgem', 'Touro') ? 1 : 0) : 1 + (inS('Leão', 'Virgem') ? 1 : 0);
  g.unhas = nNew ? 1 : !wax ? 2 + (inS('Capricórnio', 'Touro', 'Leão') ? 1 : 0) : 1 + (inS('Touro', 'Balança') ? 1 : 0);
  g.pele = nFull ? 3 : !wax ? 2 + (inS('Capricórnio', 'Touro', 'Peixes') ? 1 : 0) : 1;
  g.depilacao = !wax ? 2 + (inS('Leão', 'Virgem', 'Capricórnio') ? 1 : 0) : nFull ? 1 : 0;
  g.dieta = !wax ? 2 + (inS('Virgem', 'Escorpião', 'Capricórnio') ? 1 : 0) : 0;
  g.exercicio = wax || nFull ? 2 + (el === 'fogo' ? 1 : 0) : 1;
  g.romance = (inS('Touro', 'Balança', 'Leão', 'Peixes') ? 2 : 1) + ((wax || nFull) && !nNew && inS('Touro', 'Balança', 'Leão', 'Peixes') ? 1 : 0);
  g.fertilidade = (el === 'agua' || n === 'Touro' ? 2 : 1) + ((wax || nFull) && !nNew && (el === 'agua' || n === 'Touro') ? 1 : 0);
  g.negocios = nNew ? 3 : wax ? 2 + (MODAL[si] === 'cardinal' ? 1 : 0) : 0;
  g.viagens = Math.max(0, (inS('Sagitário', 'Gémeos', 'Aquário') ? 3 : el === 'ar' || el === 'fogo' ? 2 : 1) - (s.mercury.rx ? 1 : 0));
  g.limpeza = !wax ? 2 + (inS('Virgem', 'Capricórnio') ? 1 : 0) : 1;
  g.horta = nNew ? 1 : wax ? (el === 'agua' || el === 'terra' ? 3 : 2) : (el === 'terra' ? 3 : 2);
  g.descanso = inS('Peixes', 'Caranguejo', 'Escorpião') ? 3 : !wax ? 2 : 1;
  g.leitura = 1 + (inS('Gémeos', 'Virgem', 'Sagitário', 'Aquário', 'Peixes', 'Caranguejo') ? 1 : 0) + (el === 'ar' ? 1 : 0);
  for (const k in g) g[k] = Math.max(0, Math.min(3, g[k]));
  return g;
}
const LUA_WHY = { cabelo: 'Crescente faz crescer, minguante faz durar; Leão e Virgem dão força.', unhas: 'Minguante faz o verniz e o corte durar; Capricórnio rege as unhas.', pele: 'Cheia hidrata e nutre; minguante limpa e esfolia.', depilacao: 'Com a Lua a minguar, os pelos voltam mais devagar.', dieta: 'Lua minguante ajuda a perder e a desintoxicar.', exercicio: 'Lua crescente e signos de fogo dão energia.', romance: 'Lua em Touro, Balança, Leão ou Peixes favorece o coração.', fertilidade: 'Tradição: Lua em signos de água (Caranguejo, Escorpião, Peixes) e em Touro.', negocios: 'Lua Nova planta, crescente faz crescer.', viagens: 'Lua em Sagitário, Gémeos ou Aquário; cuidado com Mercúrio retrógrado.', limpeza: 'Minguante tira o que está a mais; Virgem arruma.', horta: 'Depende do tipo de dia: raiz, folha, flor ou fruto.', leitura: 'Lua em Gémeos, Virgem ou Aquário aguça a mente; em Peixes e Caranguejo, a imaginação.', descanso: 'Lua em Peixes, Caranguejo ou Escorpião pede recolhimento.' };
function luaBest(cat, a, b, min = 3) { return daysIn(a, b).filter(d => luaGuide(d)[cat] >= min); }
function fertWindow(last, len) {
  const out = []; let start = noonJd(last);
  const now = noonJd(todayStr());
  while (start + len < now) start += len;
  for (let c = 0; c < 3; c++) { const ov = start + len - 14; out.push({ period: dayStr(start), ov: dayStr(ov), from: dayStr(ov - 5), to: dayStr(ov + 1), next: dayStr(start + len) }); start += len; }
  return out;
}
