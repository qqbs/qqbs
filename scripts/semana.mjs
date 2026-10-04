// Gera semana.svg: contribuições por dia da semana corrente contra a média esperada
// (média diária das 12 semanas anteriores). Uso: node scripts/semana.mjs <pasta-de-saida>
import fs from 'node:fs';
import path from 'node:path';
import { texto, COR } from './texto.mjs';

const LOGIN = process.env.LOGIN || 'qqbs';
const TOKEN = process.env.GH_TOKEN;
const SAIDA = process.argv[2] || 'saida';
const FUSO = 'America/Sao_Paulo';
const SEMANAS_HISTORICO = 12;

const DIA = 86400000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());
const tHoje = Date.parse(hoje + 'T00:00:00Z');
const segunda = tHoje - ((new Date(tHoje).getUTCDay() + 6) % 7) * DIA;
const inicio = segunda - SEMANAS_HISTORICO * 7 * DIA;
const domingo = segunda + 6 * DIA;

async function contribuicoes() {
  if (!TOKEN) throw new Error('Defina GH_TOKEN.');
  const query = `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){
    contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: LOGIN, from: iso(inicio) + 'T00:00:00Z', to: iso(domingo) + 'T23:59:59Z' } }),
  });
  const j = await r.json();
  if (j.errors || !j.data?.user) throw new Error(JSON.stringify(j.errors || j));
  const mapa = new Map();
  for (const s of j.data.user.contributionsCollection.contributionCalendar.weeks)
    for (const d of s.contributionDays) mapa.set(d.date, d.contributionCount);
  return mapa;
}

const mapa = await contribuicoes();
let somaHist = 0;
for (let t = inicio; t < segunda; t += DIA) somaHist += mapa.get(iso(t)) ?? 0;
const esperada = somaHist / (SEMANAS_HISTORICO * 7);
const dias = Array.from({ length: 7 }, (_, i) => {
  const t = segunda + i * DIA;
  return t > tHoje ? null : (mapa.get(iso(t)) ?? 0);
});

const passados = dias.filter((v) => v !== null);
const total = passados.reduce((a, b) => a + b, 0);
const esperadoAteHoje = Math.round(esperada * passados.length);
const pico = dias.indexOf(Math.max(...passados));
const NOMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const virgula = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const plural = (n) => `${n} ${n === 1 ? 'contribution' : 'contributions'}`;

let frase;
if (total === 0) frase = `No contributions this week so far; the expected average is ${virgula(esperada)} a day.`;
else if (esperadoAteHoje === 0) frase = `${plural(total)} this week, no recent history to compare yet, peaking on ${NOMES[pico]}.`;
else {
  const p = Math.round(((total - esperadoAteHoje) / esperadoAteHoje) * 100);
  const comparacao = p === 0 ? 'in line with the expected average' : `${Math.abs(p)}% ${p > 0 ? 'above' : 'below'} the expected average`;
  frase = `${plural(total)} this week, ${comparacao}, peaking on ${NOMES[pico]}.`;
}

const MESES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dSeg = new Date(segunda), dDom = new Date(domingo);
const rotulo = dSeg.getUTCMonth() === dDom.getUTCMonth()
  ? `${dSeg.getUTCDate()} – ${dDom.getUTCDate()} ${MESES[dDom.getUTCMonth()]} ${dDom.getUTCFullYear()}`
  : `${dSeg.getUTCDate()} ${MESES[dSeg.getUTCMonth()]} – ${dDom.getUTCDate()} ${MESES[dDom.getUTCMonth()]} ${dDom.getUTCFullYear()}`;

// Desenho
const L = 880, A = 340, E = 56, D = 40, T = 108, B = 48, ph = A - T - B, pw = L - E - D;
const max = Math.max(10, Math.ceil(Math.max(...passados, esperada) / 2) * 2);
const y = (v) => T + ph - (v / max) * ph;
const partes = [`<rect width="${L}" height="${A}" fill="${COR.fundo}"/>`];
partes.push(texto(frase, E, 40, { tam: 15, cor: COR.texto }));
partes.push(texto(rotulo, E, 76, { tam: 13, peso: 500, cor: COR.texto }));
partes.push(texto(`- - -  expected average ${virgula(esperada)}/day`, L - D, 76, { tam: 12, ancora: 'end' }));
for (const v of [0, max / 2, max]) {
  partes.push(`<line x1="${E}" x2="${L - D}" y1="${y(v)}" y2="${y(v)}" stroke="${COR.grade}"/>`);
  partes.push(texto(String(v), E - 10, y(v) + 4, { tam: 12, ancora: 'end' }));
}
const SIGLAS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const bw = pw / 7;
dias.forEach((v, i) => {
  const x = E + i * bw + bw * 0.28, lb = bw * 0.44, cx = x + lb / 2;
  if (v !== null) {
    partes.push(`<rect x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${lb.toFixed(1)}" height="${(y(0) - y(v)).toFixed(1)}" rx="2" fill="${v >= esperada ? COR.texto : COR.apagado}"/>`);
    partes.push(texto(String(v), cx, y(v) - 6, { tam: 12, cor: COR.texto, ancora: 'middle' }));
  }
  partes.push(texto(SIGLAS[i], cx, A - B + 20, { tam: 12, ancora: 'middle', cor: v === null ? COR.grade : COR.apagado }));
});
partes.push(`<line x1="${E}" x2="${L - D}" y1="${y(esperada).toFixed(1)}" y2="${y(esperada).toFixed(1)}" stroke="${COR.texto}" stroke-dasharray="4 4"/>`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-label="${frase}">\n${partes.join('\n')}\n</svg>\n`;
fs.mkdirSync(SAIDA, { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'semana.svg'), svg);
console.log(frase);
