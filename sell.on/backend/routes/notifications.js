const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(auth);

// GET /api/notifications - Listar notificações do usuário
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      recipient: req.user.id,
      isActive: true
    };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    if (type) {
      filter.type = type;
    }

    console.log(`=== LISTAR NOTIFICAÇÕES ===`);
    console.log(`Usuário: ${req.user.id}`);
    console.log(`Tipo do usuário: ${typeof req.user.id}`);
    console.log(`req.user completo:`, req.user);
    console.log(`Filtro ANTES:`, filter);

    // Verificar se há notificações com esse recipient
    const allNotificationsForUser = await Notification.find({ recipient: req.user.id });
    console.log(`🔍 Todas as notificações para usuário ${req.user.id}:`, allNotificationsForUser.length);
    allNotificationsForUser.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}, Recipient: ${notif.recipient}, Recipient Type: ${typeof notif.recipient}, Title: ${notif.title}`);
    });

    console.log(`Filtro FINAL:`, filter);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean();

    const total = await Notification.countDocuments(filter);

    console.log(`Notificações encontradas: ${notifications.length}`);
    notifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ID: ${notification._id}, Recipient: ${notification.recipient}, Lida: ${notification.isRead}`);
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/notifications/unread-count - Contar notificações não lidas
router.get('/unread-count', async (req, res) => {
  try {
    console.log('=== CONTAR NOTIFICAÇÕES NÃO LIDAS ===');
    console.log('Usuário:', req.user ? req.user.id : 'NENHUM');
    console.log('Tipo do usuário ID:', typeof req.user?.id);
    
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
      isActive: true
    });

    console.log('Contagem encontrada:', count);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/notifications/:id/read - Marcar notificação como lida
router.patch('/:id/read', async (req, res) => {
  try {
    console.log(`=== MARCAR COMO LIDA ===`);
    console.log(`Notificação ID: ${req.params.id}`);
    console.log(`Usuário logado: ${req.user.id}`);
    console.log(`Tipo do req.user.id: ${typeof req.user.id}`);
    console.log(`req.user completo:`, req.user);
    
    // Buscar TODAS as notificações com esse ID para debug
    const allNotificationsWithId = await Notification.find({ _id: req.params.id });
    console.log(`🔍 Todas as notificações com ID ${req.params.id}:`, allNotificationsWithId.length);
    allNotificationsWithId.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}, Recipient: ${notif.recipient}, Recipient Type: ${typeof notif.recipient}`);
    });
    
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      console.log('❌ Notificação não encontrada para este usuário');
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }

    console.log(`✅ Notificação encontrada: ${notification._id}`);
    console.log(`Recipient: ${notification.recipient}`);
    console.log(`Título: ${notification.title}`);
    console.log(`Atualmente lida: ${notification.isRead}`);

    await notification.markAsRead();
    
    console.log(`✅ Notificação ${notification._id} marcada como lida`);

    res.json({
      success: true,
      data: notification,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/notifications/read-all - Marcar todas as notificações como lidas
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
        isActive: true
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/notifications/clear-all - Limpar todas as notificações
router.delete('/clear-all', async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isActive: true
      },
      {
        isActive: false
      }
    );

    res.json({
      success: true,
      message: 'Todas as notificações foram removidas'
    });
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/notifications/:id - Deletar notificação
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }

    notification.isActive = false;
    await notification.save();

    res.json({
      success: true,
      message: 'Notificação removida'
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/notifications - Criar notificação (para testes)
router.post('/', async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      recipient: req.user.id
    };

    const notification = new Notification(notificationData);
    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar notificação'
    });
  }
});

module.exports = router;
