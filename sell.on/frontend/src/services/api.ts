// API Base URL - Atualizado para deploy - Vercel trigger
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backendsellon.vercel.app/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor' | 'cliente';
  phone?: string;
  address?: {
    street?: string;  
    
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  expiresAt?: string;
  createdBy: User;
  targetRoles: ('admin' | 'vendedor' | 'all')[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'sales' | 'revenue' | 'clients' | 'proposals' | 'calls' | 'visits' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: 'quantity' | 'currency' | 'percentage' | 'hours' | 'calls' | 'visits';
  period: {
    startDate: string;
    endDate: string;
    year: number;
    month?: number;
    week?: number;
    day?: number;
  };
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  createdBy: User;
  progress: {
    percentage: number;
    lastUpdated: string;
    milestones: Array<{
      date: string;
      value: number;
      description: string;
    }>;
  };
  rewards?: {
    enabled: boolean;
    description?: string;
    points: number;
  };
  notifications?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    threshold: number;
  };
  tags?: string[];
  isRecurring: boolean;
  parentGoal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string; // Agora obrigatório
  price?: number; // Agora opcional
  cost?: number;
  category: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  stock: {
    current: number;
    min: number;
    max?: number;
  };
  images?: Array<{
    url: string;
    alt: string;
  }>;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  _id: string;
  saleNumber: string;
  customer: User;
  seller: User;
  items: Array<{
    product: Product;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'cheque';
  paymentStatus: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  status: 'rascunho' | 'finalizada' | 'cancelada' | 'devolvida';
  notes?: string;
  deliveryDate?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface ProposalStats {
  totalProposals: number;
  draftProposals: number;
  sentProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  expiredProposals: number;
}

export interface Client {
  _id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  contato: {
    nome: string;
    email: string;
    telefone: string;
    cargo?: string;
  };
  endereco: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf: string;
  };
  classificacao: 'PROVEDOR' | 'REVENDA' | 'OUTROS';
  observacoes?: string;
  isActive: boolean;
  createdBy: User;
  /** Vendedor responsável pela carteira (gestão de carteira) */
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientAccessRequest {
  _id: string;
  client: { _id: string; razaoSocial?: string; nomeFantasia?: string; cnpj?: string; contato?: { nome?: string; email?: string } };
  requestedBy: { _id: string; name?: string; email?: string };
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string | null;
  respondedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultaClienteDistribuidor {
  _id?: string;
  apelido?: string;
  razaoSocial?: string;
  propostas: number;
}

export interface ConsultaClienteItem {
  client: Client;
  totalPropostas: number;
  vendasFechadas: number;
  vendasPerdidas: number;
  valorTotalFechado: number;
  topProdutos: Array<{ name: string; quantity: number; total: number }>;
  distribuidores?: ConsultaClienteDistribuidor[];
}

export interface ConsultaClienteDetail extends ConsultaClienteItem {
  ultimasPropostas: Array<{ _id: string; proposalNumber?: string; total?: number; closedAt?: string }>;
}

export interface CnpjLookupResult {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  dataSituacaoCadastral: string;
  cnaePrincipal: string;
  telefone: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  risk: {
    level: 'baixo' | 'medio' | 'alto';
    blocked: boolean;
    status: 'ok' | 'alerta' | 'bloqueado';
    reason: string;
    inconsistencies: string[];
  };
}

export interface Distributor {
  _id: string;
  apelido?: string;
  razaoSocial?: string;
  cnpj?: string;
  idDistribuidor?: string;
  contato?: {
    nome: string;
    email: string;
    telefone: string;
    cargo?: string;
  };
  origem?: string;
  atendimento?: {
    horario?: string;
    dias?: string;
    observacoes?: string;
  };
  frete?: {
    tipo: 'CIF' | 'FOB' | 'TERCEIRO';
    valor?: number;
    prazo?: number;
    observacoes?: string;
  };
  pedidoMinimo?: {
    valor: number;
    observacoes?: string;
  };
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  isActive: boolean;
  observacoes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  // Propriedades para compatibilidade com estruturas antigas
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactPerson?: {
    name: string;
    position?: string;
  };
  notes?: string;
}

export interface PriceOption {
  parcelas: number;
  preco: number;
}

export interface PriceListItem {
  _id: string;
  distributor: Distributor;
  product: Product;
  pricing: {
    aVista: number;
    credito: PriceOption[];
    boleto: PriceOption[];
  };
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface PriceList {
  _id: string;
  distributor: {
    _id: string;
    apelido: string;
    razaoSocial: string;
    contato: {
      nome: string;
      telefone: string;
    };
  };
  products: Array<{
    _id: string;
    product: {
      _id: string;
      name: string;
      description: string;
      category: string;
    };
    pricing: {
      aVista: number;
      credito: PriceOption[];
      boleto: PriceOption[];
    };
    isActive: boolean;
    validFrom: string;
    validUntil: string;
    notes: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProposalItem {
  product: {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    price?: number; // Agora opcional
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Proposal {
  _id: string;
  proposalNumber: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    cnpj?: string;
    razaoSocial?: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  distributor: {
    _id: string;
    apelido?: string;
    razaoSocial?: string;
    cnpj?: string;
  };
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentCondition: string;
  observations?: string;
  status: 'negociacao' | 'aguardando_pagamento' | 'venda_fechada' | 'venda_perdida' | 'expirada';
  lossReason?: 'preco_concorrente' | 'condicao_pagamento' | 'sem_retorno' | 'credito_negado' | 'concorrencia_marca' | 'adiamento_compra' | 'cotacao_preco' | 'perca_preco' | 'perda_preco' | 'urgencia_comprou_local' | 'golpe' | 'licitacao' | 'fechado_outro_parceiro' | 'prazo_entrega' | 'qualidade_produto' | 'atendimento' | 'cliente_desistiu' | 'outro';
  lossDescription?: string;
  lossDate?: string;
  closedAt?: string;
  validUntil: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalScoreFactor {
  score: number;
  weight: number;
  description: string;
  [key: string]: any;
}

export interface ProposalScore {
  score: number;
  percentual: number;
  level: 'alto' | 'medio' | 'baixo' | 'muito_baixo';
  action: string;
  factors: {
    sellerConversion?: ProposalScoreFactor;
    clientHistory?: ProposalScoreFactor;
    value?: ProposalScoreFactor;
    time?: ProposalScoreFactor;
    products?: ProposalScoreFactor;
    paymentCondition?: ProposalScoreFactor;
    discount?: ProposalScoreFactor;
    seasonality?: ProposalScoreFactor;
    engagement?: ProposalScoreFactor;
    patterns?: ProposalScoreFactor;
  };
  confidence?: number;
  calculatedAt?: string;
  error?: string;
  method?: string;
  algorithmVersion?: string;
  [key: string]: any;
}

export interface ProposalWithScore extends Proposal {
  aiScore: ProposalScore | null;
}

/** Mensagem do chat da proposta (vendedor <-> admin) */
export interface ProposalChatMessage {
  _id: string;
  sender: User | { _id: string; name: string; email: string; role?: string };
  text: string;
  createdAt: string;
}

/** Chat vinculado a uma proposta: vendedor troca mensagens com admin */
export interface ProposalChat {
  _id: string;
  proposal: { _id: string; proposalNumber: string; client?: { name: string }; seller?: { name: string } };
  vendedor: User | { _id: string; name: string; email: string };
  messages: ProposalChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProposalVideoRoom {
  proposalId: string;
  proposalNumber?: string;
  roomName: string;
  roomUrl: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: 'meeting' | 'call' | 'visit' | 'follow_up' | 'proposal' | 'sale' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  client?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  distributor?: {
    _id: string;
    apelido: string;
    razaoSocial: string;
  };
  location?: string;
  notes?: string;
  reminder?: {
    enabled: boolean;
    minutes: number;
  };
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'sales' | 'revenue' | 'clients' | 'proposals' | 'calls' | 'visits' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: 'quantity' | 'currency' | 'percentage' | 'hours' | 'calls' | 'visits';
  period: {
    startDate: string;
    endDate: string;
    year: number;
    month?: number;
    week?: number;
    day?: number;
  };
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  createdBy: User;
  progress: {
    percentage: number;
    lastUpdated: string;
    milestones: Array<{
      date: string;
      value: number;
      description: string;
    }>;
  };
  rewards?: {
    enabled: boolean;
    description?: string;
    points: number;
  };
  notifications?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    threshold: number;
  };
  tags?: string[];
  isRecurring: boolean;
  parentGoal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'goal_achieved' | 'goal_milestone' | 'goal_created' | 'goal_updated' | 'goal_completed' | 'system' | 'warning' | 'info' | 'notice' | 'chat_message' | 'client_access_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipient: string;
  sender: string;
  relatedEntity?: string;
  relatedEntityType?: 'goal' | 'sale' | 'proposal' | 'client' | 'distributor' | 'notice' | 'client_access_request';
  isRead: boolean;
  readAt?: string;
  data?: { requestId?: string; clientId?: string; clientRazao?: string; requestedByName?: string; requestedByEmail?: string };
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdBy?: Pick<User, '_id' | 'name' | 'email'>;
  completedBy?: Pick<User, '_id' | 'name' | 'email'> | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para operações de API que usam IDs em vez de objetos completos
export interface CreateGoalData {
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'sales' | 'revenue' | 'clients' | 'proposals' | 'calls' | 'visits' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: 'quantity' | 'currency' | 'percentage' | 'hours' | 'calls' | 'visits';
  period: {
    startDate: string;
    endDate: string;
    year: number;
    month?: number;
    week?: number;
    day?: number;
  };
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string; // ID do usuário
  tags?: string[];
  isRecurring: boolean;
  parentGoal?: string;
  rewards?: {
    enabled: boolean;
    description?: string;
    points: number;
  };
  notifications?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    threshold: number;
  };
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  assignedTo?: string; // ID do usuário
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'vendedor' | 'cliente';
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  cached?: boolean;
  cacheAge?: number;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

interface CacheEntry<T> {
  data: ApiResponse<T>;
  at: number;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  private cacheGet<T>(key: string): ApiResponse<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() - entry.at > CACHE_TTL_MS) {
      if (entry) this.cache.delete(key);
      return null;
    }
    return { ...entry.data, cached: true, cacheAge: Date.now() - entry.at };
  }

  private cacheSet<T>(key: string, data: ApiResponse<T>): void {
    this.cache.set(key, { data: { ...data }, at: Date.now() });
  }

  private cacheInvalidate(prefix: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith(prefix)) this.cache.delete(key);
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Sempre buscar o token mais recente
    const currentToken = this.token || localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('Fazendo requisição para:', url);
    console.log('Headers:', config.headers);
    console.log('Token:', currentToken);

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Resposta não é JSON. Content-Type: ${contentType}`);
      }

      const data = await response.json();

      console.log('Resposta da API:', response.status, data);

      if (!response.ok) {
        // Se houver erros de validação, incluir detalhes
        const errorMessage = data.message || data.error || 'Erro na requisição';
        const errorDetails = data.errors ? `\nDetalhes: ${JSON.stringify(data.errors, null, 2)}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<{ user: User; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('token', this.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }

    return response as LoginResponse;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }


  // Produtos (com cache 2 min para listagens)
  async getProducts(page = 1, limit = 10, search?: string, category?: string): Promise<ApiResponse<Product[]>> {
    const cacheKey = `products:${page}:${limit}:${search ?? ''}:${category ?? ''}`;
    const cached = this.cacheGet<Product[]>(cacheKey);
    if (cached) return cached;

    let url = `/products?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const res = await this.request<Product[]>(url);
    this.cacheSet(cacheKey, res);
    return res;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    const res = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    this.cacheInvalidate('products:');
    return res;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    this.cacheInvalidate('products:');
    return res;
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const res = await this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
    this.cacheInvalidate('products:');
    return res;
  }

  async updateProductStock(id: string, stock: { current: number; min?: number; max?: number }): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify(stock),
    });
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/products/categories/list');
  }

  // Vendas
  async getSales(page = 1, limit = 10, status?: string, paymentStatus?: string): Promise<ApiResponse<Sale[]>> {
    let url = `/sales?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
    
    return this.request<Sale[]>(url);
  }

  async getSale(id: string): Promise<ApiResponse<Sale>> {
    return this.request<Sale>(`/sales/${id}`);
  }

  async createSale(saleData: Omit<Sale, '_id' | 'saleNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Sale>> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async updateSaleStatus(id: string, status: string, paymentStatus?: string): Promise<ApiResponse<Sale>> {
    return this.request<Sale>(`/sales/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus }),
    });
  }

  async getSalesStats(startDate?: string, endDate?: string): Promise<ApiResponse<{
    totalSales: number;
    totalRevenue: number;
    averageSale: number;
    totalItems: number;
  }>> {
    let url = '/sales/stats/summary';
    if (startDate) url += `?startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.request(url);
  }

  async getSalesDetailedStats(startDate?: string, endDate?: string): Promise<ApiResponse<{
    general: {
      totalSales: number;
      finalizadaSales: number;
      canceladaSales: number;
      devolvidaSales: number;
      rascunhoSales: number;
      totalRevenue: number;
      averageSale: number;
      totalItems: number;
    };
    paymentStatus: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
    paymentMethod: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
    monthly: Array<{
      _id: { year: number; month: number };
      sales: number;
      revenue: number;
    }>;
    topSellers: Array<{
      seller: {
        _id: string;
        name: string;
        email: string;
      };
      sales: number;
      revenue: number;
    }>;
  }>> {
    let url = '/sales/stats/detailed';
    if (startDate) url += `?startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.request(url);
  }

  // Propostas
  async getProposals(
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
    seller?: string,
    dateFrom?: string,
    dateTo?: string,
    closedDateFrom?: string,
    closedDateTo?: string
  ): Promise<ApiResponse<Proposal[]>> {
    let url = `/proposals?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (seller) url += `&seller=${encodeURIComponent(seller)}`;
    if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
    if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;
    if (closedDateFrom) url += `&closedDateFrom=${encodeURIComponent(closedDateFrom)}`;
    if (closedDateTo) url += `&closedDateTo=${encodeURIComponent(closedDateTo)}`;
    return this.request<Proposal[]>(url);
  }

  async getProposal(id: string): Promise<ApiResponse<Proposal>> {
    return this.request<Proposal>(`/proposals/${id}`);
  }

  async createProposal(proposalData: Omit<Proposal, '_id' | 'proposalNumber' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Proposal>> {
    return this.request<Proposal>('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async updateProposal(id: string, proposalData: Partial<Proposal>): Promise<ApiResponse<Proposal>> {
    console.log('🔧 EDITANDO PROPOSTA - Frontend');
    console.log('ID:', id);
    console.log('Dados:', proposalData);
    console.log('Rota:', `/proposals/${id}/edit`);
    
    return this.request<Proposal>(`/proposals/${id}/edit`, {
      method: 'PUT',
      body: JSON.stringify(proposalData),
    });
  }

  async deleteProposal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  /** Ranking de vendedores: vendas fechadas, perdidas, valor no período */
  async getProposalsRanking(dateFrom?: string, dateTo?: string): Promise<ApiResponse<{
    data: Array<{
      _id: string;
      name: string;
      email: string;
      position: number;
      totalPropostas: number;
      vendasFechadas: number;
      vendasPerdidas: number;
      valorFechado: number;
    }>;
    dateFrom: string;
    dateTo: string;
  }>> {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/proposals/ranking${q}`);
  }

  /** Detalhe do ranking por vendedor: mensal out/2025 até agora */
  async getProposalsRankingDetail(sellerId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<{
    seller: { _id: string; name: string; email: string };
    monthly: Array<{
      year: number;
      month: number;
      label: string;
      totalPropostas: number;
      vendasFechadas: number;
      vendasPerdidas: number;
      valorFechado: number;
    }>;
    summary: {
      totalPropostas: number;
      vendasFechadas: number;
      vendasPerdidas: number;
      valorFechado: number;
    };
    dateFrom: string;
    dateTo: string;
  }>> {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/proposals/ranking/${sellerId}/detail${q}`);
  }

  /** Versículo aleatório (ABíbliaDigital via backend) */
  async getRandomVerse(): Promise<ApiResponse<{
    book: string;
    chapter: number;
    number: string;
    text: string;
    reference: string;
  }>> {
    return this.request('/verse/random');
  }

  async getProposalStats(): Promise<ApiResponse<ProposalStats>> {
    return this.request<ProposalStats>('/proposals/stats/summary');
  }

  // Clientes
  async getClients(
    page = 1,
    limit = 10,
    search?: string,
    uf?: string,
    classificacao?: string,
    isActive?: boolean,
    carteira?: 'me' | string
  ): Promise<ApiResponse<Client[]>> {
    let url = `/clients?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (uf) url += `&uf=${uf}`;
    if (classificacao) url += `&classificacao=${classificacao}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    if (carteira === 'me') url += '&carteira=me';
    else if (carteira) url += `&assignedTo=${encodeURIComponent(carteira)}`;
    return this.request<Client[]>(url);
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`);
  }

  /** Consulta de clientes: lista com estatísticas (propostas, vendas, top produtos) */
  async getClientesConsulta(
    page = 1,
    limit = 20,
    search?: string,
    uf?: string,
    classificacao?: string,
    orderBy?: string,
    order?: 'asc' | 'desc'
  ): Promise<ApiResponse<ConsultaClienteItem[]>> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (uf) params.set('uf', uf);
    if (classificacao) params.set('classificacao', classificacao);
    if (orderBy) params.set('orderBy', orderBy);
    if (order) params.set('order', order);
    return this.request<ConsultaClienteItem[]>(`/clients/consulta?${params.toString()}`);
  }

  /** Detalhe da consulta de um cliente (estatísticas + top produtos + últimas propostas) */
  async getClienteConsultaDetail(clientId: string): Promise<ApiResponse<ConsultaClienteDetail>> {
    return this.request<ConsultaClienteDetail>(`/clients/consulta/${clientId}`);
  }

  async lookupCnpj(cnpj: string): Promise<ApiResponse<CnpjLookupResult>> {
    const clean = cnpj.replace(/\D/g, '');
    return this.request<CnpjLookupResult>(`/cnpj/${clean}`);
  }

  async createClient(clientData: Omit<Client, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async getClientStats(carteira?: 'me'): Promise<ApiResponse<any>> {
    const url = carteira === 'me' ? '/clients/stats/summary?carteira=me' : '/clients/stats/summary';
    return this.request<any>(url);
  }

  /** Solicitações de uso de cliente (onde eu sou o dono da carteira) */
  async getClientAccessRequests(): Promise<ApiResponse<ClientAccessRequest[]>> {
    return this.request<ClientAccessRequest[]>('/clients/access-requests');
  }

  async approveClientAccessRequest(requestId: string): Promise<ApiResponse<ClientAccessRequest>> {
    return this.request<ClientAccessRequest>(`/clients/access-requests/${requestId}/approve`, { method: 'POST' });
  }

  async rejectClientAccessRequest(requestId: string, message?: string): Promise<ApiResponse<ClientAccessRequest>> {
    return this.request<ClientAccessRequest>(`/clients/access-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(message != null ? { message } : {}),
    });
  }

  /** Transferir clientes da carteira para outro vendedor */
  async transferClients(clientIds: string[], targetUserId: string): Promise<ApiResponse<{ modifiedCount: number; message: string }>> {
    return this.request<{ modifiedCount: number; message: string }>('/clients/transfer', {
      method: 'POST',
      body: JSON.stringify({ clientIds, targetUserId }),
    });
  }

  /** Admin: resumo das carteiras por vendedor (total de clientes em cada carteira) */
  async getCarteirasSummary(): Promise<ApiResponse<{ _id: string; name: string; email: string; totalClients: number }[]>> {
    return this.request<{ _id: string; name: string; email: string; totalClients: number }[]>('/clients/carteiras/summary');
  }

  // Distribuidores (com cache 2 min)
  async getDistributors(page = 1, limit = 10, search?: string, origem?: string, isActive?: boolean): Promise<ApiResponse<Distributor[]>> {
    const cacheKey = `distributors:${page}:${limit}:${search ?? ''}:${origem ?? ''}:${isActive ?? ''}`;
    const cached = this.cacheGet<Distributor[]>(cacheKey);
    if (cached) return cached;

    let url = `/distributors?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (origem) url += `&origem=${origem}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const res = await this.request<Distributor[]>(url);
    this.cacheSet(cacheKey, res);
    return res;
  }

  async getDistributor(id: string): Promise<ApiResponse<Distributor>> {
    return this.request<Distributor>(`/distributors/${id}`);
  }

  async createDistributor(distributorData: Omit<Distributor, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Distributor>> {
    const res = await this.request<Distributor>('/distributors', {
      method: 'POST',
      body: JSON.stringify(distributorData),
    });
    this.cacheInvalidate('distributors:');
    return res;
  }

  async updateDistributor(id: string, distributorData: Partial<Distributor>): Promise<ApiResponse<Distributor>> {
    const res = await this.request<Distributor>(`/distributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(distributorData),
    });
    this.cacheInvalidate('distributors:');
    return res;
  }

  async deleteDistributor(id: string): Promise<ApiResponse<void>> {
    const res = await this.request<void>(`/distributors/${id}`, {
      method: 'DELETE',
    });
    this.cacheInvalidate('distributors:');
    return res;
  }

  // Lista de Preços
  async getPriceList(page = 1, limit = 10, distributor?: string, product?: string, isActive?: boolean): Promise<ApiResponse<PriceList[]>> {
    let url = `/price-list?page=${page}&limit=${limit}`;
    if (distributor) url += `&distributor=${distributor}`;
    if (product) url += `&product=${product}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    
    return this.request<PriceList[]>(url);
  }

  async getPriceListItems(page = 1, limit = 10, distributor?: string, product?: string, isActive?: boolean): Promise<ApiResponse<PriceListItem[]>> {
    // Buscar as listas e extrair os itens individuais
    const response = await this.getPriceList(page, limit, distributor, product, isActive);
    
    if (response.success && response.data) {
      // Flatten all products from all price lists into individual items
      const items: PriceListItem[] = [];
      response.data.forEach(priceList => {
        priceList.products.forEach(product => {
          items.push({
            _id: product._id,
            distributor: {
              _id: priceList.distributor._id,
              apelido: priceList.distributor.apelido,
              razaoSocial: priceList.distributor.razaoSocial,
              idDistribuidor: 'DIST001', // Valor padrão
              contato: {
                nome: priceList.distributor.contato.nome,
                email: 'contato@distribuidor.com', // Valor padrão
                telefone: priceList.distributor.contato.telefone,
                cargo: 'Representante'
              },
              origem: 'Sistema', // Valor padrão
              atendimento: {
                horario: '08:00 às 18:00', // Valor padrão
                dias: 'Segunda a Sexta', // Valor padrão
                observacoes: 'Atendimento padrão' // Valor padrão
              },
              frete: {
                tipo: 'CIF', // Valor padrão
                valor: 0, // Valor padrão
                prazo: 3, // Valor padrão
                observacoes: 'Frete padrão' // Valor padrão
              },
              pedidoMinimo: {
                valor: 0, // Valor padrão
                observacoes: 'Sem mínimo' // Valor padrão
              },
              endereco: {
                cep: '00000-000', // Valor padrão
                logradouro: 'N/A', // Valor padrão
                numero: 'N/A', // Valor padrão
                complemento: 'N/A', // Valor padrão
                bairro: 'N/A', // Valor padrão
                cidade: 'N/A', // Valor padrão
                uf: 'N/A' // Valor padrão
              },
              isActive: true,
              observacoes: 'Distribuidor do sistema', // Valor padrão
              createdBy: {
                _id: '1',
                name: 'Administrador',
                email: 'admin@sellone.com',
                role: 'admin',
                phone: '11999999999',
                isActive: true,
                createdAt: priceList.createdAt,
                updatedAt: priceList.updatedAt
              },
              createdAt: priceList.createdAt,
              updatedAt: priceList.updatedAt
            },
            product: {
              _id: product.product._id,
              name: product.product.name,
              description: product.product.description,
              price: 0, // Valor padrão
              cost: 0, // Valor padrão
              category: product.product.category,
              brand: 'N/A', // Valor padrão
              sku: 'N/A', // Valor padrão
              barcode: 'N/A', // Valor padrão
              stock: {
                current: 0,
                min: 0,
                max: 0
              },
              images: [],
              tags: [],
              isActive: true,
              createdAt: priceList.createdAt,
              updatedAt: priceList.updatedAt
            },
            pricing: {
              aVista: product.pricing.aVista,
              credito: product.pricing.credito || [],
              boleto: product.pricing.boleto || []
            },
            isActive: product.isActive,
            validFrom: product.validFrom,
            validUntil: product.validUntil,
            notes: product.notes,
            createdBy: {
              _id: priceList.createdBy._id,
              name: priceList.createdBy.name,
              email: priceList.createdBy.email,
              role: 'admin', // Valor padrão
              phone: '11999999999', // Valor padrão
              isActive: true, // Valor padrão
              createdAt: priceList.createdAt,
              updatedAt: priceList.updatedAt
            },
            createdAt: priceList.createdAt,
            updatedAt: priceList.updatedAt
          });
        });
      });
      
      return {
        success: true,
        data: items,
        pagination: response.pagination
      };
    }
    
    return {
      success: false,
      data: [],
      pagination: response.pagination
    };
  }

  async getPriceLists(page: number = 1, limit: number = 10): Promise<ApiResponse<PriceList[]>> {
    return this.request<PriceList[]>(`/price-list?page=${page}&limit=${limit}`);
  }

  async getPriceListItem(id: string): Promise<ApiResponse<PriceListItem>> {
    return this.request<PriceListItem>(`/price-list/${id}`);
  }

  async createPriceList(priceListData: { distributorId: string; products: any[] }): Promise<ApiResponse<any>> {
    return this.request<any>('/price-list', {
      method: 'POST',
      body: JSON.stringify(priceListData),
    });
  }

  async createPriceListItem(priceData: Omit<PriceListItem, '_id' | 'distributor' | 'product' | 'createdBy' | 'createdAt' | 'updatedAt'> & { distributor: string; product: string }): Promise<ApiResponse<PriceListItem>> {
    return this.request<PriceListItem>('/price-list', {
      method: 'POST',
      body: JSON.stringify(priceData),
    });
  }

  async updatePriceListItem(id: string, priceData: Partial<PriceListItem>): Promise<ApiResponse<PriceListItem>> {
    return this.request<PriceListItem>(`/price-list/${id}`, {
      method: 'PUT',
      body: JSON.stringify(priceData),
    });
  }

  async deletePriceListItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/price-list/${id}`, {
      method: 'DELETE',
    });
  }

  async deletePriceList(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/price-list/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProposalStatus(id: string, status: Proposal['status'], lossReason?: string, lossDescription?: string): Promise<ApiResponse<Proposal>> {
    return this.request<Proposal>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, lossReason, lossDescription }),
    });
  }

  // AI Score
  async getProposalScore(id: string): Promise<ApiResponse<ProposalScore>> {
    return this.request<ProposalScore>(`/proposals/${id}/score`, {
      method: 'POST',
    });
  }

  async getProposalsWithScores(page = 1, limit = 10, status?: string, search?: string): Promise<ApiResponse<ProposalWithScore[]>> {
    let url = `/proposals/with-scores/list?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    return this.request<ProposalWithScore[]>(url);
  }

  // AI Dashboard
  async getAIDashboard(): Promise<ApiResponse<any>> {
    return this.request('/ai/dashboard');
  }

  async getAIInsights(): Promise<ApiResponse<any>> {
    return this.request('/ai/insights');
  }

  async getAIAnomalies(): Promise<ApiResponse<any>> {
    return this.request('/ai/anomalies');
  }

  async getProductRecommendations(proposal?: any, selectedProducts?: any[], limit?: number): Promise<ApiResponse<any>> {
    return this.request('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ proposal, selectedProducts, limit })
    });
  }

  async getPopularProducts(limit?: number): Promise<ApiResponse<any>> {
    return this.request(`/ai/recommendations/popular?limit=${limit || 10}`);
  }

  async getPriceListByDistributor(distributorId: string, page = 1, limit = 10): Promise<ApiResponse<PriceListItem[]>> {
    return this.request<PriceListItem[]>(`/price-list/distributor/${distributorId}?page=${page}&limit=${limit}`);
  }

  async getProposalsDashboardSales(): Promise<ApiResponse<{
    salesStats: {
      totalRevenue: number;
      totalSales: number;
      averageSale: number;
      totalItems: number;
    };
    topProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
      quantity: number;
    }>;
    monthlyData: Array<{
      month: number;
      year: number;
      revenue: number;
      sales: number;
    }>;
  }>> {
    return this.request(`/proposals/dashboard/sales`);
  }

  async getProposalsDashboardStats(): Promise<ApiResponse<{
    proposalStats: {
      totalProposals: number;
      negociacaoProposals: number;
      vendaFechadaProposals: number;
      vendaPerdidaProposals: number;
      expiradaProposals: number;
    };
    salesStats: {
      totalRevenue: number;
      totalSales: number;
      averageSale: number;
    };
  }>> {
    return this.request(`/proposals/dashboard/stats`);
  }

  async getProposalsTopPerformers(): Promise<ApiResponse<{
    topDistributors: Array<{
      _id: string;
      apelido: string;
      razaoSocial: string;
      totalProposals: number;
      vendaFechadaProposals: number;
      totalRevenue: number;
    }>;
    topProducts: Array<{
      _id: string;
      totalQuantity: number;
      totalRevenue: number;
      proposals: number;
    }>;
    topSellers: Array<{
      _id: string;
      name: string;
      email: string;
      totalProposals: number;
      vendaFechadaProposals: number;
      totalRevenue: number;
    }>;
  }>> {
    return this.request(`/proposals/top-performers`);
  }

  async getVendedorProposals(vendedorId: string, page = 1, limit = 10, status?: string): Promise<{
    success: boolean;
    data: Proposal[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
    stats: {
      totalProposals: number;
      negociacaoProposals: number;
      vendaFechadaProposals: number;
      vendaPerdidaProposals: number;
      expiradaProposals: number;
      totalRevenue: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    
    const url = `${this.baseURL}/proposals/vendedor/${vendedorId}?${params}`;
    const currentToken = this.token || localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro na requisição');
    }
    
    return response.json();
  }

  async getLossReasonsStats(): Promise<ApiResponse<{
    reason: string;
    label: string;
    count: number;
    totalValue: number;
  }[]>> {
    return this.request(`/proposals/dashboard/loss-reasons`);
  }

  /** Obter ou criar chat da proposta (vendedor: só suas propostas; admin: qualquer) */
  async getProposalChat(proposalId: string): Promise<{ success: boolean; data: ProposalChat }> {
    return this.request<ProposalChat>(`/proposal-chats?proposalId=${encodeURIComponent(proposalId)}`);
  }

  /** Listar chats: admin = todos, vendedor = apenas os seus */
  async getProposalChatList(): Promise<{ success: boolean; data: ProposalChat[] }> {
    return this.request<ProposalChat[]>(`/proposal-chats/list`);
  }

  /** Obter um chat por ID */
  async getProposalChatById(chatId: string): Promise<{ success: boolean; data: ProposalChat }> {
    return this.request<ProposalChat>(`/proposal-chats/${chatId}`);
  }

  /** Enviar mensagem no chat da proposta */
  async sendProposalChatMessage(chatId: string, text: string): Promise<{ success: boolean; data: ProposalChat }> {
    return this.request<ProposalChat>(`/proposal-chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /** Excluir chat da proposta (admin: qualquer; vendedor: apenas o próprio) */
  async deleteProposalChat(chatId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/proposal-chats/${chatId}`, { method: 'DELETE' });
  }

  /** Obter (ou criar) sala de videochamada da proposta no Daily.co */
  async getProposalVideoRoom(proposalId: string): Promise<ApiResponse<ProposalVideoRoom>> {
    return this.request<ProposalVideoRoom>(`/video/rooms/proposal/${proposalId}`);
  }

  // Eventos do Calendário
  async getEvents(page = 1, limit = 100, search = '', startDate?: string, endDate?: string): Promise<ApiResponse<Event[]>> {
    let url = `/events?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.request<Event[]>(url);
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(eventData: Omit<Event, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Event>> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>(`/events/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getEventsByType(type: Event['type']): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>(`/events/type/${type}`);
  }

  async updateEventStatus(id: string, status: Event['status']): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }


  // ===== NOTIFICAÇÕES =====
  async getNotifications(page = 1, limit = 20, unreadOnly = false, type?: string): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
      ...(type && { type })
    });
    return this.request<Notification[]>(`/notifications?${params}`);
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/clear-all', {
      method: 'DELETE',
    });
  }

  // ===== USUÁRIOS (com cache 2 min) =====
  async getUsers(page = 1, limit = 20, search = '', role = ''): Promise<ApiResponse<User[]>> {
    const cacheKey = `users:${page}:${limit}:${search}:${role}`;
    const cached = this.cacheGet<User[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role })
    });
    const res = await this.request<User[]>(`/users?${params}`);
    this.cacheSet(cacheKey, res);
    return res;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'vendedor' | 'cliente';
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  }): Promise<ApiResponse<User>> {
    const res = await this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.cacheInvalidate('users:');
    return res;
  }

  async updateUser(id: string, userData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    isActive?: boolean;
    role?: 'admin' | 'vendedor' | 'cliente';
  }): Promise<ApiResponse<User>> {
    const res = await this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    this.cacheInvalidate('users:');
    return res;
  }

  async updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const res = await this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
    this.cacheInvalidate('users:');
    return res;
  }

  async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admin: number;
      vendedor: number;
      cliente: number;
    };
  }>> {
    return this.request('/users/stats/overview');
  }

  // ===== CHECKLIST DE IMPLEMENTOS =====
  async getChecklistItems(): Promise<ApiResponse<ChecklistItem[]>> {
    return this.request<ChecklistItem[]>('/checklist');
  }

  async createChecklistItem(data: { title: string; description?: string }): Promise<ApiResponse<ChecklistItem>> {
    return this.request<ChecklistItem>('/checklist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleChecklistItem(id: string): Promise<ApiResponse<ChecklistItem>> {
    return this.request<ChecklistItem>(`/checklist/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteChecklistItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/checklist/${id}`, {
      method: 'DELETE',
    });
  }

  // Método público para requisições customizadas
  async customRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = this.token || localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ===== AVISOS =====
  
  async getNotices(): Promise<ApiResponse<Notice[]>> {
    return this.request<Notice[]>('/notices');
  }

  async createNotice(noticeData: Partial<Notice>): Promise<ApiResponse<Notice>> {
    return this.request<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  }

  async updateNotice(id: string, noticeData: Partial<Notice>): Promise<ApiResponse<Notice>> {
    return this.request<Notice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    });
  }

  async deleteNotice(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notices/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== METAS =====
  
  async getGoals(page: number = 1, limit: number = 50, filters?: {
    search?: string;
    type?: string;
    category?: string;
    status?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Goal[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    
    return this.request<Goal[]>(`/goals?${params.toString()}`);
  }

  async getGoal(id: string): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}`);
  }

  async createGoal(goalData: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(id: string, goalData: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async updateGoalProgress(id: string, value: number, description?: string): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ value, description }),
    });
  }

  async updateGoalStatus(id: string, status: 'active' | 'completed' | 'paused' | 'cancelled'): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Atualizar metas automaticamente quando proposta é fechada
  async updateGoalsOnProposalClose(sellerId: string, proposalValue: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/goals/update-on-proposal-close`, {
      method: 'POST',
      body: JSON.stringify({ sellerId, proposalValue }),
    });
  }

  // Recalcular todas as metas baseado em vendas reais
  async recalculateAllGoals(): Promise<ApiResponse<{
    goalId: string;
    title: string;
    vendorId: string;
    oldValue: number;
    newValue: number;
    proposalsCount: number;
    percentage: number;
  }[]>> {
    return this.request(`/goals/recalculate`, {
      method: 'POST',
    });
  }

  async getGoalsDashboard(period: 'day' | 'week' | 'month' | 'year' = 'month', userId?: string): Promise<ApiResponse<{
    stats: {
      total: number;
      completed: number;
      active: number;
      averageProgress: number;
      totalTarget: number;
      totalCurrent: number;
    };
    goals: Goal[];
    byCategory: Record<string, {
      total: number;
      completed: number;
      current: number;
      target: number;
    }>;
    byType: Record<string, {
      total: number;
      completed: number;
      current: number;
      target: number;
    }>;
    period: {
      start: string;
      end: string;
    };
  }>> {
    const params = new URLSearchParams({
      period,
      ...(userId && { userId }),
    });
    
    return this.request(`/goals/dashboard?${params.toString()}`);
  }

  // --- Sales Funnel (CRM) ---
  async getFunnelStages(): Promise<ApiResponse<import('../types/funnel').PipelineStage[]>> {
    return this.request('/funnel/stages');
  }

  async createFunnelStage(data: { name: string; order?: number; color?: string; isWon?: boolean; isLost?: boolean }): Promise<ApiResponse<import('../types/funnel').PipelineStage>> {
    return this.request('/funnel/stages', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateFunnelStage(id: string, data: Partial<{ name: string; order: number; color: string; isWon: boolean; isLost: boolean }>): Promise<ApiResponse<import('../types/funnel').PipelineStage>> {
    return this.request(`/funnel/stages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteFunnelStage(id: string): Promise<ApiResponse<import('../types/funnel').PipelineStage>> {
    return this.request(`/funnel/stages/${id}`, { method: 'DELETE' });
  }

  async reorderFunnelStages(orderIds: string[]): Promise<ApiResponse<import('../types/funnel').PipelineStage[]>> {
    return this.request('/funnel/stages/reorder', { method: 'PATCH', body: JSON.stringify({ orderIds }) });
  }

  async getLossReasons(): Promise<ApiResponse<import('../types/funnel').LossReason[]>> {
    return this.request('/funnel/loss-reasons');
  }

  async createLossReason(data: { name: string; order?: number }): Promise<ApiResponse<import('../types/funnel').LossReason>> {
    return this.request('/funnel/loss-reasons', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLossReason(id: string, data: Partial<{ name: string; order: number }>): Promise<ApiResponse<import('../types/funnel').LossReason>> {
    return this.request(`/funnel/loss-reasons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLossReason(id: string): Promise<ApiResponse<void>> {
    return this.request(`/funnel/loss-reasons/${id}`, { method: 'DELETE' });
  }

  async getOpportunities(filters?: { seller?: string; stage?: string; status?: string; dateFrom?: string; dateTo?: string; search?: string }): Promise<ApiResponse<import('../types/funnel').Opportunity[]>> {
    const params = new URLSearchParams();
    if (filters?.seller) params.set('seller', filters.seller);
    if (filters?.stage) params.set('stage', filters.stage);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    if (filters?.search?.trim()) params.set('search', filters.search.trim());
    const q = params.toString();
    return this.request(`/funnel/opportunities${q ? `?${q}` : ''}`);
  }

  async getOpportunity(id: string): Promise<ApiResponse<import('../types/funnel').Opportunity>> {
    return this.request(`/funnel/opportunities/${id}`);
  }

  async createOpportunity(data: {
    client_id: string;
    stage_id: string;
    title: string;
    estimated_value: number;
    responsible_user_id?: string;
    win_probability?: number;
    expected_close_date?: string;
    lead_source?: string;
    description?: string;
    next_activity_at?: string;
  }): Promise<ApiResponse<import('../types/funnel').Opportunity>> {
    return this.request('/funnel/opportunities', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateOpportunity(id: string, data: Partial<{
    client_id: string;
    stage_id: string;
    title: string;
    estimated_value: number;
    responsible_user_id: string;
    win_probability: number;
    expected_close_date: string | null;
    lead_source: string;
    description: string;
    next_activity_at: string | null;
  }>): Promise<ApiResponse<import('../types/funnel').Opportunity>> {
    return this.request(`/funnel/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async moveOpportunityStage(id: string, stage_id: string): Promise<ApiResponse<import('../types/funnel').Opportunity>> {
    return this.request(`/funnel/opportunities/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage_id }) });
  }

  async setOpportunityStatus(id: string, status: 'won' | 'lost', loss_reason_id?: string): Promise<ApiResponse<import('../types/funnel').Opportunity>> {
    const body = status === 'lost' && loss_reason_id ? { status, loss_reason_id } : { status };
    return this.request(`/funnel/opportunities/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async convertOpportunityToSale(id: string, customer_id: string): Promise<ApiResponse<{ opportunity: import('../types/funnel').Opportunity; sale: { _id: string; saleNumber: string } }>> {
    return this.request(`/funnel/opportunities/${id}/convert`, { method: 'POST', body: JSON.stringify({ customer_id }) });
  }

  async deleteOpportunity(id: string): Promise<ApiResponse<void>> {
    return this.request(`/funnel/opportunities/${id}`, { method: 'DELETE' });
  }

  async getOpportunityActivities(opportunityId: string): Promise<ApiResponse<import('../types/funnel').OpportunityActivity[]>> {
    return this.request(`/funnel/opportunities/${opportunityId}/activities`);
  }

  async createOpportunityActivity(opportunityId: string, data: { type: 'task' | 'call' | 'message'; title: string; due_at?: string; notes?: string }): Promise<ApiResponse<import('../types/funnel').OpportunityActivity>> {
    return this.request(`/funnel/opportunities/${opportunityId}/activities`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateOpportunityActivity(activityId: string, data: Partial<{ type: 'task' | 'call' | 'message'; title: string; due_at: string | null; completed_at: string | null; notes: string }>): Promise<ApiResponse<import('../types/funnel').OpportunityActivity>> {
    return this.request(`/funnel/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteOpportunityActivity(activityId: string): Promise<ApiResponse<void>> {
    return this.request(`/funnel/activities/${activityId}`, { method: 'DELETE' });
  }

  /** Sincroniza todas as propostas com o funil (cria/atualiza oportunidade por proposta). Apenas admin. */
  async syncFunnelProposals(): Promise<ApiResponse<{ total: number; created: number; updated: number; skippedNoClient: number }>> {
    return this.request('/funnel/sync-proposals', { method: 'POST' });
  }
}

export const apiService = new ApiService();
