const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sales
// @desc    Criar nova venda
// @access  Private (Admin/Vendedor)
router.post('/', [auth, authorize('admin', 'vendedor')], [
  body('customer').isMongoId().withMessage('ID do cliente inválido'),
  body('items').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
  body('items.*.product').isMongoId().withMessage('ID do produto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser pelo menos 1'),
  body('items.*.unitPrice').isNumeric().isFloat({ min: 0 }).withMessage('Preço unitário deve ser um número positivo'),
  body('paymentMethod').isIn(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'cheque']).withMessage('Método de pagamento inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { customer, items, paymentMethod, notes, deliveryDate, deliveryAddress } = req.body;

    // Verificar se todos os produtos existem e têm estoque suficiente
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Produto ${item.product} não encontrado ou inativo`
        });
      }

      if (product.stock.current < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock.current}`
        });
      }
    }

    // Criar venda
    const sale = new Sale({
      customer,
      seller: req.user._id,
      items,
      paymentMethod,
      notes,
      deliveryDate,
      deliveryAddress,
      status: 'finalizada'
    });

    await sale.save();

    // Atualizar estoque dos produtos
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'stock.current': -item.quantity } }
      );
    }

    // Popular dados do cliente e produtos
    await sale.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'seller', select: 'name email' },
      { path: 'items.product', select: 'name sku price' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: sale
    });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/sales
// @desc    Listar vendas
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus,
      customer,
      seller,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filtros
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customer) query.customer = customer;
    if (seller) query.seller = seller;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Se não for admin, só pode ver suas próprias vendas
    if (req.user.role !== 'admin') {
      query.$or = [
        { seller: req.user._id },
        { customer: req.user._id }
      ];
    }

    // Ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sales = await Sale.find(query)
      .populate('customer', 'name email phone')
      .populate('seller', 'name email')
      .populate('items.product', 'name sku price')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Buscar venda por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('seller', 'name email phone')
      .populate('items.product', 'name sku price description images');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar se o usuário pode ver esta venda
    if (req.user.role !== 'admin' && 
        sale.seller._id.toString() !== req.user._id.toString() && 
        sale.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: sale
    });

  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/sales/:id/status
// @desc    Atualizar status da venda
// @access  Private (Admin/Vendedor)
router.put('/:id/status', [auth, authorize('admin', 'vendedor')], [
  body('status').isIn(['rascunho', 'finalizada', 'cancelada', 'devolvida']).withMessage('Status inválido'),
  body('paymentStatus').optional().isIn(['pendente', 'pago', 'parcial', 'cancelado']).withMessage('Status de pagamento inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    const { status, paymentStatus } = req.body;

    if (status) sale.status = status;
    if (paymentStatus) sale.paymentStatus = paymentStatus;

    await sale.save();

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: sale
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/sales/stats/summary
// @desc    Estatísticas de vendas
// @access  Private (Admin/Vendedor)
router.get('/stats/summary', [auth, authorize('admin', 'vendedor')], async (req, res) => {
  try {
    const { startDate, endDate, seller } = req.query;
    
    const matchQuery = { status: 'finalizada' };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    if (seller) matchQuery.seller = seller;
    if (req.user.role !== 'admin') matchQuery.seller = req.user._id;

    const stats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageSale: { $avg: '$total' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    const result = stats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      averageSale: 0,
      totalItems: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/sales/stats/detailed
// @desc    Estatísticas detalhadas de vendas
// @access  Private (Admin/Vendedor)
router.get('/stats/detailed', [auth, authorize('admin', 'vendedor')], async (req, res) => {
  try {
    const { startDate, endDate, seller } = req.query;
    
    const matchQuery = {};
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    if (seller) matchQuery.seller = seller;
    if (req.user.role !== 'admin') matchQuery.seller = req.user._id;

    // Estatísticas gerais
    const generalStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          finalizadaSales: {
            $sum: { $cond: [{ $eq: ['$status', 'finalizada'] }, 1, 0] }
          },
          canceladaSales: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelada'] }, 1, 0] }
          },
          devolvidaSales: {
            $sum: { $cond: [{ $eq: ['$status', 'devolvida'] }, 1, 0] }
          },
          rascunhoSales: {
            $sum: { $cond: [{ $eq: ['$status', 'rascunho'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$total' },
          averageSale: { $avg: '$total' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    // Estatísticas por status de pagamento
    const paymentStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    // Estatísticas por método de pagamento
    const methodStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    // Vendas por mês (últimos 12 meses)
    const monthlyStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Top vendedores
    const topSellers = await Sale.aggregate([
      { $match: { ...matchQuery, status: 'finalizada' } },
      {
        $group: {
          _id: '$seller',
          sales: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      {
        $project: {
          seller: { $arrayElemAt: ['$sellerInfo', 0] },
          sales: 1,
          revenue: 1
        }
      }
    ]);

    const result = {
      general: generalStats[0] || {
        totalSales: 0,
        finalizadaSales: 0,
        canceladaSales: 0,
        devolvidaSales: 0,
        rascunhoSales: 0,
        totalRevenue: 0,
        averageSale: 0,
        totalItems: 0
      },
      paymentStatus: paymentStats,
      paymentMethod: methodStats,
      monthly: monthlyStats,
      topSellers: topSellers
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
