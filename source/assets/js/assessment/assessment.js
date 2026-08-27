/**
 * Controlador do questionário.
 *
 * Uma pergunta por vez. Cada resposta é gravada no instante em que é escolhida
 * — não existe botão "Salvar". Ao final, valida a integridade das 120 respostas
 * antes de calcular o perfil.
 *
 * Acessibilidade: as opções são um grupo de rádios reais dentro de um
 * `fieldset`, navegáveis por Tab e setas. As teclas 1 a 5 respondem
 * diretamente; ← e → navegam entre perguntas.
 */

import { CONFIG } from '../config.js';
import * as storage from '../storage/storage.js';
import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions.js';
import { SCALE } from './scale.js';
import {
  questionAt, clampNumber, isFirst, isLast,
  resumePoint, answeredCount, isComplete, missingNumbers
} from './navigation.js';
import { calculateBigFive } from '../scoring/big-five.js';
import { generateReport } from '../report/report-generator.js';
import { firstName, escapeHtml, formatPercent } from '../utils/formatters.js';
import { initTheme } from '../utils/theme.js';
import { runIntegrityCheck } from '../dev/self-test.js';

const $ = (seletor, contexto = document) => contexto.querySelector(seletor);

/** Estado de tela (o estado real vive no storage). */
const tela = {
  atual: 1,
  estado: null,
  modo: 'questionario', /* 'questionario' | 'revisao' | 'processando' */
  timerSalvo: null
};

document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
  initTheme($('#themeBtn'));
  if (CONFIG.devMode) runIntegrityCheck();

  tela.estado = storage.load();

  /* Sem consentimento registrado, não há avaliação a exibir. */
  if (!tela.estado || !tela.estado.consent || !tela.estado.consent.accepted) {
    window.location.replace('index.html');
    return;
  }

  /* Avaliação já concluída: leva direto ao relatório. */
  if (tela.estado.status === 'completed' && tela.estado.result) {
    window.location.replace('resultado.html');
    return;
  }

  const nome = firstName(tela.estado.participant && tela.estado.participant.name);
  if (nome) $('#participantLabel').textContent = nome;

  tela.atual = resumePoint(tela.estado);

  montarOpcoes();
  ligarEventos();
  renderizar();
}

/* ------------------------------------------------------------------ *
 *  Montagem das opções (uma única vez)
 * ------------------------------------------------------------------ */

function montarOpcoes() {
  const container = $('#options');
  const legenda = container.querySelector('legend');

  container.innerHTML = '';
  container.appendChild(legenda);

  SCALE.forEach((opcao) => {
    const rotulo = document.createElement('label');
    rotulo.className = 'option';
    rotulo.dataset.value = String(opcao.value);
    rotulo.innerHTML = `
      <input type="radio" name="resposta" value="${opcao.value}">
      <span class="option__mark" aria-hidden="true">✓</span>
      <span class="option__text">${escapeHtml(opcao.label)}</span>
      <span class="option__key" aria-hidden="true">${opcao.value}</span>
    `;
    container.appendChild(rotulo);
  });

  container.addEventListener('change', (evento) => {
    const alvo = evento.target;
    if (alvo && alvo.name === 'resposta') {
      responder(Number(alvo.value));
    }
  });
}

/* ------------------------------------------------------------------ *
 *  Eventos
 * ------------------------------------------------------------------ */

function ligarEventos() {
  $('#btnPrev').addEventListener('click', () => irPara(tela.atual - 1));
  $('#btnNext').addEventListener('click', avancar);
  $('#btnFinish').addEventListener('click', concluir);
  $('#btnBackToQuestions').addEventListener('click', () => {
    tela.modo = 'questionario';
    irPara(tela.atual);
  });

  const cancelar = $('#leaveCancel');
  if (cancelar) cancelar.addEventListener('click', () => $('#leaveDialog').close());

  document.addEventListener('keydown', atalhos);

  /* Salva a posição atual ao sair da página, por segurança. */
  window.addEventListener('pagehide', () => {
    if (tela.modo === 'questionario') storage.saveCurrentQuestion(tela.atual);
  });
}

function atalhos(evento) {
  if (tela.modo !== 'questionario') return;

  const alvo = evento.target;
  const digitando = alvo && (alvo.tagName === 'INPUT' && alvo.type !== 'radio');
  if (digitando || evento.metaKey || evento.ctrlKey || evento.altKey) return;

  if (evento.key >= '1' && evento.key <= '5') {
    evento.preventDefault();
    const valor = Number(evento.key);
    const radio = $(`#options input[value="${valor}"]`);
    if (radio) {
      radio.checked = true;
      responder(valor);
    }
    return;
  }

  if (evento.key === 'ArrowLeft') {
    evento.preventDefault();
    irPara(tela.atual - 1);
  }
  if (evento.key === 'ArrowRight' || evento.key === 'Enter') {
    evento.preventDefault();
    avancar();
  }
}

/* ------------------------------------------------------------------ *
 *  Responder e navegar
 * ------------------------------------------------------------------ */

function responder(valor) {
  const questao = questionAt(tela.atual);
  tela.estado = storage.saveAnswer(questao.id, valor, tela.atual);
  indicarSalvo();
  atualizarProgresso();

  /*
   * Avanço automático: dá tempo de a pessoa ver a própria escolha marcada
   * antes de trocar de pergunta. Na última, vai para a revisão.
   */
  window.setTimeout(() => {
    const aindaNaMesma = tela.modo === 'questionario';
    if (!aindaNaMesma) return;
    if (isLast(tela.atual)) {
      mostrarRevisao();
    } else {
      irPara(tela.atual + 1);
    }
  }, 220);
}

function avancar() {
  if (isLast(tela.atual)) {
    mostrarRevisao();
    return;
  }
  irPara(tela.atual + 1);
}

function irPara(numero) {
  tela.modo = 'questionario';
  tela.atual = clampNumber(numero);
  storage.saveCurrentQuestion(tela.atual);
  renderizar();
}

/* ------------------------------------------------------------------ *
 *  Renderização
 * ------------------------------------------------------------------ */

function renderizar() {
  $('#questionArea').classList.remove('hidden');
  $('#reviewArea').classList.add('hidden');
  $('#processingArea').classList.add('hidden');
  $('#navBar').classList.remove('hidden');
  $('#progressBar').classList.remove('hidden');

  const questao = questionAt(tela.atual);
  const secao = $('#pergunta');

  $('#questionText').textContent = questao.text;

  const respostas = (tela.estado && tela.estado.answers) || {};
  const marcada = respostas[questao.id];

  document.querySelectorAll('#options input').forEach((input) => {
    input.checked = Number(input.value) === marcada;
    input.setAttribute(
      'aria-label',
      `${input.value} — ${SCALE[Number(input.value) - 1].label}`
    );
  });

  /* Reinicia a animação de entrada. */
  secao.removeAttribute('data-anim');
  void secao.offsetWidth;
  secao.setAttribute('data-anim', 'in');

  $('#btnPrev').disabled = isFirst(tela.atual);
  $('#btnNext').textContent = '';
  const proximo = $('#btnNext');
  proximo.innerHTML = isLast(tela.atual)
    ? 'Revisar <span aria-hidden="true">→</span>'
    : 'Próxima <span aria-hidden="true">→</span>';

  atualizarProgresso();
}

function atualizarProgresso() {
  const respostas = (tela.estado && tela.estado.answers) || {};
  const respondidas = answeredCount(respostas);

  $('#progressCount').textContent = `Pergunta ${tela.atual} de ${TOTAL_QUESTIONS}`;
  $('#progressPct').textContent = `${formatPercent(respondidas, TOTAL_QUESTIONS)} concluído`;

  const barra = $('#progressFill');
  barra.style.width = formatPercent(respondidas, TOTAL_QUESTIONS);
  barra.setAttribute('aria-valuenow', String(respondidas));
  barra.setAttribute('aria-valuetext', `${respondidas} de ${TOTAL_QUESTIONS} respondidas`);
}

function indicarSalvo() {
  const marca = $('#autosave');
  marca.classList.add('is-visible');
  window.clearTimeout(tela.timerSalvo);
  tela.timerSalvo = window.setTimeout(() => marca.classList.remove('is-visible'), 1400);
}

/* ------------------------------------------------------------------ *
 *  Revisão
 * ------------------------------------------------------------------ */

function mostrarRevisao() {
  tela.modo = 'revisao';
  tela.estado = storage.load() || tela.estado;

  $('#questionArea').classList.add('hidden');
  $('#navBar').classList.add('hidden');
  $('#reviewArea').classList.remove('hidden');

  const respostas = (tela.estado && tela.estado.answers) || {};
  const faltantes = missingNumbers(respostas);
  const completo = faltantes.length === 0;

  $('#reviewTitle').textContent = completo
    ? 'Tudo respondido'
    : `Faltam ${faltantes.length} ${faltantes.length === 1 ? 'resposta' : 'respostas'}`;

  $('#reviewText').textContent = completo
    ? 'Você respondeu as 120 afirmações. Se quiser rever alguma, toque no número correspondente.'
    : 'Toque nos números em destaque para responder as que ficaram pendentes.';

  const aviso = $('#reviewNotice');
  if (completo) {
    aviso.hidden = true;
  } else {
    aviso.hidden = false;
    aviso.className = 'notice notice--warn';
    aviso.innerHTML =
      '<span class="notice__icon" aria-hidden="true">!</span>'
      + `<span>Para calcular o perfil é necessário responder todas as 120 afirmações. `
      + `Pendentes: ${faltantes.slice(0, 12).join(', ')}${faltantes.length > 12 ? '…' : ''}</span>`;
  }

  $('#btnFinish').disabled = !completo;

  const grade = $('#reviewGrid');
  grade.innerHTML = QUESTIONS.map((questao) => {
    const respondida = Number.isInteger(respostas[questao.id]);
    return `<button type="button" class="review__cell" role="listitem"
              data-answered="${respondida}" data-num="${questao.num}"
              aria-label="Pergunta ${questao.num}${respondida ? ', respondida' : ', sem resposta'}">
              ${questao.num}
            </button>`;
  }).join('');

  grade.querySelectorAll('.review__cell').forEach((celula) => {
    celula.addEventListener('click', () => irPara(Number(celula.dataset.num)));
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ *
 *  Conclusão
 * ------------------------------------------------------------------ */

function concluir() {
  const botao = $('#btnFinish');
  botao.disabled = true;

  tela.estado = storage.load() || tela.estado;
  const respostas = (tela.estado && tela.estado.answers) || {};

  /* Verificação final: nada de calcular perfil com respostas faltando. */
  if (!isComplete(respostas)) {
    mostrarRevisao();
    return;
  }

  tela.modo = 'processando';
  $('#reviewArea').classList.add('hidden');
  $('#progressBar').classList.add('hidden');
  $('#processingArea').classList.remove('hidden');

  /*
   * O cálculo é rápido, mas roda fora do clique para que a interface consiga
   * pintar o estado de processamento antes.
   */
  window.setTimeout(() => {
    try {
      const resultado = calculateBigFive(respostas);
      const relatorio = generateReport(resultado, tela.estado.participant, {
        assessmentId: tela.estado.assessmentId,
        completedAt: new Date().toISOString()
      });

      storage.saveResult(resultado, relatorio);
      window.location.replace('resultado.html');
    } catch (erro) {
      console.error('[avaliacao] falha ao calcular o perfil:', erro);
      tela.modo = 'revisao';
      $('#processingArea').classList.add('hidden');
      $('#reviewArea').classList.remove('hidden');
      $('#progressBar').classList.remove('hidden');

      const aviso = $('#reviewNotice');
      aviso.hidden = false;
      aviso.className = 'notice notice--error';
      aviso.innerHTML =
        '<span class="notice__icon" aria-hidden="true">!</span>'
        + `<span>Não consegui calcular o perfil: ${escapeHtml(erro.message)} `
        + 'Suas respostas continuam salvas.</span>';
      botao.disabled = false;
    }
  }, 60);
}
