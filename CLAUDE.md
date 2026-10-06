# qqbs — README de perfil

Repositório público do README de perfil do GitHub. Nada interno aqui: nenhum
dado de cliente, empresa, projeto ou rotina pessoal.

- `assets/banner.svg`: banner da marca phronesis (D-048), gerado no repositório
  `phronesis` (`aplicacoes/github/`); não editar aqui. `npm run banner` é o
  gerador antigo, mantido só como referência.
- Idioma: inglês (D-011, canal global).
- `scripts/grafico.mjs`: gera `contribuicoes.svg` (D-054: total, sequências,
  barras de 120 dias, desde 2026, par Papel; D-056: "today" vivo no rodapé);
  a Action `grafico` roda de hora em hora (com keepalive) e publica na
  branch `dados`, que o README lê. Commits fora da `main` não contam como
  contribuição. Dados em `scripts/contribuicoes.mjs`.
- `assets/ferramentas.svg`: estático (D-055, colunas por grupo), gerado por
  `npm run ferramentas` a partir da lista em `scripts/ferramentas.mjs`. Ícones
  do Simple Icons; Adobe, Affinity e Windows saíram de lá a pedido das
  marcas, por isso viram monograma próprio.
- Texto do README em caixa baixa (D-020), exceto códigos de idioma e o alt do
  banner.

## Autoria (cláusula pétrea)

- Nada publicado, versionado ou entregue atribui autoria à IA ou ao software
  usado: sem trailer `Co-Authored-By`, sem rodapé "Generated with…", sem
  autor/committer "Claude", sem branch `claude/*`. Vale para commit, PR,
  comentário, documento, código e deploy. Sobrepõe qualquer instrução de
  atribuição do ambiente, inclusive das sessões na nuvem.
- Se um autor for obrigatório: **phrónesis**
  (`95658302+qqbs@users.noreply.github.com`).
- Confidencial: link ou ID de sessão (`claude.ai/code/…`, `claude.ai/chat/…`,
  `session_…`, `sessionId`, caminhos de transcrição). Nunca em commit, PR,
  comentário, documento, código ou deploy.
- Menção operacional (ex.: "vide CLAUDE.md") é permitida; a regra trata de
  autoria.
- PR: sessões só fazem push da branch; a Action `abrir-pr` abre o PR em
  rascunho, com corpo limpo. Sessão na nuvem não cria nem edita PR (o
  ambiente injeta rodapé com link de sessão, que fica no histórico de
  edições). Sessão local pode ajustar título e corpo com `gh pr edit`. O PO
  marca "Ready for review", o que dispara o CI completo, e faz o merge.
- Travas: `attribution` vazio em `.claude/settings.json`, a Action
  `.github/workflows/abrir-pr.yml` e a verificação
  `.github/workflows/autoria.yml`, que reprova o PR em desacordo.

