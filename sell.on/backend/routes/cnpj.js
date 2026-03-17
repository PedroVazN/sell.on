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

function defaultHeaders() {
  return {
    Accept: 'application/json',
    'User-Agent': 'SellOnCRM/1.0 (+https://sellon.vercel.app)',
  };
}

async function fetchBrasilApi(cnpj) {
  const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
  const response = await fetch(url, { headers: defaultHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `BrasilAPI HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return {
    cnpj: data.cnpj || cnpj,
    razao_social: data.razao_social || '',
    nome_fantasia: data.nome_fantasia || '',
    descricao_situacao_cadastral: data.descricao_situacao_cadastral || '',
    data_situacao_cadastral: data.data_situacao_cadastral || '',
    cnae_fiscal_descricao: data.cnae_fiscal_descricao || '',
    ddd_telefone_1: data.ddd_telefone_1 || '',
    email: data.email || '',
    logradouro: data.logradouro || '',
    numero: data.numero || '',
    bairro: data.bairro || '',
    municipio: data.municipio || '',
    uf: data.uf || '',
    cep: data.cep || '',
    __source: 'brasilapi',
  };
}

async function fetchPublicaCnpjWs(cnpj) {
  const url = `https://publica.cnpj.ws/cnpj/${cnpj}`;
  const response = await fetch(url, { headers: defaultHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `publica.cnpj.ws HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const est = data?.estabelecimento || {};
  const cidade = est?.cidade?.nome || '';
  const estado = est?.estado?.sigla || '';
  const tipoLogradouro = est?.tipo_logradouro || '';
  const logradouroBase = est?.logradouro || '';

  return {
    cnpj: data?.cnpj || cnpj,
    razao_social: data?.razao_social || '',
    nome_fantasia: est?.nome_fantasia || '',
    descricao_situacao_cadastral: est?.situacao_cadastral || '',
    data_situacao_cadastral: est?.data_situacao_cadastral || '',
    cnae_fiscal_descricao: est?.atividade_principal?.descricao || '',
    ddd_telefone_1: est?.telefone1 || est?.telefone2 || '',
    email: est?.email || '',
    logradouro: `${tipoLogradouro} ${logradouroBase}`.trim(),
    numero: est?.numero || '',
    bairro: est?.bairro || '',
    municipio: cidade,
    uf: estado,
    cep: est?.cep || '',
    __source: 'publica.cnpj.ws',
  };
}

async function fetchCnpjWithFallback(cnpj) {
  const errors = [];
  const providers = [fetchBrasilApi, fetchPublicaCnpjWs];

  for (const provider of providers) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await provider(cnpj);
    } catch (error) {
      errors.push(error?.message || 'erro desconhecido');
    }
  }

  const err = new Error(`Falha em todos os provedores de CNPJ: ${errors.join(' | ')}`);
  err.status = 502;
  throw err;
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

    const data = await fetchCnpjWithFallback(cnpj);

    const risk = buildRiskAnalysis(data);

    return res.json({
      success: true,
      source: data.__source || 'unknown',
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
    return res.status(error?.status || 500).json({
      success: false,
      message: 'Não foi possível consultar o CNPJ no momento.',
    });
  }
});

module.exports = router;
