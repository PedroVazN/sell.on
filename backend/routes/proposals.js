const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

// GET /api/proposals - Listar todas as propostas do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { 'createdBy._id': req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } }
      ];
    }

    const proposals = await Proposal.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    res.json({
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/proposals/:id - Buscar proposta específica
router.get('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      'createdBy._id': req.user.id
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
    const {
      productCode,
      productName,
      pricing,
      client,
      notes
    } = req.body;

    // Validações básicas
    if (!productCode || !productName || !pricing || !client) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: productCode, productName, pricing, client' 
      });
    }

    if (!pricing.aVista || !pricing.tresXBoleto || !pricing.tresXCartao) {
      return res.status(400).json({ 
        error: 'Todos os valores de preço são obrigatórios' 
      });
    }

    if (!client.name || !client.email) {
      return res.status(400).json({ 
        error: 'Nome e email do cliente são obrigatórios' 
      });
    }

    const proposal = new Proposal({
      productCode,
      productName,
      pricing,
      client,
      notes,
      createdBy: req.user.id
    });

    await proposal.save();
    await proposal.populate('createdBy', 'name email');

    res.status(201).json({ data: proposal });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/proposals/:id - Atualizar proposta
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      productCode,
      productName,
      pricing,
      client,
      status,
      notes
    } = req.body;

    const proposal = await Proposal.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Atualizar campos se fornecidos
    if (productCode) proposal.productCode = productCode;
    if (productName) proposal.productName = productName;
    if (pricing) proposal.pricing = pricing;
    if (client) proposal.client = client;
    if (status) proposal.status = status;
    if (notes !== undefined) proposal.notes = notes;

    await proposal.save();
    await proposal.populate('createdBy', 'name email');

    res.json({ data: proposal });
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/proposals/:id - Deletar proposta
router.delete('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json({ message: 'Proposta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/proposals/stats/summary - Estatísticas das propostas
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Proposal.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          draftProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          sentProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          acceptedProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejectedProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          expiredProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProposals: 0,
      draftProposals: 0,
      sentProposals: 0,
      acceptedProposals: 0,
      rejectedProposals: 0,
      expiredProposals: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Erro ao buscar estatísticas das propostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
