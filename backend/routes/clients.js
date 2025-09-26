const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');

// GET /api/clients - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clients/:id - Buscar cliente específico
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ data: client });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', auth, async (req, res) => {
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
        error: 'CNPJ, razão social e dados de contato são obrigatórios' 
      });
    }

    if (!endereco?.uf) {
      return res.status(400).json({ 
        error: 'UF é obrigatória' 
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
      createdBy: req.user.id
    });

    await client.save();
    await client.populate('createdBy', 'name email');

    res.status(201).json({ data: client });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', auth, async (req, res) => {
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

    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
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

    res.json({ data: client });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clients/stats/summary - Estatísticas dos clientes
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({ createdBy: req.user.id });
    const activeClients = await Client.countDocuments({ 
      createdBy: req.user.id, 
      isActive: true 
    });
    
    const clientsByClassification = await Client.aggregate([
      { $match: { createdBy: req.user.id } },
      { $group: { _id: '$classificacao', count: { $sum: 1 } } }
    ]);
    
    const clientsByUF = await Client.aggregate([
      { $match: { createdBy: req.user.id } },
      { $group: { _id: '$endereco.uf', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
