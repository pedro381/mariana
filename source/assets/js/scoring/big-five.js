/**
 * Camada Big Five: aplica o motor de scoring ao IPIP-NEO-120 e devolve um
 * resultado nomeado, pronto para o gerador de relatório.
 *
 * Continua sem depender de DOM. Uso:
 *
 *   import { calculateBigFive } from './scoring/big-five.js';
 *   const resultado = calculateBigFive(respostas);
 */

import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions.js';
import { DOMAINS, DOMAIN_ORDER, getFacetMeta } from '../data/domains.js';
import { processAnswers, findMissingAnswers } from './scoring-engine.js';
import { classify, invertIndex, coarseLevel, MIN_ANSWER, MAX_ANSWER } from './classifications.js';

export const SCORING_VERSION = '1.0.0';

/**
 * Calcula o perfil Big Five a partir do mapa de respostas.
 *
 * @param {Object} answers mapa { [questionId]: 1..5 } com os 120 itens
 * @returns {Object} resultado completo, serializável em JSON
 */
export function calculateBigFive(answers) {
  const faltantes = findMissingAnswers(QUESTIONS, answers || {});
  if (faltantes.length > 0) {
    const erro = new Error(`Avaliação incompleta: ${faltantes.length} de ${TOTAL_QUESTIONS} itens sem resposta válida.`);
    erro.code = 'INCOMPLETE';
    erro.missing = faltantes.map((q) => ({ id: q.id, num: q.num }));
    throw erro;
  }

  const agregados = processAnswers(QUESTIONS, answers);

  const domains = DOMAIN_ORDER.map((chave) => {
    const meta = DOMAINS[chave];
    const bruto = agregados[chave];

    /**
     * `measuredIndex` é sempre o índice do traço como o inventário o mede
     * (para N, Neuroticismo). `index` é o índice na direção apresentada ao
     * participante (para N, Estabilidade Emocional). Para os demais domínios
     * os dois valores são iguais.
     */
    const measuredIndex = bruto.index;
    const index = meta.inverted ? invertIndex(measuredIndex) : measuredIndex;
    const band = classify(index);

    const facets = meta.facets.map((facetaMeta) => {
      const facetaBruta = bruto.facets[facetaMeta.n];
      return {
        n: facetaMeta.n,
        name: facetaMeta.name,
        description: facetaMeta.description,
        raw: facetaBruta.raw,
        count: facetaBruta.count,
        mean: facetaBruta.mean,
        /** Facetas de N permanecem na direção medida (neuroticismo). */
        index: facetaBruta.index,
        band: facetaBruta.band,
        level: coarseLevel(facetaBruta.index),
        measuredDirection: meta.inverted ? 'neuroticismo' : 'direto'
      };
    });

    return {
      key: chave,
      name: meta.name,
      short: meta.short,
      chartLabel: meta.chartLabel || [meta.short],
      tagline: meta.tagline,
      description: meta.description,
      inverted: Boolean(meta.inverted),
      measuredName: meta.measuredName || meta.name,
      raw: bruto.raw,
      count: bruto.count,
      mean: bruto.mean,
      measuredIndex,
      index,
      band,
      level: coarseLevel(index),
      facets
    };
  });

  const byKey = Object.create(null);
  domains.forEach((d) => { byKey[d.key] = d; });

  return {
    scoringVersion: SCORING_VERSION,
    instrument: 'IPIP-NEO-120',
    model: 'Big Five / Five-Factor Model',
    answeredCount: TOTAL_QUESTIONS,
    scale: { min: MIN_ANSWER, max: MAX_ANSWER },
    domains,
    byKey,
    /** Índices no formato compacto, útil para e-mail e depuração. */
    indexes: domains.reduce((mapa, d) => {
      mapa[d.key] = d.index;
      return mapa;
    }, Object.create(null))
  };
}

/** Atalho de leitura: índice apresentado de um domínio. */
export function indexOf(result, domainKey) {
  return result.byKey[domainKey] ? result.byKey[domainKey].index : null;
}

/** Atalho de leitura: índice de uma faceta (direção medida). */
export function facetIndexOf(result, domainKey, facetNumber) {
  const dominio = result.byKey[domainKey];
  if (!dominio) return null;
  const faceta = dominio.facets.find((f) => f.n === facetNumber);
  return faceta ? faceta.index : null;
}

/** Metadados de faceta, reexportado por conveniência das camadas superiores. */
export { getFacetMeta };
