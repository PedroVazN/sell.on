const express = require('express');
const router = express.Router();
const Distributor = require('../models/DistributorNew');
const { auth } = require('../middleware/auth');

// GET /api/distributors - Listar todos os distribuidores
router.get('/', async (req, res) => {
  try {
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

    const { page = 1, limit = 10, search, origem, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Query mais flexível - buscar todos os distribuidores primeiro
    let query = {};
    
    // Se não há search, mostrar todos os distribuidores ativos
    if (!search) {
      query.isActive = true;
    } else {
      query.$and = [
        { isActive: true },
        { $or: [
          { apelido: { $regex: search, $options: 'i' } },
          { razaoSocial: { $regex: search, $options: 'i' } },
          { idDistribuidor: { $regex: search, $options: 'i' } },
          { 'contato.nome': { $regex: search, $options: 'i' } },
          { 'contato.telefone': { $regex: search, $options: 'i' } }
        ]}
      ];
    }
    
    if (origem) {
      query.origem = origem;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const distributors = await Distributor.find(query)
      .populate('createdBy', 'name email')
      .sort({ apelido: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Distributor.countDocuments(query);

    res.json({
      success: true,
      data: distributors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar distribuidores:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/distributors/:id - Buscar distribuidor específico
router.get('/:id', async (req, res) => {
  try {
    const distributor = await Distributor.findOne({
      _id: req.params.id,
      $or: [
        { 'createdBy._id': '68c1afbcf906c14a8e7e8ff7' },
        { createdBy: '68c1afbcf906c14a8e7e8ff7' }
      ]
    }).populate('createdBy', 'name email');

    if (!distributor) {
      return res.status(404).json({ error: 'Distribuidor não encontrado' });
    }

    res.json({ data: distributor });
  } catch (error) {
    console.error('Erro ao buscar distribuidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/distributors - Criar novo distribuidor
router.post('/', async (req, res) => {
  try {
    const {
      apelido,
      razaoSocial,
      idDistribuidor,
      contato,
      origem,
      atendimento,
      frete,
      pedidoMinimo,
      endereco,
      observacoes
    } = req.body;

    // Validações básicas
    if (!apelido || !razaoSocial || !idDistribuidor || !contato?.nome || !contato?.telefone || !origem || !pedidoMinimo?.valor) {
      return res.status(400).json({ 
        error: 'Apelido, razão social, ID do distribuidor, contato, origem e pedido mínimo são obrigatórios' 
      });
    }

    const distributor = new Distributor({
      apelido,
      razaoSocial,
      idDistribuidor,
      contato,
      origem,
      atendimento,
      frete,
      pedidoMinimo,
      endereco,
      observacoes,
      createdBy: '68c1afbcf906c14a8e7e8ff7' // ID temporário para desenvolvimento
    });

    await distributor.save();
    await distributor.populate('createdBy', 'name email');

    res.status(201).json({ data: distributor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Apelido ou ID do distribuidor já cadastrado' });
    }
    console.error('Erro ao criar distribuidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/distributors/:id - Atualizar distribuidor
router.put('/:id', async (req, res) => {
  try {
    const {
      apelido,
      razaoSocial,
      idDistribuidor,
      contato,
      origem,
      atendimento,
      frete,
      pedidoMinimo,
      endereco,
      isActive,
      observacoes
    } = req.body;

    const distributor = await Distributor.findOne({
      _id: req.params.id,
      createdBy: {
        _id: '68c1afbcf906c14a8e7e8ff7',
        name: 'Usuário Temporário',
        email: 'temp@example.com'
      }
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Distribuidor não encontrado' });
    }

    // Atualizar campos se fornecidos
    if (apelido) distributor.apelido = apelido;
    if (razaoSocial) distributor.razaoSocial = razaoSocial;
    if (idDistribuidor) distributor.idDistribuidor = idDistribuidor;
    if (contato) distributor.contato = contato;
    if (origem) distributor.origem = origem;
    if (atendimento) distributor.atendimento = atendimento;
    if (frete) distributor.frete = frete;
    if (pedidoMinimo) distributor.pedidoMinimo = pedidoMinimo;
    if (endereco) distributor.endereco = endereco;
    if (isActive !== undefined) distributor.isActive = isActive;
    if (observacoes !== undefined) distributor.observacoes = observacoes;

    await distributor.save();
    await distributor.populate('createdBy', 'name email');

    res.json({ data: distributor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Apelido ou ID do distribuidor já cadastrado' });
    }
    console.error('Erro ao atualizar distribuidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/distributors/:id - Deletar distribuidor
router.delete('/:id', async (req, res) => {
  try {
    const distributor = await Distributor.findOneAndDelete({
      _id: req.params.id,
      createdBy: {
        _id: '68c1afbcf906c14a8e7e8ff7',
        name: 'Usuário Temporário',
        email: 'temp@example.com'
      }
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Distribuidor não encontrado' });
    }

    res.json({ message: 'Distribuidor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar distribuidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
