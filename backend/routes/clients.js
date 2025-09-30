const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');

// GET /api/clients - Listar todos os clientes
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

    const { page = 1, limit = 10, search, uf, classificacao, isActive } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { razaoSocial: { $regex: search, $options: 'i' } },
        { nomeFantasia: { $regex: search, $options: 'i' } },
        { cnpj: { $regex: search, $options: 'i' } },
        { 'contato.nome': { $regex: search, $options: 'i' } },
        { 'contato.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (uf) {
      query['endereco.uf'] = uf;
    }
    
    if (classificacao) {
      query.classificacao = classificacao;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const clients = await Client.find(query)
      .populate('createdBy', 'name email')
      .sort({ razaoSocial: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: clients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/clients/:id - Buscar cliente específico
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente não encontrado' 
      });
    }

    res.json({ 
      success: true,
      data: client 
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const {
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao,
      observacoes
    } = req.body;

    // Validações básicas
    if (!cnpj || !razaoSocial || !contato?.nome || !contato?.email || !contato?.telefone) {
      return res.status(400).json({ 
        success: false,
        message: 'CNPJ, razão social e dados de contato são obrigatórios' 
      });
    }

    if (!endereco?.uf) {
      return res.status(400).json({ 
        success: false,
        message: 'UF é obrigatória' 
      });
    }

    const client = new Client({
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao: classificacao || 'OUTROS',
      observacoes,
      createdBy: '68c1afbcf906c14a8e7e8ff7' // ID temporário para desenvolvimento
    });

    await client.save();
    await client.populate('createdBy', 'name email');

    res.status(201).json({ 
      success: true,
      data: client 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'CNPJ já cadastrado' 
      });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const {
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao,
      isActive,
      observacoes
    } = req.body;

    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente não encontrado' 
      });
    }

    // Atualizar campos se fornecidos
    if (cnpj) client.cnpj = cnpj;
    if (razaoSocial) client.razaoSocial = razaoSocial;
    if (nomeFantasia !== undefined) client.nomeFantasia = nomeFantasia;
    if (contato) client.contato = contato;
    if (endereco) client.endereco = endereco;
    if (classificacao) client.classificacao = classificacao;
    if (isActive !== undefined) client.isActive = isActive;
    if (observacoes !== undefined) client.observacoes = observacoes;

    await client.save();
    await client.populate('createdBy', 'name email');

    res.json({ 
      success: true,
      data: client 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'CNPJ já cadastrado' 
      });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente não encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Cliente deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/clients/stats/summary - Estatísticas dos clientes
router.get('/stats/summary', async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ 
      isActive: true 
    });
    
    const clientsByClassification = await Client.aggregate([
      { $group: { _id: '$classificacao', count: { $sum: 1 } } }
    ]);
    
    const clientsByUF = await Client.aggregate([
      { $group: { _id: '$endereco.uf', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalClients,
        activeClients,
        inactiveClients: totalClients - activeClients,
        clientsByClassification,
        clientsByUF
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos clientes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
