const express = require('express');
const router = express.Router({ mergeParams: true });
const { auth } = require('../middleware/auth');
const { loadProposalWithAccess, requireProposalUpload } = require('../middleware/proposalAccess');
const { proposalAttachmentUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/security');
const ProposalAttachment = require('../models/ProposalAttachment');
const {
  isCloudinaryConfigured,
  uploadProposalAttachment,
  deleteCloudinaryAsset,
} = require('../services/cloudinary');

const MAX_ATTACHMENTS_PER_PROPOSAL = 30;

const CATEGORY_LABELS = {
  nf: 'Nota fiscal',
  contrato: 'Contrato',
  catalogo: 'Catálogo',
  planilha: 'Planilha',
  imagem: 'Imagem',
  outro: 'Outro',
};

function mapAttachment(doc) {
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    ...a,
    categoryLabel: CATEGORY_LABELS[a.category] || a.category,
    uploadedBy: a.uploadedBy
      ? {
          _id: a.uploadedBy._id,
          name: a.uploadedBy.name,
          email: a.uploadedBy.email,
          role: a.uploadedBy.role,
        }
      : a.uploadedBy,
  };
}

// GET /api/proposals/:proposalId/attachments
router.get('/', auth, loadProposalWithAccess, async (req, res) => {
  try {
    const list = await ProposalAttachment.find({ proposal: req.params.proposalId })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: list.map((a) => ({
        ...a,
        categoryLabel: CATEGORY_LABELS[a.category] || a.category,
      })),
      meta: {
        canUpload: req.proposalAccess.canUpload,
        canDeleteAny: req.proposalAccess.canDeleteAny,
      },
    });
  } catch (err) {
    console.error('Erro ao listar anexos:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar anexos' });
  }
});

// POST /api/proposals/:proposalId/attachments
router.post(
  '/',
  auth,
  uploadLimiter,
  loadProposalWithAccess,
  requireProposalUpload,
  (req, res, next) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Upload indisponível: configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET na Vercel.',
      });
    }
    proposalAttachmentUpload.single('file')(req, res, (err) => {
      if (err) {
        const msg = err.message || 'Erro no upload';
        const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(code).json({ success: false, message: msg });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Arquivo é obrigatório (campo file)' });
      }

      const count = await ProposalAttachment.countDocuments({ proposal: req.params.proposalId });
      if (count >= MAX_ATTACHMENTS_PER_PROPOSAL) {
        return res.status(400).json({
          success: false,
          message: `Limite de ${MAX_ATTACHMENTS_PER_PROPOSAL} anexos por proposta atingido`,
        });
      }

      const category = ['nf', 'contrato', 'catalogo', 'planilha', 'imagem', 'outro'].includes(
        req.body.category
      )
        ? req.body.category
        : 'outro';
      const description = (req.body.description || '').trim().slice(0, 500);

      const uploadResult = await uploadProposalAttachment(req.file.buffer, {
        proposalId: req.params.proposalId,
        originalName: req.file.originalname,
      });

      const resourceType =
        uploadResult.resource_type === 'image'
          ? 'image'
          : uploadResult.resource_type === 'video'
            ? 'video'
            : 'raw';

      const attachment = await ProposalAttachment.create({
        proposal: req.params.proposalId,
        category,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        resourceType,
        format: uploadResult.format,
        description: description || undefined,
        uploadedBy: req.user._id,
      });

      const populated = await ProposalAttachment.findById(attachment._id).populate(
        'uploadedBy',
        'name email role'
      );

      res.status(201).json({
        success: true,
        data: mapAttachment(populated),
        message: 'Anexo enviado com sucesso',
      });
    } catch (err) {
      console.error('Erro ao enviar anexo:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Erro ao enviar anexo',
      });
    }
  }
);

// DELETE /api/proposals/:proposalId/attachments/:attachmentId
router.delete('/:attachmentId', auth, loadProposalWithAccess, async (req, res) => {
  try {
    const attachment = await ProposalAttachment.findOne({
      _id: req.params.attachmentId,
      proposal: req.params.proposalId,
    });

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Anexo não encontrado' });
    }

    const isUploader = attachment.uploadedBy.toString() === req.user._id.toString();
    const canDelete =
      req.proposalAccess.canDeleteAny ||
      (req.proposalAccess.canUpload && isUploader);

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'Sem permissão para excluir este anexo' });
    }

    if (isCloudinaryConfigured()) {
      try {
        await deleteCloudinaryAsset(attachment.cloudinaryPublicId, attachment.resourceType);
      } catch (cloudErr) {
        console.warn('Cloudinary delete falhou (continua removendo do banco):', cloudErr.message);
      }
    }

    await attachment.deleteOne();

    res.json({ success: true, message: 'Anexo removido' });
  } catch (err) {
    console.error('Erro ao excluir anexo:', err);
    res.status(500).json({ success: false, message: 'Erro ao excluir anexo' });
  }
});

module.exports = router;
