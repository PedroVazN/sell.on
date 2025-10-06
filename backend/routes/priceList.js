const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const Distributor = require('../models/DistributorNew');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// GET /api/price-list - Listar lista de preços agrupada por distribuidor
router.get('/', async (req, res) => {
  try {
    console.log('=== INÍCIO DA REQUISIÇÃO PRICE-LIST ===');
    console.log('Usuário autenticado:', req.user ? req.user.id : 'NENHUM');
    console.log('Query params:', req.query);
    
    // Verificar se o MongoDB está conectado
    const mongoose = require('mongoose');
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
    
    const { page = 1, limit = 10, distributor, product, isActive } = req.query;
    const skip = (page - 1) * limit;

    let query = {}; // Temporariamente sem filtro de createdBy
    console.log('Query inicial:', query);
    console.log('Usuário ID:', req.user.id);
    
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

    // Filtrar itens com referências válidas (distribuidor e produto existem)
    const validPriceList = priceList.filter(item => 
      item.distributor && item.distributor._id && 
      item.product && item.product._id
    );
    
    console.log('Itens válidos após filtro:', validPriceList.length);

    // Se houver itens órfãos, removê-los do banco
    if (validPriceList.length < priceList.length) {
      const orphanedItems = priceList.filter(item => 
        !item.distributor || !item.distributor._id || 
        !item.product || !item.product._id
      );
      
      console.log('Removendo itens órfãos:', orphanedItems.length);
      
      for (const orphan of orphanedItems) {
        try {
          await PriceList.findByIdAndDelete(orphan._id);
          console.log('Item órfão removido:', orphan._id);
        } catch (error) {
          console.error('Erro ao remover item órfão:', orphan._id, error);
        }
      }
    }

    // Agrupar por distribuidor
    const groupedData = validPriceList.reduce((acc, item) => {
      const distributorId = item.distributor._id.toString();
      
      if (!acc[distributorId]) {
        const groupId = `group_${distributorId}`;
        console.log('Criando grupo com ID:', groupId, 'para distribuidor:', distributorId);
        
        acc[distributorId] = {
          _id: groupId, // ID único para o grupo
          distributor: item.distributor,
          products: [],
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy
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
    console.log('Total de grupos:', total);
    console.log('Dados paginados:', paginatedData.length);
    
    // Debug: verificar IDs dos grupos
    paginatedData.forEach((group, index) => {
      console.log(`Grupo ${index}:`, {
        id: group._id,
        distributor: group.distributor?.apelido,
        productsCount: group.products?.length || 0
      });
    });

    const response = {
      success: true,
      data: paginatedData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };

    console.log('Resposta final:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('=== ERRO NA REQUISIÇÃO PRICE-LIST ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    console.log('=== CRIANDO NOVA LISTA DE PREÇOS ===');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    console.log('Usuário:', req.user.id);
    
    const {
      distributor,
      product,
      pricing,
      validFrom,
      validUntil,
      notes
    } = req.body;

    // Verificar se é uma lista completa (formato do frontend)
    if (req.body.distributorId && req.body.products) {
      console.log('Processando lista completa do frontend');
      
      const { distributorId, products } = req.body;
      
      if (!distributorId || !products || products.length === 0) {
        return res.status(400).json({ 
          error: 'Distribuidor e produtos são obrigatórios' 
        });
      }

      // Criar itens individuais para cada produto
      const createdItems = [];
      
      for (const productData of products) {
        // Verificar se já existe um item para este distribuidor e produto
        const existingItem = await PriceList.findOne({
          distributor: distributorId,
          product: productData.productId,
          createdBy: req.user.id
        });

        if (existingItem) {
          console.log('Item já existe, pulando:', productData.productId);
          continue;
        }

        const priceItem = new PriceList({
          distributor: distributorId,
          product: productData.productId,
          pricing: {
            aVista: productData.pricing?.aVista || 0,
            tresXBoleto: productData.pricing?.boleto || 0,
            tresXCartao: productData.pricing?.cartao || 0
          },
          isActive: productData.isActive !== false,
          validFrom: productData.validFrom ? new Date(productData.validFrom) : new Date(),
          validUntil: productData.validUntil ? new Date(productData.validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          notes: productData.notes || '',
          createdBy: req.user.id
        });

        await priceItem.save();
        await priceItem.populate('distributor', 'apelido razaoSocial contato.nome');
        await priceItem.populate('product', 'name description price category');
        await priceItem.populate('createdBy', 'name email');
        
        createdItems.push(priceItem);
      }

      console.log('Itens criados:', createdItems.length);
      res.status(201).json({ 
        success: true,
        data: createdItems,
        message: `${createdItems.length} itens criados com sucesso`
      });
      
    } else {
      // Formato individual (API original)
      console.log('Processando item individual');
      
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
    }
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
    
    // Verificar se é um ID de grupo (começa com "group_")
    if (req.params.id.startsWith('group_')) {
      const distributorId = req.params.id.replace('group_', '');
      console.log('Deletando grupo para distribuidor:', distributorId);
      
      // Deletar todos os itens deste distribuidor para este usuário
      const result = await PriceList.deleteMany({
        distributor: distributorId,
        createdBy: req.user.id
      });
      
      console.log('Itens deletados:', result.deletedCount);
      
      res.json({ 
        success: true,
        message: `Lista de preços do distribuidor deletada com sucesso (${result.deletedCount} itens)`,
        deletedItems: result.deletedCount
      });
    } else {
      // Deletar item individual
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
      
      res.json({ 
        success: true,
        message: 'Item da lista de preços deletado com sucesso',
        deletedItem: priceItem._id
      });
    }
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
