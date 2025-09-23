const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistributorNew',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
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
priceListSchema.index({ distributor: 1, product: 1 });
priceListSchema.index({ isActive: 1 });
priceListSchema.index({ createdBy: 1 });
priceListSchema.index({ validFrom: 1, validUntil: 1 });

// Índice único para evitar duplicatas por usuário (permite múltiplos produtos por distribuidor)
priceListSchema.index({ distributor: 1, product: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('PriceList', priceListSchema);
