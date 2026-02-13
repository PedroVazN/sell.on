const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

// GET /api/clients - Listar clientes (filtrado por vendedor se necessário)
router.get('/', auth, async (req, res) => {
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

    const { page = 1, limit = 10, search, uf, classificacao, isActive, carteira, assignedTo } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    const andConditions = [];
    
    // Carteira: vendedor vê só clientes da sua carteira (assignedTo = eu, ou sem assignedTo e createdBy = eu)
    // Admin pode filtrar por assignedTo=userId para ver carteira de um vendedor
    if (carteira === 'me' && req.user.role === 'vendedor') {
      andConditions.push({
        $or: [
          { assignedTo: req.user.id },
          { assignedTo: { $in: [null, undefined] }, createdBy: req.user.id }
        ]
      });
    } else if (assignedTo && req.user.role === 'admin') {
      query.assignedTo = assignedTo;
    }
    
    console.log(`👤 Usuário ${req.user.email} (${req.user.role}) buscando clientes`);
    
    if (search) {
      const searchCondition = {
        $or: [
          { razaoSocial: { $regex: search, $options: 'i' } },
          { nomeFantasia: { $regex: search, $options: 'i' } },
          { cnpj: { $regex: search, $options: 'i' } },
          { 'contato.nome': { $regex: search, $options: 'i' } },
          { 'contato.email': { $regex: search, $options: 'i' } }
        ]
      };
      if (andConditions.length) andConditions.push(searchCondition);
      else query.$or = searchCondition.$or;
    }
    if (andConditions.length) query.$and = andConditions;
    
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
      .populate('assignedTo', 'name email')
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
      },
      userRole: req.user.role,
      filteredBySeller: req.user.role === 'vendedor' ? true : false
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

// GET /api/clients/:id - Buscar cliente específico (filtrado por vendedor se necessário)
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // VENDEDOR: Pode ver TODOS os clientes para criar propostas
    // (mas só pode editar os que ele criou - ver rotas PUT/DELETE)
    
    const client = await Client.findOne(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

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

// POST /api/clients - Criar novo cliente (admin e vendedor)
// Vendedores podem criar clientes ao criar propostas, igual ao admin
router.post('/', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const {
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao,
      observacoes,
      assignedTo
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

    const clientData = {
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao: classificacao || 'OUTROS',
      observacoes,
      createdBy: req.user.id
    };
    if (assignedTo !== undefined) {
      if (req.user.role === 'admin') clientData.assignedTo = assignedTo || null;
      else if (req.user.role === 'vendedor' && assignedTo === req.user.id) clientData.assignedTo = req.user.id;
    }
    const client = new Client(clientData);

    await client.save();
    await client.populate('createdBy', 'name email').populate('assignedTo', 'name email');

    console.log(`✅ Cliente ${client.razaoSocial} criado por ${req.user.email} (${req.user.role})`);

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

// PUT /api/clients/:id - Atualizar cliente (admin ou vendedor da carteira)
router.put('/:id', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const {
      cnpj,
      razaoSocial,
      nomeFantasia,
      contato,
      endereco,
      classificacao,
      isActive,
      observacoes,
      assignedTo
    } = req.body;

    const client = await Client.findOne({ _id: req.params.id });

    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente não encontrado' 
      });
    }

    // Vendedor só pode editar clientes da sua carteira (assignedTo = eu ou sem assignedTo e createdBy = eu)
    if (req.user.role === 'vendedor') {
      const inCarteira = (client.assignedTo && client.assignedTo.toString() === req.user.id) ||
        (!client.assignedTo && client.createdBy.toString() === req.user.id);
      if (!inCarteira) {
        return res.status(403).json({ 
          success: false,
          message: 'Você não tem permissão para editar este cliente' 
        });
      }
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
    if (req.user.role === 'admin' && assignedTo !== undefined) client.assignedTo = assignedTo || null;

    await client.save();
    await client.populate('createdBy', 'name email').populate('assignedTo', 'name email');

    console.log(`✅ Cliente ${client.razaoSocial} atualizado por ${req.user.email}`);

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

// DELETE /api/clients/:id - Deletar cliente (somente admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // FILTRO POR VENDEDOR: Se for vendedor, só pode deletar clientes que ele criou
    if (req.user.role === 'vendedor') {
      query.createdBy = req.user.id;
    }
    
    const client = await Client.findOneAndDelete(query);

    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente não encontrado ou você não tem permissão para deletá-lo' 
      });
    }

    console.log(`🗑️ Cliente ${client.razaoSocial} deletado por ${req.user.email}`);

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

// GET /api/clients/stats/summary - Estatísticas dos clientes (filtrado por vendedor/carteira se necessário)
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { carteira } = req.query;
    let query = {};
    
    // Carteira: vendedor pedindo stats da "minha carteira" (assignedTo = eu ou sem assignedTo e createdBy = eu)
    if (carteira === 'me' && req.user.role === 'vendedor') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedTo: { $in: [null, undefined] }, createdBy: req.user.id }
      ];
    } else if (req.user.role === 'vendedor') {
      query.createdBy = req.user.id;
    }
    
    const totalClients = await Client.countDocuments(query);
    const activeClients = await Client.countDocuments({ 
      ...query,
      isActive: true 
    });
    
    const clientsByClassification = await Client.aggregate([
      { $match: query },
      { $group: { _id: '$classificacao', count: { $sum: 1 } } }
    ]);
    
    const clientsByUF = await Client.aggregate([
      { $match: query },
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
      },
      userRole: req.user.role,
      filteredBySeller: req.user.role === 'vendedor' ? true : false
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
