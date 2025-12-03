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
    },
    cnpj: {
      type: String,
      trim: true
    },
    razaoSocial: {
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
    },
    cnpj: {
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
  lossReason: {
    type: String,
    enum: [
      'preco_concorrente',
      'condicao_pagamento',
      'sem_retorno',
      'credito_negado',
      'concorrencia_marca',
      'adiamento_compra',
      'cotacao_preco',
      'perca_preco',
      'urgencia_comprou_local',
      'golpe',
      'licitacao',
      'fechado_outro_parceiro'
    ],
    required: function() {
      return this.status === 'venda_perdida';
    }
  },
  lossDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  closedAt: {
    type: Date,
    default: null
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
    try {
      // Buscar o maior número de proposta existente
      const lastProposal = await this.constructor.findOne({}, {}, { sort: { proposalNumber: -1 } });
      let nextNumber = 1;
      
      if (lastProposal && lastProposal.proposalNumber) {
        const lastNumber = parseInt(lastProposal.proposalNumber.split('-')[1]);
        nextNumber = lastNumber + 1;
      }
      
      this.proposalNumber = `PROP-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número da proposta:', error);
      // Fallback: usar timestamp
      this.proposalNumber = `PROP-${Date.now()}`;
    }
  }
  next();
});

// Índices para melhor performance
proposalSchema.index({ 'client.email': 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdBy: 1 });
proposalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
