// ===== Interesses: livros, séries e filmes, viagens =====
const INT = {
  livros: { key: 'ceu_books', ic: '📚', one: 'livro', by: 'Autor(a)', verb: ['Quero ler', 'A ler', 'Lido', 'Em pausa', 'Desisti'], done: 'Leste', doing: 'a ler' },
  series: { key: 'ceu_shows', ic: '🎬', one: 'série ou filme', by: 'Plataforma / realizador', verb: ['Quero ver', 'A ver', 'Visto', 'Em pausa', 'Desisti'], done: 'Viste', doing: 'a ver' },
  viagens: { key: 'ceu_trips', ic: '✈️', one: 'viagem', by: 'País', verb: ['Sonho / quero ir', 'A decorrer', 'Feita'], done: 'Viajaste', doing: 'em viagem' },
  colecoes: { key: 'ceu_colls', ic: '🧱', one: 'artigo', by: 'Coleção / marca', verb: ['Quero', 'Encomendado', 'Tenho', 'Emprestado', 'Vendido / oferecido'], done: 'Juntaste', doing: 'a caminho' }
};
const GENRES = { colecoes: ['LEGO', 'Funko Pop', 'Playmobil', 'Miniaturas / carros', 'Figuras e bonecos', 'Cartas colecionáveis', 'Banda desenhada', 'Discos / vinil', 'Jogos', 'Perfumes', 'Relógios', 'Moedas', 'Selos', 'Arte', 'Outro'], livros: ['Romance', 'Romance escaldante (picante)', 'Romance histórico', 'Erótico', 'Policial', 'Thriller / Suspense', 'Mistério', 'Terror', 'Fantasia', 'Ficção científica', 'Distopia', 'Aventura', 'Drama', 'Humor', 'Juvenil (Young Adult)', 'Infantil', 'Banda desenhada / Manga', 'Clássico', 'Literatura portuguesa', 'Poesia', 'Teatro', 'Conto', 'História', 'Biografia / Memórias', 'Autoajuda / Desenvolvimento pessoal', 'Espiritualidade', 'Psicologia', 'Filosofia', 'Religião', 'Ciência', 'Saúde e bem-estar', 'Culinária', 'Viagens', 'Negócios / Finanças', 'Arte e fotografia', 'Ensaio', 'Escolar / Estudo', 'Outro'], series: ['Drama', 'Comédia', 'Policial', 'Thriller', 'Crime real (true crime)', 'Mistério', 'Ação', 'Aventura', 'Ficção científica', 'Fantasia', 'Romance', 'Histórica / Época', 'Família', 'Juvenil', 'Documentário', 'Animação', 'Anime', 'Terror', 'Musical', 'Novela', 'Reality show', 'Culinária', 'Desporto', 'Outro'], viagens: ['Praia', 'Cidade', 'Natureza', 'Montanha', 'Cultura', 'Gastronomia', 'Aventura', 'Romântica', 'Família', 'Trabalho', 'Outro'] };
const OL_SUBJ = { 'Romance escaldante (picante)': 'romance', 'Romance histórico': 'historical_fiction', 'Thriller / Suspense': 'thriller', Mistério: 'mystery', Terror: 'horror', Distopia: 'dystopias', Aventura: 'adventure', Humor: 'humor', 'Juvenil (Young Adult)': 'young_adult_fiction', 'Banda desenhada / Manga': 'comics', Teatro: 'drama', Conto: 'short_stories', 'Biografia / Memórias': 'biography', 'Autoajuda / Desenvolvimento pessoal': 'self-help', Espiritualidade: 'spirituality', Psicologia: 'psychology', Filosofia: 'philosophy', Ciência: 'science', Culinária: 'cooking', Viagens: 'travel', 'Negócios / Finanças': 'business', 'Literatura portuguesa': 'portuguese_literature', Romance: 'romance', Policial: 'mystery', Thriller: 'thriller', Fantasia: 'fantasy', 'Ficção científica': 'science_fiction', História: 'history', Biografia: 'biography', Autoajuda: 'self-help', Poesia: 'poetry', Infantil: 'juvenile_fiction', Clássico: 'classic_literature' };
const intList = t => P.list(INT[t].key), intSave = (t, l) => P.setList(INT[t].key, l);
const ONLINE = () => navigator.onLine !== false && !/claude|claudeusercontent|anthropic/.test(location.hostname);
function durTxt(a, b) {
  if (!a || !b) return '';
  const ms = new Date(b).getTime() - new Date(a).getTime(); if (!(ms > 0)) return '';
  const h = ms / 36e5, d = Math.round(h / 24);
  if (h < 24) return `${Math.max(1, Math.round(h))} hora${Math.round(h) === 1 ? '' : 's'}`;
  if (d < 14) return `${d} dia${d === 1 ? '' : 's'}`;
  const w = Math.floor(d / 7), rd = d % 7; if (d < 60) return `${w} semana${w > 1 ? 's' : ''}${rd ? ` e ${rd} dia${rd > 1 ? 's' : ''}` : ''} (${d} dias)`;
  return `${Math.round(d / 30)} meses (${d} dias)`;
}
const dtJoin = (d, t) => d ? `${d}T${t || '12:00'}` : '';
function intStats(t) {
  const L = intList(t), done = L.filter(x => x.status === 2), y = todayStr().slice(0, 4);
  const durs = done.map(x => { const a = dtJoin(x.sd, x.st), b = dtJoin(x.ed, x.et); return a && b ? (new Date(b) - new Date(a)) / 864e5 : null; }).filter(v => v > 0);
  const byG = {}, byA = {}; done.forEach(x => { if (x.genre) byG[x.genre] = (byG[x.genre] || 0) + 1; if (x.by) byA[x.by] = (byA[x.by] || 0) + 1; });
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  return { total: L.length, done: done.length, year: done.filter(x => (x.ed || '').startsWith(y)).length, doing: L.filter(x => x.status === 1).length, want: L.filter(x => x.status === 0).length, avgDays: durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : null, topG: top(byG), topA: top(byA), best: done.filter(x => x.rating >= 5).slice(-3), countries: t === 'viagens' ? [...new Set(done.map(x => (x.by || '').trim()).filter(Boolean))] : [] };
}
// ---- leitura e o céu ----
function readingToday(ds) {
  const s = skyFor(ds), el = SIGNS[s.moon.sign].el, n = SIGNS[s.moon.sign].n;
  let v = 1 + (['Gémeos', 'Virgem', 'Sagitário', 'Aquário', 'Peixes', 'Caranguejo'].includes(n) ? 1 : 0) + (el === 'ar' ? 1 : 0) - (s.mercury.rx ? 0 : 0);
  v = Math.max(0, Math.min(3, v));
  const why = ['Gémeos', 'Virgem', 'Aquário'].includes(n) ? `Lua em ${n}: mente curiosa, bom para aprender.` : ['Peixes', 'Caranguejo'].includes(n) ? `Lua em ${n}: imaginação em alta, ótimo para romances.` : n === 'Sagitário' ? 'Lua em Sagitário: dia de viagens… nem que seja num livro.' : `Lua em ${n}.`;
  const PH = planetaryHours(ds, city()), hrs = PH ? PH.hours.filter(h => h.p === 'mercury' || h.p === 'moon').slice(0, 4).map(h => `${fmtHM(h.start, city()[3])} (${PL[h.p].n})`) : [];
  return { v, why: why + (s.mercury.rx ? ' Mercúrio retrógrado: ótimo para reler.' : ''), hrs };
}
// ---- internet (Open Library e TVmaze) ----
async function jget(url) { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); }
async function searchBooks(q) {
  const [g, o] = await Promise.allSettled([
    jget(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&langRestrict=pt`),
    jget(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5&fields=title,author_name,first_publish_year,cover_i,number_of_pages_median`)]);
  const R = [];
  if (g.status === 'fulfilled') (g.value.items || []).forEach(it => { const v = it.volumeInfo || {}; R.push({ desc: ((v.subtitle || '') + ' ' + (v.description || '')).slice(0, 700), pages: v.pageCount || '', title: v.title || '', by: (v.authors || [])[0] || '', year: (v.publishedDate || '').slice(0, 4), cover: v.imageLinks ? (v.imageLinks.thumbnail || '').replace('http:', 'https:').replace('&edge=curl', '') : '' }); });
  if (o.status === 'fulfilled') (o.value.docs || []).forEach(d => R.push({ pages: d.number_of_pages_median || '', title: d.title, by: (d.author_name || [])[0] || '', year: d.first_publish_year, cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '' }));
  if (g.status === 'rejected' && o.status === 'rejected') throw new Error('offline');
  const seen = new Set(); return R.filter(r => { const k = (r.title + '|' + r.by).toLowerCase(); if (!r.title || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
}
async function searchShows(q) {
  const j = await jget(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
  return j.slice(0, 6).map(x => ({ title: x.show.name, by: (x.show.network || x.show.webChannel || {}).name || '', year: (x.show.premiered || '').slice(0, 4), cover: x.show.image ? x.show.image.medium.replace('http:', 'https:') : '', tvmaze: x.show.id, genre: '' }));
}
async function nextEpisode(id) {
  const j = await jget(`https://api.tvmaze.com/shows/${id}?embed=nextepisode`);
  const e = j._embedded && j._embedded.nextepisode; return e ? { date: e.airdate, name: e.name, s: e.season, n: e.number } : null;
}
async function authorNews(authors) {
  const out = [], y = +todayStr().slice(0, 4);
  for (const a of authors.slice(0, 8)) {
    try { const j = await jget(`https://openlibrary.org/search.json?author=${encodeURIComponent(a)}&sort=new&limit=3&fields=title,first_publish_year,cover_i`); (j.docs || []).filter(d => d.first_publish_year >= y - 1).forEach(d => out.push({ by: a, title: d.title, year: d.first_publish_year, cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : '' })); } catch (e) { }
  }
  return out;
}
async function bookSuggest(genre, have) {
  const subj = OL_SUBJ[genre]; if (!subj) return [];
  const j = await jget(`https://openlibrary.org/search.json?subject=${subj}&sort=rating&limit=12&fields=title,author_name,cover_i,first_publish_year`);
  const hv = new Set(have.map(x => norm2(x.title)));
  return (j.docs || []).filter(d => !hv.has(norm2(d.title))).slice(0, 5).map(d => ({ title: d.title, by: (d.author_name || [])[0] || '', cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : '' }));
}
async function cachedDaily(key, fn) {
  try { const c = JSON.parse(store.get(key) || 'null'); if (c && c.d === todayStr()) return c.v; } catch (e) { }
  const v = await fn(); store.set(key, JSON.stringify({ d: todayStr(), v })); return v;
}

// ---- estatísticas de leitura ----
const READER = [[0, '📖 Leitor(a) curioso(a)'], [4, '📚 Leitor(a) assíduo(a)'], [12, '🐛 Devora-livros'], [25, '🦉 Rato de biblioteca'], [50, '🏛️ Biblioteca ambulante']];
const daysSince = d => d ? Math.max(0, Math.round((noonJd(todayStr()) - noonJd(d)))) : null;
function bookStats(year) {
  const L = intList('livros'), done = L.filter(x => x.status === 2), yr = done.filter(x => (x.ed || '').startsWith(year));
  const months = Array(12).fill(0); yr.forEach(x => months[+x.ed.slice(5, 7) - 1]++);
  const pagesY = yr.reduce((a, x) => a + (+x.pages || 0), 0), withP = done.filter(x => +x.pages > 0);
  const durs = done.map(x => ({ x, d: x.sd && x.ed ? Math.max(1, Math.round((new Date(dtJoin(x.ed, x.et)) - new Date(dtJoin(x.sd, x.st))) / 864e5)) : null })).filter(o => o.d);
  const speed = durs.filter(o => +o.x.pages > 0).map(o => +o.x.pages / o.d);
  const byA = {}; done.forEach(x => { if (!x.by) return; byA[x.by] = byA[x.by] || { n: 0, r: 0 }; byA[x.by].n++; byA[x.by].r += x.rating || 0; });
  const topA = Object.entries(byA).sort((a, b) => b[1].n - a[1].n || b[1].r - a[1].r)[0];
  const byG = {}; done.forEach(x => { if (x.genre) byG[x.genre] = (byG[x.genre] || 0) + 1; });
  const topG = Object.entries(byG).sort((a, b) => b[1] - a[1])[0];
  const rated = done.filter(x => x.rating), avgR = rated.length ? rated.reduce((a, x) => a + x.rating, 0) / rated.length : 0;
  const lvl = READER.filter(r => yr.length >= r[0]).pop();
  const logs = new Set(L.flatMap(x => x.log || [])); let streak = 0; for (let k = 0; k < 400; k++) { const d = dayStr(noonJd(todayStr()) - k); if (logs.has(d)) streak++; else if (k > 0) break; }
  return { L, done, yr, months, pagesY, words: pagesY * 250, avgPages: withP.length ? Math.round(withP.reduce((a, x) => a + +x.pages, 0) / withP.length) : 0, avgDays: durs.length ? Math.round(durs.reduce((a, o) => a + o.d, 0) / durs.length) : 0, speed: speed.length ? Math.round(speed.reduce((a, b) => a + b, 0) / speed.length) : 0, fastest: durs.sort((a, b) => a.d - b.d)[0], longest: withP.sort((a, b) => +b.pages - +a.pages)[0], topA, topG, avgR, lvl, next: READER.find(r => r[0] > yr.length), streak, reading: L.filter(x => x.status === 1), paused: L.filter(x => x.status === 3), quit: L.filter(x => x.status === 4), readDays: logs.size };
}

// ===== Países: bandeira + cores =====
const COUNTRIES = [
  ['portugal', 'PT', ['#046a38', '#da291c', '#ffcc29']], ['espanha', 'ES', ['#c60b1e', '#ffc400', '#c60b1e']], ['franca', 'FR', ['#0055a4', '#ffffff', '#ef4135']], ['italia', 'IT', ['#009246', '#ffffff', '#ce2b37']],
  ['alemanha', 'DE', ['#000000', '#dd0000', '#ffce00']], ['reino unido', 'GB', ['#012169', '#ffffff', '#c8102e']], ['inglaterra', 'GB', ['#012169', '#ffffff', '#c8102e']], ['escocia', 'GB', ['#005eb8', '#ffffff', '#005eb8']], ['irlanda', 'IE', ['#169b62', '#ffffff', '#ff883e']],
  ['holanda', 'NL', ['#ae1c28', '#ffffff', '#21468b']], ['paises baixos', 'NL', ['#ae1c28', '#ffffff', '#21468b']], ['belgica', 'BE', ['#000000', '#fdda24', '#ef3340']], ['suica', 'CH', ['#da291c', '#ffffff', '#da291c']], ['austria', 'AT', ['#ed2939', '#ffffff', '#ed2939']],
  ['grecia', 'GR', ['#0d5eaf', '#ffffff', '#0d5eaf']], ['croacia', 'HR', ['#ff0000', '#ffffff', '#171796']], ['republica checa', 'CZ', ['#ffffff', '#d7141a', '#11457e']], ['chequia', 'CZ', ['#ffffff', '#d7141a', '#11457e']], ['hungria', 'HU', ['#ce2939', '#ffffff', '#477050']],
  ['polonia', 'PL', ['#ffffff', '#dc143c']], ['dinamarca', 'DK', ['#c8102e', '#ffffff', '#c8102e']], ['suecia', 'SE', ['#006aa7', '#fecc00', '#006aa7']], ['noruega', 'NO', ['#ba0c2f', '#ffffff', '#00205b']], ['finlandia', 'FI', ['#ffffff', '#002f6c', '#ffffff']], ['islandia', 'IS', ['#02529c', '#ffffff', '#dc1e35']],
  ['turquia', 'TR', ['#e30a17', '#ffffff', '#e30a17']], ['marrocos', 'MA', ['#c1272d', '#006233', '#c1272d']], ['egito', 'EG', ['#ce1126', '#ffffff', '#000000']], ['tunisia', 'TN', ['#e70013', '#ffffff', '#e70013']], ['cabo verde', 'CV', ['#003893', '#ffffff', '#cf2027']],
  ['angola', 'AO', ['#cc092f', '#000000', '#ffcb00']], ['mocambique', 'MZ', ['#009a44', '#000000', '#fce100']], ['sao tome', 'ST', ['#12ad2b', '#ffce00', '#d21034']], ['guine-bissau', 'GW', ['#ce1126', '#fcd116', '#009e49']], ['africa do sul', 'ZA', ['#007a4d', '#ffb612', '#de3831']],
  ['brasil', 'BR', ['#009c3b', '#ffdf00', '#002776']], ['estados unidos', 'US', ['#b22234', '#ffffff', '#3c3b6e']], ['eua', 'US', ['#b22234', '#ffffff', '#3c3b6e']], ['canada', 'CA', ['#d80621', '#ffffff', '#d80621']], ['mexico', 'MX', ['#006847', '#ffffff', '#ce1126']],
  ['cuba', 'CU', ['#002a8f', '#ffffff', '#cf142b']], ['republica dominicana', 'DO', ['#002d62', '#ffffff', '#ce1126']], ['argentina', 'AR', ['#74acdf', '#ffffff', '#74acdf']], ['chile', 'CL', ['#0039a6', '#ffffff', '#d52b1e']], ['peru', 'PE', ['#d91023', '#ffffff', '#d91023']], ['colombia', 'CO', ['#fcd116', '#003893', '#ce1126']],
  ['japao', 'JP', ['#ffffff', '#bc002d', '#ffffff']], ['china', 'CN', ['#de2910', '#ffde00', '#de2910']], ['tailandia', 'TH', ['#a51931', '#f4f5f8', '#2d2a4a']], ['india', 'IN', ['#ff9933', '#ffffff', '#138808']], ['vietname', 'VN', ['#da251d', '#ffff00', '#da251d']], ['indonesia', 'ID', ['#ff0000', '#ffffff']],
  ['maldivas', 'MV', ['#d21034', '#007e3a', '#d21034']], ['emirados', 'AE', ['#00732f', '#ffffff', '#000000']], ['dubai', 'AE', ['#00732f', '#ffffff', '#000000']], ['australia', 'AU', ['#012169', '#ffffff', '#e4002b']], ['nova zelandia', 'NZ', ['#012169', '#ffffff', '#c8102e']],
  ['luxemburgo', 'LU', ['#ed2939', '#ffffff', '#00a1de']], ['andorra', 'AD', ['#10069f', '#fedf00', '#d50032']], ['malta', 'MT', ['#ffffff', '#cf142b']], ['chipre', 'CY', ['#ffffff', '#d57800', '#ffffff']], ['roménia', 'RO', ['#002b7f', '#fcd116', '#ce1126']], ['romenia', 'RO', ['#002b7f', '#fcd116', '#ce1126']], ['bulgaria', 'BG', ['#ffffff', '#00966e', '#d62612']]];
const CITY_C = { lisboa: 'portugal', porto: 'portugal', algarve: 'portugal', madeira: 'portugal', acores: 'portugal', madrid: 'espanha', barcelona: 'espanha', sevilha: 'espanha', galiza: 'espanha', canarias: 'espanha', paris: 'franca', roma: 'italia', veneza: 'italia', florenca: 'italia', milao: 'italia', napoles: 'italia', sicilia: 'italia', londres: 'reino unido', berlim: 'alemanha', amesterdao: 'holanda', bruxelas: 'belgica', viena: 'austria', praga: 'chequia', budapeste: 'hungria', atenas: 'grecia', santorini: 'grecia', istambul: 'turquia', marraquexe: 'marrocos', 'nova iorque': 'estados unidos', miami: 'estados unidos', orlando: 'estados unidos', 'rio de janeiro': 'brasil', 'sao paulo': 'brasil', salvador: 'brasil', toquio: 'japao', banguecoque: 'tailandia', cancun: 'mexico', 'punta cana': 'republica dominicana', 'cidade do cabo': 'africa do sul', luanda: 'angola', maputo: 'mocambique' };
const nrm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function countryOf(x) {
  const txt = ' ' + nrm([x.by, x.title, x.place].join(' ')).replace(/[^a-z\- ]/g, ' ') + ' ';
  for (const c of COUNTRIES) if (txt.includes(' ' + c[0] + ' ')) return c;
  for (const k in CITY_C) if (txt.includes(' ' + k + ' ')) return COUNTRIES.find(c => c[0] === CITY_C[k]);
  return null;
}
const flagOf = iso => String.fromCodePoint(...[...iso].map(ch => 127397 + ch.charCodeAt(0)));
function flagBg(c) { return `linear-gradient(90deg,${c[2].join(',')})`; }

// ===== Tarot (Arcanos Maiores) =====
const TAROT = [
  ['O Louco', '0', 'partir sem medo, aventura pura e caminhos que se descobrem a andar', 'um livro que te leva para fora da zona de conforto'],
  ['O Mago', 'I', 'tens tudo para fazer acontecer: boas escolhas e iniciativa', 'uma leitura que te dá ferramentas e ideias novas'],
  ['A Sacerdotisa', 'II', 'intuição: lugares com mistério e silêncio vão falar contigo', 'segredos nas entrelinhas: lê com atenção'],
  ['A Imperatriz', 'III', 'prazer, boa comida e beleza: viagem para os sentidos', 'uma história cheia de vida e emoção'],
  ['O Imperador', 'IV', 'organização: planeia bem e tudo corre sobre rodas', 'um livro sólido, que deixa estrutura'],
  ['O Hierofante', 'V', 'tradição e cultura: igrejas, museus e histórias antigas', 'sabedoria clássica, para guardar'],
  ['Os Enamorados', 'VI', 'viagem de coração: a dois, ou para te apaixonares pelo sítio', 'uma escolha do coração, vais criar laços com as personagens'],
  ['O Carro', 'VII', 'movimento e vitória: estrada, conquistas e ritmo', 'leitura rápida, daquelas que não se larga'],
  ['A Força', 'VIII', 'coragem tranquila: vais superar um imprevisto com calma', 'um livro que dá força nos dias difíceis'],
  ['O Eremita', 'IX', 'tempo para ti: natureza, pausa e reencontro interior', 'leitura de recolhimento, ao teu ritmo'],
  ['A Roda da Fortuna', 'X', 'sorte e acasos felizes: deixa espaço para o imprevisto', 'chegou na altura certa: há uma mensagem para ti'],
  ['A Justiça', 'XI', 'equilíbrio: contas certas e decisões justas na viagem', 'uma leitura que faz pensar no certo e no errado'],
  ['O Enforcado', 'XII', 'ver o mundo de outro ângulo: abranda e observa', 'muda a tua perspetiva, mesmo que custe a arrancar'],
  ['A Morte', 'XIII', 'fecho de ciclo: voltas diferente de como foste', 'um livro que transforma: não sais igual'],
  ['A Temperança', 'XIV', 'equilíbrio perfeito entre descanso e descoberta', 'leitura calma, que cura'],
  ['O Diabo', 'XV', 'tentações e excessos: aproveita, mas com conta peso e medida', 'viciante: cuidado com as noitadas'],
  ['A Torre', 'XVI', 'mudanças de planos: flexibilidade é tudo', 'reviravoltas que abanam tudo o que pensavas'],
  ['A Estrela', 'XVII', 'esperança e inspiração: viagem que renova a alma', 'inspirador: vai deixar-te esperança'],
  ['A Lua', 'XVIII', 'sonho e mistério: noites mágicas, mas confirma os detalhes', 'atmosfera de sonho e mistério'],
  ['O Sol', 'XIX', 'alegria, luz e boas fotos: uma das melhores cartas para viajar', 'leitura luminosa e feliz'],
  ['O Julgamento', 'XX', 'despertar: um sítio que te chama há muito tempo', 'um livro que te faz rever a tua vida'],
  ['O Mundo', 'XXI', 'realização: o mundo é teu, viagem de sonho cumprida', 'leitura completa, que fecha com chave de ouro']];
function tarotFor(seedStr) { let h = 2166136261; for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return TAROT[Math.abs(h) % 22]; }

// ===== Leitura astral de viagens e livros =====
const WDAY = [['Domingo', 'Sol', 'brilho e prazer'], ['Segunda-feira', 'Lua', 'emoções e regresso a casa'], ['Terça-feira', 'Marte', 'pressa e energia'], ['Quarta-feira', 'Mercúrio', 'deslocações, conversas e leitura'], ['Quinta-feira', 'Júpiter', 'viagens longas e sorte'], ['Sexta-feira', 'Vénus', 'prazer, romance e beleza'], ['Sábado', 'Saturno', 'paciência e estrutura']];
const wdOf = ds => new Date(ds + 'T12:00:00').getDay();
function tripScore(ds) {
  const s = skyFor(ds), m = SIGNS[s.moon.sign], wd = wdOf(ds), notes = []; let sc = 0;
  if (s.mercury.rx) { sc -= 3; notes.push('☿ Mercúrio retrógrado: atrasos, malas e papéis. Confirma tudo duas vezes.'); }
  if (s.moon.sign === 8) { sc += 3; notes.push('🌙 Lua em Sagitário, o signo das viagens: ótima energia para partir.'); }
  else if (s.moon.sign === 2) { sc += 2; notes.push('🌙 Lua em Gémeos: deslocações leves e muitas conversas.'); }
  else if (m.el === 'fogo' || m.el === 'ar') { sc += 1; notes.push(`🌙 Lua em ${m.n} (${m.el}): vontade de explorar.`); }
  else if (m.el === 'agua') notes.push(`🌙 Lua em ${m.n} (água): viagem emotiva, sabe bem voltar a casa.`);
  else notes.push(`🌙 Lua em ${m.n} (terra): viagem tranquila, boa para descansar e comer bem.`);
  const e = s.phase.elong; if (e < 168 && e >= 12) { sc += 1; notes.push(`${moonPhaseName(e)}: a energia cresce, bom para começar.`); } else if (e >= 168 && e < 192) notes.push('Lua Cheia: emoções à flor da pele e noites intensas.');
  if (wd === 4) { sc += 2; notes.push('♃ Quinta-feira, dia de Júpiter, o regente das viagens longas.'); } else if (wd === 3) { sc += 1; notes.push('☿ Quarta-feira, dia de Mercúrio, o planeta das deslocações.'); } else if (wd === 6) { sc -= 1; notes.push('♄ Sábado, dia de Saturno: leva paciência para filas e esperas.'); }
  if (s.jupiter.rx) { sc -= 1; notes.push('♃ Júpiter retrógrado: viagem mais de reencontro do que de novidade.'); }
  return { sc, notes, verdict: sc >= 4 ? ['🌟', 'Excelente altura para viajar'] : sc >= 1 ? ['✨', 'Boa altura para viajar'] : ['⚠️', 'Altura de cuidados, mas nada que estrague a viagem'] };
}
function bestTripDays(n = 90) { const all = [], pp = new Set(typeof predPeriods === 'function' ? predPeriods(todayStr(), dayStr(noonJd(todayStr()) + n + 7)) : []); let d = dayStr(noonJd(todayStr()) + 1); for (let k = 0; k < n; k++) { if (!pp.has(d) && !pp.has(dayStr(noonJd(d) + 2))) all.push([d, tripScore(d).sc]); d = dayStr(noonJd(d) + 1); } return all.filter(a => a[1] >= 2).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 4).map(a => a[0]).sort(); }
function meLine(ds) {
  const me = P.get(); if (!me || !me.d) return '';
  const my = SIGNS[sunSignOf(me.d)], s = skyFor(ds), m = SIGNS[s.moon.sign];
  if (s.moon.sign === sunSignOf(me.d)) return `💫 A Lua estava no teu signo (${my.n}): foi um momento muito teu.`;
  if (m.el === my.el) return `💫 A Lua em ${m.n} é do mesmo elemento que o teu ${my.n} (${my.el}): harmonia contigo.`;
  return '';
}
function astroBox(t, x) {
  if (t === 'viagens') {
    const T = tarotFor((x.title || '') + (x.sd || '') + 'v');
    if (!x.sd || x.status === 0) {
      const best = bestTripDays();
      return `<div class="box"><h3>🔮 O céu da tua viagem</h3>${best.length ? `<p>As melhores datas para partir nos próximos 3 meses:</p><p>${best.map(d => `<span class="chip" style="--c:var(--gold)">${niceDate(d).replace(/-feira/, '')}</span>`).join(' ')}</p>` : ''}<p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${T[2]}.</p>${best.length && CY.get().on && !CY.get().preg ? '<p class="note">🩸 Estas datas evitam os dias em que prevês ter o período.</p>' : ''}</div>`;
    }
    const r = tripScore(x.sd), s = skyFor(x.sd), wd = WDAY[wdOf(x.sd)], ml = meLine(x.sd);
    const end = x.ed ? skyFor(x.ed) : null;
    return `<div class="box astro"><h3>🔮 O céu da tua viagem</h3><p class="vd">${r.verdict[0]} <b>${x.status === 2 ? 'Foi' : 'É'} ${r.verdict[1].replace(/^Excelente/, 'uma excelente').replace(/^Boa/, 'uma boa').replace(/^Altura/, 'uma altura')}</b></p>${r.notes.map(n => `<p>${x.status === 2 ? n.replace('Confirma tudo duas vezes.', 'Se houve algum atraso, já sabes de quem foi a culpa 😉').replace('ótima energia para partir', 'ótima energia para partir, e partiste') : n}</p>`).join('')}<p>♃ Júpiter, planeta das viagens, estava em ${SIGN_IN[s.jupiter.sign]}.</p>${end ? `<p>🏁 Regressaste com a Lua em ${SIGN_IN[end.moon.sign]} (${moonPhaseName(end.phase.elong)}).</p>` : ''}${ml ? `<p>${ml}</p>` : ''}<p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${T[2]}.</p></div>${tripWatch(x)}`;
  }
  if (t === 'livros') {
    const T = tarotFor((x.title || '') + (x.by || '') + 'l');
    if (!x.sd) return `<div class="box"><h3>🔮 O céu deste livro</h3><p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${T[3]}.</p></div>`;
    const s = skyFor(x.sd), m = SIGNS[s.moon.sign], wd = WDAY[wdOf(x.sd)], ml = meLine(x.sd), end = x.ed ? skyFor(x.ed) : null;
    const mt = { fogo: 'leitura com garra, vais querer chegar ao fim depressa', terra: 'leitura paciente, saboreada página a página', ar: 'mente curiosa, ótimo para aprender e pensar', agua: 'imaginação e emoção em alta, perfeito para histórias' }[m.el];
    return `<div class="box astro"><h3>🔮 O céu deste livro</h3><p>🌙 Começaste com a Lua em ${m.n} (${moonPhaseName(s.phase.elong)}): ${mt}.</p><p>☿ Mercúrio, o planeta da leitura, estava em ${SIGN_IN[s.mercury.sign]}${s.mercury.rx ? ', retrógrado: bom para reler ou voltar a um autor que já conhecias' : ', direto: cabeça fresca para absorver'}.</p><p>📅 ${wd[0]}, dia de ${wd[1]}: ${wd[2]}.</p>${end ? `<p>🏁 Terminaste com a Lua em ${SIGN_IN[end.moon.sign]} (${moonPhaseName(end.phase.elong)}).</p>` : ''}${ml ? `<p>${ml}</p>` : ''}<p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${T[3]}.</p></div>`;
  }
  if (t === 'series') {
    const T = tarotFor((x.title || '') + 'tv'), ti = TAROT.indexOf(T), mv = x.kind === 'filme';
    if (!x.sd) return `<div class="box"><h3>🔮 O céu ${mv ? 'deste filme' : 'desta série'}</h3><p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${TAROT_TV[ti]}.</p></div>`;
    const s = skyFor(x.sd), m = SIGNS[s.moon.sign], wd = WDAY[wdOf(x.sd)], end = x.ed ? skyFor(x.ed) : null, ml = meLine(x.sd);
    const mt = { fogo: 'vais querer ver tudo de seguida', terra: 'para saborear episódio a episódio', ar: 'vais comentar cada cena com alguém', agua: 'prepara os lenços: vais sentir tudo' }[m.el];
    return `<div class="box astro"><h3>🔮 O céu ${mv ? 'deste filme' : 'desta série'}</h3><p>🌙 Começaste com a Lua em ${m.n} (${moonPhaseName(s.phase.elong)}): ${mt}.</p><p>♆ Neptuno, o planeta dos ecrãs e da fantasia, estava em ${SIGN_IN[s.neptune.sign]}${s.neptune.rx ? ' (retrógrado: ótimo para rever e reencontrar)' : ''}.</p><p>📅 ${wd[0]}, dia de ${wd[1]}: ${wd[2]}.</p>${end ? `<p>🏁 Acabaste com a Lua em ${SIGN_IN[end.moon.sign]} (${moonPhaseName(end.phase.elong)}).</p>` : ''}${ml ? `<p>${ml}</p>` : ''}<p class="note">🃏 Carta do Tarot: <b>${T[1]} · ${T[0]}</b>: ${TAROT_TV[ti]}.</p></div>`;
  }
  return '';
}

// ===== Séries e filmes: céu, tarot e o que ver hoje =====
const TAROT_TV = ['uma série que te leva para mundos inesperados', 'personagens geniais que fazem acontecer', 'cheia de segredos e reviravoltas subtis', 'conforto puro: para ver de mantinha', 'bem construída, temporada após temporada', 'clássica: daquelas que ficam', 'um casal que vais shippar', 'ritmo alucinante: impossível ver só um episódio', 'personagens que superam tudo', 'para ver sozinho(a), em silêncio', 'chegou na altura certa', 'faz pensar no certo e no errado', 'muda a forma como vês as coisas', 'final de temporada que muda tudo', 'equilibrada, sabe bem', 'viciante: maratona garantida', 'reviravoltas que ninguém espera', 'inspiradora, deixa esperança', 'atmosfera misteriosa e onírica', 'leve e feliz: dá boa disposição', 'faz-te rever a tua vida', 'final perfeito'];
const MOON_TV = [['Ação ou aventura', 'Lua em Carneiro pede adrenalina'], ['Culinária ou um romance leve', 'Lua em Touro pede conforto e coisas boas'], ['Comédia ou talk show', 'Lua em Gémeos quer rir e conversar'], ['Drama de família ou nostalgia', 'Lua em Caranguejo puxa pela emoção'], ['Algo épico ou um musical', 'Lua em Leão quer brilho e grandiosidade'], ['Policial de investigação', 'Lua em Virgem gosta de pistas e pormenores'], ['Romance ou moda', 'Lua em Balança pede beleza e amor'], ['Thriller ou crime real', 'Lua em Escorpião adora mistério e intensidade'], ['Aventura ou documentário de viagens', 'Lua em Sagitário quer horizontes'], ['Documentário ou série histórica', 'Lua em Capricórnio quer aprender algo sério'], ['Ficção científica', 'Lua em Aquário quer o futuro e o diferente'], ['Fantasia ou um drama que faz chorar', 'Lua em Peixes pede sonho e lágrimas']];
const TV_KEYS = [/aç|aventur|acao/, /culin|romance|comed/, /comed|talk/, /drama|famil|novela/, /musical|fantas|hist|época|epoca/, /polic|crime|mist/, /romance/, /thriller|crime|mist|terror/, /aventur|document/, /document|hist/, /cient|fic/, /fantas|drama|anim/];
function tvToday(ds) {
  const s = skyFor(ds), m = s.moon.sign, L = intList('series').filter(x => x.status === 0 || x.status === 3), re = TV_KEYS[m];
  const pick = L.find(x => re.test(nrm(x.genre || ''))) || null;
  return { g: MOON_TV[m][0], why: MOON_TV[m][1], pick, nep: s.neptune && s.neptune.rx };
}
function tvTodayBox(ds) { const T = tvToday(ds); return `<div class="box"><h3>📺 Hoje no sofá</h3><p><b>${T.g}</b>: ${T.why}.</p>${T.pick ? `<p>🍿 Da tua lista «Quero ver»: <b class="tvpick" data-id="${T.pick.id}" style="cursor:pointer;text-decoration:underline">${esc(T.pick.title)}</b></p>` : ''}${T.nep ? '<p class="note">♆ Neptuno, o planeta dos ecrãs e da fantasia, está retrógrado: ótimo para rever séries antigas.</p>' : ''}</div>`; }
function epInfo(x) { if (x.kind === 'filme') return ''; const n = (x.eplog || []).length, td = (x.eplog || []).filter(d => d === todayStr()).length; return `${x.season ? `T${x.season}` : ''}${x.ep ? ` · E${x.ep}` : ''}${n ? ` · ${n} episódio${n > 1 ? 's' : ''} registado${n > 1 ? 's' : ''}` : ''}${td >= 3 ? ` · 🍿 maratona: ${td} hoje!` : ''}`; }

// ===== Coleções: "Já tenho isto?" =====
function colCard(x) { return `<div class="iit" data-cid="${x.id}">${x.cover ? `<img src="${esc(x.cover)}" alt="" loading="lazy">` : '<span class="ph0">🧱</span>'}<div><b>${esc(x.title)}</b><small>${esc(x.by || '')}${x.ref ? ' · nº ' + esc(x.ref) : ''} · ${INT.colecoes.verb[x.status]}</small>${x.status === 2 || x.status === 3 ? `<small>📍 ${esc(placeTxt(x, 'colecoes'))}</small>` : ''}</div></div>`; }
function bindCollections() {
  const res = $('#colRes'); if (!res) return;
  const bindRes = () => res.querySelectorAll('[data-cid]').forEach(el => el.onclick = () => openItem('colecoes', el.dataset.cid, false));
  const find = q => { const n = nrm(q).trim(); if (!n) return []; const dg = q.replace(/\D/g, ''); return intList('colecoes').filter(x => (dg.length >= 6 && (x.isbn || '').replace(/\D/g, '') === dg) || nrm(x.title).includes(n) || nrm(x.by || '').includes(n) || (x.ref && nrm(x.ref) === n) || (x.ref && dg && x.ref.replace(/\D/g, '') === dg)); };
  const showQ = () => { const q = $('#colQ').value; ST.colQ = q; const R = find(q).slice(0, 30); res.innerHTML = q.trim() ? (R.length ? `<p class="hint" style="text-align:left">Encontrei ${R.length}:</p><div class="ilist">${R.map(colCard).join('')}</div>` : '<p class="hint">Não tens nada com esse nome.</p>') : ''; bindRes(); };
  $('#colQ').oninput = showQ; if (ST.colQ) showQ();
  $('#colScan').onclick = async () => {
    let code; try { code = await scanBarcode(); } catch (e) { toast('Sem acesso à câmara'); return; } if (!code) return; code = String(code).replace(/\D/g, '');
    const R = intList('colecoes').filter(x => (x.isbn || '').replace(/\D/g, '') === code), own = R.filter(x => x.status === 2 || x.status === 3);
    if (own.length) { res.innerHTML = `<div class="colhit yes"><b>✅ Já tens isto!</b><p>Não compres repetido 😉</p></div><div class="ilist">${own.map(colCard).join('')}</div>`; try { navigator.vibrate && navigator.vibrate([60, 40, 60]); } catch (e) { } }
    else if (R.length) res.innerHTML = `<div class="colhit want"><b>💛 Está na tua lista de desejos</b><p>Ainda não o tens: é desta?</p></div><div class="ilist">${R.map(colCard).join('')}</div>`;
    else { res.innerHTML = `<div class="colhit no"><b>🆕 Ainda não tens isto</b><p>Código ${esc(code)}</p><div class="addrow"><button class="btn main" id="colAddOwn">Comprei: juntar à coleção</button><button class="btn" id="colAddWant">Quero (lista de desejos)</button></div></div>`; $('#colAddOwn').onclick = () => openItem('colecoes', null, true, { isbn: code, status: 2 }); $('#colAddWant').onclick = () => openItem('colecoes', null, true, { isbn: code, status: 0 }); }
    bindRes();
  };
}
