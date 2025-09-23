const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  pricing: {
    aVista: {
      type: Number,
      required: true,
      min: 0
    },
    tresXBoleto: {
      type: Number,
      required: true,
      min: 0
    },
    tresXCartao: {
      type: Number,
      required: true,
      min: 0
    }
  },
  client: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  },
  notes: {
    type: String,
    trim: true
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
proposalSchema.index({ productCode: 1 });
proposalSchema.index({ 'client.email': 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdBy: 1 });
proposalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
