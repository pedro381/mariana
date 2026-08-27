/**
 * Gráficos do relatório, em SVG gerado por JavaScript puro.
 *
 * Sem biblioteca externa: o radar tem cinco eixos e a escala é conhecida, o que
 * não justifica carregar dezenas de kilobytes de dependência. As cores vêm de
 * variáveis CSS, então o gráfico acompanha o tema claro/escuro automaticamente.
 */

import { escapeHtml } from '../utils/formatters.js';

const TAU = Math.PI * 2;

/**
 * Radar com as cinco dimensões.
 *
 * @param {Array} dimensoes  [{ key, short, index }]
 * @param {Object} opcoes    { size, title }
 * @returns {string} markup SVG
 */
export function renderRadar(dimensoes, opcoes = {}) {
  const tamanho = opcoes.size || 420;
  const centro = tamanho / 2;
  const raio = tamanho * 0.29;
  const aneis = [20, 40, 60, 80, 100];

  const ponto = (indice, valor) => {
    const angulo = (indice / dimensoes.length) * TAU - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, valor)) / 100) * raio;
    return {
      x: centro + Math.cos(angulo) * r,
      y: centro + Math.sin(angulo) * r,
      angulo
    };
  };

  const grade = aneis
    .map((nivel) => {
      const pontos = dimensoes
        .map((_, i) => {
          const pt = ponto(i, nivel);
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        })
        .join(' ');
      return `<polygon class="radar__ring" points="${pontos}" />`;
    })
    .join('');

  const eixos = dimensoes
    .map((_, i) => {
      const pt = ponto(i, 100);
      return `<line class="radar__axis" x1="${centro}" y1="${centro}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" />`;
    })
    .join('');

  const pontosArea = dimensoes
    .map((d, i) => {
      const pt = ponto(i, d.index);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  const marcadores = dimensoes
    .map((d, i) => {
      const pt = ponto(i, d.index);
      return `<circle class="radar__dot" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" />`;
    })
    .join('');

  const rotulos = dimensoes
    .map((d, i) => {
      const pt = ponto(i, 122);
      const alinhamento = alignForAngle(pt.angulo);
      const deslocamentoY = verticalOffsetForAngle(pt.angulo);

      /*
       * `label` aceita uma ou duas linhas: nomes longos como
       * "Conscienciosidade" não cabem na lateral do gráfico em telas estreitas.
       */
      const linhas = Array.isArray(d.label) ? d.label : [d.label || d.short];
      const alturaLinha = 13;

      const textos = linhas
        .map((linha, n) => `<text class="radar__label" x="${pt.x.toFixed(1)}" y="${(pt.y + deslocamentoY + n * alturaLinha).toFixed(1)}" text-anchor="${alinhamento}">${escapeHtml(linha)}</text>`)
        .join('');

      const yValor = pt.y + deslocamentoY + (linhas.length - 1) * alturaLinha + 15;

      return `${textos}<text class="radar__value" x="${pt.x.toFixed(1)}" y="${yValor.toFixed(1)}" text-anchor="${alinhamento}">${Math.round(d.index)}</text>`;
    })
    .join('');

  const descricao = dimensoes
    .map((d) => `${d.short}: ${Math.round(d.index)} de 100`)
    .join('. ');

  return `
    <svg class="radar" viewBox="0 0 ${tamanho} ${tamanho}" role="img"
         aria-label="Gráfico radar das cinco dimensões. ${escapeHtml(descricao)}">
      <g>${grade}${eixos}</g>
      <polygon class="radar__area" points="${pontosArea}" />
      <g>${marcadores}</g>
      <g>${rotulos}</g>
    </svg>
  `;
}

function alignForAngle(angulo) {
  const cos = Math.cos(angulo);
  if (cos > 0.25) return 'start';
  if (cos < -0.25) return 'end';
  return 'middle';
}

function verticalOffsetForAngle(angulo) {
  const sin = Math.sin(angulo);
  if (sin < -0.6) return -6;
  if (sin > 0.6) return 14;
  return 4;
}

/**
 * Barra horizontal de índice, usada por dimensões e facetas.
 *
 * @param {Object} dados { index, band, level }
 * @param {Object} opcoes { size: 'lg' | 'sm' }
 */
export function renderBar(dados, opcoes = {}) {
  const valor = Math.max(0, Math.min(100, dados.index));
  const tamanho = opcoes.size === 'sm' ? 'bar--sm' : 'bar--lg';
  const tom = dados.band && dados.band.tone ? dados.band.tone : 'mid';

  return `
    <div class="bar ${tamanho}" data-tone="${tom}">
      <div class="bar__track" role="img"
           aria-label="Índice ${Math.round(valor)} de 100 — ${escapeHtml((dados.band && dados.band.label) || '')}">
        <div class="bar__fill" style="width: ${valor.toFixed(1)}%"></div>
        <span class="bar__center" aria-hidden="true"></span>
      </div>
    </div>
  `;
}

/**
 * Régua de referência da escala, exibida uma vez por relatório.
 */
export function renderScaleLegend() {
  return `
    <div class="scale-legend" aria-hidden="true">
      <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
    </div>
  `;
}
