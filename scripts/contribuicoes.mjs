// Histórico de contribuições (calendário diário) a partir de DESDE, quando a atividade passou a ser recorrente.
const LOGIN = process.env.LOGIN || 'qqbs';
export const DESDE = '2026-01-01';
export const FUSO = 'America/Sao_Paulo';
export const DIA = 86400000;
export const iso = (t) => new Date(t).toISOString().slice(0, 10);
export const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());

async function gql(query, variables) {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('Defina GH_TOKEN.');
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors || !j.data?.user) throw new Error(JSON.stringify(j.errors || j));
  return j.data.user;
}

// Devolve [{ data: 'AAAA-MM-DD', n }] em ordem, de DESDE até hoje.
export async function historico() {
  const fim = hoje();
  const dias = [];
  for (let ano = Number(DESDE.slice(0, 4)); ano <= Number(fim.slice(0, 4)); ano++) {
    const u = await gql(
      `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){
        contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`,
      { login: LOGIN, from: `${ano}-01-01T00:00:00Z`, to: `${ano}-12-31T23:59:59Z` },
    );
    for (const s of u.contributionsCollection.contributionCalendar.weeks)
      for (const d of s.contributionDays) if (d.date >= DESDE && d.date <= fim) dias.push({ data: d.date, n: d.contributionCount });
  }
  return dias;
}

// Total, sequência atual (hoje sem contribuição não quebra) e recorde.
export function resumo(dias) {
  const total = dias.reduce((a, d) => a + d.n, 0);
  let recorde = { n: 0 }, corrida = { n: 0 };
  for (const d of dias) {
    if (d.n > 0) corrida = corrida.n ? { ...corrida, n: corrida.n + 1, fim: d.data } : { n: 1, inicio: d.data, fim: d.data };
    else corrida = { n: 0 };
    if (corrida.n > recorde.n) recorde = { ...corrida };
  }
  let i = dias.length - 1;
  if (dias[i]?.n === 0) i--;
  const atual = { n: 0, fim: dias[i]?.data };
  while (i >= 0 && dias[i].n > 0) { atual.n++; atual.inicio = dias[i].data; i--; }
  const porAno = {};
  for (const d of dias) porAno[d.data.slice(0, 4)] = (porAno[d.data.slice(0, 4)] ?? 0) + d.n;
  return { total, atual, recorde, porAno, desde: dias[0]?.data };
}
