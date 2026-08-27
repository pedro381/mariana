/**
 * Regras interpretativas por combinação.
 *
 * O relatório não se limita a concatenar cinco textos isolados: as seções
 * temáticas nascem de regras que olham para combinações de dimensões e de
 * facetas. Todas as regras estão declaradas aqui, de forma legível e auditável.
 *
 * Propriedades de projeto:
 * - determinismo: as mesmas respostas produzem sempre o mesmo conjunto de
 *   textos, na mesma ordem (ordenação por prioridade e, em empate, por `id`);
 * - transparência: nenhuma regra é escondida em código de interface;
 * - nada de IA externa nem de aleatoriedade.
 *
 * Contexto entregue a cada regra (`p`):
 *   p.index(d)        índice exibido da dimensão (0–100)
 *   p.level(d)        'baixo' | 'medio' | 'alto' da dimensão exibida
 *   p.is(d, nivel)    atalho booleano
 *   p.fi(d, n)        índice da faceta n (direção medida)
 *   p.fl(d, n)        nível da faceta n
 *   p.fis(d, n, lvl)  atalho booleano de faceta
 *   p.salient(d)      a dimensão se afasta o bastante do centro?
 *
 * ATENÇÃO: para a dimensão N, `index`/`level` referem-se à ESTABILIDADE
 * EMOCIONAL (eixo exibido), enquanto `fi`/`fl` referem-se às facetas de
 * NEUROTICISMO (eixo medido). Ex.: p.is('N','alto') = muito estável;
 * p.fis('N',1,'alto') = ansiedade alta.
 */

import { coarseLevel, isSalient } from '../scoring/classifications.js';

/** Monta o objeto de contexto consultado pelas regras. */
export function buildContext(result) {
  const dominio = (d) => result.byKey[d];
  const faceta = (d, n) => {
    const dom = dominio(d);
    return dom ? dom.facets.find((f) => f.n === n) : null;
  };

  return {
    result,
    index: (d) => (dominio(d) ? dominio(d).index : 50),
    level: (d) => (dominio(d) ? dominio(d).level : 'medio'),
    is: (d, nivel) => (dominio(d) ? dominio(d).level === nivel : false),
    fi: (d, n) => (faceta(d, n) ? faceta(d, n).index : 50),
    fl: (d, n) => (faceta(d, n) ? coarseLevel(faceta(d, n).index) : 'medio'),
    fis: (d, n, nivel) => (faceta(d, n) ? coarseLevel(faceta(d, n).index) === nivel : false),
    salient: (d) => (dominio(d) ? isSalient(dominio(d).index) : false)
  };
}

/* ------------------------------------------------------------------ *
 *  Visão geral — leitura combinada do perfil
 * ------------------------------------------------------------------ */

export const OVERVIEW_RULES = Object.freeze([
  {
    id: 'ov-exec-criativo',
    priority: 90,
    when: (p) => p.is('C', 'alto') && p.is('O', 'alto'),
    text: 'A combinação entre alta organização e alta abertura sugere um perfil que costuma unir duas coisas que nem sempre andam juntas: gerar alternativas e levá-las até o fim. É provável que você se sinta à vontade tanto em conversas sobre o que poderia ser diferente quanto na estruturação do que precisa acontecer para chegar lá.'
  },
  {
    id: 'ov-exec-pratico',
    priority: 88,
    when: (p) => p.is('C', 'alto') && p.is('O', 'baixo'),
    text: 'A combinação entre alta organização e preferência pelo concreto sugere um perfil voltado à execução confiável. É provável que você entregue com consistência dentro de métodos já estabelecidos e prefira aperfeiçoar o que funciona a substituí-lo por algo não testado.'
  },
  {
    id: 'ov-criativo-flexivel',
    priority: 86,
    when: (p) => p.is('O', 'alto') && p.is('C', 'baixo'),
    text: 'A combinação entre alta abertura e baixa estruturação sugere um perfil exploratório: muitas ideias, disposição para experimentar e desconforto com processos rígidos. É provável que seus melhores resultados apareçam quando existe liberdade de método e algum apoio externo para o fechamento.'
  },
  {
    id: 'ov-social-articulador',
    priority: 84,
    when: (p) => p.is('E', 'alto') && p.is('A', 'alto'),
    text: 'A combinação entre alta extroversão e alta amabilidade sugere presença social acolhedora. É provável que você circule bem entre pessoas diferentes, construa pontes com facilidade e seja procurado(a) quando algo precisa ser destravado no plano das relações.'
  },
  {
    id: 'ov-social-direto',
    priority: 83,
    when: (p) => p.is('E', 'alto') && p.is('A', 'baixo'),
    text: 'A combinação entre alta extroversão e postura mais direta sugere um estilo assertivo e frontal. É provável que você diga o que pensa sem rodeios e sustente posições em discussões, o que tende a ser eficaz em negociação e mais custoso em contextos que exigem delicadeza.'
  },
  {
    id: 'ov-reservado-analitico',
    priority: 82,
    when: (p) => p.is('E', 'baixo') && p.is('C', 'alto'),
    text: 'A combinação entre perfil reservado e alta organização sugere um estilo de trabalho concentrado e metódico. É provável que sua contribuição apareça mais na consistência do que é entregue do que na visibilidade em fóruns coletivos.'
  },
  {
    id: 'ov-reservado-aberto',
    priority: 80,
    when: (p) => p.is('E', 'baixo') && p.is('O', 'alto'),
    text: 'A combinação entre perfil reservado e alta abertura sugere uma vida intelectual ativa que nem sempre é visível de fora. É provável que boas ideias sejam elaboradas internamente antes de serem compartilhadas — e que se percam quando não há um canal adequado para isso.'
  },
  {
    id: 'ov-estavel-pressao',
    priority: 78,
    when: (p) => p.is('N', 'alto') && p.is('C', 'alto'),
    text: 'A combinação entre estabilidade emocional elevada e alta organização sugere bom desempenho em contextos de pressão com prazo: é provável que você mantenha o método funcionando mesmo quando o ambiente perde previsibilidade.'
  },
  {
    id: 'ov-sensivel-cuidadoso',
    priority: 76,
    when: (p) => p.is('N', 'baixo') && p.is('C', 'alto'),
    text: 'A combinação entre maior reatividade emocional e alta organização sugere que o cuidado com detalhes vem acompanhado de exigência interna elevada. É provável que você perceba riscos cedo — e que a mesma antecipação cobre energia quando não há espaço para recuperação.'
  },
  {
    id: 'ov-sensivel-empatico',
    priority: 74,
    when: (p) => p.is('N', 'baixo') && p.is('A', 'alto'),
    text: 'A combinação entre sensibilidade emocional e alta amabilidade sugere forte sintonia com o estado das outras pessoas. É provável que você perceba desconforto alheio antes que ele seja dito, o que favorece o cuidado e também aumenta a carga emocional que você absorve.'
  },
  {
    id: 'ov-social-organizado',
    priority: 72,
    when: (p) => p.is('E', 'alto') && p.is('C', 'alto'),
    text: 'A combinação entre alta extroversão e alta organização sugere presença ativa somada a acompanhamento: é provável que você não apenas mobilize as pessoas em torno de algo, como também acompanhe o que ficou combinado depois que a conversa termina.'
  },
  {
    id: 'ov-aberto-amavel',
    priority: 70,
    when: (p) => p.is('O', 'alto') && p.is('A', 'alto'),
    text: 'A combinação entre alta abertura e alta amabilidade sugere disposição para considerar pontos de vista diferentes do seu — tanto no plano das ideias quanto no das pessoas. É provável que você mude de posição diante de um bom argumento sem sentir isso como derrota.'
  },
  {
    id: 'ov-critico-analitico',
    priority: 68,
    when: (p) => p.is('O', 'alto') && p.is('A', 'baixo'),
    text: 'A combinação entre alta abertura e postura mais cética sugere um olhar analítico e independente: é provável que você examine propostas pelo mérito, inclusive quando elas já têm adesão do grupo.'
  },
  {
    id: 'ov-reservado-amavel',
    priority: 66,
    when: (p) => p.is('E', 'baixo') && p.is('A', 'alto'),
    text: 'A combinação entre perfil reservado e alta amabilidade sugere uma presença discreta e acolhedora: é provável que seu cuidado com as pessoas apareça mais em gestos concretos e conversas individuais do que em demonstrações públicas.'
  },
  {
    id: 'ov-pratico-estavel',
    priority: 64,
    when: (p) => p.is('O', 'baixo') && p.is('N', 'alto'),
    text: 'A combinação entre preferência pelo concreto e estabilidade emocional elevada sugere um perfil constante: é provável que você seja a pessoa que mantém o rumo quando o ambiente fica agitado.'
  },
  {
    id: 'ov-flexivel-sensivel',
    priority: 62,
    when: (p) => p.is('C', 'baixo') && p.is('N', 'baixo'),
    text: 'A combinação entre menor apego a estrutura e maior reatividade emocional sugere que prazos e cobranças pesam mais quando o plano não está claro. É provável que definir poucos marcos visíveis reduza bastante essa carga.'
  },
  {
    id: 'ov-equilibrado',
    priority: 20,
    when: (p) => ['O', 'C', 'E', 'A', 'N'].every((d) => p.is(d, 'medio')),
    text: 'Seus resultados se concentram na faixa intermediária em todas as cinco dimensões. Perfis assim costumam ser versáteis: é provável que você se adapte a contextos variados sem que um traço específico domine sua forma de agir. A leitura mais útil, nesse caso, está nas facetas, onde as diferenças aparecem com mais nitidez.'
  },
  {
    /* Rede de segurança: nenhuma seção do relatório pode aparecer vazia. */
    id: 'ov-fallback',
    priority: 1,
    fallback: true,
    when: () => true,
    text: 'As combinações entre as suas cinco dimensões não formam um padrão único e dominante. Isso é comum e não indica indefinição: significa que a sua forma de agir tende a variar mais conforme a situação do que em perfis com traços muito acentuados. As seções a seguir detalham essa variação por área da vida.'
  }
]);

/* ------------------------------------------------------------------ *
 *  Ambiente profissional
 * ------------------------------------------------------------------ */

export const WORK_RULES = Object.freeze([
  { id: 'wk-org-alta', priority: 90, when: (p) => p.is('C', 'alto'), text: 'Organização e planejamento: é provável que você prefira começar com escopo, prazo e responsabilidades definidos, e que se incomode com retrabalho causado por combinados vagos.' },
  { id: 'wk-org-baixa', priority: 90, when: (p) => p.is('C', 'baixo'), text: 'Organização e planejamento: é provável que você funcione melhor com liberdade de método e menos etapas formais, respondendo bem ao que surge no caminho.' },
  { id: 'wk-org-media', priority: 60, when: (p) => p.is('C', 'medio'), text: 'Organização e planejamento: é provável que você estruture o que é crítico e deixe o restante fluir, ajustando o nível de controle conforme o risco da entrega.' },
  { id: 'wk-rotina-alta', priority: 80, when: (p) => p.fis('O', 4, 'baixo'), text: 'Rotina e mudanças: rotinas estáveis tendem a favorecer seu desempenho; mudanças frequentes de direção provavelmente exigem mais tempo de reacomodação.' },
  { id: 'wk-rotina-baixa', priority: 80, when: (p) => p.fis('O', 4, 'alto'), text: 'Rotina e mudanças: rotinas muito repetitivas tendem a desgastar seu engajamento; é provável que você se recupere rápido de mudanças de direção.' },
  { id: 'wk-autonomia', priority: 75, when: (p) => p.fis('C', 1, 'alto') && p.is('E', 'baixo'), text: 'Autonomia: é provável que você produza bem com pouca supervisão, desde que o resultado esperado esteja claro desde o início.' },
  { id: 'wk-interacao-alta', priority: 70, when: (p) => p.is('E', 'alto'), text: 'Interação: é provável que você busque conversas e alinhamentos frequentes, e que o isolamento prolongado reduza sua energia de trabalho.' },
  { id: 'wk-interacao-baixa', priority: 70, when: (p) => p.is('E', 'baixo'), text: 'Interação: é provável que blocos de trabalho sem interrupção tenham peso grande no seu desempenho, e que uma agenda cheia de reuniões cobre um custo de recuperação.' },
  { id: 'wk-pressao-estavel', priority: 65, when: (p) => p.is('N', 'alto'), text: 'Pressão: é provável que você mantenha o mesmo padrão de comportamento em situações de urgência, o que costuma estabilizar o time ao redor.' },
  { id: 'wk-pressao-sensivel', priority: 65, when: (p) => p.is('N', 'baixo'), text: 'Pressão: é provável que períodos de pressão contínua cobrem mais de você, e que rotinas de recuperação e previsibilidade façam diferença real no seu desempenho.' },
  { id: 'wk-colab-alta', priority: 60, when: (p) => p.is('A', 'alto'), text: 'Colaboração: é provável que você invista em manter a relação preservada mesmo em situações de divergência técnica.' },
  { id: 'wk-colab-baixa', priority: 60, when: (p) => p.is('A', 'baixo'), text: 'Colaboração: é provável que você separe com clareza a discussão do problema da relação com as pessoas, sustentando posições sem grande desconforto.' },
  { id: 'wk-exec-meta', priority: 55, when: (p) => p.fis('C', 4, 'alto'), text: 'Execução: metas exigentes tendem a mobilizar você, e é provável que a ausência de um objetivo claro reduza seu engajamento mais do que o volume de trabalho.' },
  { id: 'wk-fallback', priority: 1, fallback: true, when: () => true, text: 'De modo geral, seus resultados não apontam uma exigência ambiental muito específica: é provável que você se adapte a diferentes formas de organização do trabalho, ajustando o próprio método ao que o contexto pede.' },
  { id: 'wk-detalhe', priority: 50, when: (p) => p.fis('C', 2, 'alto') && p.fis('C', 6, 'alto'), text: 'Atenção ao detalhe: é provável que você revise antes de entregar e prefira decidir com informação completa a decidir rápido.' }
]);

/* ------------------------------------------------------------------ *
 *  Estilo de comunicação
 * ------------------------------------------------------------------ */

export const COMMUNICATION_RULES = Object.freeze([
  { id: 'cm-assert-alta', priority: 90, when: (p) => p.fis('E', 3, 'alto'), text: 'Assertividade: é provável que você se posicione com clareza, inclusive em desacordo, e assuma a condução da conversa quando ninguém o faz.' },
  { id: 'cm-assert-baixa', priority: 90, when: (p) => p.fis('E', 3, 'baixo'), text: 'Assertividade: é provável que você prefira ouvir antes de se posicionar e ceda o espaço da condução com facilidade — o que pode fazer com que boas contribuições cheguem tarde à discussão.' },
  { id: 'cm-social-alta', priority: 80, when: (p) => p.fis('E', 1, 'alto') || p.fis('E', 2, 'alto'), text: 'Sociabilidade: iniciar conversas e falar com pessoas que você não conhece tende a ser confortável, o que facilita articulação entre áreas e públicos diferentes.' },
  { id: 'cm-social-baixa', priority: 80, when: (p) => p.fis('E', 1, 'baixo') && p.fis('E', 2, 'baixo'), text: 'Sociabilidade: é provável que você se expresse com mais facilidade em conversas individuais do que em grupos grandes, e que sua fala seja mais seletiva do que constante.' },
  { id: 'cm-diplomacia', priority: 75, when: (p) => p.fis('A', 4, 'alto'), text: 'Diplomacia: é provável que você cuide da forma antes do conteúdo em conversas delicadas, buscando reduzir o atrito. Vale checar se a mensagem principal chegou inteira.' },
  { id: 'cm-objetividade', priority: 75, when: (p) => p.fis('A', 4, 'baixo') || p.fis('A', 2, 'baixo'), text: 'Objetividade: é provável que você vá direto ao ponto. Isso economiza tempo e, em temas sensíveis, pede atenção extra ao contexto emocional de quem escuta.' },
  { id: 'cm-receptividade', priority: 70, when: (p) => p.fis('A', 1, 'alto') && p.fis('O', 5, 'alto'), text: 'Receptividade: é provável que você escute argumentos contrários com abertura genuína e reveja posições diante de bons argumentos.' },
  { id: 'cm-divergencia-evita', priority: 65, when: (p) => p.is('A', 'alto') && p.fis('N', 4, 'alto'), text: 'Divergências: confrontos diretos tendem a gerar desconforto, o que pode adiar conversas necessárias. Preparar os pontos antes costuma reduzir bastante esse custo.' },
  { id: 'cm-divergencia-encara', priority: 65, when: (p) => p.is('A', 'baixo') && p.is('N', 'alto'), text: 'Divergências: é provável que você encare o confronto com naturalidade e mantenha a discussão em curso sem que ela abale a relação — do seu ponto de vista.' },
  { id: 'cm-entusiasmo', priority: 55, when: (p) => p.fis('E', 6, 'alto'), text: 'Tom: seu entusiasmo tende a ser visível na comunicação, o que costuma contagiar e engajar quem escuta.' },
  { id: 'cm-cuidado', priority: 62, when: (p) => p.is('A', 'alto'), text: 'Cuidado com o interlocutor: é provável que você adapte a forma da mensagem ao estado de quem escuta, priorizando preservar a relação enquanto trata do assunto.' },
  { id: 'cm-tom-estavel', priority: 60, when: (p) => p.is('N', 'alto'), text: 'Tom sob tensão: é provável que você mantenha a voz estável mesmo em conversas difíceis, o que costuma baixar a temperatura da discussão.' },
  { id: 'cm-nao-dito', priority: 60, when: (p) => p.is('N', 'baixo'), text: 'Sensibilidade: é provável que você capte o que não foi dito — hesitações, mudanças de tom, desconforto. Nomear isso com cuidado costuma destravar conversas travadas.' },
  { id: 'cm-repertorio', priority: 50, when: (p) => p.is('O', 'alto'), text: 'Repertório: é provável que você recorra a referências, analogias e exemplos variados para explicar o que pensa, o que ajuda a tornar assuntos complexos acessíveis.' },
  { id: 'cm-espontanea', priority: 48, when: (p) => p.is('C', 'baixo'), text: 'Estrutura: é provável que sua comunicação seja mais espontânea do que planejada. Isso ganha naturalidade e, em temas complexos, pede um esforço extra de organização prévia.' },
  { id: 'cm-fallback', priority: 1, fallback: true, when: () => true, text: 'Seu estilo de comunicação tende a acompanhar o contexto mais do que um padrão fixo: é provável que você module tom, objetividade e nível de exposição conforme a situação e as pessoas envolvidas.' },
  { id: 'cm-contido', priority: 55, when: (p) => p.fis('E', 6, 'baixo'), text: 'Tom: sua expressão tende a ser mais contida, o que costuma transmitir sobriedade — e às vezes pede um esforço extra para que o interesse fique visível.' }
]);

/* ------------------------------------------------------------------ *
 *  Trabalho em equipe
 * ------------------------------------------------------------------ */

export const TEAM_RULES = Object.freeze([
  { id: 'tm-coop-alta', priority: 90, when: (p) => p.is('A', 'alto'), text: 'Cooperação: é provável que você priorize o resultado coletivo e se disponha a ajustar sua parte para destravar a do outro.' },
  { id: 'tm-coop-baixa', priority: 90, when: (p) => p.is('A', 'baixo'), text: 'Cooperação: é provável que você colabore a partir de critérios claros, questionando decisões que considera equivocadas em vez de acompanhá-las por consenso.' },
  { id: 'tm-confianca-alta', priority: 80, when: (p) => p.fis('A', 1, 'alto'), text: 'Confiança: é provável que você delegue e conte com o trabalho dos outros sem necessidade de verificação constante.' },
  { id: 'tm-confianca-baixa', priority: 80, when: (p) => p.fis('A', 1, 'baixo'), text: 'Confiança: é provável que você acompanhe mais de perto o trabalho compartilhado, o que reduz risco e pode ser sentido como controle por quem é acompanhado.' },
  { id: 'tm-autonomia', priority: 75, when: (p) => p.is('E', 'baixo') && p.fis('C', 1, 'alto'), text: 'Autonomia: é provável que você prefira receber um recorte próprio e responder por ele, em vez de trabalhar em construção coletiva contínua.' },
  { id: 'tm-interacao', priority: 75, when: (p) => p.is('E', 'alto'), text: 'Interação: é provável que você mantenha o time conectado, promovendo alinhamentos e conversas informais que fazem a informação circular.' },
  { id: 'tm-conflito-evita', priority: 70, when: (p) => p.fis('A', 4, 'alto'), text: 'Conflitos: sua tendência é buscar acomodação. Isso preserva o clima e, em temas estruturais, pode deixar divergências importantes sem resolução.' },
  { id: 'tm-conflito-enfrenta', priority: 70, when: (p) => p.fis('A', 4, 'baixo'), text: 'Conflitos: sua tendência é enfrentar a divergência diretamente, o que acelera decisões e pede atenção ao desgaste acumulado nas relações.' },
  { id: 'tm-ideias', priority: 60, when: (p) => p.is('O', 'alto') && p.fis('A', 5, 'alto'), text: 'Ideias: é provável que você contribua com alternativas sem disputar autoria, o que costuma tornar a discussão mais produtiva.' },
  { id: 'tm-organiza', priority: 60, when: (p) => p.fis('C', 2, 'alto') || p.fis('C', 3, 'alto'), text: 'Organização do grupo: é provável que você assuma naturalmente o papel de manter combinados, prazos e registros em ordem.' },
  { id: 'tm-coop-media', priority: 58, when: (p) => p.is('A', 'medio'), text: 'Cooperação: é provável que você colabore com facilidade e, ainda assim, sustente sua posição quando considera relevante — combinação que costuma equilibrar discussões de grupo.' },
  { id: 'tm-acordos-leves', priority: 56, when: (p) => p.is('C', 'baixo'), text: 'Combinados: é provável que você prefira acordos leves a controles formais. Registrar por escrito apenas o essencial costuma evitar ruído sem engessar o time.' },
  { id: 'tm-antena', priority: 54, when: (p) => p.is('N', 'baixo'), text: 'Clima: é provável que você perceba cedo quando o grupo está tenso. Verbalizar essa percepção transforma em contribuição algo que, calado, vira desgaste pessoal.' },
  { id: 'tm-fallback', priority: 1, fallback: true, when: () => true, text: 'Em equipe, seus resultados não indicam um papel fixo. É provável que a sua contribuição varie conforme a composição do grupo e o que estiver faltando nele — ora mais cooperativa, ora mais crítica.' },
  { id: 'tm-clima', priority: 50, when: (p) => p.fis('A', 6, 'alto') && p.fis('E', 6, 'alto'), text: 'Clima: é provável que você perceba e influencie o ânimo do grupo, sendo uma referência de acolhimento em momentos difíceis.' }
]);

/* ------------------------------------------------------------------ *
 *  Tendências de liderança
 *  Indicadores comportamentais — não é avaliação de capacidade de liderar.
 * ------------------------------------------------------------------ */

export const LEADERSHIP_RULES = Object.freeze([
  { id: 'ld-direcao', priority: 90, when: (p) => p.fis('E', 3, 'alto') && p.is('C', 'alto'), text: 'Indicador de direção: alta assertividade combinada com alta organização costuma aparecer em quem assume a condução e estrutura o caminho para o grupo.' },
  { id: 'ld-suporte', priority: 88, when: (p) => p.is('A', 'alto') && p.fis('E', 3, 'medio'), text: 'Indicador de liderança de suporte: a combinação entre cooperação alta e assertividade intermediária costuma aparecer em quem conduz criando condições para os outros, mais do que dando direção explícita.' },
  { id: 'ld-tecnica', priority: 86, when: (p) => p.is('E', 'baixo') && p.fis('C', 1, 'alto'), text: 'Indicador de referência técnica: perfis reservados com alta autoeficácia costumam exercer influência pela consistência do próprio trabalho, e não pela ocupação do espaço social.' },
  { id: 'ld-inspiracao', priority: 80, when: (p) => p.fis('E', 6, 'alto') && p.is('O', 'alto'), text: 'Indicador de mobilização: entusiasmo elevado somado a alta abertura costuma aparecer em quem comunica direção futura e engaja pelo sentido da proposta.' },
  { id: 'ld-pressao', priority: 75, when: (p) => p.is('N', 'alto'), text: 'Indicador de sustentação sob pressão: a estabilidade emocional observada tende a favorecer a manutenção do tom em momentos de crise, algo que grupos costumam usar como referência.' },
  { id: 'ld-delegacao-dificil', priority: 70, when: (p) => p.is('C', 'alto') && p.fis('A', 1, 'baixo'), text: 'Ponto de atenção: exigência alta com confiança mais reservada tende a dificultar a delegação. Combinar critérios de qualidade antes, em vez de revisar depois, costuma reduzir esse atrito.' },
  { id: 'ld-feedback-dificil', priority: 68, when: (p) => p.is('A', 'alto') && p.fis('A', 4, 'alto'), text: 'Ponto de atenção: a preferência por harmonia tende a adiar conversas de desempenho. Estruturar esses momentos como rotina, e não como exceção, costuma reduzir o custo emocional.' },
  { id: 'ld-abertura', priority: 55, when: (p) => p.is('O', 'alto'), text: 'Indicador de abertura: perfis com abertura elevada costumam trazer alternativas para a mesa e rever a direção quando o cenário muda, em vez de sustentar um plano por inércia.' },
  { id: 'ld-recuperacao', priority: 52, when: (p) => p.is('N', 'baixo'), text: 'Ponto de atenção: em papéis de condução, maior reatividade emocional pede cuidado com a própria recuperação — o desgaste de quem conduz tende a ser percebido pelo grupo.' },
  { id: 'ld-estrutura-baixa', priority: 50, when: (p) => p.is('C', 'baixo'), text: 'Observação: com menor apego a estrutura, a condução tende a funcionar melhor apoiada em alguém que cuide do acompanhamento e dos prazos.' },
  { id: 'ld-fallback', priority: 1, fallback: true, when: () => true, text: 'Seus indicadores relacionados à liderança ficam em posições intermediárias, sem um estilo predominante. Comportamentos de liderança, nesse caso, tendem a depender mais do contexto, do vínculo com o grupo e da experiência acumulada do que de uma tendência marcada nas dimensões medidas.' },
  { id: 'ld-visibilidade', priority: 60, when: (p) => p.fis('A', 5, 'alto') && p.fis('E', 3, 'baixo'), text: 'Observação: modéstia alta com assertividade baixa costuma fazer com que a contribuição seja reconhecida mais tarde do que acontece de fato.' }
]);

/* ------------------------------------------------------------------ *
 *  Tomada de decisão
 * ------------------------------------------------------------------ */

export const DECISION_RULES = Object.freeze([
  { id: 'dc-estrutura-alta', priority: 90, when: (p) => p.is('C', 'alto'), text: 'Estrutura: é provável que você decida a partir de informação organizada, comparando alternativas antes de escolher.' },
  { id: 'dc-estrutura-baixa', priority: 90, when: (p) => p.is('C', 'baixo'), text: 'Estrutura: é provável que você decida com base no que já está disponível e ajuste o curso depois, em vez de esperar por informação completa.' },
  { id: 'dc-prudencia-alta', priority: 85, when: (p) => p.fis('C', 6, 'alto'), text: 'Prudência: sua tendência é considerar consequências antes de agir. Isso reduz erros e pode custar oportunidades quando a janela de decisão é curta.' },
  { id: 'dc-prudencia-baixa', priority: 85, when: (p) => p.fis('C', 6, 'baixo'), text: 'Velocidade: sua tendência é decidir rápido e corrigir na sequência. Isso favorece contextos dinâmicos e pede atenção em decisões difíceis de reverter.' },
  { id: 'dc-alternativas', priority: 75, when: (p) => p.is('O', 'alto'), text: 'Alternativas: é provável que você considere caminhos além dos óbvios antes de escolher, incluindo opções que o grupo ainda não colocou na mesa.' },
  { id: 'dc-alternativas-baixa', priority: 75, when: (p) => p.is('O', 'baixo'), text: 'Alternativas: é provável que você prefira soluções já testadas, avaliando propostas novas pelo histórico de resultados.' },
  { id: 'dc-pessoas', priority: 70, when: (p) => p.is('A', 'alto'), text: 'Impacto sobre pessoas: é provável que o efeito da decisão sobre quem será afetado tenha peso relevante na sua escolha.' },
  { id: 'dc-criterio', priority: 70, when: (p) => p.is('A', 'baixo'), text: 'Critério: é provável que você sustente a decisão pelo mérito técnico mesmo quando ela desagrada parte das pessoas envolvidas.' },
  { id: 'dc-incerteza-tolera', priority: 65, when: (p) => p.is('N', 'alto') && p.fis('N', 1, 'baixo'), text: 'Tolerância à incerteza: decidir sem todas as respostas tende a gerar pouco desconforto, o que ajuda em contextos ambíguos.' },
  { id: 'dc-incerteza-baixa', priority: 65, when: (p) => p.fis('N', 1, 'alto'), text: 'Tolerância à incerteza: cenários indefinidos tendem a gerar desconforto e busca por mais informação. Definir de antemão o critério de decisão costuma encurtar esse ciclo.' },
  { id: 'dc-fallback', priority: 1, fallback: true, when: () => true, text: 'Sua forma de decidir não se concentra em um extremo: é provável que você alterne entre analisar mais e decidir mais rápido, conforme o risco envolvido e o tempo disponível.' },
  { id: 'dc-impulso', priority: 60, when: (p) => p.fis('N', 5, 'alto') && p.fis('C', 6, 'baixo'), text: 'Ponto de atenção: a combinação entre impulsividade e baixa cautela sugere risco de decisões tomadas no calor do momento. Um intervalo curto antes de confirmar decisões relevantes costuma ser suficiente.' }
]);

/* ------------------------------------------------------------------ *
 *  Sugestões de desenvolvimento
 * ------------------------------------------------------------------ */

export const DEVELOPMENT_RULES = Object.freeze([
  { id: 'dv-c-alto', priority: 85, when: (p) => p.is('C', 'alto'), text: 'Experimente reservar, em um projeto de menor risco, um espaço deliberado para trabalhar sem plano fechado. O objetivo não é abrir mão do método, e sim ampliar o repertório de resposta ao imprevisto.' },
  { id: 'dv-c-baixo', priority: 85, when: (p) => p.is('C', 'baixo'), text: 'Experimente adotar uma estrutura mínima e única — uma lista visível com no máximo três prioridades do dia. Estruturas leves tendem a funcionar melhor que sistemas completos para perfis mais espontâneos.' },
  { id: 'dv-e-alto', priority: 80, when: (p) => p.is('E', 'alto'), text: 'Pratique deixar silêncio depois de fazer uma pergunta em grupo. Perfis comunicativos costumam ocupar o espaço sem perceber, e essa pausa muda bastante o que aparece na conversa.' },
  { id: 'dv-e-baixo', priority: 80, when: (p) => p.is('E', 'baixo'), text: 'Experimente registrar previamente dois pontos que você quer levar a cada reunião importante. Isso reduz a chance de contribuições relevantes ficarem de fora por falta de espaço no momento.' },
  { id: 'dv-o-alto', priority: 75, when: (p) => p.is('O', 'alto'), text: 'Observe quantas iniciativas você mantém abertas ao mesmo tempo. Escolher deliberadamente uma para concluir antes de começar outra costuma converter ideias em resultado com mais frequência.' },
  { id: 'dv-o-baixo', priority: 75, when: (p) => p.is('O', 'baixo'), text: 'Experimente pedir a versão concreta de propostas que soam abstratas: um exemplo, um piloto pequeno, um caso real. Isso costuma tornar produtivo um tipo de conversa que hoje pode parecer pouco útil.' },
  { id: 'dv-a-alto', priority: 70, when: (p) => p.is('A', 'alto'), text: 'Pratique nomear seu próprio interesse no início de uma negociação, antes de considerar o do outro. Perfis cooperativos costumam fazer o caminho inverso e cedem mais do que pretendiam.' },
  { id: 'dv-a-baixo', priority: 70, when: (p) => p.is('A', 'baixo'), text: 'Experimente iniciar conversas difíceis explicitando a intenção antes do conteúdo. Isso preserva a objetividade que caracteriza você e reduz a chance de a mensagem ser lida como hostilidade.' },
  { id: 'dv-n-baixo', priority: 68, when: (p) => p.is('N', 'baixo'), text: 'Observe quais situações antecipam sua sensação de sobrecarga e o que costuma restaurar sua energia. Tratar a recuperação como parte da rotina, e não como recompensa, tende a mudar bastante o resultado ao longo do tempo.' },
  { id: 'dv-n-alto', priority: 68, when: (p) => p.is('N', 'alto'), text: 'Observe se o seu limiar de alerta, mais alto que a média, faz com que sinais de desgaste em outras pessoas passem despercebidos. Perguntar diretamente costuma ser mais eficaz do que esperar o sinal aparecer.' },
  { id: 'dv-facet-order', priority: 60, when: (p) => p.fis('C', 2, 'baixo') && p.fis('C', 5, 'baixo'), text: 'Experimente encurtar o início das tarefas: combine consigo mesmo(a) apenas os primeiros cinco minutos, sem compromisso com o restante. Para perfis com menor autodisciplina, a barreira costuma estar na largada, não na continuidade.' },
  { id: 'dv-facet-assert', priority: 58, when: (p) => p.fis('E', 3, 'baixo'), text: 'Pratique se posicionar cedo em discussões, ainda que de forma breve. Entrar no início da conversa costuma custar menos do que contrapor uma decisão já encaminhada.' },
  { id: 'dv-facet-anx', priority: 56, when: (p) => p.fis('N', 1, 'alto'), text: 'Experimente separar o que é preocupação com risco real do que é antecipação de cenários improváveis. Escrever as duas listas costuma reduzir a carga de forma perceptível.' },
  { id: 'dv-c-medio', priority: 40, when: (p) => p.is('C', 'medio'), text: 'Observe em quais tipos de tarefa você naturalmente estrutura e em quais deixa fluir. Tornar esse critério explícito costuma reduzir o retrabalho em entregas que precisariam de mais método.' },
  { id: 'dv-e-medio', priority: 38, when: (p) => p.is('E', 'medio'), text: 'Experimente identificar quais interações recarregam sua energia e quais a consomem. Perfis intermediários em extroversão costumam se beneficiar mais de escolher o tipo de convívio do que a quantidade.' },
  { id: 'dv-a-medio', priority: 36, when: (p) => p.is('A', 'medio'), text: 'Antes de uma conversa difícil, defina de antemão o que é negociável e o que não é. Isso dá consistência a um estilo que alterna entre acomodar e sustentar.' },
  { id: 'dv-n-medio', priority: 34, when: (p) => p.is('N', 'medio'), text: 'Acompanhe por algumas semanas o que costuma anteceder seus períodos de maior tensão. Padrões que se repetem tendem a ser mais fáceis de ajustar do que episódios isolados.' },
  { id: 'dv-generico', priority: 10, when: () => true, text: 'Compartilhe este relatório com alguém que convive com você e pergunte com quais pontos essa pessoa concorda. A comparação entre autopercepção e percepção externa costuma ser a parte mais reveladora de uma avaliação como esta.' }
]);

/**
 * Seleciona as regras aplicáveis, em ordem determinística.
 *
 * Regras marcadas com `fallback: true` são uma rede de segurança: só entram
 * quando nenhuma outra regra da seção se aplicou. Sem isso, o texto genérico
 * ("nada se destaca") apareceria ao lado de afirmações específicas e as
 * contradiria.
 *
 * @param {Array} regras  conjunto de regras
 * @param {Object} p      contexto criado por `buildContext`
 * @param {number} max    quantidade máxima de textos
 */
export function selectRules(regras, p, max = 4) {
  const aplicaveis = regras.filter((regra) => {
    try {
      return Boolean(regra.when(p));
    } catch (erro) {
      console.error(`[combinations] regra ${regra.id} falhou:`, erro);
      return false;
    }
  });

  const especificas = aplicaveis.filter((r) => !r.fallback);
  const escolhidas = especificas.length > 0
    ? especificas
    : aplicaveis.filter((r) => r.fallback);

  return escolhidas
    .sort((a, b) => (b.priority - a.priority) || a.id.localeCompare(b.id))
    .slice(0, max)
    .map((regra) => ({ id: regra.id, text: regra.text }));
}
