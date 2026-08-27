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

/** O endpoint seguro está configurado? */
export function isConfigured() {
  return typeof CONFIG.email.endpoint === 'string' && CONFIG.email.endpoint.trim().length > 0;
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
    const resposta = await postComTimeout(CONFIG.email.endpoint, buildPayload(relatorio, estado));

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
      message: 'Relatório enviado para o seu e-mail. Uma cópia foi enviada ao responsável pelo site.'
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
