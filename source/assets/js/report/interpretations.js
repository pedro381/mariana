/**
 * Banco de interpretações do relatório.
 *
 * Todo o texto interpretativo da plataforma está aqui, separado da lógica que
 * o seleciona (`report-generator.js`) e de quem o desenha (`report-view.js`).
 *
 * Regras de escrita seguidas em todos os textos deste arquivo:
 * - linguagem probabilística: "seus resultados sugerem", "você tende a",
 *   "é provável que", "em determinados contextos";
 * - nunca "você é", "você sempre", "você nunca";
 * - nada de rótulo clínico, diagnóstico ou juízo de valor sobre a pessoa;
 * - todo texto é ancorado em uma dimensão ou faceta efetivamente medida.
 *
 * Níveis usados como chave: 'baixo' | 'medio' | 'alto', vindos de
 * `classifications.coarseLevel()`.
 *
 * Atenção ao domínio N: os textos de domínio descrevem a ESTABILIDADE
 * EMOCIONAL (eixo apresentado). Os textos de faceta de N descrevem o eixo
 * MEDIDO (neuroticismo), coerentes com o índice exibido em cada faceta.
 */

/* ------------------------------------------------------------------ *
 *  Dimensões
 * ------------------------------------------------------------------ */

export const DOMAIN_TEXTS = Object.freeze({
  O: Object.freeze({
    alto: {
      meaning:
        'Seus resultados sugerem forte atração por ideias, possibilidades e experiências novas. '
        + 'É provável que você se interesse por temas variados, goste de examinar um problema por '
        + 'ângulos diferentes e se incomode com rotinas que não mudam nunca.',
      strengths: [
        'geração de alternativas quando o caminho conhecido não resolve',
        'facilidade para aprender assuntos novos por interesse próprio',
        'leitura de cenários e conexão entre temas aparentemente distantes'
      ],
      watchouts: [
        'o interesse por novidade pode competir com a conclusão do que já está em andamento',
        'em ambientes muito padronizados, a busca por alternativas pode ser lida como resistência ao processo'
      ],
      contexts: [
        'projetos em fase de concepção, em que ainda não existe um caminho definido',
        'situações que exigem repensar um método que deixou de funcionar'
      ]
    },
    medio: {
      meaning:
        'Seus resultados sugerem equilíbrio entre o gosto pelo novo e a valorização do que já '
        + 'funciona. É provável que você acolha mudanças quando enxerga um ganho concreto, sem '
        + 'buscar novidade como um fim em si.',
      strengths: [
        'abertura a mudanças sem abrir mão de critérios práticos',
        'trânsito entre discussões conceituais e execução concreta'
      ],
      watchouts: [
        'em contextos que pedem uma posição clara entre inovar e preservar, pode ser preciso decidir de forma mais explícita'
      ],
      contexts: [
        'times mistos, em que conviver com perfis muito criativos e muito operacionais é rotina'
      ]
    },
    baixo: {
      meaning:
        'Seus resultados sugerem preferência pelo concreto, pelo comprovado e pelo que já '
        + 'demonstrou funcionar. É provável que você avalie propostas novas com critério e '
        + 'valorize estabilidade de método.',
      strengths: [
        'consistência na aplicação de métodos já validados',
        'foco no que é aplicável, com pouca dispersão',
        'senso crítico diante de modismos e propostas sem lastro'
      ],
      watchouts: [
        'em cenários de mudança acelerada, pode ser necessário um esforço maior para considerar caminhos ainda não testados',
        'ideias apresentadas de forma abstrata podem parecer pouco úteis antes de virarem exemplo concreto'
      ],
      contexts: [
        'operações que dependem de padronização e repetição confiável',
        'ambientes regulados, em que sair do procedimento tem custo alto'
      ]
    }
  }),

  C: Object.freeze({
    alto: {
      meaning:
        'Seus resultados sugerem forte orientação para organização, método e cumprimento do que '
        + 'foi combinado. É provável que você planeje antes de agir, acompanhe o próprio '
        + 'progresso e tenha desconforto com pendências em aberto.',
      strengths: [
        'planejamento e desdobramento de objetivos em etapas',
        'confiabilidade no cumprimento de prazos e combinados',
        'persistência em tarefas longas, mesmo sem retorno imediato'
      ],
      watchouts: [
        'em ambientes altamente imprevisíveis, a preferência por planejamento pode exigir um esforço maior de adaptação',
        'o padrão elevado que você aplica a si mesmo(a) pode ser projetado sobre outras pessoas',
        'delegar pode custar mais quando o resultado depende de um jeito específico de fazer'
      ],
      contexts: [
        'entregas com prazo, escopo e responsabilidade definidos',
        'processos que exigem rastreabilidade e consistência ao longo do tempo'
      ]
    },
    medio: {
      meaning:
        'Seus resultados sugerem um funcionamento organizado o suficiente para dar conta do que '
        + 'você assume, com espaço para flexibilidade quando o contexto muda. É provável que você '
        + 'estruture o que é crítico sem tentar controlar cada detalhe.',
      strengths: [
        'equilíbrio entre planejar e reagir ao que aparece',
        'capacidade de priorizar o que precisa de método e o que pode fluir'
      ],
      watchouts: [
        'em períodos de sobrecarga, o que não estiver explicitamente estruturado tende a ser o primeiro a escapar'
      ],
      contexts: [
        'rotinas que combinam entregas planejadas e demandas não previstas'
      ]
    },
    baixo: {
      meaning:
        'Seus resultados sugerem um estilo mais espontâneo e flexível do que estruturado. É '
        + 'provável que você trabalhe bem quando pode responder ao momento, e sinta mais atrito '
        + 'com controles rígidos, listas longas e prazos fragmentados.',
      strengths: [
        'adaptação rápida quando o plano precisa ser abandonado',
        'menor desgaste diante de mudanças de rota e imprevistos',
        'disposição para começar sem que tudo esteja definido'
      ],
      watchouts: [
        'tarefas longas e pouco estimulantes podem exigir apoio externo de estrutura para chegarem ao fim',
        'combinados sem registro tendem a se perder com mais facilidade'
      ],
      contexts: [
        'ambientes dinâmicos, com prioridades que mudam com frequência',
        'atividades em que velocidade de resposta pesa mais que padronização'
      ]
    }
  }),

  E: Object.freeze({
    alto: {
      meaning:
        'Seus resultados sugerem que a interação social é uma fonte de energia para você. É '
        + 'provável que você se aproxime das pessoas com facilidade, se posicione em grupo e '
        + 'prefira ambientes com movimento e conversa.',
      strengths: [
        'articulação e abertura de canais de diálogo entre pessoas',
        'disposição para se posicionar e conduzir conversas difíceis',
        'energia visível, que costuma mobilizar quem está por perto'
      ],
      watchouts: [
        'em atividades que pedem concentração isolada e prolongada, pode ser preciso criar condições para sustentar o foco',
        'a presença marcante em grupo pode, sem intenção, ocupar o espaço de pessoas mais reservadas'
      ],
      contexts: [
        'situações de negociação, apresentação e articulação entre áreas',
        'início de projetos, quando é preciso mobilizar pessoas rapidamente'
      ]
    },
    medio: {
      meaning:
        'Seus resultados sugerem trânsito confortável entre o convívio e o recolhimento. É '
        + 'provável que você participe de grupos sem que isso seja sua principal fonte de '
        + 'energia, e que preserve espaços de trabalho individual.',
      strengths: [
        'adaptação tanto a trabalho em grupo quanto a trabalho individual',
        'presença em reuniões sem necessidade de ocupar o centro'
      ],
      watchouts: [
        'em ambientes muito ruidosos socialmente, sua contribuição pode passar despercebida se não for oferecida ativamente'
      ],
      contexts: [
        'equipes em que se alternam momentos de discussão coletiva e produção individual'
      ]
    },
    baixo: {
      meaning:
        'Seus resultados sugerem preferência por ambientes mais reservados e por interações em '
        + 'menor escala. É provável que você recupere energia em atividades individuais e '
        + 'prefira profundidade a quantidade nas relações. Isso não indica timidez nem '
        + 'dificuldade de relacionamento.',
      strengths: [
        'concentração sustentada em trabalho individual',
        'escuta atenta, com fala mais seletiva e ponderada',
        'relações construídas com profundidade ao longo do tempo'
      ],
      watchouts: [
        'contribuições relevantes podem não chegar ao grupo se não houver espaço estruturado para isso',
        'sequências longas de reuniões e eventos tendem a gerar mais desgaste'
      ],
      contexts: [
        'trabalho analítico, técnico ou de produção que exige silêncio e continuidade',
        'conversas individuais, em que você tende a se expressar com mais facilidade que em plenária'
      ]
    }
  }),

  A: Object.freeze({
    alto: {
      meaning:
        'Seus resultados sugerem forte orientação para a cooperação e para o cuidado com o '
        + 'impacto das próprias ações sobre os outros. É provável que você busque acordo, evite '
        + 'confronto desnecessário e considere o ponto de vista alheio antes de decidir.',
      strengths: [
        'construção de acordos e redução de atrito em situações tensas',
        'disponibilidade genuína para apoiar colegas',
        'ambiente de confiança ao redor, que facilita a colaboração'
      ],
      watchouts: [
        'a busca por harmonia pode adiar conversas necessárias sobre desempenho ou divergência',
        'em negociações, ceder cedo demais pode custar o que era legítimo pedir',
        'assumir demandas dos outros pode comprimir as próprias prioridades'
      ],
      contexts: [
        'times que dependem de confiança e troca constante',
        'situações de mediação, em que reduzir o conflito é o próprio objetivo'
      ]
    },
    medio: {
      meaning:
        'Seus resultados sugerem equilíbrio entre cooperar e defender a própria posição. É '
        + 'provável que você colabore com facilidade e, ao mesmo tempo, sustente uma divergência '
        + 'quando considera que faz sentido.',
      strengths: [
        'colaboração sem abrir mão do próprio ponto de vista',
        'leitura pragmática de quando ceder e quando sustentar'
      ],
      watchouts: [
        'a alternância entre acomodar e confrontar pode parecer inconsistente se os critérios não forem explicitados'
      ],
      contexts: [
        'negociações internas, em que é preciso preservar a relação e o resultado'
      ]
    },
    baixo: {
      meaning:
        'Seus resultados sugerem postura mais direta, analítica e menos condicionada pela busca '
        + 'de aprovação. É provável que você avalie propostas com ceticismo saudável e não tenha '
        + 'grande desconforto em discordar abertamente.',
      strengths: [
        'objetividade em conversas difíceis e em feedbacks',
        'defesa firme de posições e de interesses legítimos',
        'avaliação crítica de propostas antes de aderir a elas'
      ],
      watchouts: [
        'a franqueza pode ser recebida como dureza quando o contexto emocional não é considerado',
        'em times que dependem de coesão, o ceticismo frequente pode ser lido como falta de adesão'
      ],
      contexts: [
        'negociação, auditoria, análise crítica e controle de qualidade',
        'decisões impopulares que precisam ser sustentadas'
      ]
    }
  }),

  /** Textos na direção EXIBIDA: Estabilidade Emocional. */
  N: Object.freeze({
    alto: {
      meaning:
        'Seus resultados sugerem reações emocionais regulares diante de pressão. É provável que '
        + 'você mantenha a clareza em situações tensas, se recupere com relativa rapidez de '
        + 'contratempos e não leve contrariedades para o lado pessoal com frequência.',
      strengths: [
        'estabilidade de comportamento em situações de pressão',
        'recuperação rápida após contratempos',
        'previsibilidade emocional, que costuma tranquilizar quem está ao redor'
      ],
      watchouts: [
        'sinais de desgaste em outras pessoas podem passar despercebidos, já que o próprio limiar de alerta é mais alto',
        'a calma pode ser lida como pouca urgência quando o contexto pede reação visível'
      ],
      contexts: [
        'gestão de crises, incidentes e prazos apertados',
        'situações de conflito em que alguém precisa manter o tom estável'
      ]
    },
    medio: {
      meaning:
        'Seus resultados sugerem um padrão emocional dentro da variação comum: momentos de tensão '
        + 'aparecem diante de pressão real, sem se tornarem a tônica do dia a dia. É provável que '
        + 'a sua reação dependa bastante do contexto e do acúmulo de demandas.',
      strengths: [
        'sensibilidade ao ambiente sem perda de funcionamento',
        'reconhecimento dos próprios limites diante de sobrecarga'
      ],
      watchouts: [
        'em períodos de acúmulo, o desgaste tende a aparecer antes que o sinal seja verbalizado'
      ],
      contexts: [
        'rotinas com picos de pressão intercalados por períodos mais estáveis'
      ]
    },
    baixo: {
      meaning:
        'Seus resultados sugerem maior reatividade emocional: é provável que você perceba tensão, '
        + 'risco e mudança de clima antes das outras pessoas, e que situações de pressão pesem '
        + 'mais. Essa mesma sensibilidade costuma vir acompanhada de atenção fina a sinais que '
        + 'passam despercebidos por perfis mais estáveis.',
      strengths: [
        'percepção antecipada de riscos e de mudanças no clima do ambiente',
        'atenção a detalhes que podem se tornar problema',
        'sensibilidade ao estado emocional das outras pessoas'
      ],
      watchouts: [
        'ambientes de pressão contínua tendem a cobrar mais, e sustentar rotinas de recuperação passa a ser parte do trabalho',
        'a antecipação de cenários negativos pode consumir energia antes de o problema existir'
      ],
      contexts: [
        'atividades que se beneficiam de vigilância e antecipação de falhas',
        'situações em que perceber o não dito faz diferença'
      ]
    }
  })
});

/* ------------------------------------------------------------------ *
 *  Facetas
 *  Chave: <domínio><número da faceta>. Ex.: 'C2' = Ordem.
 *  Para N, os textos descrevem o eixo medido (neuroticismo).
 * ------------------------------------------------------------------ */

export const FACET_TEXTS = Object.freeze({
  /* Abertura à Experiência */
  O1: { alto: 'Você tende a recorrer com facilidade à imaginação e a se envolver com cenários e possibilidades mentais.', medio: 'Você recorre à imaginação quando a situação pede, sem que ela ocupe muito espaço no dia a dia.', baixo: 'Você tende a manter o pensamento no que é concreto e imediatamente aplicável.' },
  O2: { alto: 'A dimensão estética costuma ter peso para você: arte, beleza e forma tendem a ser percebidas e valorizadas.', medio: 'Você reconhece valor em expressões estéticas sem que elas ocupem lugar central.', baixo: 'É provável que expressões artísticas despertem menos interesse do que temas de aplicação prática.' },
  O3: { alto: 'Suas emoções tendem a ser percebidas com nitidez e tratadas como informação legítima para decidir.', medio: 'Você acompanha as próprias emoções com razoável clareza, dando a elas peso moderado.', baixo: 'É provável que você prefira analisar situações por critérios objetivos, dando menos espaço ao registro emocional.' },
  O4: { alto: 'Mudar de rotina, de lugar e de método tende a ser estimulante para você.', medio: 'Você aceita mudanças de rotina quando há motivo, sem buscá-las ativamente.', baixo: 'É provável que você prefira ambientes e rotinas conhecidas, mudando quando há razão clara.' },
  O5: { alto: 'Discussões conceituais e problemas complexos tendem a atrair seu interesse.', medio: 'Você acompanha discussões abstratas quando elas levam a algo aplicável.', baixo: 'É provável que você prefira discussões objetivas a debates teóricos.' },
  O6: { alto: 'Você tende a questionar tradições e normas estabelecidas antes de aderir a elas.', medio: 'Você equilibra respeito ao que está posto e disposição para questionar quando necessário.', baixo: 'É provável que você valorize tradições, hierarquias e formas estabelecidas de organização.' },

  /* Conscienciosidade */
  C1: { alto: 'Você tende a confiar na própria capacidade de dar conta do que assume.', medio: 'Sua confiança na própria capacidade tende a variar conforme o domínio da tarefa.', baixo: 'Diante de tarefas novas ou exigentes, é provável que a dúvida sobre a própria capacidade apareça antes da ação.' },
  C2: { alto: 'Organização de ambiente, materiais e rotina tende a ser importante para o seu funcionamento.', medio: 'Você mantém organizado o que precisa estar, sem transformar a ordem em regra geral.', baixo: 'É provável que você conviva bem com desorganização e não perca desempenho por causa dela.' },
  C3: { alto: 'Combinados e obrigações assumidas tendem a ter peso alto nas suas decisões.', medio: 'Você cumpre o que combina, admitindo exceções quando o contexto justifica.', baixo: 'É provável que você avalie regras e combinados pelo mérito da situação, e não como obrigação em si.' },
  C4: { alto: 'Você tende a se colocar metas exigentes e a investir esforço continuado para alcançá-las.', medio: 'Você busca bons resultados sem transformar a superação em objetivo permanente.', baixo: 'É provável que você prefira um ritmo sustentável a metas de alta exigência.' },
  C5: { alto: 'Iniciar e sustentar tarefas até o fim tende a ser algo que você faz sem depender de estímulo externo.', medio: 'Você sustenta o esforço na maior parte do tempo, com oscilações em tarefas pouco estimulantes.', baixo: 'É provável que começar e retomar tarefas custe mais, especialmente as longas ou pouco atrativas.' },
  C6: { alto: 'Você tende a pensar bem antes de agir e a considerar consequências antes de decidir.', medio: 'Você pondera antes de decidir, sem que isso trave a ação.', baixo: 'É provável que você decida rápido, aceitando o risco de rever depois.' },

  /* Extroversão */
  E1: { alto: 'Aproximar-se de pessoas e criar vínculo tende a acontecer com naturalidade.', medio: 'Você se aproxima das pessoas com relativa facilidade, especialmente em contextos conhecidos.', baixo: 'É provável que a aproximação leve mais tempo, com abertura gradual.' },
  E2: { alto: 'Estar entre pessoas e em grupos maiores tende a ser confortável e estimulante.', medio: 'Você transita entre convívio e recolhimento conforme o momento.', baixo: 'É provável que você prefira grupos pequenos e evite aglomerações.' },
  E3: { alto: 'Você tende a se posicionar, influenciar e assumir a condução quando é preciso.', medio: 'Você se posiciona quando considera necessário, sem buscar a condução por hábito.', baixo: 'É provável que você prefira que outras pessoas conduzam, contribuindo de outra forma.' },
  E4: { alto: 'Seu ritmo tende a ser acelerado, com várias frentes em andamento.', medio: 'Você mantém um ritmo ativo, com espaço para pausas.', baixo: 'É provável que você prefira um ritmo mais tranquilo e menos frentes simultâneas.' },
  E5: { alto: 'Situações intensas e experiências novas tendem a atrair você.', medio: 'Você aprecia novidade em dose moderada, sem buscar risco.', baixo: 'É provável que você prefira previsibilidade a situações de forte estímulo.' },
  E6: { alto: 'Entusiasmo e bom humor tendem a aparecer com frequência no seu dia a dia.', medio: 'Seu humor tende a acompanhar o contexto, com boa regularidade.', baixo: 'É provável que sua expressão emocional seja mais contida, o que não indica ausência de satisfação.' },

  /* Amabilidade */
  A1: { alto: 'Você tende a partir do princípio de que as pessoas têm boas intenções.', medio: 'Sua confiança tende a se construir com base na convivência.', baixo: 'É provável que você avalie intenções com cautela antes de confiar.' },
  A2: { alto: 'Transparência nas relações tende a ser um valor firme para você.', medio: 'Você age com sinceridade, adaptando a forma ao contexto.', baixo: 'É provável que você use mais estratégia na forma de conduzir interesses em jogo.' },
  A3: { alto: 'Ajudar e se envolver com o que acontece com os outros tende a ser algo espontâneo.', medio: 'Você se dispõe a ajudar quando percebe necessidade real.', baixo: 'É provável que você preserve mais o próprio foco antes de assumir demandas alheias.' },
  A4: { alto: 'Você tende a buscar acordo e a evitar confronto direto.', medio: 'Você busca acordo, mas sustenta divergência quando considera relevante.', baixo: 'É provável que você não recue diante do confronto quando julga necessário.' },
  A5: { alto: 'Você tende a não chamar atenção para os próprios méritos.', medio: 'Você reconhece as próprias contribuições sem colocá-las em destaque permanente.', baixo: 'É provável que você reconheça e comunique com clareza o próprio valor.' },
  A6: { alto: 'Situações de sofrimento e desigualdade tendem a mobilizar você.', medio: 'Você se sensibiliza com questões sociais mantendo distância analítica.', baixo: 'É provável que você avalie questões sociais mais por critérios objetivos que por comoção.' },

  /* Neuroticismo — direção medida */
  N1: { alto: 'Você tende a antecipar o que pode dar errado e a permanecer em estado de alerta.', medio: 'Preocupação aparece diante de situações de risco real, sem se tornar constante.', baixo: 'É provável que você mantenha a tranquilidade mesmo diante de incertezas.' },
  N2: { alto: 'Contrariedades tendem a gerar irritação com facilidade.', medio: 'Você se irrita em situações específicas, retomando o equilíbrio depois.', baixo: 'É provável que você tenha bastante tolerância antes de se irritar.' },
  N3: { alto: 'Períodos de desânimo e baixa energia tendem a aparecer com alguma frequência.', medio: 'Momentos de desânimo aparecem em situações difíceis, sem se prolongar.', baixo: 'É provável que seu humor se mantenha estável ao longo do tempo.' },
  N4: { alto: 'Situações de exposição social tendem a gerar desconforto e preocupação com o julgamento alheio.', medio: 'Exposição social gera algum desconforto em situações menos familiares.', baixo: 'É provável que você lide com exposição social com naturalidade.' },
  N5: { alto: 'Resistir a vontades imediatas tende a exigir esforço.', medio: 'Você controla impulsos na maior parte das situações, com exceções pontuais.', baixo: 'É provável que você resista a impulsos com facilidade e adie gratificação sem grande custo.' },
  N6: { alto: 'Situações de pressão acumulada tendem a gerar sensação de sobrecarga.', medio: 'Pressão intensa pesa, sem comprometer o funcionamento na maior parte do tempo.', baixo: 'É provável que você mantenha os recursos disponíveis mesmo sob pressão.' }
});

/** Texto interpretativo de uma faceta. */
export function facetText(domainKey, facetNumber, level) {
  const bloco = FACET_TEXTS[`${domainKey}${facetNumber}`];
  if (!bloco) return '';
  return bloco[level] || bloco.medio || '';
}

/** Bloco interpretativo de uma dimensão. */
export function domainText(domainKey, level) {
  const bloco = DOMAIN_TEXTS[domainKey];
  if (!bloco) return null;
  return bloco[level] || bloco.medio || null;
}
