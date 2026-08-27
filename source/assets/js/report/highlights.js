/**
 * Destaques por faceta: matéria-prima das seções "Potenciais pontos fortes" e
 * "Pontos de atenção".
 *
 * Para cada faceta há, quando aplicável, uma leitura do polo alto e uma do polo
 * baixo. Os dois polos podem gerar ponto forte — não existe lado "bom" e lado
 * "ruim" da escala. `null` significa que aquele polo não sustenta afirmação
 * suficientemente específica para entrar no relatório.
 *
 * Cada entrada é composta por:
 *   label — o nome curto do ponto (o que aparece em negrito)
 *   text  — a frase que o explica, sempre em linguagem probabilística
 *
 * Regra de uso: um destaque só é exibido quando o índice da faceta é saliente
 * (ver `classifications.isSalient`). Nada é afirmado a partir de resultados
 * próximos do centro da escala.
 *
 * Atenção: as facetas de N estão na direção MEDIDA (neuroticismo). "alto"
 * significa mais ansiedade, mais irritabilidade, e assim por diante.
 */

export const FACET_HIGHLIGHTS = Object.freeze({
  /* ---------------- Abertura à Experiência ---------------- */
  O1: {
    alto: { strength: { label: 'Pensamento associativo', text: 'seus resultados sugerem facilidade para imaginar possibilidades e conectar ideias que não estão obviamente relacionadas' }, watch: null },
    baixo: { strength: { label: 'Foco no concreto', text: 'seus resultados sugerem pouca dispersão e atenção voltada ao que é diretamente aplicável' }, watch: null }
  },
  O2: {
    alto: { strength: { label: 'Sensibilidade estética', text: 'você tende a perceber forma, estética e beleza onde outras pessoas passam direto' }, watch: null },
    baixo: { strength: null, watch: null }
  },
  O3: {
    alto: { strength: { label: 'Leitura emocional', text: 'você tende a usar o que sente e o que percebe nos outros como informação legítima para decidir' }, watch: null },
    baixo: { strength: { label: 'Análise desapegada', text: 'você tende a avaliar situações por critérios objetivos, com menos interferência do clima emocional' }, watch: null }
  },
  O4: {
    alto: { strength: { label: 'Adaptação a mudanças', text: 'mudanças de rota e ambientes novos tendem a exigir pouco esforço de reacomodação' }, watch: { label: 'Continuidade', text: 'a atração por novidade pode competir com o que já está em andamento e ainda precisa ser concluído' } },
    baixo: { strength: { label: 'Consistência de método', text: 'você tende a manter padrões estáveis de trabalho ao longo do tempo' }, watch: { label: 'Contextos instáveis', text: 'em ambientes de mudança frequente, sua preferência por rotinas conhecidas pode exigir um esforço maior de adaptação' } }
  },
  O5: {
    alto: { strength: { label: 'Raciocínio abstrato', text: 'problemas conceituais e discussões complexas tendem a mobilizar você em vez de cansar' }, watch: null },
    baixo: { strength: { label: 'Objetividade prática', text: 'você tende a levar a conversa rapidamente para o que é aplicável' }, watch: null }
  },
  O6: {
    alto: { strength: { label: 'Questionamento construtivo', text: 'você tende a examinar normas e práticas estabelecidas em vez de aceitá-las por inércia' }, watch: null },
    baixo: { strength: { label: 'Respeito ao acordado', text: 'você tende a valorizar estruturas, tradições e formas estabelecidas de organização' }, watch: null }
  },

  /* ---------------- Conscienciosidade ---------------- */
  C1: {
    alto: { strength: { label: 'Confiança na execução', text: 'você tende a assumir compromissos acreditando que dará conta, e isso costuma se confirmar' }, watch: null },
    baixo: { strength: null, watch: { label: 'Confiança na própria capacidade', text: 'diante de tarefas novas, a dúvida sobre dar conta pode aparecer antes da ação e atrasar o início' } }
  },
  C2: {
    alto: { strength: { label: 'Organização', text: 'manter ambiente, materiais e informação em ordem tende a ser parte natural do seu funcionamento' }, watch: null },
    baixo: { strength: { label: 'Tolerância à desordem', text: 'você tende a produzir bem mesmo em contextos pouco organizados' }, watch: { label: 'Rastreabilidade', text: 'informações e combinados sem registro tendem a se perder com mais facilidade' } }
  },
  C3: {
    alto: { strength: { label: 'Confiabilidade', text: 'o que você combina tende a ser cumprido, e isso costuma ser percebido por quem trabalha com você' }, watch: null },
    baixo: { strength: { label: 'Leitura situacional de regras', text: 'você tende a avaliar normas pelo mérito da situação em vez de aplicá-las automaticamente' }, watch: { label: 'Previsibilidade para o grupo', text: 'quando combinados são tratados caso a caso, quem depende deles pode ter dificuldade em se planejar' } }
  },
  C4: {
    alto: { strength: { label: 'Orientação a resultado', text: 'metas exigentes tendem a mobilizar você e a sustentar seu esforço ao longo do tempo' }, watch: { label: 'Ritmo sustentável', text: 'a exigência elevada que você aplica a si mesmo(a) pode se acumular sem que o sinal apareça cedo' } },
    baixo: { strength: { label: 'Ritmo equilibrado', text: 'você tende a preservar um ritmo sustentável em vez de operar em exigência constante' }, watch: null }
  },
  C5: {
    alto: { strength: { label: 'Persistência', text: 'você tende a sustentar tarefas longas sem depender de estímulo externo constante' }, watch: null },
    baixo: { strength: null, watch: { label: 'Largada das tarefas', text: 'iniciar e retomar atividades pouco estimulantes tende a custar mais, o que pode acumular pendências' } }
  },
  C6: {
    alto: { strength: { label: 'Prudência', text: 'você tende a considerar consequências antes de decidir, o que reduz erros custosos' }, watch: { label: 'Janelas curtas', text: 'quando o tempo de decisão é curto, a busca por mais informação pode custar a oportunidade' } },
    baixo: { strength: { label: 'Agilidade decisória', text: 'você tende a decidir rápido e ajustar o curso na sequência' }, watch: { label: 'Decisões difíceis de reverter', text: 'decidir no impulso tem custo alto quando a escolha é difícil de desfazer' } }
  },

  /* ---------------- Extroversão ---------------- */
  E1: {
    alto: { strength: { label: 'Facilidade de vínculo', text: 'aproximar-se de pessoas e criar relação tende a acontecer com naturalidade' }, watch: null },
    baixo: { strength: { label: 'Vínculos seletivos', text: 'você tende a construir poucas relações, com profundidade' }, watch: null }
  },
  E2: {
    alto: { strength: { label: 'Conforto em grupo', text: 'ambientes com muitas pessoas tendem a ser fonte de energia' }, watch: null },
    baixo: { strength: { label: 'Trabalho concentrado', text: 'você tende a sustentar concentração em atividades individuais por períodos longos' }, watch: { label: 'Agenda social intensa', text: 'sequências longas de reuniões e eventos tendem a cobrar um tempo maior de recuperação' } }
  },
  E3: {
    alto: { strength: { label: 'Assertividade', text: 'você tende a se posicionar com clareza e a assumir a condução quando é necessário' }, watch: { label: 'Espaço para os outros', text: 'sua presença em grupo pode, sem intenção, ocupar o espaço de pessoas mais reservadas' } },
    baixo: { strength: null, watch: { label: 'Visibilidade da contribuição', text: 'boas contribuições podem chegar tarde à discussão quando o posicionamento demora a acontecer' } }
  },
  E4: {
    alto: { strength: { label: 'Energia e iniciativa', text: 'você tende a manter várias frentes em movimento e a começar as coisas sem esperar' }, watch: null },
    baixo: { strength: { label: 'Ritmo constante', text: 'você tende a trabalhar em ritmo estável, sem oscilações bruscas de intensidade' }, watch: null }
  },
  E5: {
    alto: { strength: null, watch: { label: 'Exposição a risco', text: 'a atração por situações intensas pede atenção quando a decisão envolve risco real' } },
    baixo: { strength: { label: 'Previsibilidade', text: 'você tende a preferir caminhos conhecidos, o que reduz exposição desnecessária' }, watch: null }
  },
  E6: {
    alto: { strength: { label: 'Entusiasmo', text: 'seu ânimo tende a ser visível e a mobilizar quem está por perto' }, watch: null },
    baixo: { strength: { label: 'Sobriedade', text: 'sua expressão tende a ser contida, o que costuma transmitir seriedade e constância' }, watch: null }
  },

  /* ---------------- Amabilidade ---------------- */
  A1: {
    alto: { strength: { label: 'Disposição para confiar', text: 'você tende a partir do princípio de que as pessoas têm boas intenções, o que facilita delegar' }, watch: null },
    baixo: { strength: { label: 'Verificação', text: 'você tende a checar antes de confiar, o que reduz exposição a riscos' }, watch: { label: 'Percepção de controle', text: 'o acompanhamento próximo pode ser sentido como desconfiança por quem é acompanhado' } }
  },
  A2: {
    alto: { strength: { label: 'Transparência', text: 'você tende a conduzir relações de forma direta, sem recorrer a jogo de interesses' }, watch: null },
    baixo: { strength: null, watch: null }
  },
  A3: {
    alto: { strength: { label: 'Disponibilidade', text: 'você tende a se envolver com o que acontece com as outras pessoas e a oferecer apoio' }, watch: { label: 'Prioridades próprias', text: 'assumir demandas dos outros pode comprimir o espaço das suas próprias entregas' } },
    baixo: { strength: { label: 'Preservação de foco', text: 'você tende a manter o próprio foco antes de absorver demandas alheias' }, watch: null }
  },
  A4: {
    alto: { strength: { label: 'Construção de acordo', text: 'você tende a reduzir atrito e a encontrar caminhos que acomodem interesses diferentes' }, watch: { label: 'Conversas adiadas', text: 'a busca por harmonia pode adiar conversas necessárias sobre divergência ou desempenho' } },
    baixo: { strength: { label: 'Firmeza', text: 'você tende a sustentar posições mesmo quando isso gera desconforto' }, watch: { label: 'Desgaste acumulado', text: 'o enfrentamento direto e frequente pode acumular desgaste nas relações' } }
  },
  A5: {
    alto: { strength: { label: 'Modéstia', text: 'você tende a não disputar espaço nem autoria, o que costuma tornar a discussão mais produtiva' }, watch: { label: 'Reconhecimento', text: 'sua contribuição pode ser reconhecida mais tarde do que efetivamente acontece' } },
    baixo: { strength: { label: 'Clareza sobre o próprio valor', text: 'você tende a comunicar com naturalidade aquilo que entrega' }, watch: null }
  },
  A6: {
    alto: { strength: { label: 'Sensibilidade social', text: 'situações de sofrimento e desigualdade tendem a mobilizar você de forma concreta' }, watch: null },
    baixo: { strength: { label: 'Distância analítica', text: 'você tende a avaliar situações difíceis sem que a comoção altere o critério' }, watch: null }
  },

  /* ---------------- Neuroticismo (direção medida) ---------------- */
  N1: {
    alto: { strength: { label: 'Antecipação de riscos', text: 'você tende a perceber cedo o que pode dar errado, o que ajuda a evitar problemas' }, watch: { label: 'Custo da antecipação', text: 'antecipar cenários improváveis pode consumir energia antes de o problema existir' } },
    baixo: { strength: { label: 'Tranquilidade diante da incerteza', text: 'cenários indefinidos tendem a gerar pouco desconforto' }, watch: null }
  },
  N2: {
    alto: { strength: null, watch: { label: 'Reação a contrariedades', text: 'a irritação tende a aparecer rápido, o que pode encurtar conversas que precisariam de mais tempo' } },
    baixo: { strength: { label: 'Tolerância', text: 'você tende a manter a calma diante de contrariedades e provocações' }, watch: null }
  },
  N3: {
    alto: { strength: null, watch: { label: 'Oscilação de energia', text: 'períodos de desânimo tendem a aparecer e podem afetar o ritmo por algum tempo' } },
    baixo: { strength: { label: 'Regularidade de humor', text: 'seu ânimo tende a se manter estável ao longo do tempo' }, watch: null }
  },
  N4: {
    alto: { strength: null, watch: { label: 'Exposição social', text: 'situações de exposição tendem a gerar desconforto, o que pode reduzir sua presença em momentos importantes' } },
    baixo: { strength: { label: 'Naturalidade sob observação', text: 'situações de exposição social tendem a ser conduzidas com naturalidade' }, watch: null }
  },
  N5: {
    alto: { strength: null, watch: { label: 'Controle de impulso', text: 'resistir a vontades imediatas tende a exigir esforço, o que pesa em decisões tomadas no calor do momento' } },
    baixo: { strength: { label: 'Autocontrole', text: 'você tende a adiar gratificação e a resistir a impulsos sem grande custo' }, watch: null }
  },
  N6: {
    alto: { strength: null, watch: { label: 'Acúmulo de pressão', text: 'situações de pressão contínua tendem a gerar sensação de sobrecarga, e rotinas de recuperação fazem diferença real' } },
    baixo: { strength: { label: 'Recursos sob pressão', text: 'você tende a manter clareza e capacidade de resposta mesmo em situações difíceis' }, watch: null }
  }
});

/** Destaque de uma faceta em um polo específico. */
export function facetHighlight(domainKey, facetNumber, level, tipo) {
  const bloco = FACET_HIGHLIGHTS[`${domainKey}${facetNumber}`];
  if (!bloco || !bloco[level]) return null;
  return bloco[level][tipo] || null;
}
