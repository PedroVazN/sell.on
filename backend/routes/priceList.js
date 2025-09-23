const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const Distributor = require('../models/DistributorNew');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// GET /api/price-list - Listar lista de preços agrupada por distribuidor
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, distributor, product, isActive } = req.query;
    const skip = (page - 1) * limit;

    let query = { createdBy: req.user.id };
    
    if (distributor) {
      query.distributor = distributor;
    }
    
    if (product) {
      query.product = product;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Buscar todos os itens da lista de preços
    console.log('Query para buscar itens:', query);
    const priceList = await PriceList.find(query)
      .populate('distributor', 'apelido razaoSocial contato.nome')
      .populate('product', 'name description price category')
      .populate('createdBy', 'name email')
      .sort({ 'distributor.apelido': 1, 'product.name': 1 });
    
    console.log('Itens encontrados no banco:', priceList.length);
    console.log('IDs dos itens encontrados:', priceList.map(item => item._id));

    // Agrupar por distribuidor
    const groupedData = priceList.reduce((acc, item) => {
      const distributorId = item.distributor._id.toString();
      
      if (!acc[distributorId]) {
        acc[distributorId] = {
          distributor: item.distributor,
          products: []
        };
      }
      
      acc[distributorId].products.push({
        _id: item._id,
        product: item.product,
        pricing: item.pricing,
        isActive: item.isActive,
        validFrom: item.validFrom,
        validUntil: item.validUntil,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
      
      return acc;
    }, {});

    // Converter para array e aplicar paginação
    const groupedArray = Object.values(groupedData);
    const total = groupedArray.length;
    const paginatedData = groupedArray.slice(skip, skip + parseInt(limit));

    console.log('Dados agrupados enviados para o frontend:', JSON.stringify(paginatedData, null, 2));

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar lista de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/price-list/:id - Buscar item específico da lista de preços
router.get('/:id', auth, async (req, res) => {
  try {
    const priceItem = await PriceList.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    })
    .populate('distributor', 'apelido razaoSocial contato.nome')
    .populate('product', 'name description price category')
    .populate('createdBy', 'name email');

    if (!priceItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ data: priceItem });
  } catch (error) {
    console.error('Erro ao buscar item da lista de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/price-list - Criar novo item na lista de preços
router.post('/', auth, async (req, res) => {
  try {
    const {
      distributor,
      product,
      pricing,
      validFrom,
      validUntil,
      notes
    } = req.body;

    // Validações básicas
    if (!distributor || !product || !pricing) {
      return res.status(400).json({ 
        error: 'Distribuidor, produto e preços são obrigatórios' 
      });
    }

    if (!pricing.aVista || !pricing.tresXBoleto || !pricing.tresXCartao) {
      return res.status(400).json({ 
        error: 'Todos os valores de preço são obrigatórios' 
      });
    }

    // Verificar se já existe um item para este distribuidor e produto
    const existingItem = await PriceList.findOne({
      distributor,
      product,
      createdBy: req.user.id
    });

    if (existingItem) {
      return res.status(400).json({ 
        error: 'Já existe um preço cadastrado para este distribuidor e produto' 
      });
    }

    const priceItem = new PriceList({
      distributor,
      product,
      pricing,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      notes,
      createdBy: req.user.id
    });

    await priceItem.save();
    await priceItem.populate('distributor', 'apelido razaoSocial contato.nome');
    await priceItem.populate('product', 'name description price category');
    await priceItem.populate('createdBy', 'name email');

    res.status(201).json({ data: priceItem });
  } catch (error) {
    console.error('Erro ao criar item da lista de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/price-list/:id - Atualizar item da lista de preços
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      pricing,
      isActive,
      validFrom,
      validUntil,
      notes
    } = req.body;

    const priceItem = await PriceList.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!priceItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Atualizar campos se fornecidos
    if (pricing) priceItem.pricing = pricing;
    if (isActive !== undefined) priceItem.isActive = isActive;
    if (validFrom) priceItem.validFrom = new Date(validFrom);
    if (validUntil) priceItem.validUntil = new Date(validUntil);
    if (notes !== undefined) priceItem.notes = notes;

    await priceItem.save();
    await priceItem.populate('distributor', 'apelido razaoSocial contato.nome');
    await priceItem.populate('product', 'name description price category');
    await priceItem.populate('createdBy', 'name email');

    res.json({ data: priceItem });
  } catch (error) {
    console.error('Erro ao atualizar item da lista de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/price-list/:id - Deletar item da lista de preços
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Tentando deletar item:', req.params.id, 'para usuário:', req.user.id);
    
    // Primeiro, verificar se o item existe
    const existingItem = await PriceList.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!existingItem) {
      console.log('Item não encontrado ou não pertence ao usuário');
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    console.log('Item encontrado, procedendo com a exclusão:', existingItem);
    
    const priceItem = await PriceList.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!priceItem) {
      console.log('Falha na exclusão - item não foi deletado');
      return res.status(500).json({ error: 'Falha ao deletar item' });
    }

    console.log('Item deletado com sucesso do banco de dados:', priceItem._id);
    
    // Verificar se o item foi realmente deletado
    const verifyDeletion = await PriceList.findOne({ _id: req.params.id });
    console.log('Verificação pós-exclusão - item ainda existe?', !!verifyDeletion);
    
    // Verificar quantos itens restam no banco para este usuário
    const remainingItems = await PriceList.countDocuments({ createdBy: req.user.id });
    console.log('Total de itens restantes para o usuário:', remainingItems);
    
    res.json({ 
      success: true,
      message: 'Item da lista de preços deletado com sucesso',
      deletedItem: priceItem._id,
      remainingItems: remainingItems
    });
  } catch (error) {
    console.error('Erro ao deletar item da lista de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/price-list/distributor/:distributorId - Listar preços por distribuidor
router.get('/distributor/:distributorId', auth, async (req, res) => {
  try {
    const { distributorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const priceList = await PriceList.find({
      distributor: distributorId,
      createdBy: req.user.id,
      isActive: true
    })
    .populate('product', 'name description price category')
    .sort({ 'product.name': 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await PriceList.countDocuments({
      distributor: distributorId,
      createdBy: req.user.id,
      isActive: true
    });

    res.json({
      data: priceList,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar preços por distribuidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
