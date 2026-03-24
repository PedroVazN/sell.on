const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const Proposal = require('../models/Proposal');
const Client = require('../models/Client');
const Distributor = require('../models/Distributor');
const User = require('../models/User');

const router = express.Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
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
    const statusRaw = p?.status || 'negociacao';
    const seller = p?.seller?.name || 'Sem vendedor';
    const distributor = p?.distributor?.apelido || p?.distributor?.razaoSocial || 'Sem distribuidor';
    const total = toNumber(p?.total);
    const createdAt = p?.createdAt ? new Date(p.createdAt) : null;
    return {
      statusRaw,
      status: STATUS_LABELS[statusRaw] || statusRaw,
      seller,
      distributor,
      total,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null,
    };
  });

  const totalProposals = mapped.length;
  const wins = mapped.filter((p) => p.statusRaw === 'venda_fechada');
  const losses = mapped.filter((p) => p.statusRaw === 'venda_perdida');
  const totalRevenueClosed = wins.reduce((sum, p) => sum + p.total, 0);
  const avgTicket = wins.length ? totalRevenueClosed / wins.length : 0;
  const winRate = totalProposals ? (wins.length / totalProposals) * 100 : 0;
  const lossRate = totalProposals ? (losses.length / totalProposals) * 100 : 0;

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
  const topSellers = Array.from(sellersMap.values())
    .map((item) => ({
      ...item,
      revenue: round2(item.revenue),
      conversionRate: round2(item.proposals ? (item.won / item.proposals) * 100 : 0),
    }))
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

  const insights = [];
  if (winRate >= 35) insights.push(`Taxa de ganho em bom nivel (${winRate.toFixed(1)}%).`);
  else insights.push(`Taxa de ganho em alerta (${winRate.toFixed(1)}%). Revisar follow-up e abordagem comercial.`);
  if (avgTicket > 0) insights.push(`Ticket medio das vendas fechadas: R$ ${avgTicket.toLocaleString('pt-BR')}.`);
  if (topSellers[0]) insights.push(`Lider atual: ${topSellers[0].seller} com ${topSellers[0].won} vendas fechadas.`);

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
    },
    statusBreakdown,
    monthlyTrend,
    topSellers,
    topDistributors,
    insights,
    palette: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    engine: 'node-fallback',
  };
}

function runPythonAnalysis(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'python', 'analysis_engine.py');
    const pythonCommands = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];

    const tryCommand = (index) => {
      if (index >= pythonCommands.length) {
        reject(new Error('Python não encontrado. Instale Python 3 e dependências pandas/seaborn/matplotlib.'));
        return;
      }

      const py = spawn(pythonCommands[index], [scriptPath], {
        cwd: path.join(__dirname, '..'),
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
          reject(new Error(stderr || stdout || 'Falha ao executar análise Python'));
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
          reject(new Error(`Resposta inválida da análise Python: ${err.message}`));
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

  const response = await fetch(serviceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Falha no microserviço Python (HTTP ${response.status})`);
  }

  return data;
}

async function collectRawData() {
  const [proposals, clientsCount, distributorsCount, sellersCount] = await Promise.all([
    Proposal.find({})
      .select('status total createdAt seller distributor')
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
    Date.now() - analysisCache.generatedAt < CACHE_TTL_MS;

  if (cacheIsValid) {
    return {
      cached: true,
      data: analysisCache.data,
      generatedAt: analysisCache.generatedAt,
    };
  }

  const raw = await collectRawData();
  let analysisResult;
  const remotePythonUrl = resolvePythonAnalysisUrl(process.env.PYTHON_ANALYSIS_URL);

  try {
    if (remotePythonUrl) {
      analysisResult = await runRemotePythonAnalysis(raw);
      analysisResult.engine = 'python';
    } else {
      analysisResult = await runPythonAnalysis(raw);
      analysisResult.engine = 'python';
    }
  } catch (remotePythonError) {
    console.warn('Falha no Python remoto/local, tentando Python local:', remotePythonError.message);
    try {
      analysisResult = await runPythonAnalysis(raw);
      analysisResult.engine = 'python';
    } catch (pythonError) {
      console.warn('Falha no motor Python, usando fallback Node.js:', pythonError.message);
      analysisResult = computeNodeAnalysis(raw);
    }
  }

  if (!analysisResult?.engine) {
    analysisResult.engine = 'python';
  }

  const responseData = {
    ...analysisResult,
    generatedAt: new Date().toISOString(),
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
