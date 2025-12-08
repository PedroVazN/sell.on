/**
 * Script para atualizar propostas antigas que não têm closedAt
 * Define closedAt = updatedAt para propostas já finalizadas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Proposal = require('./models/Proposal');

async function fixClosedDates() {
  try {
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI não encontrada!');
      console.log('💡 Defina a variável de ambiente MONGODB_URI');
      process.exit(1);
    }

    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB!');

    // Buscar propostas finalizadas sem closedAt
    console.log('\n🔍 Buscando propostas finalizadas sem closedAt...');
    
    const proposalsToFix = await Proposal.find({
      status: { $in: ['venda_fechada', 'venda_perdida', 'expirada'] },
      closedAt: { $exists: false }
    });

    // Também buscar propostas com closedAt = null
    const proposalsWithNullClosedAt = await Proposal.find({
      status: { $in: ['venda_fechada', 'venda_perdida', 'expirada'] },
      closedAt: null
    });

    const allProposalsToFix = [...proposalsToFix, ...proposalsWithNullClosedAt];
    
    // Remover duplicatas
    const uniqueProposals = allProposalsToFix.filter((proposal, index, self) =>
      index === self.findIndex((p) => p._id.toString() === proposal._id.toString())
    );

    console.log(`📊 Encontradas ${uniqueProposals.length} propostas para corrigir`);

    if (uniqueProposals.length === 0) {
      console.log('✅ Nenhuma proposta precisa ser corrigida!');
      process.exit(0);
    }

    // Atualizar cada proposta
    let updated = 0;
    for (const proposal of uniqueProposals) {
      // Usar updatedAt como closedAt
      const closedAt = proposal.updatedAt;
      
      await Proposal.findByIdAndUpdate(proposal._id, {
        closedAt: closedAt
      });

      console.log(`  ✅ ${proposal.proposalNumber}: closedAt = ${closedAt.toLocaleDateString('pt-BR')}`);
      updated++;
    }

    console.log(`\n🎉 ${updated} propostas atualizadas com sucesso!`);
    console.log('📅 Agora todas as propostas finalizadas têm a data de fechamento correta.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixClosedDates();



