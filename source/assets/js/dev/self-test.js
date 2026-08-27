/**
 * Verificações internas de integridade.
 *
 * Rodam automaticamente em modo de desenvolvimento (localhost ou `?dev=1`) e
 * escrevem no console. A página `testes.html` executa o mesmo conjunto com
 * saída visual.
 *
 * Não é um framework de testes — é uma rede de proteção contra o tipo de erro
 * que passa despercebido e corrompe todos os resultados: um item duplicado,
 * uma faceta faltando, uma inversão que deixou de acontecer.
 */

import { QUESTIONS, TOTAL_QUESTIONS, QUESTIONS_BY_ID } from '../data/questions.js';
import { DOMAINS, DOMAIN_ORDER } from '../data/domains.js';
import { scoreAnswer, processAnswers, isValidAnswer, findMissingAnswers } from '../scoring/scoring-engine.js';
import { calculateBigFive } from '../scoring/big-five.js';
import { meanToIndex, invertIndex, classify, BANDS } from '../scoring/classifications.js';
import { generateReport } from '../report/report-generator.js';

const DOMINIOS_VALIDOS = ['O', 'C', 'E', 'A', 'N'];
const DIRECOES_VALIDAS = ['plus', 'minus'];

/** Executa todas as verificações e devolve o relatório de resultados. */
export function runAllChecks() {
  const testes = [];
  const check = (nome, fn) => {
    try {
      const detalhe = fn();
      testes.push({ nome, ok: true, detalhe: detalhe || 'ok' });
    } catch (erro) {
      testes.push({ nome, ok: false, detalhe: erro.message });
    }
  };

  /* ---------- Banco de itens ---------- */

  check('Total de 120 itens', () => {
    assert(TOTAL_QUESTIONS === 120, `esperado 120, encontrado ${TOTAL_QUESTIONS}`);
    return `${TOTAL_QUESTIONS} itens`;
  });

  check('Identificadores únicos', () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    assert(ids.size === QUESTIONS.length, `${QUESTIONS.length - ids.size} identificador(es) duplicado(s)`);
    return `${ids.size} ids distintos`;
  });

  check('Numeração canônica 1..120 sem falhas', () => {
    QUESTIONS.forEach((q, i) => {
      assert(q.num === i + 1, `item na posição ${i + 1} tem num=${q.num}`);
    });
    return 'sequência íntegra';
  });

  check('Todo item tem domínio válido', () => {
    const invalidos = QUESTIONS.filter((q) => !DOMINIOS_VALIDOS.includes(q.domain));
    assert(invalidos.length === 0, `${invalidos.length} item(ns) com domínio inválido`);
    return 'O, C, E, A, N';
  });

  check('Todo item tem faceta de 1 a 6', () => {
    const invalidos = QUESTIONS.filter(
      (q) => !Number.isInteger(q.facet) || q.facet < 1 || q.facet > 6
    );
    assert(invalidos.length === 0, `${invalidos.length} item(ns) com faceta inválida`);
    return 'facetas 1–6';
  });

  check('Todo item tem direção declarada', () => {
    const invalidos = QUESTIONS.filter((q) => !DIRECOES_VALIDAS.includes(q.keyed));
    assert(invalidos.length === 0, `${invalidos.length} item(ns) sem keyed plus/minus`);
    const plus = QUESTIONS.filter((q) => q.keyed === 'plus').length;
    return `${plus} diretos, ${QUESTIONS.length - plus} invertidos`;
  });

  check('Nenhum texto vazio', () => {
    const vazios = QUESTIONS.filter((q) => !q.text || !q.text.trim());
    assert(vazios.length === 0, `${vazios.length} item(ns) sem texto`);
    return 'todos preenchidos';
  });

  check('Nenhum texto duplicado', () => {
    const textos = new Set(QUESTIONS.map((q) => q.text.trim().toLowerCase()));
    assert(
      textos.size === QUESTIONS.length,
      `${QUESTIONS.length - textos.size} texto(s) repetido(s)`
    );
    return 'todos distintos';
  });

  check('Distribuição 24 itens por domínio', () => {
    DOMINIOS_VALIDOS.forEach((d) => {
      const total = QUESTIONS.filter((q) => q.domain === d).length;
      assert(total === 24, `domínio ${d} tem ${total} itens, esperado 24`);
    });
    return '5 × 24 = 120';
  });

  check('Distribuição 4 itens por faceta', () => {
    DOMINIOS_VALIDOS.forEach((d) => {
      for (let f = 1; f <= 6; f += 1) {
        const total = QUESTIONS.filter((q) => q.domain === d && q.facet === f).length;
        assert(total === 4, `faceta ${d}${f} tem ${total} itens, esperado 4`);
      }
    });
    return '30 × 4 = 120';
  });

  check('Metadados cobrem as 30 facetas', () => {
    DOMAIN_ORDER.forEach((d) => {
      const meta = DOMAINS[d];
      assert(meta, `domínio ${d} sem metadados`);
      assert(meta.facets.length === 6, `domínio ${d} tem ${meta.facets.length} facetas descritas`);
      meta.facets.forEach((f) => {
        assert(f.name && f.name.trim(), `faceta ${d}${f.n} sem nome`);
      });
    });
    return '30 facetas nomeadas';
  });

  check('Índice por id resolve todos os itens', () => {
    QUESTIONS.forEach((q) => {
      assert(QUESTIONS_BY_ID[q.id] === q, `id ${q.id} não resolve para o item correto`);
    });
    return 'índice consistente';
  });

  /* ---------- Reversão e escala ---------- */

  check('Item direto preserva a resposta', () => {
    [1, 2, 3, 4, 5].forEach((v) => {
      assert(scoreAnswer(v, 'plus') === v, `plus: ${v} virou ${scoreAnswer(v, 'plus')}`);
    });
    return '1→1 … 5→5';
  });

  check('Item invertido espelha a resposta', () => {
    const esperado = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 };
    Object.entries(esperado).forEach(([entrada, saida]) => {
      const obtido = scoreAnswer(Number(entrada), 'minus');
      assert(obtido === saida, `minus: ${entrada} virou ${obtido}, esperado ${saida}`);
    });
    return '1→5 · 2→4 · 3→3 · 4→2 · 5→1';
  });

  check('Validação rejeita respostas fora de 1–5', () => {
    [0, 6, -1, 2.5, null, undefined, '4', NaN].forEach((v) => {
      assert(!isValidAnswer(v), `aceitou valor inválido: ${String(v)}`);
    });
    [1, 2, 3, 4, 5].forEach((v) => {
      assert(isValidAnswer(v), `rejeitou valor válido: ${v}`);
    });
    return 'apenas inteiros de 1 a 5';
  });

  check('Transformação média → índice', () => {
    assert(meanToIndex(1) === 0, `média 1 deveria dar 0, deu ${meanToIndex(1)}`);
    assert(meanToIndex(3) === 50, `média 3 deveria dar 50, deu ${meanToIndex(3)}`);
    assert(meanToIndex(5) === 100, `média 5 deveria dar 100, deu ${meanToIndex(5)}`);
    assert(invertIndex(70) === 30, 'inversão de índice incorreta');
    return '1→0 · 3→50 · 5→100';
  });

  check('Faixas de classificação cobrem 0 a 100 sem lacuna', () => {
    for (let i = 0; i <= 100; i += 1) {
      const faixa = classify(i);
      assert(faixa, `índice ${i} sem faixa correspondente`);
    }
    for (let i = 1; i < BANDS.length; i += 1) {
      assert(
        BANDS[i].min === BANDS[i - 1].max,
        `lacuna entre ${BANDS[i - 1].id} e ${BANDS[i].id}`
      );
    }
    return `${BANDS.length} faixas contíguas`;
  });

  /* ---------- Agregação ---------- */

  check('Agrupamento por domínio e faceta', () => {
    const respostas = respostasUniformes(3);
    const agregado = processAnswers(QUESTIONS, respostas);
    DOMINIOS_VALIDOS.forEach((d) => {
      assert(agregado[d].count === 24, `domínio ${d} agregou ${agregado[d].count} itens`);
      for (let f = 1; f <= 6; f += 1) {
        assert(agregado[d].facets[f].count === 4, `faceta ${d}${f} agregou ${agregado[d].facets[f].count} itens`);
      }
    });
    return '5 domínios · 30 facetas';
  });

  check('Respostas neutras produzem índice 50 em tudo', () => {
    const resultado = calculateBigFive(respostasUniformes(3));
    resultado.domains.forEach((d) => {
      assert(d.index === 50, `${d.key} deu ${d.index}, esperado 50`);
      d.facets.forEach((f) => {
        assert(f.index === 50, `faceta ${d.key}${f.n} deu ${f.index}, esperado 50`);
      });
    });
    return 'tudo em 50 — neutro';
  });

  check('Todas as respostas no máximo produzem extremos coerentes', () => {
    const resultado = calculateBigFive(respostasUniformes(5));
    resultado.domains.forEach((d) => {
      /*
       * Com 5 em todos os itens, os invertidos viram 1. O índice resultante
       * depende de quantos itens invertidos o domínio tem, então o que se
       * verifica aqui é a coerência: soma dentro da faixa possível e média
       * compatível com o índice.
       */
      assert(d.raw >= d.count && d.raw <= d.count * 5, `${d.key}: soma ${d.raw} fora da faixa possível`);
      const esperado = meanToIndex(d.mean);
      const exibido = d.inverted ? invertIndex(esperado) : esperado;
      assert(
        Math.abs(d.index - exibido) < 0.01,
        `${d.key}: índice ${d.index} incompatível com a média ${d.mean}`
      );
    });
    return 'somas e índices coerentes';
  });

  check('Estabilidade Emocional é o inverso de Neuroticismo', () => {
    const resultado = calculateBigFive(respostasVariadas());
    const n = resultado.byKey.N;
    assert(n.inverted === true, 'domínio N não está marcado como invertido');
    assert(
      Math.abs(n.index - (100 - n.measuredIndex)) < 0.01,
      `índice exibido ${n.index} não corresponde a 100 − ${n.measuredIndex}`
    );
    return `neuroticismo ${n.measuredIndex} → estabilidade ${n.index}`;
  });

  check('Avaliação incompleta é recusada', () => {
    const respostas = respostasUniformes(3);
    delete respostas[QUESTIONS[7].id];
    let recusou = false;
    try {
      calculateBigFive(respostas);
    } catch (erro) {
      recusou = erro.code === 'INCOMPLETE';
    }
    assert(recusou, 'o cálculo aceitou uma avaliação incompleta');
    const faltando = findMissingAnswers(QUESTIONS, respostas);
    assert(faltando.length === 1, `esperado 1 item faltando, encontrado ${faltando.length}`);
    return 'bloqueio funcionando';
  });

  check('Resposta fora da escala é recusada', () => {
    const respostas = respostasUniformes(3);
    respostas[QUESTIONS[0].id] = 9;
    let recusou = false;
    try {
      calculateBigFive(respostas);
    } catch (erro) {
      recusou = true;
    }
    assert(recusou, 'o cálculo aceitou uma resposta fora de 1–5');
    return 'validação ativa';
  });

  /* ---------- Determinismo ---------- */

  check('Cálculo é determinístico', () => {
    const respostas = respostasVariadas();
    const a = JSON.stringify(calculateBigFive(respostas));
    const b = JSON.stringify(calculateBigFive(respostas));
    assert(a === b, 'duas execuções produziram resultados diferentes');
    return 'duas execuções idênticas';
  });

  check('Relatório é determinístico', () => {
    const respostas = respostasVariadas();
    const participante = { name: 'Fulano de Tal', email: 'fulano@exemplo.com' };
    const meta = { assessmentId: 'teste', completedAt: '2026-01-01T00:00:00.000Z' };
    const a = JSON.stringify(generateReport(calculateBigFive(respostas), participante, meta));
    const b = JSON.stringify(generateReport(calculateBigFive(respostas), participante, meta));
    assert(a === b, 'dois relatórios diferentes para as mesmas respostas');
    return 'mesmo relatório nas duas execuções';
  });

  check('Relatório traz todas as seções obrigatórias', () => {
    const relatorio = generateReport(
      calculateBigFive(respostasVariadas()),
      { name: 'Fulano de Tal', email: 'fulano@exemplo.com' },
      { assessmentId: 'teste' }
    );
    assert(relatorio.dimensions.length === 5, 'faltam dimensões no relatório');
    relatorio.dimensions.forEach((d) => {
      assert(d.facets.length === 6, `dimensão ${d.key} com ${d.facets.length} facetas`);
      assert(d.meaning, `dimensão ${d.key} sem texto interpretativo`);
    });
    const ids = relatorio.sections.map((s) => s.id);
    ['trabalho', 'comunicacao', 'equipe', 'lideranca', 'decisao'].forEach((id) => {
      assert(ids.includes(id), `seção ausente: ${id}`);
    });
    assert(relatorio.development.items.length > 0, 'sem sugestões de desenvolvimento');
    assert(relatorio.disclaimer, 'sem aviso sobre a natureza do resultado');
    return `${relatorio.sections.length} seções temáticas`;
  });

  check('Nenhuma seção do relatório fica vazia, em nenhum perfil', () => {
    const cenarios = [
      ...[1, 2, 3, 4, 5].map((v) => ({ nome: `uniforme ${v}`, respostas: respostasUniformes(v) })),
      { nome: 'variado', respostas: respostasVariadas() },
      { nome: 'alternado', respostas: respostasAlternadas() }
    ];

    cenarios.forEach(({ nome, respostas }) => {
      const relatorio = generateReport(
        calculateBigFive(respostas),
        { name: 'Fulano de Tal', email: 'fulano@exemplo.com' },
        {}
      );
      assert(relatorio.overview.summary, `${nome}: sem visão geral`);
      assert(relatorio.overview.combinations.length > 0, `${nome}: sem leitura combinada`);
      assert(relatorio.development.items.length > 0, `${nome}: sem sugestões de desenvolvimento`);
      relatorio.sections.forEach((s) => {
        assert(s.items.length > 0, `${nome}: seção ${s.id} vazia`);
      });
      relatorio.dimensions.forEach((d) => {
        assert(d.meaning, `${nome}: dimensão ${d.key} sem interpretação`);
        d.facets.forEach((f) => {
          assert(f.interpretation, `${nome}: faceta ${d.key}${f.n} sem interpretação`);
        });
      });
    });
    return `${cenarios.length} perfis verificados`;
  });

  const falhas = testes.filter((t) => !t.ok);
  return { testes, total: testes.length, falhas: falhas.length, ok: falhas.length === 0 };
}

/** Executa e reporta no console. Chamado na inicialização em modo dev. */
export function runIntegrityCheck() {
  const resultado = runAllChecks();

  if (resultado.ok) {
    console.info(
      `%c✓ Perfil Comportamental — ${resultado.total} verificações de integridade passaram.`,
      'color:#0F5751;font-weight:600'
    );
    return resultado;
  }

  console.group(
    `%c✕ Perfil Comportamental — ${resultado.falhas} de ${resultado.total} verificações falharam.`,
    'color:#A3352A;font-weight:600'
  );
  resultado.testes.filter((t) => !t.ok).forEach((t) => {
    console.error(`${t.nome}: ${t.detalhe}`);
  });
  console.groupEnd();
  return resultado;
}

/* ------------------------------------------------------------------ *
 *  Auxiliares
 * ------------------------------------------------------------------ */

function assert(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem || 'condição não satisfeita');
}

/** Todas as 120 respostas com o mesmo valor. */
export function respostasUniformes(valor) {
  return QUESTIONS.reduce((mapa, q) => {
    mapa[q.id] = valor;
    return mapa;
  }, {});
}

/**
 * Conjunto de respostas variado e reprodutível (sem aleatoriedade): o valor
 * depende apenas da posição do item, então o resultado é sempre o mesmo.
 */
export function respostasVariadas() {
  return QUESTIONS.reduce((mapa, q, i) => {
    mapa[q.id] = ((i * 7 + q.facet * 3) % 5) + 1;
    return mapa;
  }, {});
}

/**
 * Alterna entre os extremos da escala. Produz um perfil bastante polarizado,
 * útil para verificar as seções nas pontas da distribuição.
 */
export function respostasAlternadas() {
  return QUESTIONS.reduce((mapa, q, i) => {
    mapa[q.id] = i % 2 === 0 ? 5 : 1;
    return mapa;
  }, {});
}
