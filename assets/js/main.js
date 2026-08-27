/* =========================================================
   Mariana Magalhaes de Souza — comportamento da pagina
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     ENVIO DO FORMULARIO
     -------------------------------------------------------
     Tres caminhos, tentados nesta ordem:

     1. endpoint  — proxy proprio (ex.: Cloudflare Worker em
        worker/). E a melhor opcao: os dados do visitante nao
        passam por terceiros e a chave do Resend fica no
        servidor. Exige dominio verificado no Resend e uma
        conta na plataforma de funcoes.

     2. formsubmit — servico que aceita POST do navegador e
        reenvia por e-mail. Nao exige conta, dominio nem
        deploy; basta o dono do e-mail clicar uma vez no link
        de ativacao. Em troca, nome/e-mail/telefone do
        visitante trafegam por um terceiro — considere isso
        na politica de privacidade (LGPD).

     3. mailto — abre o programa de e-mail do visitante.
        Sempre disponivel como rede de seguranca.

     NUNCA coloque a chave do Resend neste arquivo: ele e
     publico, e a API do Resend tambem recusa chamada direta
     do navegador (o preflight CORS e barrado).
     ======================================================= */
  var ENVIO = {
    endpoint:   '',                    // ex.: 'https://contato-mariana.SEU-SUB.workers.dev'
    formsubmit: 'mm.quim@gmail.com',   // '' desliga; exige ativacao unica pelo dono do e-mail
    destino:    'mm.quim@gmail.com'
  };

  var WHATSAPP = '5531991817141';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Tema claro / escuro ---------- */
  (function theme() {
    var root = document.documentElement;
    var btn  = $('#themeBtn');
    var KEY  = 'mm-tema';

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* modo privado */ }
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var atual = root.getAttribute('data-theme');
      if (!atual) {
        var prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        atual = prefereEscuro ? 'dark' : 'light';
      }
      var novo = atual === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', novo);
      try { localStorage.setItem(KEY, novo); } catch (e) { /* ignora */ }
    });
  })();

  /* ---------- Menu mobile ---------- */
  (function menu() {
    var toggle = $('#navToggle');
    var links  = $('#navLinks');
    if (!toggle || !links) return;

    function fechar() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.innerHTML = '<svg aria-hidden="true"><use href="#i-menu"></use></svg>';
    }
    function abrir() {
      links.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      toggle.innerHTML = '<svg aria-hidden="true"><use href="#i-close"></use></svg>';
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('is-open')) fechar(); else abrir();
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', fechar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1120) fechar(); });
  })();

  /* ---------- Sombra na nav + botao voltar ao topo ---------- */
  (function scrollUI() {
    var nav   = $('#nav');
    var toTop = $('#toTop');

    function atualiza() {
      var y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-stuck', y > 8);
      if (toTop) toTop.classList.toggle('is-on', y > 700);
    }
    window.addEventListener('scroll', atualiza, { passive: true });
    atualiza();

    if (toTop) {
      toTop.addEventListener('click', function () {
        var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
      });
    }
  })();

  /* ---------- Link ativo conforme a secao visivel ---------- */
  (function activeLink() {
    var links = $$('#navLinks a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var mapa = {};
    var secoes = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { mapa[el.id] = a; secoes.push(el); }
    });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        if (mapa[en.target.id]) mapa[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    secoes.forEach(function (s) { obs.observe(s); });
  })();

  /* ---------- Animacao de entrada ---------- */
  (function reveal() {
    var alvos = $$('.reveal');
    if (!alvos.length) return;

    var semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semAnimacao || !('IntersectionObserver' in window)) {
      alvos.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    alvos.forEach(function (el) { obs.observe(el); });

    // Rede de seguranca: se algo falhar, o conteudo nunca fica invisivel.
    window.setTimeout(function () {
      $$('.reveal:not(.is-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 1200);
  })();

  /* ---------- Abas da Matriz Humana ---------- */
  (function tabs() {
    var abas = $$('.mtab');
    if (!abas.length) return;

    function seleciona(aba, focar) {
      abas.forEach(function (b) {
        var ativa = b === aba;
        b.setAttribute('aria-selected', ativa ? 'true' : 'false');
        b.tabIndex = ativa ? 0 : -1;
        var painel = document.getElementById(b.getAttribute('aria-controls'));
        if (painel) painel.hidden = !ativa;
      });
      if (focar) aba.focus();
    }

    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { seleciona(aba, false); });
      aba.addEventListener('keydown', function (e) {
        var passo = 0;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') passo = 1;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') passo = -1;
        else if (e.key === 'Home') { e.preventDefault(); seleciona(abas[0], true); return; }
        else if (e.key === 'End') { e.preventDefault(); seleciona(abas[abas.length - 1], true); return; }
        if (!passo) return;
        e.preventDefault();
        seleciona(abas[(i + passo + abas.length) % abas.length], true);
      });
    });
  })();

  /* ---------- "Ver todas as atividades" na trajetoria ---------- */
  (function timeline() {
    $$('.tl__more').forEach(function (btn) {
      var alvo = btn.parentElement ? $('.tl__collapse', btn.parentElement) : null;
      if (!alvo) return;
      var rotulo = $('svg', btn) ? btn.childNodes[0] : null;

      btn.addEventListener('click', function () {
        var aberto = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        alvo.hidden = aberto;
        if (rotulo) rotulo.nodeValue = aberto ? 'Ver todas as atividades ' : 'Ver menos ';
      });
    });
  })();

  /* ---------- Ano no rodape ---------- */
  (function ano() {
    var el = $('#ano');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  /* =======================================================
     FORMULARIO DE CONTATO
     ======================================================= */
  (function formulario() {
    var form = $('#contatoForm');
    if (!form) return;

    var btn    = $('#formBtn');
    var btnTxt = $('#formBtnTxt');
    var status = $('#formStatus');

    function escapar(txt) {
      return String(txt == null ? '' : txt)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function mostrar(tipo, html) {
      if (!status) return;
      status.hidden = false;
      status.className = 'form__status form__status--' + tipo;
      status.innerHTML = html;
    }

    function ocupado(sim) {
      if (btn) btn.disabled = sim;
      if (btnTxt) btnTxt.textContent = sim ? 'Enviando...' : 'Enviar mensagem';
    }

    function montarMailto(d) {
      var corpo =
        'Nome: ' + d.nome + '\n' +
        'E-mail: ' + d.email + '\n' +
        'Telefone: ' + (d.telefone || 'não informado') + '\n' +
        'Assunto: ' + d.assunto + '\n\n' +
        d.mensagem;
      return 'mailto:' + ENVIO.destino +
        '?subject=' + encodeURIComponent('Contato pelo site — ' + d.assunto) +
        '&body=' + encodeURIComponent(corpo);
    }

    function montarWhatsapp(d) {
      return 'https://wa.me/' + WHATSAPP + '?text=' +
        encodeURIComponent('Olá, Mariana! Sou ' + d.nome + '. ' + d.mensagem);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var d = {
        nome:     ($('#f-nome').value  || '').trim(),
        email:    ($('#f-email').value || '').trim(),
        telefone: ($('#f-fone').value  || '').trim(),
        assunto:  $('#f-assunto').value,
        mensagem: ($('#f-msg').value   || '').trim()
      };

      if (!d.nome || !d.email || !d.mensagem) {
        mostrar('erro', 'Preencha nome, e-mail e mensagem para eu conseguir te responder.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
        mostrar('erro', 'Confere o e-mail, por favor — parece estar incompleto.');
        return;
      }

      // Nenhum canal automatico: abre o e-mail do visitante com tudo preenchido.
      if (!ENVIO.endpoint && !ENVIO.formsubmit) {
        window.location.href = montarMailto(d);
        mostrar('ok',
          'Abri seu programa de e-mail com a mensagem pronta — é só enviar. ' +
          'Se não abriu, <a href="' + montarWhatsapp(d) + '" target="_blank" rel="noopener">fale comigo no WhatsApp</a>.');
        return;
      }

      ocupado(true);
      mostrar('info', 'Enviando sua mensagem...');

      var requisicao = ENVIO.endpoint
        ? fetch(ENVIO.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(d)
          })
        : fetch('https://formsubmit.co/ajax/' + encodeURIComponent(ENVIO.formsubmit), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              _subject: 'Contato pelo site — ' + d.assunto + ' — ' + d.nome,
              _template: 'table',
              _captcha: 'false',
              // Sem isto, responder ao e-mail recebido vai para o FormSubmit,
              // e nao para a pessoa que preencheu o formulario.
              _replyto: d.email,
              Nome: d.nome,
              'E-mail': d.email,
              Telefone: d.telefone || 'não informado',
              Assunto: d.assunto,
              Mensagem: d.mensagem
            })
          });

      requisicao
        .then(function (r) {
          return r.text().then(function (t) {
            var corpo = {};
            try { corpo = JSON.parse(t); } catch (err) { corpo = { message: t }; }
            return { ok: r.ok, status: r.status, corpo: corpo };
          });
        })
        .then(function (res) {
          // O FormSubmit responde HTTP 200 mesmo quando recusa: o que vale e o campo success.
          var recusado = res.corpo && String(res.corpo.success) === 'false';
          if (!res.ok || recusado) {
            throw new Error(res.corpo.message || ('HTTP ' + res.status));
          }
          ocupado(false);
          form.reset();
          mostrar('ok', 'Mensagem enviada. Vou te responder no e-mail que você informou.');
        })
        .catch(function (err) {
          ocupado(false);
          console.error('[contato] falha no envio:', err);
          mostrar('erro',
            'Não consegui enviar por aqui. Você pode ' +
            '<a href="' + montarMailto(d) + '">abrir no seu e-mail</a> ou ' +
            '<a href="' + montarWhatsapp(d) + '" target="_blank" rel="noopener">falar comigo no WhatsApp</a>.');
        });
    });
  })();

})();
