const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  type: {
    type: String,
    enum: ['meeting', 'call', 'visit', 'follow_up', 'proposal', 'sale', 'other'],
    default: 'meeting'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  client: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    name: String,
    email: String,
    phone: String
  },
  distributor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor'
    },
    apelido: String,
    razaoSocial: String
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    minutes: {
      type: Number,
      default: 15
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
