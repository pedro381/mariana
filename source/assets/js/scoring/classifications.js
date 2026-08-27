/**
 * Faixas de classificação e transformação de escala.
 *
 * Todos os limites usados pela plataforma estão declarados aqui, em um só
 * lugar, para que possam ser revisados sem caçar números soltos pelo código.
 *
 * IMPORTANTE — o que é e o que NÃO é o índice:
 *
 *   score bruto   — soma das respostas corrigidas dos itens (dado medido).
 *   média         — score bruto dividido pelo número de itens, de 1 a 5.
 *   índice        — a média reposicionada linearmente na faixa 0 a 100.
 *                   É apenas uma mudança de escala do próprio resultado,
 *                   não uma comparação com outras pessoas.
 *   classificação — a faixa textual em que o índice cai.
 *   percentil     — NÃO é calculado nesta versão. Um percentil exige uma
 *                   população normativa validada para o público avaliado, o
 *                   que esta plataforma ainda não possui. Nada aqui deve ser
 *                   apresentado como percentil.
 */

/** Menor e maior valor possível de uma resposta individual. */
export const MIN_ANSWER = 1;
export const MAX_ANSWER = 5;

/**
 * Converte a média (1..5) para o índice de 0 a 100.
 * média 1 → 0 · média 3 → 50 · média 5 → 100
 */
export function meanToIndex(mean) {
  const bruto = ((mean - MIN_ANSWER) / (MAX_ANSWER - MIN_ANSWER)) * 100;
  return Math.round(bruto * 10) / 10;
}

/** Inverte um índice no mesmo eixo (usado para Estabilidade Emocional). */
export function invertIndex(index) {
  return Math.round((100 - index) * 10) / 10;
}

/**
 * Faixas de classificação, sobre o índice 0–100.
 * `min` é inclusivo e `max` é exclusivo, exceto na última faixa.
 */
export const BANDS = Object.freeze([
  Object.freeze({ id: 'baixo', label: 'Baixo', labelF: 'Baixa', min: 0, max: 30, tone: 'low' }),
  Object.freeze({ id: 'moderadamente-baixo', label: 'Moderadamente baixo', labelF: 'Moderadamente baixa', min: 30, max: 45, tone: 'mid-low' }),
  Object.freeze({ id: 'intermediario', label: 'Intermediário', labelF: 'Intermediária', min: 45, max: 56, tone: 'mid' }),
  Object.freeze({ id: 'moderadamente-alto', label: 'Moderadamente alto', labelF: 'Moderadamente alta', min: 56, max: 71, tone: 'mid-high' }),
  Object.freeze({ id: 'alto', label: 'Alto', labelF: 'Alta', min: 71, max: 100.0001, tone: 'high' })
]);

/** Devolve a faixa correspondente a um índice de 0 a 100. */
export function classify(index) {
  const valor = Math.max(0, Math.min(100, index));
  return BANDS.find((faixa) => valor >= faixa.min && valor < faixa.max) || BANDS[BANDS.length - 1];
}

/**
 * Agrupamento grosso usado pelas regras de interpretação.
 * Reduz as cinco faixas a três níveis: 'baixo' | 'medio' | 'alto'.
 */
export function coarseLevel(index) {
  const faixa = classify(index);
  if (faixa.id === 'baixo' || faixa.id === 'moderadamente-baixo') return 'baixo';
  if (faixa.id === 'alto' || faixa.id === 'moderadamente-alto') return 'alto';
  return 'medio';
}

/** Distância do índice em relação ao ponto médio da escala (0 a 50). */
export function distanceFromCenter(index) {
  return Math.abs(index - 50);
}

/**
 * Um resultado é considerado "marcante" quando se afasta o suficiente do
 * centro para sustentar uma afirmação interpretativa. Usado para decidir
 * quais pontos fortes e pontos de atenção entram no relatório.
 */
export const SALIENCE_THRESHOLD = 15;

export function isSalient(index) {
  return distanceFromCenter(index) >= SALIENCE_THRESHOLD;
}
