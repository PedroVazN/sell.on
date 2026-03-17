const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

function safeRoomName(proposalId) {
  const raw = String(proposalId || '').trim();
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
  return `proposal-${cleaned}`;
}

function buildJitsiRoomUrl(roomName) {
  const domain = (process.env.JITSI_DOMAIN || 'meet.jit.si').trim();
  const roomPath = encodeURIComponent(`sellon-${roomName}`);
  const base = `https://${domain}/${roomPath}`;
  const options =
    '#config.prejoinPageEnabled=false&config.disableDeepLinking=true&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true';
  return `${base}${options}`;
}

function canAccessProposalRoom(user, proposal) {
  if (!user) return false;
  if (user.role === 'admin') return true;

  if (user.role === 'vendedor') {
    const userId = (user._id || user.id || '').toString();
    const createdById = (proposal.createdBy && proposal.createdBy._id ? proposal.createdBy._id : proposal.createdBy)?.toString();
    const sellerId = (proposal.seller && proposal.seller._id ? proposal.seller._id : proposal.seller)?.toString();
    return userId && (userId === createdById || userId === sellerId);
  }

  return false;
}

// GET /api/video/rooms/proposal/:proposalId
// Admin ou vendedor da proposta pode acessar a sala
router.get('/rooms/proposal/:proposalId', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB não conectado - não é possível criar sala de videochamada',
      });
    }

    const { proposalId } = req.params;
    if (!proposalId) {
      return res.status(400).json({ success: false, message: 'proposalId é obrigatório' });
    }

    const proposal = await Proposal.findById(proposalId).select('_id proposalNumber createdBy seller').lean();
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta não encontrada' });
    }

    if (!canAccessProposalRoom(req.user, proposal)) {
      return res.status(403).json({ success: false, message: 'Sem permissão para acessar esta videochamada' });
    }

    const roomName = safeRoomName(proposalId);
    const roomUrl = buildJitsiRoomUrl(roomName);

    return res.json({
      success: true,
      data: {
        proposalId: proposal._id.toString(),
        proposalNumber: proposal.proposalNumber,
        roomName,
        roomUrl,
        provider: 'jitsi',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sala de videochamada:', error?.message || error);
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || 'Não foi possível criar a sala de videochamada no momento.',
    });
  }
});

module.exports = router;
