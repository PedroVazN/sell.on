/**
 * Follow-up automático de propostas em negociação.
 * Valores padrão aqui — não precisa .env em desenvolvimento.
 * Na Vercel, PROPOSAL_FOLLOWUP_DAYS e CRON_SECRET (se definidos) sobrescrevem estes.
 */
module.exports = {
  /** Dias em "negociação" antes de criar tarefa + notificação */
  DEFAULT_FOLLOWUP_DAYS: 7,

  /**
   * Segredo do cron GET /api/cron/proposal-followup
   * Altere este valor no código ou use CRON_SECRET na Vercel (recomendado em produção).
   */
  DEFAULT_CRON_SECRET: 'sellon-followup-cron-v1',
};
