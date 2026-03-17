const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const { auth } = require('../middleware/auth');

const DAILY_API_URL = 'https://api.daily.co/v1';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    const err = new Error(`Variável de ambiente ${name} não configurada`);
    err.status = 500;
    throw err;
  }
  return v;
}

function safeRoomName(proposalId) {
  const raw = String(proposalId || '').trim();
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
  return `proposal-${cleaned}`;
}

async function dailyRequest(path, options = {}) {
  const apiKey = requireEnv('DAILY_API_KEY');
  const res = await fetch(`${DAILY_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = new Error(json?.info || json?.error || 'Erro ao chamar Daily.co');
    err.status = res.status;
    err.details = json;
    throw err;
  }
  return json;
}

async function getOrCreateRoom(roomName) {
  // Tenta criar; se já existir (409), busca.
  const privacy = process.env.DAILY_ROOM_PRIVACY || 'private';
  try {
    return await dailyRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomName,
        privacy,
        properties: {
          // Garante que o embed fique mais seguro e consistente
          enable_chat: false,
          enable_screenshare: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });
  } catch (err) {
    if (err && err.status === 409) {
      return await dailyRequest(`/rooms/${encodeURIComponent(roomName)}`, { method: 'GET' });
    }
    throw err;
  }
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
    const room = await getOrCreateRoom(roomName);

    return res.json({
      success: true,
      data: {
        proposalId: proposal._id.toString(),
        proposalNumber: proposal.proposalNumber,
        roomName: room.name || roomName,
        roomUrl: room.url,
      },
    });
  } catch (error) {
    console.error('Erro ao criar/obter sala Daily:', error?.message || error);
    return res.status(error?.status || 500).json({
      success: false,
      message:
        error?.message ||
        'Não foi possível criar a sala de videochamada no momento. Verifique a configuração do Daily.co.',
    });
  }
});

module.exports = router;
