const Proposal = require('../models/Proposal');
const Client = require('../models/Client');

/**
 * Calcula o score preditivo de uma proposta (0-100%)
 * Baseado em múltiplos fatores históricos e características da proposta
 */
async function calculateProposalScore(proposal) {
  try {
    let totalScore = 0;
    let maxScore = 0;
    const factors = {};

    // ============================================
    // FATOR 1: Taxa de Conversão do Vendedor (20%)
    // ============================================
    const sellerFactor = await calculateSellerConversionRate(proposal);
    totalScore += sellerFactor.score * 0.20;
    maxScore += 20;
    factors.sellerConversion = {
      score: sellerFactor.score,
      rate: sellerFactor.rate,
      weight: 20,
      description: `Vendedor ${proposal.seller?.name || 'N/A'}: ${(sellerFactor.rate * 100).toFixed(1)}% de conversão`
    };

    // ============================================
    // FATOR 2: Histórico do Cliente (25%)
    // ============================================
    const clientFactor = await calculateClientHistory(proposal);
    totalScore += clientFactor.score * 0.25;
    maxScore += 25;
    factors.clientHistory = {
      score: clientFactor.score,
      previousProposals: clientFactor.previousProposals,
      previousWins: clientFactor.previousWins,
      previousRevenue: clientFactor.previousRevenue,
      weight: 25,
      description: `Cliente ${proposal.client?.name || 'N/A'}: ${clientFactor.previousWins} vitórias em ${clientFactor.previousProposals} propostas anteriores`
    };

    // ============================================
    // FATOR 3: Valor da Proposta (15%)
    // ============================================
    const valueFactor = calculateValueScore(proposal);
    totalScore += valueFactor.score * 0.15;
    maxScore += 15;
    factors.value = {
      score: valueFactor.score,
      value: proposal.total,
      weight: 15,
      description: `Valor: R$ ${proposal.total.toLocaleString('pt-BR')}`
    };

    // ============================================
    // FATOR 4: Tempo desde Criação (15%)
    // ============================================
    const timeFactor = calculateTimeScore(proposal);
    totalScore += timeFactor.score * 0.15;
    maxScore += 15;
    factors.time = {
      score: timeFactor.score,
      daysSinceCreation: timeFactor.daysSinceCreation,
      daysUntilExpiry: timeFactor.daysUntilExpiry,
      weight: 15,
      description: `${timeFactor.daysSinceCreation} dias desde criação, ${timeFactor.daysUntilExpiry} dias até expirar`
    };

    // ============================================
    // FATOR 5: Produtos na Proposta (10%)
    // ============================================
    const productFactor = await calculateProductScore(proposal);
    totalScore += productFactor.score * 0.10;
    maxScore += 10;
    factors.products = {
      score: productFactor.score,
      quantity: proposal.items?.length || 0,
      weight: 10,
      description: `${proposal.items?.length || 0} produtos na proposta`
    };

    // ============================================
    // FATOR 6: Condição de Pagamento (10%)
    // ============================================
    const paymentFactor = calculatePaymentConditionScore(proposal);
    totalScore += paymentFactor.score * 0.10;
    maxScore += 10;
    factors.paymentCondition = {
      score: paymentFactor.score,
      condition: proposal.paymentCondition,
      weight: 10,
      description: `Pagamento: ${proposal.paymentCondition}`
    };

    // ============================================
    // FATOR 7: Desconto Aplicado (5%)
    // ============================================
    const discountFactor = calculateDiscountScore(proposal);
    totalScore += discountFactor.score * 0.05;
    maxScore += 5;
    factors.discount = {
      score: discountFactor.score,
      discountAmount: discountFactor.discountAmount,
      discountPercentage: discountFactor.discountPercentage,
      weight: 5,
      description: discountFactor.discountPercentage > 0 
        ? `Desconto: ${discountFactor.discountPercentage.toFixed(1)}%`
        : 'Sem desconto'
    };

    // Normalizar score para 0-100
    const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 50;
    
    // Determinar nível
    let level = 'medio';
    let action = '';
    
    if (finalScore >= 75) {
      level = 'alto';
      action = 'Boa oportunidade! Priorize follow-up hoje';
    } else if (finalScore >= 50) {
      level = 'medio';
      action = 'Proposta em negociação. Manter contato frequente';
    } else if (finalScore >= 30) {
      level = 'baixo';
      action = 'Atenção: Proposta em risco. Considere oferecer incentivo';
    } else {
      level = 'muito_baixo';
      action = 'Alto risco de perda. Ação imediata necessária';
    }

    return {
      score: Math.round(finalScore * 10) / 10, // Arredondar para 1 decimal
      percentual: Math.round(finalScore),
      level,
      action,
      factors,
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao calcular score da proposta:', error);
    // Retornar score neutro em caso de erro
    return {
      score: 50,
      percentual: 50,
      level: 'medio',
      action: 'Não foi possível calcular o score. Score neutro atribuído.',
      factors: {},
      calculatedAt: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Calcula taxa de conversão do vendedor (0-100)
 */
async function calculateSellerConversionRate(proposal) {
  if (!proposal.seller?._id && !proposal.createdBy) {
    return { score: 50, rate: 0.5 }; // Score neutro
  }

  try {
    const sellerId = proposal.createdBy?._id || proposal.createdBy || proposal.seller._id;
    
    // Buscar todas as propostas do vendedor nos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sellerProposals = await Proposal.find({
      $or: [
        { 'createdBy._id': sellerId },
        { createdBy: sellerId },
        { 'seller._id': sellerId.toString() }
      ],
      createdAt: { $gte: sixMonthsAgo }
    });

    if (sellerProposals.length === 0) {
      return { score: 50, rate: 0.5 }; // Score neutro se não tem histórico
    }

    const totalProposals = sellerProposals.length;
    const closedProposals = sellerProposals.filter(p => p.status === 'venda_fechada').length;
    const lostProposals = sellerProposals.filter(p => p.status === 'venda_perdida').length;
    
    // Taxa de conversão: fechadas / (fechadas + perdidas)
    // Se não tiver perdidas, usa apenas fechadas / total
    const rate = (closedProposals + lostProposals) > 0
      ? closedProposals / (closedProposals + lostProposals)
      : closedProposals / totalProposals;

    // Normalizar para 0-100
    const score = rate * 100;

    return { score, rate };
  } catch (error) {
    console.error('Erro ao calcular taxa de conversão do vendedor:', error);
    return { score: 50, rate: 0.5 }; // Fallback neutro
  }
}

/**
 * Calcula score baseado no histórico do cliente (0-100)
 */
async function calculateClientHistory(proposal) {
  if (!proposal.client?.email && !proposal.client?.name) {
    return { score: 50, previousProposals: 0, previousWins: 0, previousRevenue: 0 };
  }

  try {
    // Buscar propostas do mesmo cliente (por email ou nome)
    const clientQuery = {};
    if (proposal.client.email) {
      clientQuery['client.email'] = proposal.client.email.toLowerCase();
    } else if (proposal.client.name) {
      clientQuery['client.name'] = proposal.client.name;
    }

    const clientProposals = await Proposal.find({
      ...clientQuery,
      _id: { $ne: proposal._id } // Excluir a proposta atual
    });

    if (clientProposals.length === 0) {
      // Cliente novo: score médio com pequeno bônus
      return { score: 55, previousProposals: 0, previousWins: 0, previousRevenue: 0 };
    }

    const previousWins = clientProposals.filter(p => p.status === 'venda_fechada').length;
    const previousRevenue = clientProposals
      .filter(p => p.status === 'venda_fechada')
      .reduce((sum, p) => sum + (p.total || 0), 0);

    // Score baseado em:
    // - Taxa de conversão do cliente (70% peso)
    // - Volume histórico (30% peso)
    const winRate = previousWins / clientProposals.length;
    const volumeScore = Math.min(100, (previousRevenue / 100000) * 50); // Até 50 pontos para volume alto
    
    const score = (winRate * 70) + (volumeScore > 0 ? Math.min(volumeScore, 30) : 0);

    return {
      score: Math.min(100, score),
      previousProposals: clientProposals.length,
      previousWins,
      previousRevenue
    };
  } catch (error) {
    console.error('Erro ao calcular histórico do cliente:', error);
    return { score: 50, previousProposals: 0, previousWins: 0, previousRevenue: 0 };
  }
}

/**
 * Calcula score baseado no valor da proposta (0-100)
 */
function calculateValueScore(proposal) {
  const value = proposal.total || 0;
  
  // Valores muito baixos ou muito altos podem ter score menor
  // Zona ideal: entre R$ 5.000 e R$ 50.000
  
  if (value === 0) {
    return { score: 30 };
  }
  
  if (value < 1000) {
    return { score: 40 }; // Valor muito baixo
  } else if (value >= 1000 && value < 5000) {
    return { score: 60 };
  } else if (value >= 5000 && value < 50000) {
    return { score: 85 }; // Zona ideal
  } else if (value >= 50000 && value < 200000) {
    return { score: 75 }; // Valores altos podem ser mais difíceis de fechar
  } else {
    return { score: 65 }; // Valores muito altos
  }
}

/**
 * Calcula score baseado no tempo desde criação e até expiração (0-100)
 */
function calculateTimeScore(proposal) {
  const now = new Date();
  const createdAt = new Date(proposal.createdAt);
  const validUntil = new Date(proposal.validUntil);
  
  const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const daysUntilExpiry = Math.floor((validUntil - now) / (1000 * 60 * 60 * 24));
  
  let score = 100;
  
  // Penalizar se criada há muito tempo
  if (daysSinceCreation > 30) {
    score -= 30; // Proposta muito antiga
  } else if (daysSinceCreation > 15) {
    score -= 15;
  } else if (daysSinceCreation > 7) {
    score -= 5;
  }
  
  // Penalizar se está próxima de expirar
  if (daysUntilExpiry < 0) {
    score -= 40; // Já expirada
  } else if (daysUntilExpiry < 3) {
    score -= 20; // Expira em breve
  } else if (daysUntilExpiry < 7) {
    score -= 10;
  }
  
  // Bonificar se criada recentemente e ainda tem tempo
  if (daysSinceCreation <= 3 && daysUntilExpiry > 14) {
    score += 10;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    daysSinceCreation,
    daysUntilExpiry
  };
}

/**
 * Calcula score baseado nos produtos (0-100)
 */
async function calculateProductScore(proposal) {
  const items = proposal.items || [];
  
  if (items.length === 0) {
    return { score: 30 };
  }
  
  // Propostas com múltiplos produtos tendem a fechar mais
  // Mas muito produtos pode indicar complexidade
  let score = 50;
  
  if (items.length === 1) {
    score = 60;
  } else if (items.length >= 2 && items.length <= 5) {
    score = 80; // Zona ideal
  } else if (items.length > 5 && items.length <= 10) {
    score = 70;
  } else {
    score = 50; // Muitos produtos
  }
  
  return { score };
}

/**
 * Calcula score baseado na condição de pagamento (0-100)
 */
function calculatePaymentConditionScore(proposal) {
  const condition = proposal.paymentCondition || '';
  
  // Pagamentos à vista têm maior probabilidade de fechar
  if (condition.toLowerCase().includes('à vista') || condition.toLowerCase().includes('vista')) {
    return { score: 90 };
  } else if (condition.startsWith('Crédito - 1x')) {
    return { score: 85 };
  } else if (condition.startsWith('Crédito') && parseInt(condition.match(/\d+/)?.[0] || 0) <= 3) {
    return { score: 75 }; // 2x ou 3x
  } else if (condition.startsWith('Crédito') && parseInt(condition.match(/\d+/)?.[0] || 0) <= 6) {
    return { score: 65 }; // 4x a 6x
  } else if (condition.startsWith('Boleto')) {
    return { score: 70 };
  } else {
    return { score: 60 }; // Desconhecido
  }
}

/**
 * Calcula score baseado no desconto (0-100)
 */
function calculateDiscountScore(proposal) {
  const total = proposal.total || 0;
  const subtotal = proposal.subtotal || total;
  const discountAmount = subtotal - total;
  const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  
  let score = 80; // Sem desconto é bom (cliente aceita preço)
  
  // Descontos pequenos (até 5%) são positivos
  if (discountPercentage > 0 && discountPercentage <= 5) {
    score = 85;
  } else if (discountPercentage > 5 && discountPercentage <= 10) {
    score = 75;
  } else if (discountPercentage > 10 && discountPercentage <= 20) {
    score = 60; // Desconto médio pode indicar necessidade de convencer
  } else if (discountPercentage > 20) {
    score = 40; // Desconto alto pode indicar dificuldade de fechar
  }
  
  return {
    score,
    discountAmount,
    discountPercentage
  };
}

module.exports = {
  calculateProposalScore,
  calculateSellerConversionRate,
  calculateClientHistory
};

