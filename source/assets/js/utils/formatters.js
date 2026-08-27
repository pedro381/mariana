/** Formatação de texto, números e datas — sem dependência de DOM. */

/** Escapa texto para inserção segura em HTML. */
export function escapeHtml(valor) {
  return String(valor === undefined || valor === null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Primeiro nome, capitalizado, para tratamento pessoal na interface. */
export function firstName(nomeCompleto) {
  if (!nomeCompleto) return '';
  const primeiro = String(nomeCompleto).trim().split(/\s+/)[0] || '';
  if (!primeiro) return '';
  return primeiro.charAt(0).toLocaleUpperCase('pt-BR') + primeiro.slice(1).toLocaleLowerCase('pt-BR');
}

/** Índice no formato usado em toda a interface: "78" ou "78,5". */
export function formatIndex(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  const arredondado = Math.round(valor);
  return String(arredondado);
}

/** Número com uma casa decimal em vírgula (padrão brasileiro). */
export function formatDecimal(valor, casas = 2) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

/** Data por extenso: "27 de agosto de 2026". */
export function formatDate(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Data e hora curtas: "27/08/2026 às 14:32". */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  const dia = data.toLocaleDateString('pt-BR');
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} às ${hora}`;
}

/** Percentual inteiro de conclusão. */
export function formatPercent(parte, total) {
  if (!total) return '0%';
  return `${Math.round((parte / total) * 100)}%`;
}

/** Telefone brasileiro formatado, quando possível. */
export function formatPhone(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return valor || '';
}

/** Une itens em lista natural: "a, b e c". */
export function joinList(itens) {
  const lista = (itens || []).filter(Boolean);
  if (lista.length === 0) return '';
  if (lista.length === 1) return lista[0];
  return `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}`;
}

/** Concordância do rótulo de faixa com o gênero do substantivo da dimensão. */
export function bandLabel(band, genero = 'm') {
  if (!band) return '—';
  return genero === 'f' ? band.labelF : band.label;
}
