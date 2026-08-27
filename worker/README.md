# Proxy de contato (Cloudflare Worker)

O site é estático (GitHub Pages) e **não consegue** enviar e-mail sozinho pelo Resend,
por dois motivos verificados na prática:

1. **CORS.** A API do Resend recusa chamada direta do navegador. O preflight
   `OPTIONS https://api.resend.com/emails` responde `401` **sem** o cabeçalho
   `Access-Control-Allow-Origin`, então o `fetch` morre antes do POST sair:

   ```
   Access to fetch at 'https://api.resend.com/emails' has been blocked by CORS policy:
   Response to preflight request doesn't pass access control check:
   No 'Access-Control-Allow-Origin' header is present on the requested resource.
   ```

2. **Segredo exposto.** Uma chave no JS do site é pública para qualquer visitante.
   O push protection do GitHub inclusive bloqueia o push nesse caso.

Este Worker resolve os dois: fica entre o site e o Resend, guarda a chave como
secret e devolve os cabeçalhos CORS que o navegador exige.

---

## Pré-requisito: verificar um domínio no Resend

> **Estado atual da conta `dnitservices` (conferido em 27/08/2026): nenhum domínio verificado.**

Sem domínio verificado só existe o remetente de teste `onboarding@resend.dev`, que
**só entrega para o e-mail dono da conta** (`pedrosouza.parceiro@dnitservices.com`).
Ou seja: mensagens para `mm.quim@gmail.com` não chegam.

Para o formulário funcionar de verdade:

1. Em <https://resend.com/domains> → **Add domain**, informe um domínio que você controle.
2. Publique no DNS do registrador os registros que o Resend mostrar (SPF, DKIM e, opcionalmente, DMARC).
3. Espere o status virar **Verified**.
4. Use um remetente desse domínio em `MAIL_FROM`, ex.: `contato@seudominio.com.br`.

---

## Deploy

```bash
npm install -g wrangler
wrangler login
```

Crie `wrangler.toml` nesta pasta:

```toml
name = "contato-mariana"
main = "contato-worker.js"
compatibility_date = "2026-01-01"

[vars]
MAIL_FROM        = "contato@seudominio.com.br"
MAIL_TO          = "mm.quim@gmail.com"
ORIGEM_PERMITIDA = "https://pedro381.github.io"
```

Grave a chave como secret (**nunca** em `[vars]`, nunca no repositório):

```bash
wrangler secret put RESEND_API_KEY
```

Publique:

```bash
wrangler deploy
```

---

## Ligar o site ao Worker

Em [`assets/js/main.js`](../assets/js/main.js), preencha o `endpoint`:

```js
var ENVIO = {
  endpoint: 'https://contato-mariana.SEU-SUB.workers.dev',
  destino:  'mm.quim@gmail.com'
};
```

Com o `endpoint` vazio (padrão), o formulário abre o programa de e-mail do
visitante com a mensagem pronta — funciona sem nenhum servidor.

---

## Testar

```bash
curl -X POST 'https://contato-mariana.SEU-SUB.workers.dev' \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Teste","email":"voce@exemplo.com","assunto":"Teste","mensagem":"Funcionando."}'
```

Resposta esperada: `{"ok":true}`.
