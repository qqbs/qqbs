// Gera assets/banner.svg (estático; rodar de novo só se o texto mudar).
import fs from 'node:fs';
import { texto, COR } from './texto.mjs';

const L = 880, A = 400, M = 40;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-label="phronesis">
<rect width="${L}" height="${A}" fill="${COR.fundo}"/>
${texto('qqbs  •  phronesis', M, 48)}
${texto('pt-BR  ·  en-US  ·  ko-KR', L - M, 48, { ancora: 'end' })}
${texto('phronesis', L / 2, 218, { tam: 64, peso: 500, cor: COR.texto, ancora: 'middle', espaco: -2 })}
${texto('projeto pessoal', M, 362)}
${texto('digitando desde 2011', L - M, 362, { ancora: 'end' })}
</svg>
`;
fs.writeFileSync('assets/banner.svg', svg);
console.log('assets/banner.svg', svg.length, 'bytes');
