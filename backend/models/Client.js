const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  cnpj: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Remove caracteres não numéricos
        const cnpj = v.replace(/[^\d]/g, '');
        return cnpj.length === 14;
      },
      message: 'CNPJ deve ter 14 dígitos'
    }
  },
  razaoSocial: {
    type: String,
    required: true,
    trim: true
  },
  nomeFantasia: {
    type: String,
    trim: true
  },
  contato: {
    nome: {
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
      required: true,
      trim: true,
      uppercase: true,
      enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
    }
  },
  classificacao: {
    type: String,
    required: true,
    enum: ['PROVEDOR', 'REVENDA', 'OUTROS'],
    default: 'OUTROS'
  },
  observacoes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Vendedor responsável pela carteira (gestão de carteira por vendedor)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Índices para melhor performance
clientSchema.index({ razaoSocial: 1 });
clientSchema.index({ 'contato.email': 1 });
clientSchema.index({ 'endereco.uf': 1 });
clientSchema.index({ classificacao: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ createdBy: 1 });
clientSchema.index({ assignedTo: 1 });

// Middleware para formatar CNPJ
clientSchema.pre('save', function(next) {
  if (this.cnpj) {
    // Remove caracteres não numéricos
    const cnpj = this.cnpj.replace(/[^\d]/g, '');
    // Formata CNPJ: XX.XXX.XXX/XXXX-XX
    this.cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  next();
});

module.exports = mongoose.model('Client', clientSchema);
