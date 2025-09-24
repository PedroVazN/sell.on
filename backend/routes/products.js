const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/products
// @desc    Criar novo produto
// @access  Private (Admin/Vendedor)
router.post('/', [auth, authorize('admin', 'vendedor')], [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome do produto é obrigatório'),
  body('price').isNumeric().withMessage('Preço deve ser um número'),
  body('category').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('stock.current').optional().isNumeric().withMessage('Estoque atual deve ser um número')
], async (req, res) => {
  try {
    console.log('Dados recebidos para criar produto:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Adicionar createdBy baseado no usuário autenticado
    const productData = {
      ...req.body,
      createdBy: req.user ? {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email
      } : undefined
    };

    const product = new Product(productData);
    await product.save();

    console.log('Produto criado com sucesso:', product._id);
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: product
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/products
// @desc    Listar produtos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      inStock = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Filtros
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') {
      query['stock.current'] = { $gt: 0 };
    }

    // Ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Buscar produto por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Atualizar produto
// @access  Private (Admin/Vendedor)
router.put('/:id', [auth, authorize('admin', 'vendedor')], [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('stock.current').optional().isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro positivo')
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: product
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Deletar produto permanentemente
// @access  Private (Admin)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    console.log('Tentando deletar produto:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // DELETAR PERMANENTEMENTE do banco de dados
    await Product.findByIdAndDelete(req.params.id);

    console.log('Produto deletado permanentemente:', req.params.id);
    
    res.json({
      success: true,
      message: 'Produto deletado permanentemente'
    });

  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/products/categories/list
// @desc    Listar categorias
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Atualizar estoque
// @access  Private (Admin/Vendedor)
router.put('/:id/stock', [auth, authorize('admin', 'vendedor')], [
  body('current').isInt({ min: 0 }).withMessage('Estoque atual deve ser um número inteiro positivo'),
  body('min').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo'),
  body('max').optional().isInt({ min: 0 }).withMessage('Estoque máximo deve ser um número inteiro positivo')
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const { current, min, max } = req.body;
    
    product.stock.current = current;
    if (min !== undefined) product.stock.min = min;
    if (max !== undefined) product.stock.max = max;

    await product.save();

    res.json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      data: product
    });

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
