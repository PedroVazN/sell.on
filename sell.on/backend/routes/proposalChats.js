const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ProposalChat = require('../models/ProposalChat');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/proposal-chats?proposalId=xxx — obter ou criar chat da proposta (vendedor: só suas propostas; admin: qualquer)
router.get('/', auth, async (req, res) => {
  try {
    const { proposalId } = req.query;
    if (!proposalId) {
      return res.status(400).json({ success: false, message: 'proposalId é obrigatório' });
    }

    const proposal = await Proposal.findById(proposalId).lean();
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta não encontrada' });
    }

    const isAdmin = req.user.role === 'admin';
    const sellerId = proposal.seller?._id?.toString?.() || proposal.seller?.toString?.();
    const isVendedorOwner = req.user.role === 'vendedor' && req.user._id.toString() === sellerId;

    if (!isAdmin && !isVendedorOwner) {
      return res.status(403).json({ success: false, message: 'Sem permissão para acessar o chat desta proposta' });
    }

    let chat = await ProposalChat.findOne({ proposal: proposalId })
      .populate('vendedor', 'name email')
      .populate('proposal', 'proposalNumber client seller')
      .populate('messages.sender', 'name email role')
      .lean();

    if (!chat) {
      chat = await ProposalChat.create({
        proposal: proposalId,
        vendedor: sellerId
      });
      chat = await ProposalChat.findById(chat._id)
        .populate('vendedor', 'name email')
        .populate('proposal', 'proposalNumber client seller')
        .populate('messages.sender', 'name email role')
        .lean();
    }

    return res.json({ success: true, data: chat });
  } catch (err) {
    console.error('Erro ao obter/criar chat da proposta:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao obter chat' });
  }
});

// GET /api/proposal-chats/list — admin: todos os chats; vendedor: apenas os seus
router.get('/list', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { vendedor: req.user._id };

    const chats = await ProposalChat.find(filter)
      .populate('proposal', 'proposalNumber client seller status createdAt')
      .populate('vendedor', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, data: chats });
  } catch (err) {
    console.error('Erro ao listar chats:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao listar chats' });
  }
});

// GET /api/proposal-chats/:id — obter um chat por ID (vendedor: só se for dono; admin: qualquer)
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await ProposalChat.findById(req.params.id)
      .populate('vendedor', 'name email')
      .populate('proposal', 'proposalNumber client seller')
      .populate('messages.sender', 'name email role')
      .lean();

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat não encontrado' });
    }

    const isAdmin = req.user.role === 'admin';
    const vendedorId = chat.vendedor?._id?.toString?.() || chat.vendedor?.toString?.();
    const isVendedorOwner = req.user.role === 'vendedor' && req.user._id.toString() === vendedorId;

    if (!isAdmin && !isVendedorOwner) {
      return res.status(403).json({ success: false, message: 'Sem permissão para este chat' });
    }

    return res.json({ success: true, data: chat });
  } catch (err) {
    console.error('Erro ao obter chat:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao obter chat' });
  }
});

// POST /api/proposal-chats/:id/messages — enviar mensagem (vendedor dono do chat ou admin)
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Texto da mensagem é obrigatório' });
    }

    const chat = await ProposalChat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat não encontrado' });
    }

    const isAdmin = req.user.role === 'admin';
    const vendedorId = chat.vendedor?.toString?.();
    const isVendedorOwner = req.user.role === 'vendedor' && req.user._id.toString() === vendedorId;

    if (!isAdmin && !isVendedorOwner) {
      return res.status(403).json({ success: false, message: 'Sem permissão para enviar mensagem neste chat' });
    }

    chat.messages.push({
      sender: req.user._id,
      text: text.trim().slice(0, 2000)
    });
    await chat.save();

    // Se o vendedor enviou, notificar todos os admins
    if (req.user.role === 'vendedor') {
      try {
        const admins = await User.find({ role: 'admin' }).select('_id').lean();
        const proposal = await Proposal.findById(chat.proposal).populate('seller', 'name').lean();
        const proposalNumber = proposal?.proposalNumber || 'N/A';
        const vendedorName = req.user.name || proposal?.seller?.name || 'Vendedor';
        const messagePreview = text.trim().slice(0, 80) + (text.trim().length > 80 ? '…' : '');
        const fullMessage = `${vendedorName} na proposta ${proposalNumber}: ${messagePreview}`.slice(0, 500);

        for (const admin of admins) {
          await Notification.create({
            title: 'Nova mensagem no chat',
            message: fullMessage,
            type: 'chat_message',
            priority: 'medium',
            recipient: admin._id.toString(),
            sender: req.user._id.toString(),
            relatedEntity: chat.proposal?.toString?.(),
            relatedEntityType: 'proposal',
            data: { chatId: chat._id.toString(), proposalId: chat.proposal?.toString?.(), proposalNumber, vendedorName }
          });
        }
      } catch (notifErr) {
        console.error('Erro ao criar notificação de chat para admin:', notifErr);
      }
    }

    const updated = await ProposalChat.findById(chat._id)
      .populate('vendedor', 'name email')
      .populate('proposal', 'proposalNumber client seller')
      .populate('messages.sender', 'name email role')
      .lean();

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao enviar mensagem' });
  }
});

// DELETE /api/proposal-chats/:id — admin: qualquer chat; vendedor: apenas o próprio
router.delete('/:id', auth, async (req, res) => {
  try {
    const chat = await ProposalChat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat não encontrado' });
    }

    const isAdmin = req.user.role === 'admin';
    const vendedorId = chat.vendedor?.toString?.();
    const isVendedorOwner = req.user.role === 'vendedor' && req.user._id.toString() === vendedorId;

    if (!isAdmin && !isVendedorOwner) {
      return res.status(403).json({ success: false, message: 'Sem permissão para excluir este chat' });
    }

    await ProposalChat.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Chat excluído' });
  } catch (err) {
    console.error('Erro ao excluir chat:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao excluir chat' });
  }
});

module.exports = router;
