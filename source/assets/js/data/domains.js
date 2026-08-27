/**
 * Metadados dos cinco domínios e das trinta facetas do IPIP-NEO-120.
 *
 * Os nomes das facetas seguem a nomenclatura consagrada do modelo (Costa &
 * McCrae; IPIP-NEO de Johnson), tomando como base a tradução do projeto
 * `bigfive-web` (MIT, Copyright (c) 2024 B5 Holding AS). Os textos descritivos
 * e as interpretações desta plataforma são originais.
 *
 * Sobre o domínio N: o traço medido é o Neuroticismo. Na interface ele é
 * apresentado como "Estabilidade Emocional", que é o mesmo eixo lido no sentido
 * inverso (índice de estabilidade = 100 − índice de neuroticismo). A relação é
 * explicada no relatório; nenhuma informação é perdida.
 */

export const DOMAIN_ORDER = Object.freeze(['O', 'C', 'E', 'A', 'N']);

export const DOMAINS = Object.freeze({
  O: Object.freeze({
    key: 'O',
    name: 'Abertura à Experiência',
    short: 'Abertura',
    chartLabel: ['Abertura'],
    inverted: false,
    tagline: 'Curiosidade intelectual, imaginação e receptividade ao novo.',
    description:
      'A Abertura à Experiência descreve o quanto uma pessoa busca variedade, ideias abstratas, '
      + 'expressão estética e formas diferentes de fazer as coisas. Índices altos costumam aparecer '
      + 'em pessoas curiosas e criativas; índices baixos, em pessoas mais práticas, concretas e '
      + 'apegadas ao que já funciona. Não é uma medida de inteligência.',
    facets: Object.freeze([
      Object.freeze({ n: 1, name: 'Imaginação', description: 'Facilidade para criar cenários mentais, imaginar possibilidades e se envolver com o mundo interno das ideias.' }),
      Object.freeze({ n: 2, name: 'Interesse Artístico', description: 'Sensibilidade para a estética, a arte e a beleza, seja em obras, na natureza ou no cotidiano.' }),
      Object.freeze({ n: 3, name: 'Emotividade', description: 'Consciência e valorização das próprias emoções e das emoções alheias como fonte de informação.' }),
      Object.freeze({ n: 4, name: 'Aventura', description: 'Disposição para experimentar o desconhecido, mudar de rotina e sair de ambientes familiares.' }),
      Object.freeze({ n: 5, name: 'Intelecto', description: 'Gosto por raciocínio abstrato, discussões conceituais, teorias e problemas complexos.' }),
      Object.freeze({ n: 6, name: 'Liberalismo', description: 'Prontidão para questionar tradições, normas estabelecidas e formas convencionais de autoridade.' })
    ])
  }),

  C: Object.freeze({
    key: 'C',
    name: 'Conscienciosidade',
    short: 'Conscienciosidade',
    chartLabel: ['Conscien-', 'ciosidade'],
    inverted: false,
    tagline: 'Organização, disciplina e orientação para objetivos.',
    description:
      'A Conscienciosidade descreve o grau de planejamento, persistência e controle de impulsos '
      + 'com que a pessoa conduz o que se propõe a fazer. Índices altos costumam se traduzir em '
      + 'método, prazos cumpridos e atenção a detalhes; índices baixos, em maior espontaneidade e '
      + 'flexibilidade, com menor apego a estrutura.',
    facets: Object.freeze([
      Object.freeze({ n: 1, name: 'Autoeficácia', description: 'Confiança na própria capacidade de dar conta do que assume e de concluir o que começa.' }),
      Object.freeze({ n: 2, name: 'Ordem', description: 'Preferência por ambientes, materiais e rotinas organizados e previsíveis.' }),
      Object.freeze({ n: 3, name: 'Senso de Dever', description: 'Consideração por regras, combinados e obrigações assumidas com outras pessoas.' }),
      Object.freeze({ n: 4, name: 'Busca por Realização', description: 'Disposição para estabelecer metas exigentes e investir esforço continuado para alcançá-las.' }),
      Object.freeze({ n: 5, name: 'Autodisciplina', description: 'Capacidade de iniciar tarefas e mantê-las em andamento mesmo diante de distrações ou desânimo.' }),
      Object.freeze({ n: 6, name: 'Cautela', description: 'Tendência a pensar antes de agir e a considerar consequências antes de decidir.' })
    ])
  }),

  E: Object.freeze({
    key: 'E',
    name: 'Extroversão',
    short: 'Extroversão',
    chartLabel: ['Extroversão'],
    inverted: false,
    tagline: 'Sociabilidade, energia e engajamento com o mundo externo.',
    description:
      'A Extroversão descreve o quanto a pessoa busca estímulo no convívio social e na ação. '
      + 'Índices altos costumam aparecer em pessoas comunicativas, entusiasmadas e que se energizam '
      + 'em grupo; índices baixos indicam preferência por ambientes mais reservados e por interações '
      + 'menores — o que não equivale a timidez nem a dificuldade social.',
    facets: Object.freeze([
      Object.freeze({ n: 1, name: 'Cordialidade', description: 'Facilidade para se aproximar das pessoas, criar vínculo e demonstrar afeto.' }),
      Object.freeze({ n: 2, name: 'Sociabilidade', description: 'Preferência pela companhia de outras pessoas e conforto em grupos maiores.' }),
      Object.freeze({ n: 3, name: 'Assertividade', description: 'Disposição para se posicionar, influenciar e assumir a condução de situações.' }),
      Object.freeze({ n: 4, name: 'Nível de Atividade', description: 'Ritmo de vida acelerado, com muitas frentes acontecendo ao mesmo tempo.' }),
      Object.freeze({ n: 5, name: 'Busca de Estímulo', description: 'Atração por experiências intensas, novidade e situações que geram adrenalina.' }),
      Object.freeze({ n: 6, name: 'Emoções Positivas', description: 'Frequência com que a pessoa experimenta e demonstra alegria, entusiasmo e bom humor.' })
    ])
  }),

  A: Object.freeze({
    key: 'A',
    name: 'Amabilidade',
    short: 'Amabilidade',
    chartLabel: ['Amabilidade'],
    inverted: false,
    tagline: 'Cooperação, confiança e consideração pelo outro.',
    description:
      'A Amabilidade descreve a orientação para a harmonia interpessoal. Índices altos costumam '
      + 'aparecer em pessoas cooperativas, confiantes e atentas às necessidades alheias; índices '
      + 'baixos indicam postura mais competitiva, cética e centrada no próprio ponto de vista — '
      + 'o que pode ser funcional em negociações e decisões difíceis.',
    facets: Object.freeze([
      Object.freeze({ n: 1, name: 'Confiança', description: 'Pressuposto de que as outras pessoas têm boas intenções até que se prove o contrário.' }),
      Object.freeze({ n: 2, name: 'Franqueza', description: 'Sinceridade e transparência nas relações, sem recorrer a manipulação para obter vantagem.' }),
      Object.freeze({ n: 3, name: 'Altruísmo', description: 'Disposição genuína para ajudar e para se envolver com o que acontece com os outros.' }),
      Object.freeze({ n: 4, name: 'Cooperação', description: 'Preferência por acomodar interesses e evitar o confronto direto em situações de atrito.' }),
      Object.freeze({ n: 5, name: 'Modéstia', description: 'Tendência a não se colocar acima dos demais nem chamar atenção para os próprios méritos.' }),
      Object.freeze({ n: 6, name: 'Sensibilidade Social', description: 'Compaixão diante do sofrimento alheio e sensibilidade a questões sociais.' })
    ])
  }),

  N: Object.freeze({
    key: 'N',
    name: 'Estabilidade Emocional',
    short: 'Estabilidade',
    chartLabel: ['Estabilidade'],
    /** O traço medido é Neuroticismo; a exibição usa o eixo invertido. */
    inverted: true,
    measuredName: 'Neuroticismo',
    tagline: 'Regularidade emocional diante de pressão e adversidade.',
    description:
      'Esta dimensão é medida no inventário como Neuroticismo — a tendência a experimentar emoções '
      + 'negativas com mais frequência e intensidade. Nesta plataforma ela é apresentada pelo polo '
      + 'oposto, Estabilidade Emocional, por ser mais compreensível e menos estigmatizante. Um '
      + 'índice alto de estabilidade corresponde a um índice baixo de neuroticismo: reações mais '
      + 'regulares diante de pressão. Um índice mais baixo indica maior reatividade emocional, '
      + 'o que costuma vir acompanhado de sensibilidade a riscos e a sinais do ambiente.',
    facets: Object.freeze([
      Object.freeze({ n: 1, name: 'Ansiedade', description: 'Frequência com que a pessoa antecipa que algo pode dar errado e se mantém em estado de alerta.' }),
      Object.freeze({ n: 2, name: 'Irritabilidade', description: 'Facilidade com que a pessoa sente e expressa raiva diante de contrariedades.' }),
      Object.freeze({ n: 3, name: 'Desânimo', description: 'Tendência a experimentar tristeza, desmotivação ou baixa energia emocional.' }),
      Object.freeze({ n: 4, name: 'Timidez Social', description: 'Desconforto em situações de exposição social e preocupação com o julgamento alheio.' }),
      Object.freeze({ n: 5, name: 'Impulsividade', description: 'Dificuldade em resistir a vontades imediatas e em adiar gratificação.' }),
      Object.freeze({ n: 6, name: 'Vulnerabilidade', description: 'Sensação de ficar sobrecarregado(a) ou sem recursos diante de pressão e imprevistos.' })
    ])
  })
});

/** Devolve os metadados de uma faceta específica, ou null. */
export function getFacetMeta(domainKey, facetNumber) {
  const dominio = DOMAINS[domainKey];
  if (!dominio) return null;
  return dominio.facets.find((f) => f.n === facetNumber) || null;
}

/** Nome de exibição do domínio (para N, o nome do polo apresentado). */
export function getDomainName(domainKey) {
  return DOMAINS[domainKey] ? DOMAINS[domainKey].name : domainKey;
}
