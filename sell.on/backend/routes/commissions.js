const express = require('express');
const ExcelJS = require('exceljs');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { proposalAttachmentUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/security');
const Proposal = require('../models/Proposal');
const ProposalCommission = require('../models/ProposalCommission');
const User = require('../models/User');
const {
  isCloudinaryConfigured,
  uploadCommissionAttachment,
  deleteCloudinaryAsset,
} = require('../services/cloudinary');

const MAX_ATTACHMENTS = 2;

const VALIDATION_LABELS = {
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
};

function getMonthRange(monthStr) {
  // monthStr no formato YYYY-MM; se vazio usa mês atual (BRT)
  let year;
  let month;
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    const [y, m] = monthStr.split('-').map(Number);
    year = y;
    month = m - 1;
  } else {
    const now = new Date();
    year = now.getUTCFullYear();
    month = now.getUTCMonth();
  }
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return { start, end, year, month: month + 1 };
}

function getSellerIdFromProposal(p) {
  const s = p.seller;
  if (s && (s._id || s.id)) return String(s._id || s.id);
  const cb = p.createdBy;
  if (cb) return String(cb._id || cb);
  return null;
}

function userCanSeeRow(req, proposal) {
  if (req.user.role === 'admin' || req.user.role === 'analista') return true;
  if (req.user.role !== 'vendedor') return false;
  const sellerId = getSellerIdFromProposal(proposal);
  const userId = String(req.user._id);
  return sellerId === userId;
}

function userCanEditRow(req, proposal) {
  if (req.user.role === 'admin') return true;
  if (req.user.role !== 'vendedor') return false;
  const sellerId = getSellerIdFromProposal(proposal);
  return sellerId === String(req.user._id);
}

function clientName(p) {
  const c = p.client || {};
  return c.razaoSocial || c.company || c.name || '—';
}

function distributorName(p) {
  const d = p.distributor || {};
  return d.apelido || d.razaoSocial || d.name || '—';
}

function sellerInfo(p) {
  const s = p.seller || {};
  return {
    _id: s._id || (p.createdBy && (p.createdBy._id || p.createdBy)) || null,
    name: s.name || p.createdBy?.name || '—',
    email: s.email || p.createdBy?.email || '',
  };
}

function mapAttachment(att) {
  const obj = att.toObject ? att.toObject() : att;
  return obj;
}

function mapRow(p, commission, isAdmin, userId) {
  const sellerId = getSellerIdFromProposal(p);
  const canEdit =
    isAdmin || (userId && sellerId && String(sellerId) === String(userId));
  return {
    proposalId: String(p._id),
    proposalNumber: p.proposalNumber,
    closedAt: p.closedAt || p.updatedAt,
    total: p.total,
    seller: sellerInfo(p),
    distributor: { name: distributorName(p), raw: p.distributor || null },
    client: { name: clientName(p), raw: p.client || null },
    commission: commission
      ? {
          _id: String(commission._id),
          nfNumber: commission.nfNumber || '',
          attachments: (commission.attachments || []).map(mapAttachment),
          validationStatus: commission.validationStatus,
          validationLabel: VALIDATION_LABELS[commission.validationStatus],
          validatedAt: commission.validatedAt,
          validatedBy: commission.validatedBy
            ? {
                _id: String(commission.validatedBy._id || commission.validatedBy),
                name: commission.validatedBy.name,
                email: commission.validatedBy.email,
              }
            : null,
          validationNotes: commission.validationNotes || '',
          updatedAt: commission.updatedAt,
        }
      : {
          nfNumber: '',
          attachments: [],
          validationStatus: 'em_analise',
          validationLabel: VALIDATION_LABELS.em_analise,
          validatedAt: null,
          validatedBy: null,
          validationNotes: '',
        },
    canEdit,
  };
}

async function loadProposalAndCheck(req, res, options = {}) {
  const proposal = await Proposal.findById(req.params.proposalId)
    .populate('createdBy', 'name email')
    .lean();
  if (!proposal) {
    res.status(404).json({ success: false, message: 'Proposta não encontrada' });
    return null;
  }
  if (proposal.status !== 'venda_fechada') {
    res.status(400).json({
      success: false,
      message: 'Comissões só se aplicam a propostas ganhas (venda_fechada)',
    });
    return null;
  }
  if (options.write && !userCanEditRow(req, proposal)) {
    res.status(403).json({ success: false, message: 'Sem permissão para editar esta comissão' });
    return null;
  }
  if (!options.write && !userCanSeeRow(req, proposal)) {
    res.status(403).json({ success: false, message: 'Sem permissão para esta proposta' });
    return null;
  }
  return proposal;
}

// GET /api/commissions?month=YYYY-MM
router.get('/', auth, authorize('admin', 'vendedor', 'analista'), async (req, res) => {
  try {
    const { start, end, year, month } = getMonthRange(req.query.month);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'analista';

    const proposalFilter = {
      status: 'venda_fechada',
      $or: [
        { closedAt: { $gte: start, $lte: end } },
        {
          closedAt: { $exists: false },
          updatedAt: { $gte: start, $lte: end },
        },
      ],
    };

    if (!isAdmin) {
      proposalFilter.$and = [
        {
          $or: [
            { 'seller._id': String(req.user._id) },
            { createdBy: req.user._id },
          ],
        },
      ];
    }

    const proposals = await Proposal.find(proposalFilter)
      .populate('createdBy', 'name email')
      .sort({ closedAt: -1, updatedAt: -1 })
      .lean();

    const proposalIds = proposals.map((p) => p._id);
    const commissions = await ProposalCommission.find({
      proposal: { $in: proposalIds },
    })
      .populate('validatedBy', 'name email')
      .lean();
    const commissionMap = new Map(
      commissions.map((c) => [String(c.proposal), c])
    );

    const data = proposals.map((p) =>
      mapRow(p, commissionMap.get(String(p._id)), isAdmin, req.user._id)
    );

    const totals = data.reduce(
      (acc, row) => {
        acc.value += Number(row.total) || 0;
        acc.proposals += 1;
        acc.byStatus[row.commission.validationStatus] =
          (acc.byStatus[row.commission.validationStatus] || 0) + 1;
        return acc;
      },
      { value: 0, proposals: 0, byStatus: {} }
    );

    res.json({
      success: true,
      data,
      meta: {
        month: `${year}-${String(month).padStart(2, '0')}`,
        isAdmin,
        canValidate: req.user.role === 'admin',
        cloudinaryConfigured: isCloudinaryConfigured(),
        maxAttachments: MAX_ATTACHMENTS,
        totals,
      },
    });
  } catch (err) {
    console.error('Erro ao listar comissões:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar comissões' });
  }
});

// PUT /api/commissions/:proposalId  (atualiza número da NF)
router.put('/:proposalId', auth, authorize('admin', 'vendedor'), async (req, res) => {
  try {
    const proposal = await loadProposalAndCheck(req, res, { write: true });
    if (!proposal) return;

    const nfNumber = String(req.body.nfNumber || '').trim().slice(0, 80);

    const commission = await ProposalCommission.findOneAndUpdate(
      { proposal: proposal._id },
      {
        $set: {
          nfNumber,
          updatedByVendedor:
            req.user.role === 'vendedor' ? req.user._id : undefined,
        },
        $setOnInsert: { proposal: proposal._id },
      },
      { new: true, upsert: true }
    ).populate('validatedBy', 'name email');

    const isAdmin = req.user.role === 'admin' || req.user.role === 'analista';
    res.json({
      success: true,
      data: mapRow(proposal, commission, isAdmin, req.user._id),
    });
  } catch (err) {
    console.error('Erro ao atualizar NF:', err);
    res.status(500).json({ success: false, message: err.message || 'Erro ao atualizar NF' });
  }
});

// POST /api/commissions/:proposalId/attachments  (upload de NF/comprovante)
router.post(
  '/:proposalId/attachments',
  auth,
  authorize('admin', 'vendedor'),
  uploadLimiter,
  async (req, res, next) => {
    const proposal = await loadProposalAndCheck(req, res, { write: true });
    if (!proposal) return;
    req.proposal = proposal;

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Upload indisponível: configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET na Vercel.',
      });
    }
    proposalAttachmentUpload.single('file')(req, res, (err) => {
      if (err) {
        const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(code).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Arquivo é obrigatório (campo file)' });
      }

      const existing = await ProposalCommission.findOne({ proposal: req.proposal._id });
      const current = existing?.attachments?.length || 0;
      if (current >= MAX_ATTACHMENTS) {
        return res.status(400).json({
          success: false,
          message: `Limite de ${MAX_ATTACHMENTS} anexos por proposta atingido`,
        });
      }

      const uploadResult = await uploadCommissionAttachment(req.file.buffer, {
        proposalId: String(req.proposal._id),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });

      const resourceType =
        uploadResult.resource_type === 'image'
          ? 'image'
          : uploadResult.resource_type === 'video'
            ? 'video'
            : 'raw';

      const attachment = {
        fileName: req.file.originalname,
        url: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        mimeType: req.file.mimetype,
        size: req.file.size,
        resourceType,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      };

      const commission = await ProposalCommission.findOneAndUpdate(
        { proposal: req.proposal._id },
        {
          $push: { attachments: attachment },
          $setOnInsert: { proposal: req.proposal._id },
          $set:
            req.user.role === 'vendedor'
              ? { updatedByVendedor: req.user._id }
              : {},
        },
        { new: true, upsert: true }
      ).populate('validatedBy', 'name email');

      const isAdmin = req.user.role === 'admin' || req.user.role === 'analista';
      res.status(201).json({
        success: true,
        data: mapRow(req.proposal, commission, isAdmin, req.user._id),
      });
    } catch (err) {
      console.error('Erro ao enviar anexo de comissão:', err);
      res.status(500).json({ success: false, message: err.message || 'Erro ao enviar anexo' });
    }
  }
);

// DELETE /api/commissions/:proposalId/attachments/:attachmentId
router.delete(
  '/:proposalId/attachments/:attachmentId',
  auth,
  authorize('admin', 'vendedor'),
  async (req, res) => {
    try {
      const proposal = await loadProposalAndCheck(req, res, { write: true });
      if (!proposal) return;

      const commission = await ProposalCommission.findOne({ proposal: proposal._id });
      if (!commission) {
        return res.status(404).json({ success: false, message: 'Comissão não encontrada' });
      }

      const attachment = commission.attachments.id(req.params.attachmentId);
      if (!attachment) {
        return res.status(404).json({ success: false, message: 'Anexo não encontrado' });
      }

      const isAdmin = req.user.role === 'admin';
      const isUploader =
        attachment.uploadedBy &&
        String(attachment.uploadedBy) === String(req.user._id);
      if (!isAdmin && !isUploader) {
        return res.status(403).json({ success: false, message: 'Sem permissão para excluir este anexo' });
      }

      if (isCloudinaryConfigured()) {
        try {
          await deleteCloudinaryAsset(
            attachment.cloudinaryPublicId,
            attachment.resourceType
          );
        } catch (cloudErr) {
          console.warn('Cloudinary delete falhou (continua removendo do banco):', cloudErr.message);
        }
      }

      attachment.deleteOne();
      await commission.save();
      await commission.populate('validatedBy', 'name email');

      res.json({
        success: true,
        data: mapRow(proposal, commission, isAdmin || req.user.role === 'analista', req.user._id),
      });
    } catch (err) {
      console.error('Erro ao excluir anexo de comissão:', err);
      res.status(500).json({ success: false, message: 'Erro ao excluir anexo' });
    }
  }
);

// PATCH /api/commissions/:proposalId/validate  (admin)
router.patch(
  '/:proposalId/validate',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const proposal = await loadProposalAndCheck(req, res);
      if (!proposal) return;

      const status = req.body.validationStatus;
      if (!['em_analise', 'aprovado', 'reprovado'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'validationStatus deve ser em_analise, aprovado ou reprovado',
        });
      }

      const notes = String(req.body.validationNotes || '').trim().slice(0, 500);

      const update = {
        validationStatus: status,
        validationNotes: notes,
        validatedBy: status === 'em_analise' ? null : req.user._id,
        validatedAt: status === 'em_analise' ? null : new Date(),
      };

      const commission = await ProposalCommission.findOneAndUpdate(
        { proposal: proposal._id },
        { $set: update, $setOnInsert: { proposal: proposal._id } },
        { new: true, upsert: true }
      ).populate('validatedBy', 'name email');

      res.json({
        success: true,
        data: mapRow(proposal, commission, true, req.user._id),
      });
    } catch (err) {
      console.error('Erro ao validar comissão:', err);
      res.status(500).json({ success: false, message: err.message || 'Erro ao validar comissão' });
    }
  }
);

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function loadCommissionRowsForExport(monthRange) {
  const { start, end } = monthRange;
  const proposals = await Proposal.find({
    status: 'venda_fechada',
    $or: [
      { closedAt: { $gte: start, $lte: end } },
      {
        closedAt: { $exists: false },
        updatedAt: { $gte: start, $lte: end },
      },
    ],
  })
    .populate('createdBy', 'name email')
    .sort({ closedAt: -1, updatedAt: -1 })
    .lean();

  const commissions = await ProposalCommission.find({
    proposal: { $in: proposals.map((p) => p._id) },
  })
    .populate('validatedBy', 'name email')
    .lean();
  const commissionMap = new Map(commissions.map((c) => [String(c.proposal), c]));

  return proposals.map((p) => {
    const c = commissionMap.get(String(p._id));
    const seller = sellerInfo(p);
    const attachments = c?.attachments || [];
    const closed = p.closedAt || p.updatedAt;
    return {
      proposalNumber: p.proposalNumber || '',
      closedAt: closed ? new Date(closed) : null,
      sellerName: seller.name,
      sellerEmail: seller.email,
      distributor: distributorName(p),
      client: clientName(p),
      total: Number(p.total) || 0,
      nfNumber: c?.nfNumber || '',
      attachment1: attachments[0]?.url || '',
      attachment1Name: attachments[0]?.fileName || '',
      attachment2: attachments[1]?.url || '',
      attachment2Name: attachments[1]?.fileName || '',
      status: c?.validationStatus
        ? VALIDATION_LABELS[c.validationStatus]
        : VALIDATION_LABELS.em_analise,
      validatedBy: c?.validatedBy?.name || '',
      validatedAt: c?.validatedAt ? new Date(c.validatedAt) : null,
      notes: c?.validationNotes || '',
    };
  });
}

// GET /api/commissions/export.xlsx?month=YYYY-MM  (admin) — Excel real (.xlsx)
router.get('/export.xlsx', auth, authorize('admin'), async (req, res) => {
  try {
    const range = getMonthRange(req.query.month);
    const rows = await loadCommissionRowsForExport(range);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Sell.On';
    wb.created = new Date();

    const ws = wb.addWorksheet('Comissões', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.columns = [
      { header: 'Proposta', key: 'proposalNumber', width: 14 },
      { header: 'Fechada em', key: 'closedAt', width: 18 },
      { header: 'Vendedor', key: 'sellerName', width: 26 },
      { header: 'Email vendedor', key: 'sellerEmail', width: 30 },
      { header: 'Distribuidor', key: 'distributor', width: 26 },
      { header: 'Cliente', key: 'client', width: 32 },
      { header: 'Valor (R$)', key: 'total', width: 14 },
      { header: 'NF', key: 'nfNumber', width: 18 },
      { header: 'Anexo 1', key: 'attachment1', width: 40 },
      { header: 'Anexo 2', key: 'attachment2', width: 40 },
      { header: 'Status validação', key: 'status', width: 18 },
      { header: 'Validado por', key: 'validatedBy', width: 26 },
      { header: 'Validado em', key: 'validatedAt', width: 18 },
      { header: 'Observações', key: 'notes', width: 40 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.height = 22;

    rows.forEach((r) => {
      const row = ws.addRow(r);

      if (r.attachment1) {
        row.getCell('attachment1').value = {
          text: r.attachment1Name || 'Abrir anexo 1',
          hyperlink: r.attachment1,
          tooltip: r.attachment1,
        };
        row.getCell('attachment1').font = {
          color: { argb: 'FF1D4ED8' },
          underline: true,
        };
      }
      if (r.attachment2) {
        row.getCell('attachment2').value = {
          text: r.attachment2Name || 'Abrir anexo 2',
          hyperlink: r.attachment2,
          tooltip: r.attachment2,
        };
        row.getCell('attachment2').font = {
          color: { argb: 'FF1D4ED8' },
          underline: true,
        };
      }
    });

    ws.getColumn('total').numFmt = '"R$" #,##0.00';
    ws.getColumn('closedAt').numFmt = 'dd/mm/yyyy hh:mm';
    ws.getColumn('validatedAt').numFmt = 'dd/mm/yyyy hh:mm';

    // Total no rodapé
    const lastRow = ws.rowCount + 1;
    ws.getCell(`F${lastRow}`).value = 'Total:';
    ws.getCell(`F${lastRow}`).font = { bold: true };
    ws.getCell(`F${lastRow}`).alignment = { horizontal: 'right' };
    ws.getCell(`G${lastRow}`).value = rows.reduce((acc, r) => acc + r.total, 0);
    ws.getCell(`G${lastRow}`).numFmt = '"R$" #,##0.00';
    ws.getCell(`G${lastRow}`).font = { bold: true };

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };

    const buffer = await wb.xlsx.writeBuffer();
    const filename = `comissoes-${range.year}-${String(range.month).padStart(2, '0')}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Erro ao exportar XLSX:', err);
    res.status(500).json({ success: false, message: 'Erro ao exportar Excel' });
  }
});

// GET /api/commissions/export?month=YYYY-MM  (admin) — CSV (fallback / Excel também abre)
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { start, end, year, month } = getMonthRange(req.query.month);
    const proposals = await Proposal.find({
      status: 'venda_fechada',
      $or: [
        { closedAt: { $gte: start, $lte: end } },
        {
          closedAt: { $exists: false },
          updatedAt: { $gte: start, $lte: end },
        },
      ],
    })
      .populate('createdBy', 'name email')
      .sort({ closedAt: -1, updatedAt: -1 })
      .lean();

    const commissions = await ProposalCommission.find({
      proposal: { $in: proposals.map((p) => p._id) },
    })
      .populate('validatedBy', 'name email')
      .lean();
    const commissionMap = new Map(commissions.map((c) => [String(c.proposal), c]));

    const header = [
      'Proposta',
      'Data de fechamento',
      'Vendedor',
      'Email vendedor',
      'Distribuidor',
      'Cliente',
      'Valor (R$)',
      'NF',
      'Anexo 1',
      'Anexo 2',
      'Status validação',
      'Validado por',
      'Validado em',
      'Observações',
    ];

    const lines = [header.map(csvEscape).join(';')];

    for (const p of proposals) {
      const c = commissionMap.get(String(p._id));
      const seller = sellerInfo(p);
      const attachments = c?.attachments || [];
      const closed = p.closedAt || p.updatedAt;
      lines.push(
        [
          p.proposalNumber || '',
          closed ? new Date(closed).toLocaleString('pt-BR') : '',
          seller.name,
          seller.email,
          distributorName(p),
          clientName(p),
          (Number(p.total) || 0).toFixed(2).replace('.', ','),
          c?.nfNumber || '',
          attachments[0]?.url || '',
          attachments[1]?.url || '',
          c?.validationStatus ? VALIDATION_LABELS[c.validationStatus] : VALIDATION_LABELS.em_analise,
          c?.validatedBy?.name || '',
          c?.validatedAt ? new Date(c.validatedAt).toLocaleString('pt-BR') : '',
          c?.validationNotes || '',
        ]
          .map(csvEscape)
          .join(';')
      );
    }

    const filename = `comissoes-${year}-${String(month).padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM para Excel reconhecer UTF-8
    res.send('\uFEFF' + lines.join('\r\n'));
  } catch (err) {
    console.error('Erro ao exportar comissões:', err);
    res.status(500).json({ success: false, message: 'Erro ao exportar comissões' });
  }
});

module.exports = router;
