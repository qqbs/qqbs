// Converte texto em contorno (path) com a Inter, para o SVG não depender de fonte no navegador.
import opentype from 'opentype.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const carregar = (peso) =>
  opentype.loadSync(require.resolve(`@fontsource/inter/files/inter-latin-${peso}-normal.woff`));
const FONTES = { 400: carregar(400), 500: carregar(500) };

export const COR = { fundo: '#202020', texto: '#f2f2f2', apagado: '#8c8c8c', grade: '#2c2c2c' };

// ancora: 'start' | 'middle' | 'end'; espaco: tracking em px
export function texto(str, x, y, { tam = 13, peso = 400, cor = COR.apagado, ancora = 'start', espaco = 0 } = {}) {
  const fonte = FONTES[peso];
  const opcoes = { letterSpacing: espaco / tam };
  const largura = fonte.getAdvanceWidth(str, tam, opcoes);
  const x0 = ancora === 'middle' ? x - largura / 2 : ancora === 'end' ? x - largura : x;
  const d = fonte.getPath(str, x0, y, tam, opcoes).toPathData(2);
  return `<path fill="${cor}" d="${d}"/>`;
}
