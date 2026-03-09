const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const Goal = require('../models/Goal');
const User = require('../models/User');
const Client = require('../models/Client');
const ClientAccessRequest = require('../models/ClientAccessRequest');
const Notification = require('../models/Notification');
const Opportunity = require('../models/Opportunity');
const PipelineStage = require('../models/PipelineStage');
const { auth } = require('../middleware/auth');
const { validateProposal, validateMongoId, validatePagination } = require('../middleware/validation');
const { proposalLimiter } = require('../middleware/security');
const { calculateProposalScore, calculateProposalScoreWithComparison } = require('../services/proposalScore');
const { notifyProposalCreated, notifyProposalClosed, notifyProposalLost } = require('../services/whatsapp');

// GET /api/proposals - Listar todas as propostas do usuário
router.get('/', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        },
        message: 'MongoDB não conectado - retornando lista vazia'
      });
    }

    const { page = 1, limit = 10, status, search, seller, dateFrom, dateTo, closedDateFrom, closedDateTo } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (seller) {
      query.$or = [
        { 'seller._id': seller },
        { createdBy: seller }
      ];
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom + 'T00:00:00.000Z');
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    if (closedDateFrom || closedDateTo) {
      query.closedAt = { $exists: true, $ne: null };
      if (closedDateFrom) query.closedAt.$gte = new Date(closedDateFrom + 'T00:00:00.000Z');
      if (closedDateTo) query.closedAt.$lte = new Date(closedDateTo + 'T23:59:59.999Z');
    }
    if (search) {
      query.$or = query.$or || [];
      const searchOr = [
        { proposalNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } }
      ];
      if (query.$or.length) query.$and = [{ $or: query.$or }, { $or: searchOr }];
      else query.$or = searchOr;
    }
    if (query.$and) {
      const andCopy = query.$and;
      delete query.$or;
      query.$and = andCopy;
    } else if (seller && query.$or) {
      const sellerOr = query.$or;
      delete query.$or;
      query.$or = sellerOr;
    }

    const proposals = await Proposal.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    res.json({
      success: true,
      data: proposals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/proposals/:id - Atualizar status da proposta
router.put('/:id', async (req, res) => {
  try {
    console.log('=== ATUALIZANDO STATUS DA PROPOSTA ===');
    console.log('ID da proposta:', req.params.id);
    console.log('Body completo:', req.body);
    console.log('Headers:', req.headers);
    console.log('Novo status:', req.body.status);
    console.log('Motivo da perda:', req.body.lossReason);

    const { status, lossReason, lossDescription } = req.body;

    console.log('🔍 Dados extraídos:');
    console.log('Status:', status);
    console.log('Loss Reason:', lossReason);
    console.log('Loss Description:', lossDescription);
    console.log('Loss Reason type:', typeof lossReason);
    console.log('Loss Reason truthy:', !!lossReason);

    if (!status) {
      console.log('❌ Status não fornecido');
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório'
      });
    }

    // Se for venda perdida, verificar se tem motivo
    // Mas só se lossReason foi fornecido explicitamente (não é edição completa)
    if (status === 'venda_perdida' && 'lossReason' in req.body && !lossReason) {
      console.log('❌ Venda perdida sem motivo');
      return res.status(400).json({
        success: false,
        error: 'Motivo da perda é obrigatório para venda perdida'
      });
    }

    const updateData = { status };
    
    // Se a venda foi fechada OU perdida, registrar a data de fechamento
    if (status === 'venda_fechada' || status === 'venda_perdida' || status === 'expirada') {
      updateData.closedAt = new Date();
    }
    
    // Adicionar motivo da perda se fornecido
    if (lossReason) {
      updateData.lossReason = lossReason;
    }
    
    if (lossDescription) {
      updateData.lossDescription = lossDescription;
    }

    console.log('🔍 Dados para atualização:', updateData);
    
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');

    if (!proposal) {
      console.log('❌ Proposta não encontrada após atualização');
      return res.status(404).json({
        success: false,
        message: 'Proposta não encontrada'
      });
    }

    console.log('✅ Proposta atualizada com sucesso:');
    console.log('ID:', proposal._id);
    console.log('Status:', proposal.status);
    console.log('Loss Reason:', proposal.lossReason);
    console.log('Loss Description:', proposal.lossDescription);

    // Integração Funil: atualizar oportunidade vinculada quando proposta ganha ou perde
    if ((status === 'venda_fechada' || status === 'venda_perdida') && proposal.opportunity) {
      try {
        await Opportunity.findByIdAndUpdate(proposal.opportunity, {
          status: status === 'venda_fechada' ? 'won' : 'lost'
        });
        console.log('Funil: oportunidade atualizada para', status === 'venda_fechada' ? 'ganha' : 'perdida');
      } catch (funnelErr) {
        console.error('Funil: erro ao atualizar oportunidade:', funnelErr.message);
      }
    }

    // Enviar notificação WhatsApp baseado no novo status (em background)
    try {
      console.log('📱 Iniciando envio de notificação WhatsApp (atualização status)...');
      console.log('   Novo status:', status);
      
      const sellerId = proposal.createdBy?._id || proposal.createdBy;
      if (sellerId) {
        const sellerUser = await User.findById(sellerId).select('name email phone');
        if (sellerUser) {
          console.log('   Vendedor encontrado:', sellerUser.name);
          console.log('   Admin Phone configurado:', !!process.env.ADMIN_WHATSAPP_PHONE);
          
          if (status === 'venda_fechada') {
            notifyProposalClosed(proposal, sellerUser)
              .then(result => {
                console.log('✅ Notificação WhatsApp enviada (venda fechada):', result);
              })
              .catch(err => {
                console.error('❌ Erro ao enviar WhatsApp venda fechada:', err);
                if (err.response?.data) {
                  console.error('   Resposta Twilio:', JSON.stringify(err.response.data, null, 2));
                }
              });
          } else if (status === 'venda_perdida') {
            notifyProposalLost(proposal, sellerUser)
              .then(result => {
                console.log('✅ Notificação WhatsApp enviada (venda perdida):', result);
              })
              .catch(err => {
                console.error('❌ Erro ao enviar WhatsApp venda perdida:', err);
                if (err.response?.data) {
                  console.error('   Resposta Twilio:', JSON.stringify(err.response.data, null, 2));
                }
              });
          }
        } else {
          console.warn('⚠️ Vendedor não encontrado para enviar WhatsApp');
        }
      }
    } catch (whatsappError) {
      // Não bloquear atualização se WhatsApp falhar
      console.error('❌ Erro ao enviar WhatsApp:', whatsappError);
    }

    // Se a proposta foi fechada (venda_fechada), RECALCULAR TODAS as metas do vendedor
    // Isso garante que o valor sempre esteja correto, baseado em TODAS as propostas fechadas
    if (status === 'venda_fechada') {
      console.log('🎯 Proposta fechada! Recalculando TODAS as metas do vendedor...');
      console.log('Vendedor ID:', proposal.createdBy?._id || proposal.createdBy);
      console.log('Valor da proposta:', proposal.total);
      console.log('ID da proposta:', proposal._id.toString());
      
      try {
        const sellerId = proposal.createdBy?._id || proposal.createdBy;
        
        if (!sellerId) {
          console.error('⚠️ Vendedor não encontrado na proposta, não é possível atualizar metas');
        } else {
          // Importar função de recálculo
          const goalsRouter = require('./goals');
          const recalculateGoalAutomatically = goalsRouter.recalculateGoalAutomatically;
          
          // Buscar TODAS as metas de vendas do vendedor (ativas e completas)
          const allSalesGoals = await Goal.find({
            assignedTo: sellerId,
            category: 'sales',
            unit: 'currency',
            status: { $in: ['active', 'completed'] } // Incluir completas também para recalcular
          });

          console.log(`📊 Encontradas ${allSalesGoals.length} meta(s) de vendas para recalcular`);

          // Recalcular cada meta usando a função automática que busca TODAS as propostas fechadas
          // Isso garante consistência - sempre recalcula baseado em TODAS as propostas do período
          for (const goal of allSalesGoals) {
            try {
              // Buscar a meta atualizada do banco para ter os dados mais recentes
              const freshGoal = await Goal.findById(goal._id);
              if (!freshGoal) {
                console.log(`⚠️ Meta ${goal._id} não encontrada no banco, pulando...`);
                continue;
              }
              
              // Usar a função de recálculo automático que busca TODAS as propostas fechadas
              const recalcResult = await recalculateGoalAutomatically(freshGoal);
              
              if (recalcResult) {
                console.log(`✅ Meta "${freshGoal.title}" recalculada: R$ ${recalcResult.oldValue.toFixed(2)} → R$ ${recalcResult.newValue.toFixed(2)} (${recalcResult.proposalsCount} propostas)`);
              }
            } catch (goalError) {
              console.error(`❌ Erro ao recalcular meta ${goal._id}:`, goalError);
            }
          }
          
          console.log('✅ Todas as metas foram recalculadas automaticamente após fechamento da proposta');
        }
      } catch (goalError) {
        console.error('❌ Erro ao recalcular metas:', goalError);
        console.error('Stack:', goalError.stack);
        // Não retornar erro, pois a proposta foi atualizada com sucesso
      }
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/proposals/:id - Buscar proposta específica
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Buscando proposta com ID:', req.params.id);
    
    const proposal = await Proposal.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!proposal) {
      console.log('❌ Proposta não encontrada:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Proposta não encontrada' 
      });
    }

    console.log('✅ Proposta encontrada:', proposal._id);
    res.json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/proposals - Criar nova proposta
// Vendedores e admins podem criar propostas
router.post('/', auth, proposalLimiter, (req, res, next) => {
  // Log detalhado ANTES da validação
  console.log('=== RECEBENDO DADOS DA PROPOSTA ===');
  console.log('Body completo:', JSON.stringify(req.body, null, 2));
  console.log('Client:', {
    name: req.body.client?.name,
    email: req.body.client?.email,
    phone: req.body.client?.phone,
    company: req.body.client?.company,
    cnpj: req.body.client?.cnpj,
    razaoSocial: req.body.client?.razaoSocial
  });
  console.log('Seller:', {
    _id: req.body.seller?._id,
    name: req.body.seller?.name,
    email: req.body.seller?.email
  });
  console.log('Distributor:', {
    _id: req.body.distributor?._id,
    apelido: req.body.distributor?.apelido,
    razaoSocial: req.body.distributor?.razaoSocial
  });
  console.log('Items:', req.body.items?.length || 0);
  console.log('PaymentCondition:', req.body.paymentCondition);
  console.log('ValidUntil:', req.body.validUntil);
  next();
}, validateProposal, async (req, res) => {
  try {
    console.log('=== VALIDAÇÃO PASSOU - CRIANDO PROPOSTA ===');

    const {
      client,
      seller,
      distributor,
      items,
      subtotal,
      discount,
      total,
      paymentCondition,
      observations,
      status,
      validUntil
    } = req.body;

    const currentUserId = req.user?.id || seller?._id;
    const currentUserRole = req.user?.role;

    // Verificar se o cliente já existe e pertence a outro vendedor (carteira) — exige aprovação
    const cleanCnpj = (client?.cnpj || '').replace(/\D/g, '');
    if (cleanCnpj.length === 14 && currentUserRole === 'vendedor') {
      const allByCnpj = await Client.find({}).limit(5000).lean();
      const clientDocFound = allByCnpj.find((c) => (c.cnpj || '').replace(/\D/g, '') === cleanCnpj);

      if (clientDocFound) {
        const ownerId = (clientDocFound.assignedTo && clientDocFound.assignedTo.toString()) || (clientDocFound.createdBy && clientDocFound.createdBy.toString()) || null;
        const sellerIdStr = (seller?._id || currentUserId || '').toString();
        if (ownerId && ownerId !== sellerIdStr) {
          const approved = await ClientAccessRequest.findOne({
            client: clientDocFound._id,
            requestedBy: sellerIdStr,
            status: 'approved'
          }).lean();
          if (!approved) {
            let accessRequest = await ClientAccessRequest.findOne({
              client: clientDocFound._id,
              requestedBy: sellerIdStr,
              status: 'pending'
            });
            if (!accessRequest) {
              accessRequest = await ClientAccessRequest.create({
                client: clientDocFound._id,
                requestedBy: sellerIdStr,
                status: 'pending'
              });
              await Notification.create({
                title: 'Solicitação de uso de cliente',
                message: `${req.user?.name || 'Um vendedor'} solicitou usar o cliente ${(clientDocFound.razaoSocial || clientDocFound.nomeFantasia || 'CNPJ ' + (clientDocFound.cnpj || '')).substring(0, 50)} para criar proposta. Aceite para liberar o uso.`,
                type: 'client_access_request',
                priority: 'high',
                recipient: ownerId,
                sender: sellerIdStr,
                relatedEntity: accessRequest._id.toString(),
                relatedEntityType: 'client_access_request',
                data: {
                  requestId: accessRequest._id.toString(),
                  clientId: clientDocFound._id.toString(),
                  clientRazao: clientDocFound.razaoSocial,
                  requestedByName: req.user?.name,
                  requestedByEmail: req.user?.email
                }
              });
            }
            const owner = await User.findById(ownerId).select('name').lean();
            return res.status(200).json({
              success: false,
              needsApproval: true,
              requestId: accessRequest._id.toString(),
              ownerName: owner?.name || 'Dono da carteira',
              message: 'Este cliente pertence à carteira de outro vendedor. Foi enviada uma solicitação de uso. Você poderá criar a proposta após a aprovação.'
            });
          }
        }
      }
    }

    // Dados já validados pelo middleware validateProposal

    // Validação de itens já feita pelo middleware validateProposal

    const proposal = new Proposal({
      client,
      seller,
      distributor,
      items,
      subtotal: subtotal || 0,
      discount: discount || 0,
      total: total || 0,
      paymentCondition,
      observations: observations || '',
      status: status || 'negociacao',
      validUntil: new Date(validUntil),
      createdBy: seller._id // Sempre usar o vendedor selecionado
    });

    console.log('Proposta criada:', proposal);

    await proposal.save();
    console.log('Proposta salva com sucesso:', proposal._id);

    // Integração Funil: criar oportunidade no funil (estágio Proposta enviada)
    try {
      const sellerId = seller._id || proposal.createdBy;
      const orConditions = [];
      if (client.email) orConditions.push({ 'contato.email': client.email.toLowerCase().trim() });
      if (client.razaoSocial && client.razaoSocial.trim()) orConditions.push({ razaoSocial: new RegExp(client.razaoSocial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
      const clientDoc = orConditions.length ? await Client.findOne({ $or: orConditions }) : null;
      if (clientDoc && sellerId) {
        let stageProposta = await PipelineStage.findOne({ isDeleted: { $ne: true }, name: /proposta/i }).sort({ order: 1 });
        if (!stageProposta) stageProposta = await PipelineStage.findOne({ isDeleted: { $ne: true } }).sort({ order: 1 });
        if (stageProposta) {
          const opportunity = new Opportunity({
            client: clientDoc._id,
            responsible_user: sellerId,
            stage: stageProposta._id,
            title: `Proposta ${proposal.proposalNumber} - ${(client.razaoSocial || client.company || client.name || '').substring(0, 40)}`,
            estimated_value: total || 0,
            win_probability: 50,
            expected_close_date: validUntil ? new Date(validUntil) : null,
            lead_source: 'proposta',
            description: observations ? `Proposta: ${observations}` : `Criada a partir da proposta ${proposal.proposalNumber}`,
            status: 'open',
            proposal: proposal._id
          });
          await opportunity.save();
          proposal.opportunity = opportunity._id;
          await proposal.save();
          console.log('Funil: oportunidade criada a partir da proposta:', opportunity._id);
        }
      }
    } catch (funnelErr) {
      console.error('Funil: erro ao criar oportunidade a partir da proposta (não bloqueia):', funnelErr.message);
    }

    await proposal.populate('createdBy', 'name email');
    console.log('Proposta populada:', proposal);

    // Enviar notificação WhatsApp para o vendedor e admin (em background, não bloquear resposta)
    try {
      console.log('📱 Iniciando envio de notificação WhatsApp...');
      console.log('   Seller ID:', seller._id);
      
      const sellerUser = await User.findById(seller._id).select('name email phone');
      
      if (sellerUser) {
        console.log('   Vendedor encontrado:', sellerUser.name);
        console.log('   Admin Phone configurado:', !!process.env.ADMIN_WHATSAPP_PHONE);
        console.log('   Twilio configurado:', !!process.env.TWILIO_ACCOUNT_SID);
        
        notifyProposalCreated(proposal, sellerUser)
          .then(result => {
            console.log('✅ Notificação WhatsApp enviada:', result);
          })
          .catch(err => {
            console.error('❌ Erro ao enviar WhatsApp (não bloqueia criação):', err);
            console.error('   Detalhes:', err.message);
            if (err.response?.data) {
              console.error('   Resposta Twilio:', JSON.stringify(err.response.data, null, 2));
            }
          });
      } else {
        console.warn('⚠️ Vendedor não encontrado para enviar WhatsApp');
      }
    } catch (whatsappError) {
      // Não bloquear criação da proposta se WhatsApp falhar
      console.error('❌ Erro ao buscar vendedor para WhatsApp:', whatsappError);
    }

    res.status(201).json({ 
      success: true,
      data: proposal 
    });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Número da proposta já existe' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/proposals/:id/edit - Atualizar proposta completa (edição)
router.put('/:id/edit', async (req, res) => {
  try {
    console.log('=== EDITANDO PROPOSTA COMPLETA ===');
    console.log('ID da proposta:', req.params.id);
    console.log('Body completo:', req.body);

    const proposalId = req.params.id;
    const updateData = req.body;

    // Remover campos que não devem ser atualizados diretamente
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.proposalNumber;

    console.log('🔍 Dados para atualização:', updateData);

    const proposal = await Proposal.findByIdAndUpdate(
      proposalId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!proposal) {
      console.log('❌ Proposta não encontrada após atualização');
      return res.status(404).json({
        success: false,
        message: 'Proposta não encontrada'
      });
    }

    console.log('✅ Proposta editada com sucesso:');
    console.log('ID:', proposal._id);
    console.log('Status:', proposal.status);
    console.log('Cliente:', proposal.client.name);

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Erro ao editar proposta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/proposals/:id - Deletar proposta
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Tentando deletar proposta:', req.params.id);
    
    const proposal = await Proposal.findByIdAndDelete(req.params.id);

    if (!proposal) {
      console.log('❌ Proposta não encontrada:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Proposta não encontrada' 
      });
    }

    console.log('✅ Proposta deletada com sucesso:', proposal._id);
    res.json({ 
      success: true,
      message: 'Proposta deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar proposta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/stats/summary - Estatísticas das propostas
router.get('/stats/summary', async (req, res) => {
  try {
    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    console.log('🔍 Dashboard stats - User ID:', userId);
    
    const stats = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          negociacaoProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'negociacao'] }, 1, 0] }
          },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          vendaPerdidaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_perdida'] }, 1, 0] }
          },
          expiradaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expirada'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProposals: 0,
      negociacaoProposals: 0,
      vendaFechadaProposals: 0,
      vendaPerdidaProposals: 0,
      expiradaProposals: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Erro ao buscar estatísticas das propostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/proposals/dashboard/loss-reasons - Estatísticas de motivos de perda
router.get('/dashboard/loss-reasons', async (req, res) => {
  try {
    console.log('=== ESTATÍSTICAS DE MOTIVOS DE PERDA ===');
    console.log('User ID:', req.user ? req.user.id : 'NENHUM');
    console.log('User Role:', req.user ? req.user.role : 'NENHUM');

    // Verificar conexão com MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB não conectado');
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Client must be connected before running operations'
      });
    }

    // Filtro baseado no role do usuário
    let matchFilter = {};
    if (req.user && req.user.role === 'vendedor') {
      matchFilter.createdBy = new mongoose.Types.ObjectId(req.user.id);
    }

    console.log('Match filter:', matchFilter);

    const lossReasonsStats = await Proposal.aggregate([
      {
        $match: {
          ...matchFilter,
          status: 'venda_perdida',
          lossReason: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$lossReason',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    console.log('Loss reasons stats:', lossReasonsStats);

    // Mapear os motivos para nomes legíveis
    const reasonLabels = {
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

    const formattedStats = lossReasonsStats.map(stat => ({
      reason: stat._id,
      label: reasonLabels[stat._id] || stat._id,
      count: stat.count,
      totalValue: stat.totalValue
    }));

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de motivos de perda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/proposals/dashboard/sales - Dados de vendas para o dashboard
router.get('/dashboard/sales', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          salesStats: {
            totalRevenue: 0,
            totalSales: 0,
            averageSale: 0,
            totalItems: 0
          },
          topProducts: [],
          monthlyData: []
        },
        message: 'MongoDB não conectado - retornando dados zerados'
      });
    }

    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    const userRole = req.user ? req.user.role : 'admin';
    console.log('🔍 Dashboard sales - User ID:', userId, 'Role:', userRole);
    
    // Definir filtro baseado no role do usuário
    let salesMatchFilter = { status: 'venda_fechada' };
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas vendas fechadas
      salesMatchFilter.$or = [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ];
      console.log('🔍 Filtro de vendas para vendedor:', salesMatchFilter);
    } else {
      console.log('🔍 Admin - buscando todas as vendas fechadas');
    }
    
    // Buscar vendas fechadas (receita total)
    const salesStats = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          averageSale: { $avg: '$total' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    // Buscar produtos mais vendidos
    const topProducts = await Proposal.aggregate([
      { $match: salesMatchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            productId: '$items.product._id',
            productName: '$items.product.name'
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Buscar dados mensais para gráficos - usando closedAt (data de fechamento) ao invés de createdAt
    // Para propostas antigas sem closedAt, usa updatedAt como fallback
    const monthlyData = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $addFields: {
          effectiveClosedDate: { $ifNull: ['$closedAt', '$updatedAt'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$effectiveClosedDate' },
            month: { $month: '$effectiveClosedDate' }
          },
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log('📊 Sales Stats encontradas:', salesStats);
    console.log('🏆 Top Products encontrados:', topProducts);
    console.log('📅 Monthly Data encontrada:', monthlyData);

    const result = {
      salesStats: salesStats[0] || {
        totalRevenue: 0,
        totalSales: 0,
        averageSale: 0,
        totalItems: 0
      },
      topProducts: topProducts.map(product => ({
        name: product._id.productName || 'Produto sem nome',
        productId: product._id.productId,
        sales: product.sales,
        revenue: product.totalRevenue,
        quantity: product.totalQuantity
      })),
      monthlyData: monthlyData.map(data => ({
        month: data._id.month,
        year: data._id.year,
        revenue: data.totalRevenue,
        sales: data.totalSales
      }))
    };

    console.log('📈 Resultado final do dashboard sales:', result);

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar dados de vendas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/dashboard/stats - Estatísticas detalhadas para o dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          proposalStats: {
            totalProposals: 0,
            negociacaoProposals: 0,
            vendaFechadaProposals: 0,
            vendaPerdidaProposals: 0,
            expiradaProposals: 0
          },
          salesStats: {
            totalRevenue: 0,
            totalSales: 0,
            averageSale: 0
          }
        },
        message: 'MongoDB não conectado - retornando dados zerados'
      });
    }

    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    const userRole = req.user ? req.user.role : 'admin';
    console.log('🔍 Dashboard stats - User ID:', userId, 'Role:', userRole);
    console.log('🔍 req.user completo:', req.user);
    
    // Definir filtro baseado no role do usuário
    let matchFilter = {};
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas propostas
      matchFilter = {
        $or: [
          { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
          { createdBy: new mongoose.Types.ObjectId(userId) }
        ]
      };
      console.log('🔍 Filtro para vendedor:', matchFilter);
    } else {
      // Admin vê todas as propostas
      console.log('🔍 Admin - buscando todas as propostas');
    }
    
    // Primeiro, verificar se há propostas no banco
    const totalProposals = await Proposal.countDocuments();
    console.log('🔍 Total de propostas no banco:', totalProposals);
    
    // Verificar propostas do usuário específico
    if (userRole !== 'admin') {
      const userProposals = await Proposal.countDocuments({
        $or: [
          { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
          { createdBy: new mongoose.Types.ObjectId(userId) }
        ]
      });
      console.log('🔍 Propostas do usuário', userId, ':', userProposals);
    }
    
    // Buscar estatísticas de propostas
    const proposalStats = await Proposal.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          negociacaoProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'negociacao'] }, 1, 0] }
          },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          vendaPerdidaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_perdida'] }, 1, 0] }
          },
          expiradaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expirada'] }, 1, 0] }
          }
        }
      }
    ]);

    // Buscar estatísticas de vendas fechadas (receita e ticket médio)
    const salesMatchFilter = { status: 'venda_fechada' };
    if (userRole !== 'admin') {
      // Vendedor vê apenas suas vendas fechadas
      salesMatchFilter.$or = [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ];
    }
    
    const salesStats = await Proposal.aggregate([
      { $match: salesMatchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          averageSale: { $avg: '$total' }
        }
      }
    ]);

    console.log('📊 Proposal Stats encontradas:', proposalStats);
    console.log('💰 Sales Stats encontradas:', salesStats);
    
    // Log detalhado dos dados encontrados
    if (proposalStats[0]) {
      console.log('📈 Propostas totais:', proposalStats[0].totalProposals);
      console.log('📈 Vendas fechadas:', proposalStats[0].vendaFechadaProposals);
      console.log('📈 Vendas perdidas:', proposalStats[0].vendaPerdidaProposals);
    }
    
    if (salesStats[0]) {
      console.log('💰 Receita total:', salesStats[0].totalRevenue);
      console.log('💰 Vendas totais:', salesStats[0].totalSales);
    }

    const result = {
      proposalStats: proposalStats[0] || {
        totalProposals: 0,
        negociacaoProposals: 0,
        vendaFechadaProposals: 0,
        vendaPerdidaProposals: 0,
        expiradaProposals: 0
      },
      salesStats: salesStats[0] || {
        totalRevenue: 0,
        totalSales: 0,
        averageSale: 0
      }
    };

    console.log('📈 Resultado final do dashboard:', result);

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/proposals/vendedor/:vendedorId - Propostas de um vendedor específico
router.get('/vendedor/:vendedorId', async (req, res) => {
  try {
    // Verificar se o MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB não conectado na rota vendedor');
      return res.json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        },
        stats: {
          totalProposals: 0,
          negociacaoProposals: 0,
          vendaFechadaProposals: 0,
          vendaPerdidaProposals: 0,
          expiradaProposals: 0,
          totalRevenue: 0
        },
        message: 'MongoDB não conectado - retornando dados zerados'
      });
    }

    const { vendedorId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    console.log('🔍 Buscando propostas para vendedor:', vendedorId);
    console.log('🔍 Parâmetros:', { page, limit, status });

    let query = {
      $or: [
        { 'createdBy._id': new mongoose.Types.ObjectId(vendedorId) },
        { 'createdBy': new mongoose.Types.ObjectId(vendedorId) },
        { 'seller._id': new mongoose.Types.ObjectId(vendedorId) },
        { 'seller': new mongoose.Types.ObjectId(vendedorId) }
      ]
    };

    if (status) {
      query.status = status;
    }

    console.log('🔍 Query de busca:', JSON.stringify(query, null, 2));

    // Primeiro, verificar se há propostas no banco
    const totalProposalsInDB = await Proposal.countDocuments();
    console.log('📊 Total de propostas no banco:', totalProposalsInDB);

    // Verificar uma proposta de exemplo para ver a estrutura
    const sampleProposal = await Proposal.findOne().populate('createdBy', 'name email');
    if (sampleProposal) {
      console.log('📊 Exemplo de proposta:', {
        _id: sampleProposal._id,
        createdBy: sampleProposal.createdBy,
        seller: sampleProposal.seller,
        status: sampleProposal.status
      });
    }

    const proposals = await Proposal.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📊 Propostas encontradas:', proposals.length);

    const total = await Proposal.countDocuments(query);
    console.log('📊 Total de propostas:', total);

    // Estatísticas do vendedor
    console.log('🔍 Calculando estatísticas...');
    const stats = await Proposal.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          negociacaoProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'negociacao'] }, 1, 0] }
          },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          vendaPerdidaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_perdida'] }, 1, 0] }
          },
          expiradaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'expirada'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'venda_fechada'] },
                '$total',
                0
              ]
            }
          }
        }
      }
    ]);

    console.log('📊 Stats do vendedor:', stats[0]);
    console.log('📊 Stats array completo:', stats);

    res.json({
      success: true,
      data: proposals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      },
      stats: stats[0] || {
        totalProposals: 0,
        negociacaoProposals: 0,
        vendaFechadaProposals: 0,
        vendaPerdidaProposals: 0,
        expiradaProposals: 0,
        totalRevenue: 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar propostas do vendedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/proposals/top-performers - Top performers das propostas
router.get('/top-performers', async (req, res) => {
  try {
    // Usar ID do usuário logado ou ID temporário se não houver usuário
    const userId = req.user ? req.user.id : '68c1afbcf906c14a8e7e8ff7';
    console.log('🔍 Dashboard stats - User ID:', userId);
    
    console.log('Buscando top performers para userId:', userId);
    
    // Primeiro, vamos ver quantas propostas existem
    const totalProposals = await Proposal.countDocuments({
      $or: [
        { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) }
      ]
    });
    
    console.log('Total de propostas encontradas:', totalProposals);
    
    // Top Distribuidores
    const topDistributors = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: '$distributor._id',
          apelido: { $first: '$distributor.apelido' },
          razaoSocial: { $first: '$distributor.razaoSocial' },
          totalProposals: { $sum: 1 },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, '$total', 0] }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Top Produtos
    const topProducts = await Proposal.aggregate([
      { 
        $match: { 
          status: 'venda_fechada',
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          proposals: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Top Vendedores
    const topSellers = await Proposal.aggregate([
      { 
        $match: { 
          $or: [
            { 'createdBy._id': new mongoose.Types.ObjectId(userId) },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: '$seller._id',
          name: { $first: '$seller.name' },
          email: { $first: '$seller.email' },
          totalProposals: { $sum: 1 },
          vendaFechadaProposals: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'venda_fechada'] }, '$total', 0] }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    console.log('Top Distribuidores encontrados:', topDistributors.length);
    console.log('Top Produtos encontrados:', topProducts.length);
    console.log('Top Vendedores encontrados:', topSellers.length);

    const result = {
      topDistributors: topDistributors.length > 0 ? topDistributors : [
        { _id: '1', apelido: 'Nenhum distribuidor', razaoSocial: 'Sem dados', totalProposals: 0, vendaFechadaProposals: 0, totalRevenue: 0 }
      ],
      topProducts: topProducts.length > 0 ? topProducts : [
        { _id: '1', totalQuantity: 0, totalRevenue: 0, proposals: 0 }
      ],
      topSellers: topSellers.length > 0 ? topSellers : [
        { _id: '1', name: 'Nenhum vendedor', email: 'sem@dados.com', totalProposals: 0, vendaFechadaProposals: 0, totalRevenue: 0 }
      ]
    };

    res.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    console.error('Erro ao buscar top performers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/proposals/:id/score - Calcular score preditivo de uma proposta
router.post('/:id/score', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposta não encontrada'
      });
    }

    // Permitir escolher método via query: ?method=ml ou ?method=javascript
    const method = req.query.method || 'javascript';
    const useML = method === 'ml' || method === 'python' || method === 'tensorflow'; // Compatibilidade
    const scoreData = await calculateProposalScore(proposal, useML);

    res.json({
      success: true,
      data: scoreData,
      method: useML ? (scoreData.method || 'ml_simples') : 'javascript_statistical'
    });
  } catch (error) {
    console.error('Erro ao calcular score da proposta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota para comparar JavaScript vs ML Simples
router.post('/:id/score/compare', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposta não encontrada'
      });
    }

    const comparison = await calculateProposalScoreWithComparison(proposal);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Erro ao comparar scores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/proposals/with-scores - Listar propostas com scores calculados
router.get('/with-scores/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { proposalNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } }
      ];
    }

    // Apenas propostas em negociação
    query.status = query.status || 'negociacao';

    const proposals = await Proposal.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calcular scores para cada proposta (limitado para performance)
    const method = req.query.method || 'javascript';
    const useML = method === 'ml' || method === 'tensorflow' || method === 'python';
    const proposalsWithScores = await Promise.all(
      proposals.slice(0, 20).map(async (proposal) => {
        const scoreData = await calculateProposalScore(proposal, useML);
        return {
          ...proposal.toObject(),
          aiScore: scoreData
        };
      })
    );

    // Adicionar propostas sem score se houver mais
    if (proposals.length > 20) {
      proposals.slice(20).forEach(proposal => {
        proposalsWithScores.push({
          ...proposal.toObject(),
          aiScore: null // Não calcular para não sobrecarregar
        });
      });
    }

    const total = await Proposal.countDocuments(query);

    res.json({
      success: true,
      data: proposalsWithScores,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar propostas com scores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
