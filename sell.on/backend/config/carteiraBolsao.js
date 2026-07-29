/**
 * Regra de bolsão da carteira de clientes.
 * - 90 dias sem proposta → cai no bolsão
 * - Se tiver venda fechada → permanece na carteira do vendedor
 */
module.exports = {
  /** Dias sem proposta para liberar o cliente ao bolsão */
  BOLSAO_INACTIVE_DAYS: 90,
};
