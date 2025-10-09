const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { auth } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// GET /api/goals - Listar metas com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      type,
      category,
      status,
      assignedTo,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Filtro por usuário (admin pode ver todas, usuário comum vê apenas as suas)
    if (req.user.role === 'admin') {
      if (assignedTo) {
        query.assignedTo = assignedTo;
      }
    } else {
      query.assignedTo = req.user.id;
    }

    // Filtro de busca
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtros específicos
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    // Filtro por período
    if (startDate && endDate) {
      query['period.startDate'] = { $gte: startDate };
      query['period.endDate'] = { $lte: endDate };
    } else if (startDate) {
      query['period.startDate'] = { $gte: startDate };
    } else if (endDate) {
      query['period.endDate'] = { $lte: endDate };
    }

    const goals = await Goal.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      data: goals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/goals/dashboard - Dashboard de metas
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'month', userId } = req.query;
    const targetUser = userId || req.user.id;

    // Verificar permissão
    if (req.user.role !== 'admin' && targetUser !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const goals = await Goal.find({
      assignedTo: targetUser,
      'period.startDate': { $gte: startDate.toISOString().split('T')[0] },
      'period.endDate': { $lte: endDate.toISOString().split('T')[0] },
      status: { $in: ['active', 'completed'] }
    }).populate('assignedTo', 'name email');

    // Calcular estatísticas
    const stats = {
      total: goals.length,
      completed: goals.filter(g => g.isAchieved()).length,
      active: goals.filter(g => !g.isAchieved() && g.status === 'active').length,
      averageProgress: goals.length > 0 ? 
        Math.round(goals.reduce((sum, g) => sum + g.progress.percentage, 0) / goals.length) : 0,
      totalTarget: goals.reduce((sum, g) => sum + g.targetValue, 0),
      totalCurrent: goals.reduce((sum, g) => sum + g.currentValue, 0)
    };

    // Metas por categoria
    const byCategory = goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = { total: 0, completed: 0, current: 0, target: 0 };
      }
      acc[goal.category].total++;
      acc[goal.category].current += goal.currentValue;
      acc[goal.category].target += goal.targetValue;
      if (goal.isAchieved()) acc[goal.category].completed++;
      return acc;
    }, {});

    // Metas por tipo
    const byType = goals.reduce((acc, goal) => {
      if (!acc[goal.type]) {
        acc[goal.type] = { total: 0, completed: 0, current: 0, target: 0 };
      }
      acc[goal.type].total++;
      acc[goal.type].current += goal.currentValue;
      acc[goal.type].target += goal.targetValue;
      if (goal.isAchieved()) acc[goal.type].completed++;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stats,
        goals,
        byCategory,
        byType,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard de metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/goals/:id - Buscar meta específica
router.get('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      assignedTo: req.user.role === 'admin' ? { $exists: true } : req.user.id
    })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/goals - Criar nova meta
router.post('/', async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Validar datas
    if (new Date(goalData.period.startDate) >= new Date(goalData.period.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de início deve ser anterior à data de fim'
      });
    }

    const goal = new Goal(goalData);
    await goal.save();

    const populatedGoal = await Goal.findById(goal._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedGoal,
      message: 'Meta criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar meta'
    });
  }
});

// PUT /api/goals/:id - Atualizar meta
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { assignedTo: req.user.id },
          { createdBy: req.user.id },
          { createdBy: req.user.role === 'admin' ? { $exists: true } : req.user.id }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role').populate('createdBy', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada ou sem permissão'
      });
    }

    res.json({
      success: true,
      data: goal,
      message: 'Meta atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar meta'
    });
  }
});

// PATCH /api/goals/:id/progress - Atualizar progresso da meta
router.patch('/:id/progress', async (req, res) => {
  try {
    const { value, description } = req.body;

    if (value === undefined || value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor do progresso é obrigatório e deve ser positivo'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    await goal.updateProgress(value, description);

    const updatedGoal = await Goal.findById(goal._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: updatedGoal,
      message: 'Progresso atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar progresso'
    });
  }
});

// PATCH /api/goals/:id/status - Atualizar status da meta
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { assignedTo: req.user.id },
          { createdBy: req.user.id },
          { createdBy: req.user.role === 'admin' ? { $exists: true } : req.user.id }
        ]
      },
      { status },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role').populate('createdBy', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada ou sem permissão'
      });
    }

    res.json({
      success: true,
      data: goal,
      message: 'Status atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar status'
    });
  }
});

// POST /api/goals/update-on-proposal-close - Atualizar metas quando proposta é fechada
router.post('/update-on-proposal-close', async (req, res) => {
  try {
    const { sellerId, proposalValue } = req.body;

    if (!sellerId || proposalValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'sellerId e proposalValue são obrigatórios'
      });
    }

    // Buscar metas ativas do vendedor para vendas (category: 'sales')
    const activeGoals = await Goal.find({
      assignedTo: sellerId,
      category: 'sales',
      status: 'active',
      unit: 'currency'
    });

    if (activeGoals.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhuma meta ativa encontrada para o vendedor',
        updatedGoals: []
      });
    }

    const updatedGoals = [];

    // Atualizar cada meta ativa
    for (const goal of activeGoals) {
      const newCurrentValue = goal.currentValue + proposalValue;
      
      // Adicionar marco de progresso
      goal.progress.milestones.push({
        date: new Date().toISOString().split('T')[0],
        value: newCurrentValue,
        description: `Proposta fechada: R$ ${proposalValue.toLocaleString('pt-BR')}`
      });

      // Manter apenas os últimos 10 marcos
      if (goal.progress.milestones.length > 10) {
        goal.progress.milestones = goal.progress.milestones.slice(-10);
      }

      // Atualizar valor atual
      goal.currentValue = newCurrentValue;
      
      // Verificar se a meta foi atingida
      if (goal.currentValue >= goal.targetValue) {
        goal.status = 'completed';
      }

      await goal.save();
      updatedGoals.push(goal);
    }

    res.json({
      success: true,
      message: `Metas atualizadas com sucesso. Valor adicionado: R$ ${proposalValue.toLocaleString('pt-BR')}`,
      updatedGoals: updatedGoals.map(goal => ({
        id: goal._id,
        title: goal.title,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        percentage: goal.progress.percentage,
        status: goal.status
      }))
    });
  } catch (error) {
    console.error('Erro ao atualizar metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/goals/:id - Excluir meta
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { createdBy: req.user.role === 'admin' ? { $exists: true } : req.user.id }
      ]
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada ou sem permissão'
      });
    }

    res.json({
      success: true,
      message: 'Meta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
