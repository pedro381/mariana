/**
 * Função serverless de envio do relatório — IMPLEMENTAÇÃO DE REFERÊNCIA.
 *
 * ATENÇÃO: este arquivo NÃO é executado pelo site. Ele não é servido ao
 * navegador nem carregado por nenhuma página. É o código que deve ser
 * publicado em uma plataforma de funções (Vercel, Netlify, Cloudflare
 * Workers) para que o envio por e-mail funcione com segurança.
 *
 * Por que existe uma função no meio do caminho:
 * a chave da API do Resend permite enviar e-mail em nome do domínio. Colocada
 * em qualquer arquivo entregue ao navegador — HTML, JS, JSON — ela fica
 * visível para todo visitante e pode ser copiada e usada por terceiros. O site
 * continua estático; apenas o envio passa por aqui, onde a chave fica em
 * variável de ambiente do servidor.
 *
 * Variáveis de ambiente esperadas:
 *   RESEND_API_KEY   chave do Resend (secreta)
 *   MAIL_FROM        remetente verificado, ex.: "Mariana <perfil@seudominio.com.br>"
 *   ADMIN_EMAIL      destino da cópia administrativa
 *   ALLOWED_ORIGIN   origem autorizada, ex.: "https://seudominio.com.br"
 *
 * Depois de publicar, preencha `email.endpoint` em `assets/js/config.js` com a
 * URL da função.
 *
 * ---------------------------------------------------------------------------
 * Formato recebido (POST, JSON) — ver `assets/js/email/email.js`:
 * {
 *   idempotencyKey: "uuid",
 *   assessmentId:   "uuid",
 *   participant:    { name, email, phone, company, role },
 *   messages: [
 *     { role: "participant", to, subject, html, text },
 *     { role: "admin",       to, subject, html, replyTo }
 *   ]
 * }
 * ---------------------------------------------------------------------------
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Memória de idempotência do processo. Serve para o caso comum — duplo clique,
 * nova tentativa logo em seguida. Em produção com múltiplas instâncias, troque
 * por um armazenamento compartilhado (KV, Redis) com validade de algumas horas.
 */
const jaEnviados = new Map();
const JANELA_IDEMPOTENCIA_MS = 6 * 60 * 60 * 1000;

export default async function handler(request) {
  const origem = process.env.ALLOWED_ORIGIN || '*';

  const cabecalhos = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origem,
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cabecalhos });
  }
  if (request.method !== 'POST') {
    return json({ message: 'Método não permitido.' }, 405, cabecalhos);
  }

  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.MAIL_FROM;
  if (!chave || !remetente) {
    console.error('[enviar-relatorio] RESEND_API_KEY ou MAIL_FROM ausente no ambiente.');
    return json({ message: 'Serviço de envio não configurado.' }, 500, cabecalhos);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (erro) {
    return json({ message: 'Corpo da requisição inválido.' }, 400, cabecalhos);
  }

  const problema = validar(payload);
  if (problema) {
    return json({ message: problema }, 400, cabecalhos);
  }

  /* Idempotência: a mesma avaliação não gera dois envios. */
  limparExpirados();
  const idem = String(payload.idempotencyKey);
  if (jaEnviados.has(idem)) {
    return json({ message: 'Relatório já enviado.', duplicated: true }, 200, cabecalhos);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const resultados = [];

  for (const mensagem of payload.messages) {
    /* O destino administrativo vem do ambiente, nunca do navegador. */
    const destino = mensagem.role === 'admin' ? (adminEmail || mensagem.to) : mensagem.to;

    const corpo = {
      from: remetente,
      to: [destino],
      subject: mensagem.subject,
      html: mensagem.html
    };
    if (mensagem.text) corpo.text = mensagem.text;
    if (mensagem.replyTo) corpo.reply_to = mensagem.replyTo;

    try {
      const resposta = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chave}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `${idem}-${mensagem.role}`
        },
        body: JSON.stringify(corpo)
      });

      const texto = await resposta.text();
      let dados = {};
      try { dados = texto ? JSON.parse(texto) : {}; } catch (erro) { dados = { raw: texto }; }

      resultados.push({ role: mensagem.role, ok: resposta.ok, id: dados.id || null, status: resposta.status });

      if (!resposta.ok) {
        console.error('[enviar-relatorio] Resend recusou o envio:', resposta.status, dados);
      }
    } catch (erro) {
      console.error('[enviar-relatorio] falha de rede ao contatar o Resend:', erro);
      resultados.push({ role: mensagem.role, ok: false, status: 0 });
    }
  }

  /*
   * O envio ao participante é o que determina o sucesso: se o relatório chegou
   * a quem respondeu, a operação cumpriu seu objetivo, mesmo que a cópia
   * administrativa tenha falhado (o que fica registrado no log).
   */
  const participante = resultados.find((r) => r.role === 'participant');
  const sucesso = participante ? participante.ok : resultados.every((r) => r.ok);

  if (sucesso) {
    jaEnviados.set(idem, Date.now());
    return json({ message: 'Relatório enviado.', results: resultados }, 200, cabecalhos);
  }

  return json({ message: 'O serviço de e-mail recusou o envio.', results: resultados }, 502, cabecalhos);
}

/* ---------- auxiliares ---------- */

function validar(payload) {
  if (!payload || typeof payload !== 'object') return 'Payload ausente.';
  if (!payload.idempotencyKey) return 'idempotencyKey ausente.';
  if (!Array.isArray(payload.messages) || payload.messages.length === 0) return 'Nenhuma mensagem informada.';
  if (payload.messages.length > 2) return 'Quantidade de mensagens acima do permitido.';

  for (const m of payload.messages) {
    if (!m.to || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(m.to))) return 'Destinatário inválido.';
    if (!m.subject || String(m.subject).length > 200) return 'Assunto inválido.';
    if (!m.html || String(m.html).length > 400000) return 'Conteúdo inválido.';
  }
  return null;
}

function limparExpirados() {
  const agora = Date.now();
  for (const [chave, quando] of jaEnviados) {
    if (agora - quando > JANELA_IDEMPOTENCIA_MS) jaEnviados.delete(chave);
  }
}

function json(corpo, status, cabecalhos) {
  return new Response(JSON.stringify(corpo), { status, headers: cabecalhos });
}

/**
 * Adaptação por plataforma
 * ------------------------
 * Vercel (Edge Functions) — salve como `api/enviar-relatorio.js` e adicione:
 *     export const config = { runtime: 'edge' };
 *
 * Cloudflare Workers — troque a assinatura por:
 *     export default { async fetch(request, env) { ... } }
 *   e leia as variáveis de `env` em vez de `process.env`.
 *
 * Netlify Functions — salve como `netlify/functions/enviar-relatorio.mjs`.
 *   O formato Request/Response já é o esperado.
 */
