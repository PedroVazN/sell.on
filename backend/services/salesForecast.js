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
    historicalSales.forEach(sale => {
      const date = new Date(sale.updatedAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          total: 0,
          sales: []
        };
      }
      dailySales[date].count++;
      dailySales[date].total += sale.total || 0;
      dailySales[date].sales.push(sale);
    });

    // 3. Calcular métricas históricas
    const dates = Object.keys(dailySales).sort();
    const dailyValues = dates.map(date => dailySales[date].total);
    const dailyCounts = dates.map(date => dailySales[date].count);

    // Média diária
    const avgDailyValue = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
    const avgDailyCount = dailyCounts.reduce((sum, val) => sum + val, 0) / dailyCounts.length;

    // Tendência (regressão linear simples)
    const trend = calculateTrend(dates.map((_, i) => i), dailyValues);

    // Variação (desvio padrão)
    const variance = calculateVariance(dailyValues, avgDailyValue);
    const stdDev = Math.sqrt(variance);

    // 4. Detectar sazonalidade semanal
    const weeklyPattern = detectWeeklyPattern(dailySales, dates);

    // 5. Calcular previsões
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const forecast7Days = calculatePeriodForecast(
      avgDailyValue,
      trend,
      stdDev,
      weeklyPattern,
      7,
      baseDate,
      dailyValues
    );

    const forecast30Days = calculatePeriodForecast(
      avgDailyValue,
      trend,
      stdDev,
      weeklyPattern,
      30,
      baseDate,
      dailyValues
    );

    const forecast90Days = calculatePeriodForecast(
      avgDailyValue,
      trend,
      stdDev,
      weeklyPattern,
      90,
      baseDate,
      dailyValues
    );

    // 6. Calcular confiança baseada em dados disponíveis e variância
    const confidence = calculateConfidence(historicalSales.length, stdDev, avgDailyValue);

    // 7. Identificar tendência
    const trendAnalysis = analyzeTrend(trend, dailyValues);

    // 8. Previsão por vendedor (se admin)
    let sellerForecasts = [];
    if (userRole === 'admin') {
      sellerForecasts = await calculateSellerForecasts(historicalSales, avgDailyValue, trend);
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
        totalRevenue: dailyValues.reduce((sum, val) => sum + val, 0),
        avgDailyRevenue: avgDailyValue,
        avgDailySales: avgDailyCount,
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

  return weeklyAverages.map(avg => ({
    day: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][weeklyAverages.indexOf(avg)],
    value: avg,
    multiplier: overallAvg > 0 ? avg / overallAvg : 1
  }));
}

/**
 * Calcula previsão para um período específico
 */
function calculatePeriodForecast(avgDaily, trend, stdDev, weeklyPattern, days, startDate, historicalValues) {
  let totalRevenue = 0;
  let totalSales = 0;

  // Usar últimas 7 médias diárias para suavizar
  const recentAverage = historicalValues.slice(-7).reduce((sum, val) => sum + val, 0) / Math.min(7, historicalValues.length);
  const currentTrend = trend.slope;

  const dailyForecasts = [];
  
  for (let i = 0; i < days; i++) {
    const forecastDate = new Date(startDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Base: média recente
    let dayForecast = recentAverage;
    
    // Aplicar tendência
    dayForecast += currentTrend * i;
    
    // Aplicar sazonalidade semanal
    const dayOfWeek = forecastDate.getDay();
    if (weeklyPattern[dayOfWeek]) {
      dayForecast *= weeklyPattern[dayOfWeek].multiplier;
    }
    
    // Suavizar variações extremas
    dayForecast = Math.max(0, dayForecast);

    dailyForecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      revenue: dayForecast,
      sales: Math.round(dayForecast / (recentAverage > 0 ? (recentAverage / Math.max(avgDaily / 10, 1)) : 1))
    });

    totalRevenue += dayForecast;
    totalSales += dailyForecasts[i].sales;
  }

  // Calcular intervalo de confiança (margem de erro)
  const marginOfError = stdDev * 1.96; // 95% de confiança
  const lowerBound = Math.max(0, totalRevenue - marginOfError * Math.sqrt(days));
  const upperBound = totalRevenue + marginOfError * Math.sqrt(days);

  return {
    sales: Math.round(totalSales),
    revenue: Math.round(totalRevenue),
    avgDailyRevenue: totalRevenue / days,
    avgDailySales: totalSales / days,
    lowerBound: Math.round(lowerBound),
    upperBound: Math.round(upperBound),
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
async function calculateSellerForecasts(historicalSales, avgDaily, trend) {
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

  // Calcular previsão para cada vendedor
  const forecasts = Object.values(sellerStats).map(seller => {
    const avgSaleValue = seller.totalRevenue / seller.count;
    const avgDailySeller = (seller.totalRevenue / 90) * (90 / seller.count); // Aproximação
    const share = seller.totalRevenue / historicalSales.reduce((sum, s) => sum + (s.total || 0), 0);

    // Previsão 30 dias baseada na participação histórica
    const forecast30Revenue = avgDaily * 30 * share;

    return {
      sellerId: seller.id,
      sellerName: seller.name,
      historical: {
        sales: seller.count,
        revenue: seller.totalRevenue,
        avgSaleValue: avgSaleValue,
        marketShare: share * 100
      },
      forecast: {
        next30Days: {
          sales: Math.round(forecast30Revenue / avgSaleValue),
          revenue: Math.round(forecast30Revenue)
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

  // Insight 3: Volume
  const avgDailyForMonth = forecast30.revenue / 30;
  if (avgDailyForMonth > forecast30.avgDailyRevenue * 1.2) {
    insights.push({
      type: 'info',
      priority: 'medium',
      title: '💡 Oportunidade de Aceleração',
      message: `Aumento de atividade pode levar a ${formatCurrency(forecast30.revenue * 1.2)} nos próximos 30 dias`,
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

