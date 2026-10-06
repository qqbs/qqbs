// Gera contribuicoes.svg: total, sequência atual e recorde, com as barras diárias
// dos últimos 120 dias (sequência atual em papel). Uso: node scripts/grafico.mjs <pasta-de-saida>
import fs from 'node:fs';
import path from 'node:path';
import { texto, largura, PAPEL as P } from './texto.mjs';
import { historico, resumo, FUSO } from './contribuicoes.mjs';

const SAIDA = process.argv[2] || 'saida';
const dias = await historico();
const r = resumo(dias);
const L = 880, M = 56, N = 120;
const MESES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const curta = (d) => `${Number(d.slice(8))} ${MESES[Number(d.slice(5, 7)) - 1]}`;
const dias_ = (n) => `${n} ${n === 1 ? 'day' : 'days'}`;
const agora = new Intl.DateTimeFormat('en-GB', { timeZone: FUSO, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  .format(new Date()).toLowerCase().replace(',', ' ·');

const p = [];

// Números: rótulo, valor em 54 (escala D-023), período
const TAM = 54, y0 = 56, col = (L - 2 * M) / 3;
const itens = [
  ['total contributions', r.total.toLocaleString('en-US'), `since ${MESES[Number(r.desde.slice(5, 7)) - 1]} ${r.desde.slice(0, 4)}`],
  ['current streak', dias_(r.atual.n), r.atual.n ? `${curta(r.atual.inicio)} – today` : 'starts with the next contribution'],
  ['longest streak', dias_(r.recorde.n), r.recorde.n ? `${curta(r.recorde.inicio)} – ${curta(r.recorde.fim)}` : '—'],
];
itens.forEach(([rot, val, sub], i) => {
  const x = M + i * col;
  if (i) p.push(`<line x1="${x - 24}" x2="${x - 24}" y1="${y0}" y2="${y0 + TAM + 60}" stroke="${P.fio}"/>`);
  p.push(texto(rot, x, y0 + 11, { tam: 11, peso: 500, cor: P.secundario, espaco: 0.4 }));
  p.push(texto(val, x, y0 + 24 + TAM * 0.86, { tam: TAM, peso: 600, cor: P.papel, espaco: -TAM * 0.03 }));
  p.push(texto(sub, x, y0 + TAM + 54, { tam: 11, cor: P.secundario }));
});

// Barras
const ult = dias.slice(-N);
const yb = 224, ph = 120, base = yb + ph, A = base + 92;
const max = Math.max(1, ...ult.map((d) => d.n));
const passo = (L - 2 * M) / ult.length, lb = passo * 0.6;
p.push(texto(`last ${ult.length} days · current streak in light`, M, yb - 10, { tam: 11, cor: P.secundario }));
p.push(texto(`peak ${max}/day`, L - M, yb - 10, { tam: 11, cor: P.secundario, ancora: 'end' }));
p.push(`<line x1="${M}" x2="${L - M}" y1="${base + 0.5}" y2="${base + 0.5}" stroke="${P.fio}"/>`);
ult.forEach((d, i) => {
  if (!d.n) return;
  const h = Math.max(1, (d.n / max) * ph), x = M + i * passo;
  const acesa = r.atual.n && d.data >= r.atual.inicio;
  const viva = i === ult.length - 1 ? ' class="pulso"' : '';
  p.push(`<rect${viva} x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${lb.toFixed(1)}" height="${h.toFixed(1)}" fill="${acesa ? P.papel : P.secundario}"/>`);
});
// Today: contagem do dia, ao vivo (a Action roda de hora em hora)
const hoje = ult.at(-1).n;
const ponto = (cx, cy) => `<circle class="pulso" cx="${cx}" cy="${cy}" r="3" fill="${P.papel}"/>`;
// rodapé: ponto vivo e a contagem do dia, à direita do last updated (D-056)
const t = `${hoje} ${hoje === 1 ? 'contribution' : 'contributions'} today`;
p.push(ponto(L - M - largura(t, 11, 500) - 12, A - 32));
p.push(texto(t, L - M, A - 28, { tam: 11, peso: 500, cor: P.papel, ancora: 'end' }));
p.push(texto(curta(ult[0].data), M, base + 22, { tam: 11, cor: P.secundario }));
p.push(texto('today', L - M, base + 22, { tam: 11, cor: P.secundario, ancora: 'end' }));
p.push(texto(`last updated ${agora} brt`, M, A - 28, { tam: 11, cor: P.secundario }));

const rotulo = `${r.total.toLocaleString('en-US')} contributions since ${r.desde.slice(0, 4)}; current streak ${dias_(r.atual.n)}; longest ${dias_(r.recorde.n)}.`;
const estilo = '<style>.pulso{animation:p 2s cubic-bezier(.65,0,.35,1) infinite}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}</style>';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-label="${rotulo}">\n${estilo}\n<rect width="${L}" height="${A}" fill="${P.tinta}"/>\n${p.join('\n')}\n</svg>\n`;
fs.mkdirSync(SAIDA, { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'contribuicoes.svg'), svg);
console.log(rotulo);
