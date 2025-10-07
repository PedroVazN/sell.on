const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

// GET /api/proposals - Listar todas as propostas do usuário
router.get('/', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        },
        message: 'MongoDB não conectado - retornando lista vazia'
      });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      $or: [
        { 'createdBy._id': '68c1afbcf906c14a8e7e8ff7' },
        { createdBy: '68c1afbcf906c14a8e7e8ff7' }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { proposalNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } }
      ];
    }

    const proposals = await Proposal.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    res.json({
      success: true,
      data: proposals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/proposals/:id - Buscar proposta específica
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': '68c1afbcf906c14a8e7e8ff7' },
        { createdBy: '68c1afbcf906c14a8e7e8ff7' }
      ]
    }).populate('createdBy', 'name email');

    if (!proposal) {
      return res.status(404).json({ 
        success: false,
        message: 'Proposta não encontrada' 
      });
    }

    res.json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/proposals - Criar nova proposta
router.post('/', async (req, res) => {
  try {
    console.log('=== CRIANDO PROPOSTA ===');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);

    const {
      client,
      seller,
      distributor,
      items,
      subtotal,
      discount,
      total,
      paymentCondition,
      observations,
      status,
      validUntil
    } = req.body;

    // Validações básicas com logs detalhados
    console.log('🔍 Validando cliente:', { client, hasName: !!client?.name, hasEmail: !!client?.email });
    if (!client || !client.name || !client.email) {
      console.log('❌ Erro: Cliente inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Nome e email do cliente são obrigatórios' 
      });
    }

    console.log('🔍 Validando vendedor:', { seller, hasId: !!seller?._id, hasName: !!seller?.name });
    if (!seller || !seller._id || !seller.name) {
      console.log('❌ Erro: Vendedor inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Vendedor é obrigatório' 
      });
    }

    console.log('🔍 Validando distribuidor:', { distributor, hasId: !!distributor?._id });
    if (!distributor || !distributor._id) {
      console.log('❌ Erro: Distribuidor inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Distribuidor é obrigatório' 
      });
    }

    console.log('🔍 Validando itens:', { items, isArray: Array.isArray(items), length: items?.length });
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Erro: Itens inválidos');
      return res.status(400).json({ 
        success: false,
        error: 'Pelo menos um item é obrigatório' 
      });
    }

    console.log('🔍 Validando condição de pagamento:', { paymentCondition });
    if (!paymentCondition) {
      console.log('❌ Erro: Condição de pagamento inválida');
      return res.status(400).json({ 
        success: false,
        error: 'Condição de pagamento é obrigatória' 
      });
    }

    console.log('🔍 Validando data de validade:', { validUntil });
    if (!validUntil) {
      console.log('❌ Erro: Data de validade inválida');
      return res.status(400).json({ 
        success: false,
        error: 'Data de validade é obrigatória' 
      });
    }

    // Validar itens com logs detalhados
    console.log('🔍 Validando itens individuais...');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`🔍 Item ${i}:`, { 
        product: item.product, 
        hasProductId: !!item.product?._id, 
        hasProductName: !!item.product?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });
      
      if (!item.product || !item.product._id || !item.product.name) {
        console.log(`❌ Erro: Item ${i} sem produto válido`);
        return res.status(400).json({ 
          success: false,
          error: 'Todos os itens devem ter produto selecionado' 
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        console.log(`❌ Erro: Item ${i} com quantidade inválida`);
        return res.status(400).json({ 
          success: false,
          error: 'Quantidade deve ser maior que zero' 
        });
      }
      if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice < 0) {
        console.log(`❌ Erro: Item ${i} com preço inválido`);
        return res.status(400).json({ 
          success: false,
          error: 'Preço unitário deve ser maior ou igual a zero' 
        });
      }
    }

    const proposal = new Proposal({
      client,
      seller,
      distributor,
      items,
      subtotal: subtotal || 0,
      discount: discount || 0,
      total: total || 0,
      paymentCondition,
      observations: observations || '',
      status: status || 'negociacao',
      validUntil: new Date(validUntil),
      createdBy: '68c1afbcf906c14a8e7e8ff7' // ID temporário para desenvolvimento
    });

    console.log('Proposta criada:', proposal);

    await proposal.save();
    console.log('Proposta salva com sucesso:', proposal._id);
    
    await proposal.populate('createdBy', 'name email');
    console.log('Proposta populada:', proposal);

    res.status(201).json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Número da proposta já existe' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/proposals/:id - Atualizar proposta
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const proposal = await Proposal.findOne({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': '68c1afbcf906c14a8e7e8ff7' },
        { createdBy: '68c1afbcf906c14a8e7e8ff7' }
      ]
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Atualizar status se fornecido
    if (status) {
      proposal.status = status;
    }

    await proposal.save();
    await proposal.populate('createdBy', 'name email');

    res.json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/proposals/:id - Deletar proposta
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': '68c1afbcf906c14a8e7e8ff7' },
        { createdBy: '68c1afbcf906c14a8e7e8ff7' }
      ]
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json({ 
      success: true,
      message: 'Proposta deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar proposta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/stats/summary - Estatísticas das propostas
router.get('/stats/summary', async (req, res) => {
  try {
    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    console.log('🔍 Dashboard stats - User ID:', userId);
    
    const stats = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          negociacaoProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'negociacao'] }, 1, 0] }
          },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          vendaPerdidaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_perdida'] }, 1, 0] }
          },
          expiradaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expirada'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProposals: 0,
      negociacaoProposals: 0,
      vendaFechadaProposals: 0,
      vendaPerdidaProposals: 0,
      expiradaProposals: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Erro ao buscar estatísticas das propostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/proposals/dashboard/sales - Dados de vendas para o dashboard
router.get('/dashboard/sales', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          salesStats: {
            totalRevenue: 0,
            totalSales: 0,
            averageSale: 0,
            totalItems: 0
          },
          topProducts: [],
          monthlyData: []
        },
        message: 'MongoDB não conectado - retornando dados zerados'
      });
    }

    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    const userRole = req.user ? req.user.role : 'admin';
    console.log('🔍 Dashboard sales - User ID:', userId, 'Role:', userRole);
    
    // Definir filtro baseado no role do usuário
    let salesMatchFilter = { status: 'venda_fechada' };
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas vendas fechadas
      salesMatchFilter.$or = [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ];
      console.log('🔍 Filtro de vendas para vendedor:', salesMatchFilter);
    } else {
      console.log('🔍 Admin - buscando todas as vendas fechadas');
    }
    
    // Buscar vendas fechadas (receita total)
    const salesStats = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          averageSale: { $avg: '$total' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    // Buscar produtos mais vendidos
    const topProducts = await Proposal.aggregate([
      { $match: salesMatchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Buscar dados mensais para gráficos
    const monthlyData = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log('📊 Sales Stats encontradas:', salesStats);
    console.log('🏆 Top Products encontrados:', topProducts);
    console.log('📅 Monthly Data encontrada:', monthlyData);

    const result = {
      salesStats: salesStats[0] || {
        totalRevenue: 0,
        totalSales: 0,
        averageSale: 0,
        totalItems: 0
      },
      topProducts: topProducts.map(product => ({
        name: product._id,
        sales: product.sales,
        revenue: product.totalRevenue,
        quantity: product.totalQuantity
      })),
      monthlyData: monthlyData.map(data => ({
        month: data._id.month,
        year: data._id.year,
        revenue: data.totalRevenue,
        sales: data.totalSales
      }))
    };

    console.log('📈 Resultado final do dashboard sales:', result);

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar dados de vendas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/dashboard/stats - Estatísticas detalhadas para o dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          proposalStats: {
            totalProposals: 0,
            negociacaoProposals: 0,
            vendaFechadaProposals: 0,
            vendaPerdidaProposals: 0,
            expiradaProposals: 0
          },
          salesStats: {
            totalRevenue: 0,
            totalSales: 0,
            averageSale: 0
          }
        },
        message: 'MongoDB não conectado - retornando dados zerados'
      });
    }

    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    const userRole = req.user ? req.user.role : 'admin';
    console.log('🔍 Dashboard stats - User ID:', userId, 'Role:', userRole);
    console.log('🔍 req.user completo:', req.user);
    
    // Definir filtro baseado no role do usuário
    let matchFilter = {};
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas propostas
      matchFilter = {
        $or: [
          { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
          { createdBy: new mongoose.Types.ObjectId(userId) }
        ]
      };
      console.log('🔍 Filtro para vendedor:', matchFilter);
    } else {
      // Admin vê todas as propostas
      console.log('🔍 Admin - buscando todas as propostas');
    }
    
    // Primeiro, verificar se há propostas no banco
    const totalProposals = await Proposal.countDocuments();
    console.log('🔍 Total de propostas no banco:', totalProposals);
    
    // Verificar propostas do usuário específico
    if (userRole !== 'admin') {
      const userProposals = await Proposal.countDocuments({
        $or: [
          { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
          { createdBy: new mongoose.Types.ObjectId(userId) }
        ]
      });
      console.log('🔍 Propostas do usuário', userId, ':', userProposals);
    }
    
    // Buscar estatísticas de propostas
    const proposalStats = await Proposal.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          negociacaoProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'negociacao'] }, 1, 0] }
          },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          vendaPerdidaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_perdida'] }, 1, 0] }
          },
          expiradaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expirada'] }, 1, 0] }
          }
        }
      }
    ]);

    // Buscar estatísticas de vendas fechadas (receita e ticket médio)
    const salesMatchFilter = { status: 'venda_fechada' };
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas vendas fechadas
      salesMatchFilter.$or = [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ];
    }
    
    const salesStats = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          averageSale: { $avg: '$total' }
        }
      }
    ]);

    console.log('📊 Proposal Stats encontradas:', proposalStats);
    console.log('💰 Sales Stats encontradas:', salesStats);
    
    // Log detalhado dos dados encontrados
    if (proposalStats[0]) {
      console.log('📈 Propostas totais:', proposalStats[0].totalProposals);
      console.log('📈 Vendas fechadas:', proposalStats[0].vendaFechadaProposals);
      console.log('📈 Vendas perdidas:', proposalStats[0].vendaPerdidaProposals);
    }
    
    if (salesStats[0]) {
      console.log('💰 Receita total:', salesStats[0].totalRevenue);
      console.log('💰 Vendas totais:', salesStats[0].totalSales);
    }

    const result = {
      proposalStats: proposalStats[0] || {
        totalProposals: 0,
        negociacaoProposals: 0,
        vendaFechadaProposals: 0,
        vendaPerdidaProposals: 0,
        expiradaProposals: 0
      },
      salesStats: salesStats[0] || {
        totalRevenue: 0,
        totalSales: 0,
        averageSale: 0
      }
    };

    console.log('📈 Resultado final do dashboard:', result);

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/top-performers - Top performers das propostas
router.get('/top-performers', async (req, res) => {
  try {
    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    console.log('🔍 Dashboard stats - User ID:', userId);
    
    console.log('Buscando top performers para userId:', userId);
    
    // Primeiro, vamos ver quantas propostas existem
    const totalProposals = await Proposal.countDocuments({
      $or: [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ]
    });
    
    console.log('Total de propostas encontradas:', totalProposals);
    
    // Top Distribuidores
    const topDistributors = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: '$distributor._id',
          apelido: { $first: '$distributor.apelido' },
          razaoSocial: { $first: '$distributor.razaoSocial' },
          totalProposals: { $sum: 1 },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, '$total', 0] }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Top Produtos
    const topProducts = await Proposal.aggregate([
      { 
        $match: { 
          status: 'venda_fechada',
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          proposals: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Top Vendedores
    const topSellers = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: '$seller._id',
          name: { $first: '$seller.name' },
          email: { $first: '$seller.email' },
          totalProposals: { $sum: 1 },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, '$total', 0] }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    console.log('Top Distribuidores encontrados:', topDistributors.length);
    console.log('Top Produtos encontrados:', topProducts.length);
    console.log('Top Vendedores encontrados:', topSellers.length);

    const result = {
      topDistributors: topDistributors.length > 0 ? topDistributors : [
        { _id: '1', apelido: 'Nenhum distribuidor', razaoSocial: 'Sem dados', totalProposals: 0, vendaFechadaProposals: 0, totalRevenue: 0 }
      ],
      topProducts: topProducts.length > 0 ? topProducts : [
        { _id: '1', totalQuantity: 0, totalRevenue: 0, proposals: 0 }
      ],
      topSellers: topSellers.length > 0 ? topSellers : [
        { _id: '1', name: 'Nenhum vendedor', email: 'sem@dados.com', totalProposals: 0, vendaFechadaProposals: 0, totalRevenue: 0 }
      ]
    };

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar top performers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
