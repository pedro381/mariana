/**
 * Montagem do HTML dos e-mails.
 *
 * E-mail não aceita CSS externo nem variável CSS de forma confiável: aqui tudo
 * é inline e a paleta é fixa, em tons claros. O layout usa tabelas por
 * compatibilidade com clientes antigos (Outlook em especial).
 *
 * Duas peças:
 *   buildParticipantEmail — relatório para quem respondeu;
 *   buildAdminEmail       — cópia de acompanhamento para o responsável.
 */

import { CONFIG } from '../config.js';
import { escapeHtml, formatDate, formatDateTime, formatPhone } from '../utils/formatters.js';

const COR = {
  ink: '#16201F',
  ink2: '#3D4E4B',
  muted: '#6B7B78',
  primary: '#0F5751',
  primarySoft: '#E2EFED',
  accent: '#C9622E',
  line: '#E5DCD0',
  bg: '#FBF8F3',
  surface: '#FFFFFF'
};

const FONTE = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Barra de índice desenhada com tabelas (não depende de CSS avançado). */
function barra(indice) {
  const largura = Math.max(0, Math.min(100, Math.round(indice)));
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 0">
      <tr>
        <td style="background:${COR.primarySoft};border-radius:6px;padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${largura}%" style="min-width:2%">
            <tr><td style="background:${COR.primary};border-radius:6px;height:10px;line-height:10px;font-size:0">&nbsp;</td></tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function linhaDimensao(dimensao) {
  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid ${COR.line}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font:600 15px/1.4 ${FONTE};color:${COR.ink}">${escapeHtml(dimensao.name)}</td>
            <td align="right" style="font:700 15px/1.4 ${FONTE};color:${COR.primary};white-space:nowrap">
              ${Math.round(dimensao.index)}<span style="color:${COR.muted};font-weight:400">/100</span>
            </td>
          </tr>
        </table>
        ${barra(dimensao.index)}
        <div style="font:400 13px/1.5 ${FONTE};color:${COR.muted};margin-top:6px">${escapeHtml(dimensao.band.labelF)}</div>
      </td>
    </tr>`;
}

function listaItens(itens, corMarcador) {
  if (!itens || itens.length === 0) return '';
  return itens
    .map(
      (item) => `
      <tr>
        <td style="padding:0 0 12px 0;font:400 14px/1.6 ${FONTE};color:${COR.ink2}">
          <span style="color:${corMarcador};font-weight:700">•</span>
          ${item.label ? `<strong style="color:${COR.ink}">${escapeHtml(item.label)}:</strong> ` : ''}${escapeHtml(item.text)}
        </td>
      </tr>`
    )
    .join('');
}

/**
 * E-mail do participante: relatório resumido, com os índices, os principais
 * pontos fortes e os pontos de atenção.
 */
export function buildParticipantEmail(relatorio) {
  const nome = relatorio.participant.firstName || relatorio.participant.name || '';
  const data = formatDate(relatorio.generatedAt);

  const dimensoes = relatorio.dimensions.map(linhaDimensao).join('');
  const fortes = listaItens(relatorio.strengths.items, COR.primary);
  const atencao = listaItens(relatorio.watchouts.items, COR.accent);

  const combinacoes = relatorio.overview.combinations
    .map((c) => `<p style="margin:0 0 12px;font:400 15px/1.7 ${FONTE};color:${COR.ink2}">${escapeHtml(c.text)}</p>`)
    .join('');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(CONFIG.email.subjectParticipant)}</title></head>
<body style="margin:0;padding:0;background:${COR.bg}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COR.bg};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${COR.surface};border-radius:16px;overflow:hidden;border:1px solid ${COR.line}">

      <tr><td style="background:${COR.primary};padding:28px 32px">
        <div style="font:400 12px/1.4 ${FONTE};color:#A9D6CE;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(CONFIG.brand.productName)}</div>
        <div style="font:600 24px/1.3 ${FONTE};color:#FFFFFF;margin-top:8px">Seu perfil comportamental</div>
        <div style="font:400 14px/1.5 ${FONTE};color:#C7E4DE;margin-top:6px">${escapeHtml(data)} · ${escapeHtml(relatorio.instrument)}</div>
      </td></tr>

      <tr><td style="padding:28px 32px 8px">
        <p style="margin:0 0 16px;font:400 16px/1.7 ${FONTE};color:${COR.ink}">
          ${nome ? `Olá, ${escapeHtml(nome)}.` : 'Olá.'}
        </p>
        <p style="margin:0 0 16px;font:400 15px/1.7 ${FONTE};color:${COR.ink2}">
          ${escapeHtml(relatorio.overview.summary)}
        </p>
        ${combinacoes}
      </td></tr>

      <tr><td style="padding:16px 32px 0">
        <div style="font:600 13px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:4px">As cinco dimensões</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${dimensoes}</table>
        <p style="margin:12px 0 0;font:400 12px/1.6 ${FONTE};color:${COR.muted}">
          Os valores são índices de 0 a 100, obtidos pela transformação linear da média das suas
          respostas. Não são percentis e não representam comparação com outras pessoas.
        </p>
      </td></tr>

      ${relatorio.strengths.items.length ? `
      <tr><td style="padding:28px 32px 0">
        <div style="font:600 13px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:12px">Potenciais pontos fortes</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${fortes}</table>
      </td></tr>` : ''}

      ${relatorio.watchouts.items.length ? `
      <tr><td style="padding:20px 32px 0">
        <div style="font:600 13px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:12px">Pontos de atenção</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${atencao}</table>
      </td></tr>` : ''}

      <tr><td style="padding:24px 32px 8px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COR.bg};border-radius:12px">
          <tr><td style="padding:18px 20px;font:400 14px/1.7 ${FONTE};color:${COR.ink2}">
            O relatório completo — com as seis facetas de cada dimensão, comunicação, trabalho em
            equipe, tomada de decisão e sugestões de desenvolvimento — continua disponível no seu
            navegador, no mesmo dispositivo em que você respondeu.
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 32px 32px">
        <p style="margin:0;font:400 12px/1.6 ${FONTE};color:${COR.muted};border-top:1px solid ${COR.line};padding-top:16px">
          ${escapeHtml(CONFIG.disclaimer)}
        </p>
        <p style="margin:12px 0 0;font:400 12px/1.6 ${FONTE};color:${COR.muted}">
          ${escapeHtml(CONFIG.brand.ownerName)} · ${escapeHtml(CONFIG.brand.ownerRole)}
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Versão em texto puro, para clientes que não renderizam HTML. */
export function buildParticipantText(relatorio) {
  const linhas = [
    `${CONFIG.brand.productName} — Seu perfil comportamental`,
    `${formatDate(relatorio.generatedAt)} · ${relatorio.instrument}`,
    '',
    relatorio.overview.summary,
    '',
    'AS CINCO DIMENSÕES (índice de 0 a 100, não é percentil)'
  ];

  relatorio.dimensions.forEach((d) => {
    linhas.push(`- ${d.name}: ${Math.round(d.index)}/100 — ${d.band.labelF}`);
  });

  if (relatorio.strengths.items.length) {
    linhas.push('', 'POTENCIAIS PONTOS FORTES');
    relatorio.strengths.items.forEach((i) => linhas.push(`- ${i.label}: ${i.text}`));
  }
  if (relatorio.watchouts.items.length) {
    linhas.push('', 'PONTOS DE ATENÇÃO');
    relatorio.watchouts.items.forEach((i) => linhas.push(`- ${i.label}: ${i.text}`));
  }

  linhas.push('', CONFIG.disclaimer);
  return linhas.join('\n');
}

/** Cópia de acompanhamento para o responsável pelo site. */
export function buildAdminEmail(relatorio, estado) {
  const p = relatorio.participant;

  const campo = (rotulo, valor) => `
    <tr>
      <td style="padding:6px 12px 6px 0;font:400 13px/1.5 ${FONTE};color:${COR.muted};white-space:nowrap">${escapeHtml(rotulo)}</td>
      <td style="padding:6px 0;font:500 14px/1.5 ${FONTE};color:${COR.ink}">${escapeHtml(valor || '—')}</td>
    </tr>`;

  const dimensoes = relatorio.dimensions
    .map(
      (d) => `
      <tr>
        <td style="padding:6px 12px 6px 0;font:400 14px/1.5 ${FONTE};color:${COR.ink2}">${escapeHtml(d.name)}</td>
        <td align="right" style="padding:6px 0;font:700 14px/1.5 ${FONTE};color:${COR.primary}">${Math.round(d.index)}<span style="color:${COR.muted};font-weight:400">/100</span></td>
        <td align="right" style="padding:6px 0 6px 12px;font:400 13px/1.5 ${FONTE};color:${COR.muted};white-space:nowrap">${escapeHtml(d.band.labelF)}</td>
      </tr>`
    )
    .join('');

  /** Facetas mais marcantes: as seis com maior distância do centro. */
  const facetasDestaque = relatorio.dimensions
    .flatMap((d) => d.facets.map((f) => ({ ...f, domainName: d.name })))
    .sort((a, b) => Math.abs(b.index - 50) - Math.abs(a.index - 50))
    .slice(0, 6)
    .map(
      (f) => `
      <tr>
        <td style="padding:4px 12px 4px 0;font:400 13px/1.5 ${FONTE};color:${COR.ink2}">${escapeHtml(f.name)} <span style="color:${COR.muted}">(${escapeHtml(f.domainName)})</span></td>
        <td align="right" style="padding:4px 0;font:600 13px/1.5 ${FONTE};color:${COR.ink}">${Math.round(f.index)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(CONFIG.email.subjectAdmin)}</title></head>
<body style="margin:0;padding:0;background:${COR.bg}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COR.bg};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${COR.surface};border-radius:14px;border:1px solid ${COR.line};padding:28px 32px">

      <tr><td style="padding-bottom:18px;border-bottom:1px solid ${COR.line}">
        <div style="font:600 18px/1.4 ${FONTE};color:${COR.ink}">Nova análise de perfil concluída</div>
        <div style="font:400 13px/1.5 ${FONTE};color:${COR.muted};margin-top:4px">${escapeHtml(formatDateTime(relatorio.generatedAt))}</div>
      </td></tr>

      <tr><td style="padding:18px 0 0">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${campo('Nome', p.name)}
          ${campo('E-mail', p.email)}
          ${campo('Telefone', p.phone ? formatPhone(p.phone) : '')}
          ${campo('Empresa', p.company)}
          ${campo('Cargo', p.role)}
          ${campo('AssessmentId', relatorio.assessmentId)}
          ${campo('Instrumento', `${relatorio.instrument} · ${relatorio.methodology.questions} itens`)}
          ${campo('Iniciada em', estado && estado.startedAt ? formatDateTime(estado.startedAt) : '')}
        </table>
      </td></tr>

      <tr><td style="padding:22px 0 0">
        <div style="font:600 12px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:6px">Resumo Big Five</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${dimensoes}</table>
        <p style="margin:8px 0 0;font:400 11px/1.5 ${FONTE};color:${COR.muted}">
          Estabilidade Emocional é o eixo invertido de Neuroticismo. Índices de 0 a 100, sem normatização populacional.
        </p>
      </td></tr>

      <tr><td style="padding:22px 0 0">
        <div style="font:600 12px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:6px">Principais facetas</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${facetasDestaque}</table>
      </td></tr>

      <tr><td style="padding:22px 0 0">
        <div style="font:600 12px/1.4 ${FONTE};color:${COR.muted};letter-spacing:.08em;text-transform:uppercase;padding-bottom:6px">Resumo comportamental</div>
        <p style="margin:0;font:400 14px/1.7 ${FONTE};color:${COR.ink2}">${escapeHtml(relatorio.overview.summary)}</p>
        ${relatorio.overview.combinations.map((c) => `<p style="margin:10px 0 0;font:400 14px/1.7 ${FONTE};color:${COR.ink2}">${escapeHtml(c.text)}</p>`).join('')}
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}
