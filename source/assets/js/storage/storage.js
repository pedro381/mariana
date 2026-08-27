/**
 * Serviço de persistência local.
 *
 * Toda a leitura e escrita de estado da avaliação passa por aqui. Nenhum outro
 * módulo deve tocar em `localStorage` diretamente.
 *
 * Decisões:
 * - o progresso real fica em `localStorage`, para sobreviver a recarregar a
 *   página, fechar a aba e fechar o navegador;
 * - `sessionStorage` guarda apenas conforto de interface (ex.: se um painel
 *   está aberto), nunca resposta nem resultado;
 * - toda escrita atualiza `updatedAt`;
 * - se o armazenamento estiver indisponível (janela anônima, cota cheia,
 *   cookies bloqueados), a aplicação continua funcionando em memória e avisa,
 *   em vez de quebrar.
 */

import { CONFIG } from '../config.js';

const KEY = CONFIG.storage.key;
const SESSION_KEY = CONFIG.storage.sessionKey;
const SCHEMA_VERSION = CONFIG.storage.schemaVersion;

/** Estado mantido em memória quando o localStorage não está disponível. */
let memoriaFallback = null;
let armazenamentoDisponivel = null;

/** Testa uma única vez se dá para gravar no localStorage. */
export function isStorageAvailable() {
  if (armazenamentoDisponivel !== null) return armazenamentoDisponivel;
  try {
    const teste = `${KEY}.__teste__`;
    window.localStorage.setItem(teste, '1');
    window.localStorage.removeItem(teste);
    armazenamentoDisponivel = true;
  } catch (erro) {
    armazenamentoDisponivel = false;
  }
  return armazenamentoDisponivel;
}

/** Identificador de avaliação, estável e sem dado pessoal. */
export function generateAssessmentId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  const aleatorio = window.crypto && window.crypto.getRandomValues
    ? Array.from(window.crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('')
    : Math.random().toString(16).slice(2, 18);
  return `${Date.now().toString(36)}-${aleatorio}`;
}

/** Estrutura inicial de uma avaliação nova. */
export function createEmptyState() {
  const agora = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    assessmentId: generateAssessmentId(),
    status: 'not_started',
    startedAt: agora,
    updatedAt: agora,
    completedAt: null,
    participant: { name: '', email: '', phone: '', company: '', role: '' },
    consent: { accepted: false, acceptedAt: null, text: null },
    progress: { currentQuestion: 1, totalQuestions: CONFIG.assessment.totalQuestions },
    answers: {},
    result: null,
    email: { status: 'pendente', attempts: 0, lastAttemptAt: null, lastError: null, sentAt: null }
  };
}

/** Lê o estado salvo. Devolve null se não houver nada utilizável. */
export function load() {
  if (!isStorageAvailable()) return memoriaFallback;
  try {
    const bruto = window.localStorage.getItem(KEY);
    if (!bruto) return null;
    const estado = JSON.parse(bruto);
    return migrate(estado);
  } catch (erro) {
    console.error('[storage] não foi possível ler o estado salvo:', erro);
    return null;
  }
}

/** Grava o estado, sempre atualizando `updatedAt`. */
export function save(estado) {
  const proximo = { ...estado, updatedAt: new Date().toISOString() };
  memoriaFallback = proximo;
  if (!isStorageAvailable()) return proximo;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(proximo));
  } catch (erro) {
    console.error('[storage] não foi possível salvar:', erro);
  }
  return proximo;
}

/** Aplica uma alteração parcial e salva. Devolve o estado novo. */
export function update(mudancas) {
  const atual = load() || createEmptyState();
  return save({ ...atual, ...mudancas });
}

/** Garante que existe um estado salvo e o devolve. */
export function ensureState() {
  const atual = load();
  if (atual) return atual;
  return save(createEmptyState());
}

/** Grava uma resposta e reposiciona o progresso. Retorna o estado novo. */
export function saveAnswer(questionId, valor, currentQuestion) {
  const atual = ensureState();
  const respostas = { ...atual.answers, [questionId]: valor };
  const progresso = {
    ...atual.progress,
    currentQuestion: currentQuestion || atual.progress.currentQuestion
  };
  return save({
    ...atual,
    answers: respostas,
    progress: progresso,
    status: atual.status === 'completed' ? 'completed' : 'in_progress'
  });
}

/** Move o cursor de navegação sem alterar respostas. */
export function saveCurrentQuestion(numero) {
  const atual = ensureState();
  return save({ ...atual, progress: { ...atual.progress, currentQuestion: numero } });
}

/** Salva os dados de identificação. */
export function saveParticipant(participante) {
  const atual = ensureState();
  return save({ ...atual, participant: { ...atual.participant, ...participante } });
}

/** Registra o aceite do consentimento, com a data e o texto aceito. */
export function saveConsent(aceito, textoResumo) {
  const atual = ensureState();
  return save({
    ...atual,
    consent: {
      accepted: Boolean(aceito),
      acceptedAt: aceito ? new Date().toISOString() : null,
      text: aceito ? (textoResumo || null) : null
    }
  });
}

/** Marca a avaliação como concluída e guarda o resultado calculado. */
export function saveResult(resultado, relatorio) {
  const atual = ensureState();
  return save({
    ...atual,
    status: 'completed',
    completedAt: atual.completedAt || new Date().toISOString(),
    result: resultado,
    report: relatorio || null
  });
}

/** Atualiza apenas o bloco de status de e-mail. */
export function saveEmailStatus(mudancas) {
  const atual = ensureState();
  return save({ ...atual, email: { ...atual.email, ...mudancas } });
}

/** Quantidade de respostas válidas gravadas. */
export function countAnswers(estado) {
  if (!estado || !estado.answers) return 0;
  return Object.values(estado.answers).filter(
    (v) => Number.isInteger(v) && v >= 1 && v <= 5
  ).length;
}

/** Existe avaliação começada e não concluída? */
export function hasResumableAssessment(estado) {
  if (!estado) return false;
  if (estado.status === 'completed') return false;
  return countAnswers(estado) > 0 || Boolean(estado.participant && estado.participant.name);
}

/** Apaga tudo o que a plataforma guardou neste dispositivo. */
export function clearAll() {
  memoriaFallback = null;
  if (!isStorageAvailable()) return true;
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    return true;
  } catch (erro) {
    console.error('[storage] não foi possível apagar os dados:', erro);
    return false;
  }
}

/** Preferências efêmeras de interface (não guardam resposta nem resultado). */
export const ui = {
  get(chave, padrao = null) {
    try {
      const bruto = window.sessionStorage.getItem(SESSION_KEY);
      if (!bruto) return padrao;
      const dados = JSON.parse(bruto);
      return chave in dados ? dados[chave] : padrao;
    } catch (erro) {
      return padrao;
    }
  },
  set(chave, valor) {
    try {
      const bruto = window.sessionStorage.getItem(SESSION_KEY);
      const dados = bruto ? JSON.parse(bruto) : {};
      dados[chave] = valor;
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(dados));
    } catch (erro) {
      /* preferência de interface não é crítica */
    }
  }
};

/**
 * Migração de esquema. Hoje só existe a versão 1; a função fica no lugar para
 * que uma mudança futura de formato não perca avaliações em andamento.
 */
function migrate(estado) {
  if (!estado || typeof estado !== 'object') return null;
  if (!estado.schemaVersion) estado.schemaVersion = SCHEMA_VERSION;
  if (!estado.email) {
    estado.email = { status: 'pendente', attempts: 0, lastAttemptAt: null, lastError: null, sentAt: null };
  }
  if (!estado.progress) {
    estado.progress = { currentQuestion: 1, totalQuestions: CONFIG.assessment.totalQuestions };
  }
  if (!estado.answers) estado.answers = {};
  return estado;
}
