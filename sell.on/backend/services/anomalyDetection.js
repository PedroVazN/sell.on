const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Client = require('../models/Client');

/**
 * ============================================
 * SISTEMA DE DETECÇÃO DE ANOMALIAS COM IA
 * ============================================
 * 
 * Identifica padrões incomuns que podem indicar:
 * - Problemas (queda de performance, comportamento suspeito)
 * - Oportunidades (picos de demanda, produtos em alta)
 * - Riscos (cliente inativo, proposta parada)
 */

/**
 * Detecta todas as anomalias do sistema
 */
async function detectAnomalies(userId = null, userRole = 'user') {
  try {
    const anomalies = [];

    // 1. Anomalias de Vendedores (Performance)
    const sellerAnomalies = await detectSellerAnomalies(userId, userRole);
    anomalies.push(...sellerAnomalies);

    // 2. Anomalias de Clientes (Churn)
    const clientAnomalies = await detectClientAnomalies(userId, userRole);
    anomalies.push(...clientAnomalies);

    // 3. Anomalias de Produtos (Demanda)
    const productAnomalies = await detectProductAnomalies(userId, userRole);
    anomalies.push(...productAnomalies);

    // 4. Anomalias de Propostas (Padrões Estranhos)
    const proposalAnomalies = await detectProposalAnomalies(userId, userRole);
    anomalies.push(...proposalAnomalies);

    // 5. Anomalias de Valores (Transações)
    const valueAnomalies = await detectValueAnomalies(userId, userRole);
    anomalies.push(...valueAnomalies);

    // Ordenar por prioridade (crítica > alta > média > baixa)
    const priorityOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
    anomalies.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });

    return {
      total: anomalies.length,
      byPriority: {
        critica: anomalies.filter(a => a.priority === 'critica').length,
        alta: anomalies.filter(a => a.priority === 'alta').length,
        media: anomalies.filter(a => a.priority === 'media').length,
        baixa: anomalies.filter(a => a.priority === 'baixa').length
      },
      anomalies: anomalies.slice(0, 50) // Limitar a 50 para performance
    };
  } catch (error) {
    console.error('Erro ao detectar anomalias:', error);
    return {
      total: 0,
      byPriority: { critica: 0, alta: 0, media: 0, baixa: 0 },
      anomalies: []
    };
  }
}

/**
 * Detecta anomalias de performance de vendedores
 */
async function detectSellerAnomalies(userId, userRole) {
  const anomalies = [];
  
  try {
    // Buscar vendedores ativos
    const sellers = await User.find({ 
      role: 'vendedor',
      active: true 
    }).lean();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const seller of sellers) {
      // Filtrar por vendedor se não for admin
      if (userRole !== 'admin' && seller._id.toString() !== userId?.toString()) {
        continue;
      }

      // Buscar propostas dos últimos 60 dias
      const recentProposals = await Proposal.find({
        $or: [
          { 'createdBy': seller._id },
          { createdBy: seller._id },
          { 'seller._id': seller._id.toString() }
        ],
        createdAt: { $gte: sixtyDaysAgo }
      }).lean();

      if (recentProposals.length < 5) continue; // Precisa de dados mínimos

      // Separar últimos 30 dias vs 30 anteriores
      const last30Days = recentProposals.filter(p => 
        new Date(p.createdAt) >= thirtyDaysAgo
      );
      const previous30Days = recentProposals.filter(p => 
        new Date(p.createdAt) >= sixtyDaysAgo && 
        new Date(p.createdAt) < thirtyDaysAgo
      );

      // Calcular taxas de conversão
      const calcRate = (proposals) => {
        const decided = proposals.filter(p => 
          p.status === 'venda_fechada' || p.status === 'venda_perdida'
        );
        if (decided.length === 0) return 0;
        const closed = decided.filter(p => p.status === 'venda_fechada').length;
        return (closed / decided.length) * 100;
      };

      const recentRate = calcRate(last30Days);
      const previousRate = calcRate(previous30Days);
      const rateDrop = previousRate > 0 ? ((previousRate - recentRate) / previousRate) * 100 : 0;

      // ANOMALIA 1: Queda brusca de conversão (>30%)
      if (rateDrop > 30 && last30Days.length >= 3) {
        anomalies.push({
          type: 'seller_performance_drop',
          priority: rateDrop > 50 ? 'critica' : 'alta',
          title: `Queda de Performance - ${seller.name}`,
          message: `Taxa de conversão caiu ${rateDrop.toFixed(1)}% (${previousRate.toFixed(1)}% → ${recentRate.toFixed(1)}%)`,
          details: {
            seller: seller.name,
            sellerId: seller._id.toString(),
            previousRate,
            recentRate,
            drop: rateDrop,
            recentProposals: last30Days.length,
            previousProposals: previous30Days.length
          },
          suggestedActions: [
            'Agendar reunião 1-on-1',
            'Revisar técnicas de vendas',
            'Verificar sobrecarga de trabalho',
            'Analisar propostas recentes'
          ],
          detectedAt: new Date().toISOString(),
          icon: '📉'
        });
      }

      // ANOMALIA 2: Aumento súbito de conversão (oportunidade)
      if (rateDrop < -40 && last30Days.length >= 3) {
        anomalies.push({
          type: 'seller_performance_surge',
          priority: 'media',
          title: `Performance Excepcional - ${seller.name}`,
          message: `Taxa de conversão aumentou ${Math.abs(rateDrop).toFixed(1)}% (${previousRate.toFixed(1)}% → ${recentRate.toFixed(1)}%)`,
          details: {
            seller: seller.name,
            sellerId: seller._id.toString(),
            previousRate,
            recentRate,
            increase: Math.abs(rateDrop)
          },
          suggestedActions: [
            'Compartilhar técnicas de sucesso',
            'Reconhecer desempenho',
            'Aumentar metas',
            'Usar como exemplo para equipe'
          ],
          detectedAt: new Date().toISOString(),
          icon: '📈'
        });
      }

      // ANOMALIA 3: Nenhuma proposta nas últimas 2 semanas (atividade zero)
      const last14Days = recentProposals.filter(p => 
        new Date(p.createdAt) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );
      
      if (last14Days.length === 0 && recentProposals.length > 0) {
        anomalies.push({
          type: 'seller_inactivity',
          priority: 'alta',
          title: `Inatividade Detectada - ${seller.name}`,
          message: `Nenhuma proposta criada nas últimas 2 semanas`,
          details: {
            seller: seller.name,
            sellerId: seller._id.toString(),
            daysSinceLastProposal: Math.floor(
              (Date.now() - new Date(recentProposals[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )
          },
          suggestedActions: [
            'Verificar status do vendedor',
            'Entrar em contato',
            'Verificar problemas técnicos',
            'Revisar carga de trabalho'
          ],
          detectedAt: new Date().toISOString(),
          icon: '⏸️'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao detectar anomalias de vendedor:', error);
  }

  return anomalies;
}

/**
 * Detecta anomalias de clientes (risco de churn)
 */
async function detectClientAnomalies(userId, userRole) {
  const anomalies = [];

  try {
    // Buscar propostas fechadas para calcular frequência média
    const closedProposals = await Proposal.find({
      status: 'venda_fechada',
      createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
    }).lean();

    // Agrupar por cliente
    const clientStats = {};
    closedProposals.forEach(p => {
      const email = p.client?.email?.toLowerCase();
      if (!email) return;

      if (!clientStats[email]) {
        clientStats[email] = {
          name: p.client.name,
          proposals: [],
          totalValue: 0,
          lastPurchase: null
        };
      }

      clientStats[email].proposals.push(p);
      clientStats[email].totalValue += p.total || 0;
      
      const purchaseDate = new Date(p.updatedAt);
      if (!clientStats[email].lastPurchase || purchaseDate > clientStats[email].lastPurchase) {
        clientStats[email].lastPurchase = purchaseDate;
      }
    });

    // Calcular frequência média para clientes com múltiplas compras
    const clientsWithMultiplePurchases = Object.entries(clientStats).filter(
      ([, stats]) => stats.proposals.length >= 2
    );

    for (const [email, stats] of clientsWithMultiplePurchases) {
      // Calcular frequência média (dias entre compras)
      const purchases = stats.proposals
        .map(p => new Date(p.updatedAt))
        .sort((a, b) => a - b);

      let totalDaysBetween = 0;
      for (let i = 1; i < purchases.length; i++) {
        totalDaysBetween += (purchases[i] - purchases[i - 1]) / (1000 * 60 * 60 * 24);
      }
      const avgDaysBetween = totalDaysBetween / (purchases.length - 1);

      // Verificar se cliente está atrasado
      const daysSinceLastPurchase = Math.floor(
        (Date.now() - stats.lastPurchase.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Se está mais que 2x a frequência média, há risco
      if (daysSinceLastPurchase > avgDaysBetween * 2) {
        const riskScore = Math.min(100, (daysSinceLastPurchase / avgDaysBetween) * 50);
        
        anomalies.push({
          type: 'client_churn_risk',
          priority: riskScore > 70 ? 'critica' : riskScore > 50 ? 'alta' : 'media',
          title: `Risco de Churn - ${stats.name}`,
          message: `Cliente sem comprar há ${daysSinceLastPurchase} dias (média: ${Math.round(avgDaysBetween)} dias entre compras)`,
          details: {
            client: stats.name,
            clientEmail: email,
            daysSinceLastPurchase,
            avgDaysBetween: Math.round(avgDaysBetween),
            totalValue: stats.totalValue,
            purchases: stats.proposals.length,
            riskScore: Math.round(riskScore)
          },
          suggestedActions: [
            'Entrar em contato urgente',
            'Criar proposta personalizada',
            'Oferecer desconto especial',
            'Enviar pesquisa de satisfação',
            'Agendar reunião'
          ],
          detectedAt: new Date().toISOString(),
          icon: '🚨'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao detectar anomalias de cliente:', error);
  }

  return anomalies;
}

/**
 * Detecta anomalias de produtos (demanda)
 */
async function detectProductAnomalies(userId, userRole) {
  const anomalies = [];

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Buscar propostas com produtos
    const recentProposals = await Proposal.find({
      createdAt: { $gte: sixtyDaysAgo },
      status: { $in: ['venda_fechada', 'negociacao'] }
    }).lean();

    // Contar vendas por produto
    const productStats = {};
    
    recentProposals.forEach(proposal => {
      if (!proposal.items || !Array.isArray(proposal.items)) return;

      proposal.items.forEach(item => {
        const productName = item.product?.name || 'Desconhecido';
        const productId = item.product?._id || productName;

        if (!productStats[productId]) {
          productStats[productId] = {
            name: productName,
            last30Days: 0,
            previous30Days: 0,
            totalValue: 0
          };
        }

        const isLast30Days = new Date(proposal.createdAt) >= thirtyDaysAgo;
        if (isLast30Days) {
          productStats[productId].last30Days++;
        } else {
          productStats[productId].previous30Days++;
        }

        productStats[productId].totalValue += item.total || 0;
      });
    });

    // Verificar anomalias
    for (const [productId, stats] of Object.entries(productStats)) {
      // Pico de demanda (>200% aumento)
      if (stats.previous30Days > 0) {
        const increase = ((stats.last30Days - stats.previous30Days) / stats.previous30Days) * 100;
        
        if (increase > 200 && stats.last30Days >= 3) {
          anomalies.push({
            type: 'product_demand_surge',
            priority: 'alta',
            title: `Pico de Demanda - ${stats.name}`,
            message: `Vendas aumentaram ${increase.toFixed(0)}% (${stats.previous30Days} → ${stats.last30Days} propostas)`,
            details: {
              product: stats.name,
              productId,
              previousSales: stats.previous30Days,
              recentSales: stats.last30Days,
              increase: Math.round(increase),
              totalValue: stats.totalValue
            },
            suggestedActions: [
              'Verificar estoque disponível',
              'Criar campanha de marketing',
              'Aumentar visibilidade do produto',
              'Analisar sazonalidade'
            ],
            detectedAt: new Date().toISOString(),
            icon: '📈'
          });
        }
      }

      // Queda de demanda (>50% queda)
      if (stats.previous30Days >= 5 && stats.last30Days < stats.previous30Days * 0.5) {
        const drop = ((stats.previous30Days - stats.last30Days) / stats.previous30Days) * 100;
        
        anomalies.push({
          type: 'product_demand_drop',
          priority: 'media',
          title: `Queda de Demanda - ${stats.name}`,
          message: `Vendas diminuíram ${drop.toFixed(0)}% (${stats.previous30Days} → ${stats.last30Days} propostas)`,
          details: {
            product: stats.name,
            productId,
            previousSales: stats.previous30Days,
            recentSales: stats.last30Days,
            drop: Math.round(drop)
          },
          suggestedActions: [
            'Analisar concorrência',
            'Revisar preço',
            'Melhorar descrição/comunicação',
            'Criar promoção'
          ],
          detectedAt: new Date().toISOString(),
          icon: '📉'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao detectar anomalias de produto:', error);
  }

  return anomalies;
}

/**
 * Detecta anomalias em propostas (padrões estranhos)
 */
async function detectProposalAnomalies(userId, userRole) {
  const anomalies = [];

  try {
    // ANOMALIA: Propostas muito antigas em negociação (>90 dias)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldNegotiations = await Proposal.find({
      status: 'negociacao',
      createdAt: { $lt: ninetyDaysAgo }
    }).limit(10).lean();

    if (oldNegotiations.length > 0) {
      anomalies.push({
        type: 'stale_proposals',
        priority: 'alta',
        title: `${oldNegotiations.length} Propostas Antigas em Negociação`,
        message: `Propostas em negociação há mais de 90 dias precisam de atenção`,
        details: {
          count: oldNegotiations.length,
          oldest: Math.floor(
            (Date.now() - new Date(oldNegotiations[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ),
          proposals: oldNegotiations.slice(0, 5).map(p => ({
            id: p._id.toString(),
            number: p.proposalNumber,
            client: p.client?.name,
            value: p.total,
            days: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          }))
        },
        suggestedActions: [
          'Revisar todas as propostas antigas',
          'Contatar clientes',
          'Reavaliar condições',
          'Considerar encerrar ou atualizar'
        ],
        detectedAt: new Date().toISOString(),
        icon: '⏰'
      });
    }

    // ANOMALIA: Propostas criadas em horários estranhos (hora da madrugada)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const suspiciousProposals = await Proposal.find({
      createdAt: { $gte: last7Days }
    }).lean();

    const suspiciousCount = suspiciousProposals.filter(p => {
      const hour = new Date(p.createdAt).getHours();
      return hour >= 0 && hour <= 5; // Entre meia-noite e 5h da manhã
    }).length;

    if (suspiciousCount >= 3) {
      anomalies.push({
        type: 'suspicious_activity',
        priority: 'media',
        title: `Atividade Suspeita Detectada`,
        message: `${suspiciousCount} propostas criadas entre 0h e 5h da manhã nos últimos 7 dias`,
        details: {
          count: suspiciousCount,
          period: 'Últimos 7 dias',
          suggestion: 'Pode indicar testes, automação ou acesso indevido'
        },
        suggestedActions: [
          'Verificar logs de acesso',
          'Confirmar se são testes legítimos',
          'Verificar segurança do sistema'
        ],
        detectedAt: new Date().toISOString(),
        icon: '🔍'
      });
    }

    // ANOMALIA: Propostas com valores muito altos (outliers)
    const allProposals = await Proposal.find({
      status: 'venda_fechada',
      createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
    }).lean();

    if (allProposals.length > 10) {
      const values = allProposals.map(p => p.total || 0).sort((a, b) => a - b);
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const upperBound = q3 + (iqr * 3); // Outlier: > Q3 + 3*IQR

      const outliers = allProposals.filter(p => (p.total || 0) > upperBound);
      
      if (outliers.length > 0 && outliers.length <= 5) {
        anomalies.push({
          type: 'high_value_outliers',
          priority: 'baixa',
          title: `Propostas com Valores Excepcionais`,
          message: `${outliers.length} proposta(s) com valor muito acima da média (outliers)`,
          details: {
            count: outliers.length,
            threshold: upperBound,
            proposals: outliers.slice(0, 3).map(p => ({
              id: p._id.toString(),
              number: p.proposalNumber,
              client: p.client?.name,
              value: p.total
            }))
          },
          suggestedActions: [
            'Verificar se são vendas legítimas',
            'Documentar como casos de sucesso',
            'Analisar padrões de grandes vendas'
          ],
          detectedAt: new Date().toISOString(),
          icon: '💰'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao detectar anomalias de proposta:', error);
  }

  return anomalies;
}

/**
 * Detecta anomalias de valores (transações)
 */
async function detectValueAnomalies(userId, userRole) {
  const anomalies = [];

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Calcular receita média
    const recentSales = await Proposal.find({
      status: 'venda_fechada',
      createdAt: { $gte: sixtyDaysAgo }
    }).lean();

    const last30Days = recentSales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
    const previous30Days = recentSales.filter(s => 
      new Date(s.createdAt) >= sixtyDaysAgo && 
      new Date(s.createdAt) < thirtyDaysAgo
    );

    const recentRevenue = last30Days.reduce((sum, s) => sum + (s.total || 0), 0);
    const previousRevenue = previous30Days.reduce((sum, s) => sum + (s.total || 0), 0);

    if (previousRevenue > 0) {
      const revenueChange = ((recentRevenue - previousRevenue) / previousRevenue) * 100;

      // Queda significativa de receita (>25%)
      if (revenueChange < -25) {
        anomalies.push({
          type: 'revenue_drop',
          priority: 'critica',
          title: `Queda de Receita Detectada`,
          message: `Receita diminuiu ${Math.abs(revenueChange).toFixed(1)}% (R$ ${previousRevenue.toLocaleString('pt-BR')} → R$ ${recentRevenue.toLocaleString('pt-BR')})`,
          details: {
            previousRevenue,
            recentRevenue,
            change: revenueChange,
            previousSales: previous30Days.length,
            recentSales: last30Days.length
          },
          suggestedActions: [
            'Analisar causas da queda',
            'Identificar produtos/vendedores afetados',
            'Criar plano de recuperação',
            'Aumentar foco em vendas'
          ],
          detectedAt: new Date().toISOString(),
          icon: '📉'
        });
      }

      // Aumento significativo de receita (>40%)
      if (revenueChange > 40) {
        anomalies.push({
          type: 'revenue_surge',
          priority: 'baixa',
          title: `Crescimento Excepcional de Receita`,
          message: `Receita aumentou ${revenueChange.toFixed(1)}% (R$ ${previousRevenue.toLocaleString('pt-BR')} → R$ ${recentRevenue.toLocaleString('pt-BR')})`,
          details: {
            previousRevenue,
            recentRevenue,
            change: revenueChange
          },
          suggestedActions: [
            'Analisar fatores de sucesso',
            'Replicar estratégias vencedoras',
            'Aumentar metas',
            'Comemorar resultado!'
          ],
          detectedAt: new Date().toISOString(),
          icon: '📈'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao detectar anomalias de valor:', error);
  }

  return anomalies;
}

module.exports = {
  detectAnomalies,
  detectSellerAnomalies,
  detectClientAnomalies,
  detectProductAnomalies,
  detectProposalAnomalies,
  detectValueAnomalies
};

