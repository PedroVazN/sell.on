const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { detectAnomalies } = require('../services/anomalyDetection');
const { calculateSalesForecast } = require('../services/salesForecast');
const { getProductRecommendations, getGeneralRecommendations, enrichRecommendations } = require('../services/productRecommendation');

// Verificar se o serviço existe, caso contrário usar função mockada
let calculateProposalScore;
try {
  const proposalScoreService = require('../services/proposalScore');
  calculateProposalScore = proposalScoreService.calculateProposalScore;
} catch (error) {
  console.warn('⚠️ Serviço de score não encontrado, usando função mockada');
  // Função mockada para desenvolvimento
  calculateProposalScore = async (proposal) => {
    // Score simulado baseado em alguns fatores
    let score = 50; // Base
    
    // Aumentar score baseado em fatores básicos
    if (proposal.client?.email) score += 10;
    if (proposal.total > 0) score += 5;
    if (proposal.items && proposal.items.length > 0) score += 5;
    
    const level = score >= 70 ? 'alto' : score >= 50 ? 'medio' : score >= 30 ? 'baixo' : 'muito_baixo';
    
    return {
      score: Math.min(100, Math.max(0, score)),
      percentual: Math.min(100, Math.max(0, score)),
      level: level,
      action: level === 'alto' ? 'Alta prioridade - Fechar rapidamente' :
              level === 'medio' ? 'Acompanhar de perto' :
              level === 'baixo' ? 'Revisar estratégia' : 'Considerar oferecer desconto'
    };
  };
}

// Middleware de autenticação (se necessário verificar depois)
// Por enquanto, deixar sem auth para facilitar desenvolvimento

/**
 * GET /api/ai/dashboard - Dashboard completo de IA/ML
 */
router.get('/dashboard', async (req, res) => {
  try {
    console.log('🤖 Carregando dashboard de IA...');
    
    // Timeout de segurança para evitar travamento
    const timeout = setTimeout(() => {
      console.error('⚠️ Timeout no dashboard de IA - retornando dados parciais');
    }, 25000); // 25 segundos

    // 1. Distribuição de Scores - LIMITAR A 20 para não sobrecarregar
    let negociacaoProposals = [];
    let scoresData = [];
    
    try {
      negociacaoProposals = await Proposal.find({ 
        status: 'negociacao' 
      })
        .populate('createdBy', 'name email')
        .limit(20) // REDUZIDO de 100 para 20 para evitar crash
        .lean(); // Usar lean() para melhor performance

      // Limitar ainda mais se houver muitas
      if (negociacaoProposals.length > 20) {
        negociacaoProposals = negociacaoProposals.slice(0, 20);
      }

      // Calcular apenas os primeiros 10 scores para evitar timeout
      const proposalsToScore = negociacaoProposals.slice(0, 10);
      
      // Calcular scores de forma sequencial para não sobrecarregar
      scoresData = [];
      for (let i = 0; i < proposalsToScore.length; i++) {
        try {
          const score = await calculateProposalScore(proposalsToScore[i]);
          if (score) scoresData.push(score);
        } catch (err) {
          console.error(`Erro ao calcular score ${i}:`, err);
          // Continuar mesmo com erro
        }
        
        // Se já processamos 5, limitar tempo
        if (i === 5) break;
      }
    } catch (err) {
      console.error('Erro ao buscar propostas ou calcular scores:', err);
      negociacaoProposals = [];
      scoresData = [];
    }
    
    // Distribuição por nível
    const scoreDistribution = {
      alto: { count: 0, totalValue: 0 },
      medio: { count: 0, totalValue: 0 },
      baixo: { count: 0, totalValue: 0 },
      muito_baixo: { count: 0, totalValue: 0 }
    };

    scoresData.forEach((score, index) => {
      try {
        const proposal = negociacaoProposals[index];
        if (score && proposal && score.level) {
          const level = score.level;
          if (scoreDistribution[level]) {
            scoreDistribution[level].count++;
            scoreDistribution[level].totalValue += (proposal.total || 0);
          }
        }
      } catch (err) {
        console.error('Erro ao processar score na distribuição:', err);
      }
    });

    // 2. Top Propostas (Maior Score) - Protegido
    let proposalsWithScores = [];
    try {
      proposalsWithScores = negociacaoProposals
        .map((p, i) => {
          try {
            return {
              proposal: typeof p.toObject === 'function' ? p.toObject() : p,
              score: scoresData[i]
            };
          } catch (err) {
            console.error('Erro ao converter proposta:', err);
            return null;
          }
        })
        .filter(item => item && item.score)
        .sort((a, b) => {
          try {
            return (b.score?.score || 0) - (a.score?.score || 0);
          } catch (err) {
            return 0;
          }
        })
        .slice(0, 10);
    } catch (err) {
      console.error('Erro ao processar proposalsWithScores:', err);
      proposalsWithScores = [];
    }

    // 3. Propostas em Risco (Score Baixo)
    const atRiskProposals = proposalsWithScores
      .filter(item => item.score.level === 'baixo' || item.score.level === 'muito_baixo')
      .slice(0, 10);

    // 4. Insights Automáticos
    const insights = [];

    // Insight 1: Vendedores com melhor performance
    const sellerStats = {};
    for (let i = 0; i < negociacaoProposals.length && i < scoresData.length; i++) {
      const proposal = negociacaoProposals[i];
      const score = scoresData[i];
      if (proposal && score) {
        // Usar seller ou createdBy
        const sellerId = proposal.seller?._id || proposal.createdBy?._id || 
                        (typeof proposal.createdBy === 'string' ? proposal.createdBy : proposal.createdBy?._id);
        const sellerName = proposal.seller?.name || proposal.createdBy?.name || 'N/A';
        
        if (sellerId) {
          if (!sellerStats[sellerId]) {
            sellerStats[sellerId] = {
              name: sellerName,
              proposals: 0,
              avgScore: 0,
              totalScore: 0,
              totalValue: 0
            };
          }
          sellerStats[sellerId].proposals++;
          sellerStats[sellerId].totalScore += score.score || 0;
          sellerStats[sellerId].totalValue += proposal.total || 0;
        }
      }
    }

    // Calcular peso (market share) de cada vendedor
    const totalValueAllSellers = Object.values(sellerStats).reduce((sum, s) => sum + s.totalValue, 0);
    
    const topSellers = Object.values(sellerStats)
      .map(s => ({
        ...s,
        avgScore: s.totalScore / s.proposals,
        weight: totalValueAllSellers > 0 
          ? (s.totalValue / totalValueAllSellers) * 100 
          : 0 // Peso em porcentagem (market share)
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    if (topSellers.length > 0) {
      insights.push({
        type: 'info',
        title: 'Vendedor com Melhor Score Médio',
        message: `${topSellers[0].name} tem score médio de ${topSellers[0].avgScore.toFixed(1)}% em ${topSellers[0].proposals} propostas`,
        priority: 'high',
        icon: '👑'
      });
    }

    // Insight 2: Clientes com histórico positivo
    const clientStats = {};
    for (let i = 0; i < negociacaoProposals.length && i < scoresData.length; i++) {
      const proposal = negociacaoProposals[i];
      const score = scoresData[i];
      if (proposal && score && proposal.client?.email) {
        const clientEmail = proposal.client.email.toLowerCase();
        if (!clientStats[clientEmail]) {
          clientStats[clientEmail] = {
            name: proposal.client.name || 'N/A',
            proposals: 0,
            avgScore: 0,
            totalScore: 0
          };
        }
        clientStats[clientEmail].proposals++;
        clientStats[clientEmail].totalScore += score.score || 0;
      }
    }

    const topClients = Object.values(clientStats)
      .map(c => ({ ...c, avgScore: c.totalScore / c.proposals }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    if (topClients.length > 0 && topClients[0].avgScore > 70) {
      insights.push({
        type: 'success',
        title: 'Clientes de Alto Potencial',
        message: `${topClients[0].name} tem score médio de ${topClients[0].avgScore.toFixed(1)}% - Boa oportunidade!`,
        priority: 'high',
        icon: '⭐'
      });
    }

    // Insight 3: Propostas em risco
    if (atRiskProposals.length > 0) {
      const totalRiskValue = atRiskProposals.reduce((sum, item) => 
        sum + (item.proposal.total || 0), 0
      );
      
      insights.push({
        type: 'warning',
        title: `${atRiskProposals.length} Propostas em Risco`,
        message: `R$ ${totalRiskValue.toLocaleString('pt-BR')} em propostas com baixo score - Ação necessária`,
        priority: 'urgent',
        icon: '🚨'
      });
    }

    // Insight 4: Distribuição de scores
    const totalProposals = Object.values(scoreDistribution).reduce((sum, dist) => sum + dist.count, 0);
    if (totalProposals > 0) {
      const highScorePercentage = (scoreDistribution.alto.count / totalProposals) * 100;
      if (highScorePercentage < 30) {
        insights.push({
          type: 'info',
          title: 'Oportunidade de Melhoria',
          message: `Apenas ${highScorePercentage.toFixed(1)}% das propostas têm score alto. Revise estratégias de vendas.`,
          priority: 'medium',
          icon: '📊'
        });
      }
    }

    // 5. Previsão de Vendas (usando serviço avançado) - Simplificado
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'user';
    let forecast = null;
    let forecastData = null;
    
    try {
      // Limitar tempo de cálculo
      const forecastPromise = calculateSalesForecast(userId, userRole, 30);
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ error: 'Timeout' }), 5000); // 5 segundos máximo
      });
      
      forecastData = await Promise.race([forecastPromise, timeoutPromise]);
      if (!forecastData.error) {
        forecast = {
          next7Days: {
            sales: forecastData.forecast.next7Days.sales,
            revenue: forecastData.forecast.next7Days.revenue,
            confidence: forecastData.confidence,
            lowerBound: forecastData.forecast.next7Days.lowerBound,
            upperBound: forecastData.forecast.next7Days.upperBound
          },
          next30Days: {
            sales: forecastData.forecast.next30Days.sales,
            revenue: forecastData.forecast.next30Days.revenue,
            confidence: forecastData.confidence,
            lowerBound: forecastData.forecast.next30Days.lowerBound,
            upperBound: forecastData.forecast.next30Days.upperBound
          },
          trends: forecastData.trends,
          goalComparison: forecastData.goalComparison,
          insights: forecastData.insights
        };
      } else {
        // Fallback para método simples se houver erro
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const recentClosed = await Proposal.find({
          status: 'venda_fechada',
          updatedAt: { $gte: last30Days }
        });
        const avgDailySales = recentClosed.length / 30;
        const avgSaleValue = recentClosed.length > 0
          ? recentClosed.reduce((sum, p) => sum + (p.total || 0), 0) / recentClosed.length
          : 0;
        forecast = {
          next7Days: {
            sales: Math.round(avgDailySales * 7),
            revenue: Math.round(avgDailySales * 7 * avgSaleValue),
            confidence: recentClosed.length > 10 ? 85 : recentClosed.length > 5 ? 70 : 50
          },
          next30Days: {
            sales: Math.round(avgDailySales * 30),
            revenue: Math.round(avgDailySales * 30 * avgSaleValue),
            confidence: recentClosed.length > 10 ? 80 : recentClosed.length > 5 ? 65 : 45
          },
          trends: null,
          goalComparison: null,
          insights: []
        };
      }
    } catch (error) {
      console.error('Erro ao calcular previsão avançada:', error);
      // Usar método simples como fallback
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const recentClosed = await Proposal.find({
        status: 'venda_fechada',
        updatedAt: { $gte: last30Days }
      });
      const avgDailySales = recentClosed.length / 30;
      const avgSaleValue = recentClosed.length > 0
        ? recentClosed.reduce((sum, p) => sum + (p.total || 0), 0) / recentClosed.length
        : 0;
      forecast = {
        next7Days: {
          sales: Math.round(avgDailySales * 7),
          revenue: Math.round(avgDailySales * 7 * avgSaleValue),
          confidence: 50
        },
        next30Days: {
          sales: Math.round(avgDailySales * 30),
          revenue: Math.round(avgDailySales * 30 * avgSaleValue),
          confidence: 45
        },
        trends: null,
        goalComparison: null,
        insights: []
      };
    }

    // 6. Taxa de Conversão por Score
    const conversionByScore = {
      alto: { closed: 0, total: 0 },
      medio: { closed: 0, total: 0 },
      baixo: { closed: 0, total: 0 },
      muito_baixo: { closed: 0, total: 0 }
    };

    // Buscar propostas fechadas dos últimos 3 meses para análise
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentProposals = await Proposal.find({
      createdAt: { $gte: threeMonthsAgo }
    }).limit(200);

    // Calcular scores históricos
    for (const proposal of recentProposals.slice(0, 50)) { // Limitar para performance
      try {
        const score = await calculateProposalScore(proposal);
        if (score && score.level) {
          conversionByScore[score.level].total++;
          if (proposal.status === 'venda_fechada') {
            conversionByScore[score.level].closed++;
          }
        }
      } catch (error) {
        console.error('Erro ao calcular score para análise:', error);
      }
    }

    const conversionRates = Object.entries(conversionByScore).map(([level, data]) => ({
      level,
      rate: data.total > 0 ? (data.closed / data.total) * 100 : 0,
      closed: data.closed,
      total: data.total
    }));

    // 7. Anomalias (limitar a 10 críticas/altas para não sobrecarregar)
    let anomaliesData = { total: 0, byPriority: {}, anomalies: [] };
    try {
      const userId = req.user?.id || null;
      const userRole = req.user?.role || 'user';
      anomaliesData = await detectAnomalies(userId, userRole);
      // Filtrar apenas críticas e altas para o dashboard
      anomaliesData.anomalies = anomaliesData.anomalies
        .filter(a => a.priority === 'critica' || a.priority === 'alta')
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar anomalias no dashboard:', error);
    }

    res.json({
      success: true,
      data: {
        scoreDistribution: {
          alto: scoreDistribution.alto.count,
          medio: scoreDistribution.medio.count,
          baixo: scoreDistribution.baixo.count,
          muito_baixo: scoreDistribution.muito_baixo.count,
          totalValue: Object.values(scoreDistribution).reduce((sum, dist) => sum + dist.totalValue, 0)
        },
        topProposals: proposalsWithScores.slice(0, 10).map((item, index) => {
          try {
            if (!item || !item.proposal || !item.score) {
              return null;
            }
            
            // Formatar fatores para o formato esperado pelo frontend
            let formattedFactors = [];
            try {
              if (item.score.factors && typeof item.score.factors === 'object') {
                formattedFactors = Object.entries(item.score.factors).slice(0, 5).map((entry) => {
                  try {
                    const key = entry[0];
                    const factor = entry[1] || {};
                    return {
                      name: getFactorDisplayName(key),
                      value: factor.score || factor.value || 0,
                      impact: calculateFactorImpact(factor, key),
                      description: factor.description || getFactorDefaultDescription(key, factor)
                    };
                  } catch (err) {
                    console.error('Erro ao formatar fator:', err);
                    return null;
                  }
                }).filter(f => f !== null);
              }
            } catch (err) {
              console.error('Erro ao processar fatores:', err);
              formattedFactors = [];
            }

            return {
              proposalId: (item.proposal?._id || item.proposal?._id?.toString() || `unknown_${index}`),
              proposalNumber: (item.proposal?.proposalNumber || 'N/A'),
              client: (item.proposal?.client?.name || 'Cliente não informado'),
              value: (item.proposal?.total || 0),
              score: (item.score?.score || 0),
              percentual: (item.score?.percentual || 0),
              level: (item.score?.level || 'medio'),
              action: (item.score?.action || 'Não foi possível calcular'),
              factors: formattedFactors,
              confidence: (item.score?.confidence || 50),
              breakdown: (item.score || {})
            };
          } catch (err) {
            console.error(`Erro ao formatar topProposal ${index}:`, err);
            return {
              proposalId: `error_${index}`,
              proposalNumber: 'N/A',
              client: 'Erro',
              value: 0,
              score: 0,
              percentual: 0,
              level: 'medio',
              action: 'Erro ao processar',
              factors: [],
              confidence: 0,
              breakdown: {}
            };
          }
        }).filter(p => p !== null),
        atRiskProposals: atRiskProposals.map(item => {
          // Acesso seguro aos campos seller e createdBy
          let sellerName = 'N/A';
          let sellerEmail = '';
          
          try {
            if (item.proposal.seller && typeof item.proposal.seller === 'object') {
              sellerName = item.proposal.seller.name || 'N/A';
              sellerEmail = item.proposal.seller.email || '';
            } else if (item.proposal.createdBy && typeof item.proposal.createdBy === 'object') {
              sellerName = item.proposal.createdBy.name || 'N/A';
              sellerEmail = item.proposal.createdBy.email || '';
            }
          } catch (err) {
            console.error('Erro ao acessar seller/createdBy:', err);
          }
          
          return {
            proposalId: item.proposal._id || item.proposal._id?.toString(),
            proposalNumber: item.proposal.proposalNumber || 'N/A',
            client: item.proposal.client?.name || 'Cliente não informado',
            seller: sellerName,
            sellerEmail: sellerEmail,
            value: item.proposal.total || 0,
            score: item.score?.score || 0,
            percentual: item.score?.percentual || 0,
            level: item.score?.level || 'medio',
            action: item.score?.action || 'Não foi possível calcular'
          };
        }),
        insights,
        forecast,
        forecastDetails: forecastData && !forecastData.error ? {
          historical: forecastData.historical,
          seasonality: forecastData.seasonality,
          sellerForecasts: forecastData.sellerForecasts
        } : null,
        topSellers,
        topClients,
        conversionRates,
        anomalies: anomaliesData,
        stats: {
          totalProposalsAnalyzed: negociacaoProposals.length,
          avgScore: scoresData.length > 0
            ? scoresData.reduce((sum, s) => sum + (s?.score || 0), 0) / scoresData.length
            : 0,
          highScoreCount: scoreDistribution.alto.count,
          riskCount: scoreDistribution.baixo.count + scoreDistribution.muito_baixo.count
        }
      }
    });
    
    clearTimeout(timeout);
  } catch (error) {
    console.error('Erro ao carregar dashboard de IA:', error);
    console.error('Stack trace:', error.stack);
    
    // Resposta de erro segura
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao processar dashboard de IA',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ai/anomalies - Detecta anomalias no sistema
 */
router.get('/anomalies', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'user';

    const anomaliesData = await detectAnomalies(userId, userRole);

    res.json({
      success: true,
      data: anomaliesData
    });
  } catch (error) {
    console.error('Erro ao detectar anomalias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao detectar anomalias',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ai/insights - Insights automáticos gerados pela IA
 */
router.get('/insights', async (req, res) => {
  try {
    const insights = [];

    // Analisar propostas recentes
    const recentProposals = await Proposal.find({
      status: 'negociacao',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Últimos 7 dias
    }).limit(50);

    // Calcular scores
    const proposalsWithScores = [];
    for (const proposal of recentProposals) {
      try {
        const score = await calculateProposalScore(proposal);
        proposalsWithScores.push({ proposal, score });
      } catch (error) {
        console.error('Erro ao calcular score:', error);
      }
    }

    // Gerar insights baseados nos scores
    const highScoreProposals = proposalsWithScores.filter(p => p.score.level === 'alto');
    if (highScoreProposals.length > 0) {
      const topProposal = highScoreProposals[0];
      insights.push({
        type: 'success',
        priority: 'high',
        title: 'Oportunidade de Alta Probabilidade',
        message: `Proposta ${topProposal.proposal.proposalNumber} de ${topProposal.proposal.client.name} tem ${topProposal.score.percentual}% de chance de fechar`,
        action: topProposal.score.action,
        proposalId: topProposal.proposal._id,
        timestamp: new Date().toISOString()
      });
    }

    const lowScoreProposals = proposalsWithScores.filter(p => 
      p.score.level === 'baixo' || p.score.level === 'muito_baixo'
    );
    if (lowScoreProposals.length > 0) {
      insights.push({
        type: 'warning',
        priority: 'urgent',
        title: 'Propostas em Risco',
        message: `${lowScoreProposals.length} proposta(s) com baixa probabilidade de fechar`,
        action: 'Revisar estratégia e considerar oferecer incentivos',
        count: lowScoreProposals.length,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar insights'
    });
  }
});

/**
 * POST /api/ai/recommendations - Gera recomendações de produtos
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { proposal, selectedProducts, limit } = req.body;

    const recommendations = await getProductRecommendations(
      proposal || {},
      selectedProducts || [],
      limit || 5
    );

    // Enriquecer com dados dos produtos
    if (recommendations.recommendations && recommendations.recommendations.length > 0) {
      recommendations.recommendations = await enrichRecommendations(recommendations.recommendations);
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar recomendações de produtos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ai/recommendations/popular - Produtos mais populares
 */
router.get('/recommendations/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await getGeneralRecommendations(limit);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erro ao buscar produtos populares:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos populares'
    });
  }
});

// Funções auxiliares para formatação de fatores
function getFactorDisplayName(key) {
  if (!key || typeof key !== 'string') return 'Fator Desconhecido';
  
  const names = {
    sellerConversion: 'Taxa de Conversão do Vendedor',
    clientHistory: 'Histórico do Cliente',
    value: 'Valor da Proposta',
    time: 'Tempo de Negociação',
    products: 'Produtos',
    paymentCondition: 'Condição de Pagamento',
    discount: 'Desconto',
    seasonality: 'Sazonalidade',
    engagement: 'Engajamento',
    patterns: 'Padrões Históricos'
  };
  return names[key] || key;
}

function calculateFactorImpact(factor, key) {
  if (!factor || typeof factor !== 'object') return 0;
  
  // Calcular impacto baseado no score e peso
  const score = factor.score || factor.value || 0;
  const weight = factor.weight || 0;
  
  // Impacto é o score normalizado pelo peso
  // Se o score está acima de 50, é positivo, abaixo é negativo
  const baseImpact = (score - 50) * (weight / 100);
  
  // Ajustar baseado no tipo de fator
  if (key === 'sellerConversion' && factor.rate) {
    return (factor.rate - 0.5) * 100; // Taxa de conversão como impacto
  }
  if (key === 'clientHistory' && factor.previousWins && factor.previousProposals) {
    const winRate = factor.previousWins / factor.previousProposals;
    return (winRate - 0.5) * 100;
  }
  
  return baseImpact;
}

function getFactorDefaultDescription(key, factor) {
  if (!factor || typeof factor !== 'object') return 'Sem descrição disponível';
  if (!key) return 'Fator sem identificação';
  
  if (key === 'sellerConversion') {
    return `Taxa de conversão: ${((factor.rate || 0) * 100).toFixed(1)}% | Score: ${(factor.score || 0).toFixed(1)}%`;
  }
  if (key === 'clientHistory') {
    return `Histórico: ${factor.previousWins || 0}/${factor.previousProposals || 0} propostas fechadas`;
  }
  if (key === 'value') {
    return `Valor da proposta analisado em relação ao histórico`;
  }
  if (key === 'time') {
    return `${factor.daysSinceCreation || 0} dias em negociação`;
  }
  if (factor.description) {
    return factor.description;
  }
  return `Fator ${key}: Score ${(factor.score || 0).toFixed(1)}%`;
}

module.exports = router;

