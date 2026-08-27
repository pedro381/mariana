/**
 * Controlador da página inicial.
 *
 * Responsabilidades:
 * - detectar avaliação em andamento e oferecer retomada;
 * - preencher a apresentação das cinco dimensões a partir dos metadados;
 * - validar e salvar identificação e consentimento;
 * - encaminhar para o questionário.
 *
 * Tudo o que é digitado é salvo assim que o campo perde o foco, para que nada
 * se perca se a pessoa fechar a página antes de enviar o formulário.
 */

import { CONFIG } from './config.js';
import * as storage from './storage/storage.js';
import { validateParticipant } from './utils/validators.js';
import { firstName, formatPercent } from './utils/formatters.js';
import { DOMAINS, DOMAIN_ORDER } from './data/domains.js';
import { initTheme } from './utils/theme.js';
import { runIntegrityCheck } from './dev/self-test.js';

const $ = (seletor, contexto = document) => contexto.querySelector(seletor);

document.addEventListener('DOMContentLoaded', () => {
  initTheme($('#themeBtn'));
  renderDimensions();
  showAdminEmail();
  setupResume();
  setupForm();
  warnIfNoStorage();

  if (CONFIG.devMode) runIntegrityCheck();
});

/* ------------------------------------------------------------------ *
 *  Apresentação das dimensões
 * ------------------------------------------------------------------ */

function renderDimensions() {
  const grid = $('#dimsGrid');
  if (!grid) return;

  grid.innerHTML = DOMAIN_ORDER.map((chave) => {
    const dominio = DOMAINS[chave];
    const letra = dominio.inverted ? 'N' : chave;
    return `
      <article class="dim-card">
        <span class="dim-card__letter" aria-hidden="true">${letra}</span>
        <h3>${dominio.name}</h3>
        <p>${dominio.tagline}</p>
      </article>`;
  }).join('');
}

function showAdminEmail() {
  const alvo = $('#adminEmailLabel');
  if (alvo && CONFIG.email.adminEmail) {
    alvo.textContent = CONFIG.email.adminEmail;
  }
}

function warnIfNoStorage() {
  if (storage.isStorageAvailable()) return;
  const form = $('#startForm');
  if (!form) return;

  const aviso = document.createElement('div');
  aviso.className = 'notice notice--warn';
  aviso.style.marginBottom = '20px';
  aviso.innerHTML =
    '<span class="notice__icon" aria-hidden="true">!</span>'
    + '<span>O seu navegador está bloqueando o armazenamento local (isso costuma acontecer em '
    + 'janelas anônimas). A avaliação funciona, mas o progresso <strong>não</strong> será salvo se '
    + 'você fechar a página.</span>';
  form.parentNode.insertBefore(aviso, form);
}

/* ------------------------------------------------------------------ *
 *  Retomada
 * ------------------------------------------------------------------ */

function setupResume() {
  const cartao = $('#resumeCard');
  if (!cartao) return;

  const estado = storage.load();
  if (!storage.hasResumableAssessment(estado)) return;

  const respondidas = storage.countAnswers(estado);
  const total = CONFIG.assessment.totalQuestions;
  const nome = firstName(estado.participant && estado.participant.name);

  $('#resumeText').textContent = nome
    ? `${nome}, você respondeu ${respondidas} de ${total} perguntas. Deseja continuar de onde parou?`
    : `Você respondeu ${respondidas} de ${total} perguntas. Deseja continuar de onde parou?`;

  const percentual = formatPercent(respondidas, total);
  $('#resumeFill').style.width = percentual;
  $('#resumePct').textContent = percentual;

  cartao.classList.remove('hidden');
  cartao.scrollIntoView({ block: 'nearest' });

  $('#btnResume').addEventListener('click', () => {
    window.location.href = 'avaliacao.html';
  });

  preencherFormulario(estado.participant, estado.consent);
  setupRestart();
}

function setupRestart() {
  const dialogo = $('#restartDialog');
  const abrir = $('#btnRestart');
  if (!dialogo || !abrir) return;

  abrir.addEventListener('click', () => {
    if (typeof dialogo.showModal === 'function') {
      dialogo.showModal();
    } else if (window.confirm('Apagar as respostas salvas e começar novamente?')) {
      reiniciar();
    }
  });

  $('#restartCancel').addEventListener('click', () => dialogo.close());
  $('#restartConfirm').addEventListener('click', () => {
    dialogo.close();
    reiniciar();
  });
}

function reiniciar() {
  storage.clearAll();
  window.location.reload();
}

/* ------------------------------------------------------------------ *
 *  Formulário de identificação e consentimento
 * ------------------------------------------------------------------ */

const CAMPOS = ['name', 'email', 'phone', 'company', 'role'];

function preencherFormulario(participante, consentimento) {
  if (participante) {
    CAMPOS.forEach((campo) => {
      const input = $(`#${campo}`);
      if (input && participante[campo]) input.value = participante[campo];
    });
  }
  if (consentimento && consentimento.accepted) {
    const check = $('#consent');
    if (check) check.checked = true;
  }
}

function setupForm() {
  const form = $('#startForm');
  if (!form) return;

  const estado = storage.load();
  if (estado) preencherFormulario(estado.participant, estado.consent);

  /* Autosave da identificação: grava ao sair do campo. */
  CAMPOS.forEach((campo) => {
    const input = $(`#${campo}`);
    if (!input) return;
    input.addEventListener('blur', () => {
      storage.saveParticipant({ [campo]: input.value.trim() });
      limparErro(campo);
    });
    input.addEventListener('input', () => limparErro(campo));
  });

  const consentimento = $('#consent');
  if (consentimento) {
    consentimento.addEventListener('change', () => {
      storage.saveConsent(consentimento.checked, textoDoConsentimento());
      limparErro('consent');
    });
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    submeter();
  });
}

function textoDoConsentimento() {
  const resumo = document.querySelector('.consent-summary');
  const rotulo = document.querySelector('.check__text');
  const partes = [];
  if (resumo) partes.push(resumo.innerText.trim());
  if (rotulo) partes.push(rotulo.innerText.trim());
  return partes.join('\n\n');
}

function submeter() {
  const participante = CAMPOS.reduce((acumulado, campo) => {
    const input = $(`#${campo}`);
    acumulado[campo] = input ? input.value.trim() : '';
    return acumulado;
  }, {});

  const { valid, errors } = validateParticipant(participante);
  const consentimento = $('#consent');
  const aceitou = consentimento && consentimento.checked;

  Object.entries(errors).forEach(([campo, mensagem]) => mostrarErro(campo, mensagem));
  if (!aceitou) {
    mostrarErro('consent', 'É necessário aceitar os termos para iniciar a avaliação.');
  }

  if (!valid || !aceitou) {
    const primeiroErro = document.querySelector('.field__error:not(:empty)');
    if (primeiroErro) {
      const campo = primeiroErro.id.replace('-error', '');
      const input = $(`#${campo}`);
      if (input) input.focus();
      primeiroErro.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    return;
  }

  storage.saveParticipant(participante);
  storage.saveConsent(true, textoDoConsentimento());

  const estado = storage.ensureState();
  if (estado.status === 'not_started') {
    storage.update({ status: 'in_progress', startedAt: estado.startedAt || new Date().toISOString() });
  }

  window.location.href = 'avaliacao.html';
}

function mostrarErro(campo, mensagem) {
  const alvo = $(`#${campo}-error`);
  if (alvo) alvo.textContent = mensagem;
  const input = $(`#${campo}`);
  if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', 'true');
}

function limparErro(campo) {
  const alvo = $(`#${campo}-error`);
  if (alvo) alvo.textContent = '';
  const input = $(`#${campo}`);
  if (input && input.type !== 'checkbox') input.removeAttribute('aria-invalid');
}
