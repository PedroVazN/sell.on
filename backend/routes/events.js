const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// GET /api/events - Listar eventos com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = '',
      startDate,
      endDate,
      type,
      priority,
      status
    } = req.query;

    const query = { createdBy: req.user.id };

    // Filtro de busca
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por data
    if (startDate && endDate) {
      query.startDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.startDate = { $gte: startDate };
    } else if (endDate) {
      query.startDate = { $lte: endDate };
    }

    // Filtros adicionais
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/events/range - Buscar eventos por intervalo de datas
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate e endDate são obrigatórios'
      });
    }

    const events = await Event.find({
      createdBy: req.user.id,
      startDate: { $gte: startDate, $lte: endDate }
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1, startTime: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Erro ao buscar eventos por intervalo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/events/type/:type - Buscar eventos por tipo
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    const query = {
      createdBy: req.user.id,
      type
    };

    if (startDate && endDate) {
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1, startTime: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Erro ao buscar eventos por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/events/:id - Buscar evento específico
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/events - Criar novo evento
router.post('/', async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedEvent,
      message: 'Evento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar evento'
    });
  }
});

// PUT /api/events/:id - Atualizar evento
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      data: event,
      message: 'Evento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar evento'
    });
  }
});

// PATCH /api/events/:id/status - Atualizar status do evento
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      data: event,
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

// DELETE /api/events/:id - Excluir evento
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
