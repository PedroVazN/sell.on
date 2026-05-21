const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const ProposalTask = require('../models/ProposalTask');
const {
  runProposalFollowUpScan,
  getFollowUpDaysThreshold,
} = require('../services/proposalFollowUp');

function taskFilterForUser(req) {
  if (req.user.role === 'admin' || req.user.role === 'analista') {
    return req.query.assignedTo ? { assignedTo: req.query.assignedTo } : {};
  }
  return { assignedTo: req.user._id };
}

// GET /api/proposal-tasks — minhas tarefas (vendedor) ou todas (admin)
router.get('/', auth, authorize('admin', 'vendedor', 'analista'), async (req, res) => {
  try {
    const filter = taskFilterForUser(req);
    if (req.query.status) {
      filter.status = req.query.status;
    } else if (req.query.pending === 'true') {
      filter.status = 'pending';
    }
    if (req.query.proposalId) {
      filter.proposal = req.query.proposalId;
    }

    const tasks = await ProposalTask.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('proposal', 'proposalNumber client seller status total updatedAt')
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(Math.min(parseInt(req.query.limit, 10) || 100, 200))
      .lean();

    res.json({
      success: true,
      data: tasks,
      meta: {
        followUpDays: getFollowUpDaysThreshold(),
        pendingCount: await ProposalTask.countDocuments({
          ...taskFilterForUser(req),
          status: 'pending',
        }),
      },
    });
  } catch (err) {
    console.error('Erro ao listar tarefas:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar tarefas' });
  }
});

// POST /api/proposal-tasks/scan — admin: executar automação manualmente
router.post('/scan', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await runProposalFollowUpScan();
    res.json({
      success: true,
      message: 'Varredura de follow-up concluída',
      data: result,
    });
  } catch (err) {
    console.error('Erro no scan follow-up:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro na varredura' });
  }
});

// PATCH /api/proposal-tasks/:id/complete
router.patch('/:id/complete', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const task = await ProposalTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    if (task.status === 'completed') {
      return res.json({ success: true, data: task, message: 'Tarefa já concluída' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    if (req.body.notes) {
      task.notes = String(req.body.notes).trim().slice(0, 1000);
    }
    await task.save();

    const populated = await ProposalTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('proposal', 'proposalNumber client status');

    res.json({
      success: true,
      data: populated,
      message: 'Tarefa concluída',
    });
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
    res.status(500).json({ success: false, message: 'Erro ao concluir tarefa' });
  }
});

// PATCH /api/proposal-tasks/:id — admin reatribuir ou atualizar notas
router.patch('/:id', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const task = await ProposalTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    if (req.body.notes != null) task.notes = String(req.body.notes).trim().slice(0, 1000);
    if (req.body.dueAt != null) task.dueAt = new Date(req.body.dueAt);
    if (isAdmin && req.body.assignedTo) task.assignedTo = req.body.assignedTo;

    await task.save();

    const populated = await ProposalTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('proposal', 'proposalNumber client status');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
