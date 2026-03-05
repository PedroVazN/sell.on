const express = require('express');
const { body, param, validationResult } = require('express-validator');
const PipelineStage = require('../models/PipelineStage');
const LossReason = require('../models/LossReason');
const Opportunity = require('../models/Opportunity');
const OpportunityActivity = require('../models/OpportunityActivity');
const OpportunityHistory = require('../models/OpportunityHistory');
const Client = require('../models/Client');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Proposal = require('../models/Proposal');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// --- Helpers ---
const canEditOpportunity = (req, opportunity) => {
  if (req.user.role === 'admin') return true;
  return opportunity.responsible_user && opportunity.responsible_user._id.toString() === req.user._id.toString();
};

const buildOpportunityQuery = (req) => {
  const q = { isDeleted: { $ne: true } };
  if (req.user.role === 'vendedor') {
    q.responsible_user = req.user._id;
  }
  return q;
};

// --- Pipeline Stages ---

// GET /api/funnel/stages (seed default stages if none exist)
router.get('/stages', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    let stages = await PipelineStage.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
    if (stages.length === 0) {
      const defaults = [
        { name: 'Leads / Contatos iniciais', order: 0, color: '#6b7280' },
        { name: 'Primeiro atendimento', order: 1, color: '#3b82f6' },
        { name: 'Proposta enviada', order: 2, color: '#8b5cf6' },
        { name: 'Negociação', order: 3, color: '#f59e0b' },
        { name: 'Fechamento', order: 4, color: '#10b981' },
      ];
      await PipelineStage.insertMany(defaults);
      stages = await PipelineStage.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
    }
    return res.json({ success: true, data: stages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/funnel/stages
router.post('/stages', auth, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('order').optional().isInt({ min: 0 }),
  body('color').optional().trim(),
  body('isWon').optional().isBoolean(),
  body('isLost').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const stage = new PipelineStage({
      name: req.body.name,
      order: req.body.order ?? (await PipelineStage.countDocuments({ isDeleted: { $ne: true } })),
      color: req.body.color ?? '#6b7280',
      isWon: req.body.isWon ?? false,
      isLost: req.body.isLost ?? false,
    });
    await stage.save();
    return res.status(201).json({ success: true, data: stage });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/funnel/stages/:id
router.put('/stages/:id', auth, authorize('admin'), [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('order').optional().isInt({ min: 0 }),
  body('color').optional().trim(),
  body('isWon').optional().isBoolean(),
  body('isLost').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const stage = await PipelineStage.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!stage) return res.status(404).json({ success: false, message: 'Estágio não encontrado' });
    if (req.body.name != null) stage.name = req.body.name;
    if (req.body.order != null) stage.order = req.body.order;
    if (req.body.color != null) stage.color = req.body.color;
    if (req.body.isWon != null) stage.isWon = req.body.isWon;
    if (req.body.isLost != null) stage.isLost = req.body.isLost;
    await stage.save();
    return res.json({ success: true, data: stage });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/funnel/stages/:id (soft delete)
router.delete('/stages/:id', auth, authorize('admin'), [param('id').isMongoId()], async (req, res) => {
  try {
    const stage = await PipelineStage.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!stage) return res.status(404).json({ success: false, message: 'Estágio não encontrado' });
    stage.isDeleted = true;
    stage.deletedAt = new Date();
    await stage.save();
    return res.json({ success: true, data: stage });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/funnel/stages/reorder
router.patch('/stages/reorder', auth, authorize('admin'), [
  body('orderIds').isArray().withMessage('orderIds deve ser um array de _id'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { orderIds } = req.body;
    for (let i = 0; i < orderIds.length; i++) {
      await PipelineStage.updateOne({ _id: orderIds[i] }, { order: i });
    }
    const stages = await PipelineStage.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
    return res.json({ success: true, data: stages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- Loss Reasons ---

// GET /api/funnel/loss-reasons (seed defaults if none exist)
router.get('/loss-reasons', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    let list = await LossReason.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
    if (list.length === 0) {
      const defaults = [
        { name: 'Preço acima do orçamento', order: 0 },
        { name: 'Escolheu concorrente', order: 1 },
        { name: 'Sem resposta do cliente', order: 2 },
        { name: 'Projeto cancelado', order: 3 },
        { name: 'Outro', order: 4 },
      ];
      await LossReason.insertMany(defaults);
      list = await LossReason.find({ isDeleted: { $ne: true } }).sort({ order: 1 });
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/funnel/loss-reasons
router.post('/loss-reasons', auth, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('order').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const reason = new LossReason({
      name: req.body.name,
      order: req.body.order ?? (await LossReason.countDocuments({ isDeleted: { $ne: true } })),
    });
    await reason.save();
    return res.status(201).json({ success: true, data: reason });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/funnel/loss-reasons/:id
router.put('/loss-reasons/:id', auth, authorize('admin'), [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('order').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const reason = await LossReason.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!reason) return res.status(404).json({ success: false, message: 'Motivo não encontrado' });
    if (req.body.name != null) reason.name = req.body.name;
    if (req.body.order != null) reason.order = req.body.order;
    await reason.save();
    return res.json({ success: true, data: reason });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/funnel/loss-reasons/:id (soft delete)
router.delete('/loss-reasons/:id', auth, authorize('admin'), [param('id').isMongoId()], async (req, res) => {
  try {
    const reason = await LossReason.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!reason) return res.status(404).json({ success: false, message: 'Motivo não encontrado' });
    reason.isDeleted = true;
    reason.deletedAt = new Date();
    await reason.save();
    return res.json({ success: true, data: reason });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- Opportunities ---

const opportunityPopulate = [
  { path: 'client', select: 'razaoSocial nomeFantasia contato endereco' },
  { path: 'responsible_user', select: 'name email' },
  { path: 'stage', select: 'name order color isWon isLost' },
  { path: 'loss_reason', select: 'name' },
];

// GET /api/funnel/opportunities
router.get('/opportunities', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const { seller, stage, status, dateFrom, dateTo, search } = req.query;
    const query = buildOpportunityQuery(req);
    if (seller) query.responsible_user = seller;
    if (stage) query.stage = stage;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.expected_close_date = {};
      if (dateFrom) query.expected_close_date.$gte = new Date(dateFrom);
      if (dateTo) query.expected_close_date.$lte = new Date(dateTo);
    }
    if (search && search.trim()) {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: re },
        { description: re },
      ];
      const clients = await Client.find({ $or: [{ razaoSocial: re }, { nomeFantasia: re }, { 'contato.nome': re }] }).select('_id').lean();
      const clientIds = clients.map((c) => c._id);
      if (clientIds.length) query.$or.push({ client: { $in: clientIds } });
    }
    const list = await Opportunity.find(query)
      .populate(opportunityPopulate)
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/funnel/opportunities/:id
router.get('/opportunities/:id', auth, authorize('admin', 'vendedor'), [param('id').isMongoId()], async (req, res) => {
  try {
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate(opportunityPopulate);
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }
    const activities = await OpportunityActivity.find({ opportunity: opp._id, isDeleted: { $ne: true } })
      .populate('createdBy', 'name email')
      .sort({ due_at: 1, createdAt: -1 })
      .lean();
    const history = await OpportunityHistory.find({ opportunity: opp._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({
      success: true,
      data: {
        ...opp.toObject(),
        activities,
        history,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/funnel/opportunities
router.post('/opportunities', auth, authorize('admin', 'vendedor'), [
  body('client_id').isMongoId().withMessage('Cliente é obrigatório'),
  body('stage_id').isMongoId().withMessage('Estágio é obrigatório'),
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('estimated_value').isFloat({ min: 0 }).withMessage('Valor estimado inválido'),
  body('responsible_user_id').optional().isMongoId(),
  body('win_probability').optional().isInt({ min: 0, max: 100 }),
  body('expected_close_date').optional().isISO8601(),
  body('lead_source').optional().trim(),
  body('description').optional().trim(),
  body('next_activity_at').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const responsibleId = req.body.responsible_user_id || req.user._id;
    if (req.user.role === 'vendedor' && responsibleId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Vendedor só pode atribuir a si mesmo' });
    }
    const opp = new Opportunity({
      client: req.body.client_id,
      responsible_user: responsibleId,
      stage: req.body.stage_id,
      title: req.body.title,
      estimated_value: req.body.estimated_value,
      win_probability: req.body.win_probability ?? 50,
      expected_close_date: req.body.expected_close_date || null,
      lead_source: req.body.lead_source || '',
      description: req.body.description || '',
      next_activity_at: req.body.next_activity_at || null,
      status: 'open',
    });
    await opp.save();
    await OpportunityHistory.create({
      opportunity: opp._id,
      user: req.user._id,
      action: 'created',
      newValue: { title: opp.title, stage: opp.stage },
    });
    await opp.populate(opportunityPopulate);
    return res.status(201).json({ success: true, data: opp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/funnel/opportunities/:id
router.put('/opportunities/:id', auth, authorize('admin', 'vendedor'), [
  param('id').isMongoId(),
  body('client_id').optional().isMongoId(),
  body('stage_id').optional().isMongoId(),
  body('title').optional().trim().notEmpty(),
  body('estimated_value').optional().isFloat({ min: 0 }),
  body('responsible_user_id').optional().isMongoId(),
  body('win_probability').optional().isInt({ min: 0, max: 100 }),
  body('expected_close_date').optional().isISO8601(),
  body('lead_source').optional().trim(),
  body('description').optional().trim(),
  body('next_activity_at').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('responsible_user');
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    if (opp.status !== 'open') return res.status(400).json({ success: false, message: 'Oportunidade já encerrada' });
    const updates = {};
    const histFields = ['stage', 'title', 'estimated_value', 'win_probability', 'expected_close_date', 'lead_source', 'description', 'next_activity_at', 'responsible_user'];
    if (req.body.client_id != null) updates.client = req.body.client_id;
    if (req.body.stage_id != null) updates.stage = req.body.stage_id;
    if (req.body.title != null) updates.title = req.body.title;
    if (req.body.estimated_value != null) updates.estimated_value = req.body.estimated_value;
    if (req.body.responsible_user_id != null) updates.responsible_user = req.body.responsible_user_id;
    if (req.body.win_probability != null) updates.win_probability = req.body.win_probability;
    if (req.body.expected_close_date != null) updates.expected_close_date = req.body.expected_close_date;
    if (req.body.lead_source != null) updates.lead_source = req.body.lead_source;
    if (req.body.description != null) updates.description = req.body.description;
    if (req.body.next_activity_at != null) updates.next_activity_at = req.body.next_activity_at;
    for (const [k, v] of Object.entries(updates)) {
      const oldVal = opp[k];
      opp[k] = v;
      if (k === 'stage' && oldVal && oldVal.toString() !== v.toString()) {
        await OpportunityHistory.create({
          opportunity: opp._id,
          user: req.user._id,
          action: 'stage_changed',
          field: 'stage',
          oldValue: oldVal,
          newValue: v,
        });
      }
    }
    await opp.save();
    await opp.populate(opportunityPopulate);
    return res.json({ success: true, data: opp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/funnel/opportunities/:id/stage (drag-and-drop)
router.patch('/opportunities/:id/stage', auth, authorize('admin', 'vendedor'), [
  param('id').isMongoId(),
  body('stage_id').isMongoId().withMessage('stage_id é obrigatório'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('stage');
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    if (opp.status !== 'open') return res.status(400).json({ success: false, message: 'Oportunidade já encerrada' });
    const oldStageId = opp.stage._id || opp.stage;
    const newStageId = req.body.stage_id;
    if (oldStageId.toString() === newStageId) return res.json({ success: true, data: await opp.populate(opportunityPopulate) });
    opp.stage = newStageId;
    await opp.save();
    await OpportunityHistory.create({
      opportunity: opp._id,
      user: req.user._id,
      action: 'stage_changed',
      field: 'stage',
      oldValue: oldStageId,
      newValue: newStageId,
    });
    await opp.populate(opportunityPopulate);
    return res.json({ success: true, data: opp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/funnel/opportunities/:id/status (won / lost; lost requires loss_reason_id)
router.patch('/opportunities/:id/status', auth, authorize('admin', 'vendedor'), [
  param('id').isMongoId(),
  body('status').isIn(['won', 'lost']).withMessage('status deve ser won ou lost'),
  body('loss_reason_id').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    if (opp.status !== 'open') return res.status(400).json({ success: false, message: 'Oportunidade já encerrada' });
    if (req.body.status === 'lost' && !req.body.loss_reason_id) {
      return res.status(400).json({ success: false, message: 'Motivo de perda é obrigatório ao marcar como perdida' });
    }
    opp.status = req.body.status;
    if (req.body.status === 'lost') opp.loss_reason = req.body.loss_reason_id;
    await opp.save();
    await OpportunityHistory.create({
      opportunity: opp._id,
      user: req.user._id,
      action: 'status_changed',
      field: 'status',
      oldValue: 'open',
      newValue: req.body.status,
    });
    await opp.populate(opportunityPopulate);
    return res.json({ success: true, data: opp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/funnel/opportunities/:id/convert (one-click to sale)
router.post('/opportunities/:id/convert', auth, authorize('admin', 'vendedor'), [
  param('id').isMongoId(),
  body('customer_id').isMongoId().withMessage('ID do cliente (User) é obrigatório para a venda'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('client');
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    if (opp.status !== 'open') return res.status(400).json({ success: false, message: 'Oportunidade já encerrada' });
    if (opp.converted_sale) return res.status(400).json({ success: false, message: 'Oportunidade já convertida em venda' });
    const sale = new Sale({
      customer: req.body.customer_id,
      seller: opp.responsible_user,
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: opp.estimated_value,
      paymentMethod: 'pix',
      paymentStatus: 'pendente',
      status: 'rascunho',
      notes: `Convertido da oportunidade: ${opp.title}`,
      opportunity: opp._id,
    });
    await sale.save();
    opp.status = 'won';
    opp.converted_sale = sale._id;
    await opp.save();
    await OpportunityHistory.create({
      opportunity: opp._id,
      user: req.user._id,
      action: 'converted',
      newValue: { saleId: sale._id },
    });
    await opp.populate(opportunityPopulate);
    return res.status(201).json({
      success: true,
      data: { opportunity: opp, sale: { _id: sale._id, saleNumber: sale.saleNumber } },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/funnel/opportunities/:id (soft delete, admin only)
router.delete('/opportunities/:id', auth, authorize('admin'), [param('id').isMongoId()], async (req, res) => {
  try {
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    opp.isDeleted = true;
    opp.deletedAt = new Date();
    await opp.save();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- Activities ---

// GET /api/funnel/opportunities/:id/activities
router.get('/opportunities/:id/activities', auth, authorize('admin', 'vendedor'), [param('id').isMongoId()], async (req, res) => {
  try {
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('responsible_user');
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    const activities = await OpportunityActivity.find({ opportunity: req.params.id, isDeleted: { $ne: true } })
      .populate('createdBy', 'name email')
      .sort({ due_at: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: activities });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/funnel/opportunities/:id/activities
router.post('/opportunities/:id/activities', auth, authorize('admin', 'vendedor'), [
  param('id').isMongoId(),
  body('type').isIn(['task', 'call', 'message']).withMessage('Tipo inválido'),
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('due_at').optional().isISO8601(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const opp = await Opportunity.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('responsible_user');
    if (!opp) return res.status(404).json({ success: false, message: 'Oportunidade não encontrada' });
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    const activity = new OpportunityActivity({
      opportunity: req.params.id,
      type: req.body.type,
      title: req.body.title,
      due_at: req.body.due_at || null,
      notes: req.body.notes || '',
      createdBy: req.user._id,
    });
    await activity.save();
    await activity.populate('createdBy', 'name email');
    return res.status(201).json({ success: true, data: activity });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/funnel/activities/:activityId
router.put('/activities/:activityId', auth, authorize('admin', 'vendedor'), [
  param('activityId').isMongoId(),
  body('type').optional().isIn(['task', 'call', 'message']),
  body('title').optional().trim().notEmpty(),
  body('due_at').optional().isISO8601(),
  body('completed_at').optional().isISO8601(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const activity = await OpportunityActivity.findOne({ _id: req.params.activityId, isDeleted: { $ne: true } })
      .populate('opportunity');
    if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    const opp = await Opportunity.findById(activity.opportunity._id).populate('responsible_user');
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    if (req.body.type != null) activity.type = req.body.type;
    if (req.body.title != null) activity.title = req.body.title;
    if (req.body.due_at != null) activity.due_at = req.body.due_at;
    if (req.body.completed_at != null) activity.completed_at = req.body.completed_at;
    if (req.body.notes != null) activity.notes = req.body.notes;
    await activity.save();
    await activity.populate('createdBy', 'name email');
    return res.json({ success: true, data: activity });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/funnel/activities/:activityId (soft delete)
router.delete('/activities/:activityId', auth, authorize('admin', 'vendedor'), [param('activityId').isMongoId()], async (req, res) => {
  try {
    const activity = await OpportunityActivity.findOne({ _id: req.params.activityId, isDeleted: { $ne: true } })
      .populate('opportunity');
    if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    const opp = await Opportunity.findById(activity.opportunity._id).populate('responsible_user');
    if (!canEditOpportunity(req, opp)) return res.status(403).json({ success: false, message: 'Sem permissão' });
    activity.isDeleted = true;
    activity.deletedAt = new Date();
    await activity.save();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- Sync: colocar todas as propostas no funil (criar/atualizar oportunidade por proposta) ---
// POST /api/funnel/sync-proposals (apenas admin)
// Cria ou atualiza oportunidade no funil para cada proposta: negociacao->Negociação, venda_fechada->Ganhas, venda_perdida/expirada->Perdidas
router.post('/sync-proposals', auth, authorize('admin'), async (req, res) => {
  try {
    const proposals = await Proposal.find({}).sort({ createdAt: 1 }).lean();
    let stages = await PipelineStage.find({ isDeleted: { $ne: true } }).sort({ order: 1 }).lean();
    if (stages.length === 0) {
      const defaults = [
        { name: 'Leads / Contatos iniciais', order: 0, color: '#6b7280' },
        { name: 'Primeiro atendimento', order: 1, color: '#3b82f6' },
        { name: 'Proposta enviada', order: 2, color: '#8b5cf6' },
        { name: 'Negociação', order: 3, color: '#f59e0b' },
        { name: 'Fechamento', order: 4, color: '#10b981' },
      ];
      await PipelineStage.insertMany(defaults);
      stages = await PipelineStage.find({ isDeleted: { $ne: true } }).sort({ order: 1 }).lean();
    }
    const byName = (name) => stages.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
    const stageProposta = byName('Proposta enviada') || stages[0];
    const stageNegociacao = byName('Negociação') || stages[Math.min(3, stages.length - 1)];
    const stageFechamento = byName('Fechamento') || stages[stages.length - 1];

    let created = 0;
    let updated = 0;
    let skippedNoClient = 0;
    let errors = [];

    for (const p of proposals) {
      const orConditions = [];
      if (p.client && p.client.email) orConditions.push({ 'contato.email': (p.client.email || '').toLowerCase().trim() });
      if (p.client && (p.client.razaoSocial || p.client.company)) {
        const raz = (p.client.razaoSocial || p.client.company || '').trim();
        if (raz) orConditions.push({ razaoSocial: new RegExp(raz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
      }
      const clientDoc = orConditions.length ? await Client.findOne({ $or: orConditions }) : null;
      if (!clientDoc) {
        skippedNoClient += 1;
        continue;
      }

      const responsibleId = p.createdBy || (p.seller && p.seller._id);
      if (!responsibleId) {
        skippedNoClient += 1;
        continue;
      }

      const title = `Proposta ${p.proposalNumber || p._id} - ${(p.client?.razaoSocial || p.client?.company || p.client?.name || '').toString().substring(0, 40)}`;
      const estimatedValue = p.total != null ? Number(p.total) : 0;
      const validUntil = p.validUntil ? new Date(p.validUntil) : null;

      if (p.status === 'venda_fechada') {
        const oppStatus = 'won';
        const stageId = stageFechamento._id;
        if (p.opportunity) {
          const opp = await Opportunity.findOne({ _id: p.opportunity, isDeleted: { $ne: true } });
          if (opp) {
            opp.stage = stageId;
            opp.status = oppStatus;
            opp.estimated_value = estimatedValue;
            await opp.save();
            updated += 1;
          } else {
            const newOpp = new Opportunity({
              client: clientDoc._id,
              responsible_user: responsibleId,
              stage: stageId,
              title,
              estimated_value: estimatedValue,
              win_probability: 100,
              expected_close_date: validUntil,
              lead_source: 'proposta',
              description: `Proposta ${p.proposalNumber || p._id} (venda fechada)`,
              status: oppStatus,
              proposal: p._id,
            });
            await newOpp.save();
            await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
            created += 1;
          }
        } else {
          const newOpp = new Opportunity({
            client: clientDoc._id,
            responsible_user: responsibleId,
            stage: stageId,
            title,
            estimated_value: estimatedValue,
            win_probability: 100,
            expected_close_date: validUntil,
            lead_source: 'proposta',
            description: `Proposta ${p.proposalNumber || p._id} (venda fechada)`,
            status: oppStatus,
            proposal: p._id,
          });
          await newOpp.save();
          await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
          created += 1;
        }
        continue;
      }

      if (p.status === 'venda_perdida' || p.status === 'expirada') {
        const oppStatus = 'lost';
        const stageId = stageFechamento._id;
        if (p.opportunity) {
          const opp = await Opportunity.findOne({ _id: p.opportunity, isDeleted: { $ne: true } });
          if (opp) {
            opp.stage = stageId;
            opp.status = oppStatus;
            opp.estimated_value = estimatedValue;
            await opp.save();
            updated += 1;
          } else {
            const newOpp = new Opportunity({
              client: clientDoc._id,
              responsible_user: responsibleId,
              stage: stageId,
              title,
              estimated_value: estimatedValue,
              win_probability: 0,
              expected_close_date: validUntil,
              lead_source: 'proposta',
              description: `Proposta ${p.proposalNumber || p._id} (${p.status})`,
              status: oppStatus,
              proposal: p._id,
            });
            await newOpp.save();
            await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
            created += 1;
          }
        } else {
          const newOpp = new Opportunity({
            client: clientDoc._id,
            responsible_user: responsibleId,
            stage: stageId,
            title,
            estimated_value: estimatedValue,
            win_probability: 0,
            expected_close_date: validUntil,
            lead_source: 'proposta',
            description: `Proposta ${p.proposalNumber || p._id} (${p.status})`,
            status: oppStatus,
            proposal: p._id,
          });
          await newOpp.save();
          await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
          created += 1;
        }
        continue;
      }

      // negociacao ou aguardando_pagamento -> Negociação, status open
      const stageId = stageNegociacao._id;
      if (p.opportunity) {
        const opp = await Opportunity.findOne({ _id: p.opportunity, isDeleted: { $ne: true } });
        if (opp) {
          opp.stage = stageId;
          opp.status = 'open';
          opp.estimated_value = estimatedValue;
          opp.expected_close_date = validUntil;
          await opp.save();
          updated += 1;
        } else {
          const newOpp = new Opportunity({
            client: clientDoc._id,
            responsible_user: responsibleId,
            stage: stageId,
            title,
            estimated_value: estimatedValue,
            win_probability: 50,
            expected_close_date: validUntil,
            lead_source: 'proposta',
            description: p.observations ? `Proposta: ${p.observations}` : `Proposta ${p.proposalNumber || p._id}`,
            status: 'open',
            proposal: p._id,
          });
          await newOpp.save();
          await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
          created += 1;
        }
      } else {
        const newOpp = new Opportunity({
          client: clientDoc._id,
          responsible_user: responsibleId,
          stage: stageId,
          title,
          estimated_value: estimatedValue,
          win_probability: 50,
          expected_close_date: validUntil,
          lead_source: 'proposta',
          description: p.observations ? `Proposta: ${p.observations}` : `Proposta ${p.proposalNumber || p._id}`,
          status: 'open',
          proposal: p._id,
        });
        await newOpp.save();
        await Proposal.updateOne({ _id: p._id }, { opportunity: newOpp._id });
        created += 1;
      }
    }

    return res.json({
      success: true,
      data: {
        total: proposals.length,
        created,
        updated,
        skippedNoClient,
        errors: errors.length ? errors : undefined,
      },
    });
  } catch (err) {
    console.error('sync-proposals error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
