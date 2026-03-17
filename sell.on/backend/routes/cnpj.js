const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCnpj(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return digits;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function buildRiskAnalysis(payload) {
  const situacao = String(payload?.descricao_situacao_cadastral || '').toLowerCase();
  const blockedByStatus =
    situacao.includes('inapta') ||
    situacao.includes('baixada') ||
    situacao.includes('suspensa') ||
    situacao.includes('nula');

  const inconsistencies = [];
  if (!payload?.razao_social) inconsistencies.push('Razão social ausente');
  if (!payload?.uf || !payload?.municipio) inconsistencies.push('Endereço incompleto');
  if (!payload?.ddd_telefone_1 && !payload?.email) inconsistencies.push('Sem telefone e sem email');
  if (!payload?.descricao_situacao_cadastral) inconsistencies.push('Situação cadastral ausente');

  const hasInconsistency = inconsistencies.length > 0;

  if (blockedByStatus) {
    return {
      level: 'alto',
      blocked: true,
      status: 'bloqueado',
      reason: `CNPJ com situação cadastral "${payload?.descricao_situacao_cadastral || 'desconhecida'}"`,
      inconsistencies,
    };
  }

  if (hasInconsistency) {
    return {
      level: 'medio',
      blocked: false,
      status: 'alerta',
      reason: 'CNPJ ativo, porém com inconsistências nos dados',
      inconsistencies,
    };
  }

  return {
    level: 'baixo',
    blocked: false,
    status: 'ok',
    reason: 'CNPJ ativo e sem inconsistências relevantes',
    inconsistencies,
  };
}

// GET /api/cnpj/:cnpj - Consulta CNPJ e valida risco
router.get('/:cnpj', auth, async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    if (cnpj.length !== 14) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido. Informe 14 dígitos.',
      });
    }

    const externalUrl = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
    const response = await fetch(externalUrl);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || 'Não foi possível consultar o CNPJ no momento.',
      });
    }

    const risk = buildRiskAnalysis(data);

    return res.json({
      success: true,
      data: {
        cnpj: formatCnpj(data.cnpj || cnpj),
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        situacaoCadastral: data.descricao_situacao_cadastral || '',
        dataSituacaoCadastral: data.data_situacao_cadastral || '',
        cnaePrincipal: data.cnae_fiscal_descricao || '',
        telefone: data.ddd_telefone_1 || '',
        email: data.email || '',
        endereco: {
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          cep: data.cep || '',
        },
        risk,
      },
    });
  } catch (error) {
    console.error('Erro na consulta de CNPJ:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar CNPJ',
    });
  }
});

module.exports = router;
