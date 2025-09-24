const mongoose = require('mongoose');


const proposalItemSchema = new mongoose.Schema({
  product: {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const proposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    unique: true,
    trim: true
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
  seller: {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    }
  },
  distributor: {
    _id: {
      type: String,
      required: true
    },
    apelido: {
      type: String,
      trim: true
    },
    razaoSocial: {
      type: String,
      trim: true
    }
  },
  items: [proposalItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentCondition: {
    type: String,
    required: true,
    trim: true
  },
  observations: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['negociacao', 'venda_fechada', 'venda_perdida', 'expirada'],
    default: 'negociacao'
  },
  validUntil: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Gerar número da proposta antes de salvar
proposalSchema.pre('save', async function(next) {
  if (!this.proposalNumber) {
    const count = await this.constructor.countDocuments();
    this.proposalNumber = `PROP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Índices para melhor performance
proposalSchema.index({ 'client.email': 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdBy: 1 });
proposalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
