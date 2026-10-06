// Gera ferramentas.svg: ícone monocromático (Simple Icons) + nome em Inter, no par Papel.
// Estático: rodar de novo só se a lista mudar. Uso: node scripts/ferramentas.mjs <pasta-de-saida>
import fs from 'node:fs';
import path from 'node:path';
import * as si from 'simple-icons';
import { texto, largura, PAPEL as P } from './texto.mjs';

const SAIDA = process.argv[2] || 'saida';

// Marcas fora do Simple Icons (Adobe, Affinity, Microsoft pediram remoção): monograma próprio
const mono = (letras) => (x, y, s, cor) =>
  `<rect x="${x + 0.75}" y="${y + 0.75}" width="${s - 1.5}" height="${s - 1.5}" fill="none" stroke="${cor}" stroke-width="1.5"/>` +
  texto(letras, x + s / 2, y + s * 0.68, { tam: s * 0.46, peso: 600, cor, ancora: 'middle' });
const janelas = (x, y, s, cor) => {
  const g = s * 0.08, q = (s - g) / 2;
  return [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => `<rect x="${x + i * (q + g)}" y="${y + j * (q + g)}" width="${q}" height="${q}" fill="${cor}"/>`).join('');
};
const simple = (icone) => (x, y, s, cor) =>
  `<path fill="${cor}" transform="translate(${x} ${y}) scale(${s / 24})" d="${icone.path}"/>`;

const GRUPOS = [
  ['design', [['figma', simple(si.siFigma)], ['adobe photoshop', mono('Ps')], ['adobe after effects', mono('Ae')], ['affinity designer', mono('Ad')]]],
  ['build', [['claude code', simple(si.siClaude)], ['github', simple(si.siGithub)], ['supabase', simple(si.siSupabase)], ['cloudflare', simple(si.siCloudflare)], ['wordpress', simple(si.siWordpress)], ['elementor', simple(si.siElementor)]]],
  ['write', [['obsidian', simple(si.siObsidian)], ['markdown', simple(si.siMarkdown)], ['ghostty', simple(si.siGhostty)], ['keyboard maestro', mono('Km')]]],
  ['organize', [['todoist', simple(si.siTodoist)], ['asana', simple(si.siAsana)], ['trello', simple(si.siTrello)], ['miro', simple(si.siMiro)]]],
  ['systems', [['macos', simple(si.siApple)], ['windows', janelas]]],
];
const TODAS = GRUPOS.flatMap(([, f]) => f);

const L = 880, M = 56;
const fio = (x1, y1, x2, y2, cor = P.fio) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${cor}" stroke-width="1" shape-rendering="crispEdges"/>`;
const svg = (A, partes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-label="tools: ${TODAS.map(([n]) => n).join(', ')}">\n<rect width="${L}" height="${A}" fill="${P.tinta}"/>\n${partes.join('\n')}\n</svg>\n`;

// Colunas por grupo (F2): rótulo em secundário sobre fio, ícone e nome abaixo
function colunas() {
  // Largura de cada coluna pelo conteúdo; a sobra vira respiro igual entre colunas
  const conteudo = GRUPOS.map(([, itens]) => 28 + Math.max(...itens.map(([n]) => largura(n, 13, 500))));
  const respiro = (L - 2 * M - conteudo.reduce((a, b) => a + b, 0)) / (GRUPOS.length - 1);
  const y0 = 48, p = [];
  let max = 0, x = M;
  GRUPOS.forEach(([grupo, itens], g) => {
    if (g) x += conteudo[g - 1] + respiro;
    p.push(texto(grupo, x, y0, { tam: 13, peso: 500, cor: P.secundario, espaco: 0.4 }));
    p.push(fio(x, y0 + 16, x + conteudo[g], y0 + 16));
    itens.forEach(([nome, desenha], i) => {
      const y = y0 + 40 + i * 40;
      p.push(desenha(x, y, 18, P.papel));
      p.push(texto(nome, x + 28, y + 14, { tam: 13, peso: 500, cor: P.papel }));
      max = Math.max(max, y + 18);
    });
  });
  return svg(max + 48, p);
}

fs.mkdirSync(SAIDA, { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'ferramentas.svg'), colunas());
