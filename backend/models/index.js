const mongoose = require('mongoose');

// Schema de Usuário
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendedor', 'cliente'], default: 'vendedor' },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Schema de Produto
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  cost: Number,
  category: { type: String, required: true },
  brand: String,
  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String, unique: true, sparse: true },
  stock: {
    current: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: Number
  },
  images: [{
    url: String,
    alt: String
  }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Distribuidor
const DistributorSchema = new mongoose.Schema({
  apelido: String,
  razaoSocial: String,
  idDistribuidor: String,
  contato: {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
    cargo: String
  },
  origem: String,
  atendimento: {
    horario: String,
    dias: String,
    observacoes: String
  },
  frete: {
    tipo: { type: String, enum: ['CIF', 'FOB', 'TERCEIRO'] },
    valor: Number,
    prazo: Number,
    observacoes: String
  },
  pedidoMinimo: {
    valor: Number,
    observacoes: String
  },
  endereco: {
    cep: String,
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    uf: String
  },
  isActive: { type: Boolean, default: true },
  observacoes: String,
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Cliente
const ClientSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, unique: true, index: true },
  razaoSocial: { type: String, required: true },
  nomeFantasia: String,
  contato: {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
    cargo: String
  },
  endereco: {
    cep: String,
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    uf: { type: String, required: true }
  },
  classificacao: { 
    type: String, 
    enum: ['PROVEDOR', 'REVENDA', 'OUTROS'], 
    required: true 
  },
  observacoes: String,
  isActive: { type: Boolean, default: true },
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Lista de Preços
const PriceListSchema = new mongoose.Schema({
  distributor: {
    _id: { type: String, required: true },
    apelido: String,
    razaoSocial: String,
    contato: {
      nome: String,
      telefone: String
    }
  },
  products: [{
    product: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      description: String,
      category: String
    },
    pricing: {
      aVista: { type: Number, required: true },
      cartao: { type: Number, required: true },
      boleto: { type: Number, required: true }
    },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    notes: String
  }],
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Proposta
const ProposalSchema = new mongoose.Schema({
  proposalNumber: { type: String, required: true, unique: true },
  client: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String
  },
  seller: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  distributor: {
    _id: { type: String, required: true },
    apelido: String,
    razaoSocial: String
  },
  items: [{
    product: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      description: String,
      category: String,
      price: { type: Number, required: true }
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentCondition: { type: String, required: true },
  observations: String,
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], 
    default: 'draft' 
  },
  validUntil: { type: Date, required: true },
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Venda
const SaleSchema = new mongoose.Schema({
  saleNumber: { type: String, required: true, unique: true },
  customer: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String
  },
  seller: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  items: [{
    product: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      description: String,
      category: String,
      price: { type: Number, required: true }
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
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
  notes: String,
  deliveryDate: Date,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Evento
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  type: { 
    type: String, 
    enum: ['meeting', 'call', 'visit', 'follow_up', 'proposal', 'sale', 'other'], 
    required: true 
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
    _id: String,
    name: String,
    email: String,
    phone: String
  },
  distributor: {
    _id: String,
    apelido: String,
    razaoSocial: String
  },
  location: String,
  notes: String,
  reminder: {
    enabled: { type: Boolean, default: false },
    minutes: { type: Number, default: 15 }
  },
  createdBy: {
    _id: String,
    name: String,
    email: String
  }
}, { timestamps: true });

// Schema de Meta
const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
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
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { 
    type: String, 
    enum: ['quantity', 'currency', 'percentage', 'hours', 'calls', 'visits'], 
    required: true 
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    year: { type: Number, required: true },
    month: Number,
    week: Number,
    day: Number
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
  assignedTo: { type: String, required: true },
  createdBy: { type: String, required: true },
  progress: {
    percentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    milestones: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true },
      description: String
    }]
  },
  rewards: {
    enabled: { type: Boolean, default: false },
    description: String,
    points: { type: Number, default: 0 }
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    threshold: { type: Number, default: 80 }
  },
  tags: [String],
  isRecurring: { type: Boolean, default: false },
  parentGoal: String
}, { timestamps: true });

// Schema de Notificação
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['goal_achieved', 'goal_milestone', 'goal_created', 'goal_updated', 'goal_completed', 'system', 'warning', 'info'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  relatedEntity: String,
  relatedEntityType: { 
    type: String, 
    enum: ['goal', 'sale', 'proposal', 'client', 'distributor'] 
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  data: mongoose.Schema.Types.Mixed,
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Função para gerar SKU único
const generateSKU = () => {
  const prefix = 'PROD';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Função para gerar número de venda único
const generateSaleNumber = () => {
  const prefix = 'VENDA';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Função para gerar número de proposta único
const generateProposalNumber = () => {
  const prefix = 'PROP';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Middleware para gerar SKU automaticamente
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = generateSKU();
  }
  next();
});

// Middleware para gerar número de venda automaticamente
SaleSchema.pre('save', function(next) {
  if (!this.saleNumber) {
    this.saleNumber = generateSaleNumber();
  }
  next();
});

// Middleware para gerar número de proposta automaticamente
ProposalSchema.pre('save', function(next) {
  if (!this.proposalNumber) {
    this.proposalNumber = generateProposalNumber();
  }
  next();
});

// Exportar modelos
module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
  Distributor: mongoose.models.Distributor || mongoose.model('Distributor', DistributorSchema),
  Client: mongoose.models.Client || mongoose.model('Client', ClientSchema),
  PriceList: mongoose.models.PriceList || mongoose.model('PriceList', PriceListSchema),
  Proposal: mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema),
  Sale: mongoose.models.Sale || mongoose.model('Sale', SaleSchema),
  Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
  Goal: mongoose.models.Goal || mongoose.model('Goal', GoalSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
};
