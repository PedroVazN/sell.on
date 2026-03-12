const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const User = require('../models/User');
const Proposal = require('../models/Proposal');
const ClientAccessRequest = require('../models/ClientAccessRequest');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

function normalizeCnpj(cnpj) {
  if (!cnpj) return '';
  return String(cnpj).replace(/\D/g, '');
}

function buildProposalStatsMap(proposals) {
  const byCnpj = new Map();
  const byEmail = new Map();
  function getOrCreate(key, isCnpj) {
    const map = isCnpj ? byCnpj : byEmail;
    if (!map.has(key)) {
      map.set(key, {
        totalPropostas: 0,
        vendasFechadas: 0,
        vendasPerdidas: 0,
        valorTotalFechado: 0,
        produtos: new Map(),
        distribuidores: new Map(),
        propostas: []
      });
    }
    return map.get(key);
  }
  for (const p of proposals) {
    const cnpjNorm = normalizeCnpj(p.client?.cnpj);
    const email = (p.client?.email || '').toLowerCase().trim();
    const key = cnpjNorm || email || '__empty__';
    const isCnpjKey = !!cnpjNorm;
    const entry = getOrCreate(key, isCnpjKey);
    if (cnpjNorm && email && !byEmail.has(email)) byEmail.set(email, entry);
    const dist = p.distributor;
    if (dist && (dist._id || dist.apelido || dist.razaoSocial)) {
      const distId = dist._id || (dist.apelido || dist.razaoSocial || '');
      const name = dist.apelido || dist.razaoSocial || 'Distribuidor';
      if (!entry.distribuidores.has(distId)) {
        entry.distribuidores.set(distId, { _id: dist._id, apelido: dist.apelido, razaoSocial: dist.razaoSocial, count: 0 });
      }
      const d = entry.distribuidores.get(distId);
      d.count += 1;
    }
    const isWon = p.status === 'venda_fechada';
    const isLost = p.status === 'venda_perdida';
    const valor = isWon ? (p.total || 0) : 0;
    const items = isWon && Array.isArray(p.items) ? p.items : [];
    entry.totalPropostas += 1;
    if (isWon) {
      entry.vendasFechadas += 1;
      entry.valorTotalFechado += valor;
      entry.propostas.push({ _id: p._id, proposalNumber: p.proposalNumber, total: p.total, closedAt: p.closedAt });
      for (const it of items) {
        const name = it.product?.name || 'Produto';
        const prev = entry.produtos.get(name);
        const qty = (it.quantity || 0) + (prev ? prev.quantity : 0);
        const tot = (it.total || 0) + (prev ? prev.total : 0);
        entry.produtos.set(name, { name, quantity: qty, total: tot });
      }
    }
    if (isLost) entry.vendasPerdidas += 1;
  }
  return { byCnpj, byEmail };
}

// Dono do cliente: assignedTo ou createdBy
function getClientOwner(client) {
  const ownerId = (client.assignedTo && client.assignedTo._id ? client.assignedTo._id : client.assignedTo) || client.createdBy;
  return ownerId ? ownerId.toString() : null;
}

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

// GET /api/clients/access-requests - Listar solicitações de uso de cliente (onde eu sou o dono do cliente)
router.get('/access-requests', auth, async (req, res) => {
  try {
    const clientsOwnedByMe = await Client.find({
      $or: [
        { assignedTo: req.user.id },
        { assignedTo: { $in: [null, undefined] }, createdBy: req.user.id }
      ]
    }).select('_id');
    const clientIds = clientsOwnedByMe.map(c => c._id);

    const requests = await ClientAccessRequest.find({
      client: { $in: clientIds },
      status: 'pending'
    })
      .populate('client', 'razaoSocial nomeFantasia cnpj contato')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Erro ao listar solicitações de uso:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar solicitações' });
  }
});

// POST /api/clients/access-requests/:id/approve - Aprovar uso do cliente
router.post('/access-requests/:id/approve', auth, async (req, res) => {
  try {
    const request = await ClientAccessRequest.findById(req.params.id)
      .populate('client');
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada ou já respondida' });
    }
    const client = await Client.findById(request.client._id || request.client);
    const ownerId = getClientOwner(client);
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Apenas o dono da carteira pode aprovar' });
    }
    request.status = 'approved';
    request.respondedAt = new Date();
    request.respondedBy = req.user.id;
    await request.save();

    res.json({ success: true, data: request, message: 'Uso do cliente aprovado' });
  } catch (err) {
    console.error('Erro ao aprovar solicitação:', err);
    res.status(500).json({ success: false, message: 'Erro ao aprovar' });
  }
});

// POST /api/clients/access-requests/:id/reject - Rejeitar uso do cliente
router.post('/access-requests/:id/reject', auth, async (req, res) => {
  try {
    const request = await ClientAccessRequest.findById(req.params.id)
      .populate('client');
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada ou já respondida' });
    }
    const client = await Client.findById(request.client._id || request.client);
    const ownerId = getClientOwner(client);
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Apenas o dono da carteira pode rejeitar' });
    }
    request.status = 'rejected';
    request.respondedAt = new Date();
    request.respondedBy = req.user.id;
    if (req.body.message) request.message = req.body.message;
    await request.save();

    res.json({ success: true, data: request, message: 'Solicitação rejeitada' });
  } catch (err) {
    console.error('Erro ao rejeitar solicitação:', err);
    res.status(500).json({ success: false, message: 'Erro ao rejeitar' });
  }
});

// POST /api/clients/transfer - Transferir clientes da carteira para outro vendedor
router.post('/transfer', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const { clientIds, targetUserId } = req.body;
    if (!Array.isArray(clientIds) || clientIds.length === 0 || !targetUserId) {
      return res.status(400).json({ success: false, message: 'Envie clientIds (array) e targetUserId.' });
    }
    const target = await User.findById(targetUserId).select('name role').lean();
    if (!target) {
      return res.status(400).json({ success: false, message: 'Vendedor de destino não encontrado.' });
    }
    if (target.role !== 'vendedor' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Destino deve ser um vendedor.' });
    }
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Escolha outro vendedor (não você).' });
    }
    const query = { _id: { $in: clientIds } };
    if (req.user.role === 'vendedor') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedTo: { $in: [null, undefined] }, createdBy: req.user.id }
      ];
    }
    const result = await Client.updateMany(query, { $set: { assignedTo: targetUserId } });
    if (result.matchedCount === 0) {
      return res.status(403).json({ success: false, message: 'Nenhum cliente da sua carteira foi encontrado com os IDs informados.' });
    }
    console.log(`✅ ${result.modifiedCount} cliente(s) transferido(s) para ${target.name} por ${req.user.email}`);
    return res.json({
      success: true,
      message: `${result.modifiedCount} cliente(s) transferido(s) para ${target.name}.`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Erro ao transferir clientes:', err);
    res.status(500).json({ success: false, message: 'Erro ao transferir clientes.' });
  }
});

// GET /api/clients/carteiras/summary - Admin: lista vendedores com total de clientes na carteira de cada um
router.get('/carteiras/summary', auth, authorize('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [], message: 'MongoDB não conectado.' });
    }
    const vendedores = await User.find({ role: 'vendedor', isActive: true }).select('_id name email').sort({ name: 1 }).lean();
    const list = await Promise.all(
      vendedores.map(async (v) => {
        const totalClients = await Client.countDocuments({ assignedTo: v._id });
        return { _id: v._id, name: v.name, email: v.email, totalClients };
      })
    );
    const semCarteira = await Client.countDocuments({
      $or: [
        { assignedTo: { $in: [null, undefined] } },
        { assignedTo: { $exists: false } }
      ]
    });
    return res.json({
      success: true,
      data: list,
      semCarteira,
      message: 'Resumo das carteiras por vendedor.'
    });
  } catch (err) {
    console.error('Erro ao listar carteiras:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar carteiras.' });
  }
});

// GET /api/clients/consulta - Lista clientes com estatísticas (propostas, vendas, produtos mais comprados)
router.get('/consulta', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        pagination: { current: 1, pages: 0, total: 0, limit: 20 },
        message: 'MongoDB não conectado.'
      });
    }
    const { page = 1, limit = 20, search, uf, classificacao, orderBy = 'valorTotalFechado', order = 'desc' } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { razaoSocial: { $regex: search, $options: 'i' } },
        { nomeFantasia: { $regex: search, $options: 'i' } },
        { cnpj: { $regex: search, $options: 'i' } },
        { 'contato.nome': { $regex: search, $options: 'i' } },
        { 'contato.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (uf) query['endereco.uf'] = uf;
    if (classificacao) query.classificacao = classificacao;
    if (req.user.role === 'vendedor') {
      const sellerFilter = {
        $or: [
          { assignedTo: req.user.id },
          { assignedTo: { $in: [null, undefined] }, createdBy: req.user.id }
        ]
      };
      query = { $and: [sellerFilter, query] };
    }
    const proposals = await Proposal.find({})
      .select('client status total items proposalNumber closedAt distributor')
      .lean();
    const { byCnpj, byEmail } = buildProposalStatsMap(proposals);
    const maxClients = 5000;
    const allClients = await Client.find(query)
      .populate('assignedTo', 'name email')
      .sort({ razaoSocial: 1 })
      .limit(maxClients)
      .lean();
    let data = allClients.map((c) => {
      const cnpjNorm = normalizeCnpj(c.cnpj);
      const email = (c.contato?.email || '').toLowerCase().trim();
      const stats = byCnpj.get(cnpjNorm) || byEmail.get(email) || null;
      const topProdutos = stats && stats.produtos.size
        ? Array.from(stats.produtos.values())
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, 5)
            .map((p) => ({ name: p.name, quantity: p.quantity, total: p.total }))
        : [];
      const distribuidores = stats && stats.distribuidores && stats.distribuidores.size
        ? Array.from(stats.distribuidores.values())
            .sort((a, b) => (b.count || 0) - (a.count || 0))
            .slice(0, 5)
            .map((d) => ({ _id: d._id, apelido: d.apelido, razaoSocial: d.razaoSocial, propostas: d.count }))
        : [];
      return {
        client: c,
        totalPropostas: stats ? stats.totalPropostas : 0,
        vendasFechadas: stats ? stats.vendasFechadas : 0,
        vendasPerdidas: stats ? stats.vendasPerdidas : 0,
        valorTotalFechado: stats ? stats.valorTotalFechado : 0,
        topProdutos,
        distribuidores
      };
    });
    const sortField = String(orderBy || 'valorTotalFechado');
    const isAsc = String(order || 'desc').toLowerCase() === 'asc';
    const sortDir = isAsc ? -1 : 1;
    const nomeA = (c) => (c.client?.razaoSocial || c.client?.nomeFantasia || '').toLowerCase();
    if (sortField === 'totalPropostas') {
      data.sort((a, b) => (b.totalPropostas - a.totalPropostas) * sortDir || nomeA(a).localeCompare(nomeA(b)));
    } else if (sortField === 'vendasFechadas') {
      data.sort((a, b) => (b.vendasFechadas - a.vendasFechadas) * sortDir || nomeA(a).localeCompare(nomeA(b)));
    } else if (sortField === 'vendasPerdidas') {
      data.sort((a, b) => (b.vendasPerdidas - a.vendasPerdidas) * sortDir || nomeA(a).localeCompare(nomeA(b)));
    } else if (sortField === 'valorTotalFechado') {
      data.sort((a, b) => (b.valorTotalFechado - a.valorTotalFechado) * sortDir || nomeA(a).localeCompare(nomeA(b)));
    } else if (sortField === 'nome') {
      data.sort((a, b) => nomeA(a).localeCompare(nomeA(b)) * (isAsc ? 1 : -1));
    } else {
      data.sort((a, b) => (b.valorTotalFechado - a.valorTotalFechado) * sortDir || nomeA(a).localeCompare(nomeA(b)));
    }
    const total = data.length;
    data = data.slice(skip, skip + limitNum);
    res.json({
      success: true,
      data,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Erro na consulta de clientes:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar consulta de clientes.' });
  }
});

// GET /api/clients/consulta/:id - Detalhe de um cliente na consulta (estatísticas + últimas propostas + produtos)
router.get('/consulta/:id', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB não conectado.' });
    }
    const client = await Client.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .lean();
    if (!client) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    if (req.user.role === 'vendedor') {
      const ownerId = (client.assignedTo && (client.assignedTo._id || client.assignedTo))?.toString() || client.createdBy?.toString();
      if (ownerId !== req.user.id) return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }
    const proposals = await Proposal.find({})
      .select('client status total items proposalNumber closedAt createdAt seller distributor')
      .lean();
    const { byCnpj, byEmail } = buildProposalStatsMap(proposals);
    const cnpjNorm = normalizeCnpj(client.cnpj);
    const email = (client.contato?.email || '').toLowerCase().trim();
    const stats = byCnpj.get(cnpjNorm) || byEmail.get(email) || null;
    const topProdutos = stats && stats.produtos.size
      ? Array.from(stats.produtos.values()).sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).map((p) => ({ name: p.name, quantity: p.quantity, total: p.total }))
      : [];
    const distribuidores = stats && stats.distribuidores && stats.distribuidores.size
      ? Array.from(stats.distribuidores.values()).sort((a, b) => (b.count || 0) - (a.count || 0)).map((d) => ({ _id: d._id, apelido: d.apelido, razaoSocial: d.razaoSocial, propostas: d.count }))
      : [];
    const ultimasPropostas = (stats && stats.propostas.length)
      ? stats.propostas.sort((a, b) => new Date(b.closedAt || 0) - new Date(a.closedAt || 0)).slice(0, 15)
      : [];
    res.json({
      success: true,
      data: {
        client,
        totalPropostas: stats ? stats.totalPropostas : 0,
        vendasFechadas: stats ? stats.vendasFechadas : 0,
        vendasPerdidas: stats ? stats.vendasPerdidas : 0,
        valorTotalFechado: stats ? stats.valorTotalFechado : 0,
        topProdutos,
        distribuidores,
        ultimasPropostas
      }
    });
  } catch (err) {
    console.error('Erro no detalhe da consulta:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar detalhe.' });
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
