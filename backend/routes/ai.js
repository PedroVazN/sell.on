const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');

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

/**
 * GET /api/ai/dashboard - Dashboard completo de IA/ML
 */
router.get('/dashboard', async (req, res) => {
  try {
    console.log('🤖 Carregando dashboard de IA...');

    // 1. Distribuição de Scores
    const negociacaoProposals = await Proposal.find({ 
      status: 'negociacao' 
    })
      .populate('createdBy', 'name email')
      .limit(100); // Limitar para performance

    const scoresPromises = negociacaoProposals.map(p => calculateProposalScore(p));
    const scoresData = await Promise.all(scoresPromises);
    
    // Distribuição por nível
    const scoreDistribution = {
      alto: { count: 0, totalValue: 0 },
      medio: { count: 0, totalValue: 0 },
      baixo: { count: 0, totalValue: 0 },
      muito_baixo: { count: 0, totalValue: 0 }
    };

    scoresData.forEach((score, index) => {
      const proposal = negociacaoProposals[index];
      if (score && proposal) {
        const level = score.level;
        if (scoreDistribution[level]) {
          scoreDistribution[level].count++;
          scoreDistribution[level].totalValue += proposal.total || 0;
        }
      }
    });

    // 2. Top Propostas (Maior Score)
    const proposalsWithScores = negociacaoProposals
      .map((p, i) => ({
        proposal: p.toObject(),
        score: scoresData[i]
      }))
      .filter(item => item.score)
      .sort((a, b) => (b.score.score || 0) - (a.score.score || 0))
      .slice(0, 10);

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

    const topSellers = Object.values(sellerStats)
      .map(s => ({ ...s, avgScore: s.totalScore / s.proposals }))
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

    // 5. Previsão de Vendas (simplificada baseada em histórico)
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

    // Previsão para próximos 7 dias
    const forecast = {
      next7Days: {
        sales: Math.round(avgDailySales * 7),
        revenue: Math.round(avgDailySales * 7 * avgSaleValue),
        confidence: recentClosed.length > 10 ? 85 : recentClosed.length > 5 ? 70 : 50
      },
      next30Days: {
        sales: Math.round(avgDailySales * 30),
        revenue: Math.round(avgDailySales * 30 * avgSaleValue),
        confidence: recentClosed.length > 10 ? 80 : recentClosed.length > 5 ? 65 : 45
      }
    };

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
        topProposals: proposalsWithScores.map(item => ({
          proposalId: item.proposal._id,
          proposalNumber: item.proposal.proposalNumber,
          client: item.proposal.client.name,
          value: item.proposal.total,
          score: item.score.score,
          percentual: item.score.percentual,
          level: item.score.level,
          action: item.score.action
        })),
        atRiskProposals: atRiskProposals.map(item => ({
          proposalId: item.proposal._id,
          proposalNumber: item.proposal.proposalNumber,
          client: item.proposal.client.name,
          value: item.proposal.total,
          score: item.score.score,
          percentual: item.score.percentual,
          level: item.score.level,
          action: item.score.action
        })),
        insights,
        forecast,
        topSellers,
        topClients,
        conversionRates,
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
  } catch (error) {
    console.error('Erro ao carregar dashboard de IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
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

module.exports = router;

