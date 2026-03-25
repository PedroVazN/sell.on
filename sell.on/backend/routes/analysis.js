const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const Proposal = require('../models/Proposal');
const Client = require('../models/Client');
const Distributor = require('../models/Distributor');
const User = require('../models/User');

const router = express.Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
/** Respostas antigas (ex.: analysis_engine.py) não têm estes campos — não usar cache. */
const ANALYSIS_SCHEMA_VERSION = 2;

let analysisCache = {
  generatedAt: 0,
  data: null,
};

const STATUS_LABELS = {
  negociacao: 'Em negociacao',
  venda_fechada: 'Ganhas',
  venda_perdida: 'Perdidas',
  aguardando_pagamento: 'Aguardando pagamento',
  expirada: 'Expiradas',
};

const FUNNEL_ORDER = ['negociacao', 'aguardando_pagamento', 'venda_fechada', 'venda_perdida', 'expirada'];

function analysisPayloadIsComplete(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.analysisVersion !== ANALYSIS_SCHEMA_VERSION) return false;
  const s = payload.summary;
  if (!s || typeof s.pipelineOpenCount !== 'number') return false;
  return Array.isArray(payload.funnelStages);
}

function normalizeProposalStatusRaw(raw) {
  const s = String(raw ?? 'negociacao')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (FUNNEL_ORDER.includes(s)) return s;
  if (s.includes('fechada') || s === 'ganha' || s === 'ganhas' || s === 'won') return 'venda_fechada';
  if (s.includes('perdida') || s === 'perdidas' || s === 'lost') return 'venda_perdida';
  if (s.includes('aguardando')) return 'aguardando_pagamento';
  if (s.includes('expirada')) return 'expirada';
  if (s.includes('negoci') || s === 'aberta' || s === 'open') return 'negociacao';
  return 'negociacao';
}

function forecastRevenueLinear(monthlyTrend) {
  const y = (monthlyTrend || []).map((m) => toNumber(m.revenue));
  if (y.length < 3) {
    return { ok: false, message: 'Mínimo 3 meses para previsão.', nextMonthRevenue: null, method: null, slope: null };
  }
  const n = y.length;
  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i += 1) {
    sx += i;
    sy += y[i];
    sxy += i * y[i];
    sxx += i * i;
  }
  const denom = n * sxx - sx * sx;
  const a = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
  const b = (sy - a * sx) / n;
  const next = Math.max(0, a * n + b);
  return {
    ok: true,
    message: '',
    nextMonthRevenue: round2(next),
    method: 'tendência linear (baseline)',
    slope: round2(a),
  };
}

function toNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function round2(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function computeNodeAnalysis(payload) {
  const proposals = payload?.proposals || [];
  const counters = payload?.counters || {};

  const mapped = proposals.map((p) => {
    const statusRaw = normalizeProposalStatusRaw(p?.status);
    const seller = p?.seller?.name || 'Sem vendedor';
    const distributor = p?.distributor?.apelido || p?.distributor?.razaoSocial || 'Sem distribuidor';
    const total = toNumber(p?.total);
    const createdAt = p?.createdAt ? new Date(p.createdAt) : null;
    const createdOk = createdAt && !Number.isNaN(createdAt.getTime());
    const closedAt = p?.closedAt ? new Date(p.closedAt) : null;
    const closedOk = closedAt && !Number.isNaN(closedAt.getTime());
    const c = p?.client || {};
    const clientKey = String(c.email || c.cnpj || c.razaoSocial || c.company || c.name || 'cliente').toLowerCase().trim();
    const clientDisplay = String(c.razaoSocial || c.company || c.name || c.email || 'Cliente').slice(0, 80);
    let daysToClose = null;
    if (statusRaw === 'venda_fechada' && createdOk && closedOk) {
      daysToClose = Math.round((closedAt.getTime() - createdAt.getTime()) / 86400000);
    }
    return {
      statusRaw,
      status: STATUS_LABELS[statusRaw] || statusRaw,
      seller,
      distributor,
      total,
      createdAt: createdOk ? createdAt : null,
      clientKey,
      clientDisplay,
      daysToClose,
    };
  });

  const totalProposals = mapped.length;
  const wins = mapped.filter((p) => p.statusRaw === 'venda_fechada');
  const losses = mapped.filter((p) => p.statusRaw === 'venda_perdida');
  const openPipe = mapped.filter((p) => p.statusRaw === 'negociacao' || p.statusRaw === 'aguardando_pagamento');
  const totalRevenueClosed = wins.reduce((sum, p) => sum + p.total, 0);
  const avgTicket = wins.length ? totalRevenueClosed / wins.length : 0;
  const winRate = totalProposals ? (wins.length / totalProposals) * 100 : 0;
  const lossRate = totalProposals ? (losses.length / totalProposals) * 100 : 0;
  const pipelineOpenCount = openPipe.length;
  const pipelineOpenValue = openPipe.reduce((s, p) => s + p.total, 0);
  const closeDays = wins.map((p) => p.daysToClose).filter((d) => d != null && !Number.isNaN(d));
  const avgDaysToClose = closeDays.length ? round2(closeDays.reduce((a, b) => a + b, 0) / closeDays.length) : null;

  const statusMap = new Map();
  mapped.forEach((p) => {
    const current = statusMap.get(p.status) || { status: p.status, count: 0, total: 0 };
    current.count += 1;
    current.total += p.total;
    statusMap.set(p.status, current);
  });
  const statusBreakdown = Array.from(statusMap.values()).sort((a, b) => b.count - a.count).map((item) => ({
    ...item,
    total: round2(item.total),
  }));

  const rawAgg = new Map();
  mapped.forEach((p) => {
    const cur = rawAgg.get(p.statusRaw) || { count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += p.total;
    rawAgg.set(p.statusRaw, cur);
  });
  const funnelStages = [];
  FUNNEL_ORDER.forEach((key) => {
    if (!rawAgg.has(key)) return;
    const r = rawAgg.get(key);
    funnelStages.push({
      stage: key,
      label: STATUS_LABELS[key] || key,
      count: r.count,
      avgValue: r.count ? round2(r.sum / r.count) : 0,
    });
  });

  const counts = {};
  FUNNEL_ORDER.forEach((k) => {
    counts[k] = 0;
  });
  mapped.forEach((p) => {
    counts[p.statusRaw] = (counts[p.statusRaw] || 0) + 1;
  });
  const funnelTransitions = [];
  for (let i = 0; i < FUNNEL_ORDER.length - 1; i += 1) {
    const st = FUNNEL_ORDER[i];
    const next = FUNNEL_ORDER[i + 1];
    const nHere = counts[st] || 0;
    const nNext = counts[next] || 0;
    const denom = nHere + nNext || 1;
    funnelTransitions.push({
      fromStage: st,
      toStage: next,
      transitionRate: round2((nNext / denom) * 100),
    });
  }

  const monthlyMap = new Map();
  mapped.forEach((p) => {
    if (!p.createdAt) return;
    const month = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyMap.get(month) || { month, proposals: 0, won: 0, lost: 0, revenue: 0 };
    current.proposals += 1;
    if (p.statusRaw === 'venda_fechada') current.won += 1;
    if (p.statusRaw === 'venda_perdida') current.lost += 1;
    current.revenue += p.total;
    monthlyMap.set(month, current);
  });
  const monthlyTrend = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((item) => ({ ...item, revenue: round2(item.revenue) }));

  const sellersMap = new Map();
  mapped.forEach((p) => {
    const current = sellersMap.get(p.seller) || { seller: p.seller, proposals: 0, won: 0, lost: 0, revenue: 0 };
    current.proposals += 1;
    if (p.statusRaw === 'venda_fechada') current.won += 1;
    if (p.statusRaw === 'venda_perdida') current.lost += 1;
    current.revenue += p.total;
    sellersMap.set(p.seller, current);
  });
  const sellerList = Array.from(sellersMap.values());
  const maxSellerRev = sellerList.reduce((m, s) => Math.max(m, s.revenue), 0) || 1;
  const topSellers = sellerList
    .map((item) => {
      const conv = item.proposals ? (item.won / item.proposals) * 100 : 0;
      const avgTk = item.won ? item.revenue / item.won : 0;
      const eff = conv * 0.4 + (item.revenue / maxSellerRev) * 100 * 0.6;
      return {
        ...item,
        revenue: round2(item.revenue),
        conversionRate: round2(conv),
        avgTicket: round2(avgTk),
        efficiencyScore: round2(eff),
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.won - a.won)
    .slice(0, 8);

  const distributorsMap = new Map();
  mapped.forEach((p) => {
    const current = distributorsMap.get(p.distributor) || {
      distributor: p.distributor,
      proposals: 0,
      won: 0,
      revenue: 0,
    };
    current.proposals += 1;
    if (p.statusRaw === 'venda_fechada') current.won += 1;
    current.revenue += p.total;
    distributorsMap.set(p.distributor, current);
  });
  const topDistributors = Array.from(distributorsMap.values())
    .map((item) => ({ ...item, revenue: round2(item.revenue) }))
    .sort((a, b) => b.revenue - a.revenue || b.won - a.won)
    .slice(0, 8);

  const clientMap = new Map();
  mapped.forEach((p) => {
    const cur = clientMap.get(p.clientKey) || { clientName: p.clientDisplay, proposals: 0, won: 0, revenue: 0 };
    cur.proposals += 1;
    if (p.statusRaw === 'venda_fechada') {
      cur.won += 1;
      cur.revenue += p.total;
    }
    clientMap.set(p.clientKey, cur);
  });
  const topClients = Array.from(clientMap.values())
    .map((c) => ({
      ...c,
      revenue: round2(c.revenue),
      avgTicket: c.won ? round2(c.revenue / c.won) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  let bottleneckMsg = null;
  if (funnelStages.length) {
    const mx = funnelStages.reduce((best, s) => (s.count > best.count ? s : best), funnelStages[0]);
    const pct = totalProposals ? round2((mx.count / totalProposals) * 100) : 0;
    bottleneckMsg = `Maior volume no estágio '${mx.label}' (${mx.count} propostas, ~${pct}% do total).`;
  }

  const insights = [];
  if (winRate >= 35) insights.push(`Taxa de ganho em bom nivel (${winRate.toFixed(1)}%).`);
  else insights.push(`Taxa de ganho em alerta (${winRate.toFixed(1)}%). Revisar follow-up e abordagem comercial.`);
  if (avgDaysToClose != null) insights.push(`Tempo médio até fechamento (ganhas): ${avgDaysToClose} dias.`);
  if (bottleneckMsg) insights.push(bottleneckMsg);
  if (avgTicket > 0) insights.push(`Ticket medio das vendas fechadas: R$ ${avgTicket.toLocaleString('pt-BR')}.`);
  if (topSellers[0]) insights.push(`Lider atual: ${topSellers[0].seller} com ${topSellers[0].won} vendas fechadas.`);

  const revSeries = monthlyTrend.map((m) => m.revenue);
  let trendMsg = 'Histórico insuficiente para tendência.';
  if (revSeries.length >= 6) {
    const recent = (revSeries[revSeries.length - 1] + revSeries[revSeries.length - 2] + revSeries[revSeries.length - 3]) / 3;
    const prev = (revSeries[revSeries.length - 4] + revSeries[revSeries.length - 5] + revSeries[revSeries.length - 6]) / 3;
    if (prev > 0) {
      const delta = ((recent - prev) / prev) * 100;
      if (delta > 5) trendMsg = `Tendência de crescimento na receita recente (~${delta.toFixed(1)}% vs trimestre anterior).`;
      else if (delta < -5) trendMsg = `Tendência de queda na receita recente (~${delta.toFixed(1)}% vs trimestre anterior).`;
      else trendMsg = `Receita estável no comparativo de trimestres (~${delta.toFixed(1)}%).`;
    }
  }
  insights.push(trendMsg);

  const forecast = forecastRevenueLinear(monthlyTrend);
  if (forecast.ok) {
    insights.push(
      `Previsão baseline de receita no próximo mês: R$ ${forecast.nextMonthRevenue.toLocaleString('pt-BR')} (${forecast.method}).`
    );
  }

  const extendedAnalysisEmpty = {
    lossReasons: [],
    paymentMix: [],
    weekdayCreated: [],
    weeklyTrend: [],
    ticketBuckets: [],
    openAging: {
      buckets: [],
      avgAgeDays: null,
      staleOver90Count: 0,
      staleOver90Value: 0,
    },
    distributorStats: [],
    repeatClients: {
      clientsWithMultipleProposals: 0,
      clientsSingleProposal: 0,
      repeatRevenueSharePct: 0,
      avgProposalsPerClient: 0,
    },
    itemsIntensity: {
      avgItemsOpen: 0,
      avgItemsWon: 0,
      avgItemsLost: 0,
      maxItems: 0,
    },
    discountProfile: {
      avgDiscountWon: 0,
      avgDiscountOpen: 0,
      avgDiscountLost: 0,
      pctProposalsWithDiscount: 0,
    },
    featureImportance: [],
  };

  return {
    summary: {
      totalProposals,
      totalRevenueClosed: round2(totalRevenueClosed),
      winRate: round2(winRate),
      lossRate: round2(lossRate),
      avgTicket: round2(avgTicket),
      clientesAtivos: Number(counters.clients || 0),
      distribuidoresAtivos: Number(counters.distributors || 0),
      vendedoresAtivos: Number(counters.sellers || 0),
      pipelineOpenCount,
      pipelineOpenValue: round2(pipelineOpenValue),
      avgDaysToClose,
    },
    statusBreakdown,
    monthlyTrend,
    topSellers,
    topDistributors,
    funnelStages,
    funnelTransitions,
    topClients,
    clientSegments: [],
    predictive: {
      winModel: {
        ok: false,
        message: 'Modelos RandomForest / regressão logística disponíveis no motor Python.',
        rocAucLr: null,
        rocAucRf: null,
        importances: null,
      },
      forecast,
      pipelineScores: [],
      pipelineDeepScoresTop20: [],
      pipelineDeepScoresBottom10: [],
      pipelineDeepTotalOpen: 0,
    },
    insights,
    palette: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    engine: 'node-fallback',
    analysisVersion: 2,
    extendedAnalysis: extendedAnalysisEmpty,
  };
}

/**
 * Python local (spawn): usa backend/python/analysis_engine.py + pasta python-microservice.
 * Ordem no buildAnalysis: Render → este script → Node.
 */
function runPythonAnalysis(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'python', 'analysis_engine.py');
    const pythonCommands = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];

    const tryCommand = (index) => {
      if (index >= pythonCommands.length) {
        reject(new Error('Python 3 não encontrado no servidor (instale Python + pandas + scikit-learn).'));
        return;
      }

      const py = spawn(pythonCommands[index], [scriptPath], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env },
      });

      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      py.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      py.on('error', () => {
        tryCommand(index + 1);
      });

      py.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || stdout || 'Falha ao executar analysis_engine.py'));
          return;
        }
        try {
          const parsed = JSON.parse(stdout || '{}');
          if (parsed && parsed.error) {
            reject(new Error(parsed.details || parsed.error));
            return;
          }
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Resposta inválida do Python local: ${err.message}`));
        }
      });

      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    };

    tryCommand(0);
  });
}

/**
 * Aceita na Vercel tanto a URL base (https://xxx.onrender.com) quanto a completa (.../analyze).
 */
function resolvePythonAnalysisUrl(raw) {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const p = url.pathname.replace(/\/$/, '') || '';
    if (!p || p === '/') {
      url.pathname = '/analyze';
    }
    return url.href.replace(/\/$/, '');
  } catch {
    if (!/\/analyze$/i.test(trimmed)) {
      return `${trimmed}/analyze`;
    }
    return trimmed;
  }
}

async function runRemotePythonAnalysis(payload) {
  const serviceUrl = resolvePythonAnalysisUrl(process.env.PYTHON_ANALYSIS_URL);
  if (!serviceUrl) {
    throw new Error('PYTHON_ANALYSIS_URL não configurada');
  }

  const controller = new AbortController();
  const timeoutMs = Math.min(Number(process.env.PYTHON_ANALYSIS_TIMEOUT_MS) || 120000, 300000);
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(t);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Falha no microserviço Python (HTTP ${response.status})`);
    }
    return data;
  } catch (err) {
    clearTimeout(t);
    if (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) {
      throw new Error(
        `Tempo esgotado ao contactar o motor Python (${Math.round(timeoutMs / 1000)}s). Cold start no Render pode levar ~1 min — tente de novo em instantes.`
      );
    }
    throw err;
  }
}

async function collectRawData() {
  const [proposals, clientsCount, distributorsCount, sellersCount] = await Promise.all([
    // Não incluir `items` (linhas com produtos completos) — explode o payload e atrasa Vercel → Python.
    Proposal.find({})
      .select(
        'status total createdAt updatedAt closedAt validUntil seller distributor client proposalNumber lossReason'
      )
      .lean(),
    Client.countDocuments({ isActive: true }),
    Distributor.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'vendedor', isActive: true }),
  ]);

  return {
    proposals,
    counters: {
      clients: clientsCount,
      distributors: distributorsCount,
      sellers: sellersCount,
    },
  };
}

async function buildAnalysis(forceRecalculate = false) {
  const cacheIsValid =
    !forceRecalculate &&
    analysisCache.data &&
    analysisPayloadIsComplete(analysisCache.data) &&
    Date.now() - analysisCache.generatedAt < CACHE_TTL_MS;

  if (cacheIsValid) {
    return {
      cached: true,
      data: analysisCache.data,
      generatedAt: analysisCache.generatedAt,
    };
  }

  const raw = await collectRawData();
  let analysisResult = null;
  let motorNote = null;
  /** URL do Flask no Render (variável PYTHON_ANALYSIS_URL na Vercel). */
  const renderPythonUrl = resolvePythonAnalysisUrl(process.env.PYTHON_ANALYSIS_URL);
  const allowLocalPython =
    String(process.env.PYTHON_ANALYSIS_LOCAL_FALLBACK || '').toLowerCase() === 'true' ||
    String(process.env.PYTHON_ANALYSIS_LOCAL_FALLBACK || '') === '1';

  if (renderPythonUrl) {
    try {
      const fromRender = await runRemotePythonAnalysis(raw);
      if (analysisPayloadIsComplete(fromRender)) {
        analysisResult = { ...fromRender, engine: 'python-render' };
      } else {
        console.warn('[analysis] Render: resposta incompleta (schema v2).');
        motorNote =
          'O serviço no Render respondeu, mas o JSON não está no formato v2 (redeploy do python-microservice).';
      }
    } catch (err) {
      console.warn('[analysis] Render (PYTHON_ANALYSIS_URL):', err.message);
      motorNote = `Render indisponível ou timeout: ${err.message}`;
    }
  } else {
    motorNote =
      'PYTHON_ANALYSIS_URL não está definida na Vercel. Configure com a URL base do Flask no Render (ex.: https://seu-app.onrender.com).';
  }

  if (!analysisResult && allowLocalPython) {
    try {
      const local = await runPythonAnalysis(raw);
      if (analysisPayloadIsComplete(local)) {
        analysisResult = { ...local, engine: 'python-local' };
        motorNote = null;
      } else {
        console.warn('[analysis] Python local (spawn): payload incompleto.');
      }
    } catch (err) {
      console.warn('[analysis] Python local (spawn):', err.message);
    }
  }

  if (!analysisResult) {
    analysisResult = computeNodeAnalysis(raw);
    analysisResult.engine = 'node-fallback';
    if (!motorNote) {
      motorNote =
        'Análise via Node (sem ML). Produção deve usar o Flask no Render e PYTHON_ANALYSIS_URL na Vercel.';
    }
  }

  if (!analysisResult?.engine) {
    analysisResult.engine = 'node-fallback';
  }

  const responseData = {
    ...analysisResult,
    generatedAt: new Date().toISOString(),
    ...(motorNote && analysisResult.engine === 'node-fallback' ? { motorNote } : {}),
  };

  analysisCache = {
    generatedAt: Date.now(),
    data: responseData,
  };

  return {
    cached: false,
    data: responseData,
    generatedAt: analysisCache.generatedAt,
  };
}

router.get('/dashboard', async (req, res) => {
  try {
    const force = String(req.query.recalculate || '').toLowerCase() === 'true';
    const result = await buildAnalysis(force);
    return res.json({
      success: true,
      cached: result.cached,
      data: result.data,
      cacheAge: result.cached ? Math.floor((Date.now() - result.generatedAt) / 1000) : 0,
    });
  } catch (error) {
    console.error('Erro na análise data science:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao calcular análise em Python',
      error: error.message,
    });
  }
});

router.post('/recalculate', async (req, res) => {
  try {
    const result = await buildAnalysis(true);
    return res.json({
      success: true,
      cached: result.cached,
      data: result.data,
      message: 'Análise recalculada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao recalcular análise data science:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao recalcular análise em Python',
      error: error.message,
    });
  }
});

module.exports = router;
