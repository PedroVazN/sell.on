const express = require('express');
const router = express.Router();
const { runProposalFollowUpScan } = require('../services/proposalFollowUp');
const { DEFAULT_CRON_SECRET } = require('../config/followUp');

function getCronSecret() {
  return process.env.CRON_SECRET || DEFAULT_CRON_SECRET;
}

function verifyCronSecret(req) {
  // Vercel Cron envia este header automaticamente (não precisa CRON_SECRET na Vercel)
  if (req.headers['x-vercel-cron'] === '1') return true;

  const secret = getCronSecret();
  const header = req.headers['x-cron-secret'] || req.headers.authorization;
  if (!header) return false;
  const token = String(header).replace(/^Bearer\s+/i, '').trim();
  return token === secret;
}

// GET /api/cron/proposal-followup — Vercel Cron ou agendador externo
router.get('/proposal-followup', async (req, res) => {
  if (!verifyCronSecret(req)) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  try {
    const result = await runProposalFollowUpScan();
    console.log('✅ Cron proposal-followup:', result);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Cron proposal-followup:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
