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
 * Enviar via Twilio (Pago - Profissional)
 * @param {string} phoneNumber - Número formatado
 * @param {string} message - Mensagem
 * @param {object} options - Opções
 */
async function sendViaTwilio(phoneNumber, message, options = {}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // Formato: whatsapp:+14155238886
  
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('⚠️ Twilio não configurado. Pule envio WhatsApp.');
    return { success: false, error: 'Twilio não configurado' };
  }
  
  try {
    // Twilio requer whatsapp: no número
    const toNumber = `whatsapp:+${phoneNumber}`;
    const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('From', from);
    params.append('To', toNumber);
    params.append('Body', message);
    
    console.log(`📤 Enviando WhatsApp via Twilio:`);
    console.log(`   De: ${from}`);
    console.log(`   Para: ${toNumber}`);
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
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
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
      
      console.log(`📱 Enviando WhatsApp para admin: ${adminPhone}`);
      promises.push(sendWhatsAppMessage(adminPhone, adminMessage).catch(err => {
        console.error(`❌ Erro ao enviar para admin ${adminPhone}:`, err.message);
        throw err;
      }));
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
async function notifyProposalClosed(proposal, seller) {
  try {
    const promises = [];
    
    // Enviar para o vendedor (se tiver telefone)
    const sellerPhone = seller.phone || seller.contato?.telefone;
    if (sellerPhone) {
      const sellerMessage = `🎊 *Venda Fechada!*

📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👤 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}

Parabéns pela venda! 🎉`;
      
      promises.push(sendWhatsAppMessage(sellerPhone, sellerMessage));
    }
    
    // Enviar para o admin/gerente (se configurado)
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
    if (adminPhone) {
      const now = new Date();
      const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const data = now.toLocaleDateString('pt-BR');
      
      const adminMessage = `✅ *Venda Fechada!*

👤 Vendedor: ${seller.name || 'N/A'}
📋 Proposta: ${proposal.proposalNumber || 'N/A'}
👥 Cliente: ${proposal.client?.name || 'N/A'}
💰 Valor: R$ ${(proposal.total || 0).toLocaleString('pt-BR')}
🕐 Fechada em: ${data} às ${hora}

Parabéns ao vendedor! 🎉`;
      
      console.log(`📱 Enviando WhatsApp para admin: ${adminPhone}`);
      promises.push(sendWhatsAppMessage(adminPhone, adminMessage).catch(err => {
        console.error(`❌ Erro ao enviar para admin ${adminPhone}:`, err.message);
        throw err;
      }));
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
      
      console.log(`📱 Enviando WhatsApp para admin: ${adminPhone}`);
      promises.push(sendWhatsAppMessage(adminPhone, adminMessage).catch(err => {
        console.error(`❌ Erro ao enviar para admin ${adminPhone}:`, err.message);
        throw err;
      }));
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
  formatPhoneNumber
};

