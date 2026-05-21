/**
 * Serviço de notificações via WhatsApp
 * Suporta múltiplas APIs: Evolution API, Twilio, etc.
 */

const axios = require('axios');

/**
 * Enviar mensagem via WhatsApp
 * @param {string} phoneNumber - Número do telefone (formato: 5564999999999 ou 64999999999)
 * @param {string} message - Mensagem a ser enviada
 * @param {object} options - Opções adicionais
 * @returns {Promise<object>} Resultado do envio
 */
async function sendWhatsAppMessage(phoneNumber, message, options = {}) {
  try {
    // Formatar número (remover caracteres especiais, garantir formato correto)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone) {
      throw new Error('Número de telefone inválido');
    }

    // Verificar qual API está configurada (Twilio é padrão para produção/Vercel)
    const whatsappProvider = process.env.WHATSAPP_PROVIDER || 'twilio';
    
    switch (whatsappProvider.toLowerCase()) {
      case 'evolution':
        return await sendViaEvolutionAPI(formattedPhone, message, options);
      case 'twilio':
        return await sendViaTwilio(formattedPhone, message, options);
      case 'wppconnect':
        return await sendViaWppConnect(formattedPhone, message, options);
      default:
        throw new Error(`Provedor WhatsApp não suportado: ${whatsappProvider}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
    throw error;
  }
}

/**
 * Formatar número de telefone para padrão internacional
 * @param {string} phone - Número original
 * @returns {string|null} Número formatado ou null se inválido
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remover caracteres especiais
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Se começar com 0, remover
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Se não começar com código do país (55 para Brasil), adicionar
  if (!cleanPhone.startsWith('55')) {
    // Assumir que é número brasileiro se tiver 9 dígitos após DDD
    if (cleanPhone.length === 11) {
      cleanPhone = '55' + cleanPhone;
    } else if (cleanPhone.length === 10) {
      cleanPhone = '55' + cleanPhone;
    } else {
      // Tentar identificar como número internacional
      return cleanPhone;
    }
  }
  
  return cleanPhone;
}

/**
 * Enviar via Evolution API (Open Source - Recomendado)
 * @param {string} phoneNumber - Número formatado
 * @param {string} message - Mensagem
 * @param {object} options - Opções
 */
async function sendViaEvolutionAPI(phoneNumber, message, options = {}) {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  const evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'default';
  
  if (!evolutionApiKey) {
    console.warn('⚠️ Evolution API Key não configurada. Pule envio WhatsApp.');
    return { success: false, error: 'API não configurada' };
  }
  
  try {
    const url = `${evolutionApiUrl}/message/sendText/${instanceName}`;
    
    const response = await axios.post(url, {
      number: phoneNumber,
      text: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });
    
    const data = response.data;
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ WhatsApp enviado via Evolution API para ${phoneNumber}`);
      return { success: true, data };
    } else {
      throw new Error(data.message || 'Erro ao enviar via Evolution API');
    }
  } catch (error) {
    console.error('❌ Erro Evolution API:', error);
    throw error;
  }
}

/**
 * Validar e normalizar número From do Twilio
 * Garante que sempre seja o sandbox padrão no modo sandbox
 */
async function normalizeTwilioFrom(fromNumber, accountSid, authToken) {
  // Número sandbox padrão do Twilio (mais comum, mas pode variar)
  const DEFAULT_SANDBOX = 'whatsapp:+14155238886';
  
  // Se não configurado, usar padrão e avisar
  if (!fromNumber || fromNumber.trim() === '') {
    console.warn('⚠️ TWILIO_WHATSAPP_FROM não configurado');
    console.warn(`   Usando sandbox padrão: ${DEFAULT_SANDBOX}`);
    console.warn('   ⚠️ Se não funcionar, descubra o número EXATO da sua conta:');
    console.warn('   1. Acesse: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    console.warn('   2. Procure por "From" ou "Sandbox Number"');
    console.warn('   3. Configure: TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXXX');
    return DEFAULT_SANDBOX;
  }
  
  // Limpar espaços
  let cleaned = fromNumber.trim();
  
  // Remover espaços entre caracteres
  cleaned = cleaned.replace(/\s/g, '');
  
  // Garantir formato whatsapp:+
  if (!cleaned.startsWith('whatsapp:')) {
    cleaned = `whatsapp:${cleaned}`;
  }
  
  // Garantir que tem o +
  if (!cleaned.includes('+')) {
    // Adicionar + após whatsapp:
    cleaned = cleaned.replace('whatsapp:', 'whatsapp:+');
  }
  
  // Extrair apenas números para validação
  const numberOnly = cleaned.replace(/whatsapp:|\+/g, '');
  
  // Sandbox Twilio costuma começar com 1415; em produção o número aprovado pode ser outro
  const isSandbox = numberOnly.startsWith('1415') && numberOnly.length === 11;
  if (!isSandbox) {
    console.warn(`⚠️ TWILIO_WHATSAPP_FROM (${fromNumber}) não parece sandbox (+1415). Usando como configurado (produção).`);
  }

  return cleaned;
}

function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getSellerName(proposal, sellerUser) {
  return (
    proposal?.seller?.name ||
    sellerUser?.name ||
    'Não informado'
  );
}

function getDistributorName(proposal) {
  const d = proposal?.distributor;
  if (!d) return 'Não informado';
  return d.apelido || d.razaoSocial || d.name || 'Não informado';
}

function getClientName(proposal) {
  const c = proposal?.client;
  if (!c) return 'Não informado';
  return c.razaoSocial || c.company || c.name || 'Não informado';
}

/**
 * Linhas de produtos: nome, quantidade e subtotal do item
 */
function formatProposalItemsLines(proposal) {
  const items = Array.isArray(proposal?.items) ? proposal.items : [];
  if (items.length === 0) {
    return '• (nenhum item na proposta)';
  }
  return items
    .map((item) => {
      const name = item.product?.name || item.productName || 'Produto';
      const qty = item.quantity ?? 0;
      const lineTotal = item.total != null ? item.total : (item.unitPrice || 0) * qty;
      return `• ${name} — ${qty} un. — ${formatCurrency(lineTotal)}`;
    })
    .join('\n');
}

/**
 * Mensagem completa de venda fechada (proposta, itens, total, distribuidor, vendedor)
 */
function buildSaleClosedMessage(proposal, sellerUser, { includeSellerLine = true } = {}) {
  const now = new Date();
  const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = now.toLocaleDateString('pt-BR');
  const closedAt = proposal.closedAt ? new Date(proposal.closedAt) : now;
  const closedDateStr = closedAt.toLocaleDateString('pt-BR');
  const closedTimeStr = closedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const lines = [
    '✅ *Venda fechada — Sell.On*',
    '',
    `📋 *Proposta:* ${proposal.proposalNumber || 'N/A'}`,
  ];

  if (includeSellerLine) {
    lines.push(`👤 *Vendedor:* ${getSellerName(proposal, sellerUser)}`);
  }

  lines.push(
    `🏢 *Distribuidor:* ${getDistributorName(proposal)}`,
    `👥 *Cliente:* ${getClientName(proposal)}`,
    '',
    '📦 *Produtos:*',
    formatProposalItemsLines(proposal),
    '',
    `💰 *Total:* ${formatCurrency(proposal.total)}`,
    `🕐 *Fechada em:* ${closedDateStr} às ${closedTimeStr}`,
    `📅 *Notificação:* ${data} às ${hora}`
  );

  return lines.join('\n');
}

/**
 * Enviar via Twilio (Pago - Profissional)
 * @param {string} phoneNumber - Número formatado
 * @param {string} message - Mensagem
 * @param {object} options - Opções
 */
async function sendViaTwilio(phoneNumber, message, options = {}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumberEnv = process.env.TWILIO_WHATSAPP_FROM;
  
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio não configurado (Account SID ou Auth Token faltando).');
    return { success: false, error: 'Twilio não configurado' };
  }
  
  // Normalizar número From (garantir que seja sandbox)
  const from = await normalizeTwilioFrom(fromNumberEnv, accountSid, authToken);
  
  console.log(`📋 Configuração Twilio:`);
  console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
  console.log(`   From (configurado): ${fromNumberEnv || '(não configurado)'}`);
  console.log(`   From (usando): ${from}`);
  
  try {
    // Twilio requer whatsapp: no número
    const toNumber = `whatsapp:+${phoneNumber}`;
    
    // VALIDAÇÃO CRÍTICA: From e To não podem ser iguais
    // Extrair apenas os números para comparação
    const fromNumberOnly = from.replace(/whatsapp:|\+|\s/g, '');
    const toNumberOnly = toNumber.replace(/whatsapp:|\+|\s/g, '');
    
    if (fromNumberOnly === toNumberOnly) {
      throw new Error(`Não é possível enviar mensagem para o mesmo número (From: ${from}, To: ${toNumber}). Verifique ADMIN_WHATSAPP_PHONE e TWILIO_WHATSAPP_FROM.`);
    }
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', from);
    params.append('To', toNumber);
    params.append('Body', message);
    
    console.log(`📤 Enviando WhatsApp via Twilio:`);
    console.log(`   De (From): ${from}`);
    console.log(`   Para (To): ${toNumber}`);
    console.log(`   Mensagem: ${message.substring(0, 50)}...`);
    
    const response = await axios.post(url, params, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const data = response.data;
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ WhatsApp enviado via Twilio para ${phoneNumber}`);
      console.log(`   Status: ${data.status}, SID: ${data.sid}`);
      return { success: true, data };
    } else {
      throw new Error(data.message || 'Erro ao enviar via Twilio');
    }
  } catch (error) {
    console.error('❌ Erro Twilio:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Código:', error.response.data.code);
      console.error('   Mensagem:', error.response.data.message);
      console.error('   From usado:', from);
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
      
      // Sugestões baseadas no erro
      if (error.response.data.code === 21211 || error.response.data.message?.includes('Channel')) {
        console.error('');
        console.error('   ⚠️⚠️⚠️ ERRO CRÍTICO: WhatsApp Sandbox não configurado ⚠️⚠️⚠️');
        console.error('');
        console.error('   📋 PASSO A PASSO OBRIGATÓRIO:');
        console.error('');
        console.error('   1️⃣ Ativar WhatsApp Sandbox no Twilio:');
        console.error('      → Acesse: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        console.error('      → Faça login na sua conta Twilio');
        console.error('      → Você DEVE ver uma página com instruções do WhatsApp Sandbox');
        console.error('');
        console.error('   2️⃣ Descobrir o número sandbox EXATO:');
        console.error('      → Na mesma página, procure por "From" ou "Sandbox Number"');
        console.error('      → Anote o número (formato: +1 415 XXX XXXX)');
        console.error('      → Exemplo: Se aparecer "+1 415 523 8886", use: whatsapp:+14155238886');
        console.error('');
        console.error('   3️⃣ Cadastrar seu número para receber mensagens:');
        console.error('      → Envie uma mensagem para o número sandbox no WhatsApp');
        console.error('      → Envie o código que aparece (ex: "join <código>")');
        console.error('      → Você receberá "You\'re all set!"');
        console.error('      → SEM ISSO, você NÃO recebe mensagens!');
        console.error('');
        console.error('   4️⃣ Configurar no .env ou Vercel:');
        console.error('      TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXXX');
        console.error('      (Substitua 1415XXXXXXXX pelo número que descobriu)');
        console.error('');
        console.error('   ⚠️ IMPORTANTE:');
        console.error('      - Números sandbox SEMPRE começam com +1415');
        console.error('      - Você NÃO pode usar seu número pessoal como "From" no sandbox');
        console.error('      - O sandbox é apenas para testes');
        console.error('      - Para produção, você precisa solicitar aprovação do número');
        console.error('');
      }
      if (error.response.data.code === 21608 || error.response.data.message?.includes('same')) {
        console.error('   💡 SOLUÇÃO: From e To não podem ser iguais. Verifique ADMIN_WHATSAPP_PHONE.');
      }
    }
    throw error;
  }
}

/**
 * Enviar via WppConnect (Não-oficial)
 * @param {string} phoneNumber - Número formatado
 * @param {string} message - Mensagem
 * @param {object} options - Opções
 */
async function sendViaWppConnect(phoneNumber, message, options = {}) {
  const wppConnectUrl = process.env.WPPCONNECT_URL || 'http://localhost:21465';
  const sessionName = process.env.WPPCONNECT_SESSION || 'default';
  
  try {
    const url = `${wppConnectUrl}/api/${sessionName}/send-message`;
    
    const response = await axios.post(url, {
      phone: phoneNumber,
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = response.data;
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ WhatsApp enviado via WppConnect para ${phoneNumber}`);
      return { success: true, data };
    } else {
      throw new Error(data.message || 'Erro ao enviar via WppConnect');
    }
  } catch (error) {
    console.error('❌ Erro WppConnect:', error);
    throw error;
  }
}

/**
 * Enviar notificação de proposta criada
 * @param {object} proposal - Dados da proposta
 * @param {object} seller - Dados do vendedor
 */
async function notifyProposalCreated(proposal, seller) {
  try {
    const promises = [];
    
    // Enviar para o vendedor (se tiver telefone)
    const sellerPhone = seller.phone || seller.contato?.telefone;
    if (sellerPhone) {
      const sellerMessage = `🎉 *Nova Proposta Criada!*

📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👤 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}
📅 Válido até: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}

Status: ${getStatusEmoji(proposal.status)} ${proposal.status === 'negociacao' ? 'Em Negociação' : proposal.status}

Acompanhe sua proposta no sistema!`;
      
      promises.push(sendWhatsAppMessage(sellerPhone, sellerMessage));
    }
    
    // Enviar para o admin/gerente (se configurado)
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (adminPhone) {
      // Validar se o número do admin não é o mesmo que o From do Twilio
      const formattedAdminPhone = formatPhoneNumber(adminPhone);
      const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      const fromNumberOnly = twilioFrom.replace(/whatsapp:|\+|\s/g, '');
      
      if (formattedAdminPhone === fromNumberOnly) {
        console.warn(`⚠️ ADMIN_WHATSAPP_PHONE (${adminPhone}) é o mesmo que TWILIO_WHATSAPP_FROM. Pulando envio para evitar erro.`);
      } else {
        const now = new Date();
        const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const data = now.toLocaleDateString('pt-BR');
        
        const adminMessage = `📢 *Nova Proposta Criada*

👤 Vendedor: ${seller.name || 'N/A'}
📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👥 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}
📅 Válido até: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}
🕐 Criada em: ${data} às ${hora}

Status: ${getStatusEmoji(proposal.status)} ${proposal.status === 'negociacao' ? 'Em Negociação' : proposal.status}`;
        
        console.log(`📱 Enviando WhatsApp para admin: ${adminPhone} (formatado: ${formattedAdminPhone})`);
        promises.push(sendWhatsAppMessage(adminPhone, adminMessage).catch(err => {
          console.error(`❌ Erro ao enviar para admin ${adminPhone}:`, err.message);
          throw err;
        }));
      }
    } else {
      console.warn('⚠️ ADMIN_WHATSAPP_PHONE não configurado - admin não receberá notificação');
    }
    
    // Enviar todas as mensagens em paralelo
    const results = await Promise.allSettled(promises);
    
    return {
      success: true,
      results: results.map((r, i) => ({
        recipient: i === 0 ? 'vendedor' : 'admin',
        success: r.status === 'fulfilled'
      }))
    };
  } catch (error) {
    console.error('Erro ao enviar notificação de proposta criada:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificação de proposta fechada (venda fechada)
 * @param {object} proposal - Dados da proposta
 * @param {object} seller - Dados do vendedor
 */
/**
 * WhatsApp apenas na venda fechada — envia para ADMIN_WHATSAPP_PHONE
 */
async function notifyProposalClosed(proposal, seller) {
  try {
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (!adminPhone) {
      console.warn('⚠️ ADMIN_WHATSAPP_PHONE não configurado - alerta de venda fechada não será enviado');
      return { success: false, error: 'ADMIN_WHATSAPP_PHONE não configurado' };
    }

    const formattedAdminPhone = formatPhoneNumber(adminPhone);
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    const fromNumberOnly = twilioFrom.replace(/whatsapp:|\+|\s/g, '');

    if (formattedAdminPhone === fromNumberOnly) {
      console.warn(`⚠️ ADMIN_WHATSAPP_PHONE (${adminPhone}) é o mesmo que TWILIO_WHATSAPP_FROM. Envio cancelado.`);
      return { success: false, error: 'From e To iguais' };
    }

    const message = buildSaleClosedMessage(proposal, seller, { includeSellerLine: true });
    console.log(`📱 Enviando WhatsApp (somente venda fechada) para: ${adminPhone}`);

    const result = await sendWhatsAppMessage(adminPhone, message);
    return { success: true, recipient: 'admin', result };
  } catch (error) {
    console.error('Erro ao enviar notificação de venda fechada:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificação de proposta perdida
 * @param {object} proposal - Dados da proposta
 * @param {object} seller - Dados do vendedor
 */
async function notifyProposalLost(proposal, seller) {
  try {
    const promises = [];
    
    // Enviar para o vendedor (se tiver telefone)
    const sellerPhone = seller.phone || seller.contato?.telefone;
    if (sellerPhone) {
      const lossReason = proposal.lossReason ? getLossReasonLabel(proposal.lossReason) : 'Não informado';
      
      const sellerMessage = `😔 *Venda Perdida*

📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👤 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}
📝 Motivo: ${lossReason}

Não desanime! Continue trabalhando! 💪`;
      
      promises.push(sendWhatsAppMessage(sellerPhone, sellerMessage));
    }
    
    // Enviar para o admin/gerente (se configurado)
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (adminPhone) {
      // Validar se o número do admin não é o mesmo que o From do Twilio
      const formattedAdminPhone = formatPhoneNumber(adminPhone);
      const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      const fromNumberOnly = twilioFrom.replace(/whatsapp:|\+|\s/g, '');
      
      if (formattedAdminPhone === fromNumberOnly) {
        console.warn(`⚠️ ADMIN_WHATSAPP_PHONE (${adminPhone}) é o mesmo que TWILIO_WHATSAPP_FROM. Pulando envio para evitar erro.`);
      } else {
        const lossReason = proposal.lossReason ? getLossReasonLabel(proposal.lossReason) : 'Não informado';
        const now = new Date();
        const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const data = now.toLocaleDateString('pt-BR');
        
        const adminMessage = `❌ *Venda Perdida*

👤 Vendedor: ${seller.name || 'N/A'}
📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👥 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}
📝 Motivo: ${lossReason}
🕐 Perdida em: ${data} às ${hora}`;
        
        console.log(`📱 Enviando WhatsApp para admin: ${adminPhone} (formatado: ${formattedAdminPhone})`);
        promises.push(sendWhatsAppMessage(adminPhone, adminMessage).catch(err => {
          console.error(`❌ Erro ao enviar para admin ${adminPhone}:`, err.message);
          throw err;
        }));
      }
    } else {
      console.warn('⚠️ ADMIN_WHATSAPP_PHONE não configurado - admin não receberá notificação');
    }
    
    // Enviar todas as mensagens em paralelo
    const results = await Promise.allSettled(promises);
    
    return {
      success: true,
      results: results.map((r, i) => ({
        recipient: i === 0 ? 'vendedor' : 'admin',
        success: r.status === 'fulfilled'
      }))
    };
  } catch (error) {
    console.error('Erro ao enviar notificação de venda perdida:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obter emoji do status
 */
function getStatusEmoji(status) {
  const emojiMap = {
    'negociacao': '🔄',
    'venda_fechada': '✅',
    'venda_perdida': '❌',
    'expirada': '⏰',
    'aprovada': '✅'
  };
  return emojiMap[status] || '📋';
}

/**
 * Obter label do motivo de perda
 */
function getLossReasonLabel(reason) {
  const labels = {
    'preco_concorrente': 'Preço Concorrente',
    'condicao_pagamento': 'Condição de Pagamento',
    'sem_retorno': 'Sem Retorno',
    'credito_negado': 'Crédito Negado',
    'concorrencia_marca': 'Concorrência (Marca)',
    'adiamento_compra': 'Adiamento de Compra',
    'cotacao_preco': 'Cotação de Preço',
    'perca_preco': 'Perda de Preço',
    'urgencia_comprou_local': 'Urgência / Comprou Local',
    'golpe': 'Golpe',
    'licitacao': 'Licitação',
    'fechado_outro_parceiro': 'Fechado em Outro Parceiro'
  };
  return labels[reason] || reason;
}

module.exports = {
  sendWhatsAppMessage,
  notifyProposalCreated,
  notifyProposalClosed,
  notifyProposalLost,
  formatPhoneNumber,
  buildSaleClosedMessage,
  formatProposalItemsLines
};

