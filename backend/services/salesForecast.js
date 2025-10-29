const Proposal = require('../models/Proposal');
const Goal = require('../models/Goal');
const User = require('../models/User');

/**
 * ============================================
 * SISTEMA DE PREVISÃO DE VENDAS COM IA
 * ============================================
 * 
 * Usa análise estatística avançada e padrões históricos para prever:
 * - Vendas futuras (7, 30, 90 dias)
 * - Tendências de crescimento/queda
 * - Sazonalidade
 * - Performance por vendedor
 * - Comparação com metas
 */

/**
 * Calcula previsão de vendas usando análise estatística
 */
async function calculateSalesForecast(userId = null, userRole = 'user', days = 30) {
  try {
    // 1. Buscar vendas históricas (últimos 90 dias para análise)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const historicalSales = await Proposal.find({
      status: 'venda_fechada',
      updatedAt: { $gte: ninetyDaysAgo }
    })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: 1 })
      .lean();

    if (historicalSales.length < 5) {
      return {
        error: 'Dados insuficientes',
        message: 'Necessário pelo menos 5 vendas fechadas para calcular previsão'
      };
    }

    // 2. Preparar dados temporais (agrupar por dia)
    const dailySales = {};
    let totalRevenue = 0;
    let totalSalesCount = 0;
    
    historicalSales.forEach(sale => {
      const saleValue = sale.total || 0;
      totalRevenue += saleValue;
      totalSalesCount++;
      
      const date = new Date(sale.updatedAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          total: 0,
          sales: []
        };
      }
      dailySales[date].count++;
      dailySales[date].total += saleValue;
      dailySales[date].sales.push(sale);
    });

    // 3. Calcular métricas históricas
    const dates = Object.keys(dailySales).sort();
    const dailyValues = dates.map(date => dailySales[date].total);
    const dailyCounts = dates.map(date => dailySales[date].count);

    // Média diária de receita (soma de todas as propostas fechadas no dia)
    const avgDailyRevenue = dailyValues.length > 0 
      ? dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length 
      : 0;
    
    // Média diária de número de vendas (propostas fechadas por dia)
    const avgDailyCount = dailyCounts.length > 0
      ? dailyCounts.reduce((sum, val) => sum + val, 0) / dailyCounts.length
      : 0;

    // Ticket médio REAL (valor médio por venda)
    const avgTicketValue = totalSalesCount > 0 
      ? totalRevenue / totalSalesCount 
      : 0;

    // Tendência (regressão linear simples) - baseada na receita diária
    const trend = calculateTrend(dates.map((_, i) => i), dailyValues);

    // Variação (desvio padrão) - baseado na receita diária
    const variance = calculateVariance(dailyValues, avgDailyRevenue);
    const stdDev = Math.sqrt(variance);

    // 4. Detectar sazonalidade semanal
    const weeklyPattern = detectWeeklyPattern(dailySales, dates);

    // 5. Calcular previsões (passar ticket médio também)
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const forecast7Days = calculatePeriodForecast(
      avgDailyRevenue,
      avgDailyCount,
      avgTicketValue,
      trend,
      stdDev,
      weeklyPattern,
      7,
      baseDate,
      dailyValues,
      dailyCounts
    );

    const forecast30Days = calculatePeriodForecast(
      avgDailyRevenue,
      avgDailyCount,
      avgTicketValue,
      trend,
      stdDev,
      weeklyPattern,
      30,
      baseDate,
      dailyValues,
      dailyCounts
    );

    const forecast90Days = calculatePeriodForecast(
      avgDailyRevenue,
      avgDailyCount,
      avgTicketValue,
      trend,
      stdDev,
      weeklyPattern,
      90,
      baseDate,
      dailyValues,
      dailyCounts
    );

    // 6. Calcular confiança baseada em dados disponíveis e variância
    const confidence = calculateConfidence(historicalSales.length, stdDev, avgDailyRevenue);

    // 7. Identificar tendência
    const trendAnalysis = analyzeTrend(trend, dailyValues);

    // 8. Previsão por vendedor (se admin)
    let sellerForecasts = [];
    if (userRole === 'admin') {
      sellerForecasts = await calculateSellerForecasts(historicalSales, avgDailyRevenue, avgTicketValue);
    }

    // 9. Comparar com metas ativas
    const activeGoals = await Goal.find({
      status: 'ativa',
      endDate: { $gte: baseDate }
    }).lean();

    const goalComparison = compareWithGoals(forecast30Days, forecast90Days, activeGoals);

    return {
      historical: {
        totalDays: dates.length,
        totalSales: historicalSales.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgDailyRevenue: Math.round(avgDailyRevenue * 100) / 100,
        avgDailySales: Math.round(avgDailyCount * 100) / 100,
        avgTicketValue: Math.round(avgTicketValue * 100) / 100,
        period: {
          start: dates[0],
          end: dates[dates.length - 1]
        }
      },
      forecast: {
        next7Days: forecast7Days,
        next30Days: forecast30Days,
        next90Days: forecast90Days
      },
      trends: trendAnalysis,
      seasonality: {
        weeklyPattern,
        detected: weeklyPattern.length > 0
      },
      confidence,
      sellerForecasts: sellerForecasts.slice(0, 10), // Top 10
      goalComparison,
      insights: generateForecastInsights(forecast30Days, forecast90Days, trendAnalysis, goalComparison)
    };
  } catch (error) {
    console.error('Erro ao calcular previsão de vendas:', error);
    return {
      error: 'Erro ao calcular previsão',
      details: error.message
    };
  }
}

/**
 * Calcula tendência usando regressão linear simples
 */
function calculateTrend(xValues, yValues) {
  const n = xValues.length;
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calcula variância
 */
function calculateVariance(values, mean) {
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Detecta padrão semanal de sazonalidade
 */
function detectWeeklyPattern(dailySales, dates) {
  const dayOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Domingo = 0
  const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];

  dates.forEach(date => {
    const d = new Date(date);
    const dayIndex = d.getDay();
    if (dailySales[date]) {
      weeklyTotals[dayIndex] += dailySales[date].total;
      weeklyCounts[dayIndex]++;
    }
  });

  // Calcular médias por dia da semana
  const weeklyAverages = weeklyTotals.map((total, index) => {
    const count = weeklyCounts[index];
    return count > 0 ? total / count : 0;
  });

  // Normalizar (usar média geral como referência)
  const overallAvg = weeklyAverages.reduce((sum, val) => sum + val, 0) / 7;

  return weeklyAverages.map((avg, index) => {
    // Calcular multiplicador normalizado (limitando entre 0.7 e 1.3)
    let multiplier = overallAvg > 0 ? avg / overallAvg : 1;
    multiplier = Math.min(1.3, Math.max(0.7, multiplier)); // Limitar variação
    
    return {
      day: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][index],
      value: Math.round(avg * 100) / 100,
      multiplier: Math.round(multiplier * 100) / 100 // 2 casas decimais
    };
  });
}

/**
 * Calcula previsão para um período específico
 * 
 * @param {number} avgDailyRevenue - Média de receita diária histórica
 * @param {number} avgDailyCount - Média de número de vendas por dia
 * @param {number} avgTicketValue - Ticket médio (valor médio por venda)
 * @param {Object} trend - Objeto com slope e intercept da tendência
 * @param {number} stdDev - Desvio padrão
 * @param {Array} weeklyPattern - Padrão semanal
 * @param {number} days - Número de dias a prever
 * @param {Date} startDate - Data inicial
 * @param {Array} historicalValues - Valores históricos de receita diária
 * @param {Array} historicalCounts - Contagens históricas de vendas por dia
 */
function calculatePeriodForecast(
  avgDailyRevenue, 
  avgDailyCount, 
  avgTicketValue,
  trend, 
  stdDev, 
  weeklyPattern, 
  days, 
  startDate, 
  historicalValues,
  historicalCounts
) {
  let totalRevenue = 0;
  let totalSales = 0;

  // Usar média móvel dos últimos 14 dias para maior estabilidade
  const recentValues = historicalValues.slice(-14);
  const recentCounts = historicalCounts.slice(-14);
  
  const recentAverageRevenue = recentValues.length > 0 
    ? recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length 
    : avgDailyRevenue;
  
  const recentAverageCount = recentCounts.length > 0
    ? recentCounts.reduce((sum, val) => sum + val, 0) / recentCounts.length
    : avgDailyCount;

  // Suavizar o slope da tendência para evitar crescimento exponencial
  // A tendência será aplicada como uma porcentagem pequena da média
  const trendPercentPerDay = recentAverageRevenue > 0 
    ? (trend.slope / recentAverageRevenue) * 100 
    : 0;
  // Limitar a máximo 2% de crescimento/dia e mínimo -2%
  const limitedTrendPercent = Math.min(2, Math.max(-2, trendPercentPerDay)) / 100;

  const dailyForecasts = [];
  
  for (let i = 0; i < days; i++) {
    const forecastDate = new Date(startDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Base: média recente de receita diária
    let dayRevenueForecast = recentAverageRevenue;
    
    // Aplicar tendência suavizada (percentual limitado por dia)
    dayRevenueForecast *= (1 + (limitedTrendPercent * i)); // Crescimento percentual acumulado
    
    // Aplicar sazonalidade semanal (limitando o impacto entre 70% e 130%)
    const dayOfWeek = forecastDate.getDay();
    if (weeklyPattern[dayOfWeek] && weeklyPattern[dayOfWeek].multiplier) {
      const normalizedMultiplier = Math.min(1.3, Math.max(0.7, weeklyPattern[dayOfWeek].multiplier));
      dayRevenueForecast *= normalizedMultiplier;
    }
    
    // Garantir valores positivos
    dayRevenueForecast = Math.max(0, dayRevenueForecast);
    
    // Limitar variação extrema (máximo 2x e mínimo 0.5x a média recente)
    dayRevenueForecast = Math.min(dayRevenueForecast, recentAverageRevenue * 2);
    dayRevenueForecast = Math.max(dayRevenueForecast, recentAverageRevenue * 0.5);

    // Calcular número de vendas: usar o mesmo padrão da receita
    let daySalesForecast = recentAverageCount;
    daySalesForecast *= (1 + (limitedTrendPercent * i)); // Mesma tendência
    if (weeklyPattern[dayOfWeek] && weeklyPattern[dayOfWeek].multiplier) {
      const normalizedMultiplier = Math.min(1.3, Math.max(0.7, weeklyPattern[dayOfWeek].multiplier));
      daySalesForecast *= normalizedMultiplier;
    }
    daySalesForecast = Math.max(0, Math.round(daySalesForecast));
    daySalesForecast = Math.min(daySalesForecast, recentAverageCount * 2);

    dailyForecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      revenue: Math.round(dayRevenueForecast * 100) / 100,
      sales: daySalesForecast
    });

    totalRevenue += dayRevenueForecast;
    totalSales += daySalesForecast;
  }

  // Calcular intervalo de confiança (margem de erro) - mais conservador
  const coefficientOfVariation = stdDev / Math.max(avgDailyRevenue, 1);
  const marginFactor = Math.min(0.25, coefficientOfVariation); // Limitar margem a 25%
  const marginOfError = recentAverageRevenue * marginFactor * Math.sqrt(days);
  
  const lowerBound = Math.max(0, totalRevenue - marginOfError);
  const upperBound = totalRevenue + marginOfError;

  return {
    sales: Math.round(totalSales),
    revenue: Math.round(totalRevenue * 100) / 100,
    avgDailyRevenue: Math.round((totalRevenue / days) * 100) / 100,
    avgDailySales: Math.round((totalSales / days) * 100) / 100,
    lowerBound: Math.round(lowerBound * 100) / 100,
    upperBound: Math.round(upperBound * 100) / 100,
    dailyBreakdown: dailyForecasts
  };
}

/**
 * Calcula nível de confiança da previsão
 */
function calculateConfidence(dataPoints, stdDev, avgValue) {
  let confidence = 70; // Base

  // Mais dados = maior confiança
  if (dataPoints > 30) confidence += 10;
  if (dataPoints > 60) confidence += 10;

  // Menor variância = maior confiança
  const coefficientOfVariation = avgValue > 0 ? stdDev / avgValue : 1;
  if (coefficientOfVariation < 0.3) confidence += 10;
  if (coefficientOfVariation > 0.7) confidence -= 10;

  return Math.min(95, Math.max(50, confidence));
}

/**
 * Analisa tendência de crescimento/queda
 */
function analyzeTrend(trend, historicalValues) {
  const isGrowth = trend.slope > 0;
  const growthRate = trend.slope > 0 
    ? (trend.slope / (historicalValues.reduce((sum, v) => sum + v, 0) / historicalValues.length)) * 100
    : 0;

  // Comparar últimos 30 dias vs 30 anteriores
  const recent30 = historicalValues.slice(-30);
  const previous30 = historicalValues.slice(-60, -30);

  const recentAvg = recent30.length > 0 ? recent30.reduce((sum, v) => sum + v, 0) / recent30.length : 0;
  const previousAvg = previous30.length > 0 ? previous30.reduce((sum, v) => sum + v, 0) / previous30.length : 0;

  const periodGrowth = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    direction: isGrowth ? 'crescimento' : 'queda',
    rate: Math.abs(growthRate),
    periodComparison: periodGrowth,
    strength: Math.abs(periodGrowth) > 15 ? 'forte' : Math.abs(periodGrowth) > 5 ? 'moderada' : 'fraca',
    description: periodGrowth > 0 
      ? `Crescimento de ${periodGrowth.toFixed(1)}% nos últimos 30 dias`
      : periodGrowth < 0
      ? `Queda de ${Math.abs(periodGrowth).toFixed(1)}% nos últimos 30 dias`
      : 'Estabilidade mantida'
  };
}

/**
 * Calcula previsões por vendedor
 */
async function calculateSellerForecasts(historicalSales, avgDailyRevenue, avgTicketValue) {
  const sellerStats = {};

  // Agrupar por vendedor
  historicalSales.forEach(sale => {
    const sellerId = sale.createdBy?._id || sale.createdBy || 'unknown';
    const sellerName = sale.createdBy?.name || 'Desconhecido';

    if (!sellerStats[sellerId]) {
      sellerStats[sellerId] = {
        id: sellerId,
        name: sellerName,
        sales: [],
        totalRevenue: 0,
        count: 0
      };
    }

    sellerStats[sellerId].sales.push(sale);
    sellerStats[sellerId].totalRevenue += sale.total || 0;
    sellerStats[sellerId].count++;
  });

  // Calcular total de receita para obter market share
  const totalRevenue = historicalSales.reduce((sum, s) => sum + (s.total || 0), 0);

  // Calcular previsão para cada vendedor
  const forecasts = Object.values(sellerStats).map(seller => {
    const avgSaleValue = seller.count > 0 ? seller.totalRevenue / seller.count : 0;
    const share = totalRevenue > 0 ? seller.totalRevenue / totalRevenue : 0;

    // Previsão 30 dias baseada na participação histórica (market share)
    // Usar avgDailyRevenue já calculado
    const forecast30Revenue = avgDailyRevenue * 30 * share;
    const forecastSales = avgTicketValue > 0 ? Math.round(forecast30Revenue / avgTicketValue) : 0;

    return {
      sellerId: seller.id,
      sellerName: seller.name,
      historical: {
        sales: seller.count,
        revenue: Math.round(seller.totalRevenue * 100) / 100,
        avgSaleValue: Math.round(avgSaleValue * 100) / 100,
        marketShare: Math.round(share * 100 * 100) / 100 // 2 casas decimais para porcentagem
      },
      forecast: {
        next30Days: {
          sales: forecastSales,
          revenue: Math.round(forecast30Revenue * 100) / 100
        }
      }
    };
  });

  // Ordenar por previsão de receita
  return forecasts.sort((a, b) => b.forecast.next30Days.revenue - a.forecast.next30Days.revenue);
}

/**
 * Compara previsões com metas ativas
 */
function compareWithGoals(forecast30, forecast90, goals) {
  if (goals.length === 0) {
    return {
      hasGoals: false,
      message: 'Nenhuma meta ativa encontrada'
    };
  }

  // Calcular meta total dos próximos 30 dias
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  let totalGoal = 0;
  let relevantGoals = [];

  goals.forEach(goal => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);

    // Se a meta cobrir os próximos 30 dias
    if (endDate >= now && startDate <= thirtyDaysFromNow) {
      const daysInPeriod = Math.min(
        Math.ceil((Math.min(endDate, thirtyDaysFromNow) - Math.max(startDate, now)) / (1000 * 60 * 60 * 24)),
        30
      );
      const dailyGoal = goal.targetValue / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      totalGoal += dailyGoal * daysInPeriod;
      relevantGoals.push({
        ...goal,
        dailyGoal,
        daysInPeriod
      });
    }
  });

  const forecastRevenue = forecast30.revenue;
  const difference = forecastRevenue - totalGoal;
  const percentageDiff = totalGoal > 0 ? (difference / totalGoal) * 100 : 0;

  return {
    hasGoals: true,
    goal: Math.round(totalGoal),
    forecast: forecastRevenue,
    difference: Math.round(difference),
    percentageDiff: Math.round(percentageDiff),
    status: difference > 0 ? 'acima' : difference === 0 ? 'igual' : 'abaixo',
    goals: relevantGoals,
    achievementProbability: calculateAchievementProbability(forecastRevenue, totalGoal, forecast30.lowerBound, forecast30.upperBound)
  };
}

/**
 * Calcula probabilidade de atingir meta
 */
function calculateAchievementProbability(forecast, goal, lowerBound, upperBound) {
  if (forecast >= goal) {
    // Previsão já está acima, calcular margem
    const margin = ((forecast - goal) / goal) * 100;
    if (margin > 20) return 95;
    if (margin > 10) return 85;
    return 75;
  } else {
    // Previsão abaixo, verificar se está dentro do intervalo de confiança
    if (upperBound >= goal) {
      const gap = goal - forecast;
      const range = upperBound - lowerBound;
      if (range > 0) {
        return 50 + (1 - (gap / range)) * 30; // Entre 50-80%
      }
    }
    return Math.max(10, 30 - ((goal - forecast) / goal) * 30);
  }
}

/**
 * Gera insights automáticos baseados na previsão
 */
function generateForecastInsights(forecast30, forecast90, trends, goalComparison) {
  const insights = [];

  // Insight 1: Tendência
  if (trends.periodComparison > 10) {
    insights.push({
      type: 'success',
      priority: 'high',
      title: '📈 Crescimento Detectado',
      message: `Tendência de crescimento de ${trends.periodComparison.toFixed(1)}% detectada nos últimos 30 dias`,
      icon: '📈'
    });
  } else if (trends.periodComparison < -10) {
    insights.push({
      type: 'warning',
      priority: 'high',
      title: '⚠️ Queda Detectada',
      message: `Queda de ${Math.abs(trends.periodComparison).toFixed(1)}% detectada - Ação necessária`,
      icon: '⚠️'
    });
  }

  // Insight 2: Meta
  if (goalComparison.hasGoals) {
    if (goalComparison.status === 'acima') {
      insights.push({
        type: 'success',
        priority: 'high',
        title: '🎯 Meta Superada na Previsão',
        message: `Previsão indica ${goalComparison.percentageDiff.toFixed(1)}% acima da meta (${goalComparison.achievementProbability}% de probabilidade)`,
        icon: '🎯'
      });
    } else if (goalComparison.status === 'abaixo') {
      insights.push({
        type: 'warning',
        priority: 'urgent',
        title: '🚨 Risco de Não Atingir Meta',
        message: `Previsão está ${Math.abs(goalComparison.percentageDiff).toFixed(1)}% abaixo da meta - Ações necessárias`,
        icon: '🚨'
      });
    }
  }

  // Insight 3: Volume (valores mais conservadores)
  const avgDailyForMonth = forecast30.revenue / 30;
  if (avgDailyForMonth > forecast30.avgDailyRevenue * 1.2) {
    const potentialRevenue = Math.round(forecast30.revenue * 1.15 * 100) / 100; // Limitar a 15% em vez de 20%
    insights.push({
      type: 'info',
      priority: 'medium',
      title: '💡 Oportunidade de Aceleração',
      message: `Aumento de atividade pode levar a ${formatCurrency(potentialRevenue)} nos próximos 30 dias`,
      icon: '💡'
    });
  }

  return insights;
}

/**
 * Formata valor monetário (helper)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

module.exports = {
  calculateSalesForecast
};

