/** Validações de formulário, sem dependência de DOM. */

/** Nome completo: pelo menos duas palavras com dois caracteres ou mais. */
export function isValidFullName(valor) {
  if (typeof valor !== 'string') return false;
  const partes = valor.trim().split(/\s+/).filter((p) => p.length >= 2);
  return partes.length >= 2 && valor.trim().length >= 5;
}

/**
 * E-mail. Verificação de formato, deliberadamente simples: valida a forma
 * `algo@dominio.tld` sem tentar cobrir toda a RFC 5322, o que gera mais falsos
 * negativos do que ajuda.
 */
export function isValidEmail(valor) {
  if (typeof valor !== 'string') return false;
  const limpo = valor.trim();
  if (limpo.length < 6 || limpo.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(limpo);
}

/** Telefone brasileiro, opcional: 10 ou 11 dígitos depois de limpar. */
export function isValidPhone(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') return true;
  const digitos = String(valor).replace(/\D/g, '');
  return digitos.length === 10 || digitos.length === 11;
}

/** Campo opcional de texto: aceita vazio, limita tamanho. */
export function isValidOptionalText(valor, maximo = 120) {
  if (valor === undefined || valor === null) return true;
  return String(valor).trim().length <= maximo;
}

/**
 * Valida o bloco de identificação inteiro.
 * @returns {{valid: boolean, errors: Object}} erros por campo
 */
export function validateParticipant(participante) {
  const p = participante || {};
  const errors = {};

  if (!isValidFullName(p.name)) {
    errors.name = 'Informe seu nome completo (nome e sobrenome).';
  }
  if (!isValidEmail(p.email)) {
    errors.email = 'Informe um e-mail válido — é para lá que o relatório será enviado.';
  }
  if (!isValidPhone(p.phone)) {
    errors.phone = 'Telefone inválido. Use DDD + número, ou deixe em branco.';
  }
  if (!isValidOptionalText(p.company)) {
    errors.company = 'Nome da empresa muito longo.';
  }
  if (!isValidOptionalText(p.role)) {
    errors.role = 'Cargo muito longo.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
