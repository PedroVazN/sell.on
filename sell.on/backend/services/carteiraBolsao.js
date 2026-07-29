const Client = require('../models/Client');
const Proposal = require('../models/Proposal');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { BOLSAO_INACTIVE_DAYS } = require('../config/carteiraBolsao');

const REASON_NO_CARTEIRA = 'Sem carteira';

function normalizeCnpj(cnpj) {
  if (!cnpj) return '';
  return String(cnpj).replace(/\D/g, '');
}

function normalizeText(value) {
  if (!value) return '';
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function getInactiveDays() {
  const fromEnv = parseInt(process.env.BOLSAO_INACTIVE_DAYS, 10);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return BOLSAO_INACTIVE_DAYS;
}

function toId(value) {
  if (!value) return null;
  const raw = value._id || value;
  return raw ? raw.toString() : null;
}

function newStats() {
  return { hasSale: false, lastActivityAt: null, totalProposals: 0 };
}

function trackActivity(entry, when, isSale, countProposal) {
  if (isSale) entry.hasSale = true;
  if (countProposal) entry.totalProposals += 1;
  if (!when) return;
  const date = new Date(when);
  if (Number.isNaN(date.getTime())) return;
  if (!entry.lastActivityAt || date > entry.lastActivityAt) {
    entry.lastActivityAt = date;
  }
}

function mergeStats(target, source) {
  if (!source) return target;
  if (source.hasSale) target.hasSale = true;
  // Uma mesma proposta pode estar indexada por CNPJ, e-mail e razão social,
  // então usamos o maior valor em vez de somar para não contar duplicado.
  if (source.totalProposals > target.totalProposals) {
    target.totalProposals = source.totalProposals;
  }
  if (
    source.lastActivityAt
    && (!target.lastActivityAt || source.lastActivityAt > target.lastActivityAt)
  ) {
    target.lastActivityAt = source.lastActivityAt;
  }
  return target;
}

/**
 * Histórico por cliente. A proposta guarda o cliente como snapshot e o CNPJ é
 * opcional, então cruzamos por CNPJ, e-mail e razão social para não perder venda.
 */
async function buildActivityIndex() {
  const byCnpj = new Map();
  const byEmail = new Map();
  const byRazao = new Map();
  const byClientId = new Map();

  const indexInto = (map, key, when, isSale, countProposal = false) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, newStats());
    trackActivity(map.get(key), when, isSale, countProposal);
  };

  const proposals = await Proposal.find({})
    .select('client.cnpj client.email client.razaoSocial client.company status createdAt updatedAt closedAt')
    .lean();

  for (const p of proposals) {
    const isSale = p.status === 'venda_fechada';
    const when = p.closedAt || p.updatedAt || p.createdAt;
    const cnpj = normalizeCnpj(p.client?.cnpj);

    if (cnpj.length === 14) indexInto(byCnpj, cnpj, when, isSale, true);
    indexInto(byEmail, normalizeText(p.client?.email), when, isSale, true);
    indexInto(byRazao, normalizeText(p.client?.razaoSocial), when, isSale, true);
    indexInto(byRazao, normalizeText(p.client?.company), when, isSale, true);
  }

  // Funil: a oportunidade referencia o cliente por id, o vínculo mais confiável
  const opportunities = await Opportunity.find({ isDeleted: { $ne: true } })
    .select('client status createdAt updatedAt')
    .lean();

  for (const o of opportunities) {
    indexInto(byClientId, toId(o.client), o.updatedAt || o.createdAt, o.status === 'won');
  }

  return { byCnpj, byEmail, byRazao, byClientId };
}

function statsForClient(client, index) {
  const stats = newStats();
  mergeStats(stats, index.byCnpj.get(normalizeCnpj(client.cnpj)));
  mergeStats(stats, index.byEmail.get(normalizeText(client.contato?.email)));
  mergeStats(stats, index.byRazao.get(normalizeText(client.razaoSocial)));
  mergeStats(stats, index.byRazao.get(normalizeText(client.nomeFantasia)));
  mergeStats(stats, index.byClientId.get(client._id.toString()));
  return stats;
}

/**
 * Atualiza a carteira atual (idempotente):
 * - Venda fechada ou proposta recente → permanece com o vendedor
 * - 90 dias sem proposta → bolsão
 * - Sem vendedor responsável → bolsão
 * - Cliente no bolsão que voltou a ter venda/atividade é devolvido à carteira
 */
async function runCarteiraBolsaoUpdate({ dryRun = false } = {}) {
  const inactiveDays = getInactiveDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - inactiveDays);

  const clients = await Client.find({ isActive: { $ne: false } })
    .select('_id cnpj razaoSocial nomeFantasia contato.email assignedTo createdBy inBolsao createdAt')
    .lean();

  const result = {
    inactiveDays,
    cutoff: cutoff.toISOString(),
    scanned: clients.length,
    released: 0,
    releasedNoCarteira: 0,
    releasedInactive: 0,
    restored: 0,
    regularized: 0,
    keptWithSale: 0,
    keptActive: 0,
    dryRun,
    releasedClients: [],
  };

  if (!clients.length) return result;

  const activeSellers = await User.find({ role: 'vendedor', isActive: { $ne: false } })
    .select('_id')
    .lean();
  const sellerIds = new Set(activeSellers.map((u) => u._id.toString()));

  const index = await buildActivityIndex();

  const toRelease = [];
  const toRestore = [];
  const toRegularize = [];

  for (const client of clients) {
    const assignedId = toId(client.assignedTo);
    const createdById = toId(client.createdBy);

    // Sem assignedTo, o criador só assume a carteira se ainda for vendedor ativo
    const ownerId = assignedId || (sellerIds.has(createdById) ? createdById : null);

    const stats = statsForClient(client, index);
    const lastActivity = stats.lastActivityAt
      || (client.createdAt ? new Date(client.createdAt) : null);
    const keep = stats.hasSale || (lastActivity && lastActivity >= cutoff);

    if (keep && ownerId) {
      if (stats.hasSale) result.keptWithSale += 1;
      else result.keptActive += 1;

      if (client.inBolsao) {
        // Voltou a ter venda/atividade: devolve para a carteira do responsável
        toRestore.push({ _id: client._id, ownerId });
      } else if (!assignedId) {
        // Deixa a carteira explícita para não ficar em limbo (sem assignedTo)
        toRegularize.push({ _id: client._id, ownerId });
      }
      continue;
    }

    if (client.inBolsao) continue; // já está no bolsão, nada a fazer

    toRelease.push({
      _id: client._id,
      cnpj: client.cnpj,
      razaoSocial: client.razaoSocial,
      assignedTo: assignedId,
      lastActivity: lastActivity ? lastActivity.toISOString() : null,
      reason: ownerId ? `${inactiveDays} dias sem proposta` : REASON_NO_CARTEIRA,
    });
  }

  if (!dryRun && toRelease.length) {
    const byReason = new Map();
    for (const c of toRelease) {
      if (!byReason.has(c.reason)) byReason.set(c.reason, []);
      byReason.get(c.reason).push(c._id);
    }
    const bolsaoAt = new Date();
    for (const [reason, ids] of byReason) {
      // assignedTo é preservado para saber de quem era e permitir devolução
      await Client.updateMany(
        { _id: { $in: ids } },
        { $set: { inBolsao: true, bolsaoAt, bolsaoReason: reason } }
      );
    }
  }

  if (!dryRun && toRestore.length) {
    await Client.bulkWrite(
      toRestore.map((c) => ({
        updateOne: {
          filter: { _id: c._id },
          update: {
            $set: {
              assignedTo: c.ownerId,
              inBolsao: false,
              bolsaoAt: null,
              bolsaoReason: null,
            },
          },
        },
      }))
    );
  }

  if (!dryRun && toRegularize.length) {
    await Client.bulkWrite(
      toRegularize.map((c) => ({
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { assignedTo: c.ownerId } },
        },
      }))
    );
  }

  result.released = toRelease.length;
  result.releasedNoCarteira = toRelease.filter((c) => c.reason === REASON_NO_CARTEIRA).length;
  result.releasedInactive = result.released - result.releasedNoCarteira;
  result.restored = toRestore.length;
  result.regularized = toRegularize.length;
  result.releasedClients = toRelease.slice(0, 100);

  console.log(
    `✅ Carteira bolsão: scanned=${result.scanned} released=${result.released} `
    + `(semCarteira=${result.releasedNoCarteira} inativos=${result.releasedInactive}) `
    + `restored=${result.restored} regularized=${result.regularized} `
    + `keptSale=${result.keptWithSale} keptActive=${result.keptActive} dryRun=${dryRun}`
  );

  return result;
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
  buildActivityIndex,
  statsForClient,
  normalizeCnpj,
  getInactiveDays,
};
