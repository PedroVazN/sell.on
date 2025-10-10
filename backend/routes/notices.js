const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notices - Listar avisos (todos os avisos ativos)
router.get('/', async (req, res) => {
  try {
    console.log('=== LISTANDO AVISOS ===');
    
    // Mostra apenas avisos ativos e não expirados
    const query = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    const notices = await Notice.find(query)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    console.log('Avisos encontrados:', notices.length);
    
    res.json({
      success: true,
      data: notices
    });
  } catch (error) {
    console.error('Erro ao listar avisos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/notices - Criar novo aviso
router.post('/', async (req, res) => {
  try {
    console.log('=== CRIANDO AVISO ===');
    console.log('Body:', req.body);
    
    const { title, content, priority, expiresAt, targetRoles } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Título e conteúdo são obrigatórios'
      });
    }
    
    // Buscar um usuário admin para associar o aviso
    const User = require('../models/User');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.status(500).json({
        success: false,
        error: 'Nenhum usuário administrador encontrado'
      });
    }
    
    const notice = new Notice({
      title,
      content,
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: adminUser._id,
      targetRoles: targetRoles || ['all']
    });
    
    await notice.save();
    await notice.populate('createdBy', 'name email');
    
    console.log('Aviso criado:', notice._id);
    
    // Criar notificações para usuários baseado nos targetRoles
    try {
      let targetUsers = [];
      
      if (targetRoles.includes('all')) {
        // Buscar todos os usuários ativos
        targetUsers = await User.find({ isActive: true }).select('_id role');
      } else {
        // Buscar usuários específicos baseado nos roles
        targetUsers = await User.find({ 
          role: { $in: targetRoles },
          isActive: true 
        }).select('_id role');
      }
      
      console.log(`Criando notificações para ${targetUsers.length} usuários`);
      
      // Criar notificações INDIVIDUAIS para cada usuário - UMA POR VEZ
      console.log(`=== CRIANDO NOTIFICAÇÕES INDIVIDUAIS ===`);
      
      const createdNotifications = [];
      
      for (let i = 0; i < targetUsers.length; i++) {
        const user = targetUsers[i];
        console.log(`Criando notificação ${i + 1}/${targetUsers.length} para usuário ${user._id}`);
        
        // Criar notificação completamente individual
        const notificationData = {
          title: `${notice.priority === 'urgent' ? '🚨' : notice.priority === 'high' ? '⚠️' : '📢'} Novo Aviso`,
          message: notice.title,
          type: 'notice',
          priority: notice.priority || 'medium',
          recipient: user._id.toString(),
          sender: notice.createdBy.toString(),
          relatedEntity: notice._id.toString(),
          relatedEntityType: 'notice',
          data: {
            noticeTitle: notice.title,
            noticeContent: notice.content,
            noticePriority: notice.priority,
            expiresAt: notice.expiresAt
          },
          expiresAt: notice.expiresAt,
          isRead: false,
          isActive: true
        };
        
        const notification = new Notification(notificationData);
        await notification.save();
        
        createdNotifications.push(notification);
        console.log(`✅ Notificação ${i + 1} criada - ID: ${notification._id}, Recipient: ${notification.recipient}`);
        
        // Pequena pausa para garantir IDs únicos
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log(`✅ SUCESSO: ${createdNotifications.length} notificações INDIVIDUAIS criadas`);
      
      // Verificar IDs únicos
      const ids = createdNotifications.map(n => n._id.toString());
      const uniqueIds = [...new Set(ids)];
      console.log(`IDs únicos: ${uniqueIds.length}/${ids.length}`);
      
      if (ids.length !== uniqueIds.length) {
        console.log('❌ ERRO: IDs duplicados encontrados!');
        console.log('IDs:', ids);
      }
      
    } catch (notificationError) {
      console.error('Erro ao criar notificações:', notificationError);
      // Não falhar a criação do aviso se houver erro nas notificações
    }
    
    res.status(201).json({
      success: true,
      data: notice,
      message: 'Aviso criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar aviso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/notices/:id - Atualizar aviso
router.put('/:id', async (req, res) => {
  try {
    console.log('=== ATUALIZANDO AVISO ===');
    console.log('ID:', req.params.id);
    
    const { title, content, priority, expiresAt, targetRoles, isActive } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (priority) updateData.priority = priority;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (targetRoles) updateData.targetRoles = targetRoles;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Aviso não encontrado'
      });
    }
    
    console.log('Aviso atualizado:', notice._id);
    
    res.json({
      success: true,
      data: notice,
      message: 'Aviso atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar aviso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/notices/:id - Deletar aviso
router.delete('/:id', async (req, res) => {
  try {
    console.log('=== DELETANDO AVISO ===');
    console.log('ID:', req.params.id);
    
    const notice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Aviso não encontrado'
      });
    }
    
    console.log('Aviso deletado:', notice._id);
    
    res.json({
      success: true,
      message: 'Aviso deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar aviso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
