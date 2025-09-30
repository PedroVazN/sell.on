const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-sable-eta-89.vercel.app/api';

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

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface Distributor {
  _id: string;
  apelido?: string;
  razaoSocial?: string;
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

export interface PriceListItem {
  _id: string;
  distributor: Distributor;
  product: Product;
  pricing: {
    aVista: number;
    tresXBoleto: number;
    tresXCartao: number;
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
      cartao: number;
      boleto: number;
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
    price: number;
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
  };
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentCondition: string;
  observations?: string;
  status: 'negociacao' | 'venda_fechada' | 'venda_perdida' | 'expirada';
  validUntil: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
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
  assignedTo: User;
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
  type: 'goal_achieved' | 'goal_milestone' | 'goal_created' | 'goal_updated' | 'goal_completed' | 'system' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipient: string;
  sender: string;
  relatedEntity?: string;
  relatedEntityType?: 'goal' | 'sale' | 'proposal' | 'client' | 'distributor';
  isRead: boolean;
  readAt?: string;
  data: any;
  expiresAt?: string;
  isActive: boolean;
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
  data: User;
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
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('Fazendo requisição para:', url);
    console.log('Headers:', config.headers);
    console.log('Token:', this.token);

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
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.token = 'dummy-token'; // Em produção, usar JWT real
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
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
    localStorage.removeItem('currentUser');
  }


  // Produtos
  async getProducts(page = 1, limit = 10, search?: string, category?: string): Promise<ApiResponse<Product[]>> {
    let url = `/products?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    
    return this.request<Product[]>(url);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
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
  async getProposals(page = 1, limit = 10, status?: string, search?: string): Promise<ApiResponse<Proposal[]>> {
    let url = `/proposals?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
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
    return this.request<Proposal>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData),
    });
  }

  async deleteProposal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  async getProposalStats(): Promise<ApiResponse<ProposalStats>> {
    return this.request<ProposalStats>('/proposals/stats/summary');
  }

  // Clientes
  async getClients(page = 1, limit = 10, search?: string, uf?: string, classificacao?: string, isActive?: boolean): Promise<ApiResponse<Client[]>> {
    let url = `/clients?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (uf) url += `&uf=${uf}`;
    if (classificacao) url += `&classificacao=${classificacao}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    
    return this.request<Client[]>(url);
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`);
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

  async getClientStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/clients/stats/summary');
  }

  // Distribuidores
  async getDistributors(page = 1, limit = 10, search?: string, origem?: string, isActive?: boolean): Promise<ApiResponse<Distributor[]>> {
    let url = `/distributors?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (origem) url += `&origem=${origem}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    
    return this.request<Distributor[]>(url);
  }

  async getDistributor(id: string): Promise<ApiResponse<Distributor>> {
    return this.request<Distributor>(`/distributors/${id}`);
  }

  async createDistributor(distributorData: Omit<Distributor, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Distributor>> {
    return this.request<Distributor>('/distributors', {
      method: 'POST',
      body: JSON.stringify(distributorData),
    });
  }

  async updateDistributor(id: string, distributorData: Partial<Distributor>): Promise<ApiResponse<Distributor>> {
    return this.request<Distributor>(`/distributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(distributorData),
    });
  }

  async deleteDistributor(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/distributors/${id}`, {
      method: 'DELETE',
    });
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
              tresXBoleto: product.pricing.boleto,
              tresXCartao: product.pricing.cartao
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

  async getPriceListItem(id: string): Promise<ApiResponse<PriceListItem>> {
    return this.request<PriceListItem>(`/price-list/${id}`);
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

  async updateProposalStatus(id: string, status: Proposal['status']): Promise<ApiResponse<Proposal>> {
    return this.request<Proposal>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
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

  // Metas
  async getGoals(page = 1, limit = 50, search = '', type?: string, category?: string, status?: string, assignedTo?: string, startDate?: string, endDate?: string): Promise<ApiResponse<Goal[]>> {
    let url = `/goals?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (type) url += `&type=${type}`;
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    if (assignedTo) url += `&assignedTo=${assignedTo}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.request<Goal[]>(url);
  }

  async getGoal(id: string): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}`);
  }

  async createGoal(goalData: CreateGoalData): Promise<ApiResponse<Goal>> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(id: string, goalData: UpdateGoalData): Promise<ApiResponse<Goal>> {
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

  async getGoalsDashboard(period: 'day' | 'week' | 'month' | 'year' = 'month', userId?: string): Promise<ApiResponse<any>> {
    let url = `/goals/dashboard?period=${period}`;
    if (userId) url += `&userId=${userId}`;
    return this.request<any>(url);
  }

  async updateGoalProgress(id: string, value: number, description?: string): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ value, description }),
    });
  }

  async updateGoalStatus(id: string, status: Goal['status']): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`/goals/${id}/status`, {
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

  // ===== USUÁRIOS =====
  async getUsers(page = 1, limit = 20, search = '', role = ''): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role })
    });
    return this.request<User[]>(`/users?${params}`);
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
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
  }): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
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

  // Método público para requisições customizadas
  async customRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
