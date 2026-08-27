/**
 * Proxy de contato — Cloudflare Worker
 *
 * Existe por dois motivos:
 *  1. A API do Resend nao aceita chamada direta do navegador (o preflight
 *     CORS volta 401 sem Access-Control-Allow-Origin), entao o site
 *     estatico nao consegue enviar sozinho.
 *  2. A chave do Resend nao pode ficar no JS publico. Aqui ela vive como
 *     variavel de ambiente (secret) e nunca chega ao visitante.
 *
 * Deploy: ver worker/README.md
 *
 * Variaveis esperadas:
 *   RESEND_API_KEY  (secret)  chave re_... do Resend
 *   MAIL_FROM       (var)     remetente verificado, ex.: contato@seudominio.com
 *   MAIL_TO         (var)     destino, ex.: mm.quim@gmail.com
 *   ORIGIN_PERMITIDA(var)     ex.: https://pedro381.github.io
 */

const LIMITE_CARACTERES = 5000;

export default {
  async fetch(request, env) {
    const origem = env.ORIGEM_PERMITIDA || env.ORIGIN_PERMITIDA || '*';
    const cors = {
      'Access-Control-Allow-Origin': origem,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ message: 'Use POST.' }, 405, cors);
    }

    let d;
    try {
      d = await request.json();
    } catch {
      return json({ message: 'Corpo inválido.' }, 400, cors);
    }

    const nome = txt(d.nome), email = txt(d.email), mensagem = txt(d.mensagem);
    const telefone = txt(d.telefone), assunto = txt(d.assunto) || 'Contato pelo site';

    if (!nome || !email || !mensagem) {
      return json({ message: 'Preencha nome, e-mail e mensagem.' }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ message: 'E-mail inválido.' }, 400, cors);
    }
    // Anti-injecao de cabecalho: quebra de linha em campo de uma linha so.
    if (/[\r\n]/.test(email) || /[\r\n]/.test(nome)) {
      return json({ message: 'Conteúdo inválido.' }, 400, cors);
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        reply_to: email,
        subject: `Contato pelo site — ${assunto} — ${nome}`,
        html: corpoHtml({ nome, email, telefone, assunto, mensagem })
      })
    });

    if (!r.ok) {
      const erro = await r.text();
      console.error('Resend recusou:', r.status, erro);
      return json({ message: 'Não foi possível enviar agora.' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};

function txt(v) {
  return String(v == null ? '' : v).trim().slice(0, LIMITE_CARACTERES);
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function json(corpo, status, cors) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}

function corpoHtml(d) {
  const linha = (rotulo, valor) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5dcd0;width:110px;color:#6b7b78">${rotulo}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5dcd0">${esc(valor)}</td>
    </tr>`;

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#16201f;line-height:1.6">
  <h2 style="font-size:18px;margin:0 0 4px">Novo contato pelo site</h2>
  <p style="margin:0 0 18px;color:#6b7b78;font-size:13px">Assunto: <strong>${esc(d.assunto)}</strong></p>
  <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
    ${linha('Nome', d.nome)}
    ${linha('E-mail', d.email)}
    ${linha('Telefone', d.telefone || 'não informado')}
  </table>
  <p style="margin:18px 0 6px;color:#6b7b78;font-size:13px">Mensagem</p>
  <div style="padding:14px 16px;background:#f4eee5;border-radius:10px;white-space:pre-wrap">${esc(d.mensagem)}</div>
</div>`;
}
