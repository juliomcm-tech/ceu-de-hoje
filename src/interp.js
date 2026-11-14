// ===== Interpretação =====
const SIGNS = [
  { n: 'Carneiro', g: '♈', r: '21 mar – 19 abr', el: 'fogo', ruler: 'mars', mod: 'mars', tag: 'carneiro' },
  { n: 'Touro', g: '♉', r: '20 abr – 20 mai', el: 'terra', ruler: 'venus', mod: 'venus', tag: 'touro' },
  { n: 'Gémeos', g: '♊', r: '21 mai – 20 jun', el: 'ar', ruler: 'mercury', mod: 'mercury', tag: 'gemeos' },
  { n: 'Caranguejo', g: '♋', r: '21 jun – 22 jul', el: 'agua', ruler: 'moon', mod: 'moon', tag: 'caranguejo' },
  { n: 'Leão', g: '♌', r: '23 jul – 22 ago', el: 'fogo', ruler: 'sun', mod: 'sun', tag: 'leao' },
  { n: 'Virgem', g: '♍', r: '23 ago – 22 set', el: 'terra', ruler: 'mercury', mod: 'mercury', tag: 'virgem' },
  { n: 'Balança', g: '♎', r: '23 set – 22 out', el: 'ar', ruler: 'venus', mod: 'venus', tag: 'balanca' },
  { n: 'Escorpião', g: '♏', r: '23 out – 21 nov', el: 'agua', ruler: 'mars', mod: 'pluto', tag: 'escorpiao' },
  { n: 'Sagitário', g: '♐', r: '22 nov – 21 dez', el: 'fogo', ruler: 'jupiter', mod: 'jupiter', tag: 'sagitario' },
  { n: 'Capricórnio', g: '♑', r: '22 dez – 19 jan', el: 'terra', ruler: 'saturn', mod: 'saturn', tag: 'capricornio' },
  { n: 'Aquário', g: '♒', r: '20 jan – 18 fev', el: 'ar', ruler: 'saturn', mod: 'uranus', tag: 'aquario' },
  { n: 'Peixes', g: '♓', r: '19 fev – 20 mar', el: 'agua', ruler: 'jupiter', mod: 'neptune', tag: 'peixes' }
];
const SIGN_IN = SIGNS.map(s => s.n);
const PL = {
  sun: { n: 'Sol', g: '☉', cor: 'Dourado', hex: '#f5c542', kw: 'a vontade', f: 0 },
  moon: { n: 'Lua', g: '☽', cor: 'Prateado', hex: '#cfd8e3', kw: 'as emoções', f: 1 },
  mercury: { n: 'Mercúrio', g: '☿', cor: 'Laranja', hex: '#f59e42', kw: 'a comunicação', f: 0 },
  venus: { n: 'Vénus', g: '♀', cor: 'Verde-esmeralda', hex: '#3ccf8e', kw: 'o amor', f: 1 },
  mars: { n: 'Marte', g: '♂', cor: 'Vermelho', hex: '#ef4444', kw: 'a ação', f: 0 },
  jupiter: { n: 'Júpiter', g: '♃', cor: 'Azul-real', hex: '#4f7cff', kw: 'a sorte', f: 0 },
  saturn: { n: 'Saturno', g: '♄', cor: 'Preto', hex: '#9aa3b2', kw: 'a responsabilidade', f: 0 },
  uranus: { n: 'Urano', g: '♅', cor: 'Turquesa', hex: '#4fd1c5', kw: 'as surpresas', f: 0 },
  neptune: { n: 'Neptuno', g: '♆', cor: 'Azul-mar', hex: '#7c9cff', kw: 'os sonhos', f: 0 },
  pluto: { n: 'Plutão', g: '♇', cor: 'Bordô', hex: '#b5527a', kw: 'a transformação', f: 0 }
};
const ASP_TXT = { conj: ['em conjunção com', 'une-se a'], sext: ['em sextil com', 'abre portas a'], quad: ['em quadratura com', 'choca com'], tri: ['em trígono com', 'flui com'], opo: ['em oposição a', 'confronta'] };
const ASP_G = { conj: '☌', sext: '⚹', quad: '□', tri: '△', opo: '☍' };
const EL_COL = { fogo: ['#ff7a45', '#7a1f0f'], terra: ['#c9b458', '#2f3d1a'], ar: ['#6fd3ff', '#1b3a63'], agua: ['#8b7bff', '#1b1f5c'] };
const DAY_RULER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const DOMICILE = { sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7], jupiter: [8, 11], saturn: [9, 10], uranus: [10], neptune: [11], pluto: [7] };
const EXALT = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 };
const KEYWORD = ['', 'Brilho pessoal', 'Dinheiro', 'Conversas', 'Família', 'Romance', 'Rotina', 'Parcerias', 'Intensidade', 'Aventura', 'Carreira', 'Amizades', 'Descanso'];
const THEME = ['', 'de ti e da tua imagem', 'do dinheiro e do que valorizas', 'da comunicação e do dia a dia', 'da casa e da família', 'do amor e da criatividade', 'do trabalho e da saúde', 'das relações e parcerias', 'das emoções profundas e do que é partilhado', 'das viagens e dos estudos', 'da carreira e da reputação', 'dos amigos e dos projetos', 'do descanso e do mundo interior'];
const AREA = ['', 'a tua imagem', 'as finanças', 'as conversas', 'a casa', 'o amor', 'a rotina', 'as relações', 'a intimidade', 'os horizontes', 'a carreira', 'as amizades', 'o descanso'];

const T_MOON = [null,
  ['A Lua está no teu signo: és o centro das atenções.', 'Dia de te pores em primeiro lugar.', 'Intuição em alta — confia no que sentes.', 'Estás magnético: o que disseres hoje fica.', 'Recomeço emocional: segue o teu instinto.'],
  ['Foco no que é teu: dinheiro e conforto.', 'Bom dia para pôr as contas em ordem.', 'Valoriza o que já tens antes de querer mais.', 'Um pequeno prazer faz-te bem — sem exageros.', 'Segurança primeiro: decide com calma.'],
  ['Conversas, mensagens e pequenas deslocações.', 'Uma conversa pode abrir uma porta inesperada.', 'Mente rápida: aponta as ideias antes que fujam.', 'Liga àquela pessoa — ela está à espera.', 'Uma notícia muda os teus planos para melhor.'],
  ['Casa e família pedem a tua presença.', 'Dia de recarregar energias no teu canto.', 'Alguém de casa precisa de ti hoje.', 'Arrumar a casa é arrumar a cabeça.', 'Raízes fortes: liga a quem te viu crescer.'],
  ['Romance, diversão e criatividade no ar.', 'Permite-te brincar — o dia sorri-te.', 'Coração aberto: um flirt ou uma ideia brilhante.', 'Faz algo só porque te dá prazer.', 'Hoje brilhas sem esforço.'],
  ['Rotina, saúde e trabalho bem feito.', 'Arruma, organiza, resolve pendentes.', 'O corpo fala: ouve-o.', 'Pequenos hábitos, grandes resultados.', 'Dia de despachar o que andas a adiar.'],
  ['As relações estão em destaque.', 'Quem está ao teu lado tem a palavra.', 'Dia de negociar e ceder um pouco.', 'Um acordo justo está ao teu alcance.', 'Olha para o outro como um espelho.'],
  ['Emoções profundas e assuntos partilhados.', 'Algo escondido pode vir à tona.', 'Bom dia para tratar de finanças a dois.', 'Larga o que já não te serve.', 'Intensidade no ar: escolhe as tuas batalhas.'],
  ['Horizontes largos: viagens e aprendizagem.', 'Uma nova ideia muda a tua perspetiva.', 'Apetece fugir à rotina — planeia algo.', 'Aprende algo novo hoje, nem que seja pequeno.', 'Fé e otimismo levam-te longe.'],
  ['Carreira em foco: mostra o teu valor.', 'Quem manda está atento a ti.', 'Dia de dar a cara e assumir responsabilidades.', 'Um passo firme hoje conta para o futuro.', 'Reconhecimento à vista.'],
  ['Amigos e projetos de grupo dão frutos.', 'Um contacto traz boas notícias.', 'Pensa no futuro — sonha alto.', 'A tua rede de amigos é o teu tesouro.', 'Junta-te a quem pensa como tu.'],
  ['Dia de recolhimento e intuição.', 'Abranda: o descanso também é produtivo.', 'Algo termina para dar lugar ao novo.', 'Os sonhos desta noite trazem respostas.', 'Menos barulho, mais clareza.']
];
const T_LOVE = [null,
  ['Vénus está no teu signo: estás irresistível. Bom para seduzir ou fazer as pazes.', 'O teu charme está no máximo — usa-o com generosidade.', 'Cuida da tua imagem: quem te vê, repara.'],
  ['O amor mostra-se em gestos concretos: um mimo, um jantar, um presente.', 'Procuras segurança afetiva — e mereces.', 'Saber o teu valor é o melhor íman.'],
  ['Uma mensagem bem escrita vale ouro. Diz o que sentes.', 'Há flirt nas conversas do dia a dia.', 'Uma conversa leve pode virar algo mais.'],
  ['Um ambiente caseiro e aconchegado favorece o romance.', 'A harmonia em família aquece o coração.', 'Um jantar em casa vale mais que um restaurante.'],
  ['Excelente para o romance! Solteiros: há faíscas. Casais: reacendam a chama.', 'O coração está em festa — vive a paixão.', 'Surpreende quem amas com algo divertido.'],
  ['O amor está nos pequenos cuidados do dia a dia.', 'Ajudar quem amas numa tarefa vale mais do que mil palavras.', 'Romance discreto, mas verdadeiro.'],
  ['Vénus ilumina as relações: bom para compromissos e reconciliações.', 'Alguém especial pode aproximar-se. Abre a porta.', 'O amor pede equilíbrio: dar e receber.'],
  ['Paixão intensa e emoções fortes. Evita ciúmes.', 'A intimidade e a confiança aprofundam-se.', 'Atração magnética — mas sem jogos.'],
  ['Atração por alguém diferente, de longe ou de outra cultura.', 'Uma escapadinha a dois faz milagres.', 'O amor cresce quando partilham sonhos.'],
  ['Uma relação pode tornar-se pública ou oficial.', 'Admiração no trabalho pode virar algo mais — cuidado.', 'Amor com futuro: pensa a longo prazo.'],
  ['Uma amizade pode evoluir para romance.', 'Sai com amigos: o amor pode estar no grupo.', 'Liberdade e cumplicidade andam juntas.'],
  ['Sentimentos secretos ou amor platónico. Reflete antes de agir.', 'Dia de perdoar e sarar feridas antigas.', 'O amor pede silêncio e escuta.']
];
const T_WORK = [null,
  ['Ideias claras e boa comunicação — apresenta os teus projetos.', 'A tua opinião conta: dá-a com confiança.'],
  ['Pensa em formas de rentabilizar o que sabes fazer.', 'Bom para negociar valores e condições.'],
  ['Reuniões, telefonemas e emails correm a teu favor.', 'Uma conversa rápida resolve o que parecia complicado.'],
  ['Trabalho a partir de casa ou assuntos de casa em destaque.', 'Organiza o teu espaço de trabalho: rendes mais.'],
  ['A criatividade é a tua melhor ferramenta hoje.', 'Trabalhar com gosto faz toda a diferença.'],
  ['Produtividade em alta: despacha tarefas pendentes.', 'O detalhe faz a diferença — revê tudo.'],
  ['Parcerias e negociações correm bem com diálogo.', 'Um colega pode ser o teu melhor aliado.'],
  ['Investiga a fundo antes de decidir.', 'Há informação escondida — procura-a.'],
  ['Formações, cursos e contactos de fora são favorecidos.', 'Pensa em grande: o plano a longo prazo compensa.'],
  ['Bom momento para falar com as chefias e mostrar resultados.', 'A tua reputação está a crescer.'],
  ['Trabalho em equipa rende mais do que a solo.', 'Uma ideia de grupo pode ser a melhor.'],
  ['Trabalha nos bastidores; nem tudo precisa de ser anunciado.', 'Planeia em silêncio, age depois.']
];
const T_WEEK = [null, 'Semana para te afirmares e cuidares de ti.', 'Semana de dinheiro, conforto e prioridades.', 'Semana de conversas, contactos e movimento.', 'Semana virada para a casa e a família.', 'Semana de amor, prazer e criatividade.', 'Semana de trabalho, saúde e organização.', 'Semana das relações e dos acordos.', 'Semana intensa, de mudanças por dentro.', 'Semana de horizontes largos e novas ideias.', 'Semana de carreira e decisões importantes.', 'Semana de amigos, grupos e projetos.', 'Semana de pausa, intuição e balanço.'];
const T_NEW = [null, 'renovar a tua imagem e começar algo só teu', 'definir objetivos financeiros', 'iniciar um curso ou retomar contactos', 'mudanças em casa ou na família', 'um novo amor ou projeto criativo', 'um hábito saudável ou nova rotina de trabalho', 'uma nova parceria ou acordo', 'largar o que pesa e recomeçar', 'planear uma viagem ou um estudo', 'um novo passo na carreira', 'um projeto com amigos', 'um recomeço interior'];
const T_FULL = [null, 'colheres o que semeaste por ti', 'perceber para onde vai o teu dinheiro', 'uma conversa que esclarece tudo', 'uma decisão em família', 'emoções fortes no amor', 'ouvires o corpo e abrandares', 'clareza numa relação', 'fechar um ciclo emocional', 'uma revelação que alarga horizontes', 'reconhecimento no trabalho', 'um balanço das amizades', 'descansar e soltar'];

function seeded(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const toStars = s => clamp(Math.round(s / 20), 1, 5);
const aspectOf = h => ({ 1: 'conj', 7: 'opo', 4: 'quad', 10: 'quad', 5: 'tri', 9: 'tri', 3: 'sext', 11: 'sext' })[h] || null;
const rxw = p => 'retrógrad' + (PL[p].f ? 'a' : 'o');
function dignity(p, sign) {
  if (!DOMICILE[p]) return null;
  if (DOMICILE[p].includes(sign)) return 'domicilio';
  if (EXALT[p] === sign) return 'exaltacao';
  if (DOMICILE[p].some(s => (s + 6) % 12 === sign)) return 'exilio';
  if (EXALT[p] !== undefined && (EXALT[p] + 6) % 12 === sign) return 'queda';
  return null;
}
function moonPhaseName(e) {
  if (e < 12 || e >= 348) return 'Lua Nova'; if (e < 80) return 'Lua Crescente'; if (e < 100) return 'Quarto Crescente'; if (e < 168) return 'Crescente Gibosa';
  if (e < 192) return 'Lua Cheia'; if (e < 260) return 'Minguante Gibosa'; if (e < 280) return 'Quarto Minguante'; return 'Lua Minguante';
}
const housesOf = (si, sky) => { const H = {}; for (const p of ALLP) H[p] = ((sky[p].sign - si + 12) % 12) + 1; return H; };

function scoreDay(si, sky, H) {
  const area = { amor: 60, trabalho: 60, dinheiro: 60, energia: 60 }, add = (k, v) => area[k] += v, has = (p, hs) => hs.includes(H[p]);
  if (has('venus', [1, 5, 7, 11])) add('amor', 22); else if (has('venus', [2, 3, 9, 10])) add('amor', 10); else if (has('venus', [6, 8, 12])) add('amor', -4);
  if (has('moon', [5, 7])) add('amor', 12); if (has('moon', [12])) add('amor', -6); if (has('jupiter', [5, 7])) add('amor', 14);
  if (has('mars', [5])) add('amor', 8); if (has('mars', [7])) add('amor', -10); if (has('saturn', [5, 7])) add('amor', -14); if (sky.venus.rx) add('amor', -8);
  for (const p of ['sun', 'mars', 'jupiter']) if (has(p, [10, 6])) add('trabalho', p === 'jupiter' ? 18 : 10);
  if (has('mercury', [3, 6, 10, 1])) add('trabalho', 8); if (has('moon', [10, 6])) add('trabalho', 8);
  if (has('saturn', [10, 6])) add('trabalho', -10); if (has('saturn', [1])) add('trabalho', -6); if (sky.mercury.rx) add('trabalho', -8); if (has('moon', [12])) add('trabalho', -6);
  if (has('jupiter', [2, 8, 11])) add('dinheiro', 20); if (has('venus', [2, 8, 11])) add('dinheiro', 14); if (has('sun', [2, 11])) add('dinheiro', 6); if (has('moon', [2, 11])) add('dinheiro', 8);
  if (has('saturn', [2, 8])) add('dinheiro', -14); if (has('mars', [2, 8])) add('dinheiro', -10); if (sky.mercury.rx && has('mercury', [2, 8])) add('dinheiro', -6);
  if (has('sun', [1])) add('energia', 18); if (has('mars', [1])) add('energia', 14); if (has('moon', [1])) add('energia', 10);
  if (has('mars', [6, 12])) add('energia', -10); if (has('saturn', [1])) add('energia', -16); if (has('moon', [12, 6])) add('energia', -8); if (has('jupiter', [1, 5, 9])) add('energia', 8);
  const mAng = Math.abs(angDiff(sky.moon.lon, si * 30 + 15));
  for (const [ang, val] of [[60, 8], [120, 10], [90, -8], [180, -6], [0, 6]]) { const orb = Math.abs(mAng - ang); if (orb < 12) for (const k in area) add(k, val * (1 - orb / 12)); }
  const ru = SIGNS[si].ruler, b = { domicilio: 8, exaltacao: 8, exilio: -7, queda: -7 }[dignity(ru, sky[ru].sign)] || 0; for (const k in area) add(k, b);
  for (const [p, nat] of [['jupiter', 1], ['venus', 0.6], ['saturn', -1], ['mars', -0.6]]) {
    const a = aspectOf(H[p]); const v = a === 'tri' || a === 'sext' ? (nat > 0 ? 6 : 3) * Math.abs(nat) : a === 'quad' || a === 'opo' ? (nat > 0 ? 1 : -6) * Math.abs(nat) : 0; for (const k in area) add(k, v);
  }
  for (const k in area) area[k] = clamp(Math.round(area[k]), 8, 98);
  return area;
}
function texts(si, sky, H, area, r, modern) {
  const has = (p, hs) => hs.includes(H[p]);
  const love = pick(T_LOVE[H.venus], r) + (sky.venus.rx ? ' Vénus retrógrada: bom para rever relações, mau para começar novas.' : '');
  let work = pick(T_WORK[H.mercury], r);
  if (has('jupiter', [10, 6])) work += ' Júpiter abre portas: arrisca uma proposta.';
  else if (has('mars', [10, 6])) work += ' Marte dá-te garra: avança, mas sem atropelar ninguém.';
  else if (has('saturn', [10, 6])) work += ' Saturno exige rigor — o esforço de agora conta a longo prazo.';
  else if (has('sun', [10])) work += ' O Sol põe-te em evidência.';
  if (sky.mercury.rx) work += ' Mercúrio retrógrado: relê emails e contratos antes de enviar.';
  let money;
  if (has('jupiter', [2, 8, 11])) money = 'Júpiter favorece as finanças: boa altura para planear investimentos ou pedir o que te devem.';
  else if (has('venus', [2, 8])) money = 'Vénus traz conforto financeiro, mas cuidado com mimos caros.';
  else if (has('saturn', [2])) money = 'Saturno pede contenção: aperta o cinto e corta no supérfluo.';
  else if (has('mars', [2, 8])) money = 'Cuidado com compras por impulso — conta até dez antes de pagar.';
  else if (has('moon', [2])) money = 'Atenção aos gastos emocionais; nem tudo o que apetece faz falta.';
  else if (modern && has('uranus', [2, 8])) money = 'Urano traz imprevistos no dinheiro: tem uma reserva à mão.';
  else money = area.dinheiro >= 70 ? pick(['Finanças estáveis: dia tranquilo para pequenas decisões.', 'Boa maré financeira — aproveita para poupar.'], r) : area.dinheiro >= 50 ? pick(['Dinheiro sem grandes surpresas. Mantém o orçamento.', 'Equilíbrio financeiro: nem gastos grandes, nem sustos.'], r) : 'Evita empréstimos e decisões financeiras grandes.';
  const ph = moonPhaseName(sky.phase.elong);
  let energy;
  if (has('sun', [1])) energy = 'É a tua época! Vitalidade renovada.';
  else if (has('saturn', [1])) energy = 'Cansaço acumulado — dorme bem e não carregues o mundo às costas.';
  else if (has('mars', [1])) energy = 'Energia a mil — canaliza-a para o exercício.';
  else if (has('mars', [6, 12])) energy = 'Não forces o corpo: atenção a excessos e pequenas lesões.';
  else if (has('moon', [12])) energy = 'Energia mais baixa: dá-te tempo para descansar.';
  else energy = area.energia >= 70 ? pick(['Boa disposição e energia para dar e vender.', 'Estás em forma: aproveita para mexer o corpo.'], r) : area.energia >= 50 ? pick(['Energia equilibrada: mantém um ritmo constante.', 'Ritmo certo: nem pressa, nem preguiça.'], r) : 'Poupa energias e evita exageros.';
  if (ph === 'Lua Cheia') energy += ' Lua Cheia: emoções à flor da pele.';
  if (ph === 'Lua Nova') energy += ' Lua Nova: ideal para começar um hábito saudável.';
  const ru = modern ? SIGNS[si].mod : SIGNS[si].ruler, ruN = PL[ru].n, ruIn = SIGN_IN[sky[ru].sign], dg = dignity(ru, sky[ru].sign), fem = PL[ru].f;
  const V = {
    domicilio: [`O teu regente, ${ruN}, está em casa (${ruIn}): confia na tua força e toma a iniciativa.`, `${ruN}, o teu regente, está no seu próprio signo (${ruIn}): és tu quem dita o ritmo.`],
    exaltacao: [`O teu regente, ${ruN}, está exaltad${fem ? 'a' : 'o'} em ${ruIn}: é um dos teus melhores momentos para brilhar.`, `${ruN} exaltad${fem ? 'a' : 'o'} em ${ruIn} dá-te um empurrão extra: aproveita.`],
    exilio: [`O teu regente, ${ruN}, está em exílio em ${ruIn}: vale mais a paciência do que a força.`, `Com ${ruN} fora de casa (${ruIn}), adapta-te em vez de forçar.`],
    queda: [`O teu regente, ${ruN}, está em queda em ${ruIn}: não te cobres demasiado, faz o essencial.`, `${ruN} em queda (${ruIn}) pede humildade: pequenos passos valem muito.`]
  };
  let advice = dg ? pick(V[dg], r) : `O teu regente, ${ruN}, passa por ${ruIn}: tudo gira à volta ${THEME[H[ru]]}.`;
  if (sky[ru].rx) advice += ` Como está ${rxw(ru)}, revê antes de avançar.`;
  return { love, work, money, energy, advice, ruler: ru };
}
function extras(si, sky, H, r) {
  const fav = ['jupiter', 'venus', 'sun', 'moon', 'mercury', 'mars', 'saturn'].map(p => {
    const a = aspectOf(H[p]); let s = { jupiter: 3, venus: 2.5, sun: 1.5, moon: 1.5, mercury: 1, mars: 0.5, saturn: 0 }[p];
    s *= a === 'tri' ? 2 : a === 'sext' ? 1.6 : a === 'conj' ? 1.4 : a ? 0.6 : 0.3; if (sky[p].rx) s *= 0.6; return [p, s];
  }).sort((a, b) => b[1] - a[1])[0][0];
  const harm = s => [3, 5, 9, 11].includes(((s - si + 12) % 12) + 1);
  const ally = harm(sky.moon.sign) ? sky.moon.sign : harm(sky.venus.sign) ? sky.venus.sign : (si + (r() < 0.5 ? 4 : 8)) % 12;
  const lucky = ((Math.floor(sky.moon.lon) + si * 7 + Math.floor(sky[SIGNS[si].ruler].lon)) % 49) + 1;
  return { fav, ally, lucky };
}

// ---------- Dia ----------
function readDay(si, ds, modern) {
  const sky = skyFor(ds), H = housesOf(si, sky), r = seeded(ds + '|' + si), area = scoreDay(si, sky, H);
  const t = texts(si, sky, H, area, r, modern), x = extras(si, sky, H, r);
  const stars = {}; for (const k in area) stars[k] = toStars(area[k]);
  return Object.assign({ mode: 'dia', ds, si, sign: SIGNS[si], H, area, stars, overall: avg(area), headline: pick(T_MOON[H.moon], r), keyword: KEYWORD[H.moon] }, t, x);
}
const avg = a => clamp(Math.round((a.amor + a.trabalho + a.dinheiro + a.energia) / 4), 8, 98);

// ---------- Semana / Mês ----------
function periodRange(ds, mode) {
  const [y, m, d] = ds.split('-').map(Number);
  if (mode === 'ano') return [`${y}-01-01`, `${y}-12-31`];
  if (mode === 'semana') { const t = new Date(Date.UTC(y, m - 1, d)), dow = (t.getUTCDay() + 6) % 7; const a = new Date(t - dow * 864e5), b = new Date(+a + 6 * 864e5); return [a.toISOString().slice(0, 10), b.toISOString().slice(0, 10)]; }
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [`${y}-${String(m).padStart(2, '0')}-01`, `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`];
}
function daysIn(a, b) { const out = []; let j = noonJd(a); const e = noonJd(b); for (; j <= e + 0.01; j++) out.push(dayStr(j)); return out; }
const _evCache = {};
function periodEvents(a, b, modern) { const k = a + b + modern; return _evCache[k] || (_evCache[k] = eventsBetween(a, b, modern)); }
const DIA_CURTO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dayLabel = (jd, mode) => { const d = new Date(msFromJd(jd)); return mode === 'semana' ? DIA_CURTO[d.getUTCDay()] : 'dia ' + d.getUTCDate(); };

function readPeriod(si, ds, mode, modern) {
  const [a, b] = periodRange(ds, mode), days = daysIn(a, b), r = seeded(a + mode + si);
  const daily = days.map(d => { const sky = skyFor(d), H = housesOf(si, sky); return { d, sky, H, area: scoreDay(si, sky, H) }; });
  const area = { amor: 0, trabalho: 0, dinheiro: 0, energia: 0 };
  for (const x of daily) for (const k in area) area[k] += x.area[k] / daily.length;
  for (const k in area) area[k] = Math.round(area[k]);
  const mid = daily[Math.floor(daily.length / 2)], stars = {}; for (const k in area) stars[k] = toStars(area[k]);
  // tema: peso por casa
  const w = Array(13).fill(0);
  for (const x of daily) w[x.H.moon] += 1 / daily.length * 2;
  for (const [p, k] of [['sun', 3], ['venus', 2], ['mercury', 2], ['mars', 2], ['jupiter', 1.5], ['saturn', 1.2]]) w[mid.H[p]] += k;
  const theme = w.indexOf(Math.max(...w.slice(1)));
  const best = k => daily.reduce((m, x) => x.area[k] > m.area[k] ? x : m, daily[0]);
  const bestAll = daily.reduce((m, x) => avg(x.area) > avg(m.area) ? x : m, daily[0]);
  const t = texts(si, mid.sky, mid.H, area, r, modern);
  const ev = periodEvents(a, b, modern), hi = [];
  for (const e of ev) {
    const when = dayLabel(e.jd, mode), h = ((e.sign - si + 12) % 12) + 1;
    if (e.type === 'lua' && (e.kind === 'nova' || e.kind === 'cheia')) {
      const ecl = e.eclipse ? (e.eclipse === 'solar' ? 'Eclipse solar' : 'Eclipse lunar') + ' na ' : '';
      hi.push(`${e.kind === 'nova' ? '🌑' : '🌕'} ${ecl}${e.kind === 'nova' ? 'Lua Nova' : 'Lua Cheia'} em ${SIGN_IN[e.sign]} (${when}): ${e.kind === 'nova' ? 'bom para ' + T_NEW[h] : 'momento de ' + T_FULL[h]}.`);
    } else if (e.type === 'ingresso' && ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(e.p)) {
      hi.push(`${PL[e.p].g} ${PL[e.p].n} entra em ${SIGN_IN[e.sign]} (${when}): ${PL[e.p].kw} passa a focar-se n${AREA[h]}.`);
    } else if (e.type === 'estacao') {
      hi.push(`${PL[e.p].g} ${PL[e.p].n} ${e.rx ? 'fica ' + rxw(e.p) : 'volta a andar para a frente'} (${when})${e.rx ? ': revê em vez de começar.' : ': as coisas desbloqueiam.'}`);
    }
  }
  const lead = mode === 'mes' ? `Este mês o Sol ilumina a tua casa ${daily[0].H.sun}, a ${['', 'do eu', 'do dinheiro', 'da comunicação', 'do lar', 'do prazer', 'do trabalho', 'das parcerias', 'das transformações', 'dos horizontes', 'da carreira', 'dos amigos', 'do recolhimento'][daily[0].H.sun]}.` : T_WEEK[theme];
  const x = extras(si, mid.sky, mid.H, r);
  return Object.assign({
    mode, si, sign: SIGNS[si], H: mid.H, area, stars, overall: avg(area), range: [a, b], headline: lead, keyword: KEYWORD[theme], highlights: hi.slice(0, mode === 'mes' ? 6 : 4),
    bestDay: dayLabel(noonJd(bestAll.d), mode), bestLove: dayLabel(noonJd(best('amor').d), mode), bestWork: dayLabel(noonJd(best('trabalho').d), mode)
  }, t, x);
}
function readAny(si, ds, mode, modern) { return mode === 'dia' ? readDay(si, ds, modern) : readPeriod(si, ds, mode, modern); }

// ---------- Céu ----------
function dayAspects(ds, modern) {
  return periodEvents(ds, ds, modern).filter(e => e.type === 'aspeto').map(e => ({ ...e, txt: `${PL[e.p].n} ${ASP_TXT[e.asp][0]} ${PL[e.q].n}`, mean: `${PL[e.p].kw[0].toUpperCase() + PL[e.p].kw.slice(1)} ${ASP_TXT[e.asp][1]} ${PL[e.q].kw}.` }));
}
