import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, FileText, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, Proposal, Product, Distributor, User as UserType } from '../../services/api';
import { generateProposalPdf, ProposalPdfData } from '../../utils/pdfGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { ProposalSuccessModal } from '../../components/ProposalSuccessModal';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  Content,
  TableWrapper,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  ActionButton,
  StatusBadge,
  EmptyState,
  LoadingState,
  ErrorState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Select,
  Input,
  Button,
  ProductItem,
  ProductHeader,
  ProductName,
  ProductDetails,
  PriceRow,
  PriceLabel,
  PriceInput,
  RemoveButton,
  AddProductButton,
  TotalRow,
  TotalLabel,
  TotalValue
} from './styles';

// Funções de status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'negociacao': return '#f59e0b';
    case 'venda_fechada': return '#059669';
    case 'venda_perdida': return '#dc2626';
    case 'expirada': return '#6b7280';
    default: return '#6b7280';
  }
};


export const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError, warning } = useToastContext();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [sellers, setSellers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deletingItems, setDeletingItems] = useState<string[]>([]);
  const [showLossModal, setShowLossModal] = useState(false);
  const [proposalToLose, setProposalToLose] = useState<Proposal | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [lossDescription, setLossDescription] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState<'created' | 'win' | 'loss'>('win');
  const [proposalNumber, setProposalNumber] = useState<string>('');

  // Opções de motivo da perda
  const lossReasons = [
    { value: 'preco_concorrente', label: 'Preço Concorrente' },
    { value: 'condicao_pagamento', label: 'Condição de Pagamento' },
    { value: 'sem_retorno', label: 'Sem Retorno' },
    { value: 'credito_negado', label: 'Crédito Negado' },
    { value: 'concorrencia_marca', label: 'Concorrência (Marca)' },
    { value: 'adiamento_compra', label: 'Adiamento de Compra' },
    { value: 'cotacao_preco', label: 'Cotação de Preço' },
    { value: 'perca_preco', label: 'Perda de Preço' },
    { value: 'urgencia_comprou_local', label: 'Urgência / Comprou Localmente' },
    { value: 'golpe', label: 'Golpe' },
    { value: 'licitacao', label: 'Licitação' },
    { value: 'fechado_outro_parceiro', label: 'Fechado em Outro Parceiro' }
  ];

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

  // Form states
  const [selectedClient, setSelectedClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[]>([]);
  const [paymentCondition, setPaymentCondition] = useState('');
  const [observations, setObservations] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [availablePriceList, setAvailablePriceList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando propostas para usuário:', user?.email, 'Role:', user?.role);
      
      let proposalsRes;
      
      // Se for vendedor, carregar apenas suas propostas
      if (user?.role === 'vendedor') {
        console.log('👤 Carregando propostas do vendedor:', user._id);
        proposalsRes = await apiService.getVendedorProposals(user._id, 1, 100);
      } else {
        // Se for admin, carregar todas as propostas
        console.log('👑 Carregando todas as propostas (admin)');
        proposalsRes = await apiService.getProposals(1, 100, statusFilter || undefined, searchTerm || undefined);
      }

      // Removido cálculo de Score IA na listagem para otimização
      
      const [productsRes, distributorsRes, sellersRes] = await Promise.all([
        apiService.getProducts(1, 1000),
        apiService.getDistributors(1, 1000), // Aumentado para garantir que todos apareçam
        apiService.getUsers(1, 1000)
      ]);

      setProposals(proposalsRes.data || []);
      setProducts(productsRes.data);
      setDistributors(distributorsRes.data);
      setSellers(sellersRes.data.filter(user => user.role === 'vendedor' || user.role === 'admin'));
      
      console.log('📊 Propostas carregadas:', proposalsRes.data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Carregar lista de preços quando o distribuidor for selecionado
  useEffect(() => {
    const loadPriceList = async () => {
      if (selectedDistributor) {
        try {
          console.log('📋 Carregando lista de preços para distribuidor:', selectedDistributor);
          const response = await apiService.getPriceListByDistributor(selectedDistributor, 1, 1000);
          if (response.success && response.data) {
            setAvailablePriceList(response.data);
            console.log('✅ Lista de preços carregada:', response.data.length, 'itens');
          }
        } catch (error) {
          console.error('❌ Erro ao carregar lista de preços:', error);
          setAvailablePriceList([]);
        }
      } else {
        setAvailablePriceList([]);
      }
    };

    loadPriceList();
  }, [selectedDistributor]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleCreateProposal = () => {
    setEditingProposal(null);
    setSelectedClient({ name: '', email: '', phone: '', company: '' });
    // Se for vendedor, selecionar automaticamente ele mesmo
    setSelectedSeller(user?.role === 'vendedor' ? user._id : '');
    setSelectedDistributor('');
    setSelectedProducts([]);
    setPaymentCondition('');
    setObservations('');
    setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    navigate(`/proposals/edit/${proposal._id}`);
  };

  const handleDeleteProposal = async (proposal: Proposal) => {
    if (window.confirm(`Tem certeza que deseza excluir a proposta ${proposal.proposalNumber}?`)) {
      try {
        setDeletingItems(prev => [...prev, proposal._id]);
        await apiService.deleteProposal(proposal._id);
        setDeletingItems(prev => prev.filter(id => id !== proposal._id));
        await loadData();
        success('Sucesso!', 'Proposta excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao deletar proposta:', err);
        showError('Erro!', `Erro ao deletar proposta: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleGeneratePdf = (proposal: Proposal) => {
    try {
      const pdfData: ProposalPdfData = {
        proposalNumber: proposal.proposalNumber,
        client: proposal.client,
        seller: proposal.seller,
        distributor: proposal.distributor,
        items: proposal.items.map(item => ({
          product: {
            name: item.product.name,
            description: item.product.description || ''
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total
        })),
        subtotal: proposal.subtotal,
        discount: proposal.discount,
        total: proposal.total,
        paymentCondition: proposal.paymentCondition,
        validUntil: proposal.validUntil,
        observations: proposal.observations || '',
        status: proposal.status,
        createdAt: proposal.createdAt
      };
      
      generateProposalPdf(pdfData);
      success('PDF Gerado!', 'PDF da proposta gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showError('Erro!', 'Erro ao gerar PDF da proposta');
    }
  };

  const handleUpdateStatus = async (proposal: Proposal, newStatus: Proposal['status']) => {
    // Se for venda perdida, mostrar modal para capturar motivo
    if (newStatus === 'venda_perdida') {
      setProposalToLose(proposal);
      setLossReason('');
      setLossDescription('');
      setShowLossModal(true);
      return;
    }

    // Para outros status, atualizar diretamente
    try {
      await apiService.updateProposalStatus(proposal._id, newStatus);
      
      // Atualizar metas se a proposta foi fechada
      if (newStatus === 'venda_fechada' && proposal.seller?._id) {
        try {
          await apiService.updateGoalsOnProposalClose(proposal.seller._id, proposal.total || 0);
        } catch (error) {
          console.warn('Erro ao atualizar metas:', error);
        }
      }
      
      await loadData();
      
      // Mostrar modal de sucesso se venda foi fechada
      if (newStatus === 'venda_fechada') {
        setProposalNumber(proposal.proposalNumber || 'N/A');
        setSuccessModalType('win');
        setShowSuccessModal(true);
      } else {
        success('Status Atualizado!', 'Status da proposta atualizado com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      showError('Erro!', `Erro ao atualizar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleConfirmLoss = async () => {
    if (!proposalToLose || !lossReason) {
      warning('Atenção!', 'Selecione um motivo para a perda da venda');
      return;
    }

    try {
      await apiService.updateProposalStatus(
        proposalToLose._id, 
        'venda_perdida', 
        lossReason, 
        lossDescription
      );
      await loadData();
      setShowLossModal(false);
      
      // Mostrar modal de perda
      setProposalNumber(proposalToLose.proposalNumber || 'N/A');
      setSuccessModalType('loss');
      setShowSuccessModal(true);
      
      setProposalToLose(null);
      setLossReason('');
      setLossDescription('');
    } catch (err) {
      console.error('Erro ao marcar como venda perdida:', err);
      showError('Erro!', `Erro ao marcar como venda perdida: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const addProduct = () => {
    if (products.length > 0) {
      setSelectedProducts(prev => [...prev, {
        productId: products[0]._id,
        productName: products[0].name,
        quantity: 1,
        unitPrice: products[0].price || 0,
        discount: 0,
        total: products[0].price || 0
      }]);
    }
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === index) {
        const updated = { ...product, [field]: value };
        
        // Se mudou o produto, buscar o preço da lista de preços
        if (field === 'productId') {
          const selectedProduct = products.find(p => p._id === value);
          if (selectedProduct) {
            updated.productName = selectedProduct.name;
            
            // Buscar preço da lista de preços do distribuidor
            const priceListItem = availablePriceList.find(item => item.product._id === value);
            if (priceListItem) {
              // Usar preço da lista conforme condição de pagamento selecionada
              let price = selectedProduct.price || 0;
              if (paymentCondition === 'À vista' && priceListItem.pricing.aVista) {
                price = priceListItem.pricing.aVista;
              } else if (paymentCondition.startsWith('Crédito') && priceListItem.pricing.credito) {
                price = priceListItem.pricing.credito;
              } else if (paymentCondition.startsWith('Boleto') && priceListItem.pricing.boleto) {
                price = priceListItem.pricing.boleto;
              }
              updated.unitPrice = price;
              console.log(`💰 Preço aplicado da lista: ${price} para produto ${selectedProduct.name}`);
            } else {
              updated.unitPrice = selectedProduct.price || 0;
              console.log(`⚠️ Produto não encontrado na lista de preços, usando preço padrão`);
            }
          }
        }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'productId') {
          updated.total = updated.quantity * updated.unitPrice * (1 - updated.discount / 100);
        }
        return updated;
      }
      return product;
    }));
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, product) => sum + product.total, 0);
    const discount = 0; // Pode ser implementado desconto geral
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handleSaveProposal = async () => {
    try {
      if (!selectedClient.name || !selectedSeller || !selectedDistributor || selectedProducts.length === 0 || !paymentCondition) {
        warning('Atenção!', 'Preencha todos os campos obrigatórios');
        return;
      }

      const { subtotal, discount, total } = calculateTotals();
      const selectedDistributorData = distributors.find(d => d._id === selectedDistributor);
      const selectedSellerData = sellers.find(s => s._id === selectedSeller);

      if (!selectedDistributorData || !selectedSellerData) {
        showError('Erro!', 'Distribuidor ou vendedor não encontrado');
        return;
      }

      const proposalData = {
        client: selectedClient,
        seller: {
          _id: selectedSellerData._id,
          name: selectedSellerData.name,
          email: selectedSellerData.email
        },
        distributor: {
          _id: selectedDistributorData._id,
          apelido: selectedDistributorData.apelido || selectedDistributorData.name || '',
          razaoSocial: selectedDistributorData.razaoSocial || selectedDistributorData.name || '',
          cnpj: selectedDistributorData.cnpj || ''
        },
        items: selectedProducts.map(item => ({
          product: products.find(p => p._id === item.productId)!,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total
        })),
        subtotal,
        discount,
        total,
        paymentCondition,
        observations,
        status: 'negociacao' as const,
        validUntil: new Date(validUntil).toISOString()
      };

      console.log('📝 Dados da proposta sendo enviados:', proposalData);
      console.log('💳 Condição de pagamento:', paymentCondition);

      if (editingProposal) {
        await apiService.updateProposal(editingProposal._id, proposalData);
        success('Sucesso!', 'Proposta atualizada com sucesso!');
      } else {
        await apiService.createProposal(proposalData);
        success('Sucesso!', 'Proposta criada com sucesso!');
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Erro ao salvar proposta:', err);
      showError('Erro!', `Erro ao salvar proposta: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'negociacao': return <AlertCircle size={16} />;
      case 'venda_fechada': return <CheckCircle size={16} />;
      case 'venda_perdida': return <XCircle size={16} />;
      case 'expirada': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'negociacao': return '#f59e0b';
      case 'venda_fechada': return '#059669';
      case 'venda_perdida': return '#dc2626';
      case 'expirada': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: Proposal['status']) => {
    switch (status) {
      case 'negociacao': return 'Negociação';
      case 'venda_fechada': return 'Venda Fechada';
      case 'venda_perdida': return 'Venda Perdida';
      case 'expirada': return 'Expirada';
      default: return status;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      proposal.proposalNumber.toLowerCase().includes(search) ||
      proposal.client.name.toLowerCase().includes(search) ||
      proposal.client.company?.toLowerCase().includes(search) ||
      proposal.seller.name.toLowerCase().includes(search) ||
      (proposal.distributor.apelido || '').toLowerCase().includes(search) ||
      (proposal.distributor.razaoSocial || '').toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <div>Carregando propostas...</div>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <div>{error}</div>
          <Button onClick={loadData}>Tentar novamente</Button>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          {user?.role === 'vendedor' ? 'Minhas Propostas' : 'Propostas Comerciais'}
        </Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar propostas..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchContainer>
          <Select value={statusFilter} onChange={handleStatusFilter} style={{ marginRight: '0.5rem' }}>
            <option value="">Todos os status</option>
            <option value="negociacao">Negociação</option>
            <option value="venda_fechada">Venda Fechada</option>
            <option value="venda_perdida">Venda Perdida</option>
            <option value="expirada">Expirada</option>
          </Select>
          <CreateButton onClick={() => navigate('/proposals/create')}>
            <Plus size={20} />
            Nova Proposta
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        {filteredProposals.length === 0 ? (
          <EmptyState>
            <FileText size={48} />
            <h3>
              {user?.role === 'vendedor' ? 'Você ainda não criou nenhuma proposta' : 'Nenhuma proposta encontrada'}
            </h3>
            <p>
              {user?.role === 'vendedor' 
                ? 'Crie sua primeira proposta comercial para começar a vender' 
                : 'Crie sua primeira proposta comercial'
              }
            </p>
            <CreateButton onClick={() => navigate('/proposals/create')}>
              <Plus size={20} />
              Nova Proposta
            </CreateButton>
          </EmptyState>
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>Distribuidor</TableCell>
                  <TableCell>Produtos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => {
                  const isDeleting = deletingItems.includes(proposal._id);
                  return (
                    <TableRow key={proposal._id} style={{ opacity: isDeleting ? 0.5 : 1 }}>
                      <TableCell>
                        <div style={{ fontWeight: 'bold' }}>{proposal.proposalNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{proposal.client.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            {proposal.client.company || proposal.client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{proposal.seller.name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {proposal.distributor?.apelido || proposal.distributor?.razaoSocial || 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            {proposal.distributor?.razaoSocial || proposal.distributor?.apelido || ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {proposal.items.map((item, index) => (
                            <div key={index} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              {item.product.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                          {formatCurrency(proposal.total)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          $isActive={proposal.status === 'venda_fechada'} 
                          style={{ 
                            backgroundColor: getStatusColor(proposal.status),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {getStatusIcon(proposal.status)}
                          {getStatusLabel(proposal.status)}
                        </StatusBadge>
                      </TableCell>
                      
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{formatDate(proposal.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(3, 1fr)', 
                          gap: '0.25rem',
                          width: '110px'
                        }}>
                          <ActionButton 
                            onClick={() => handleEditProposal(proposal)}
                            disabled={isDeleting}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </ActionButton>
                          <ActionButton 
                            onClick={() => handleGeneratePdf(proposal)}
                            disabled={isDeleting}
                            title="Gerar PDF"
                            style={{ backgroundColor: '#059669' }}
                          >
                            <Download size={14} />
                          </ActionButton>
                          {user?.role === 'admin' && (
                            <ActionButton 
                              onClick={() => handleDeleteProposal(proposal)}
                              disabled={isDeleting}
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </ActionButton>
                          )}
                          {proposal.status === 'negociacao' && (
                            <>
                              <ActionButton 
                                onClick={() => handleUpdateStatus(proposal, 'venda_fechada')}
                                disabled={isDeleting}
                                title="Venda Fechada"
                                style={{ backgroundColor: '#059669' }}
                              >
                                <CheckCircle size={14} />
                              </ActionButton>
                              <ActionButton 
                                onClick={() => handleUpdateStatus(proposal, 'venda_perdida')}
                                disabled={isDeleting}
                                title="Venda Perdida"
                                style={{ backgroundColor: '#dc2626' }}
                              >
                                <XCircle size={14} />
                              </ActionButton>
                              <ActionButton 
                                onClick={() => handleUpdateStatus(proposal, 'expirada')}
                                disabled={isDeleting}
                                title="Marcar como Expirada"
                                style={{ backgroundColor: '#6b7280' }}
                              >
                                <Clock size={14} />
                              </ActionButton>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </Content>

      {/* Modal para criar/editar proposta */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingProposal ? 'Editar Proposta' : 'Nova Proposta'}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              {/* Dados do Cliente */}
              <FormGroup>
                <Label>Dados do Cliente *</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    placeholder="Nome do cliente"
                    value={selectedClient.name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedClient(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={selectedClient.email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedClient(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Telefone"
                    value={selectedClient.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedClient(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Empresa"
                    value={selectedClient.company || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedClient(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </FormGroup>

              {/* Vendedor e Distribuidor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Vendedor *</Label>
                  <Select
                    value={selectedSeller || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSeller(e.target.value)}
                    disabled={user?.role === 'vendedor'}
                    style={{ 
                      backgroundColor: user?.role === 'vendedor' ? '#f3f4f6' : 'white',
                      cursor: user?.role === 'vendedor' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">Selecione o vendedor</option>
                    {sellers.map(seller => (
                      <option key={seller._id} value={seller._id}>
                        {seller.name}
                      </option>
                    ))}
                  </Select>
                  {user?.role === 'vendedor' && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Você será automaticamente selecionado como vendedor
                    </div>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label>Distribuidor *</Label>
                  <Select
                    value={selectedDistributor || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDistributor(e.target.value)}
                  >
                    <option value="">Selecione o distribuidor</option>
                    {distributors.map(distributor => (
                      <option key={distributor._id} value={distributor._id}>
                        {distributor.apelido || 'N/A'} - {distributor.razaoSocial || 'N/A'} {distributor.cnpj ? `(CNPJ: ${distributor.cnpj})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </div>

              {/* Produtos */}
              <FormGroup>
                <Label>Produtos *</Label>
                {selectedProducts.map((product, index) => (
                  <ProductItem key={index}>
                    <ProductHeader>
                      <ProductName>
                        <Select
                          value={product.productId || ''}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const selectedProduct = products.find(p => p._id === e.target.value);
                            if (selectedProduct) {
                              updateProduct(index, 'productId', selectedProduct._id);
                              updateProduct(index, 'productName', selectedProduct.name);
                              updateProduct(index, 'unitPrice', selectedProduct.price || 0);
                            }
                          }}
                        >
                          <option value="">Selecione o produto</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </ProductName>
                      <RemoveButton onClick={() => removeProduct(index)}>
                        <Trash2 size={16} />
                      </RemoveButton>
                    </ProductHeader>
                    <ProductDetails>
                      <PriceRow>
                        <PriceLabel>Quantidade:</PriceLabel>
                        <PriceInput
                          type="number"
                          min="1"
                          value={product.quantity || 1}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabel>Preço Unit.:</PriceLabel>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.unitPrice || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabel>Desconto (%):</PriceLabel>
                        <PriceInput
                          type="number"
                          min="0"
                          max="100"
                          value={product.discount || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(index, 'discount', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabel>Total:</PriceLabel>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.total || 0}
                          readOnly
                          style={{ backgroundColor: '#f3f4f6' }}
                        />
                      </PriceRow>
                    </ProductDetails>
                  </ProductItem>
                ))}
                <AddProductButton onClick={addProduct}>
                  <Plus size={16} />
                  Adicionar Produto
                </AddProductButton>
              </FormGroup>

              {/* Totais */}
              <TotalRow>
                <TotalLabel>Subtotal:</TotalLabel>
                <TotalValue>{formatCurrency(calculateTotals().subtotal)}</TotalValue>
              </TotalRow>
              <TotalRow>
                <TotalLabel>Desconto:</TotalLabel>
                <TotalValue>{formatCurrency(calculateTotals().discount)}</TotalValue>
              </TotalRow>
              <TotalRow style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <TotalLabel>Total:</TotalLabel>
                <TotalValue style={{ color: '#10b981' }}>{formatCurrency(calculateTotals().total)}</TotalValue>
              </TotalRow>

              {/* Condições de Pagamento e Observações */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Condição de Pagamento</Label>
                  <Select
                    value={paymentCondition || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentCondition(e.target.value)}
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
                  <Label>Válido Até</Label>
                  <Input
                    type="date"
                    value={validUntil || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValidUntil(e.target.value)}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Observações</Label>
                <Input
                  placeholder="Observações adicionais..."
                  value={observations || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setObservations(e.target.value)}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProposal}
                style={{ backgroundColor: '#10b981' }}
              >
                {editingProposal ? 'Atualizar' : 'Criar'} Proposta
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de motivo da perda */}
      {showLossModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Motivo da Perda da Venda</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Motivo da Perda *</Label>
                <Select
                  value={lossReason}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLossReason(e.target.value)}
                >
                  <option value="">Selecione o motivo da perda</option>
                  {lossReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Descrição Adicional (Opcional)</Label>
                <Input
                  placeholder="Descreva mais detalhes sobre a perda da venda..."
                  value={lossDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLossDescription(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </FormGroup>

              {proposalToLose && (
                <div style={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem' 
                  }}>
                    <FileText size={16} style={{ marginRight: '0.5rem', color: '#9ca3af' }} />
                    <h4 style={{ 
                      margin: '0', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {proposalToLose.proposalNumber}
                    </h4>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <span style={{ color: '#9ca3af', fontWeight: '500' }}>Cliente:</span>
                      <span style={{ color: '#ffffff', marginLeft: '0.25rem' }}>
                        {proposalToLose.client.name}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af', fontWeight: '500' }}>Total:</span>
                      <span style={{ 
                        color: '#f87171', 
                        fontWeight: '600', 
                        marginLeft: '0.25rem' 
                      }}>
                        {formatCurrency(proposalToLose.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowLossModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmLoss}
                style={{ backgroundColor: '#dc2626' }}
                disabled={!lossReason}
              >
                Confirmar Perda
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <ProposalSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type={successModalType}
        proposalNumber={proposalNumber}
      />
    </Container>
  );
};
