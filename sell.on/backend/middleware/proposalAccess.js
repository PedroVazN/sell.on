const Proposal = require('../models/Proposal');

function getProposalSellerId(proposal) {
  const s = proposal.seller;
  if (!s) return null;
  if (s._id) return s._id.toString();
  return s.toString();
}

function getProposalCreatedById(proposal) {
  const c = proposal.createdBy;
  if (!c) return null;
  if (c._id) return c._id.toString();
  return c.toString();
}

function buildProposalAccess(user, proposal) {
  const role = user.role;
  const userId = user._id.toString();
  const sellerId = getProposalSellerId(proposal);
  const createdById = getProposalCreatedById(proposal);
  const isOwner = userId === sellerId || userId === createdById;

  if (role === 'admin') {
    return { canRead: true, canUpload: true, canDeleteAny: true, isOwner: true };
  }
  if (role === 'analista') {
    return { canRead: true, canUpload: false, canDeleteAny: false, isOwner: false };
  }
  if (role === 'vendedor') {
    return {
      canRead: isOwner,
      canUpload: isOwner,
      canDeleteAny: false,
      isOwner,
    };
  }
  return { canRead: false, canUpload: false, canDeleteAny: false, isOwner: false };
}

async function loadProposalWithAccess(req, res, next) {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).lean();
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposta não encontrada' });
    }

    const access = buildProposalAccess(req.user, proposal);
    req.proposal = proposal;
    req.proposalAccess = access;

    if (!access.canRead) {
      return res.status(403).json({ success: false, message: 'Sem permissão para esta proposta' });
    }

    next();
  } catch (err) {
    console.error('proposalAccess:', err);
    res.status(500).json({ success: false, message: 'Erro ao validar acesso à proposta' });
  }
}

function requireProposalUpload(req, res, next) {
  if (!req.proposalAccess?.canUpload) {
    return res.status(403).json({ success: false, message: 'Sem permissão para enviar anexos' });
  }
  next();
}

module.exports = {
  buildProposalAccess,
  loadProposalWithAccess,
  requireProposalUpload,
};
