/**
 * Regras de navegação do questionário — lógica pura, sem DOM.
 *
 * Mantida separada do controlador para poder ser testada isoladamente e para
 * que a decisão "para onde ir agora" fique num só lugar.
 */

import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions.js';
import { isValidAnswer } from '../scoring/scoring-engine.js';

/** Converte o número da questão (1..120) em índice de array. */
export function toIndex(numero) {
  return clampNumber(numero) - 1;
}

export function clampNumber(numero) {
  const n = Number(numero) || 1;
  return Math.min(TOTAL_QUESTIONS, Math.max(1, Math.round(n)));
}

export function questionAt(numero) {
  return QUESTIONS[toIndex(numero)];
}

export function isLast(numero) {
  return clampNumber(numero) === TOTAL_QUESTIONS;
}

export function isFirst(numero) {
  return clampNumber(numero) === 1;
}

/**
 * Primeira questão sem resposta válida. Devolve null quando tudo está
 * respondido. É o que decide onde a pessoa retoma a avaliação.
 */
export function firstUnanswered(answers) {
  const item = QUESTIONS.find((q) => !isValidAnswer(answers[q.id]));
  return item ? item.num : null;
}

/**
 * Ponto de retomada: a primeira pergunta sem resposta, ou a última posição
 * registrada quando todas já foram respondidas.
 */
export function resumePoint(estado) {
  const respostas = (estado && estado.answers) || {};
  const pendente = firstUnanswered(respostas);
  if (pendente !== null) return pendente;
  return clampNumber(estado && estado.progress ? estado.progress.currentQuestion : TOTAL_QUESTIONS);
}

/** Quantas respostas válidas existem. */
export function answeredCount(answers) {
  return QUESTIONS.reduce((total, q) => total + (isValidAnswer(answers[q.id]) ? 1 : 0), 0);
}

/** Todas as 120 respondidas? */
export function isComplete(answers) {
  return answeredCount(answers) === TOTAL_QUESTIONS;
}

/** Lista de números de questão ainda sem resposta. */
export function missingNumbers(answers) {
  return QUESTIONS.filter((q) => !isValidAnswer(answers[q.id])).map((q) => q.num);
}
