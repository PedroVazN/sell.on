const Client = require('../models/Client');
const Proposal = require('../models/Proposal');
const { BOLSAO_INACTIVE_DAYS } = require('../config/carteiraBolsao');

function normalizeCnpj(cnpj) {
  if (!cnpj) return '';
  return String(cnpj).replace(/\D/g, '');
}

function getInactiveDays() {
  const fromEnv = parseInt(process.env.BOLSAO_INACTIVE_DAYS, 10);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return BOLSAO_INACTIVE_DAYS;
}

/**
 * Atualiza a carteira atual:
 * - Cliente com venda_fechada permanece com o vendedor
 * - Cliente há 90+ dias sem proposta cai no bolsão (assignedTo=null, inBolsao=true)
 */
async function runCarteiraBolsaoUpdate({ dryRun = false } = {}) {
  const inactiveDays = getInactiveDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - inactiveDays);

  const clients = await Client.find({
    assignedTo: { $ne: null },
    inBolsao: { $ne: true },
    isActive: { $ne: false },
  })
    .select('_id cnpj razaoSocial assignedTo createdAt')
    .lean();

  if (!clients.length) {
    return {
      inactiveDays,
      cutoff: cutoff.toISOString(),
      scanned: 0,
      released: 0,
      keptWithSale: 0,
      keptActive: 0,
      dryRun,
      releasedClients: [],
    };
  }

  const proposals = await Proposal.find({})
    .select('client.cnpj status createdAt closedAt seller._id')
    .lean();

  const byCnpj = new Map();
  for (const p of proposals) {
    const cnpj = normalizeCnpj(p.client?.cnpj);
    if (!cnpj || cnpj.length !== 14) continue;
    if (!byCnpj.has(cnpj)) {
      byCnpj.set(cnpj, { hasSale: false, lastProposalAt: null });
    }
    const entry = byCnpj.get(cnpj);
    if (p.status === 'venda_fechada') {
      entry.hasSale = true;
    }
    const when = p.closedAt || p.createdAt;
    if (when) {
      const d = new Date(when);
      if (!entry.lastProposalAt || d > entry.lastProposalAt) {
        entry.lastProposalAt = d;
      }
    }
  }

  const toRelease = [];
  let keptWithSale = 0;
  let keptActive = 0;

  for (const client of clients) {
    const cnpj = normalizeCnpj(client.cnpj);
    const stats = byCnpj.get(cnpj);

    if (stats?.hasSale) {
      keptWithSale += 1;
      continue;
    }

    const lastActivity = stats?.lastProposalAt || (client.createdAt ? new Date(client.createdAt) : null);
    if (lastActivity && lastActivity >= cutoff) {
      keptActive += 1;
      continue;
    }

    toRelease.push({
      _id: client._id,
      cnpj: client.cnpj,
      razaoSocial: client.razaoSocial,
      assignedTo: client.assignedTo,
      lastActivity: lastActivity ? lastActivity.toISOString() : null,
    });
  }

  if (!dryRun && toRelease.length) {
    const ids = toRelease.map((c) => c._id);
    await Client.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          assignedTo: null,
          inBolsao: true,
          bolsaoAt: new Date(),
          bolsaoReason: `${inactiveDays} dias sem proposta`,
        },
      }
    );
  }

  console.log(
    `✅ Carteira bolsão: scanned=${clients.length} released=${toRelease.length} keptSale=${keptWithSale} keptActive=${keptActive} dryRun=${dryRun}`
  );

  return {
    inactiveDays,
    cutoff: cutoff.toISOString(),
    scanned: clients.length,
    released: toRelease.length,
    keptWithSale,
    keptActive,
    dryRun,
    releasedClients: toRelease.slice(0, 100),
  };
}

/**
 * Ao atribuir cliente a um vendedor, sai do bolsão.
 */
function assignmentClearBolsaoFields() {
  return {
    inBolsao: false,
    bolsaoAt: null,
    bolsaoReason: null,
  };
}

module.exports = {
  runCarteiraBolsaoUpdate,
  assignmentClearBolsaoFields,
  normalizeCnpj,
  getInactiveDays,
};
