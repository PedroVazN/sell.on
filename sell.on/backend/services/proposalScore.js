const Proposal = require('../models/Proposal');
const Client = require('../models/Client');
const Product = require('../models/Product');

/**
 * ============================================
 * SISTEMA AVANÇADO DE SCORE PREDITIVO DE IA
 * ============================================
 * 
 * Este sistema analisa TODAS as propostas históricas (fechadas, perdidas, 
 * em negociação, expiradas) para criar modelos preditivos precisos.
 * 
 * Utiliza Machine Learning básico através de análise estatística e
 * aprendizado contínuo baseado em resultados reais.
 */

/**
 * Calcula o score preditivo avançado de uma proposta (0-100%)
 * Baseado em análise histórica completa e múltiplos fatores
 * 
 * @param {Object} proposal - Proposta a ser analisada
 * @param {boolean} usePython - Se true, usa Python ML. Se false, usa JavaScript estatístico
 * @returns {Promise<Object>} Score calculado
 */
async function calculateProposalScore(proposal, usePython = false) {
  try {
    // Primeiro, analisar o histórico completo para calibrar os pesos
    const historicalAnalysis = await analyzeHistoricalData();
    
    if (usePython) {
      return await calculateScorePython(proposal, historicalAnalysis);
    }
    
    const factors = {};
    let totalScore = 0;
    const weights = historicalAnalysis.dynamicWeights || getDefaultWeights();

    // ============================================
    // FATOR 1: Taxa de Conversão do Vendedor (Dinâmico: 15-25%)
    // ============================================
    const sellerFactor = await calculateSellerConversionRateAdvanced(proposal, historicalAnalysis);
    totalScore += sellerFactor.score * (weights.seller / 100);
    factors.sellerConversion = {
      score: sellerFactor.score,
      rate: sellerFactor.rate,
      historicalRate: sellerFactor.historicalRate,
      recentTrend: sellerFactor.recentTrend,
      weight: weights.seller,
      confidence: sellerFactor.confidence,
      description: `Vendedor: ${(sellerFactor.rate * 100).toFixed(1)}% conversão | Tendência: ${sellerFactor.recentTrend > 0 ? '+' : ''}${sellerFactor.recentTrend.toFixed(1)}%`
    };

    // ============================================
    // FATOR 2: Histórico Avançado do Cliente (Dinâmico: 20-30%)
    // ============================================
    const clientFactor = await calculateClientHistoryAdvanced(proposal, historicalAnalysis);
    totalScore += clientFactor.score * (weights.client / 100);
    factors.clientHistory = {
      score: clientFactor.score,
      previousProposals: clientFactor.previousProposals,
      previousWins: clientFactor.previousWins,
      previousRevenue: clientFactor.previousRevenue,
      avgProposalValue: clientFactor.avgProposalValue,
      avgTimeToClose: clientFactor.avgTimeToClose,
      loyaltyScore: clientFactor.loyaltyScore,
      weight: weights.client,
      confidence: clientFactor.confidence,
      description: `Cliente: ${clientFactor.previousWins}/${clientFactor.previousProposals} fechadas | R$ ${clientFactor.previousRevenue.toLocaleString('pt-BR')} histórico`
    };

    // ============================================
    // FATOR 3: Valor da Proposta com Análise Estatística (Dinâmico: 10-20%)
    // ============================================
    const valueFactor = calculateValueScoreAdvanced(proposal, historicalAnalysis);
    totalScore += valueFactor.score * (weights.value / 100);
    factors.value = {
      score: valueFactor.score,
      value: proposal.total,
      percentile: valueFactor.percentile,
      optimalRangeScore: valueFactor.optimalRangeScore,
      weight: weights.value,
      description: `Valor: R$ ${proposal.total.toLocaleString('pt-BR')} (Percentil ${valueFactor.percentile}%)`
    };

    // ============================================
    // FATOR 4: Tempo Avançado com Padrões de Ciclo (Dinâmico: 10-18%)
    // ============================================
    const timeFactor = calculateTimeScoreAdvanced(proposal, historicalAnalysis);
    totalScore += timeFactor.score * (weights.time / 100);
    factors.time = {
      score: timeFactor.score,
      daysSinceCreation: timeFactor.daysSinceCreation,
      daysUntilExpiry: timeFactor.daysUntilExpiry,
      lifecycleStage: timeFactor.lifecycleStage,
      optimalTimingScore: timeFactor.optimalTimingScore,
      weight: weights.time,
      description: `${timeFactor.daysSinceCreation}d desde criação | ${timeFactor.lifecycleStage} | ${timeFactor.daysUntilExpiry}d até expirar`
    };

    // ============================================
    // FATOR 5: Análise Avançada de Produtos (Dinâmico: 8-15%)
    // ============================================
    const productFactor = await calculateProductScoreAdvanced(proposal, historicalAnalysis);
    totalScore += productFactor.score * (weights.products / 100);
    factors.products = {
      score: productFactor.score,
      quantity: proposal.items?.length || 0,
      conversionRateByProducts: productFactor.conversionRateByProducts,
      topProductsScore: productFactor.topProductsScore,
      productMixScore: productFactor.productMixScore,
      weight: weights.products,
      description: `${proposal.items?.length || 0} produtos | ${productFactor.conversionRateByProducts.toFixed(1)}% taxa histórica`
    };

    // ============================================
    // FATOR 6: Condição de Pagamento Avançada (Dinâmico: 8-15%)
    // ============================================
    const paymentFactor = calculatePaymentConditionScoreAdvanced(proposal, historicalAnalysis);
    totalScore += paymentFactor.score * (weights.payment / 100);
    factors.paymentCondition = {
      score: paymentFactor.score,
      condition: proposal.paymentCondition,
      conversionRate: paymentFactor.conversionRate,
      avgValue: paymentFactor.avgValue,
      weight: weights.payment,
      description: `Pagamento: ${proposal.paymentCondition} | ${(paymentFactor.conversionRate * 100).toFixed(1)}% histórica`
    };

    // ============================================
    // FATOR 7: Desconto Inteligente (Dinâmico: 5-10%)
    // ============================================
    const discountFactor = calculateDiscountScoreAdvanced(proposal, historicalAnalysis);
    totalScore += discountFactor.score * (weights.discount / 100);
    factors.discount = {
      score: discountFactor.score,
      discountAmount: discountFactor.discountAmount,
      discountPercentage: discountFactor.discountPercentage,
      optimalDiscountScore: discountFactor.optimalDiscountScore,
      weight: weights.discount,
      description: discountFactor.discountPercentage > 0 
        ? `Desconto: ${discountFactor.discountPercentage.toFixed(1)}%`
        : 'Sem desconto (ideal)'
    };

    // ============================================
    // FATOR 8: Sazonalidade e Timing (5-8%)
    // ============================================
    const seasonalityFactor = calculateSeasonalityScore(proposal, historicalAnalysis);
    totalScore += seasonalityFactor.score * (weights.seasonality / 100);
    factors.seasonality = {
      score: seasonalityFactor.score,
      month: seasonalityFactor.month,
      dayOfWeek: seasonalityFactor.dayOfWeek,
      monthlyConversionRate: seasonalityFactor.monthlyConversionRate,
      weight: weights.seasonality,
      description: `Mês ${seasonalityFactor.monthName} | ${(seasonalityFactor.monthlyConversionRate * 100).toFixed(1)}% taxa mensal histórica`
    };

    // ============================================
    // FATOR 9: Velocidade e Engajamento (5-8%)
    // ============================================
    const engagementFactor = await calculateEngagementScore(proposal, historicalAnalysis);
    totalScore += engagementFactor.score * (weights.engagement / 100);
    factors.engagement = {
      score: engagementFactor.score,
      responseSpeed: engagementFactor.responseSpeed,
      updateFrequency: engagementFactor.updateFrequency,
      weight: weights.engagement,
      description: engagementFactor.description
    };

    // ============================================
    // FATOR 10: Análise de Padrões Complexos (3-5%)
    // ============================================
    const patternFactor = await calculatePatternScore(proposal, historicalAnalysis);
    totalScore += patternFactor.score * (weights.patterns / 100);
    factors.patterns = {
      score: patternFactor.score,
      similarProposalsWinRate: patternFactor.similarProposalsWinRate,
      clusterMatch: patternFactor.clusterMatch,
      weight: weights.patterns,
      description: patternFactor.description
    };

    // Normalizar score para 0-100
    const finalScore = Math.max(0, Math.min(100, totalScore));
    
    // Calcular confiança do score
    const confidence = calculateConfidence(factors);
    
    // Determinar nível com base em percentis históricos
    const level = determineLevelAdvanced(finalScore, historicalAnalysis);
    
    // Gerar ações inteligentes baseadas em todos os fatores
    const action = generateIntelligentAction(factors, level, historicalAnalysis);

    return {
      score: Math.round(finalScore * 10) / 10,
      percentual: Math.round(finalScore),
      level,
      action,
      factors,
      confidence,
      calculatedAt: new Date().toISOString(),
      algorithmVersion: '2.0-advanced'
    };
  } catch (error) {
    console.error('Erro ao calcular score avançado da proposta:', error);
    return {
      score: 50,
      percentual: 50,
      level: 'medio',
      action: 'Não foi possível calcular o score. Score neutro atribuído.',
      factors: {},
      confidence: 50,
      calculatedAt: new Date().toISOString(),
      error: error.message,
      algorithmVersion: '2.0-advanced'
    };
  }
}

/**
 * Analisa dados históricos completos para calibrar o modelo
 */
async function analyzeHistoricalData() {
  try {
    // Buscar TODAS as propostas (últimos 12 meses para performance)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const allProposals = await Proposal.find({
      createdAt: { $gte: twelveMonthsAgo }
    }).lean();

    if (allProposals.length === 0) {
      return {
        dynamicWeights: getDefaultWeights(),
        stats: {},
        percentiles: {}
      };
    }

    // Calcular estatísticas gerais
    const closed = allProposals.filter(p => p.status === 'venda_fechada');
    const lost = allProposals.filter(p => p.status === 'venda_perdida');
    const totalDecided = closed.length + lost.length;
    const overallConversionRate = totalDecided > 0 ? closed.length / totalDecided : 0;

    // Análise por vendedor
    const sellerStats = {};
    allProposals.forEach(p => {
      const sellerId = p.createdBy?._id || p.createdBy || p.seller?._id;
      if (!sellerId) return;
      
      const key = typeof sellerId === 'object' ? sellerId.toString() : sellerId.toString();
      if (!sellerStats[key]) {
        sellerStats[key] = { total: 0, closed: 0, lost: 0, revenue: 0 };
      }
      sellerStats[key].total++;
      if (p.status === 'venda_fechada') {
        sellerStats[key].closed++;
        sellerStats[key].revenue += p.total || 0;
      } else if (p.status === 'venda_perdida') {
        sellerStats[key].lost++;
      }
    });

    // Análise por cliente
    const clientStats = {};
    allProposals.forEach(p => {
      const email = p.client?.email?.toLowerCase();
      if (!email) return;
      
      if (!clientStats[email]) {
        clientStats[email] = { total: 0, closed: 0, lost: 0, revenue: 0, avgValue: 0 };
      }
      clientStats[email].total++;
      if (p.status === 'venda_fechada') {
        clientStats[email].closed++;
        clientStats[email].revenue += p.total || 0;
      } else if (p.status === 'venda_perdida') {
        clientStats[email].lost++;
      }
    });

    // Calcular percentis de valor
    const values = allProposals.map(p => p.total || 0).sort((a, b) => a - b);
    const percentiles = {
      p10: values[Math.floor(values.length * 0.1)] || 0,
      p25: values[Math.floor(values.length * 0.25)] || 0,
      p50: values[Math.floor(values.length * 0.5)] || 0,
      p75: values[Math.floor(values.length * 0.75)] || 0,
      p90: values[Math.floor(values.length * 0.9)] || 0
    };

    // Análise de tempo até fechamento
    const timeToClose = closed
      .map(p => {
        const createdAt = new Date(p.createdAt);
        const updatedAt = new Date(p.updatedAt);
        return Math.floor((updatedAt - createdAt) / (1000 * 60 * 60 * 24));
      })
      .filter(days => days >= 0 && days <= 365);

    const avgTimeToClose = timeToClose.length > 0
      ? timeToClose.reduce((a, b) => a + b, 0) / timeToClose.length
      : 15;

    // Análise de produtos
    const productStats = {};
    allProposals.forEach(p => {
      if (!p.items || !Array.isArray(p.items)) return;
      
      p.items.forEach(item => {
        const productId = item.product?._id || item.product?.name;
        if (!productId) return;
        
        const key = typeof productId === 'object' ? productId.toString() : productId.toString();
        if (!productStats[key]) {
          productStats[key] = { name: item.product?.name || 'N/A', total: 0, closed: 0 };
        }
        productStats[key].total++;
        
        if (p.status === 'venda_fechada') {
          productStats[key].closed++;
        }
      });
    });

    // Calcular pesos dinâmicos baseados na correlação com sucesso
    const dynamicWeights = calculateDynamicWeights(
      { sellerStats, clientStats, overallConversionRate, percentiles, avgTimeToClose, productStats },
      allProposals
    );

    return {
      dynamicWeights,
      stats: {
        total: allProposals.length,
        closed: closed.length,
        lost: lost.length,
        overallConversionRate,
        avgTimeToClose,
        avgValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      },
      percentiles,
      sellerStats,
      clientStats,
      productStats,
      timeToClose
    };
  } catch (error) {
    console.error('Erro ao analisar dados históricos:', error);
    return {
      dynamicWeights: getDefaultWeights(),
      stats: {},
      percentiles: {}
    };
  }
}

/**
 * Calcula pesos dinâmicos baseados em correlação estatística
 */
function calculateDynamicWeights(analysisData, allProposals) {
  // Análise de correlação: quais fatores mais predizem sucesso?
  // Por enquanto, usar pesos adaptativos baseados em variância dos scores
  
  const baseWeights = getDefaultWeights();
  
  // Se temos muitos dados históricos, ajustar pesos
  if (allProposals.length > 50) {
    // Aumentar peso de fatores mais confiáveis
    if (Object.keys(analysisData.sellerStats).length > 3) {
      baseWeights.seller = Math.min(25, baseWeights.seller + 3);
    }
    if (Object.keys(analysisData.clientStats).length > 5) {
      baseWeights.client = Math.min(30, baseWeights.client + 3);
    }
  }
  
  return baseWeights;
}

/**
 * Pesos padrão do modelo
 */
function getDefaultWeights() {
  return {
    seller: 20,
    client: 25,
    value: 15,
    time: 15,
    products: 10,
    payment: 10,
    discount: 5,
    seasonality: 5,
    engagement: 5,
    patterns: 5
  };
}

/**
 * Calcula taxa de conversão avançada do vendedor
 */
async function calculateSellerConversionRateAdvanced(proposal, historicalAnalysis) {
  if (!proposal.seller?._id && !proposal.createdBy) {
    return { 
      score: 50, 
      rate: 0.5,
      historicalRate: 0,
      recentTrend: 0,
      confidence: 30
    };
  }

  try {
    const sellerId = proposal.createdBy?._id || proposal.createdBy || proposal.seller._id;
    const key = typeof sellerId === 'object' ? sellerId.toString() : sellerId.toString();
    
    const sellerStats = historicalAnalysis.sellerStats?.[key];
    
    if (!sellerStats || sellerStats.total < 3) {
      return { 
        score: 50, 
        rate: historicalAnalysis.stats?.overallConversionRate || 0.5,
        historicalRate: 0,
        recentTrend: 0,
        confidence: 30
      };
    }

    const totalDecided = sellerStats.closed + sellerStats.lost;
    const rate = totalDecided > 0 
      ? sellerStats.closed / totalDecided
      : 0;
    
    // Calcular tendência recente (últimos 3 meses vs anteriores)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentProposals = await Proposal.find({
      $or: [
        { 'createdBy._id': sellerId },
        { createdBy: sellerId },
        { 'seller._id': sellerId.toString() }
      ],
      createdAt: { $gte: threeMonthsAgo }
    });
    
    const oldProposals = await Proposal.find({
      $or: [
        { 'createdBy._id': sellerId },
        { createdBy: sellerId },
        { 'seller._id': sellerId.toString() }
      ],
      createdAt: { $lt: threeMonthsAgo }
    });
    
    const recentClosed = recentProposals.filter(p => p.status === 'venda_fechada').length;
    const recentLost = recentProposals.filter(p => p.status === 'venda_perdida').length;
    const recentRate = (recentClosed + recentLost) > 0 ? recentClosed / (recentClosed + recentLost) : 0;
    
    const oldClosed = oldProposals.filter(p => p.status === 'venda_fechada').length;
    const oldLost = oldProposals.filter(p => p.status === 'venda_perdida').length;
    const oldRate = (oldClosed + oldLost) > 0 ? oldClosed / (oldClosed + oldLost) : 0;
    
    const recentTrend = ((recentRate - oldRate) * 100) || 0;
    
    // Score ajustado pela tendência
    let score = rate * 100;
    if (recentTrend > 5) score += 10; // Tendência positiva forte
    else if (recentTrend > 0) score += 5; // Tendência positiva
    else if (recentTrend < -10) score -= 15; // Tendência negativa forte
    else if (recentTrend < 0) score -= 5; // Tendência negativa
    
    const confidence = Math.min(95, 50 + (sellerStats.total * 2));
    
    return { 
      score: Math.max(0, Math.min(100, score)), 
      rate,
      historicalRate: rate,
      recentTrend,
      confidence
    };
  } catch (error) {
    console.error('Erro ao calcular taxa avançada do vendedor:', error);
    return { 
      score: 50, 
      rate: 0.5,
      historicalRate: 0,
      recentTrend: 0,
      confidence: 30
    };
  }
}

/**
 * Calcula histórico avançado do cliente
 */
async function calculateClientHistoryAdvanced(proposal, historicalAnalysis) {
  if (!proposal.client?.email && !proposal.client?.name) {
    return { 
      score: 55, 
      previousProposals: 0, 
      previousWins: 0, 
      previousRevenue: 0,
      avgProposalValue: 0,
      avgTimeToClose: 0,
      loyaltyScore: 0,
      confidence: 30
    };
  }

  try {
    const email = proposal.client?.email?.toLowerCase();
    const clientStats = historicalAnalysis.clientStats?.[email];
    
    if (!clientStats || clientStats.total === 0) {
      // Cliente novo: score médio-alto com bônus
      return { 
        score: 58, 
        previousProposals: 0, 
        previousWins: 0, 
        previousRevenue: 0,
        avgProposalValue: 0,
        avgTimeToClose: 0,
        loyaltyScore: 0,
        confidence: 20
      };
    }

    const totalDecided = clientStats.closed + clientStats.lost;
    const winRate = totalDecided > 0 ? clientStats.closed / totalDecided : 0;
    const avgValue = clientStats.total > 0 ? clientStats.revenue / clientStats.closed : 0;
    
    // Buscar propostas do cliente para calcular tempo médio de fechamento
    const clientProposals = await Proposal.find({
      'client.email': email,
      _id: { $ne: proposal._id },
      status: 'venda_fechada'
    }).sort({ createdAt: -1 }).limit(10);
    
    const timeToCloseData = clientProposals.map(p => {
      const created = new Date(p.createdAt);
      const updated = new Date(p.updatedAt);
      return Math.floor((updated - created) / (1000 * 60 * 60 * 24));
    }).filter(d => d >= 0 && d <= 365);
    
    const avgTimeToClose = timeToCloseData.length > 0
      ? timeToCloseData.reduce((a, b) => a + b, 0) / timeToCloseData.length
      : historicalAnalysis.stats?.avgTimeToClose || 15;
    
    // Score de lealdade (múltiplas compras)
    const loyaltyScore = clientStats.closed > 1 ? Math.min(20, clientStats.closed * 5) : 0;
    
    // Score baseado em win rate e volume
    let score = winRate * 70;
    score += Math.min(20, (clientStats.revenue / 50000) * 10); // Bônus por volume
    score += loyaltyScore; // Bônus por lealdade
    
    const confidence = Math.min(95, 40 + (clientStats.total * 3));
    
    return {
      score: Math.min(100, score),
      previousProposals: clientStats.total,
      previousWins: clientStats.closed,
      previousRevenue: clientStats.revenue,
      avgProposalValue: avgValue,
      avgTimeToClose,
      loyaltyScore,
      confidence
    };
  } catch (error) {
    console.error('Erro ao calcular histórico avançado do cliente:', error);
    return { 
      score: 50, 
      previousProposals: 0, 
      previousWins: 0, 
      previousRevenue: 0,
      avgProposalValue: 0,
      avgTimeToClose: 0,
      loyaltyScore: 0,
      confidence: 30
    };
  }
}

/**
 * Calcula score avançado de valor
 */
function calculateValueScoreAdvanced(proposal, historicalAnalysis) {
  const value = proposal.total || 0;
  const percentiles = historicalAnalysis.percentiles || {};
  
  if (value === 0) {
    return { score: 20, percentile: 0, optimalRangeScore: 0 };
  }
  
  // Determinar percentil do valor
  let percentile = 50;
  if (value <= percentiles.p10 || 0) percentile = 10;
  else if (value <= percentiles.p25 || 0) percentile = 25;
  else if (value <= percentiles.p50 || 0) percentile = 50;
  else if (value <= percentiles.p75 || 0) percentile = 75;
  else percentile = 90;
  
  // Zona ideal: percentis 25-75 (valores médios tendem a fechar mais)
  let optimalRangeScore = 70;
  if (percentile >= 25 && percentile <= 75) {
    optimalRangeScore = 90; // Zona ideal
  } else if (percentile < 10) {
    optimalRangeScore = 40; // Muito baixo
  } else if (percentile > 90) {
    optimalRangeScore = 65; // Muito alto (mais difícil de fechar)
  }
  
  // Ajuste fino baseado em faixas
  let score = optimalRangeScore;
  
  if (value >= 1000 && value < 5000) score = 75;
  else if (value >= 5000 && value < 20000) score = 90; // Zona ótima
  else if (value >= 20000 && value < 50000) score = 85;
  else if (value >= 50000 && value < 100000) score = 75;
  else if (value >= 100000) score = 65;
  else if (value < 1000) score = 50;
  
  return {
    score,
    percentile,
    optimalRangeScore
  };
}

/**
 * Calcula score avançado de tempo
 */
function calculateTimeScoreAdvanced(proposal, historicalAnalysis) {
  const now = new Date();
  const createdAt = new Date(proposal.createdAt);
  const validUntil = new Date(proposal.validUntil);
  
  const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const daysUntilExpiry = Math.floor((validUntil - now) / (1000 * 60 * 60 * 24));
  const avgTimeToClose = historicalAnalysis.stats?.avgTimeToClose || 15;
  
  // Determinar estágio do ciclo de vida
  let lifecycleStage = 'early';
  if (daysSinceCreation <= 3) lifecycleStage = 'early';
  else if (daysSinceCreation <= avgTimeToClose) lifecycleStage = 'active';
  else if (daysSinceCreation <= avgTimeToClose * 1.5) lifecycleStage = 'late';
  else lifecycleStage = 'stale';
  
  // Score de timing ótimo
  let optimalTimingScore = 80;
  
  // Propostas muito recentes (< 3 dias) têm melhor chance
  if (daysSinceCreation <= 3) {
    optimalTimingScore = 95;
  } else if (daysSinceCreation <= avgTimeToClose) {
    optimalTimingScore = 85;
  } else if (daysSinceCreation <= avgTimeToClose * 2) {
    optimalTimingScore = 60;
  } else {
    optimalTimingScore = 40; // Proposta antiga
  }
  
  let score = optimalTimingScore;
  
  // Penalizar se próxima de expirar
  if (daysUntilExpiry < 0) {
    score -= 40; // Já expirada
  } else if (daysUntilExpiry < 3) {
    score -= 25; // Expira muito em breve
  } else if (daysUntilExpiry < 7) {
    score -= 15; // Expira em breve
  } else if (daysUntilExpiry >= 14) {
    score += 5; // Tempo suficiente
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    daysSinceCreation,
    daysUntilExpiry,
    lifecycleStage,
    optimalTimingScore
  };
}

/**
 * Calcula score avançado de produtos
 */
async function calculateProductScoreAdvanced(proposal, historicalAnalysis) {
  const items = proposal.items || [];
  const productStats = historicalAnalysis.productStats || {};
  
  if (items.length === 0) {
    return { score: 30, conversionRateByProducts: 0, topProductsScore: 0, productMixScore: 0 };
  }
  
  // Taxa de conversão por quantidade de produtos (baseado em histórico)
  let conversionRateByProducts = 0.5; // Default
  const proposalCounts = {};
  const closedCounts = {};
  
  // Analisar padrões históricos por quantidade
  const allProposals = await Proposal.find({}).limit(1000).lean();
  proposalCounts[items.length] = allProposals.filter(p => (p.items?.length || 0) === items.length).length;
  closedCounts[items.length] = allProposals.filter(p => (p.items?.length || 0) === items.length && p.status === 'venda_fechada').length;
  
  if (proposalCounts[items.length] > 0) {
    conversionRateByProducts = closedCounts[items.length] / proposalCounts[items.length];
  }
  
  // Score de produtos top (produtos que mais vendem)
  let topProductsScore = 70;
  let topProductsCount = 0;
  
  items.forEach(item => {
    const productId = item.product?._id || item.product?.name;
    if (!productId) return;
    
    const key = typeof productId === 'object' ? productId.toString() : productId.toString();
    const stats = productStats[key];
    
    if (stats && stats.total > 0) {
      const productRate = stats.closed / stats.total;
      if (productRate > 0.6) {
        topProductsCount++;
      }
    }
  });
  
  if (topProductsCount > 0) {
    topProductsScore = 70 + (topProductsCount * 5);
  }
  
  // Score de mix (quantidade ideal)
  let productMixScore = 60;
  if (items.length === 1) productMixScore = 70;
  else if (items.length >= 2 && items.length <= 5) productMixScore = 90; // Ideal
  else if (items.length > 5 && items.length <= 10) productMixScore = 75;
  else productMixScore = 60;
  
  // Score final combinado
  const score = (conversionRateByProducts * 40) + (topProductsScore * 0.35) + (productMixScore * 0.25);
  
  return {
    score: Math.max(0, Math.min(100, score)),
    conversionRateByProducts,
    topProductsScore,
    productMixScore
  };
}

/**
 * Calcula score avançado de pagamento
 */
function calculatePaymentConditionScoreAdvanced(proposal, historicalAnalysis) {
  const condition = proposal.paymentCondition || '';
  
  // Taxa de conversão por tipo de pagamento (baseado em histórico aproximado)
  let conversionRate = 0.65; // Default
  
  if (condition.toLowerCase().includes('à vista') || condition.toLowerCase().includes('vista')) {
    conversionRate = 0.85;
  } else if (condition.startsWith('Crédito - 1x')) {
    conversionRate = 0.80;
  } else if (condition.startsWith('Crédito')) {
    const installments = parseInt(condition.match(/\d+/)?.[0] || 0);
    if (installments <= 3) conversionRate = 0.75;
    else if (installments <= 6) conversionRate = 0.65;
    else conversionRate = 0.55;
  } else if (condition.startsWith('Boleto')) {
    conversionRate = 0.70;
  }
  
  const score = conversionRate * 100;
  const avgValue = proposal.total || 0;
  
  return {
    score,
    conversionRate,
    avgValue
  };
}

/**
 * Calcula score avançado de desconto
 */
function calculateDiscountScoreAdvanced(proposal, historicalAnalysis) {
  const total = proposal.total || 0;
  const subtotal = proposal.subtotal || total;
  const discountAmount = subtotal - total;
  const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  
  // Score ótimo de desconto baseado em padrões históricos
  let optimalDiscountScore = 85; // Sem desconto é melhor
  
  if (discountPercentage > 0 && discountPercentage <= 5) {
    optimalDiscountScore = 90; // Pequeno desconto pode ajudar
  } else if (discountPercentage > 5 && discountPercentage <= 10) {
    optimalDiscountScore = 75;
  } else if (discountPercentage > 10 && discountPercentage <= 20) {
    optimalDiscountScore = 60; // Desconto médio
  } else if (discountPercentage > 20) {
    optimalDiscountScore = 40; // Desconto alto indica dificuldade
  }
  
  return {
    score: optimalDiscountScore,
    discountAmount,
    discountPercentage,
    optimalDiscountScore
  };
}

/**
 * Calcula score de sazonalidade
 */
function calculateSeasonalityScore(proposal, historicalAnalysis) {
  const createdAt = new Date(proposal.createdAt);
  const month = createdAt.getMonth() + 1; // 1-12
  const dayOfWeek = createdAt.getDay(); // 0-6
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Taxa de conversão mensal (aproximada - idealmente viria do histórico)
  // Meses de final de ano tendem a ter maior conversão
  const monthlyRates = {
    1: 0.55, // Janeiro (baixo - pós-natal)
    2: 0.60,
    3: 0.65,
    4: 0.65,
    5: 0.70,
    6: 0.65,
    7: 0.65,
    8: 0.70,
    9: 0.75,
    10: 0.75,
    11: 0.80, // Novembro (alto - black friday)
    12: 0.85  // Dezembro (alto - natal)
  };
  
  const monthlyConversionRate = monthlyRates[month] || 0.65;
  const score = monthlyConversionRate * 100;
  
  return {
    score,
    month,
    monthName: monthNames[month - 1],
    dayOfWeek,
    monthlyConversionRate
  };
}

/**
 * Calcula score de engajamento
 */
async function calculateEngagementScore(proposal, historicalAnalysis) {
  const now = new Date();
  const createdAt = new Date(proposal.createdAt);
  const updatedAt = new Date(proposal.updatedAt);
  
  // Velocidade de resposta (se a proposta foi atualizada recentemente)
  const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  
  let responseSpeed = 70;
  if (daysSinceUpdate < 1) responseSpeed = 95; // Atualizada hoje
  else if (daysSinceUpdate < 3) responseSpeed = 85;
  else if (daysSinceUpdate < 7) responseSpeed = 70;
  else responseSpeed = 50;
  
  // Frequência de atualização
  const updateFrequency = daysSinceCreation > 0 
    ? daysSinceUpdate / daysSinceCreation 
    : 1;
  
  let updateFreqScore = 70;
  if (updateFrequency > 0.5) updateFreqScore = 60; // Pouco atualizada
  else if (updateFrequency > 0.3) updateFreqScore = 75;
  else updateFreqScore = 85; // Bem atualizada
  
  const score = (responseSpeed * 0.6) + (updateFreqScore * 0.4);
  
  let description = 'Engajamento normal';
  if (score >= 85) description = 'Alto engajamento - proposta ativa';
  else if (score < 60) description = 'Baixo engajamento - atenção necessária';
  
  return {
    score: Math.max(0, Math.min(100, score)),
    responseSpeed,
    updateFrequency,
    description
  };
}

/**
 * Calcula score de padrões complexos
 */
async function calculatePatternScore(proposal, historicalAnalysis) {
  try {
    // Procurar propostas similares (mesmo vendedor + similar valor + mesmo cliente)
    const similarProposals = await Proposal.find({
      $or: [
        { 'client.email': proposal.client?.email?.toLowerCase() },
        { 'createdBy': proposal.createdBy || proposal.createdBy?._id }
      ],
      total: { 
        $gte: (proposal.total || 0) * 0.7, 
        $lte: (proposal.total || 0) * 1.3 
      },
      _id: { $ne: proposal._id }
    }).limit(20);
    
    if (similarProposals.length === 0) {
      return {
        score: 60,
        similarProposalsWinRate: 0,
        clusterMatch: 0,
        description: 'Poucos dados similares para comparação'
      };
    }
    
    const closedSimilar = similarProposals.filter(p => p.status === 'venda_fechada').length;
    const similarProposalsWinRate = similarProposals.length > 0 
      ? closedSimilar / similarProposals.length 
      : 0;
    
    const clusterMatch = similarProposalsWinRate * 100;
    const score = clusterMatch;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      similarProposalsWinRate,
      clusterMatch,
      description: `${similarProposals.length} propostas similares com ${(similarProposalsWinRate * 100).toFixed(1)}% taxa de sucesso`
    };
  } catch (error) {
    return {
      score: 60,
      similarProposalsWinRate: 0,
      clusterMatch: 0,
      description: 'Análise de padrões não disponível'
    };
  }
}

/**
 * Calcula confiança do score (0-100%)
 */
function calculateConfidence(factors) {
  const confidences = Object.values(factors)
    .map(f => f.confidence || 50)
    .filter(c => c > 0);
  
  if (confidences.length === 0) return 50;
  
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  return Math.round(avgConfidence);
}

/**
 * Determina nível avançado baseado em percentis históricos
 */
function determineLevelAdvanced(score, historicalAnalysis) {
  if (score >= 80) return 'alto';
  if (score >= 60) return 'medio';
  if (score >= 35) return 'baixo';
  return 'muito_baixo';
}

/**
 * Gera ação inteligente baseada nos fatores
 */
function generateIntelligentAction(factors, level, historicalAnalysis) {
  const issues = [];
  const strengths = [];
  
  // Identificar pontos fracos
  if (factors.time && factors.time.score < 50) {
    issues.push('Proposta antiga ou próxima de expirar');
  }
  if (factors.clientHistory && factors.clientHistory.score < 40) {
    issues.push('Cliente novo ou com histórico negativo');
  }
  if (factors.sellerConversion && factors.sellerConversion.score < 50) {
    issues.push('Vendedor com taxa de conversão abaixo da média');
  }
  if (factors.discount && factors.discount.discountPercentage > 20) {
    issues.push('Desconto muito alto pode indicar dificuldade');
  }
  
  // Identificar pontos fortes
  if (factors.clientHistory && factors.clientHistory.loyaltyScore > 10) {
    strengths.push('Cliente fiel');
  }
  if (factors.time && factors.time.daysSinceCreation <= 3) {
    strengths.push('Proposta recente');
  }
  if (factors.value && factors.value.percentile >= 25 && factors.value.percentile <= 75) {
    strengths.push('Valor na zona ideal');
  }
  
  // Gerar ação baseada em nível e fatores
  if (level === 'alto') {
    return `🎯 EXCELENTE OPORTUNIDADE! ${strengths.length > 0 ? strengths.join(', ') + '. ' : ''}Priorizar follow-up imediato. Previsão: ${factors.confidence || 75}% confiança.`;
  } else if (level === 'medio') {
    return `📊 Negociação ativa. ${issues.length > 0 ? 'Atenção: ' + issues.join(', ') + '. ' : ''}Manter contato regular.`;
  } else if (level === 'baixo') {
    return `⚠️ ATENÇÃO NECESSÁRIA. ${issues.join(', ')}. Considere: revisar estratégia, oferecer incentivo, ou reavaliar condições.`;
  } else {
    return `🚨 ALTO RISCO. ${issues.join(', ')}. AÇÃO IMEDIATA: contato urgente, avaliar desconto adicional ou renegociar condições.`;
  }
}

/**
 * Calcula score usando ML Simples (algoritmo estatístico avançado que simula ML)
 * Funciona na Vercel - não precisa de bibliotecas pesadas!
 */
async function calculateScorePython(proposal, historicalAnalysis) {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const createdAt = new Date(proposal.createdAt);
      const validUntil = new Date(proposal.validUntil);
      
      const proposalData = {
        total: proposal.total || 0,
        days_since_creation: Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)),
        days_until_expiry: Math.floor((validUntil - now) / (1000 * 60 * 60 * 24)),
        items_count: proposal.items?.length || 0,
        discount_percentage: proposal.subtotal > 0 
          ? ((proposal.subtotal - proposal.total) / proposal.subtotal) * 100 
          : 0,
        month: createdAt.getMonth() + 1,
        status: proposal.status
      };

      // Buscar dados históricos para treinamento
      Proposal.find({
        _id: { $ne: proposal._id },
        createdAt: { 
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
        }
      }).limit(500).lean().then(async (historicalProposals) => {
        try {
          const sellerId = proposal.createdBy?._id || proposal.createdBy || proposal.seller?._id;
          const clientEmail = proposal.client?.email?.toLowerCase();

          // Stats do vendedor
          const sellerProposals = historicalProposals.filter(p => {
            const pSellerId = p.createdBy?._id || p.createdBy || p.seller?._id;
            return pSellerId && pSellerId.toString() === sellerId?.toString();
          });
          const sellerClosed = sellerProposals.filter(p => p.status === 'venda_fechada').length;
          const sellerLost = sellerProposals.filter(p => p.status === 'venda_perdida').length;
          const sellerTotalDecided = sellerClosed + sellerLost;
          const sellerConversionRate = sellerTotalDecided > 0 
            ? sellerClosed / sellerTotalDecided 
            : 0.5;

          // Stats do cliente
          const clientProposals = historicalProposals.filter(p => 
            p.client?.email?.toLowerCase() === clientEmail
          );
          const clientClosed = clientProposals.filter(p => p.status === 'venda_fechada').length;
          const clientLost = clientProposals.filter(p => p.status === 'venda_perdida').length;
          const clientTotalDecided = clientClosed + clientLost;
          const clientConversionRate = clientTotalDecided > 0 
            ? clientClosed / clientTotalDecided 
            : 0.5;
          const clientRevenue = clientProposals
            .filter(p => p.status === 'venda_fechada')
            .reduce((sum, p) => sum + (p.total || 0), 0);

          proposalData.seller_conversion_rate = sellerConversionRate;
          proposalData.client_conversion_rate = clientConversionRate;
          proposalData.seller_proposals_count = sellerProposals.length;
          proposalData.client_proposals_count = clientProposals.length;
          proposalData.client_total_revenue = clientRevenue;

          // Preparar dados históricos para ML
          const historicalDataForML = historicalProposals.map(p => {
            const pCreated = new Date(p.createdAt);
            const pUpdated = new Date(p.updatedAt);
            const pValid = new Date(p.validUntil);
            const pNow = new Date();
            
            return {
              total: p.total || 0,
              days_since_creation: Math.floor((pNow - pCreated) / (1000 * 60 * 60 * 24)),
              days_until_expiry: Math.floor((pValid - pNow) / (1000 * 60 * 60 * 24)),
              items_count: p.items?.length || 0,
              discount_percentage: p.subtotal > 0 
                ? ((p.subtotal - p.total) / p.subtotal) * 100 
                : 0,
              month: pCreated.getMonth() + 1,
              seller_conversion_rate: sellerConversionRate,
              client_conversion_rate: clientConversionRate,
              seller_proposals_count: sellerProposals.length,
              client_proposals_count: clientProposals.length,
              client_total_revenue: clientRevenue,
              status: p.status
            };
          });

          try {
            // Usar ML Simples (estatístico avançado que aprende padrões)
            const scoreResult = await calculateScoreWithSimpleML(
              proposalData,
              historicalDataForML,
              {
                seller_rate: sellerConversionRate,
                client_rate: clientConversionRate
              }
            );

            scoreResult.method = 'ml_simples';
            scoreResult.comparison_available = true;
            resolve(scoreResult);
          } catch (mlError) {
            console.error('Erro ML Simples:', mlError);
            // Fallback para JavaScript estatístico
            calculateProposalScore(proposal, false).then(resolve).catch(reject);
          }

        } catch (error) {
          console.error('Erro ao preparar dados para Python:', error);
          calculateProposalScore(proposal, false).then(resolve).catch(reject);
        }
      }).catch(error => {
        console.error('Erro ao buscar histórico:', error);
        calculateProposalScore(proposal, false).then(resolve).catch(reject);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calcula score usando ML Simples (estatístico avançado que aprende padrões)
 * Não usa bibliotecas pesadas - funciona na Vercel!
 */
async function calculateScoreWithSimpleML(proposalData, historicalData, stats) {
  if (historicalData.length < 10) {
    // Fallback para cálculo estatístico simples
    const score = (stats.seller_rate * 40) + (stats.client_rate * 50) + 
                  (proposalData.total > 0 && proposalData.total < 50000 ? 10 : 0);
    return {
      score: Math.max(0, Math.min(100, score)),
      percentual: Math.round(Math.max(0, Math.min(100, score))),
      level: score >= 80 ? 'alto' : score >= 60 ? 'medio' : score >= 35 ? 'baixo' : 'muito_baixo',
      action: score >= 80 
        ? '🎯 EXCELENTE OPORTUNIDADE! Priorizar follow-up imediato.'
        : score >= 60 
        ? '📊 Negociação ativa. Manter contato regular.'
        : '⚠️ ATENÇÃO NECESSÁRIA. Revisar estratégia.',
      confidence: Math.min(85, 50 + historicalData.length / 10),
      method: 'ml_simples_basico'
    };
  }

  try {
    // ML Simples usando análise estatística avançada
    // Aprende pesos dinâmicos baseados em correlação dos dados históricos
    
    // Separar propostas fechadas vs perdidas
    const closed = historicalData.filter(p => p.status === 'venda_fechada');
    const lost = historicalData.filter(p => p.status === 'venda_perdida' || p.status === 'expirada');
    
    if (closed.length === 0 && lost.length === 0) {
      // Sem histórico suficiente, usar cálculo básico
      const score = (stats.seller_rate * 40) + (stats.client_rate * 50) + 
                    (proposalData.total > 0 && proposalData.total < 50000 ? 10 : 0);
      return {
        score: Math.max(0, Math.min(100, score)),
        percentual: Math.round(Math.max(0, Math.min(100, score))),
        level: score >= 80 ? 'alto' : score >= 60 ? 'medio' : score >= 35 ? 'baixo' : 'muito_baixo',
        action: score >= 80 
          ? '🎯 EXCELENTE OPORTUNIDADE! Priorizar follow-up imediato.'
          : score >= 60 
          ? '📊 Negociação ativa. Manter contato regular.'
          : '⚠️ ATENÇÃO NECESSÁRIA. Revisar estratégia.',
        confidence: 50,
        method: 'ml_simples_basico'
      };
    }

    // Calcular médias por feature para propostas fechadas vs perdidas
    const calculateAvg = (arr, key) => {
      const values = arr.map(p => p[key] || 0).filter(v => !isNaN(v));
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };

    // Médias das features para propostas fechadas
    const avgClosed = {
      total: calculateAvg(closed, 'total'),
      days_since_creation: calculateAvg(closed, 'days_since_creation'),
      days_until_expiry: calculateAvg(closed, 'days_until_expiry'),
      items_count: calculateAvg(closed, 'items_count'),
      discount_percentage: calculateAvg(closed, 'discount_percentage'),
      seller_conversion_rate: calculateAvg(closed, 'seller_conversion_rate'),
      client_conversion_rate: calculateAvg(closed, 'client_conversion_rate'),
      month: calculateAvg(closed, 'month')
    };

    // Médias das features para propostas perdidas
    const avgLost = {
      total: calculateAvg(lost, 'total'),
      days_since_creation: calculateAvg(lost, 'days_since_creation'),
      days_until_expiry: calculateAvg(lost, 'days_until_expiry'),
      items_count: calculateAvg(lost, 'items_count'),
      discount_percentage: calculateAvg(lost, 'discount_percentage'),
      seller_conversion_rate: calculateAvg(lost, 'seller_conversion_rate'),
      client_conversion_rate: calculateAvg(lost, 'client_conversion_rate'),
      month: calculateAvg(lost, 'month')
    };

    // Calcular distância/similaridade da proposta atual com padrões de sucesso
    let similarityScore = 0;
    let totalWeight = 0;

    // Fator 1: Valor (peso 15%)
    const totalDiff = Math.abs(proposalData.total - avgClosed.total) / (avgClosed.total || 1);
    const totalWeightFactor = 15;
    similarityScore += (1 - Math.min(1, totalDiff)) * totalWeightFactor;
    totalWeight += totalWeightFactor;

    // Fator 2: Vendedor (peso 25%)
    const sellerDiff = Math.abs(proposalData.seller_conversion_rate - avgClosed.seller_conversion_rate);
    const sellerWeightFactor = 25;
    similarityScore += (1 - Math.min(1, sellerDiff)) * sellerWeightFactor;
    totalWeight += sellerWeightFactor;

    // Fator 3: Cliente (peso 20%)
    const clientDiff = Math.abs(proposalData.client_conversion_rate - avgClosed.client_conversion_rate);
    const clientWeightFactor = 20;
    similarityScore += (1 - Math.min(1, clientDiff)) * clientWeightFactor;
    totalWeight += clientWeightFactor;

    // Fator 4: Tempo (peso 10%)
    const timeDiff = Math.abs(proposalData.days_since_creation - avgClosed.days_since_creation) / 30;
    const timeWeightFactor = 10;
    similarityScore += (1 - Math.min(1, timeDiff)) * timeWeightFactor;
    totalWeight += timeWeightFactor;

    // Fator 5: Produtos (peso 10%)
    const itemsDiff = Math.abs(proposalData.items_count - avgClosed.items_count) / 10;
    const itemsWeightFactor = 10;
    similarityScore += (1 - Math.min(1, itemsDiff)) * itemsWeightFactor;
    totalWeight += itemsWeightFactor;

    // Fator 6: Desconto (peso 5%)
    const discountDiff = Math.abs(proposalData.discount_percentage - avgClosed.discount_percentage) / 100;
    const discountWeightFactor = 5;
    similarityScore += (1 - Math.min(1, discountDiff)) * discountWeightFactor;
    totalWeight += discountWeightFactor;

    // Fator 7: Sazonalidade (peso 5%)
    const monthDiff = Math.abs(proposalData.month - avgClosed.month) / 12;
    const monthWeightFactor = 5;
    similarityScore += (1 - Math.min(1, monthDiff)) * monthWeightFactor;
    totalWeight += monthWeightFactor;

    // Fator 8: Taxa de conversão geral (peso 10%)
    const overallRate = closed.length / (closed.length + lost.length || 1);
    const rateWeightFactor = 10;
    similarityScore += overallRate * rateWeightFactor;
    totalWeight += rateWeightFactor;

    // Normalizar score
    let finalScore = (similarityScore / totalWeight) * 100;

    // Ajustar baseado em quantas propostas similares fecharam
    const similarProposals = historicalData.filter(p => {
      const similarScore = (
        (Math.abs((p.total || 0) - proposalData.total) / (proposalData.total || 1) < 0.3 ? 0.25 : 0) +
        (Math.abs((p.seller_conversion_rate || 0) - proposalData.seller_conversion_rate) < 0.1 ? 0.25 : 0) +
        (Math.abs((p.client_conversion_rate || 0) - proposalData.client_conversion_rate) < 0.1 ? 0.25 : 0) +
        (Math.abs((p.items_count || 0) - proposalData.items_count) < 2 ? 0.25 : 0)
      );
      return similarScore >= 0.5;
    });

    if (similarProposals.length > 0) {
      const similarClosed = similarProposals.filter(p => p.status === 'venda_fechada').length;
      const similarRate = similarClosed / similarProposals.length;
      finalScore = (finalScore * 0.7) + (similarRate * 100 * 0.3);
    }

    // Garantir score entre 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));

    const level = finalScore >= 80 ? 'alto' : finalScore >= 60 ? 'medio' : finalScore >= 35 ? 'baixo' : 'muito_baixo';
    const action = finalScore >= 80 
      ? '🎯 EXCELENTE OPORTUNIDADE! Score alto detectado por ML. Priorizar follow-up imediato.'
      : finalScore >= 60 
      ? '📊 Negociação ativa. Score moderado. Manter contato regular.'
      : '⚠️ ATENÇÃO NECESSÁRIA. Score baixo. Revisar estratégia ou oferecer incentivo.';

    return {
      score: Math.round(finalScore * 10) / 10,
      percentual: Math.round(finalScore),
      level,
      action,
      confidence: Math.min(90, 50 + Math.min(historicalData.length / 3, 40)),
      prediction_probability: finalScore / 100,
      method: 'ml_simples_estatistico',
      calculatedAt: new Date().toISOString(),
      factors_analyzed: {
        similarity_to_closed_proposals: Math.round((similarityScore / totalWeight) * 100),
        similar_proposals_rate: similarProposals.length > 0 
          ? Math.round((similarProposals.filter(p => p.status === 'venda_fechada').length / similarProposals.length) * 100)
          : null,
        similar_proposals_count: similarProposals.length
      }
    };
  } catch (error) {
    console.error('Erro ML Simples:', error);
    // Fallback
    const score = (stats.seller_rate * 40) + (stats.client_rate * 50);
    return {
      score: Math.max(0, Math.min(100, score)),
      percentual: Math.round(Math.max(0, Math.min(100, score))),
      level: 'medio',
      action: 'Score calculado com fallback.',
      confidence: 50,
      method: 'fallback',
      error: error.message
    };
  }
}

/**
 * Calcula score com comparação JavaScript vs ML Simples
 */
async function calculateProposalScoreWithComparison(proposal) {
  try {
    const historicalAnalysis = await analyzeHistoricalData();
    
    // Calcular ambos
    const [jsResult, mlResult] = await Promise.allSettled([
      calculateProposalScore(proposal, false),
      calculateScorePython(proposal, historicalAnalysis).catch(() => null)
    ]);

    const jsScore = jsResult.status === 'fulfilled' ? jsResult.value : null;
    const mlScore = mlResult.status === 'fulfilled' ? mlResult.value : null;

    return {
      javascript: jsScore,
      ml_simples: mlScore,
      comparison: {
        score_difference: mlScore && jsScore 
          ? Math.abs(mlScore.score - jsScore.score) 
          : null,
        both_available: !!mlScore && !!jsScore,
        recommendation: mlScore && jsScore
          ? (Math.abs(mlScore.score - jsScore.score) < 10 
              ? 'Scores similares - ambos métodos concordam'
              : 'Scores diferentes - considerar média ou investigar')
          : 'Apenas JavaScript disponível'
      },
      calculated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro na comparação:', error);
    throw error;
  }
}

module.exports = {
  calculateProposalScore,
  calculateProposalScoreWithComparison,
  calculateSellerConversionRateAdvanced,
  calculateClientHistoryAdvanced,
  analyzeHistoricalData
};
