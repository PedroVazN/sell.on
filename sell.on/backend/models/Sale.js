const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantidade deve ser pelo menos 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Preço unitário não pode ser negativo']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Desconto não pode ser negativo']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total não pode ser negativo']
  }
});

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal não pode ser negativo']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Desconto não pode ser negativo']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Imposto não pode ser negativo']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total não pode ser negativo']
  },
  paymentMethod: {
    type: String,
    enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'cheque'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pendente', 'pago', 'parcial', 'cancelado'],
    default: 'pendente'
  },
  status: {
    type: String,
    enum: ['rascunho', 'finalizada', 'cancelada', 'devolvida'],
    default: 'rascunho'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem ter mais de 500 caracteres']
  },
  deliveryDate: {
    type: Date
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  }
}, {
  timestamps: true
});

// Índices para melhor performance
saleSchema.index({ customer: 1 });
saleSchema.index({ seller: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ opportunity: 1 });

// Middleware para calcular total antes de salvar
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = (item.unitPrice * item.quantity) - item.discount;
      return sum + itemTotal;
    }, 0);
    
    this.total = this.subtotal - this.discount + this.tax;
  }
  next();
});

// Gerar número da venda automaticamente
saleSchema.pre('save', async function(next) {
  if (!this.saleNumber) {
    const count = await this.constructor.countDocuments();
    this.saleNumber = `VENDA-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
