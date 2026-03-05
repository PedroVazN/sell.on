const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  category: {
    type: String,
    enum: ['sales', 'revenue', 'clients', 'proposals', 'calls', 'visits', 'custom'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['quantity', 'currency', 'percentage', 'hours', 'calls', 'visits']
  },
  period: {
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    week: {
      type: Number,
      min: 1,
      max: 53
    },
    day: {
      type: Number,
      min: 1,
      max: 31
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    milestones: [{
      date: String,
      value: Number,
      description: String
    }],
    countedProposals: [{
      type: String
    }]
  },
  rewards: {
    enabled: {
      type: Boolean,
      default: false
    },
    description: String,
    points: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    threshold: {
      type: Number,
      default: 80
    }
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  parentGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }
}, {
  timestamps: true
});

// Índices para melhor performance
goalSchema.index({ assignedTo: 1, type: 1 });
goalSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ createdBy: 1 });

// Middleware para calcular progresso automaticamente
goalSchema.pre('save', function(next) {
  if (this.targetValue > 0) {
    this.progress.percentage = Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
  }
  this.progress.lastUpdated = new Date();
  next();
});

// Método para atualizar progresso
goalSchema.methods.updateProgress = async function(newValue, description = '') {
  const previousPercentage = this.progress.percentage;
  this.currentValue = newValue;
  
  // Calcular nova porcentagem
  this.progress.percentage = Math.round((newValue / this.targetValue) * 100);
  this.progress.lastUpdated = new Date();
  
  this.progress.milestones.push({
    date: new Date().toISOString().split('T')[0],
    value: newValue,
    description
  });
  
  // Manter apenas os últimos 10 marcos
  if (this.progress.milestones.length > 10) {
    this.progress.milestones = this.progress.milestones.slice(-10);
  }
  
  await this.save();
  
  // Verificar se precisa criar notificações
  await this.checkAndCreateNotifications(previousPercentage);
  
  return this;
};

// Método para verificar se a meta foi atingida
goalSchema.methods.isAchieved = function() {
  return this.currentValue >= this.targetValue;
};

// Método para verificar e criar notificações
goalSchema.methods.checkAndCreateNotifications = async function(previousPercentage) {
  const Notification = require('./Notification');
  const currentPercentage = this.progress.percentage;
  
  // Notificação de meta concluída (100%)
  if (currentPercentage >= 100 && previousPercentage < 100) {
    await Notification.createGoalCompletedNotification(this, this.assignedTo);
  }
  // Notificação de meta batida (80% ou mais)
  else if (currentPercentage >= 80 && previousPercentage < 80) {
    await Notification.createGoalAchievedNotification(this, this.assignedTo);
  }
  // Notificações de marcos (25%, 50%, 75%)
  else if (currentPercentage >= 75 && previousPercentage < 75) {
    await Notification.createGoalMilestoneNotification(this, this.assignedTo, 75);
  }
  else if (currentPercentage >= 50 && previousPercentage < 50) {
    await Notification.createGoalMilestoneNotification(this, this.assignedTo, 50);
  }
  else if (currentPercentage >= 25 && previousPercentage < 25) {
    await Notification.createGoalMilestoneNotification(this, this.assignedTo, 25);
  }
};

// Método para calcular dias restantes
goalSchema.methods.getDaysRemaining = function() {
  const endDate = new Date(this.period.endDate);
  const today = new Date();
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

module.exports = mongoose.model('Goal', goalSchema);
