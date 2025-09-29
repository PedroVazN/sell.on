const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

// GET /api/proposals - Listar todas as propostas do usuário
router.get('/', auth, async (req, res) => {
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
        { 'createdBy._id': req.user.id },
        { createdBy: req.user.id }
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
router.get('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate('createdBy', 'name email');

    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json({ data: proposal });
  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/proposals - Criar nova proposta
router.post('/', auth, async (req, res) => {
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

    // Validações básicas
    if (!client || !client.name || !client.email) {
      return res.status(400).json({ 
        success: false,
        error: 'Nome e email do cliente são obrigatórios' 
      });
    }

    if (!seller || !seller._id || !seller.name) {
      return res.status(400).json({ 
        success: false,
        error: 'Vendedor é obrigatório' 
      });
    }

    if (!distributor || !distributor._id) {
      return res.status(400).json({ 
        success: false,
        error: 'Distribuidor é obrigatório' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Pelo menos um item é obrigatório' 
      });
    }

    if (!paymentCondition) {
      return res.status(400).json({ 
        success: false,
        error: 'Condição de pagamento é obrigatória' 
      });
    }

    if (!validUntil) {
      return res.status(400).json({ 
        success: false,
        error: 'Data de validade é obrigatória' 
      });
    }

    // Validar itens
    for (const item of items) {
      if (!item.product || !item.product._id || !item.product.name) {
        return res.status(400).json({ 
          success: false,
          error: 'Todos os itens devem ter produto selecionado' 
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Quantidade deve ser maior que zero' 
        });
      }
      if (!item.unitPrice || item.unitPrice < 0) {
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
      createdBy: req.user.id
    });

    console.log('Proposta criada:', proposal);

    await proposal.save();
    await proposal.populate('createdBy', 'name email');

    console.log('Proposta salva com sucesso:', proposal._id);

    res.status(201).json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/proposals/:id - Atualizar proposta
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const proposal = await Proposal.findOne({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': req.user.id },
        { createdBy: req.user.id }
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': req.user.id },
        { createdBy: req.user.id }
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
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
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
router.get('/dashboard/sales', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar vendas fechadas (receita total)
    const salesStats = await Proposal.aggregate([
      { 
        $match: { 
          status: 'venda_fechada',
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
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
          sales: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Buscar dados mensais para gráficos
    const monthlyData = await Proposal.aggregate([
      { 
        $match: { 
          status: 'venda_fechada',
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
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
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar estatísticas de todas as propostas
    const proposalStats = await Proposal.aggregate([
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

    // Buscar estatísticas de vendas fechadas (receita e ticket médio)
    const salesStats = await Proposal.aggregate([
      { 
        $match: { 
          status: 'venda_fechada',
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          averageSale: { $avg: '$total' }
        }
      }
    ]);

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
router.get('/top-performers', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
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
