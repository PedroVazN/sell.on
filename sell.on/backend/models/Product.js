const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  price: {
    type: Number,
    min: [0, 'Preço não pode ser negativo'],
    default: 0
  },
  cost: {
    type: Number,
    min: [0, 'Custo não pode ser negativo']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  stock: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Estoque não pode ser negativo']
    },
    min: {
      type: Number,
      default: 0,
      min: [0, 'Estoque mínimo não pode ser negativo']
    },
    max: {
      type: Number,
      min: [0, 'Estoque máximo não pode ser negativo']
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  dimensions: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

// Índices para melhor performance
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
