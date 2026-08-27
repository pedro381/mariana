/**
 * Envio do relatório por e-mail.
 *
 * ============================ SEGURANÇA ============================
 * Este módulo NÃO fala com a API do Resend diretamente e NÃO contém
 * credencial alguma. O site é estático e público: qualquer chave colocada
 * aqui, no HTML ou em qualquer arquivo servido ao navegador ficaria visível
 * para todos os visitantes (View Source / DevTools) e poderia ser usada por
 * terceiros para enviar e-mail em nome do domínio.
 *
 * O caminho seguro é o adotado aqui: o navegador faz um POST para
 * `CONFIG.email.endpoint`, uma função serverless que guarda a chave do lado do
 * servidor e repassa a chamada ao Resend. Implementação de referência em
 * `servidor/enviar-relatorio.js`.
 * ===================================================================
 *
 * Garantias oferecidas:
 * - conclusão da avaliação e envio de e-mail são operações independentes:
 *   uma falha de envio nunca descarta o relatório já calculado;
 * - idempotência: cada envio carrega o `assessmentId` e um `idempotencyKey`,
 *   de modo que um clique duplo ou uma nova tentativa não gerem duas cópias;
 * - estado de envio persistido: `pendente`, `enviando`, `enviado`, `erro` ou
 *   `nao_configurado`.
 */

import { CONFIG } from '../config.js';
import { buildParticipantEmail, buildParticipantText, buildAdminEmail } from '../report/email-template.js';
import * as storage from '../storage/storage.js';

export const EMAIL_STATUS = Object.freeze({
  PENDENTE: 'pendente',
  ENVIANDO: 'enviando',
  ENVIADO: 'enviado',
  ERRO: 'erro',
  NAO_CONFIGURADO: 'nao_configurado'
});

/** Trava em memória contra duplo clique dentro da mesma sessão. */
const enviosEmCurso = new Set();

function preenchido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/** Existe endpoint próprio, capaz de enviar também ao participante? */
export function temEndpointProprio() {
  return preenchido(CONFIG.email.endpoint);
}

/** Existe o aviso via FormSubmit, que só alcança a responsável? */
export function temFormsubmit() {
  return preenchido(CONFIG.email.formsubmit);
}

/** Algum canal de envio está configurado? */
export function isConfigured() {
  return temEndpointProprio() || temFormsubmit();
}

/**
 * Monta o payload enviado à função serverless.
 *
 * O servidor decide o remetente real; o navegador nunca informa credencial,
 * chave ou endereço de remetente verificado.
 */
export function buildPayload(relatorio, estado) {
  return {
    idempotencyKey: relatorio.assessmentId,
    assessmentId: relatorio.assessmentId,
    generatedAt: relatorio.generatedAt,
    participant: {
      name: relatorio.participant.name,
      email: relatorio.participant.email,
      phone: relatorio.participant.phone,
      company: relatorio.participant.company,
      role: relatorio.participant.role
    },
    messages: [
      {
        role: 'participant',
        to: relatorio.participant.email,
        subject: CONFIG.email.subjectParticipant,
        html: buildParticipantEmail(relatorio),
        text: buildParticipantText(relatorio)
      },
      {
        role: 'admin',
        to: CONFIG.email.adminEmail,
        subject: `${CONFIG.email.subjectAdmin} — ${relatorio.participant.name}`,
        replyTo: relatorio.participant.email,
        html: buildAdminEmail(relatorio, estado)
      }
    ]
  };
}

/**
 * Envia o relatório. Nunca lança: devolve sempre um objeto de resultado, para
 * que a interface possa reagir sem risco de derrubar o fluxo de conclusão.
 *
 * @returns {Promise<{status: string, message: string, detail?: string}>}
 */
export async function sendReport(relatorio, estado) {
  const chave = relatorio.assessmentId || 'sem-id';

  if (!isConfigured()) {
    storage.saveEmailStatus({
      status: EMAIL_STATUS.NAO_CONFIGURADO,
      lastAttemptAt: new Date().toISOString(),
      lastError: 'Endpoint de envio não configurado.'
    });
    return {
      status: EMAIL_STATUS.NAO_CONFIGURADO,
      message: 'O envio automático por e-mail ainda não está configurado neste site. '
        + 'Seu relatório está salvo e continua disponível nesta página.'
    };
  }

  if (enviosEmCurso.has(chave)) {
    return { status: EMAIL_STATUS.ENVIANDO, message: 'Envio já em andamento.' };
  }

  const atual = storage.load();
  if (atual && atual.email && atual.email.status === EMAIL_STATUS.ENVIADO) {
    return { status: EMAIL_STATUS.ENVIADO, message: 'O relatório já foi enviado para o seu e-mail.' };
  }

  enviosEmCurso.add(chave);
  const tentativas = (atual && atual.email ? atual.email.attempts : 0) + 1;
  storage.saveEmailStatus({
    status: EMAIL_STATUS.ENVIANDO,
    attempts: tentativas,
    lastAttemptAt: new Date().toISOString(),
    lastError: null
  });

  try {
    const resposta = temEndpointProprio()
      ? await postComTimeout(CONFIG.email.endpoint, buildPayload(relatorio, estado))
      : await postFormsubmit(relatorio, estado);

    if (!resposta.ok) {
      throw new Error(resposta.detail || `HTTP ${resposta.status}`);
    }

    storage.saveEmailStatus({
      status: EMAIL_STATUS.ENVIADO,
      sentAt: new Date().toISOString(),
      lastError: null
    });
    return {
      status: EMAIL_STATUS.ENVIADO,
      message: temEndpointProprio()
        ? 'Relatório enviado para o seu e-mail. Uma cópia foi enviada ao responsável pelo site.'
        : 'Recebemos sua análise e avisamos a responsável — ela entra em contato pelo e-mail que você informou. '
          + 'Seu relatório completo está aqui nesta página: use o botão de imprimir para guardá-lo em PDF.'
    };
  } catch (erro) {
    const detalhe = erro && erro.message ? erro.message : String(erro);
    console.error('[email] falha no envio:', detalhe);
    storage.saveEmailStatus({
      status: EMAIL_STATUS.ERRO,
      lastError: detalhe
    });
    return {
      status: EMAIL_STATUS.ERRO,
      message: 'Não consegui enviar o e-mail agora. Seu relatório está salvo e continua disponível nesta página.',
      detail: detalhe
    };
  } finally {
    enviosEmCurso.delete(chave);
  }
}

/**
 * Aviso à responsável via FormSubmit, quando não há endpoint próprio.
 *
 * O serviço só entrega no endereço ativado, então este caminho avisa a
 * responsável mas NÃO manda o relatório ao participante — ele lê e imprime
 * o relatório na própria página. `_replyto` faz o Responder ir direto para
 * quem preencheu, e não para o FormSubmit.
 */
async function postFormsubmit(relatorio, estado) {
  const p = relatorio.participant;

  const campos = {
    _subject: `${CONFIG.email.subjectAdmin} — ${p.name}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: p.email,
    Nome: p.name,
    'E-mail': p.email,
    Telefone: p.phone || 'não informado',
    Empresa: p.company || 'não informado',
    Cargo: p.role || 'não informado',
    Instrumento: CONFIG.assessment.instrument,
    'Concluído em': relatorio.generatedAt || new Date().toISOString(),
    'ID da análise': relatorio.assessmentId || '—'
  };

  relatorio.dimensions.forEach((d) => {
    campos[d.name] = `${Math.round(d.index)}/100 — ${d.band.labelF}`;
  });

  if (estado && estado.consent) {
    campos['Consentimento'] = 'registrado';
  }

  const url = `https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.email.formsubmit)}`;
  const controlador = new AbortController();
  const timer = window.setTimeout(() => controlador.abort(), CONFIG.email.timeoutMs);

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(campos),
      signal: controlador.signal
    });

    const texto = await resposta.text();
    let corpo = {};
    try {
      corpo = texto ? JSON.parse(texto) : {};
    } catch (erro) {
      corpo = { message: texto };
    }

    // O FormSubmit responde 200 mesmo ao recusar: quem decide é o campo success.
    const aceito = resposta.ok && String(corpo.success) === 'true';

    return {
      ok: aceito,
      status: resposta.status,
      detail: aceito ? null : corpo.message || `HTTP ${resposta.status}`,
      body: corpo
    };
  } finally {
    window.clearTimeout(timer);
  }
}

/** POST com timeout, sem depender de bibliotecas. */
async function postComTimeout(url, payload) {
  const controlador = new AbortController();
  const timer = window.setTimeout(() => controlador.abort(), CONFIG.email.timeoutMs);

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': payload.idempotencyKey
      },
      body: JSON.stringify(payload),
      signal: controlador.signal
    });

    const texto = await resposta.text();
    let corpo = {};
    try {
      corpo = texto ? JSON.parse(texto) : {};
    } catch (erro) {
      corpo = { message: texto };
    }

    return {
      ok: resposta.ok,
      status: resposta.status,
      detail: corpo.message || corpo.error || null,
      body: corpo
    };
  } catch (erro) {
    if (erro.name === 'AbortError') {
      return { ok: false, status: 0, detail: 'Tempo esgotado ao contatar o serviço de envio.' };
    }
    return { ok: false, status: 0, detail: erro.message || 'Falha de rede.' };
  } finally {
    window.clearTimeout(timer);
  }
}

/** Texto amigável para cada estado de envio. */
export function statusMessage(estadoEmail) {
  if (!estadoEmail) return '';
  switch (estadoEmail.status) {
    case EMAIL_STATUS.ENVIADO:
      return 'Relatório enviado por e-mail.';
    case EMAIL_STATUS.ENVIANDO:
      return 'Enviando o relatório...';
    case EMAIL_STATUS.ERRO:
      return 'O envio por e-mail falhou. Seu relatório continua salvo aqui.';
    case EMAIL_STATUS.NAO_CONFIGURADO:
      return 'O envio automático por e-mail não está configurado neste site.';
    default:
      return 'Envio pendente.';
  }
}
