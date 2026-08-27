/**
 * Configuração central da plataforma.
 *
 * Tudo o que é ajustável (marca, contatos, endpoint de e-mail, chave de
 * armazenamento, limites de classificação) vive aqui ou em
 * `scoring/classifications.js`. Nenhum outro arquivo deve conter endereços de
 * e-mail, URLs de serviço ou textos institucionais espalhados.
 *
 * SEGURANÇA — leia antes de configurar o envio de e-mail:
 * Nenhuma credencial (API key do Resend ou de qualquer serviço) pode aparecer
 * neste arquivo, no HTML ou em qualquer JavaScript entregue ao navegador.
 * O site é estático e público: tudo aqui é visível para qualquer visitante.
 * O envio é feito por POST para `email.endpoint`, uma função serverless que
 * guarda a chave do lado do servidor. Ver `servidor/enviar-relatorio.js` e a
 * seção "Envio de e-mail" do README.md.
 */

export const CONFIG = Object.freeze({
  /** Identidade do produto. */
  brand: Object.freeze({
    productName: 'Análise de Perfil Comportamental',
    productShort: 'Perfil Comportamental',
    ownerName: 'Mariana Magalhães de Souza',
    ownerRole: 'Engenharia da Qualidade e Desenvolvimento Humano',
    siteUrl: '../index.html',
    siteLabel: 'Voltar ao site'
  }),

  /** Parâmetros do inventário aplicado. */
  assessment: Object.freeze({
    instrument: 'IPIP-NEO-120',
    instrumentLong: 'IPIP-NEO-120 (Johnson) — International Personality Item Pool',
    model: 'Big Five / Five-Factor Model',
    totalQuestions: 120,
    estimatedMinutes: 15,
    /** Quantas questões por tela. 1 = uma pergunta por vez. */
    questionsPerScreen: 1
  }),

  /** Persistência local. */
  storage: Object.freeze({
    key: 'perfilComportamental.assessment.v1',
    sessionKey: 'perfilComportamental.ui.v1',
    schemaVersion: 1
  }),

  /**
   * Envio de e-mail.
   *
   * endpoint — URL da função serverless que fala com o Resend. Deixe string
   *            vazia enquanto não houver função publicada: a plataforma
   *            continua funcionando, o relatório é gerado e salvo, e a
   *            interface avisa que o envio não está configurado.
   * adminEmail — cópia para o responsável pelo site (endereço único, aqui).
   * fromLabel  — nome exibido como remetente (o endereço real fica no servidor).
   */
  email: Object.freeze({
    endpoint: '',
    adminEmail: 'mm.quim@gmail.com',
    fromLabel: 'Mariana Magalhães de Souza',
    subjectParticipant: 'Seu relatório de perfil comportamental',
    subjectAdmin: 'Nova análise de perfil concluída',
    /** Tentativas automáticas antes de oferecer o botão de reenvio manual. */
    maxAutoAttempts: 2,
    timeoutMs: 20000
  }),

  /** Links institucionais usados no consentimento e no rodapé. */
  links: Object.freeze({
    privacidade: 'privacidade.html',
    whatsapp: 'https://wa.me/5531991817141',
    contatoEmail: 'mm.quim@gmail.com'
  }),

  /** Aviso obrigatório exibido no relatório e no e-mail. */
  disclaimer:
    'Esta avaliação possui finalidade informativa e de autoconhecimento comportamental. '
    + 'O resultado não constitui diagnóstico psicológico, laudo psicológico ou avaliação '
    + 'clínica e não deve ser utilizado isoladamente para decisões de alto impacto.',

  /**
   * Modo de desenvolvimento: liga as validações de integridade do banco de
   * itens no console. Ativo em localhost/127.0.0.1 ou com ?dev=1 na URL.
   */
  get devMode() {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1' || host === '';
    return local || new URLSearchParams(window.location.search).has('dev');
  }
});

export default CONFIG;
