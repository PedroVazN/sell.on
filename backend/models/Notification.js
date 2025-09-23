const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  message: {
    type: String,
    required: [true, 'Mensagem é obrigatória'],
    trim: true,
    maxlength: [500, 'Mensagem não pode ter mais de 500 caracteres']
  },
  type: {
    type: String,
    enum: ['goal_achieved', 'goal_milestone', 'goal_created', 'goal_updated', 'goal_completed', 'system', 'warning', 'info'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  recipient: {
    type: String, // ID do usuário
    required: true
  },
  sender: {
    type: String, // ID do usuário que enviou (pode ser 'system')
    default: 'system'
  },
  relatedEntity: {
    type: String, // ID da meta, venda, etc.
    required: false
  },
  relatedEntityType: {
    type: String,
    enum: ['goal', 'sale', 'proposal', 'client', 'distributor'],
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null // Notificações que expiram automaticamente
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, isActive: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método para marcar como lida
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Método para marcar como não lida
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Método estático para criar notificação de meta batida
notificationSchema.statics.createGoalAchievedNotification = function(goal, user) {
  return this.create({
    title: '🎯 Meta Batida!',
    message: `Parabéns! Você atingiu a meta "${goal.title}" com ${goal.progress.percentage}% de conclusão!`,
    type: 'goal_achieved',
    priority: 'high',
    recipient: user,
    relatedEntity: goal._id,
    relatedEntityType: 'goal',
    data: {
      goalTitle: goal.title,
      percentage: goal.progress.percentage,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue
    }
  });
};

// Método estático para criar notificação de marco da meta
notificationSchema.statics.createGoalMilestoneNotification = function(goal, user, milestone) {
  return this.create({
    title: '📈 Marco da Meta',
    message: `Você atingiu ${milestone}% da meta "${goal.title}"! Continue assim!`,
    type: 'goal_milestone',
    priority: 'medium',
    recipient: user,
    relatedEntity: goal._id,
    relatedEntityType: 'goal',
    data: {
      goalTitle: goal.title,
      milestone: milestone,
      percentage: goal.progress.percentage
    }
  });
};

// Método estático para criar notificação de meta concluída
notificationSchema.statics.createGoalCompletedNotification = function(goal, user) {
  return this.create({
    title: '🏆 Meta Concluída!',
    message: `Excelente trabalho! Você concluiu 100% da meta "${goal.title}"!`,
    type: 'goal_completed',
    priority: 'urgent',
    recipient: user,
    relatedEntity: goal._id,
    relatedEntityType: 'goal',
    data: {
      goalTitle: goal.title,
      percentage: 100,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
