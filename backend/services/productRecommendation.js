const Proposal = require('../models/Proposal');
const Product = require('../models/Product');

/**
 * ============================================
 * SISTEMA DE RECOMENDAÇÃO DE PRODUTOS COM IA
 * ============================================
 * 
 * Usa técnicas de Machine Learning para recomendar produtos:
 * - Collaborative Filtering (baseado em compras similares)
 * - Association Rules (produtos frequentemente comprados juntos)
 * - Análise de categorias e padrões
 * - Similaridade de clientes
 */

/**
 * Gera recomendações de produtos para uma proposta
 * @param {Object} proposal - Proposta atual ou dados do cliente
 * @param {Array} selectedProducts - Produtos já selecionados na proposta
 * @param {number} limit - Número máximo de recomendações
 */
async function getProductRecommendations(proposal, selectedProducts = [], limit = 5) {
  try {
    // 1. Buscar histórico de vendas fechadas
    const closedProposals = await Proposal.find({
      status: 'venda_fechada',
      createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Último ano
    })
      .select('items client total')
      .lean();

    if (closedProposals.length < 10) {
      return {
        recommendations: [],
        message: 'Dados insuficientes para gerar recomendações',
        method: 'insufficient_data'
      };
    }

    // Extrair IDs dos produtos selecionados (normalizar para string)
    const selectedProductIds = selectedProducts
      .map(p => {
        const id = p.product?._id || p._id || p;
        return id?.toString ? id.toString() : String(id);
      })
      .filter(id => id && id !== 'undefined' && id !== 'null');

    // 2. Análise de Associação (Association Rules) - Produtos frequentemente comprados juntos
    const associationRules = findAssociationRules(closedProposals, selectedProductIds);
    
    // 3. Collaborative Filtering - Baseado em clientes similares
    const collaborativeRecs = await findCollaborativeRecommendations(
      proposal, 
      closedProposals, 
      selectedProductIds
    );

    // 4. Análise de Categorias - Produtos da mesma categoria que vendem bem juntos
    const categoryRecs = await findCategoryRecommendations(selectedProducts, closedProposals);

    // 5. Produtos populares - Baseado em volume de vendas
    const popularRecs = findPopularProducts(closedProposals, selectedProductIds);

    // 6. Combinar e pontuar recomendações
    const combinedRecs = combineRecommendations(
      associationRules,
      collaborativeRecs,
      categoryRecs,
      popularRecs,
      limit
    );

    return {
      recommendations: combinedRecs,
      method: 'hybrid',
      confidence: calculateOverallConfidence(combinedRecs),
      insights: generateRecommendationInsights(combinedRecs, selectedProducts.length)
    };
  } catch (error) {
    console.error('Erro ao gerar recomendações de produtos:', error);
    return {
      recommendations: [],
      error: 'Erro ao gerar recomendações',
      details: error.message
    };
  }
}

/**
 * Encontra regras de associação (produtos comprados juntos)
 */
function findAssociationRules(closedProposals, selectedProductIds) {
  const productPairs = {}; // { 'prod1-prod2': { count, confidence, lift } }
  const productCounts = {}; // Contagem individual de cada produto

  // Contar co-ocorrências de produtos
  closedProposals.forEach(proposal => {
    if (!proposal.items || proposal.items.length < 2) return;

    const productIds = proposal.items
      .map(item => {
        const id = item.product?._id || item.product?._id;
        return id?.toString ? id.toString() : (id ? String(id) : null);
      })
      .filter(id => id && id !== 'undefined' && id !== 'null');

    // Contar produtos individuais
    productIds.forEach(id => {
      productCounts[id] = (productCounts[id] || 0) + 1;
    });

    // Contar pares de produtos (combinar todos com todos)
    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        const pair = [productIds[i], productIds[j]].sort().join('-');
        
        if (!productPairs[pair]) {
          productPairs[pair] = {
            product1: productIds[i],
            product2: productIds[j],
            count: 0,
            proposals: []
          };
        }
        productPairs[pair].count++;
        productPairs[pair].proposals.push(proposal._id);
      }
    }
  });

  const totalProposals = closedProposals.length;
  const recommendations = [];

  // Gerar recomendações baseadas nos produtos selecionados
  selectedProductIds.forEach(selectedId => {
    const selectedIdStr = selectedId?.toString();
    if (!selectedIdStr) return;

    Object.values(productPairs).forEach(pair => {
      const pair1Str = pair.product1?.toString();
      const pair2Str = pair.product2?.toString();
      
      if (pair1Str === selectedIdStr || pair2Str === selectedIdStr) {
        const recommendedId = pair1Str === selectedIdStr ? pair2Str : pair1Str;
        
        // Verificar se o produto recomendado não está nos selecionados
        const alreadySelected = selectedProductIds.some(id => id?.toString() === recommendedId);
        if (!alreadySelected && recommendedId) {
          // Calcular métricas de associação
          const support = pair.count / totalProposals; // Suporte: frequência do par
          const confidence = pair.count / (productCounts[selectedIdStr] || 1); // Confiança: dado que comprou X, comprou Y
          const lift = totalProposals > 0 && productCounts[recommendedId] 
            ? confidence / ((productCounts[recommendedId] || 1) / totalProposals) 
            : 1; // Lift: quanto mais provável é comprar Y dado X

          if (confidence > 0.1 && lift > 0) { // Pelo menos 10% de confiança e lift positivo
            recommendations.push({
              productId: recommendedId,
              method: 'association',
              confidence: Math.min(100, Math.round(confidence * 100)),
              support: Math.round(support * 100),
              lift: Math.round(lift * 100) / 100,
              reason: `${Math.round(confidence * 100)}% dos clientes que compraram este produto também compraram este`,
              score: confidence * lift * 100 // Score combinado
            });
          }
        }
      }
    });
  });

  return recommendations;
}

/**
 * Encontra recomendações usando Collaborative Filtering
 * (clientes similares também compraram)
 */
async function findCollaborativeRecommendations(proposal, closedProposals, selectedProductIds) {
  if (!proposal || !proposal.client) {
    return [];
  }

  const clientEmail = proposal.client.email?.toLowerCase();
  if (!clientEmail) return [];

  // Encontrar compras do cliente atual
  const clientHistory = closedProposals.filter(p => 
    p.client?.email?.toLowerCase() === clientEmail
  );

  if (clientHistory.length === 0) return [];

  // Produtos já comprados pelo cliente
  const clientPurchasedProducts = new Set();
  clientHistory.forEach(p => {
    p.items?.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?._id;
      if (productId) clientPurchasedProducts.add(productId.toString());
    });
  });

  // Encontrar clientes similares (compraram produtos similares)
  const similarClients = {};
  closedProposals.forEach(p => {
    if (p.client?.email?.toLowerCase() === clientEmail) return;

    let similarity = 0;
    p.items?.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?._id;
      if (productId && clientPurchasedProducts.has(productId.toString())) {
        similarity++;
      }
    });

    if (similarity > 0) {
      const similarEmail = p.client?.email?.toLowerCase();
      if (!similarClients[similarEmail]) {
        similarClients[similarEmail] = {
          similarity: 0,
          products: new Set()
        };
      }
      similarClients[similarEmail].similarity += similarity;
      p.items?.forEach(item => {
        const productId = item.product?._id?.toString() || item.product?._id;
        const productIdStr = productId?.toString();
        if (productIdStr && 
            !clientPurchasedProducts.has(productIdStr) && 
            !selectedProductIds.some(id => id?.toString() === productIdStr)) {
          similarClients[similarEmail].products.add(productIdStr);
        }
      });
    }
  });

  // Recomendar produtos que clientes similares compraram
  const recommendations = [];
  Object.values(similarClients).forEach(client => {
    client.products.forEach(productId => {
      const productIdStr = productId?.toString();
      if (!productIdStr) return;

      const existing = recommendations.find(r => r.productId?.toString() === productIdStr);
      if (existing) {
        existing.score += client.similarity;
        existing.similarClients = (existing.similarClients || 0) + 1;
      } else {
        recommendations.push({
          productId: productIdStr,
          method: 'collaborative',
          score: client.similarity,
          similarClients: 1,
          confidence: Math.min(100, client.similarity * 10),
          reason: `${client.similarity} cliente(s) com perfil similar também compraram este produto`
        });
      }
    });
  });

  return recommendations;
}

/**
 * Recomenda produtos da mesma categoria
 */
async function findCategoryRecommendations(selectedProducts, closedProposals) {
  if (!selectedProducts || selectedProducts.length === 0) return [];

  // Extrair categorias dos produtos selecionados
  const selectedCategories = new Set();
  selectedProducts.forEach(p => {
    const category = p.product?.category || p.category;
    if (category) selectedCategories.add(category);
  });

  if (selectedCategories.size === 0) return [];

  // Contar produtos por categoria em vendas fechadas
  const categoryProducts = {};
  closedProposals.forEach(proposal => {
    proposal.items?.forEach(item => {
      const category = item.product?.category;
      const productId = item.product?._id?.toString() || item.product?._id;
      
      if (category && selectedCategories.has(category) && productId) {
        if (!categoryProducts[productId]) {
          categoryProducts[productId] = {
            productId,
            category,
            count: 0,
            totalRevenue: 0
          };
        }
        categoryProducts[productId].count++;
        categoryProducts[productId].totalRevenue += item.total || 0;
      }
    });
  });

  // Converter para array de recomendações
  return Object.values(categoryProducts)
    .map(p => ({
      productId: p.productId,
      method: 'category',
      confidence: Math.min(100, Math.round((p.count / closedProposals.length) * 100)),
      count: p.count,
      totalRevenue: p.totalRevenue,
      reason: `Produto popular da mesma categoria (${p.count} vezes comprado)`,
      score: p.count * 2
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Encontra produtos populares (mais vendidos)
 */
function findPopularProducts(closedProposals, selectedProductIds) {
  const productStats = {};

  closedProposals.forEach(proposal => {
    proposal.items?.forEach(item => {
      const productIdRaw = item.product?._id || item.product?._id;
      const productId = productIdRaw?.toString ? productIdRaw.toString() : (productIdRaw ? String(productIdRaw) : null);
      
      if (!productId || 
          selectedProductIds.some(id => id?.toString() === productId || String(id) === productId)) {
        return;
      }

      if (!productStats[productId]) {
        productStats[productId] = {
          productId,
          count: 0,
          totalRevenue: 0,
          avgValue: 0
        };
      }
      productStats[productId].count++;
      productStats[productId].totalRevenue += item.total || 0;
    });
  });

  // Calcular média e gerar recomendações
  Object.values(productStats).forEach(stat => {
    stat.avgValue = stat.totalRevenue / stat.count;
  });

  const totalSales = closedProposals.length;
  
  return Object.values(productStats)
    .map(stat => ({
      productId: stat.productId,
      method: 'popular',
      confidence: Math.min(100, Math.round((stat.count / totalSales) * 100)),
      count: stat.count,
      totalRevenue: stat.totalRevenue,
      avgValue: stat.avgValue,
      reason: `Produto popular: comprado ${stat.count} vezes`,
      score: stat.count * 1.5
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 mais populares
}

/**
 * Combina todas as recomendações e pontua
 */
function combineRecommendations(associationRules, collaborative, category, popular, limit) {
  const combined = {};

  // Adicionar todas as recomendações em um mapa
  [...associationRules, ...collaborative, ...category, ...popular].forEach(rec => {
    const productId = rec.productId;
    if (!productId) return;

    if (!combined[productId]) {
      combined[productId] = {
        productId,
        methods: [],
        totalScore: 0,
        maxConfidence: 0,
        reasons: [],
        stats: {}
      };
    }

    combined[productId].methods.push(rec.method);
    combined[productId].totalScore += rec.score || rec.confidence || 0;
    combined[productId].maxConfidence = Math.max(combined[productId].maxConfidence, rec.confidence || 0);
    combined[productId].reasons.push(rec.reason);
    
    // Preservar estatísticas
    if (rec.count) combined[productId].stats.count = rec.count;
    if (rec.totalRevenue) combined[productId].stats.totalRevenue = rec.totalRevenue;
    if (rec.avgValue) combined[productId].stats.avgValue = rec.avgValue;
    if (rec.lift) combined[productId].stats.lift = rec.lift;
    if (rec.support) combined[productId].stats.support = rec.support;
  });

  // Converter para array e ordenar por score
  return Object.values(combined)
    .map(rec => ({
      productId: rec.productId,
      confidence: Math.min(100, Math.round(rec.maxConfidence)),
      score: rec.totalScore,
      methods: [...new Set(rec.methods)], // Métodos únicos
      reason: rec.reasons[0], // Melhor razão
      allReasons: rec.reasons,
      stats: rec.stats
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Calcula confiança geral das recomendações
 */
function calculateOverallConfidence(recommendations) {
  if (recommendations.length === 0) return 0;
  
  const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;
  const hasMultipleMethods = recommendations.filter(r => r.methods.length > 1).length;
  
  // Aumentar confiança se múltiplos métodos concordam
  const bonus = hasMultipleMethods * 5;
  return Math.min(100, Math.round(avgConfidence + bonus));
}

/**
 * Gera insights sobre as recomendações
 */
function generateRecommendationInsights(recommendations, selectedCount) {
  const insights = [];

  if (recommendations.length === 0) {
    insights.push({
      type: 'info',
      message: 'Adicione produtos para receber recomendações personalizadas'
    });
    return insights;
  }

  const topRec = recommendations[0];
  if (topRec.confidence > 70) {
    insights.push({
      type: 'success',
      message: `Produto altamente recomendado: ${topRec.reason}`,
      icon: '⭐'
    });
  }

  if (topRec.methods.length > 1) {
    insights.push({
      type: 'info',
      message: `Múltiplos algoritmos de IA concordam com esta recomendação`,
      icon: '🤖'
    });
  }

  if (selectedCount > 0) {
    insights.push({
      type: 'info',
      message: `Baseado em ${selectedCount} produto(s) selecionado(s) e histórico de vendas`,
      icon: '📊'
    });
  }

  return insights;
}

/**
 * Busca detalhes dos produtos recomendados
 */
async function enrichRecommendations(recommendations) {
  const productIds = recommendations
    .map(r => {
      const id = r.productId;
      // Tentar converter ObjectId para string se necessário
      try {
        if (id && typeof id === 'object' && id.toString) {
          return id.toString();
        }
        return String(id);
      } catch {
        return null;
      }
    })
    .filter(id => id && id !== 'undefined' && id !== 'null');
  
  if (productIds.length === 0) return recommendations;

  try {
    const mongoose = require('mongoose');
    // Converter strings para ObjectId se necessário
    const objectIds = productIds.map(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      } catch {
        return id;
      }
    });

    const products = await Product.find({
      $or: [
        { _id: { $in: objectIds } },
        { _id: { $in: productIds } }
      ]
    }).lean();

    const productMap = {};
    products.forEach(p => {
      const id = p._id?.toString ? p._id.toString() : String(p._id);
      productMap[id] = p;
    });

    return recommendations.map(rec => {
      const recId = rec.productId?.toString ? rec.productId.toString() : String(rec.productId);
      return {
        ...rec,
        product: productMap[recId]
      };
    }).filter(rec => rec.product); // Apenas produtos que existem
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return recommendations;
  }
}

/**
 * Gera recomendações genéricas (quando não há proposta/cliente específico)
 */
async function getGeneralRecommendations(limit = 10) {
  try {
    const closedProposals = await Proposal.find({
      status: 'venda_fechada',
      createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // Últimos 6 meses
    })
      .select('items total')
      .lean();

    if (closedProposals.length < 5) {
      return {
        recommendations: [],
        message: 'Dados insuficientes'
      };
    }

    const popular = findPopularProducts(closedProposals, []);
    const enriched = await enrichRecommendations(popular.slice(0, limit));

    return {
      recommendations: enriched,
      method: 'popular',
      confidence: 65
    };
  } catch (error) {
    console.error('Erro ao gerar recomendações gerais:', error);
    return {
      recommendations: [],
      error: error.message
    };
  }
}

module.exports = {
  getProductRecommendations,
  enrichRecommendations,
  getGeneralRecommendations
};

