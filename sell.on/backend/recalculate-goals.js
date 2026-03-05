const mongoose = require('mongoose');
const Goal = require('./models/Goal');
const Proposal = require('./models/Proposal');

// Conectar ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/vendas-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado ao MongoDB');
  recalculateGoals();
}).catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

async function recalculateGoals() {
  try {
    console.log('\n🔄 Iniciando recálculo de metas...\n');
    
    // Buscar todas as metas de vendas
    const goals = await Goal.find({
      category: 'sales',
      unit: 'currency'
    });

    console.log(`📊 Encontradas ${goals.length} metas para recalcular\n`);

    for (const goal of goals) {
      const vendorId = goal.assignedTo;
      
      // Buscar todas as propostas fechadas do vendedor no período da meta
      // Usar closedAt (data de fechamento) ou updatedAt como fallback para propostas antigas
      const closedProposals = await Proposal.find({
        $or: [
          { 'createdBy._id': vendorId },
          { createdBy: vendorId }
        ],
        status: 'venda_fechada',
        $expr: {
          $and: [
            { $gte: [{ $ifNull: ['$closedAt', '$updatedAt'] }, new Date(goal.period.startDate)] },
            { $lte: [{ $ifNull: ['$closedAt', '$updatedAt'] }, new Date(goal.period.endDate)] }
          ]
        }
      });

      console.log(`👤 Vendedor ${vendorId}:`);
      console.log(`   📋 Meta: "${goal.title}"`);
      console.log(`   💰 Valor alvo: R$ ${goal.targetValue.toLocaleString('pt-BR')}`);
      console.log(`   📦 Vendas fechadas: ${closedProposals.length}`);

      // Calcular valor total
      const totalValue = closedProposals.reduce((sum, p) => sum + (p.total || 0), 0);
      
      // Coletar IDs das propostas
      const proposalIds = closedProposals.map(p => p._id.toString());

      // Mostrar valor antigo
      console.log(`   ❌ Valor antigo: R$ ${goal.currentValue.toLocaleString('pt-BR')}`);
      console.log(`   ✅ Valor correto: R$ ${totalValue.toLocaleString('pt-BR')}`);

      // Atualizar meta
      goal.currentValue = totalValue;
      goal.progress.percentage = Math.min(100, (totalValue / goal.targetValue) * 100);
      goal.progress.countedProposals = proposalIds;
      
      // Adicionar marco de recálculo
      goal.progress.milestones.push({
        date: new Date().toISOString().split('T')[0],
        value: totalValue,
        description: `Recálculo: ${closedProposals.length} vendas totalizando R$ ${totalValue.toLocaleString('pt-BR')}`
      });

      // Verificar se atingiu a meta
      if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
        goal.status = 'completed';
        console.log(`   🎯 Meta ATINGIDA!`);
      } else {
        console.log(`   📊 Progresso: ${goal.progress.percentage.toFixed(1)}%`);
      }

      await goal.save();
      console.log(`   ✅ Meta atualizada com sucesso!\n`);
    }

    console.log('✅ Recálculo concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao recalcular metas:', error);
    process.exit(1);
  }
}

