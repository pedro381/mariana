# Análise de Perfil Comportamental

Plataforma web estática de autoconhecimento comportamental baseada no modelo
**Big Five (Five-Factor Model)**, aplicando o inventário **IPIP-NEO-120** de
John A. Johnson em português do Brasil.

A pessoa entra no site, se identifica, aceita os termos, responde 120
afirmações — uma por vez, com progresso salvo automaticamente — e recebe um
relatório completo com as cinco dimensões, as trinta facetas e uma leitura
aplicada ao dia a dia, exibido na tela e enviado por e-mail.

---

## Índice

- [Objetivo](#objetivo)
- [Como executar](#como-executar)
- [Arquitetura](#arquitetura)
- [Metodologia](#metodologia)
- [Origem das perguntas](#origem-das-perguntas)
- [Scoring](#scoring)
- [Índices, faixas e a ausência de percentis](#índices-faixas-e-a-ausência-de-percentis)
- [Relatório](#relatório)
- [Armazenamento e recuperação](#armazenamento-e-recuperação)
- [Privacidade](#privacidade)
- [Envio de e-mail](#envio-de-e-mail)
- [Validação](#validação)
- [Acessibilidade](#acessibilidade)
- [Publicação](#publicação)
- [Limitações conhecidas](#limitações-conhecidas)
- [Referências e fundamentação](#referências-e-fundamentação)
- [Licenças](#licenças)

---

## Objetivo

Oferecer uma avaliação de perfil comportamental com fundamentação científica
real, experiência de uso simples no celular e total transparência sobre o que é
medido, o que é calculado e o que é interpretação.

O produto se apresenta como **Análise de Perfil Comportamental**. Não é, e em
nenhum lugar se apresenta como, diagnóstico psicológico, laudo psicológico ou
avaliação clínica.

---

## Como executar

O site é **100% estático**. Não há build, não há `npm install`, não há backend
para o questionário, não há banco de dados.

A aplicação usa **ES Modules**, que o navegador só carrega via HTTP — abrir os
arquivos com duplo clique (`file://`) não funciona. Para rodar localmente,
sirva a pasta com qualquer servidor estático:

```bash
python -m http.server 4599
```

Depois abra `http://localhost:4599/`. Qualquer outro servidor estático serve
(`npx serve`, extensão Live Server do VS Code, IIS, nginx). O Node é
conveniência de desenvolvimento — não é requisito de execução.

Em `localhost` (ou com `?dev=1` na URL) o modo de desenvolvimento fica ativo e
as verificações de integridade do banco de itens rodam no console.

---

## Arquitetura

```
source/
├── index.html               Apresentação, identificação, consentimento, retomada
├── avaliacao.html           Questionário (uma pergunta por vez)
├── resultado.html           Relatório completo
├── privacidade.html         Política de privacidade
├── testes.html              Verificações de integridade (ferramenta de dev)
│
├── assets/
│   ├── css/
│   │   ├── variables.css    Tokens de design (cores, tipografia, espaçamento)
│   │   ├── base.css         Reset, tipografia base, layout
│   │   ├── components.css   Botões, campos, cartões, avisos, barras
│   │   ├── landing.css      Página inicial
│   │   ├── assessment.css   Questionário
│   │   ├── report.css       Relatório
│   │   ├── responsive.css   Ajustes por largura (carregado por último)
│   │   └── print.css        Impressão / salvar em PDF
│   │
│   └── js/
│       ├── config.js                    Configuração central (marca, e-mail, storage)
│       ├── app.js                       Controlador da página inicial
│       │
│       ├── data/
│       │   ├── questions.js             As 120 questões (id, domínio, faceta, keyed)
│       │   └── domains.js               Metadados dos 5 domínios e 30 facetas
│       │
│       ├── assessment/
│       │   ├── assessment.js            Controlador do questionário
│       │   ├── navigation.js            Regras de navegação (lógica pura)
│       │   └── scale.js                 Escala de resposta de cinco níveis
│       │
│       ├── scoring/
│       │   ├── scoring-engine.js        Motor genérico (sem DOM, sem Big Five)
│       │   ├── big-five.js              Camada Big Five sobre o motor
│       │   └── classifications.js       Escala, índices e faixas de classificação
│       │
│       ├── report/
│       │   ├── report-generator.js      Monta a estrutura do relatório
│       │   ├── interpretations.js       Textos por dimensão e por faceta
│       │   ├── highlights.js            Pontos fortes e de atenção por faceta
│       │   ├── combinations.js          Regras de interpretação combinada
│       │   ├── charts.js                Radar e barras em SVG puro
│       │   ├── report-view.js           Desenho do relatório na tela
│       │   └── email-template.js        HTML dos e-mails
│       │
│       ├── storage/storage.js           Persistência local (único ponto de acesso)
│       ├── email/email.js               Envio (sem credenciais no navegador)
│       ├── utils/                       formatters, validators, theme
│       └── dev/self-test.js             Verificações de integridade
│
├── servidor/
│   └── enviar-relatorio.js  Função serverless de referência (não roda no site)
│
└── references/              Projetos estudados — NÃO fazem parte da execução
```

### Separação de responsabilidades

Perguntas, scoring, relatório, storage, DOM e e-mail vivem em camadas
separadas. O scoring não conhece a interface:

```js
import { calculateBigFive } from './assets/js/scoring/big-five.js';
const resultado = calculateBigFive(respostas);   // nenhum elemento HTML envolvido
```

O motor de scoring (`scoring-engine.js`) é genérico: recebe um banco de itens e
um mapa de respostas e devolve agregados por domínio e faceta. Ele não sabe o
que é Big Five — essa camada está em `big-five.js`. Um instrumento futuro
(HEXACO, DISC, SJT, 360°) pode ser plugado sobre o mesmo motor sem reescrever a
aplicação.

---

## Metodologia

**Modelo:** Big Five / Five-Factor Model, com os cinco fatores:

| Sigla | Dimensão medida | Como aparece na interface |
|-------|-----------------|---------------------------|
| O | Openness | Abertura à Experiência |
| C | Conscientiousness | Conscienciosidade |
| E | Extraversion | Extroversão |
| A | Agreeableness | Amabilidade |
| N | Neuroticism | **Estabilidade Emocional** (eixo invertido) |

**Instrumento:** IPIP-NEO-120 (Johnson, 2014), a versão curta do IPIP-NEO
derivada do NEO-PI-R. São 120 itens: 5 domínios × 6 facetas × 4 itens.

### Sobre a apresentação do domínio N

O traço medido é o Neuroticismo. Na interface ele é apresentado pelo polo
oposto — Estabilidade Emocional — por ser mais compreensível e menos
estigmatizante para o público brasileiro:

```
índice de Estabilidade Emocional = 100 − índice de Neuroticismo
```

Nenhuma informação se perde: o resultado guarda `measuredIndex` (neuroticismo)
e `index` (estabilidade), a relação entre os dois é explicada no próprio
relatório, e as **facetas de N permanecem na direção medida** (Ansiedade,
Irritabilidade, Desânimo, Timidez Social, Impulsividade, Vulnerabilidade), com
aviso explícito na tela.

---

## Origem das perguntas

Os itens do **International Personality Item Pool (IPIP)** são de domínio
público, mantidos pelo Oregon Research Institute (<https://ipip.ori.org/>).

A tradução para português do Brasil veio do projeto `ipip-neo-120`
(MIT, Copyright © 2017 Geir Gåsodden), arquivo `data/pt-br/questions.json`.
Foram preservados exatamente:

- o identificador (`id`) de cada item;
- o domínio (`domain`);
- a faceta (`facet`);
- a direção (`keyed`: `plus` ou `minus`);
- a ordem canônica de aplicação (1 a 120).

### Revisão editorial da tradução

Os textos em português passaram por revisão nesta implementação. Três itens
tinham **tradução incorreta na fonte**, o que comprometeria a medida — os dois
últimos são itens invertidos, então o erro afetaria o escore na direção oposta:

| Item | Original em inglês | Tradução na fonte | Texto corrigido |
|------|--------------------|-------------------|-----------------|
| 47 (E4) | Am always on the go | "Estou sempre preparado(a)" (duplicava o item 25) | "Estou sempre em movimento" |
| 60 (C6, invertido) | Make rash decisions | "Tomo decisões difíceis" | "Tomo decisões precipitadas" |
| 109 (A4, invertido) | Get back at others | "Entro em contato com os outros" | "Revido quando me sinto prejudicado(a)" |

Outros enunciados foram ajustados para português mais natural e para evitar
vocabulário clínico (por exemplo, "Estou sempre deprimido(a)" tornou-se
"Frequentemente fico desanimado(a)"). As alterações estão documentadas no
cabeçalho de `assets/js/data/questions.js`.

### Escala

Cinco níveis, com âncoras de concordância e ponto neutro central:

```
1 — Discordo totalmente
2 — Discordo parcialmente
3 — Nem concordo, nem discordo
4 — Concordo parcialmente
5 — Concordo totalmente
```

O IPIP-NEO original usa âncoras de acurácia ("Very Inaccurate" a "Very
Accurate"). A tradução pt-br da fonte adota âncoras de concordância, que esta
implementação preserva — mantendo a semântica de autodescrição no enunciado da
tela: *"O quanto esta frase descreve você?"*.

---

## Scoring

Reimplementado em JavaScript puro a partir do método usado pelas referências.
Nenhum pacote Node é importado pelo site.

### Itens invertidos

Cada item tem uma direção. Itens `minus` são espelhados na escala antes da soma:

```
1 → 5    2 → 4    3 → 3    4 → 2    5 → 1
```

Formalmente: `pontuação = (mínimo + máximo) − resposta`, ou seja `6 − resposta`.

Na fonte (`ipip-neo-120`) a inversão está embutida nas opções de resposta:
`choices.minus` já entrega 5 para "Discordo totalmente". Aqui a decisão foi
diferente e deliberada: **a resposta bruta é preservada no estado** (1 a 5, na
ordem que a pessoa vê) e a inversão acontece no cálculo. Isso é o que permite
reexibir corretamente a escolha original quando a pessoa volta em uma pergunta.

Dos 120 itens, 65 são diretos e 55 invertidos.

### Fluxo do cálculo

```
Pergunta → Resposta bruta (1–5) → Score corrigido (keyed) → Faceta → Domínio → Perfil
```

Para cada faceta (4 itens) e cada domínio (24 itens) são calculados:

| Medida | Como | Faixa |
|--------|------|-------|
| **Score bruto** | soma dos scores corrigidos | faceta 4–20 · domínio 24–120 |
| **Média** | score bruto ÷ nº de itens | 1 a 5 |
| **Índice** | `(média − 1) ÷ 4 × 100` | 0 a 100 |
| **Classificação** | faixa em que o índice cai | ver abaixo |

### Determinismo

O cálculo e o relatório são inteiramente determinísticos: as mesmas respostas
produzem sempre exatamente o mesmo resultado e exatamente os mesmos textos.
Não há aleatoriedade, não há dependência de data e **não há IA externa** — as
interpretações vêm de regras declarativas legíveis em `combinations.js`.

---

## Índices, faixas e a ausência de percentis

Esta é uma decisão de projeto importante e deliberada.

**O índice de 0 a 100 não é percentil.** Ele é apenas a média das próprias
respostas reposicionada linearmente numa escala de 0 a 100. Não compara a
pessoa com ninguém.

Um percentil exigiria uma população normativa validada para o público avaliado.
As normas do IPIP-NEO disponíveis publicamente (usadas, por exemplo, pelo
projeto `five-factor-e`) derivam de amostra majoritariamente norte-americana e
não foram validadas para a população brasileira. Por isso a plataforma **não
calcula nem exibe percentis**, e o relatório diz isso explicitamente.

Os quatro conceitos são mantidos separados em todo o sistema:

| Conceito | O que é | Existe nesta versão? |
|----------|---------|----------------------|
| **Score** | dado medido: soma dos itens | sim |
| **Índice** | dado calculado: transformação da escala | sim |
| **Classificação** | faixa textual do índice | sim |
| **Percentil** | posição relativa a uma população | **não** |

### Faixas de classificação

Centralizadas em `assets/js/scoring/classifications.js`, sem limites escondidos
no código de interface:

| Faixa | Índice |
|-------|--------|
| Baixo | 0 – 29,9 |
| Moderadamente baixo | 30 – 44,9 |
| Intermediário | 45 – 55,9 |
| Moderadamente alto | 56 – 70,9 |
| Alto | 71 – 100 |

Há ainda um limiar separado de **saliência** (15 pontos de distância do centro),
usado apenas para decidir quais pontos fortes e pontos de atenção têm evidência
suficiente para entrar no relatório. Resultados próximos do centro não geram
afirmação.

---

## Relatório

Estrutura entregue na tela e (em versão resumida) por e-mail:

1. **Visão geral** — resumo do perfil e leitura combinada das dimensões
2. **Gráfico radar** das cinco dimensões + barras com índice e classificação
3. **Cinco seções de dimensão** — score bruto, média, índice, classificação,
   significado, onde ajuda, onde pede atenção, situações em que aparece
4. **Trinta facetas** — nome, índice, classificação e interpretação, em blocos
   expansíveis dentro de cada dimensão
5. **Potenciais pontos fortes** (3 a 6, cada um com a faceta de origem)
6. **Pontos de atenção** (até 5, em linguagem construtiva)
7. **No ambiente profissional**
8. **Seu estilo de comunicação**
9. **Como você tende a trabalhar em equipe**
10. **Tendências de liderança** — apresentadas como *indicadores comportamentais*,
    nunca como avaliação de capacidade de liderar
11. **Tomada de decisão**
12. **Sugestões de desenvolvimento**
13. **Como este relatório foi construído** + aviso sobre a natureza do resultado

### Linguagem

Todo texto interpretativo usa formulação probabilística — *"seus resultados
sugerem"*, *"você tende a"*, *"é provável que"*, *"em determinados contextos"*.
Nunca *"você é"*, *"você sempre"*, *"você nunca"*.

Nenhum número pseudocientífico é produzido. Não existe "87% líder" nem "92%
comunicador": o relatório separa explicitamente **dado medido**, **dado
calculado**, **interpretação** e **recomendação**.

### Interpretação combinada

As seções temáticas não concatenam textos isolados por dimensão: elas nascem de
regras que olham combinações de dimensões e facetas. Exemplo real:

```js
{
  id: 'ov-exec-criativo',
  priority: 90,
  when: (p) => p.is('C', 'alto') && p.is('O', 'alto'),
  text: 'A combinação entre alta organização e alta abertura sugere...'
}
```

As regras são ordenadas por prioridade (empate resolvido pelo `id`, para manter
o determinismo) e limitadas por seção. Regras marcadas com `fallback: true` só
entram quando nenhuma regra específica se aplicou — garantindo que nenhuma
seção fique vazia sem contradizer afirmações específicas.

---

## Armazenamento e recuperação

Todo acesso a `localStorage` passa por `assets/js/storage/storage.js`. Nenhum
outro módulo toca no armazenamento diretamente.

**Chave:** `perfilComportamental.assessment.v1`

### Modelo do estado

```js
{
  schemaVersion: 1,
  assessmentId: "uuid",
  status: "not_started" | "in_progress" | "completed",
  startedAt, updatedAt, completedAt,
  participant: { name, email, phone, company, role },
  consent:     { accepted, acceptedAt, text },
  progress:    { currentQuestion, totalQuestions },
  answers:     { "<id-da-questão>": 1..5 },
  result:      { ... },   // scores calculados
  report:      { ... },   // relatório pronto
  email:       { status, attempts, lastAttemptAt, lastError, sentAt }
}
```

### Autosave

Não existe botão "Salvar". A gravação acontece a cada:

- resposta escolhida (imediatamente);
- mudança de pergunta;
- alteração de um campo de identificação (ao sair do campo);
- marcação do consentimento;
- conclusão da avaliação;
- mudança de status do envio de e-mail.

Toda escrita atualiza `updatedAt`. Um indicador discreto "salvo" aparece no
cabeçalho a cada gravação.

### Recuperação

Ao abrir a página inicial, se existir avaliação começada e não concluída:

```
Encontramos uma avaliação em andamento
Ana, você respondeu 47 de 120 perguntas. Deseja continuar de onde parou?
[ Continuar avaliação ]  [ Começar novamente ]
```

Nada é apagado automaticamente. "Começar novamente" pede confirmação em
diálogo antes de apagar.

O ponto de retomada é a **primeira pergunta sem resposta válida** — não a
última visitada. Assim, quem pulou uma questão volta exatamente para ela.

`sessionStorage` é usado apenas para conforto de interface; o progresso real
nunca sai do `localStorage`.

---

## Privacidade

- Enquanto a pessoa responde, **nada sai do navegador**. Não há chamada de rede
  durante o questionário.
- São pedidos apenas nome e e-mail (obrigatórios) e telefone, empresa e cargo
  (opcionais). Não se pede CPF, RG, endereço, dados de saúde, religião ou
  orientação política.
- O relatório **não trafega pela URL**. Não há `?name=...&openness=...` — nem
  em query string, nem em hash.
- A página do relatório oferece **"Apagar meus dados deste dispositivo"**, que
  remove tudo do armazenamento local.
- "Refazer avaliação" pede confirmação antes de descartar o resultado anterior.
- Se o navegador bloquear o armazenamento local (janela anônima), a aplicação
  continua funcionando em memória e **avisa** que o progresso não será salvo.

---

## Envio de e-mail

### ⚠️ Problema de segurança encontrado no projeto — leia antes de configurar

O arquivo `assets/js/main.js` do site principal (na raiz do repositório, fora
desta plataforma) contém **a chave de API do Resend em texto claro**, e chama
`https://api.resend.com/emails` diretamente do navegador:

```js
var RESEND = {
  endpoint: 'https://api.resend.com/emails',
  apiKey:   're_...',        // visível para qualquer visitante
  ...
};
```

Isso expõe a chave a qualquer pessoa que abra o código-fonte da página ou o
DevTools, e permite que terceiros enviem e-mail em nome do domínio. Um
comentário no próprio arquivo registra que foi feito a pedido explícito da
responsável, ciente do risco.

**Esta plataforma não reproduz esse padrão** e não reutiliza aquela
implementação. Recomendações:

1. **Revogar a chave exposta** no painel do Resend e emitir uma nova.
2. Migrar também o formulário de contato do site principal para o mesmo
   caminho seguro descrito abaixo.

### Como o envio funciona aqui

O site continua estático. O navegador faz um `POST` para um endpoint
configurável — uma função serverless que guarda a chave do lado do servidor:

```
navegador  ──POST JSON──►  função serverless  ──API key──►  Resend
(sem credencial)            (guarda a chave)
```

Configuração em `assets/js/config.js`:

```js
email: {
  endpoint: '',                        // URL da função serverless
  adminEmail: 'mm.quim@gmail.com',     // cópia administrativa, endereço único
  ...
}
```

Enquanto `endpoint` estiver vazio, **a plataforma continua funcionando
normalmente**: o relatório é calculado, exibido e salvo, e a interface avisa
que o envio automático não está configurado.

A implementação de referência da função está em `servidor/enviar-relatorio.js`,
com instruções de adaptação para Vercel, Netlify e Cloudflare Workers.
Variáveis de ambiente esperadas: `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_EMAIL`,
`ALLOWED_ORIGIN`.

### Payload

```json
{
  "idempotencyKey": "<assessmentId>",
  "assessmentId": "<uuid>",
  "participant": { "name": "...", "email": "...", "phone": "...", "company": "...", "role": "..." },
  "messages": [
    { "role": "participant", "to": "...", "subject": "...", "html": "...", "text": "..." },
    { "role": "admin",       "to": "...", "subject": "...", "html": "...", "replyTo": "..." }
  ]
}
```

O e-mail do participante traz nome, data, resumo do perfil, as cinco dimensões
com índices e classificação, principais pontos fortes e pontos de atenção, além
do aviso sobre a natureza do resultado. O e-mail administrativo traz os dados
de contato, o `assessmentId`, o resumo Big Five, as facetas mais marcantes e o
resumo comportamental — com `reply-to` apontando para o participante.

### Conclusão e envio são independentes

Se o envio falhar, **o relatório não se perde**. O estado guarda `status`,
`attempts`, `lastAttemptAt`, `lastError` e `sentAt`, o relatório continua
disponível na página e um botão **"Tentar enviar novamente"** aparece.

### Idempotência

Cada envio carrega o `assessmentId` como `idempotencyKey`, tanto no corpo
quanto no cabeçalho `Idempotency-Key`. Somado a isso: o botão é desabilitado
durante o envio, há trava em memória contra duplo clique, e um envio já
concluído retorna imediatamente sem repetir a chamada. A função de referência
também mantém memória de idempotência do lado do servidor.

---

## Validação

### Página de verificações

Abra `testes.html` (ou qualquer página em `localhost`, que roda as mesmas
verificações no console). São 27 verificações, cobrindo:

**Banco de itens** — total de 120; identificadores únicos; numeração canônica
1–120; domínio válido em todos; faceta de 1 a 6; direção declarada; nenhum
texto vazio; nenhum texto duplicado; 24 itens por domínio; 4 itens por faceta;
metadados cobrindo as 30 facetas; índice por id consistente.

**Escala e reversão** — item direto preserva a resposta; item invertido espelha
(1→5 … 5→1); respostas fora de 1–5 são rejeitadas; transformação média→índice
(1→0, 3→50, 5→100); faixas de classificação contíguas e cobrindo 0 a 100.

**Agregação** — agrupamento por domínio e por faceta; respostas neutras produzem
índice 50 em tudo; somas e índices coerentes nos extremos; Estabilidade
Emocional confere como inverso exato de Neuroticismo.

**Robustez** — avaliação incompleta é recusada (com a lista do que falta);
resposta fora da escala é recusada; cálculo determinístico; relatório
determinístico; relatório traz todas as seções obrigatórias; **nenhuma seção
fica vazia em nenhum de sete perfis** (uniformes 1 a 5, variado e alternado).

A página mostra ainda a distribuição do banco de itens e uma simulação de
perfis conhecidos, útil para conferir o comportamento do scoring a olho.

### Testes de fluxo realizados

Percorridos no navegador, em viewport de celular:

- validação de formulário com campos vazios e inválidos;
- início da avaliação e resposta por toque e por teclado (teclas 1–5);
- autosave verificado no `localStorage` a cada resposta;
- recarregar a página no meio → retoma na pergunta correta;
- sair para a página inicial → detecta avaliação em andamento com o progresso certo;
- voltar em perguntas anteriores → resposta anterior reexibida marcada;
- alterar uma resposta já dada → valor atualizado sem duplicar a contagem;
- retomada apontando para a pergunta pendente quando há buraco no meio;
- conclusão com as 120 respostas → validação, cálculo, relatório e redirecionamento;
- tentativa de concluir com respostas faltando → bloqueada, com a lista de pendências;
- envio de e-mail com endpoint simulado: falha → estado de erro + botão de reenvio;
  reenvio → sucesso; dois cliques seguidos → nenhum envio duplicado;
- payload do e-mail conferido (destinatários, assuntos, `reply-to`, HTML e texto puro);
- "Apagar meus dados" e "Refazer avaliação" com confirmação e cancelamento;
- acesso ao relatório sem dados → estado vazio; acesso ao questionário sem
  consentimento → redirecionamento para a página inicial;
- ausência de rolagem horizontal em 320, 360, 390, 414, 768 e 1920 px.

---

## Acessibilidade

- HTML semântico, com `main`, `section`, `nav`, `fieldset`/`legend` e hierarquia
  de títulos coerente;
- as opções de resposta são **rádios reais** dentro de um `fieldset`, navegáveis
  por Tab e pelas setas, com rótulos associados;
- atalhos de teclado: **1 a 5** respondem, **←** e **→** navegam entre perguntas;
- link "Pular para o conteúdo" em todas as páginas;
- `:focus-visible` com contorno visível e consistente;
- alvos de toque de no mínimo 48 px;
- gráfico radar e barras com `role="img"` e `aria-label` descrevendo os valores;
- barra de progresso com `role="progressbar"` e `aria-valuetext`;
- mensagens de erro com `role="alert"`, associadas via `aria-describedby`;
- `prefers-reduced-motion` respeitado (animações desligadas);
- tema claro/escuro seguindo o sistema, com alternância manual persistida.

---

## Publicação

Copie a pasta `source/` (exceto `references/` e `servidor/`, que não são
necessários em produção) para qualquer hospedagem estática. Não há etapa de
build.

Este repositório publica via **GitHub Pages** a partir da raiz — o site
principal fica em `/` e esta plataforma em `/source/`. Para um endereço mais
curto, renomeie a pasta (por exemplo, para `avaliacao/`) ou publique-a em um
subdomínio próprio; nenhum caminho absoluto está fixado no código.

Se for publicar em subpasta, confirme que `.nojekyll` continua presente na raiz.

### Ajuste no `.gitignore`

O `.gitignore` da raiz ignorava `/source/` inteiro, para manter fora do
versionamento os clones de referência (que trazem `.git` próprio). Isso também
deixaria esta plataforma fora do repositório e, portanto, fora do GitHub Pages.
A regra foi estreitada para ignorar apenas os clones:

```gitignore
/source/references/
```

Assim a plataforma é versionada e publicada, e as referências continuam fora.

---

## Limitações conhecidas

1. **Sem normas brasileiras.** Não há percentis, por decisão de projeto. Quando
   houver normatização adequada, a camada de classificação já está isolada em
   `classifications.js` para receber essa evolução.
2. **Dados presos ao dispositivo.** Como não há backend, uma avaliação iniciada
   no celular não pode ser continuada no computador. Limpar os dados do
   navegador apaga o progresso.
3. **Envio de e-mail exige uma função serverless.** Sem ela, o relatório
   funciona por completo na tela, mas não é enviado. Não existe caminho seguro
   de enviar e-mail direto do navegador — ver a seção de segurança acima.
4. **ES Modules exigem HTTP.** Abrir os arquivos por `file://` não funciona.
5. **Autoavaliação.** O instrumento mede autopercepção, sujeita a desejabilidade
   social e ao estado do momento. Não substitui avaliação profissional.
6. **Sem exportação em PDF nativa.** A impressão do navegador (CSS `@media
   print` cuidadosamente ajustado) cobre o caso; não há biblioteca de geração
   de PDF nesta etapa.
7. **HEXACO, DISC e MBTI não implementados.** Ver a seção seguinte.

---

## Referências e fundamentação

### Metodologias

- **Big Five / Five-Factor Model** — Costa & McCrae; ver também
  *Measuring the Big Five Personality Domains*, Srivastava,
  <https://pages.uoregon.edu/sanjay/bigfive.html>
- **IPIP** — International Personality Item Pool, Oregon Research Institute,
  <https://ipip.ori.org/>. Itens de domínio público.
- **IPIP-NEO-120** — John A. Johnson, versão curta do IPIP-NEO,
  <https://drj.virtualave.net/IPIP/ipipneo120.htm>

### Projetos estudados

| Projeto | Licença | O que foi aproveitado |
|---------|---------|------------------------|
| `ipip-neo-120` | MIT © 2017 Geir Gåsodden | Banco de itens pt-br (ids, domínio, faceta, keyed) e o tratamento da escala |
| `bigfive-web` | MIT © 2024 B5 Holding AS | Método de agregação por domínio e faceta; nomenclatura pt-br das 30 facetas |
| `bigfive-web-original` | MIT | Organização do fluxo de avaliação |
| `five-factor-e` | MIT © NeuroQuest AI | Estudo do modelo normativo do IPIP-NEO — base para a decisão de **não** apresentar percentis |
| `ipip-neo-pi` | — | Referência sobre o instrumento |
| `libre-disc`, `disc-compass` | — | Estudados apenas para UX, gráficos e mecanismos client-side |
| `mbti-personality-test`, `social-berterfly` | — | Inspiração de experiência e visualização |
| `hexaco-person` | — | Referência arquitetural apenas |

Nenhum arquivo dos projetos de referência é carregado em tempo de execução: os
dados necessários foram copiados para `assets/js/data/`. Nada dentro de
`references/` foi alterado.

### Decisões deliberadas de escopo

- **DISC não é usado como fundamento do score.** Os projetos DISC foram
  estudados para UX e visualização. Não há mistura matemática entre DISC e
  Big Five.
- **MBTI não é derivado.** O relatório não converte Big Five em tipos como
  INTJ ou ENTP.
- **HEXACO não foi implementado.** O HEXACO-PI-R não é de domínio público como
  o IPIP, e o uso em produto público exigiria verificação prévia de direitos.
  A arquitetura ficou preparada para receber novos instrumentos.

---

## Licenças

Os itens do IPIP são de domínio público. As traduções e o método de agregação
vieram de projetos sob licença MIT, cuja exigência de atribuição está cumprida
na seção acima e nos cabeçalhos de `assets/js/data/questions.js` e
`assets/js/data/domains.js`.

Os textos interpretativos, as regras de combinação, o design, o código de
scoring, o relatório e os e-mails desta plataforma são originais.

---

*Esta avaliação possui finalidade informativa e de autoconhecimento
comportamental. O resultado não constitui diagnóstico psicológico, laudo
psicológico ou avaliação clínica e não deve ser utilizado isoladamente para
decisões de alto impacto.*
