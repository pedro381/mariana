/**
 * Escala de resposta.
 *
 * O IPIP-NEO original usa âncoras de acurácia ("Very Inaccurate" a "Very
 * Accurate"), verificando o quanto a afirmação descreve a pessoa. A tradução
 * pt-br da fonte (`ipip-neo-120/data/pt-br/choices.js`) adota âncoras de
 * concordância, com cinco níveis simétricos em torno de um ponto neutro.
 *
 * Esta implementação preserva o método: cinco níveis, simetria e ponto neutro
 * central, mantendo os rótulos de concordância em português. O enunciado da
 * tela ("O quanto esta frase descreve você?") preserva a semântica original de
 * autodescrição.
 *
 * O valor gravado é sempre a resposta BRUTA (1 a 5, na ordem que a pessoa vê).
 * A inversão dos itens `minus` acontece no scoring, nunca aqui — assim é
 * possível reexibir corretamente a escolha ao voltar em uma pergunta.
 */

export const SCALE = Object.freeze([
  Object.freeze({ value: 1, label: 'Discordo totalmente', short: 'Discordo totalmente' }),
  Object.freeze({ value: 2, label: 'Discordo parcialmente', short: 'Discordo em parte' }),
  Object.freeze({ value: 3, label: 'Nem concordo, nem discordo', short: 'Neutro' }),
  Object.freeze({ value: 4, label: 'Concordo parcialmente', short: 'Concordo em parte' }),
  Object.freeze({ value: 5, label: 'Concordo totalmente', short: 'Concordo totalmente' })
]);

export function scaleLabel(valor) {
  const opcao = SCALE.find((o) => o.value === valor);
  return opcao ? opcao.label : '';
}
