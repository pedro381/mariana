/**
 * Motor de scoring genérico — puro, sem qualquer dependência de DOM.
 *
 * Recebe um banco de itens e um mapa de respostas e devolve os agregados por
 * domínio e por faceta. Não conhece Big Five nem nomes de traços: essa camada
 * está em `big-five.js`. É aqui que um instrumento futuro (HEXACO, DISC, SJT)
 * poderia ser plugado sem reescrever a aplicação.
 *
 * Determinismo: as mesmas respostas produzem sempre exatamente o mesmo
 * resultado. Nada aqui depende de data, aleatoriedade ou estado externo.
 */

import { MIN_ANSWER, MAX_ANSWER, meanToIndex, classify } from './classifications.js';

/**
 * Corrige a resposta bruta conforme a direção do item.
 *
 * Itens `plus` mantêm o valor. Itens `minus` são invertidos na escala:
 * 1→5, 2→4, 3→3, 4→2, 5→1, ou seja, (MIN + MAX) − resposta.
 *
 * É exatamente o que a fonte faz: no `ipip-neo-120` a inversão está embutida
 * nas opções de resposta (`choices.minus` já entrega 5 para "Discordo
 * totalmente"). Aqui a resposta bruta é preservada no estado e a inversão
 * acontece no cálculo — o que permite reexibir a escolha original do
 * participante ao voltar em uma pergunta.
 */
export function scoreAnswer(rawAnswer, keyed) {
  if (keyed === 'minus') return (MIN_ANSWER + MAX_ANSWER) - rawAnswer;
  return rawAnswer;
}

/** Valida uma resposta bruta: inteiro entre 1 e 5. */
export function isValidAnswer(value) {
  return Number.isInteger(value) && value >= MIN_ANSWER && value <= MAX_ANSWER;
}

/**
 * Processa um conjunto de respostas.
 *
 * @param {Array} questions  itens { id, domain, facet, keyed }
 * @param {Object} answers   mapa { [questionId]: 1..5 }
 * @returns {Object} agregados por domínio, cada um com suas facetas
 * @throws {Error} se alguma resposta obrigatória faltar ou for inválida
 */
export function processAnswers(questions, answers) {
  const dominios = Object.create(null);

  questions.forEach((item) => {
    const bruta = answers[item.id];

    if (bruta === undefined || bruta === null) {
      throw new Error(`Resposta ausente para o item ${item.id} (questão ${item.num}).`);
    }
    if (!isValidAnswer(bruta)) {
      throw new Error(`Resposta inválida (${bruta}) no item ${item.id}: esperado inteiro de ${MIN_ANSWER} a ${MAX_ANSWER}.`);
    }

    const corrigido = scoreAnswer(bruta, item.keyed);

    if (!dominios[item.domain]) {
      dominios[item.domain] = { key: item.domain, raw: 0, count: 0, facets: Object.create(null) };
    }
    const dominio = dominios[item.domain];
    dominio.raw += corrigido;
    dominio.count += 1;

    if (item.facet === undefined || item.facet === null) return;

    if (!dominio.facets[item.facet]) {
      dominio.facets[item.facet] = { n: item.facet, raw: 0, count: 0 };
    }
    const faceta = dominio.facets[item.facet];
    faceta.raw += corrigido;
    faceta.count += 1;
  });

  Object.values(dominios).forEach((dominio) => {
    finalize(dominio);
    Object.values(dominio.facets).forEach(finalize);
  });

  return dominios;
}

/** Calcula média, índice e classificação de um agregado já somado. */
function finalize(agregado) {
  agregado.mean = Math.round((agregado.raw / agregado.count) * 1000) / 1000;
  agregado.index = meanToIndex(agregado.mean);
  agregado.band = classify(agregado.index);
  return agregado;
}

/**
 * Lista os itens sem resposta válida, na ordem canônica.
 * Usado para bloquear a conclusão e levar o participante ao que faltou.
 */
export function findMissingAnswers(questions, answers) {
  return questions.filter((item) => !isValidAnswer(answers[item.id]));
}
