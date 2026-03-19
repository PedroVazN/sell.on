import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, FileText, Plus, Trash2, Calculator, Download, Eye, Sparkles, X, Search, ShieldCheck, ShieldAlert, AlertTriangle, Copy, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { apiService, Product, Distributor, User as UserType, PriceOption, CnpjLookupResult } from '../../services/api';
import { generateProposalPdf, ProposalPdfData } from '../../utils/pdfGenerator';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProposalSuccessModal } from '../../components/ProposalSuccessModal';
import { 
  Container, 
  Header, 
  Title, 
  BackButton,
  FormContainer,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  PriceListTitle,
  PriceListItem,
  ProductName,
  PriceRow,
  PriceLabel,
  PriceValue,
  NoPricesMessage,
  FormSection,
  SectionTitle,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  ProductItem,
  ProductHeader,
  ProductRow,
  ProductInput,
  ProductButton,
  TotalSection,
  TotalRow,
  TotalValue,
  ActionButtons,
  SaveButton,
  GeneratePdfButton,
  CnpjRiskCard,
  CnpjSearchRow,
  CnpjHint,
  RiskBadge,
  CnpjDataGrid,
  CnpjDataItem,
  CnpjDataLabel,
  CnpjDataValue,
  RiskList,
  PropostaGifOverlay,
  PropostaGifCard,
  PropostaGifMessage,
  PropostaGifImage,
  DistributorSummaryCard,
  DistributorSummaryTitle,
  DistributorSummaryGrid,
  DistributorSummaryStat,
  DistributorSummaryLabel,
  DistributorSummaryValue,
  DistributorSummaryDivider,
  DistributorTopProducts,
  DistributorTopProductRow,
  DistributorTopProductName,
  DistributorTopProductMeta,
  DistributorSummaryHint
} from './styles';

interface ProposalItem {
  product: Product | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ProposalFormData {
  client: {
    name: string;
    email: string;
    phone: string;
    company: string;
    cnpj: string;
    razaoSocial: string;
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
  paymentCondition: string;
  validUntil: string;
  observations: string;
}

type DistributorSummary = {
  proposalsTotal: number;
  proposalsWon: number;
  proposalsLost: number;
  revenueWon: number;
  itemsSold: number;
  topProducts: Array<{ name: string; qty: number }>;
};

export const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError, warning, info } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState<'created' | 'win' | 'loss'>('created');
  const [proposalNumber, setProposalNumber] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [distributorPriceList, setDistributorPriceList] = useState<any[]>([]);
  const [distributorSummaryLoading, setDistributorSummaryLoading] = useState(false);
  const [distributorSummary, setDistributorSummary] = useState<DistributorSummary | null>(null);
  const [cnpjLookupInput, setCnpjLookupInput] = useState('');
  const [cnpjLookupLoading, setCnpjLookupLoading] = useState(false);
  const [cnpjLookupResult, setCnpjLookupResult] = useState<CnpjLookupResult | null>(null);

  const [showPropostaGif, setShowPropostaGif] = useState(false);
  const [propostaGifNonce, setPropostaGifNonce] = useState(0);
  
  // Recomendações de IA
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Dados para seleção
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [sellers, setSellers] = useState<UserType[]>([]); // Lista de vendedores para admin selecionar
  
  // Dados do formulário
  const [formData, setFormData] = useState<ProposalFormData>({
    client: {
      name: '',
      email: '',
      phone: '',
      company: '',
      cnpj: '',
      razaoSocial: ''
    },
    seller: {
      _id: user?._id || '',
      name: user?.name || '',
      email: user?.email || ''
    },
    distributor: {
      _id: '',
      apelido: '',
      razaoSocial: '',
      cnpj: ''
    },
    items: [{
      product: null,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    }],
    paymentCondition: '',
    validUntil: '',
    observations: ''
  });

  // Cálculos
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  // Opções de condição de pagamento
  const paymentConditions = [
    { value: 'À vista', label: 'À vista' },
    { value: 'Crédito - 1x', label: 'Crédito - 1x' },
    { value: 'Crédito - 2x', label: 'Crédito - 2x' },
    { value: 'Crédito - 3x', label: 'Crédito - 3x' },
    { value: 'Crédito - 4x', label: 'Crédito - 4x' },
    { value: 'Crédito - 5x', label: 'Crédito - 5x' },
    { value: 'Crédito - 6x', label: 'Crédito - 6x' },
    { value: 'Crédito - 7x', label: 'Crédito - 7x' },
    { value: 'Crédito - 8x', label: 'Crédito - 8x' },
    { value: 'Crédito - 9x', label: 'Crédito - 9x' },
    { value: 'Crédito - 10x', label: 'Crédito - 10x' },
    { value: 'Crédito - 11x', label: 'Crédito - 11x' },
    { value: 'Crédito - 12x', label: 'Crédito - 12x' },
    { value: 'Boleto - 1x', label: 'Boleto - 1x' },
    { value: 'Boleto - 2x', label: 'Boleto - 2x' },
    { value: 'Boleto - 3x', label: 'Boleto - 3x' },
    { value: 'Boleto - 4x', label: 'Boleto - 4x' },
    { value: 'Boleto - 5x', label: 'Boleto - 5x' },
    { value: 'Boleto - 6x', label: 'Boleto - 6x' },
    { value: 'Boleto - 7x', label: 'Boleto - 7x' },
    { value: 'Boleto - 8x', label: 'Boleto - 8x' },
    { value: 'Boleto - 9x', label: 'Boleto - 9x' },
    { value: 'Boleto - 10x', label: 'Boleto - 10x' }
  ];

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== CARREGANDO DADOS ===');
      
      const promises: Promise<any>[] = [
        apiService.getProducts(1, 200),
        apiService.getDistributors(1, 200)
      ];

      // Se for admin, carregar lista de vendedores também
      if (user?.role === 'admin') {
        promises.push(apiService.getUsers(1, 200));
      }

      const responses = await Promise.all(promises);
      
      // Se for admin, terá 3 respostas, senão apenas 2
      const productsResponse = responses[0];
      const distributorsResponse = responses[1];
      const usersResponse = user?.role === 'admin' ? responses[2] : undefined;

      console.log('Products response:', productsResponse);
      console.log('Distributors response:', distributorsResponse);
      if (usersResponse) {
        console.log('Users response:', usersResponse);
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
        console.log('Products loaded:', productsResponse.data?.length || 0);
      }
      
      // Distribuidores - verificar se tem success ou apenas data
      if (distributorsResponse.success || distributorsResponse.data) {
        setDistributors(distributorsResponse.data || []);
        console.log('Distributors loaded:', distributorsResponse.data?.length || 0);
      }

      // Carregar vendedores se for admin
      if (user?.role === 'admin' && usersResponse?.success) {
        // Filtrar apenas vendedores e admins ativos
        const sellersList = (usersResponse.data || []).filter((u: UserType) => 
          (u.role === 'vendedor' || u.role === 'admin') && (u.isActive !== false)
        );
        setSellers(sellersList);
        console.log('Sellers loaded:', sellersList.length);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualizar seller quando user estiver disponível (apenas se não for admin ou se ainda não tem seller selecionado)
  useEffect(() => {
    // Se for vendedor, sempre usar o próprio usuário
    // Se for admin, só atualizar se ainda não selecionou um vendedor
    if (user && user._id) {
      if (user.role === 'vendedor' || (!formData.seller._id || formData.seller._id === '')) {
        setFormData(prev => ({
          ...prev,
          seller: {
            _id: user._id,
            name: user.name || '',
            email: user.email || ''
          }
        }));
      }
    }
  }, [user]);

  // Calcular totais
  useEffect(() => {
    const newSubtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newTotalDiscount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount / 100), 0);
    const newTotal = newSubtotal - newTotalDiscount;
    
    setSubtotal(newSubtotal);
    setTotalDiscount(newTotalDiscount);
    setTotal(newTotal);
  }, [formData.items]);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value
      }
    }));
  };

  const handleCnpjChange = (value: string) => {
    // Formatar CNPJ: 00.000.000/0000-00
    let formatted = value.replace(/\D/g, '');
    if (formatted.length <= 14) {
      formatted = formatted.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
    }
    handleClientChange('cnpj', formatted);
  };

  const formatCnpjValue = (value: string) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.length <= 14) {
      formatted = formatted.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return formatted;
  };

  const handleLookupInputChange = (value: string) => {
    setCnpjLookupInput(formatCnpjValue(value));
  };

  const copyLookupData = async () => {
    if (!cnpjLookupResult) return;

    const address = cnpjLookupResult.endereco;
    const text = [
      `CNPJ: ${cnpjLookupResult.cnpj}`,
      `Razão social: ${cnpjLookupResult.razaoSocial || '-'}`,
      `Nome fantasia: ${cnpjLookupResult.nomeFantasia || '-'}`,
      `Situação cadastral: ${cnpjLookupResult.situacaoCadastral || '-'}`,
      `Risco: ${cnpjLookupResult.risk.status.toUpperCase()} - ${cnpjLookupResult.risk.reason}`,
      `Telefone: ${cnpjLookupResult.telefone || '-'}`,
      `Email: ${cnpjLookupResult.email || '-'}`,
      `Endereço: ${address.logradouro || ''}, ${address.numero || ''} - ${address.bairro || ''}, ${address.municipio || ''}/${address.uf || ''} CEP ${address.cep || ''}`,
      cnpjLookupResult.risk.inconsistencies.length > 0
        ? `Inconsistências: ${cnpjLookupResult.risk.inconsistencies.join('; ')}`
        : 'Inconsistências: nenhuma',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      success('CNPJ', 'Dados copiados para a área de transferência.');
    } catch (error) {
      warning('CNPJ', 'Não foi possível copiar os dados.');
    }
  };

  const applyLookupToClient = () => {
    if (!cnpjLookupResult) return;

    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        cnpj: cnpjLookupResult.cnpj || prev.client.cnpj,
        razaoSocial: cnpjLookupResult.razaoSocial || prev.client.razaoSocial,
        company: cnpjLookupResult.nomeFantasia || prev.client.company,
        phone: cnpjLookupResult.telefone || prev.client.phone,
        email: cnpjLookupResult.email || prev.client.email,
      },
    }));
    info('CNPJ', 'Dados da consulta aplicados nos campos do cliente.');
  };

  const handleLookupCnpj = async () => {
    const clean = cnpjLookupInput.replace(/\D/g, '');
    if (clean.length !== 14) {
      warning('CNPJ', 'Informe um CNPJ válido com 14 dígitos.');
      return;
    }

    try {
      setCnpjLookupLoading(true);
      const response = await apiService.lookupCnpj(clean);
      if (response.success && response.data) {
        setCnpjLookupResult(response.data);
        if (response.data.risk.blocked) {
          showError('Risco alto', response.data.risk.reason);
        } else if (response.data.risk.status === 'alerta') {
          warning('Atenção', response.data.risk.reason);
        } else {
          success('CNPJ', 'Consulta realizada com sucesso.');
        }
      }
    } catch (error: any) {
      showError('Consulta CNPJ', error?.message || 'Não foi possível consultar o CNPJ.');
      setCnpjLookupResult(null);
    } finally {
      setCnpjLookupLoading(false);
    }
  };

  const searchClientByCnpj = async (cnpj: string) => {
    if (!cnpj || cnpj.length < 14) return;

    try {
      console.log('🔍 Buscando cliente por CNPJ:', cnpj);
      const cleanCnpj = cnpj.replace(/\D/g, ''); // Remove formatação
      
      // Buscar todos os clientes e filtrar no frontend
      const response = await apiService.getClients(1, 500);
      const existingClient = response.data?.find((client: any) => 
        client.cnpj?.replace(/\D/g, '') === cleanCnpj
      );

      if (existingClient) {
        console.log('✅ Cliente encontrado:', existingClient);
        // Preencher todos os dados do cliente
        const clientEmail = existingClient.contato?.email || '';
        const clientName = existingClient.contato?.nome || '';
        
        // Validar se os dados essenciais estão presentes
        if (!clientEmail || !clientName) {
          warning('Dados incompletos', 'Cliente encontrado, mas faltam nome ou email. Preencha manualmente.');
        }
        
        setFormData(prev => ({
          ...prev,
          client: {
            name: clientName || prev.client.name,
            email: clientEmail || prev.client.email,
            phone: existingClient.contato?.telefone || prev.client.phone || '',
            company: existingClient.nomeFantasia || prev.client.company || '',
            cnpj: existingClient.cnpj || prev.client.cnpj || '',
            razaoSocial: existingClient.razaoSocial || prev.client.razaoSocial || ''
          }
        }));
        
        if (clientEmail && clientName) {
          info('Cliente encontrado', 'Dados preenchidos automaticamente.');
        }
      } else {
        console.log('ℹ️ Cliente não encontrado. Novo cliente será criado.');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
    }
  };

  const handleSellerChange = (sellerId: string) => {
    const selectedSeller = sellers.find(s => s._id === sellerId);
    if (selectedSeller) {
      setFormData(prev => ({
        ...prev,
        seller: {
          _id: selectedSeller._id,
          name: selectedSeller.name || '',
          email: selectedSeller.email || ''
        }
      }));
    }
  };

  const handleDistributorChange = async (distributorId: string) => {
    const distributor = distributors.find(d => d._id === distributorId);
    if (distributor) {
      setFormData(prev => ({
        ...prev,
        distributor: {
          _id: distributor._id,
          apelido: distributor.apelido || '',
          razaoSocial: distributor.razaoSocial || '',
          cnpj: distributor.cnpj || ''
        }
      }));

      // Carregar lista de preços do distribuidor
      try {
        const priceListResponse = await apiService.getPriceListByDistributor(distributorId, 1, 100);
        setDistributorPriceList(priceListResponse.data || []);
        console.log('Lista de preços do distribuidor:', priceListResponse.data);
      } catch (error) {
        console.error('Erro ao carregar lista de preços:', error);
        setDistributorPriceList([]);
      }
    }
  };

  const loadDistributorSummary = useCallback(async () => {
    const distributorId = formData.distributor._id;
    if (!distributorId) {
      setDistributorSummary(null);
      return;
    }

    try {
      setDistributorSummaryLoading(true);

      // Pega propostas e agrega no frontend (rápido e sem precisar de rota nova)
      const res = await apiService.getProposals(1, 2000);
      const all = res.data || [];

      // Se admin escolheu vendedor, filtra por ele. Se vendedor logado, filtra por ele.
      const sellerIdToFilter =
        user?.role === 'admin'
          ? (formData.seller?._id || '')
          : (user?._id || '');

      const filtered = all.filter((p: any) => {
        const distId = p?.distributor?._id || p?.distributor;
        if (distId?.toString() !== distributorId.toString()) return false;

        if (sellerIdToFilter) {
          const createdById = (p.createdBy?._id || p.createdBy || '').toString();
          const sellerId = (p.seller?._id || p.seller || '').toString();
          return createdById === sellerIdToFilter.toString() || sellerId === sellerIdToFilter.toString();
        }
        return true;
      });

      const proposalsTotal = filtered.length;
      const won = filtered.filter((p: any) => p.status === 'venda_fechada');
      const lost = filtered.filter((p: any) => p.status === 'venda_perdida');

      const revenueWon = won.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
      const itemsSold = won.reduce((sum: number, p: any) => {
        const items = Array.isArray(p.items) ? p.items : [];
        return sum + items.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      }, 0);

      const productsMap: Record<string, number> = {};
      won.forEach((p: any) => {
        const items = Array.isArray(p.items) ? p.items : [];
        items.forEach((it: any) => {
          const name = it?.product?.name || it?.product?.productName || it?.product?.description || 'Produto';
          productsMap[name] = (productsMap[name] || 0) + (it.quantity || 0);
        });
      });

      const topProducts = Object.entries(productsMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setDistributorSummary({
        proposalsTotal,
        proposalsWon: won.length,
        proposalsLost: lost.length,
        revenueWon,
        itemsSold,
        topProducts,
      });
    } catch (error) {
      console.error('Erro ao carregar resumo do distribuidor:', error);
      setDistributorSummary(null);
    } finally {
      setDistributorSummaryLoading(false);
    }
  }, [formData.distributor._id, formData.seller?._id, user?._id, user?.role]);

  useEffect(() => {
    // Atualiza quando trocar distribuidor ou vendedor (admin)
    loadDistributorSummary();
  }, [loadDistributorSummary]);

  // Carregar recomendações de produtos baseado nos produtos selecionados
  const loadRecommendations = async () => {
    const selectedProducts = formData.items.filter(item => item.product).map(item => ({
      product: {
        _id: item.product?._id,
        category: item.product?.category
      }
    }));

    // Se não há produtos selecionados, carregar produtos populares
    if (selectedProducts.length === 0) {
      try {
        setLoadingRecommendations(true);
        const response = await apiService.getPopularProducts(5);
        if (response.success && response.data?.recommendations) {
          setRecommendations(response.data.recommendations);
          setShowRecommendations(true);
        } else {
          setRecommendations([]);
          setShowRecommendations(false);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos populares:', error);
        setRecommendations([]);
        setShowRecommendations(false);
      } finally {
        setLoadingRecommendations(false);
      }
      return;
    }

    // Se há produtos selecionados, carregar recomendações personalizadas
    try {
      setLoadingRecommendations(true);
      const response = await apiService.getProductRecommendations(
        formData,
        selectedProducts,
        5
      );

      if (response.success && response.data?.recommendations) {
        setRecommendations(response.data.recommendations);
        setShowRecommendations(true);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      setRecommendations([]);
      setShowRecommendations(false);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Carregar recomendações quando a página carrega (produtos populares)
  useEffect(() => {
    // Só carregar produtos populares se não houver produtos selecionados
    const hasSelectedProducts = formData.items.some(item => item.product);
    if (!hasSelectedProducts) {
      const timer = setTimeout(() => {
        loadRecommendations();
      }, 1500); // Aguardar após carregar produtos e distribuidores

      return () => clearTimeout(timer);
    }
  }, [products.length]); // Carregar quando produtos estiverem disponíveis

  // Adicionar produto recomendado à proposta
  const addRecommendedProduct = (recommendedProduct: any) => {
    if (!recommendedProduct.product) return;

    const product = products.find(p => p._id === recommendedProduct.product._id);
    if (!product) return;

    const newItem: ProposalItem = {
      product,
      quantity: 1,
      unitPrice: product.price || 0,
      discount: 0,
      total: product.price || 0
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Recarregar recomendações após adicionar
    setTimeout(() => loadRecommendations(), 500);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const newItems = [...formData.items];
      const price = product.price || 0;
      newItems[index] = {
        ...newItems[index],
        product,
        unitPrice: price,
        total: newItems[index].quantity * price * (1 - newItems[index].discount / 100)
      };
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));

      // Carregar recomendações quando produtos são selecionados
      setTimeout(() => loadRecommendations(), 300);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      total: quantity * newItems[index].unitPrice * (1 - newItems[index].discount / 100)
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      unitPrice,
      total: newItems[index].quantity * unitPrice * (1 - newItems[index].discount / 100)
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleDiscountChange = (index: number, discount: number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      discount,
      total: newItems[index].quantity * newItems[index].unitPrice * (1 - discount / 100)
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product: null,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0
      }]
    }));
  };

  const removeProduct = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validar seller (obrigatório e deve ter _id válido)
      if (!formData.seller._id || !formData.seller.name || !user?._id) {
        showError('Erro', 'Dados do vendedor não carregados. Faça login novamente.');
        return;
      }
      
      // Validar dados obrigatórios do cliente
      if (!formData.client.cnpj || !formData.client.name || !formData.client.email || !formData.client.razaoSocial) {
        warning('Campos obrigatórios', 'CNPJ, nome do contato, email e razão social são obrigatórios.');
        return;
      }
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.client.email)) {
        warning('Email inválido', 'Informe um email válido para o cliente.');
        return;
      }

      // Validação de risco de CNPJ via API
      try {
        const cnpjToCheck = formData.client.cnpj.replace(/\D/g, '');
        if (cnpjToCheck.length === 14) {
          const cnpjCheck = await apiService.lookupCnpj(cnpjToCheck);
          const risk = cnpjCheck.data?.risk;
          if (risk?.blocked) {
            showError('Proposta bloqueada', `CNPJ em risco alto: ${risk.reason}`);
            return;
          }
          if (risk?.status === 'alerta') {
            warning('Atenção no CNPJ', `${risk.reason}. Revise antes de avançar.`);
          }
        }
      } catch {
        warning('CNPJ', 'Não foi possível validar risco agora. Verifique o CNPJ no card de consulta.');
      }
      
      if (!formData.distributor._id) {
        warning('Campo obrigatório', 'Selecione o distribuidor.');
        return;
      }
      
      if (formData.items.some(item => !item.product)) {
        warning('Produtos', 'Todos os produtos devem ser selecionados.');
        return;
      }
      
      if (!formData.paymentCondition) {
        warning('Campo obrigatório', 'Condição de pagamento é obrigatória.');
        return;
      }
      
      if (!formData.validUntil) {
        warning('Campo obrigatório', 'Data de validade é obrigatória.');
        return;
      }

      // Verificar se cliente existe e criar se necessário
      const cleanCnpj = formData.client.cnpj.replace(/\D/g, '');
      const clientsResponse = await apiService.getClients(1, 500);
      let existingClient = clientsResponse.data?.find((client: any) => 
        client.cnpj?.replace(/\D/g, '') === cleanCnpj
      );

      // Se cliente não existe, criar novo
      if (!existingClient) {
        console.log('📝 Criando novo cliente...');
        const newClientData: any = {
          cnpj: formData.client.cnpj,
          razaoSocial: formData.client.razaoSocial,
          nomeFantasia: formData.client.company || formData.client.razaoSocial,
          contato: {
            nome: formData.client.name,
            email: formData.client.email,
            telefone: formData.client.phone || '',
            cargo: 'Contato'
          },
          endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: 'SP' // Valor padrão - pode ser alterado posteriormente no cadastro do cliente
          },
          classificacao: 'OUTROS' as const,
          observacoes: `Cliente criado automaticamente via proposta em ${new Date().toLocaleDateString()}`,
          isActive: true
        };
        if (user?._id) newClientData.assignedTo = user._id;
        const createResponse = await apiService.createClient(newClientData);
        if (createResponse.success) {
          console.log('✅ Cliente criado com sucesso:', createResponse.data);
          existingClient = createResponse.data;
        } else {
          showError('Erro ao criar cliente', 'Tente novamente.');
          return;
        }
      } else {
        console.log('✅ Cliente já existe:', existingClient);
      }

      // Preparar dados para envio com validação final
      const clientPhone = formData.client.phone?.trim();
      const proposalData: any = {
        client: {
          name: formData.client.name.trim(),
          email: formData.client.email.trim(),
          company: formData.client.company?.trim() || formData.client.razaoSocial.trim(),
          cnpj: formData.client.cnpj.trim(),
          razaoSocial: formData.client.razaoSocial.trim()
        },
        seller: {
          _id: formData.seller._id.trim(), // Garantir que é string válida
          name: formData.seller.name.trim(),
          email: formData.seller.email?.trim() || user?.email || ''
        },
        distributor: {
          _id: formData.distributor._id.trim(),
          apelido: formData.distributor.apelido || '',
          razaoSocial: formData.distributor.razaoSocial || '',
          cnpj: formData.distributor.cnpj || ''
        },
        items: formData.items
          .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => !!item.product)
          .map(item => ({
            product: {
              _id: item.product._id,
              name: item.product.name,
              description: item.product.description || '',
              category: item.product.category || '',
              price: item.product.price || 0
            },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total
          })),
        subtotal,
        discount: totalDiscount,
        total,
        paymentCondition: formData.paymentCondition.trim(),
        observations: formData.observations?.trim() || '',
        status: 'negociacao' as const,
        validUntil: new Date(formData.validUntil).toISOString()
      };
      
      // Adicionar telefone apenas se não estiver vazio
      if (clientPhone && clientPhone.length > 0) {
        proposalData.client.phone = clientPhone;
      }

      // Função para validar ObjectId do MongoDB (24 caracteres hexadecimais)
      const isValidObjectId = (id: string): boolean => {
        if (!id || typeof id !== 'string') return false;
        // ObjectId do MongoDB tem exatamente 24 caracteres hexadecimais
        return /^[0-9a-fA-F]{24}$/.test(id);
      };

      // Log detalhado do que está sendo enviado
      console.log('📤 Dados da proposta a serem enviados:', JSON.stringify(proposalData, null, 2));
      
      // Validar dados críticos antes de enviar
      if (!proposalData.seller._id || !isValidObjectId(proposalData.seller._id)) {
        showError('Erro', 'ID do vendedor inválido. Faça login novamente.');
        setSaving(false);
        return;
      }
      
      if (!proposalData.distributor._id || !isValidObjectId(proposalData.distributor._id)) {
        showError('Erro', 'ID do distribuidor inválido.');
        setSaving(false);
        return;
      }
      
      // Validar IDs dos produtos
      const invalidProductIds = proposalData.items.filter((item: any) => 
        !item.product._id || !isValidObjectId(item.product._id)
      );
      if (invalidProductIds.length > 0) {
        showError('Erro', 'IDs de produtos inválidos. Verifique os produtos selecionados.');
        setSaving(false);
        return;
      }

      const response = await apiService.createProposal(proposalData) as any;
      
      if (response.success) {
        // Pegar o número da proposta da resposta
        const propNumber = response.data?.proposalNumber || 'N/A';
        setProposalNumber(propNumber);
        setSuccessModalType('created'); // Tipo 'created' para proposta criada
        setShowSuccessModal(false);

        // Mostra o GIF na tela por 5s e fecha automaticamente
        setPropostaGifNonce((n) => n + 1);
        setShowPropostaGif(true);

        setTimeout(() => {
          setShowPropostaGif(false);
          navigate('/proposals');
        }, 5000);
      } else if (response.needsApproval) {
        info(
          'Solicitação enviada',
          response.message || `Foi enviada uma solicitação para ${response.ownerName || 'o dono da carteira'}. Você poderá criar a proposta após a aprovação.`
        );
      } else {
        showError('Erro ao criar proposta', response.message || 'Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao salvar proposta:', error);
      
      // Mostrar mensagem de erro mais detalhada
      let errorMessage = 'Erro ao salvar proposta';
      if (error.message) {
        errorMessage = error.message;
        // Se contém detalhes de validação, mostrar apenas a parte importante
        if (error.message.includes('Detalhes:')) {
          try {
            const detailsMatch = error.message.match(/Detalhes: (.*)/s);
            if (detailsMatch) {
              const details = JSON.parse(detailsMatch[1]);
              const fieldErrors = details.map((err: any) => `${err.field}: ${err.message}`).join('\n');
              errorMessage = `Erro de validação:\n${fieldErrors}`;
            }
          } catch (e) {
            // Se não conseguir parsear, usar a mensagem original
          }
        }
      }
      
      showError('Erro', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true);
      
      // Validar se há dados suficientes para gerar PDF
      if (!formData.client.name || !formData.distributor._id) {
        warning('PDF', 'Preencha os dados básicos antes de gerar o PDF.');
        return;
      }
      
      if (formData.items.some(item => !item.product)) {
        warning('PDF', 'Selecione todos os produtos antes de gerar o PDF.');
        return;
      }
      
      // Preparar dados para o PDF
      const pdfData: ProposalPdfData = {
        proposalNumber: 'PROP-XXXX', // Será gerado pelo servidor
        client: formData.client,
        seller: formData.seller,
        distributor: {
          ...formData.distributor,
          cnpj: formData.distributor.cnpj || ''
        },
        items: formData.items
          .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => !!item.product)
          .map(item => ({
            product: {
              name: item.product.name,
              description: item.product.description || ''
            },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total
          })),
        subtotal,
        discount: totalDiscount,
        total,
        paymentCondition: formData.paymentCondition,
        validUntil: formData.validUntil,
        observations: formData.observations,
        status: 'negociacao',
        createdAt: new Date().toISOString()
      };
      
      // Gerar PDF
      generateProposalPdf(pdfData);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showError('Erro ao gerar PDF', 'Não foi possível gerar o arquivo.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShowSummary = () => {
    setShowSummaryModal(true);
  };


  const fillTestData = () => {
    console.log('=== PREENCHENDO DADOS DE TESTE ===');
    console.log('Distribuidores disponíveis:', distributors.length);
    console.log('Produtos disponíveis:', products.length);

    // Dados de teste para o cliente
    setFormData(prev => ({
      ...prev,
      client: {
        name: 'João Silva Santos',
        email: 'joao.silva@empresa.com.br',
        phone: '(11) 99999-8888',
        company: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'Empresa ABC Ltda'
      }
    }));

    // Vendedor já está definido como usuário logado

    // Selecionar primeiro distribuidor se existir
    if (distributors.length > 0) {
      console.log('Selecionando distribuidor:', distributors[0].apelido || distributors[0].razaoSocial);
      handleDistributorChange(distributors[0]._id);
    } else {
      console.log('Nenhum distribuidor disponível');
      warning('Sem distribuidores', 'Nenhum distribuidor encontrado. Cadastre distribuidores primeiro.');
      return;
    }

    // Adicionar produtos de teste se existirem
    if (products.length > 0) {
      console.log('Adicionando produtos de teste');
      const testItems: ProposalItem[] = [
        {
          product: products[0],
          quantity: 2,
          unitPrice: products[0].price || 0,
          discount: 5,
          total: (products[0].price || 0) * 2 * 0.95
        }
      ];

      // Adicionar segundo produto se existir
      if (products.length > 1) {
        testItems.push({
          product: products[1],
          quantity: 1,
          unitPrice: products[1].price || 0,
          discount: 10,
          total: (products[1].price || 0) * 1 * 0.90
        });
      }

      setFormData(prev => ({
        ...prev,
        items: testItems
      }));
    } else {
      console.log('Nenhum produto disponível');
    }

    // Preencher condições de pagamento
    setFormData(prev => ({
      ...prev,
      paymentCondition: 'À vista com 5% de desconto ou parcelado em 3x sem juros',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observations: 'Proposta válida por 30 dias. Entrega em até 15 dias úteis após confirmação do pedido.'
    }));

    success('Dados de teste', 'Formulário preenchido com sucesso.');
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Carregando...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/proposals')}>
          <ArrowLeft size={20} />
          Voltar
        </BackButton>
        <Title>Nova Proposta</Title>
      </Header>

      <FormContainer>
        <TwoColumnLayout>
          <LeftColumn>
        <CnpjRiskCard>
          <SectionTitle style={{ marginBottom: '0.9rem' }}>Consulta de CNPJ e Validação de Risco</SectionTitle>
          <CnpjSearchRow>
            <Input
              type="text"
              value={cnpjLookupInput}
              onChange={(e) => handleLookupInputChange(e.target.value)}
              placeholder="Digite o CNPJ para consultar"
            />
            <Button
              type="button"
              onClick={handleLookupCnpj}
              disabled={cnpjLookupLoading}
            >
              <Search size={16} />
              {cnpjLookupLoading ? 'Consultando...' : 'Buscar CNPJ'}
            </Button>
          </CnpjSearchRow>
          <CnpjHint>
            Verifica situação cadastral e risco. CNPJ inapto, baixado, suspenso ou nulo será bloqueado na criação da proposta.
          </CnpjHint>

          {cnpjLookupResult && (
            <>
              <RiskBadge $status={cnpjLookupResult.risk.status}>
                {cnpjLookupResult.risk.status === 'ok' ? (
                  <ShieldCheck size={14} />
                ) : cnpjLookupResult.risk.status === 'alerta' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <ShieldAlert size={14} />
                )}
                {cnpjLookupResult.risk.status.toUpperCase()} - {cnpjLookupResult.risk.reason}
              </RiskBadge>

              <CnpjDataGrid>
                <CnpjDataItem>
                  <CnpjDataLabel>CNPJ</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.cnpj || '-'}</CnpjDataValue>
                </CnpjDataItem>
                <CnpjDataItem>
                  <CnpjDataLabel>Razão social</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.razaoSocial || '-'}</CnpjDataValue>
                </CnpjDataItem>
                <CnpjDataItem>
                  <CnpjDataLabel>Nome fantasia</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.nomeFantasia || '-'}</CnpjDataValue>
                </CnpjDataItem>
                <CnpjDataItem>
                  <CnpjDataLabel>Situação cadastral</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.situacaoCadastral || '-'}</CnpjDataValue>
                </CnpjDataItem>
                <CnpjDataItem>
                  <CnpjDataLabel>Telefone</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.telefone || '-'}</CnpjDataValue>
                </CnpjDataItem>
                <CnpjDataItem>
                  <CnpjDataLabel>Email</CnpjDataLabel>
                  <CnpjDataValue>{cnpjLookupResult.email || '-'}</CnpjDataValue>
                </CnpjDataItem>
              </CnpjDataGrid>

              {cnpjLookupResult.risk.inconsistencies.length > 0 && (
                <RiskList>
                  {cnpjLookupResult.risk.inconsistencies.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </RiskList>
              )}

              <ActionButtons style={{ justifyContent: 'flex-start', padding: '0.9rem 0 0' }}>
                <Button type="button" variant="secondary" onClick={applyLookupToClient}>
                  <FileText size={16} />
                  Usar dados no cliente
                </Button>
                <Button type="button" variant="secondary" onClick={copyLookupData}>
                  <Copy size={16} />
                  Copiar dados
                </Button>
              </ActionButtons>
            </>
          )}
        </CnpjRiskCard>

        {/* Dados do Cliente */}
        <FormSection>
          <SectionTitle>Dados do Cliente</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>CNPJ *</Label>
              <Input
                type="text"
                value={formData.client.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                onBlur={() => searchClientByCnpj(formData.client.cnpj)}
                placeholder="00.000.000/0000-00"
              />
              <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Digite o CNPJ para buscar cliente existente ou criar novo
              </small>
            </FormGroup>
            <FormGroup>
              <Label>Razão Social *</Label>
              <Input
                type="text"
                value={formData.client.razaoSocial}
                onChange={(e) => handleClientChange('razaoSocial', e.target.value)}
                placeholder="Razão social da empresa"
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Nome do Contato *</Label>
              <Input
                type="text"
                value={formData.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="Nome completo do contato"
              />
            </FormGroup>
            <FormGroup>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Telefone</Label>
              <Input
                type="text"
                value={formData.client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </FormGroup>
            <FormGroup>
              <Label>Nome Fantasia</Label>
              <Input
                type="text"
                value={formData.client.company}
                onChange={(e) => handleClientChange('company', e.target.value)}
                placeholder="Nome fantasia da empresa"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Vendedor - Apenas para Admin */}
        {user?.role === 'admin' && (
          <FormSection>
            <SectionTitle>Vendedor</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Vendedor *</Label>
                <Select
                  value={formData.seller._id}
                  onChange={(e) => handleSellerChange(e.target.value)}
                >
                  <option value="">Selecione um vendedor</option>
                  {sellers.map(seller => (
                    <option key={seller._id} value={seller._id}>
                      {seller.name} ({seller.email}) {seller.role === 'admin' ? '- Admin' : ''}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>
        )}

        {/* Distribuidor */}
        <FormSection>
          <SectionTitle>Distribuidor</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Distribuidor *</Label>
              <Select
                value={formData.distributor._id}
                onChange={(e) => handleDistributorChange(e.target.value)}
              >
                <option value="">Selecione um distribuidor</option>
                {distributors.map(distributor => (
                  <option key={distributor._id} value={distributor._id}>
                    {distributor.apelido || 'N/A'} - {distributor.razaoSocial || 'N/A'} {distributor.cnpj ? `(CNPJ: ${distributor.cnpj})` : ''}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Produtos */}
        <FormSection>
          <SectionTitle>Produtos</SectionTitle>
          {formData.items.map((item, index) => (
            <ProductItem key={item.product?._id ?? `item-${index}`}>
              <ProductHeader>
                <h4>Produto {index + 1}</h4>
                {formData.items.length > 1 && (
                  <ProductButton
                    type="button"
                    onClick={() => removeProduct(index)}
                    variant="danger"
                  >
                    <Trash2 size={16} />
                  </ProductButton>
                )}
              </ProductHeader>
              
              <ProductRow>
                <FormGroup>
                  <Label>Produto *</Label>
                  <Select
                    value={item.product?._id || ''}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Quantidade</Label>
                  <ProductInput
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                  />
                </FormGroup>
              </ProductRow>
              
              <ProductRow>
                <FormGroup>
                  <Label>Preço Unitário</Label>
                  <ProductInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleUnitPriceChange(index, parseFloat(e.target.value) || 0)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Desconto (%)</Label>
                  <ProductInput
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => handleDiscountChange(index, parseFloat(e.target.value) || 0)}
                  />
                </FormGroup>
              </ProductRow>
              
              <ProductRow>
                <FormGroup>
                  <Label>Total</Label>
                  <ProductInput
                    type="text"
                    value={formatCurrency(item.total)}
                    readOnly
                  />
                </FormGroup>
              </ProductRow>
            </ProductItem>
          ))}
          
          <Button type="button" onClick={addProduct} variant="secondary">
            <Plus size={16} />
            Adicionar Produto
          </Button>
        </FormSection>

        {/* Recomendações de IA */}
        {(showRecommendations || recommendations.length > 0 || loadingRecommendations) && (
          <FormSection style={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '2px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: '#6366f1' }} />
                <SectionTitle style={{ margin: 0, border: 'none', padding: 0 }}>
                  {formData.items.filter(item => item.product).length > 0 
                    ? 'Recomendações Inteligentes de Produtos'
                    : 'Produtos Mais Vendidos'
                  }
                </SectionTitle>
              </div>
              {recommendations.length > 0 && (
                <button
                  onClick={() => {
                    setShowRecommendations(false);
                    setRecommendations([]);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '1rem'
            }}>
              {formData.items.filter(item => item.product).length > 0
                ? '🧠 Baseado em padrões de compra e análise de IA'
                : '⭐ Produtos mais populares baseados no histórico de vendas'
              }
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1rem' 
            }}>
              {recommendations.map((rec, index) => (
                <div
                  key={rec.productId || index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => addRecommendedProduct(rec)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        color: '#ffffff',
                        marginBottom: '0.25rem'
                      }}>
                        {rec.product?.name || 'Produto'}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        {rec.product?.category || 'Sem categoria'}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#34d399'
                    }}>
                      {rec.confidence}%
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: '#6366f1',
                    marginBottom: '0.5rem'
                  }}>
                    {formatCurrency(rec.product?.price || 0)}
                  </div>

                  <div style={{ 
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4'
                  }}>
                    {rec.reason}
                  </div>

                  {rec.methods && rec.methods.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap'
                    }}>
                      {rec.methods.map((method: string) => (
                        <span
                          key={method}
                          style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            borderRadius: '4px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            color: '#a5b4fc'
                          }}
                        >
                          {method === 'association' ? 'Associação' :
                           method === 'collaborative' ? 'Colaborativo' :
                           method === 'category' ? 'Categoria' :
                           method === 'popular' ? 'Popular' : method}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addRecommendedProduct(rec);
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Plus size={16} />
                    Adicionar à Proposta
                  </button>
                </div>
              ))}
            </div>

            {loadingRecommendations && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.95rem'
              }}>
                <Sparkles size={24} style={{ marginBottom: '0.5rem', opacity: 0.6, animation: 'pulse 2s infinite' }} />
                <div>Carregando recomendações inteligentes...</div>
              </div>
            )}

            {!loadingRecommendations && recommendations.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem'
              }}>
                Selecione produtos para receber recomendações personalizadas baseadas em IA
              </div>
            )}
          </FormSection>
        )}

        {/* Condições de Pagamento */}
        <FormSection>
          <SectionTitle>Condições de Pagamento</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Condição de Pagamento *</Label>
              <Select
                value={formData.paymentCondition}
                onChange={(e) => handleInputChange('paymentCondition', e.target.value)}
              >
                <option value="">Selecione a condição de pagamento</option>
                {paymentConditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Válido até *</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
              />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <Label>Observações</Label>
            <TextArea
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre a proposta"
              rows={3}
            />
          </FormGroup>
        </FormSection>

        {/* Totais */}
        <TotalSection>
          <TotalRow>
            <span>Subtotal:</span>
            <TotalValue>{formatCurrency(subtotal)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <span>Desconto:</span>
            <TotalValue>- {formatCurrency(totalDiscount)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <span>Total:</span>
            <TotalValue>{formatCurrency(total)}</TotalValue>
          </TotalRow>
        </TotalSection>

        {/* Resumo do Distribuidor */}
        <FormSection>
          <SectionTitle>Resumo do Distribuidor</SectionTitle>
          <DistributorSummaryCard style={{ marginTop: 0 }}>
            <DistributorSummaryTitle>
              <BarChart3 size={18} />
              {formData.distributor.apelido || formData.distributor.razaoSocial || 'Distribuidor'}
            </DistributorSummaryTitle>

            {!formData.distributor._id ? (
              <DistributorSummaryHint>Selecione um distribuidor para ver o resumo.</DistributorSummaryHint>
            ) : distributorSummaryLoading ? (
              <DistributorSummaryHint>Carregando resumo do distribuidor...</DistributorSummaryHint>
            ) : distributorSummary ? (
              <>
                <DistributorSummaryGrid>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Propostas</DistributorSummaryLabel>
                    <DistributorSummaryValue>{distributorSummary.proposalsTotal}</DistributorSummaryValue>
                  </DistributorSummaryStat>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Fechadas</DistributorSummaryLabel>
                    <DistributorSummaryValue>{distributorSummary.proposalsWon}</DistributorSummaryValue>
                  </DistributorSummaryStat>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Perdidas</DistributorSummaryLabel>
                    <DistributorSummaryValue>{distributorSummary.proposalsLost}</DistributorSummaryValue>
                  </DistributorSummaryStat>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Valor fechado</DistributorSummaryLabel>
                    <DistributorSummaryValue>{formatCurrency(distributorSummary.revenueWon)}</DistributorSummaryValue>
                  </DistributorSummaryStat>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Itens vendidos</DistributorSummaryLabel>
                    <DistributorSummaryValue>{distributorSummary.itemsSold}</DistributorSummaryValue>
                  </DistributorSummaryStat>
                  <DistributorSummaryStat>
                    <DistributorSummaryLabel>Conversão</DistributorSummaryLabel>
                    <DistributorSummaryValue>
                      {distributorSummary.proposalsTotal > 0
                        ? `${Math.round((distributorSummary.proposalsWon / distributorSummary.proposalsTotal) * 100)}%`
                        : '0%'}
                    </DistributorSummaryValue>
                  </DistributorSummaryStat>
                </DistributorSummaryGrid>

                <DistributorSummaryDivider>Top produtos (vendas fechadas)</DistributorSummaryDivider>
                <DistributorTopProducts>
                  {distributorSummary.topProducts.length > 0 ? (
                    distributorSummary.topProducts.map((p) => (
                      <DistributorTopProductRow key={p.name}>
                        <DistributorTopProductName title={p.name}>{p.name}</DistributorTopProductName>
                        <DistributorTopProductMeta>{p.qty} un.</DistributorTopProductMeta>
                      </DistributorTopProductRow>
                    ))
                  ) : (
                    <DistributorSummaryHint>Nenhuma venda fechada encontrada para este distribuidor.</DistributorSummaryHint>
                  )}
                </DistributorTopProducts>

                <DistributorSummaryHint>
                  Baseado nas propostas já registradas no sistema
                  {user?.role === 'admin' && formData.seller?._id ? ' (filtrado pelo vendedor selecionado)' : ''}.
                </DistributorSummaryHint>
              </>
            ) : (
              <DistributorSummaryHint>Não foi possível carregar o resumo agora.</DistributorSummaryHint>
            )}
          </DistributorSummaryCard>
        </FormSection>

        {/* Botões de Ação */}
        <ActionButtons>
          <Button
            type="button"
            onClick={fillTestData}
            variant="secondary"
            style={{ backgroundColor: '#10b981', color: 'white' }}
          >
            <Plus size={16} />
            Preencher Dados de Teste
          </Button>
          
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Proposta'}
          </SaveButton>
          
          <GeneratePdfButton
            type="button"
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
          >
            <Download size={16} />
            {generatingPdf ? 'Gerando...' : 'Gerar PDF'}
          </GeneratePdfButton>
          
          <Button
            type="button"
            onClick={handleShowSummary}
            variant="secondary"
          >
            <Eye size={16} />
            Resumo
          </Button>
        </ActionButtons>
          </LeftColumn>

          <RightColumn>
            <PriceListTitle>Lista de Preços - {formData.distributor.apelido || formData.distributor.razaoSocial || 'Distribuidor'}</PriceListTitle>
            {distributorPriceList.length > 0 ? (
              distributorPriceList.map((item, index) => (
                <PriceListItem key={index}>
                  <ProductName>{item.product?.name || 'Produto'}</ProductName>
                  <PriceRow>
                    <PriceLabel>À vista:</PriceLabel>
                    <PriceValue>{formatCurrency(item.pricing?.aVista)}</PriceValue>
                  </PriceRow>
                  {item.pricing?.boleto?.map((option: PriceOption, index: number) => (
                    <PriceRow key={`boleto-${index}`}>
                      <PriceLabel>{option.parcelas}x Boleto:</PriceLabel>
                      <PriceValue>{formatCurrency(option.preco)}</PriceValue>
                    </PriceRow>
                  ))}
                  {item.pricing?.credito?.map((option: PriceOption, index: number) => (
                    <PriceRow key={`credito-${index}`}>
                      <PriceLabel>{option.parcelas}x Cartão:</PriceLabel>
                      <PriceValue>{formatCurrency(option.preco)}</PriceValue>
                    </PriceRow>
                  ))}
                </PriceListItem>
              ))
            ) : (
              <NoPricesMessage>
                {formData.distributor._id 
                  ? 'Nenhum produto com preços cadastrados para este distribuidor'
                  : 'Selecione um distribuidor para ver a lista de preços'
                }
              </NoPricesMessage>
            )}
          </RightColumn>
        </TwoColumnLayout>
      </FormContainer>

      {/* Modal de Resumo */}
      {showSummaryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '16px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937', fontSize: '20px', fontWeight: 'bold' }}>
                Resumo da Proposta
              </h2>
              <button
                onClick={() => setShowSummaryModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Dados do Cliente */}
              <div>
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Dados do Cliente
                </h3>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Nome:</strong> {formData.client.name}</p>
                  {formData.client.company && (
                    <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Empresa:</strong> {formData.client.company}</p>
                  )}
                  {formData.client.cnpj && (
                    <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>CNPJ:</strong> {formData.client.cnpj}</p>
                  )}
                  {formData.client.razaoSocial && (
                    <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Razão Social:</strong> {formData.client.razaoSocial}</p>
                  )}
                </div>
              </div>

              {/* Vendedor e Distribuidor */}
              <div>
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Vendedor e Distribuidor
                </h3>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Vendedor:</strong> {formData.seller.name || 'Não selecionado'}</p>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Distribuidor:</strong> {formData.distributor.apelido || formData.distributor.razaoSocial || 'Não selecionado'}</p>
                </div>
              </div>

              {/* Produtos */}
              <div>
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Produtos
                </h3>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{ 
                      borderBottom: index < formData.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                      paddingBottom: index < formData.items.length - 1 ? '8px' : '0',
                      marginBottom: index < formData.items.length - 1 ? '8px' : '0'
                    }}>
                      <p style={{ margin: '4px 0', color: '#4b5563', fontWeight: 'bold' }}>
                        {item.product?.name || 'Produto não selecionado'}
                      </p>
                      <p style={{ margin: '4px 0', color: '#6b7280' }}>
                        <strong>Quantidade:</strong> {item.quantity} | 
                        <strong> Preço:</strong> {formatCurrency(item.unitPrice)} | 
                        <strong> Desconto:</strong> {item.discount}% | 
                        <strong> Total:</strong> {formatCurrency(item.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condições e Observações */}
              <div>
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Condições e Observações
                </h3>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}>
                    <strong>Condição de Pagamento:</strong> {formData.paymentCondition || 'Não informado'}
                  </p>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}>
                    <strong>Válido até:</strong> {formData.validUntil ? new Date(formData.validUntil).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                  {formData.observations && (
                    <p style={{ margin: '4px 0', color: '#4b5563' }}>
                      <strong>Observações:</strong> {formData.observations}
                    </p>
                  )}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div>
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Resumo Financeiro
                </h3>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}>
                    <strong>Subtotal:</strong> {formatCurrency(subtotal)}
                  </p>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}>
                    <strong>Desconto:</strong> -{formatCurrency(totalDiscount)}
                  </p>
                  <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>
                    <strong>TOTAL:</strong> {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              <button
                onClick={() => setShowSummaryModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ProposalSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/proposals');
        }}
        type={successModalType}
        proposalNumber={proposalNumber}
      />

      {showPropostaGif && (
        <PropostaGifOverlay role="status" aria-live="polite">
          <PropostaGifCard onClick={(e) => e.stopPropagation()}>
            <PropostaGifMessage>voce consegue</PropostaGifMessage>
            {/* nonce forca reload do gif sempre que criar uma nova proposta */}
            <PropostaGifImage
              key={propostaGifNonce}
              src="/proposta.gif"
              alt="Proposta criada com sucesso"
            />
          </PropostaGifCard>
        </PropostaGifOverlay>
      )}

    </Container>
  );
};
