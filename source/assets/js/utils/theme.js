/**
 * Alternador de tema claro/escuro.
 *
 * Por padrão a página segue a preferência do sistema operacional. Quando a
 * pessoa escolhe explicitamente, a escolha é gravada e passa a mandar.
 * A chave é a mesma usada pelo site principal, para que a preferência seja
 * respeitada nas duas partes.
 */

const CHAVE = 'mm-tema';

export function initTheme(botao) {
  const raiz = document.documentElement;

  let salvo = null;
  try {
    salvo = window.localStorage.getItem(CHAVE);
  } catch (erro) {
    /* janela anônima: segue a preferência do sistema */
  }
  if (salvo === 'dark' || salvo === 'light') {
    raiz.setAttribute('data-theme', salvo);
  }

  if (!botao) return;

  botao.addEventListener('click', () => {
    const atual = raiz.getAttribute('data-theme');
    const escuroNoSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const efetivo = atual || (escuroNoSistema ? 'dark' : 'light');
    const proximo = efetivo === 'dark' ? 'light' : 'dark';

    raiz.setAttribute('data-theme', proximo);
    try {
      window.localStorage.setItem(CHAVE, proximo);
    } catch (erro) {
      /* preferência não persistida; a troca continua valendo nesta sessão */
    }
  });
}
