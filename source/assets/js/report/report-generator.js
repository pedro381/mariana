/**
 * Gerador do relatório comportamental.
 *
 * Recebe o resultado numérico (`calculateBigFive`) e os dados do participante e
 * devolve uma estrutura de dados completa, serializável, com todas as seções do
 * relatório já resolvidas. Não desenha nada: quem desenha é `report-view.js`
 * (tela) e `email-template.js` (e-mail).
 *
 * O relatório inteiro é determinístico: mesmas respostas, mesmo relatório.
 */

import { CONFIG } from '../config.js';
import { classify, coarseLevel, isSalient, distanceFromCenter } from '../scoring/classifications.js';
import { domainText, facetText } from './interpretations.js';
import { facetHighlight } from './highlights.js';
import {
  buildContext, selectRules,
  OVERVIEW_RULES, WORK_RULES, COMMUNICATION_RULES,
  TEAM_RULES, LEADERSHIP_RULES, DECISION_RULES, DEVELOPMENT_RULES
} from './combinations.js';
import { firstName, joinList } from '../utils/formatters.js';

export const REPORT_VERSION = '1.0.0';

/** Quantidades mínimas e máximas por seção. */
const LIMITES = Object.freeze({
  fortes: { min: 3, max: 6 },
  atencao: { min: 2, max: 5 },
  overview: 3,
  trabalho: 5,
  comunicacao: 4,
  equipe: 4,
  lideranca: 4,
  decisao: 4,
  desenvolvimento: 5
});

/**
 * Monta o relatório completo.
 *
 * @param {Object} result       saída de `calculateBigFive`
 * @param {Object} participant  { name, email, phone, company, role }
 * @param {Object} meta         { assessmentId, completedAt }
 */
export function generateReport(result, participant, meta = {}) {
  const p = buildContext(result);
  const nome = firstName(participant && participant.name);

  const dimensoes = result.domains.map((dominio) => buildDomainSection(dominio));

  return {
    reportVersion: REPORT_VERSION,
    generatedAt: meta.completedAt || new Date().toISOString(),
    assessmentId: meta.assessmentId || null,
    instrument: result.instrument,
    model: result.model,
    participant: {
      name: (participant && participant.name) || '',
      firstName: nome,
      email: (participant && participant.email) || '',
      phone: (participant && participant.phone) || '',
      company: (participant && participant.company) || '',
      role: (participant && participant.role) || ''
    },
    indexes: result.indexes,
    overview: buildOverview(result, p, nome),
    dimensions: dimensoes,
    strengths: buildStrengths(result),
    watchouts: buildWatchouts(result),
    sections: [
      { id: 'trabalho', title: 'No ambiente profissional', intro: 'Tendências observadas a partir das dimensões medidas. Nada aqui indica aptidão ou inaptidão para uma função específica.', items: selectRules(WORK_RULES, p, LIMITES.trabalho) },
      { id: 'comunicacao', title: 'Seu estilo de comunicação', intro: 'Leituras derivadas das facetas de assertividade, sociabilidade, cooperação e expressão emocional.', items: selectRules(COMMUNICATION_RULES, p, LIMITES.comunicacao) },
      { id: 'equipe', title: 'Como você tende a trabalhar em equipe', intro: 'Tendências de cooperação, confiança, autonomia e lidar com divergências.', items: selectRules(TEAM_RULES, p, LIMITES.equipe) },
      { id: 'lideranca', title: 'Tendências de liderança', intro: 'Indicadores comportamentais relacionados à liderança. Não constitui avaliação de capacidade de liderar nem recomendação para cargos de gestão.', items: selectRules(LEADERSHIP_RULES, p, LIMITES.lideranca) },
      { id: 'decisao', title: 'Tomada de decisão', intro: 'Como estrutura, prudência, abertura a alternativas e tolerância à incerteza tendem a se combinar nas suas escolhas.', items: selectRules(DECISION_RULES, p, LIMITES.decisao) }
    ],
    development: {
      title: 'Sugestões de desenvolvimento',
      intro: 'Sugestões práticas derivadas dos seus resultados. São caminhos de experimentação, não prescrições.',
      items: selectRules(DEVELOPMENT_RULES, p, LIMITES.desenvolvimento)
    },
    disclaimer: CONFIG.disclaimer,
    methodology: {
      instrument: CONFIG.assessment.instrumentLong,
      questions: result.answeredCount,
      scale: `${result.scale.min} a ${result.scale.max}`,
      note:
        'Os índices apresentados (0 a 100) são uma transformação linear da média das suas '
        + 'respostas em cada dimensão e faceta. Não são percentis: nenhuma comparação com uma '
        + 'população normativa foi realizada.'
    }
  };
}

/* ------------------------------------------------------------------ *
 *  Visão geral
 * ------------------------------------------------------------------ */

function buildOverview(result, p, nome) {
  const ordenadas = [...result.domains].sort(
    (a, b) => distanceFromCenter(b.index) - distanceFromCenter(a.index)
  );

  /*
   * A frase de abertura usa a MESMA régua da classificação exibida e das
   * regras de combinação: uma dimensão "se destaca" quando sai da faixa
   * intermediária. Usar aqui o critério mais estrito de saliência (aplicado
   * aos pontos fortes) faria o resumo dizer que nada se destaca e, na frase
   * seguinte, afirmar "alta extroversão".
   */
  const marcantes = ordenadas.filter((d) => d.level !== 'medio');
  const centrais = ordenadas.filter((d) => d.level === 'medio');
  const combinacoes = selectRules(OVERVIEW_RULES, p, LIMITES.overview);

  return {
    title: 'Seu perfil comportamental',
    greeting: nome ? `${nome}, este é o retrato que os seus resultados desenham.` : 'Este é o retrato que os seus resultados desenham.',
    summary: buildSummarySentence(marcantes, centrais),
    combinations: combinacoes,
    highlightDomains: ordenadas.slice(0, 3).map((d) => ({
      key: d.key, name: d.name, index: d.index, band: d.band.labelF
    }))
  };
}

/**
 * Frase de abertura, construída a partir das dimensões que mais se afastam do
 * centro da escala. Se nenhuma se afasta o bastante, o texto diz exatamente
 * isso em vez de forçar uma caracterização.
 *
 * Só são descritas como "próximas do centro" as dimensões que de fato são —
 * uma dimensão marcante nunca é apresentada como intermediária, mesmo quando
 * fica de fora da lista de destaques por limite de tamanho.
 */
function buildSummarySentence(marcantes, centrais) {
  if (marcantes.length === 0) {
    return 'Seus resultados se distribuem na faixa intermediária nas cinco dimensões. '
      + 'Isso sugere um perfil equilibrado, sem um traço que domine claramente a forma como você '
      + 'costuma agir. Nesses casos, a leitura mais informativa está nas facetas, onde as '
      + 'diferenças individuais aparecem com mais nitidez.';
  }

  const trechos = marcantes.slice(0, MAX_DESTAQUES).map((d) => {
    const nivel = coarseLevel(d.index);
    return `${d.name.toLowerCase()} em nível ${nivel === 'alto' ? 'elevado' : 'mais baixo'}`;
  });

  let texto = `Seus resultados se destacam em ${joinList(trechos)}.`;

  const naoCitadas = marcantes.slice(MAX_DESTAQUES).map((d) => d.name.toLowerCase());
  if (naoCitadas.length > 0) {
    texto += ` ${capitalize(joinList(naoCitadas))} também se afasta${naoCitadas.length > 1 ? 'm' : ''} do centro da escala.`;
  }

  if (centrais.length > 0) {
    const nomes = centrais.map((d) => d.name.toLowerCase());
    texto += centrais.length === 1
      ? ` Já ${nomes[0]} aparece em posição mais próxima do centro da escala, o que sugere maior variação conforme o contexto.`
      : ` Já ${joinList(nomes)} aparecem em posições mais próximas do centro da escala, o que sugere maior variação conforme o contexto.`;
  }

  texto += ' A leitura completa está nas seções seguintes, dimensão por dimensão.';
  return texto;
}

/** Quantas dimensões marcantes são nomeadas na frase de abertura. */
const MAX_DESTAQUES = 3;

/** Maiúscula inicial, para quando o nome de uma dimensão abre a frase. */
function capitalize(texto) {
  if (!texto) return texto;
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

/* ------------------------------------------------------------------ *
 *  Seções por dimensão
 * ------------------------------------------------------------------ */

function buildDomainSection(dominio) {
  const nivel = coarseLevel(dominio.index);
  const texto = domainText(dominio.key, nivel) || { meaning: '', strengths: [], watchouts: [], contexts: [] };

  return {
    key: dominio.key,
    name: dominio.name,
    short: dominio.short,
    chartLabel: dominio.chartLabel,
    tagline: dominio.tagline,
    description: dominio.description,
    inverted: dominio.inverted,
    measuredName: dominio.measuredName,
    raw: dominio.raw,
    count: dominio.count,
    mean: dominio.mean,
    index: dominio.index,
    measuredIndex: dominio.measuredIndex,
    band: dominio.band,
    level: nivel,
    meaning: texto.meaning,
    strengths: texto.strengths,
    watchouts: texto.watchouts,
    contexts: texto.contexts,
    facets: dominio.facets.map((faceta) => ({
      n: faceta.n,
      name: faceta.name,
      description: faceta.description,
      raw: faceta.raw,
      count: faceta.count,
      mean: faceta.mean,
      index: faceta.index,
      band: faceta.band,
      level: faceta.level,
      interpretation: facetText(dominio.key, faceta.n, faceta.level)
    }))
  };
}

/* ------------------------------------------------------------------ *
 *  Pontos fortes e pontos de atenção
 * ------------------------------------------------------------------ */

/**
 * Coleta candidatos a destaque a partir das facetas salientes, ordenados pela
 * distância em relação ao centro da escala — quanto mais extremo o resultado,
 * mais sustentada é a afirmação.
 */
function collectFacetHighlights(result, tipo) {
  const candidatos = [];

  result.domains.forEach((dominio) => {
    dominio.facets.forEach((faceta) => {
      if (!isSalient(faceta.index)) return;
      const nivel = coarseLevel(faceta.index);
      const destaque = facetHighlight(dominio.key, faceta.n, nivel, tipo);
      if (!destaque) return;
      candidatos.push({
        source: `${dominio.key}${faceta.n}`,
        domain: dominio.key,
        domainName: dominio.name,
        facet: faceta.name,
        index: faceta.index,
        label: destaque.label,
        text: destaque.text,
        weight: distanceFromCenter(faceta.index)
      });
    });
  });

  return candidatos.sort(
    (a, b) => (b.weight - a.weight) || a.source.localeCompare(b.source)
  );
}

function buildStrengths(result) {
  const candidatos = collectFacetHighlights(result, 'strength');
  const selecionados = dedupeByLabel(candidatos).slice(0, LIMITES.fortes.max);

  return {
    title: 'Potenciais pontos fortes',
    intro: selecionados.length > 0
      ? 'Características sustentadas pelos resultados mais marcantes da sua avaliação. Cada item indica a faceta de origem.'
      : 'Seus resultados ficaram próximos do centro da escala em todas as facetas, o que sugere um perfil equilibrado. Não há, nesta avaliação, pontos suficientemente marcantes para destacar com segurança.',
    items: selecionados
  };
}

function buildWatchouts(result) {
  const candidatos = collectFacetHighlights(result, 'watch');
  const selecionados = dedupeByLabel(candidatos).slice(0, LIMITES.atencao.max);

  return {
    title: 'Pontos de atenção',
    intro:
      'Não se trata de defeitos nem de fraquezas. São situações em que as suas tendências mais '
      + 'marcantes podem exigir mais esforço ou atenção, dependendo do contexto.',
    empty: 'Nenhum resultado desta avaliação se afasta o bastante do centro da escala para justificar um ponto de atenção específico.',
    items: selecionados
  };
}

/** Evita dois destaques com o mesmo rótulo no relatório. */
function dedupeByLabel(itens) {
  const vistos = new Set();
  return itens.filter((item) => {
    if (vistos.has(item.label)) return false;
    vistos.add(item.label);
    return true;
  });
}

/** Reexportado para uso da camada de visualização. */
export { classify };
