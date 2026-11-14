// ===== Dicas dos animais, cartazes sem astrologia, PIN, diário =====

// ---------- Dicas dos animais ----------
const PET_TIPS = {
  amor: ['Hoje, 10 minutos de festinhas no sofá valem ouro.', 'Escova-o com calma: é mimo e cuidado ao mesmo tempo.', 'Fala com ele em voz baixa: adora a tua voz.', 'Deixa-o dormir perto de ti esta noite.', 'Uma massagem atrás das orelhas e é teu para sempre.', 'Dá-lhe atenção quando chegares a casa, antes de tudo.'],
  trabalho: ['Ensina-lhe um truque novo com recompensas pequenas.', 'Esconde petiscos pela casa e deixa-o procurar.', 'Troca os brinquedos: os «novos» de ontem voltam a ser novidade.', 'Uma bola, um corredor e 5 minutos: felicidade garantida.', 'Brinquedo de puzzle: cansa a cabeça e acalma.', 'Uma caixa de cartão pode ser o melhor brinquedo do dia.'],
  dinheiro: ['Confirma se a água está fresca e a taça limpa.', 'Petiscos sim, mas contam para a dose do dia.', 'Fruta segura em pedacinhos (maçã sem sementes) é um bom mimo.', 'Come devagar? Uma taça anti-voracidade ajuda.', 'Mantém as horas das refeições: dá-lhe segurança.', 'Nada de chocolate, uvas ou cebola: são perigosos.'],
  energia: ['Experimenta um caminho novo no passeio: cheiros novos cansam a cabeça.', 'Passeio ao fim da tarde: menos calor, mais prazer.', 'Deixa-o cheirar à vontade: farejar é o «telemóvel» dele.', 'Dia calmo? Um passeio curto e uma soneca chegam.', 'Se estiver calor, evita o alcatrão quente nas patas.', 'Brinca 10 minutos antes de saíres: fica mais tranquilo sozinho.']
};
const PET_GEN = ['Verifica as unhas: se fazem barulho no chão, está na hora de cortar.', 'Já viste se as vacinas e a desparasitação estão em dia?', 'Uma foto dele hoje: daqui a uns anos vais adorar ver.', 'Limpa a caminha e as mantas: dorme melhor.', 'Verifica orelhas e olhos: limpinhos?', 'Água fresca em mais do que um sítio da casa.', 'Ensina-lhe o «fica» com paciência e recompensas.', 'Um momento de silêncio juntos também é companhia.'];
function petTip(rd, name = '') {
  const r = seeded('tip' + (rd.ds || ST.date) + rd.si + name), ks = ['amor', 'trabalho', 'dinheiro', 'energia'];
  const best = ks.reduce((a, b) => rd.area[b] > rd.area[a] ? b : a), worst = ks.reduce((a, b) => rd.area[b] < rd.area[a] ? b : a);
  const k = r() < 0.5 ? best : worst;
  return r() < 0.25 ? pick(PET_GEN, r) : pick(PET_TIPS[k], r);
}

// ---------- Cartazes sem astrologia ----------
const LAYOUTS = ['festa', 'baloes', 'dourado', 'kids', 'romantico', 'patinhas', 'minimal'];
const PLAIN = {
  pet: ['Mais um ano de lambidelas, sestas e travessuras!', 'Parabéns ao dono do sofá!', 'Que nunca faltem petiscos nem mimos.', 'O melhor amigo de quatro patas faz anos!', 'A casa é mais feliz contigo.'],
  crianca: ['Que cresças feliz, curioso e sempre a sorrir!', 'Hoje a festa é toda tua!', 'Mais um ano de aventuras e gargalhadas!', 'Que todos os teus sonhos se realizem!'],
  teen: ['O mundo é teu: vai com tudo!', 'Mais um ano a brilhar à tua maneira.', 'Que este ano seja épico!'],
  par: ['Amo-te mais a cada aniversário.', 'Obrigado por cada dia ao teu lado.', 'Feliz aniversário ao amor da minha vida!', 'Contigo, todos os dias são festa.'],
  velho: ['Obrigado por tudo o que me deste.', 'És o meu exemplo e o meu porto seguro.', 'Que a vida te devolva todo o amor que dás.', 'Um brinde a ti, hoje e sempre!'],
  amigo: ['Amigos assim não se encontram duas vezes.', 'Que a festa seja tão boa como tu!', 'Obrigado por estares sempre lá.', 'Mais um ano de histórias para contar!'],
  irmao: ['Crescemos juntos e ainda bem!', 'Para sempre a minha equipa.', 'O melhor presente que os pais me deram foste tu.'],
  trab: ['Que este ano traga ainda mais conquistas.', 'Obrigado pela boa energia de todos os dias.', 'Um ano cheio de sucesso e boas notícias!'],
  eu: ['Hoje celebro-me a mim!', 'Mais um ano, mais sabedoria (e mais bolo).', 'Que este novo ano seja o melhor até agora.']
};
function milestone(age, cat) {
  if (cat === 'pet') return age === 1 ? 'O primeiro aniversário! 🐾' : age >= 10 ? 'Uma vida inteira de amor de quatro patas.' : '';
  if (age === 18) return 'Maioridade! Agora é oficial: o mundo é teu.';
  if (age === 21) return '21 anos: idade de grandes começos!';
  if ([30, 40, 50, 60, 70, 80, 90, 100].includes(age)) return { 30: 'Bem-vindo aos 30: a melhor fase começa agora!', 40: 'Os 40 são os novos 30!', 50: 'Meio século de histórias e sorrisos!', 60: '60 anos de vida bem vivida!', 70: '70 anos de amor e sabedoria.', 80: '80 anos: uma vida que inspira!', 90: '90 anos: um tesouro de família!', 100: '100 anos: um século de vida!' }[age];
  return '';
}
function plainCat(Bd) {
  if (Bd.cat === 'pet' || Bd.cat === 'par' || Bd.cat === 'velho' || Bd.cat === 'amigo' || Bd.cat === 'irmao' || Bd.cat === 'trab' || Bd.cat === 'eu') {
    if (Bd.cat !== 'pet' && Bd.cat !== 'par' && Bd.cat !== 'velho' && Bd.cat !== 'trab' && Bd.age > 0 && Bd.age <= 12) return 'crianca';
    return Bd.cat;
  }
  return Bd.age <= 12 ? 'crianca' : Bd.age <= 17 ? 'teen' : 'amigo';
}
function plainize(Bd, seed) {
  const r = seeded('plain' + Bd.name + Bd.d + seed), pc = plainCat(Bd);
  const allowed = Bd.cat === 'pet' ? ['patinhas', 'festa', 'baloes', 'kids'] : pc === 'par' ? ['romantico', 'dourado', 'minimal'] : pc === 'crianca' ? ['kids', 'baloes', 'festa'] : pc === 'teen' ? ['festa', 'kids', 'minimal'] : pc === 'velho' ? ['dourado', 'baloes', 'minimal', 'festa'] : ['festa', 'baloes', 'dourado', 'minimal'];
  const lines = []; const l1 = pick(PLAIN[pc] || PLAIN.amigo, r); lines.push(l1);
  let l2 = pick(PLAIN[pc] || PLAIN.amigo, r); if (l2 === l1) l2 = (PLAIN[pc] || PLAIN.amigo).find(x => x !== l1); lines.push(l2);
  const ms = Bd.showAge ? milestone(Bd.age, Bd.cat) : ''; if (ms) lines.unshift(ms);
  return { ...Bd, theme: 'plain', layout: pick(allowed, r), plain: lines.slice(0, 3), seed };
}
const PAL = {
  festa: { bg: ['#1b1060', '#06061a'], ink: '#ffffff', acc: '#f2c76e', sub: '#ffb3c9', title: 'italic 600 {s}px "Cormorant Garamond"' },
  baloes: { bg: ['#ffe9f2', '#e6f3ff'], ink: '#2a2350', acc: '#ff5a8a', sub: '#5a4a9a', title: '800 {s}px Manrope' },
  dourado: { bg: ['#141414', '#000000'], ink: '#f5e7c4', acc: '#d4af37', sub: '#c9b27a', title: '700 {s}px Cinzel' },
  kids: { bg: ['#ffcf3f', '#ff6fa8'], ink: '#2a1050', acc: '#ffffff', sub: '#3b1670', title: '800 {s}px Manrope' },
  romantico: { bg: ['#ff6b98', '#7a1238'], ink: '#ffffff', acc: '#ffe3ec', sub: '#ffd0de', title: 'italic 600 {s}px "Cormorant Garamond"' },
  patinhas: { bg: ['#ffd8a8', '#f59f5f'], ink: '#3a1f0a', acc: '#7a3b12', sub: '#5a2e10', title: '800 {s}px Manrope' },
  minimal: { bg: ['#f4f1ea', '#f4f1ea'], ink: '#1d1d1f', acc: '#c6533a', sub: '#5f5f63', title: '700 {s}px Cinzel' }
};
function drawPlainFrame(ctx, W, H, S, Bd, t) {
  const L = Bd.layout, p = PAL[L], r = seeded('pl' + Bd.name + Bd.seed), k = v => ease(Math.max(0, Math.min(1, v)));
  const g = ctx.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, p.bg[0]); g.addColorStop(1, p.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // decoração
  if (L === 'festa' || L === 'kids') { const cols = L === 'kids' ? ['#ffffff', '#2a1050', '#3fd3ff', '#7ee0a6'] : ['#f2c76e', '#ff6b98', '#6fd3ff', '#7ee0a6', '#c79bff']; for (let i = 0; i < 110; i++) { const x0 = r() * W, sp = 120 + r() * 240, y = ((r() * H + t * sp) % (H + 40)) - 20, sz = 7 + r() * 11; ctx.save(); ctx.translate(x0 + Math.sin(t * 2 + i) * 12, y); ctx.rotate(r() * 6 + t * (r() * 4 - 2)); ctx.fillStyle = cols[i % cols.length]; ctx.globalAlpha = .8; L === 'kids' && i % 3 === 0 ? (ctx.beginPath(), ctx.arc(0, 0, sz * .6, 0, 7), ctx.fill()) : ctx.fillRect(-sz / 2, -sz / 4, sz, sz / 2); ctx.restore(); } }
  if (L === 'baloes') { const cols = ['#ff5a8a', '#6fb8ff', '#ffcf3f', '#7ee0a6', '#c79bff']; for (let i = 0; i < 11; i++) { const x = (i / 10) * W + (r() - .5) * 60, by = H * .18 + r() * H * .15 - (t > 0 ? Math.sin(t * 1.4 + i) * 14 : 0), rr2 = 48 + r() * 30; ctx.strokeStyle = '#8888aa66'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, by + rr2 * 1.2); ctx.quadraticCurveTo(x + 20, by + rr2 * 2.2, x - 10, by + rr2 * 3.4); ctx.stroke(); ctx.fillStyle = cols[i % 5]; ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(x, by, rr2 * .85, rr2, 0, 0, 7); ctx.fill(); ctx.globalAlpha = .35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x - rr2 * .3, by - rr2 * .35, rr2 * .18, rr2 * .28, -.4, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } }
  if (L === 'dourado') { ctx.strokeStyle = p.acc; ctx.lineWidth = 3; rr(ctx, 50, 50, W - 100, H - 100, 10); ctx.stroke(); ctx.lineWidth = 1.5; rr(ctx, 66, 66, W - 132, H - 132, 8); ctx.stroke(); for (let i = 0; i < 40; i++) { ctx.globalAlpha = .15 + r() * .5; ctx.fillStyle = p.acc; ctx.beginPath(); ctx.arc(80 + r() * (W - 160), 80 + r() * (H - 160), 1 + r() * 2.5, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  if (L === 'romantico') { for (let i = 0; i < 26; i++) { const x = r() * W, y = ((r() * H - t * (40 + r() * 60)) % H + H) % H, s = 14 + r() * 26; ctx.globalAlpha = .25 + r() * .4; ctx.fillStyle = '#ffffff'; heart(ctx, x, y, s); } ctx.globalAlpha = 1; }
  if (L === 'patinhas') { for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, s = 26 + r() * 22, a = r() * 6; ctx.globalAlpha = .18; ctx.fillStyle = '#7a3b12'; paw(ctx, x, y, s, a); } ctx.globalAlpha = 1; }
  if (L === 'minimal') { ctx.fillStyle = p.acc; ctx.fillRect(W / 2 - 40, S ? 250 : 150, 80, 6); }
  // texto
  ctx.textAlign = 'center'; const top = S ? 330 : 215;
  ctx.globalAlpha = k((t - 0.3) / 0.9); ctx.fillStyle = p.sub; ctx.font = (L === 'dourado' ? '700 34px Cinzel' : '800 36px Manrope'); ctx.fillText(L === 'dourado' ? 'FELIZ ANIVERSÁRIO' : 'Feliz Aniversário', W / 2, top);
  const a2 = k((t - 1.1) / 1.1); ctx.globalAlpha = a2; ctx.save(); ctx.translate(W / 2, top + (S ? 170 : 150)); ctx.scale(.75 + .25 * a2, .75 + .25 * a2); ctx.fillStyle = p.ink;
  let fs = S ? 150 : 130; const nm = L === 'dourado' || L === 'minimal' ? Bd.name.toUpperCase() : Bd.name; ctx.font = p.title.replace('{s}', fs); while (ctx.measureText(nm).width > W - 160 && fs > 50) { fs -= 6; ctx.font = p.title.replace('{s}', fs); } ctx.fillText(nm, 0, 0); ctx.restore();
  ctx.globalAlpha = k((t - 1.8) / 0.9); ctx.fillStyle = p.sub; ctx.font = `600 ${S ? 36 : 32}px Manrope`; ctx.fillText(Bd.dedication, W / 2, top + (S ? 250 : 222));
  const cy = top + (S ? 520 : 470), a3 = k((t - 2.6) / 1.0);
  if (Bd.showAge && Bd.age > 0) { ctx.globalAlpha = a3; ctx.fillStyle = p.acc; ctx.font = `800 ${(S ? 260 : 220) * (.7 + .3 * a3)}px Manrope`; ctx.textBaseline = 'middle'; ctx.fillText(String(Bd.age), W / 2, cy); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = p.sub; ctx.font = `800 ${S ? 40 : 34}px Manrope`; ctx.fillText(Bd.age === 1 ? 'ANINHO' : 'ANOS', W / 2, cy + (S ? 150 : 128)); }
  else { ctx.globalAlpha = a3; ctx.font = `${S ? 170 : 150}px sans-serif`; ctx.textBaseline = 'middle'; ctx.fillText(Bd.cat === 'pet' ? '🐾' : '🎂', W / 2, cy); ctx.textBaseline = 'alphabetic'; }
  let y = cy + (S ? 270 : 250); ctx.font = `${L === 'festa' || L === 'romantico' ? 'italic 600' : '600'} ${S ? 48 : 46}px ${L === 'festa' || L === 'romantico' ? '"Cormorant Garamond"' : 'Manrope'}`;
  Bd.plain.forEach((l, i) => { ctx.globalAlpha = k((t - 3.6 - i * 0.8) / 0.8); ctx.fillStyle = i === 0 && Bd.plain.length === 3 ? p.acc : p.ink; y = wrap(ctx, l, W / 2, y, W - 170, S ? 58 : 56, 2, 'center') + (S ? 22 : 20); });
  ctx.globalAlpha = k((t - 6.6) / 0.8); ctx.fillStyle = p.sub; ctx.font = `700 ${S ? 30 : 26}px Manrope`; ctx.fillText(Bd.from ? `Com carinho, ${Bd.from} ❤` : '❤', W / 2, H - (S ? 230 : 80));
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
function heart(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * .3); ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s); ctx.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); ctx.fill(); }
function paw(ctx, x, y, s, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, s * .25, s * .42, s * .34, 0, 0, 7); ctx.fill(); for (const [dx, dy] of [[-.42, -.2], [-.15, -.42], [.15, -.42], [.42, -.2]]) { ctx.beginPath(); ctx.ellipse(dx * s, dy * s, s * .14, s * .18, 0, 0, 7); ctx.fill(); } ctx.restore(); }
function capPlain(Bd) { return [`🎉 Feliz aniversário, ${Bd.name}!`, Bd.dedication, '', ...Bd.plain, '', Bd.from ? `Com carinho, ${Bd.from} ❤️` : '❤️'].join('\n'); }

// ---------- PIN ----------
async function hashPin(pin) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ceu|' + pin)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 5381; for (const c of 'ceu|' + pin) h = (h * 33) ^ c.charCodeAt(0); return 'x' + (h >>> 0).toString(16); }
}
const hasPin = () => !!store.get('ceu_pin');
async function checkPin(pin) { return (await hashPin(pin)) === store.get('ceu_pin'); }
async function setPin(pin) { if (!pin) { store.set('ceu_pin', ''); try { localStorage.removeItem('ceu_pin'); } catch (e) { } return; } store.set('ceu_pin', await hashPin(pin)); }
function lockScreen() {
  return new Promise(res => {
    const el = $('#lock'); el.hidden = false; const inp = $('#lockPin'); inp.value = ''; setTimeout(() => inp.focus(), 100);
    const p = P.get(); $('#lockHi').textContent = p && p.name ? `Olá, ${p.name.split(' ')[0]}!` : 'Olá!';
    const go = async () => { if (await checkPin(inp.value)) { el.hidden = true; res(true); } else { inp.value = ''; el.querySelector('.lockbox').classList.add('shake'); setTimeout(() => el.querySelector('.lockbox').classList.remove('shake'), 400); toast('PIN errado'); } };
    $('#lockGo').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    inp.oninput = () => { if (inp.value.length >= 4 && inp.value.length === (+store.get('ceu_pinlen') || 4)) go(); };
    $('#lockForgot').onclick = () => { if (confirmBox('Esqueceste o PIN? Para entrar, os teus dados pessoais deste telemóvel (perfil, diário, aniversários, animais) vão ser apagados.')) { ['ceu_pin', 'ceu_profile', 'ceu_me', 'ceu_diario', 'ceu_bdays', 'ceu_pets', 'ceu_cycle', 'ceu_moments'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } }); try { Object.keys(localStorage).filter(k => /^ceu_ano_/.test(k)).forEach(k => localStorage.removeItem(k)); indexedDB.deleteDatabase('ceu-fotos'); } catch (e) { } el.hidden = true; res(true); } };
  });
}
function confirmBox(msg) { try { return window.confirm(msg); } catch (e) { return false; } }

// ---------- DIÁRIO ----------
const MOODS = [[5, '😄', 'Radiante'], [4, '🙂', 'Bem'], [3, '😐', 'Assim-assim'], [3, '😴', 'Cansado'], [2, '😰', 'Ansioso'], [2, '😠', 'Irritado'], [2, '😔', 'Em baixo'], [1, '😢', 'Triste']];
const D_TAGS = ['Amor', 'Família', 'Trabalho', 'Amigos', 'Saúde', 'Dinheiro', 'Casa', 'Estudos', 'Animais', 'Eu'];
const THEMES = {
  trabalho: /trabalh|chefe|emprego|colega|reuni|patr|escritorio|turno|horario|cliente/, amor: /amor|namor|marido|mulher|esposa|paixao|beij|relacao|ex\b|casament/, familia: /mae|pai|filh|irma|irmao|avo|familia|sogr|tio|tia|prim/,
  saude: /dor|doente|medico|cansad|dormi|sono|insonia|hospital|saude|febre/, dinheiro: /dinheiro|contas|divid|salario|pagar|renda|credito|gastar|comprar/, amigos: /amig|festa|jantar|cafe|conviv/,
  ansiedade: /ansios|ansiedade|stress|nervos|preocup|medo|panico|aperto/, tristeza: /triste|sozinh|chor|vazio|saudade|desanim|sem vontade/, alegria: /feliz|consegui|alegr|obrigad|grat|orgulh|adorei|bom dia|otimo|maravilh/, raiva: /raiva|irritad|chatead|furios|zang|injust/
};
const CRISIS = /suicid|matar-me|matar me|tirar a minha vida|nao quero viver|quero morrer|acabar com tudo|acabar com a minha vida|automutil|cortar-me|cortar me|magoar-me|nao aguento mais viver|desaparecer para sempre/;
const T_REFLECT = {
  trabalho: ['O trabalho aparece no que escreveste.', 'Há algo no trabalho que te está a ocupar a cabeça.'],
  amor: ['O coração está presente nas tuas palavras.', 'Falaste de amor: isso diz muito do que é importante para ti.'],
  familia: ['A família ocupa um lugar grande no teu dia.', 'Quem é família mexe sempre connosco, para o bem e para o difícil.'],
  saude: ['O corpo também está a falar contigo.', 'Cuidar de ti parece ser um tema hoje.'],
  dinheiro: ['As contas pesam, e é normal que preocupem.', 'O dinheiro aparece como uma preocupação.'],
  amigos: ['Os amigos fazem parte do teu dia.', 'Estar com pessoas que gostam de ti conta muito.'],
  ansiedade: ['Sente-se alguma inquietação no que escreveste.', 'A cabeça parece estar acelerada.'],
  tristeza: ['Há tristeza nas tuas palavras, e é bom que lhe dês espaço.', 'Parece um dia pesado por dentro.'],
  alegria: ['Há alegria no que escreveste!', 'Que bom ler isto: guarda esta sensação.'],
  raiva: ['Há irritação aqui, e ela costuma apontar para algo que te importa.', 'A raiva é um sinal: alguma coisa não está bem para ti.']
};
const T_ASK = {
  trabalho: 'O que é que estaria nas tuas mãos mudar amanhã, nem que seja pouco?', amor: 'O que gostavas que a outra pessoa soubesse sobre como te sentes?', familia: 'Há alguma conversa que precise de acontecer?',
  saude: 'Do que é que o teu corpo precisa hoje: descanso, movimento ou cuidado?', dinheiro: 'Qual é o próximo passo pequeno e possível nas contas?', amigos: 'Quem te faz bem e com quem podes estar esta semana?',
  ansiedade: 'Se escreveres a preocupação numa frase, ela fica mais pequena ou maior?', tristeza: 'Com quem podias partilhar isto, mesmo que só um bocadinho?', alegria: 'O que fizeste para que isto acontecesse? Vale a pena repetir.', raiva: 'O que é que precisava de ser diferente para te sentires respeitado?'
};
const T_TRY = {
  ansiedade: 'Experimenta respirar devagar: inspira em 4 tempos, segura 4, expira em 6. Repete 5 vezes.', tristeza: 'Um passeio curto, uma mensagem a alguém de quem gostas, ou simplesmente descansar já ajuda.', raiva: 'Antes de responder a alguém, dá-te 10 minutos ou uma volta a pé.',
  trabalho: 'Escreve as 3 coisas mais importantes de amanhã e esquece o resto por hoje.', saude: 'Bebe água, deita-te um pouco mais cedo e, se a dor continuar, fala com o médico.', dinheiro: 'Uma lista simples do que entra e do que sai já tira peso à cabeça.',
  alegria: 'Escreve mais duas coisas boas de hoje: treina o olhar para o que corre bem.', amor: 'Um gesto pequeno diz muito: uma mensagem, um abraço, um café.', familia: 'Liga a alguém da família só para saber como está.', amigos: 'Marca aquele café que andas a adiar.'
};
function crisisHtml() {
  return `<div class="crisis"><b>Estou preocupado com o que escreveste. Não estás sozinho.</b><p>Se estás em perigo agora, liga <a href="tel:112">112</a>.</p><p>📞 Linha Nacional de Prevenção do Suicídio: <a href="tel:1411">1411</a> (24 horas)</p><p>📞 SNS 24, aconselhamento psicológico: <a href="tel:808242424">808 24 24 24</a>, opção 4 (24 horas)</p><p>📞 SOS Voz Amiga: <a href="tel:213544545">213 544 545</a> · <a href="tel:912802669">912 802 669</a> · <a href="tel:963524660">963 524 660</a> (ao fim do dia)</p><p>Falar com alguém de confiança também ajuda: um amigo, um familiar, o teu médico.</p></div>`;
}
function diaryFeedback(note, all) {
  const t = norm2(note.txt || ''), mood = note.mood, name = ((P.get() || {}).name || '').split(' ')[0], r = seeded(note.id + note.txt.length);
  if (CRISIS.test(t)) return crisisHtml();
  const themes = Object.keys(THEMES).filter(k => THEMES[k].test(t)).concat((note.tags || []).map(x => norm2(x)).filter(x => THEMES[x] && !THEMES[x].test(t)));
  const uniq = [...new Set(themes)].slice(0, 3);
  const open = mood >= 5 ? `Que dia bom${name ? ', ' + name : ''}! ✨` : mood === 4 ? `Ainda bem que o dia correu bem${name ? ', ' + name : ''}.` : mood === 3 ? `Obrigado por partilhares${name ? ', ' + name : ''}. Há dias assim, nem bons nem maus.` : mood === 2 ? `Obrigado por escreveres${name ? ', ' + name : ''}. Parece um dia exigente.` : `Lamento que o dia esteja a ser difícil${name ? ', ' + name : ''}. Fizeste bem em escrever.`;
  const out = [open];
  uniq.slice(0, 2).forEach(k => out.push(pick(T_REFLECT[k], r)));
  const main = uniq.find(k => ['ansiedade', 'tristeza', 'raiva'].includes(k)) || uniq[0];
  if (main) { out.push(`<i>${T_ASK[main]}</i>`); if (T_TRY[main]) out.push('💡 ' + T_TRY[main]); }
  else out.push('<i>O que é que gostavas de lembrar deste dia daqui a um ano?</i>');
  const s = skyFor(note.d), ph = moonPhaseName(s.phase.elong);
  out.push(`<small>🌙 Nesse dia a Lua estava em ${SIGN_IN[s.moon.sign]} (${ph}).${ph === 'Lua Cheia' ? ' Dizem que a Lua Cheia mexe com as emoções.' : ph === 'Lua Nova' ? ' Lua Nova: bom momento para um recomeço.' : ''}</small>`);
  const recent = all.filter(x => x.id !== note.id).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 4);
  if (mood <= 2 && recent.length >= 3 && recent.slice(0, 3).every(x => x.mood <= 2)) out.push(`<div class="careful">Tens escrito vários dias difíceis seguidos. Falar com alguém pode ajudar muito: uma pessoa de confiança, o teu médico, ou o aconselhamento psicológico do SNS 24 (<a href="tel:808242424">808 24 24 24</a>, opção 4), que é gratuito e funciona 24 horas.</div>`);
  return out.map(x => x.startsWith('<') ? x : `<p>${x}</p>`).join('');
}
const DIA = { all: () => P.list('ceu_diario'), save: l => P.setList('ceu_diario', l) };
function diaryInsights(all, ym) {
  const m = all.filter(x => x.d.startsWith(ym)); if (!m.length) return null;
  const avgM = m.reduce((a, x) => a + x.mood, 0) / m.length, counts = {};
  m.forEach(x => (x.tags || []).forEach(t => counts[t] = (counts[t] || 0) + 1));
  const topTags = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  const byPhase = { cresc: [], ming: [] }; all.forEach(x => { const e = skyFor(x.d).phase.elong; (e < 180 ? byPhase.cresc : byPhase.ming).push(x.mood); });
  const av = a => a.length ? a.reduce((p, c) => p + c, 0) / a.length : 0;
  const wd = [0, 0, 0, 0, 0, 0, 0], wn = [0, 0, 0, 0, 0, 0, 0]; all.forEach(x => { const [y, mm, dd] = dParts(x.d), k = new Date(Date.UTC(y, mm - 1, dd)).getUTCDay(); wd[k] += x.mood; wn[k]++; });
  const bestWd = wn.map((n, i) => [i, n ? wd[i] / n : 0]).filter(x => wn[x[0]] >= 2).sort((a, b) => b[1] - a[1])[0];
  return { n: m.length, avg: avgM, topTags, cresc: av(byPhase.cresc), ming: av(byPhase.ming), nc: byPhase.cresc.length, nm: byPhase.ming.length, bestWd: bestWd ? DIAS[bestWd[0]].toLowerCase() : null };
}
function memories(all) {
  const t = todayStr(), md = t.slice(5), out = [];
  all.forEach(x => { if (x.d === t) return; if (x.d.slice(5) === md) out.push({ x, lbl: `Faz ${+t.slice(0, 4) - +x.d.slice(0, 4)} ano(s)` }); else if (x.d.slice(8) === t.slice(8) && x.d.slice(0, 7) !== t.slice(0, 7)) out.push({ x, lbl: 'Neste dia, noutro mês' }); });
  return out.sort((a, b) => b.x.d.localeCompare(a.x.d)).slice(0, 3);
}
