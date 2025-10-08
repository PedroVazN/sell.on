const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notice = require('../models/Notice');

// GET /api/notices - Listar avisos (admin vê todos, vendedor vê apenas os ativos)
router.get('/', async (req, res) => {
  try {
    console.log('=== LISTANDO AVISOS ===');
    console.log('User role:', req.user ? req.user.role : 'NENHUM');
    
    let query = {};
    
    // Se for vendedor, só mostra avisos ativos e não expirados
    if (req.user && req.user.role === 'vendedor') {
      query = {
        isActive: true,
        $or: [
          { targetRoles: 'all' },
          { targetRoles: 'vendedor' }
        ],
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      };
    }
    
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

// POST /api/notices - Criar novo aviso (apenas admin)
router.post('/', async (req, res) => {
  try {
    console.log('=== CRIANDO AVISO ===');
    console.log('User role:', req.user ? req.user.role : 'NENHUM');
    console.log('Body:', req.body);
    
    // Verificar se é admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem criar avisos'
      });
    }
    
    const { title, content, priority, expiresAt, targetRoles } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Título e conteúdo são obrigatórios'
      });
    }
    
    const notice = new Notice({
      title,
      content,
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id,
      targetRoles: targetRoles || ['all']
    });
    
    await notice.save();
    await notice.populate('createdBy', 'name email');
    
    console.log('Aviso criado:', notice._id);
    
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

// PUT /api/notices/:id - Atualizar aviso (apenas admin)
router.put('/:id', async (req, res) => {
  try {
    console.log('=== ATUALIZANDO AVISO ===');
    console.log('ID:', req.params.id);
    console.log('User role:', req.user ? req.user.role : 'NENHUM');
    
    // Verificar se é admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem editar avisos'
      });
    }
    
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

// DELETE /api/notices/:id - Deletar aviso (apenas admin)
router.delete('/:id', async (req, res) => {
  try {
    console.log('=== DELETANDO AVISO ===');
    console.log('ID:', req.params.id);
    console.log('User role:', req.user ? req.user.role : 'NENHUM');
    
    // Verificar se é admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem deletar avisos'
      });
    }
    
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
