/**
 * Camada de apresentação do relatório.
 *
 * Lê o relatório já gerado no storage e o desenha. Não faz cálculo nem regra
 * de interpretação: se algo precisa ser decidido sobre o conteúdo, a decisão
 * está em `report-generator.js` ou em `combinations.js`.
 *
 * Também cuida do envio por e-mail (primeira tentativa automática e reenvio
 * manual), de imprimir, refazer a avaliação e apagar os dados locais.
 */

import { CONFIG } from '../config.js';
import * as storage from '../storage/storage.js';
import { renderRadar, renderBar, renderScaleLegend } from './charts.js';
import { escapeHtml, formatDate, formatDateTime } from '../utils/formatters.js';
import { initTheme } from '../utils/theme.js';
import { sendReport, isConfigured, EMAIL_STATUS } from '../email/email.js';

const $ = (seletor, contexto = document) => contexto.querySelector(seletor);

let estado = null;
let relatorio = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme($('#themeBtn'));

  estado = storage.load();
  relatorio = estado && estado.report ? estado.report : null;

  if (!relatorio || estado.status !== 'completed') {
    $('#emptyState').classList.remove('hidden');
    return;
  }

  $('#reportRoot').classList.remove('hidden');
  desenhar();
  ligarAcoes();
  cuidarDoEnvio();
});

/* ------------------------------------------------------------------ *
 *  Desenho
 * ------------------------------------------------------------------ */

function desenhar() {
  desenharCabecalho();
  desenharVisaoGeral();
  desenharDimensoes();
  desenharDestaques();
  desenharTemas();
  desenharDesenvolvimento();
  desenharMetodologia();
}

function desenharCabecalho() {
  $('#reportGreeting').textContent = relatorio.overview.greeting;

  const meta = [
    relatorio.participant.name ? escapeHtml(relatorio.participant.name) : null,
    escapeHtml(formatDate(relatorio.generatedAt)),
    `${escapeHtml(relatorio.instrument)} · ${relatorio.methodology.questions} itens`
  ].filter(Boolean);

  $('#reportMeta').innerHTML = meta.map((item) => `<span>${item}</span>`).join('');
  document.title = relatorio.participant.firstName
    ? `Perfil comportamental de ${relatorio.participant.firstName}`
    : 'Seu perfil comportamental';
}

function desenharVisaoGeral() {
  const blocos = [`<p class="lead">${escapeHtml(relatorio.overview.summary)}</p>`]
    .concat(relatorio.overview.combinations.map((c) => `<p>${escapeHtml(c.text)}</p>`));
  $('#overviewText').innerHTML = blocos.join('');

  $('#radarCard').innerHTML = renderRadar(
    relatorio.dimensions.map((d) => ({ key: d.key, short: d.short, label: d.chartLabel, index: d.index }))
  );

  $('#summaryList').innerHTML = relatorio.dimensions
    .map(
      (d) => `
      <li class="summary-list__item">
        <div class="summary-list__head">
          <a class="summary-list__name" href="#dim-${d.key}" style="text-decoration:none;color:inherit">${escapeHtml(d.name)}</a>
          <span class="summary-list__value">${Math.round(d.index)}<small>/100</small></span>
        </div>
        ${renderBar(d, { size: 'sm' })}
        <span class="summary-list__band">${escapeHtml(d.band.labelF)}</span>
      </li>`
    )
    .join('');
}

function desenharDimensoes() {
  $('#dimensionsRoot').innerHTML = relatorio.dimensions.map(secaoDimensao).join('');
}

function secaoDimensao(d) {
  const notaInvertida = d.inverted
    ? `<div class="facets__note">
         As facetas abaixo são apresentadas na direção em que o inventário as mede —
         ${escapeHtml(d.measuredName)}. Um índice alto em uma faceta indica mais daquela
         característica (por exemplo, mais ansiedade), o que corresponde a menos estabilidade
         emocional naquele aspecto específico.
       </div>`
    : '';

  const fortes = d.strengths && d.strengths.length
    ? `<div>
         <h4>Onde isso costuma ajudar</h4>
         <ul class="mini-list">${d.strengths.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
       </div>`
    : '';

  const atencao = d.watchouts && d.watchouts.length
    ? `<div>
         <h4>Onde pede atenção</h4>
         <ul class="mini-list mini-list--warn">${d.watchouts.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
       </div>`
    : '';

  const contextos = d.contexts && d.contexts.length
    ? `<div style="margin-top:20px">
         <h4>Situações em que esse traço tende a aparecer</h4>
         <ul class="mini-list">${d.contexts.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
       </div>`
    : '';

  return `
    <section class="dimension" id="dim-${d.key}">
      <div class="dimension__head">
        <div>
          <h2 class="dimension__title">${escapeHtml(d.name)}</h2>
          <p class="dimension__tagline">${escapeHtml(d.tagline)}</p>
        </div>
        <div style="text-align:right">
          <div class="dimension__score">
            <span class="dimension__index">${Math.round(d.index)}</span>
            <span class="dimension__scale">/100</span>
          </div>
          <div class="dimension__band">${escapeHtml(d.band.labelF)}</div>
        </div>
      </div>

      <div class="dimension__bar">
        ${renderBar(d)}
        ${renderScaleLegend()}
      </div>

      <p style="color:var(--muted);font-size:.9rem">
        Score bruto ${d.raw} de ${d.count * 5} · média ${d.mean.toFixed(2).replace('.', ',')} numa escala de 1 a 5
        · índice ${Math.round(d.index)} de 100
      </p>

      <p>${escapeHtml(d.description)}</p>
      <p><strong>O que os seus resultados sugerem.</strong> ${escapeHtml(d.meaning)}</p>

      <div class="dimension__grid dimension__grid--2" style="margin-top:20px">
        ${fortes}
        ${atencao}
      </div>
      ${contextos}

      <details class="facets">
        <summary>Ver as seis facetas de ${escapeHtml(d.short.toLowerCase())}</summary>
        <div class="facets__body">
          ${notaInvertida}
          ${d.facets.map(blocoFaceta).join('')}
        </div>
      </details>
    </section>`;
}

function blocoFaceta(f) {
  return `
    <div class="facet">
      <div class="facet__head">
        <span class="facet__name">${escapeHtml(f.name)}</span>
        <span class="facet__meta">
          <span class="facet__index">${Math.round(f.index)}</span>
          <span class="facet__band">${escapeHtml(f.band.label)}</span>
        </span>
      </div>
      ${renderBar(f, { size: 'sm' })}
      <p class="facet__text">${escapeHtml(f.interpretation)}</p>
      <p class="facet__desc">${escapeHtml(f.description)}</p>
    </div>`;
}

function desenharDestaques() {
  const fortes = relatorio.strengths;
  $('#strengthsTitle').textContent = fortes.title;
  $('#strengthsIntro').textContent = fortes.intro;
  $('#strengthsList').innerHTML = fortes.items.length
    ? fortes.items.map(itemDestaque).join('')
    : '';

  const atencao = relatorio.watchouts;
  $('#watchoutsTitle').textContent = atencao.title;
  $('#watchoutsIntro').textContent = atencao.items.length ? atencao.intro : atencao.empty;
  $('#watchoutsList').innerHTML = atencao.items.length
    ? atencao.items.map(itemDestaque).join('')
    : '';
}

function itemDestaque(item) {
  return `
    <li>
      <strong>${escapeHtml(item.label)}</strong> — ${escapeHtml(item.text)}.
      <span class="source">Faceta: ${escapeHtml(item.facet)} (${escapeHtml(item.domainName)}) · índice ${Math.round(item.index)}</span>
    </li>`;
}

function desenharTemas() {
  $('#topicsRoot').innerHTML = relatorio.sections
    .map(
      (secao) => `
      <section class="topic" id="${secao.id}">
        <h2 style="font-size:1.35rem">${escapeHtml(secao.title)}</h2>
        <p class="topic__intro">${escapeHtml(secao.intro)}</p>
        <ul class="topic__list">
          ${secao.items.map((i) => `<li>${escapeHtml(i.text)}</li>`).join('')}
        </ul>
      </section>`
    )
    .join('');
}

function desenharDesenvolvimento() {
  $('#devTitle').textContent = relatorio.development.title;
  $('#devIntro').textContent = relatorio.development.intro;
  $('#devList').innerHTML = relatorio.development.items
    .map((i) => `<li>${escapeHtml(i.text)}</li>`)
    .join('');
}

function desenharMetodologia() {
  const m = relatorio.methodology;
  $('#methodologyText').innerHTML = `
    <p>
      Suas respostas foram pontuadas segundo o método do ${escapeHtml(m.instrument)}. Cada uma das
      ${m.questions} afirmações pertence a uma das cinco dimensões e a uma das trinta facetas.
      Itens redigidos no sentido inverso são corrigidos antes da soma, de modo que, em todos eles,
      um valor mais alto signifique sempre mais do traço medido.
    </p>
    <p>${escapeHtml(m.note)}</p>
    <p>
      As classificações — de <em>baixo</em> a <em>alto</em> — correspondem a faixas fixas do índice,
      declaradas de forma explícita no código da plataforma e sujeitas a revisão. Todo o cálculo é
      determinístico: as mesmas respostas produzem sempre exatamente o mesmo relatório.
    </p>`;

  $('#disclaimerText').textContent = relatorio.disclaimer || CONFIG.disclaimer;
}

/* ------------------------------------------------------------------ *
 *  Envio por e-mail
 * ------------------------------------------------------------------ */

async function cuidarDoEnvio() {
  const emailEstado = (estado && estado.email) || { status: EMAIL_STATUS.PENDENTE, attempts: 0 };

  if (!isConfigured()) {
    mostrarEmail(EMAIL_STATUS.NAO_CONFIGURADO,
      'O envio automático por e-mail ainda não está configurado neste site. Seu relatório está '
      + 'salvo aqui e pode ser impresso ou salvo em PDF.');
    return;
  }

  if (emailEstado.status === EMAIL_STATUS.ENVIADO) {
    mostrarEmail(EMAIL_STATUS.ENVIADO,
      `Relatório enviado para ${relatorio.participant.email}. Uma cópia foi enviada à responsável pelo site.`);
    return;
  }

  /* Primeira tentativa automática, uma única vez. */
  if (emailEstado.attempts < CONFIG.email.maxAutoAttempts) {
    mostrarEmail(EMAIL_STATUS.ENVIANDO, 'Enviando o relatório para o seu e-mail...');
    const resposta = await sendReport(relatorio, estado);
    estado = storage.load();
    mostrarEmail(resposta.status, resposta.message);
    return;
  }

  mostrarEmail(emailEstado.status, 'O envio anterior não foi concluído. Você pode tentar novamente.');
}

function mostrarEmail(status, mensagem) {
  const caixa = $('#emailStatus');
  caixa.hidden = false;

  const classes = {
    [EMAIL_STATUS.ENVIADO]: 'notice notice--ok',
    [EMAIL_STATUS.ENVIANDO]: 'notice',
    [EMAIL_STATUS.ERRO]: 'notice notice--error',
    [EMAIL_STATUS.NAO_CONFIGURADO]: 'notice notice--warn',
    [EMAIL_STATUS.PENDENTE]: 'notice'
  };

  const icones = {
    [EMAIL_STATUS.ENVIADO]: '✓',
    [EMAIL_STATUS.ENVIANDO]: '…',
    [EMAIL_STATUS.ERRO]: '!',
    [EMAIL_STATUS.NAO_CONFIGURADO]: 'i',
    [EMAIL_STATUS.PENDENTE]: 'i'
  };

  const podeReenviar = status === EMAIL_STATUS.ERRO;

  caixa.innerHTML = `
    <div class="${classes[status] || 'notice'}">
      <span class="notice__icon" aria-hidden="true">${icones[status] || 'i'}</span>
      <span>${escapeHtml(mensagem)}</span>
    </div>
    ${podeReenviar ? '<div class="actions"><button type="button" class="btn btn--ghost" id="btnRetry">Tentar enviar novamente</button></div>' : ''}
  `;

  const tentar = $('#btnRetry');
  if (tentar) tentar.addEventListener('click', reenviar);

  const botaoReenvio = $('#btnResend');
  if (botaoReenvio) {
    botaoReenvio.disabled = status === EMAIL_STATUS.ENVIANDO || !isConfigured();
  }
}

async function reenviar() {
  const botoes = [$('#btnRetry'), $('#btnResend')].filter(Boolean);
  botoes.forEach((b) => { b.disabled = true; });

  mostrarEmail(EMAIL_STATUS.ENVIANDO, 'Enviando o relatório...');

  /* Idempotência: o envio usa o assessmentId como chave, então uma segunda
     tentativa não gera uma segunda cópia do lado do servidor. */
  const resposta = await sendReport(relatorio, estado);
  estado = storage.load();
  mostrarEmail(resposta.status, resposta.message);

  botoes.forEach((b) => { b.disabled = false; });
}

/* ------------------------------------------------------------------ *
 *  Ações da página
 * ------------------------------------------------------------------ */

function ligarAcoes() {
  const imprimir = () => {
    /* Abre todas as facetas antes de imprimir, para que nada saia oculto. */
    document.querySelectorAll('details.facets').forEach((d) => { d.open = true; });
    window.print();
  };

  $('#btnPrint').addEventListener('click', imprimir);
  const topo = $('#btnPrintTop');
  if (topo) topo.addEventListener('click', imprimir);

  /*
   * O navegador não renderiza o conteúdo de um <details> fechado, nem na
   * impressão. Quem usa Ctrl+P direto, sem passar pelo botão, perderia as
   * facetas: por isso as abrimos também no `beforeprint`.
   */
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details.facets').forEach((d) => { d.open = true; });
  });

  $('#btnResend').addEventListener('click', reenviar);

  $('#btnRetake').addEventListener('click', () => {
    confirmar(
      'Refazer a avaliação?',
      'O relatório atual e todas as respostas serão apagados deste dispositivo. Se quiser guardá-lo, '
      + 'salve o PDF antes de continuar.',
      () => {
        storage.clearAll();
        window.location.href = 'index.html';
      }
    );
  });

  $('#btnWipe').addEventListener('click', () => {
    confirmar(
      'Apagar meus dados deste dispositivo?',
      'Suas respostas e este relatório serão removidos do armazenamento local do navegador. '
      + 'A ação não pode ser desfeita.',
      () => {
        storage.clearAll();
        window.location.href = 'index.html';
      }
    );
  });
}

/** Diálogo de confirmação reutilizável. */
function confirmar(titulo, texto, aoConfirmar) {
  const dialogo = $('#confirmDialog');
  $('#confirmTitle').textContent = titulo;
  $('#confirmText').textContent = texto;

  const ok = $('#confirmOk');
  const cancelar = $('#confirmCancel');

  /* Substitui os botões para descartar handlers de confirmações anteriores. */
  const okNovo = ok.cloneNode(true);
  const cancelarNovo = cancelar.cloneNode(true);
  ok.parentNode.replaceChild(okNovo, ok);
  cancelar.parentNode.replaceChild(cancelarNovo, cancelar);

  okNovo.addEventListener('click', () => {
    dialogo.close();
    aoConfirmar();
  });
  cancelarNovo.addEventListener('click', () => dialogo.close());

  if (typeof dialogo.showModal === 'function') {
    dialogo.showModal();
  } else if (window.confirm(`${titulo}\n\n${texto}`)) {
    aoConfirmar();
  }
}

/** Data de conclusão, usada apenas no título da aba em alguns navegadores. */
export function completedAtLabel() {
  return relatorio ? formatDateTime(relatorio.generatedAt) : '';
}
