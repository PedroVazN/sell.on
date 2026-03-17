const express = require('express');
const router = express.Router();
const ChecklistItem = require('../models/ChecklistItem');
const { auth, authorize } = require('../middleware/auth');

// GET /api/checklist - Lista itens do checklist
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const items = await ChecklistItem.find()
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort({ isCompleted: 1, createdAt: -1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Erro ao listar checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar checklist',
    });
  }
});

// POST /api/checklist - Cria um novo item
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const description = String(req.body?.description || '').trim();

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Título é obrigatório',
      });
    }

    const item = await ChecklistItem.create({
      title,
      description,
      createdBy: req.user._id,
    });

    const populated = await ChecklistItem.findById(item._id)
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Item criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar item do checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar item',
    });
  }
});

// PATCH /api/checklist/:id/toggle - Alterna concluído/pendente
router.patch('/:id/toggle', auth, authorize('admin'), async (req, res) => {
  try {
    const item = await ChecklistItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    const willComplete = !item.isCompleted;

    item.isCompleted = willComplete;
    item.completedAt = willComplete ? new Date() : null;
    item.completedBy = willComplete ? req.user._id : null;

    await item.save();

    const populated = await ChecklistItem.findById(item._id)
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email');

    res.json({
      success: true,
      data: populated,
      message: willComplete ? 'Item marcado como concluído' : 'Item marcado como pendente',
    });
  } catch (error) {
    console.error('Erro ao alternar item do checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item',
    });
  }
});

// DELETE /api/checklist/:id - Remove item
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const removed = await ChecklistItem.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Item removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover item do checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover item',
    });
  }
});

module.exports = router;
