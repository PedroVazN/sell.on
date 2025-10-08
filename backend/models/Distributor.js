const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema({
  apelido: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  razaoSocial: {
    type: String,
    required: true,
    trim: true
  },
  cnpj: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  idDistribuidor: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  contato: {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    telefone: {
      type: String,
      required: true,
      trim: true
    },
    cargo: {
      type: String,
      trim: true
    }
  },
  origem: {
    type: String,
    required: true,
    trim: true
  },
  atendimento: {
    horario: {
      type: String,
      trim: true
    },
    dias: {
      type: String,
      trim: true
    },
    observacoes: {
      type: String,
      trim: true
    }
  },
  frete: {
    tipo: {
      type: String,
      enum: ['CIF', 'FOB', 'TERCEIRO'],
      default: 'CIF'
    },
    valor: {
      type: Number,
      min: 0
    },
    prazo: {
      type: Number,
      min: 0
    },
    observacoes: {
      type: String,
      trim: true
    }
  },
  pedidoMinimo: {
    valor: {
      type: Number,
      required: true,
      min: 0
    },
    observacoes: {
      type: String,
      trim: true
    }
  },
  endereco: {
    cep: {
      type: String,
      trim: true
    },
    logradouro: {
      type: String,
      trim: true
    },
    numero: {
      type: String,
      trim: true
    },
    complemento: {
      type: String,
      trim: true
    },
    bairro: {
      type: String,
      trim: true
    },
    cidade: {
      type: String,
      trim: true
    },
    uf: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  observacoes: {
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
distributorSchema.index({ apelido: 1 });
distributorSchema.index({ razaoSocial: 1 });
distributorSchema.index({ idDistribuidor: 1 });
distributorSchema.index({ 'contato.nome': 1 });
distributorSchema.index({ origem: 1 });
distributorSchema.index({ isActive: 1 });
distributorSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Distributor', distributorSchema);
