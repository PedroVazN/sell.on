import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Search, Edit, Trash2, Loader2, Download, Save, X } from 'lucide-react';
import { apiService, PriceList as PriceListInterface, Distributor, Product } from '../../services/api';
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
  DistributorRow,
  ProductRow,
  DistributorName,
  ProductInfo,
  ProductNameDisplay,
  ProductCategory,
  PriceContainer,
  PriceValue,
  PriceLabelDisplay,
  ProductStatus,
  DateRange,
  ProductNotes,
  ActionContainer,
  SummaryInfo
} from './styles';



interface PriceListProduct {
  productId: string;
  productName: string;
  price: number;
  paymentMethod: 'aVista' | 'cartao' | 'boleto';
  installments?: number;
}

interface NewPriceList {
  _id: string;
  distributorId: string;
  distributorName: string;
  products: PriceListProduct[];
  createdAt: string;
}

export const PriceList: React.FC = () => {
  const navigate = useNavigate();
  const [priceLists, setPriceLists] = useState<PriceListInterface[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingItems, setDeletingItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string | null>(null);
  const [editingPriceList, setEditingPriceList] = useState<PriceListInterface | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando dados...');
      
      const [distributorsResponse, productsResponse, priceListsResponse] = await Promise.all([
        apiService.getDistributors(1, 100),
        apiService.getProducts(1, 1000),
        apiService.getPriceLists(1, 100)
      ]);
      
      setDistributors(distributorsResponse.data || []);
      setProducts(productsResponse.data || []);
      setPriceLists(priceListsResponse.data || []);
      
      console.log('Dados carregados:', {
        distributors: distributorsResponse.data?.length || 0,
        products: productsResponse.data?.length || 0,
        priceLists: priceListsResponse.data?.length || 0
      });
      
      // Debug: verificar estrutura dos dados
      if (priceListsResponse.data && priceListsResponse.data.length > 0) {
        console.log('Primeira PriceList:', priceListsResponse.data[0]);
        console.log('Distributor da primeira PriceList:', priceListsResponse.data[0].distributor);
        console.log('Products da primeira PriceList:', priceListsResponse.data[0].products);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleRowExpansion = (priceListId: string) => {
    setExpandedRows(prev => {
      // Se já está expandido, fecha. Se não, abre (fechando qualquer outro que esteja aberto)
      return prev === priceListId ? null : priceListId;
    });
  };

  const handleCreatePriceList = () => {
    navigate('/price-list/create');
  };

  const handleDeletePriceList = async (priceList: PriceListInterface) => {
    if (window.confirm(`Tem certeza que deseja excluir esta lista de preços?`)) {
      try {
        setLoading(true);
        // Aqui você pode implementar a chamada para a API de delete se necessário
        // await apiService.deletePriceList(priceList._id);
        
        const updatedLists = priceLists.filter(list => list._id !== priceList._id);
        setPriceLists(updatedLists);
        alert('Lista de preços excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir lista de preços:', error);
        alert('Erro ao excluir lista de preços. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditPriceList = (priceList: PriceListInterface) => {
    setEditingPriceList(priceList);
    setShowEditModal(true);
  };

  const handleSavePriceList = async () => {
    if (!editingPriceList) return;

    try {
      setSaving(true);
      
      // Atualizar cada produto da lista
      for (const product of editingPriceList.products || []) {
        if (product._id && !product._id.startsWith('temp_')) {
          await apiService.updatePriceListItem(product._id, {
            pricing: {
              aVista: product.pricing?.aVista || 0,
              credito: product.pricing?.credito || [],
              boleto: product.pricing?.boleto || []
            },
            isActive: product.isActive,
            notes: product.notes
          });
        }
      }

      // Recarregar dados
      await loadData();
      setShowEditModal(false);
      setEditingPriceList(null);
      alert('Lista de preços atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar lista de preços:', error);
      alert('Erro ao salvar lista de preços. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    if (!editingPriceList) return;

    const newProduct = {
      _id: `temp_${Date.now()}`,
      product: {
        _id: '',
        name: '',
        description: '',
        price: 0,
        category: ''
      },
      pricing: {
        aVista: 0,
        credito: [],
        boleto: []
      },
      isActive: true,
      notes: '',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    setEditingPriceList({
      ...editingPriceList,
      products: [...(editingPriceList.products || []), newProduct]
    });
  };

  const handleRemoveProduct = (productId: string) => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.filter(p => p._id !== productId) || []
    });
  };

  const handleProductChange = (productId: string, field: string, value: any) => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.map(p => 
        p._id === productId ? { ...p, [field]: value } : p
      ) || []
    });
  };

  const handlePricingChange = (productId: string, pricingField: string, value: number) => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.map(p => 
        p._id === productId ? { 
          ...p, 
          pricing: { ...p.pricing, [pricingField]: value }
        } : p
      ) || []
    });
  };

  const handleAddPriceOption = (productId: string, type: 'credito' | 'boleto') => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.map(p => 
        p._id === productId ? { 
          ...p, 
          pricing: { 
            ...p.pricing, 
            [type]: [...(p.pricing?.[type] || []), { parcelas: 1, preco: 0 }]
          }
        } : p
      ) || []
    });
  };

  const handleRemovePriceOption = (productId: string, type: 'credito' | 'boleto', optionIndex: number) => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.map(p => 
        p._id === productId ? { 
          ...p, 
          pricing: { 
            ...p.pricing, 
            [type]: (p.pricing?.[type] || []).filter((_, idx) => idx !== optionIndex)
          }
        } : p
      ) || []
    });
  };

  const handleUpdatePriceOption = (productId: string, type: 'credito' | 'boleto', optionIndex: number, field: 'parcelas' | 'preco', value: any) => {
    if (!editingPriceList) return;

    setEditingPriceList({
      ...editingPriceList,
      products: editingPriceList.products?.map(p => 
        p._id === productId ? { 
          ...p, 
          pricing: { 
            ...p.pricing, 
            [type]: (p.pricing?.[type] || []).map((option, idx) => 
              idx === optionIndex ? { ...option, [field]: value } : option
            )
          }
        } : p
      ) || []
    });
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

  const exportToCSV = () => {
    const csvData = [];
    
    // Cabeçalho
    csvData.push([
      'Distribuidor',
      'Produto',
      'Preço',
      'Forma de Pagamento',
      'Parcelas',
      'Data Criação'
    ]);

    // Dados
    priceLists.forEach(priceList => {
      if (priceList.products && priceList.products.length > 0) {
        priceList.products.forEach(product => {
          csvData.push([
            priceList.distributor?.apelido || priceList.distributor?.razaoSocial || 'Distribuidor',
            product.product?.name || 'Produto não encontrado',
            formatCurrency(product.pricing?.aVista || 0),
            'À Vista',
            '1',
            formatDate(priceList.createdAt)
          ]);
        });
      }
    });

    // Converter para CSV
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lista_precos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPriceLists = priceLists.filter(priceList => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (priceList.distributor?.apelido || priceList.distributor?.razaoSocial || '').toLowerCase().includes(search) ||
      priceList.products?.some((product: any) => product.name?.toLowerCase().includes(search))
    );
  });

  // Debug: verificar dados filtrados
  console.log('PriceLists totais:', priceLists.length);
  console.log('PriceLists filtrados:', filteredPriceLists.length);
  console.log('Search term:', searchTerm);
  console.log('filteredPriceLists:', filteredPriceLists);

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Lista de Preços</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar listas..." disabled />
            </SearchContainer>
            <CreateButton disabled>
              <Plus size={20} />
              Nova Lista
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <LoadingState>
            <Loader2 size={32} />
            <p>Carregando listas de preços...</p>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Lista de Preços</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar listas..." disabled />
            </SearchContainer>
            <CreateButton disabled>
              <Plus size={20} />
              Nova Lista
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <ErrorState>
            <p>{error}</p>
            <button onClick={loadData}>Tentar novamente</button>
          </ErrorState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Lista de Preços</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar listas..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchContainer>
          <CreateButton onClick={exportToCSV} style={{ backgroundColor: '#10b981', marginRight: '0.5rem' }}>
            <Download size={20} />
            Exportar CSV
          </CreateButton>
            <CreateButton onClick={handleCreatePriceList}>
              <Plus size={20} />
              Nova Lista de Preços
            </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        {filteredPriceLists.length === 0 ? (
          <EmptyState>
            <DollarSign size={48} />
            <h3>Nenhuma lista de preços encontrada</h3>
            <p>Comece criando sua primeira lista de preços</p>
            <CreateButton onClick={handleCreatePriceList}>
              <Plus size={20} />
              Nova Lista de Preços
            </CreateButton>
          </EmptyState>
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Distribuidor</TableCell>
                  <TableCell>Produtos</TableCell>
                  <TableCell>Data Criação</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPriceLists.map((priceList) => {
                  const isExpanded = expandedRows === priceList._id;
                  
                  return (
                    <React.Fragment key={priceList._id}>
                      {/* Linha principal do distribuidor */}
                      <DistributorRow 
                        $isExpanded={isExpanded}
                        $isDeleting={false}
                        onClick={() => toggleRowExpansion(priceList._id)}
                      >
                      <TableCell>
                          <DistributorName>
                            {isExpanded ? '▼' : '▶'} {priceList.distributor?.apelido || priceList.distributor?.razaoSocial || 'Distribuidor'}
                          </DistributorName>
                      </TableCell>
                      <TableCell>
                          <SummaryInfo>
                            1 produto
                          </SummaryInfo>
                      </TableCell>
                      <TableCell>
                          <SummaryInfo>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Criado: {formatDate(priceList.createdAt)}
                            </div>
                            {priceList.updatedAt && priceList.updatedAt !== priceList.createdAt && (
                              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                                Atualizado: {formatDate(priceList.updatedAt)}
                              </div>
                            )}
                          </SummaryInfo>
                      </TableCell>
                      <TableCell>
                          <ActionContainer onClick={(e) => e.stopPropagation()}>
                            <ActionButton 
                                onClick={() => handleEditPriceList(priceList)}
                                title="Editar Lista"
                                style={{ backgroundColor: '#3b82f6', marginRight: '0.5rem' }}
                            >
                              <Edit size={16} />
                            </ActionButton>
                            <ActionButton 
                                onClick={() => handleDeletePriceList(priceList)}
                                title="Excluir Lista"
                            >
                              <Trash2 size={16} />
                            </ActionButton>
                          </ActionContainer>
                        </TableCell>
                      </DistributorRow>
                      
                      {/* Linhas dos produtos (quando expandido) */}
                      {isExpanded && priceList.products && priceList.products.length > 0 && 
                        priceList.products.map((product: any, productIndex: number) => (
                          <ProductRow key={`${priceList._id}-${productIndex}`}>
                            <TableCell></TableCell>
                            <TableCell>
                              <ProductInfo>
                                <ProductNameDisplay>{product.product?.name || 'Produto não encontrado'}</ProductNameDisplay>
                              </ProductInfo>
                            </TableCell>
                            <TableCell>
                              <PriceContainer>
                                <PriceValue $color="#10b981">
                                  {formatCurrency(product.pricing?.aVista || 0)}
                                </PriceValue>
                                <PriceLabelDisplay>
                                  À Vista
                                </PriceLabelDisplay>
                              </PriceContainer>
                            </TableCell>
                            <TableCell></TableCell>
                          </ProductRow>
                        ))
                      }
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </Content>

      {/* Modal de Edição */}
      {showEditModal && editingPriceList && (
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
            maxWidth: '900px',
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
                Editar Lista de Preços - {editingPriceList.distributor?.apelido || editingPriceList.distributor?.razaoSocial}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
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

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                Produtos
              </h3>
              
              {editingPriceList.products?.map((product, index) => (
                <div key={product._id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: 0, color: '#374151' }}>
                      {product.product?.name || 'Novo Produto'}
                    </h4>
                    <button
                      onClick={() => handleRemoveProduct(product._id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Produto
                      </label>
                      <select
                        value={product.product?._id || ''}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p._id === e.target.value);
                          if (selectedProduct) {
                            handleProductChange(product._id, 'product', selectedProduct);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Selecione um produto</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} - R$ {(p.price || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        Status
                      </label>
                      <select
                        value={product.isActive ? 'true' : 'false'}
                        onChange={(e) => handleProductChange(product._id, 'isActive', e.target.value === 'true')}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Preços
                    </label>
                    
                    {/* Preço à Vista */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        À Vista (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.pricing?.aVista || 0}
                        onChange={(e) => handlePricingChange(product._id, 'aVista', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Preços no Crédito */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>
                          Preços no Crédito
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddPriceOption(product._id, 'credito')}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Plus size={12} />
                          Adicionar
                        </button>
                      </div>
                      {(product.pricing?.credito || []).map((option, optionIndex) => (
                        <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={option.parcelas}
                            onChange={(e) => handleUpdatePriceOption(product._id, 'credito', optionIndex, 'parcelas', parseInt(e.target.value) || 1)}
                            placeholder="Parcelas"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>x</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={option.preco}
                            onChange={(e) => handleUpdatePriceOption(product._id, 'credito', optionIndex, 'preco', parseFloat(e.target.value) || 0)}
                            placeholder="Preço"
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePriceOption(product._id, 'credito', optionIndex)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Preços no Boleto */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#6b7280' }}>
                          Preços no Boleto
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddPriceOption(product._id, 'boleto')}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Plus size={12} />
                          Adicionar
                        </button>
                      </div>
                      {(product.pricing?.boleto || []).map((option, optionIndex) => (
                        <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={option.parcelas}
                            onChange={(e) => handleUpdatePriceOption(product._id, 'boleto', optionIndex, 'parcelas', parseInt(e.target.value) || 1)}
                            placeholder="Parcelas"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>x</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={option.preco}
                            onChange={(e) => handleUpdatePriceOption(product._id, 'boleto', optionIndex, 'preco', parseFloat(e.target.value) || 0)}
                            placeholder="Preço"
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePriceOption(product._id, 'boleto', optionIndex)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Observações
                    </label>
                    <textarea
                      value={product.notes || ''}
                      onChange={(e) => handleProductChange(product._id, 'notes', e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddProduct}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Adicionar Produto
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '20px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              <button
                onClick={() => setShowEditModal(false)}
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
                Cancelar
              </button>
              <button
                onClick={handleSavePriceList}
                disabled={saving}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? <Loader2 size={16} /> : <Save size={16} />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Container>
  );
};