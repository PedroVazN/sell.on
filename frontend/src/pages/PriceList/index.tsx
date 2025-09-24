import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Edit, Trash2, Loader2, Download } from 'lucide-react';
import { apiService, PriceList as PriceListType, Distributor, Product } from '../../services/api';
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
  Button,
  ProductItem,
  ProductHeader,
  ProductName,
  ProductPricing,
  PriceRow,
  PriceLabel,
  PriceInput,
  RemoveButton,
  AddProductButton
} from './styles';



export const PriceList: React.FC = () => {
  const [priceLists, setPriceLists] = useState<PriceListType[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceListType | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string;
    productName: string;
    pricing: {
      aVista: number;
      cartao: number;
      boleto: number;
    };
    isActive: boolean;
    validFrom: string;
    validUntil: string;
    notes: string;
  }[]>([]);
  const [deletingItems, setDeletingItems] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando dados...');
      
      const [priceListResponse, distributorsResponse, productsResponse] = await Promise.all([
        apiService.getPriceList(1, 100),
        apiService.getDistributors(1, 100),
        apiService.getProducts(1, 100)
      ]);
      
      console.log('Resposta da API:', priceListResponse);
      console.log('Dados da API (priceListResponse.data):', priceListResponse.data);
      console.log('Tipo dos dados:', typeof priceListResponse.data);
      console.log('É array?', Array.isArray(priceListResponse.data));
      
      setPriceLists(priceListResponse.data || []);
      setDistributors(distributorsResponse.data || []);
      setProducts(productsResponse.data || []);
      
      console.log('Dados carregados:', {
        priceLists: priceListResponse.data?.length || 0,
        distributors: distributorsResponse.data?.length || 0,
        products: productsResponse.data?.length || 0
      });
      
      // Debug: verificar estrutura dos dados
      if (priceListResponse.data && priceListResponse.data.length > 0) {
        console.log('Primeira lista de preços:', priceListResponse.data[0]);
        console.log('Estrutura da primeira lista:', {
          hasDistributor: !!priceListResponse.data[0].distributor,
          hasProducts: !!priceListResponse.data[0].products,
          productsLength: priceListResponse.data[0].products?.length || 0
        });
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

  const handleCreatePriceList = () => {
    setEditingPriceList(null);
    setSelectedDistributor('');
    setSelectedProducts([]);
    setShowModal(true);
  };

  const handleEditPriceList = (priceList: PriceListType) => {
    setEditingPriceList(priceList);
    setSelectedDistributor(priceList.distributor._id);
    setSelectedProducts(priceList.products.map(p => ({
      productId: p.product._id,
      productName: p.product.name,
      pricing: p.pricing,
      isActive: p.isActive,
      validFrom: p.validFrom,
      validUntil: p.validUntil,
      notes: p.notes
    })));
    setShowModal(true);
  };

  const handleDeletePriceList = async (priceList: PriceListType) => {
    if (window.confirm(`Tem certeza que deseja excluir esta lista de preços?`)) {
      try {
        setDeletingItems(prev => [...prev, priceList._id]);
        
        await apiService.deletePriceList(priceList._id);
        
        setDeletingItems(prev => prev.filter(id => id !== priceList._id));
        await loadData();
        
        alert('Lista de preços excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir lista:', err);
        alert(`Erro ao excluir lista: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setDeletingItems(prev => prev.filter(id => id !== priceList._id));
      }
    }
  };

  const handleSavePriceList = async () => {
    try {
      if (!selectedDistributor || selectedProducts.length === 0) {
        alert('Selecione um distribuidor e pelo menos um produto');
        return;
      }

      const priceListData = {
        distributorId: selectedDistributor,
        products: selectedProducts
      };

      if (editingPriceList) {
        // Para atualizar, precisamos usar uma abordagem diferente
        // já que a API atual não suporta PUT para listas completas
        await apiService.customRequest(`/price-list/${editingPriceList._id}`, {
          method: 'PUT',
          body: JSON.stringify(priceListData)
        });
        alert('Lista de preços atualizada com sucesso!');
      } else {
        await apiService.customRequest('/price-list', {
          method: 'POST',
          body: JSON.stringify(priceListData)
        });
        alert('Lista de preços criada com sucesso!');
      }
      
      await loadData();
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar lista:', err);
      alert(`Erro ao salvar lista: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const addProduct = () => {
    if (products.length > 0) {
      setSelectedProducts(prev => [...prev, {
        productId: products[0]._id,
        productName: products[0].name,
        pricing: {
          aVista: 0,
          cartao: 0,
          boleto: 0
        },
        isActive: true,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      }]);
    }
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === index) {
        if (field.startsWith('pricing.')) {
          const pricingField = field.split('.')[1];
          return {
            ...product,
            pricing: {
              ...product.pricing,
              [pricingField]: value
            }
          };
        } else {
          return { ...product, [field]: value };
        }
      }
      return product;
    }));
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
      'Razão Social',
      'Contato',
      'Telefone',
      'Produto',
      'Categoria',
      'À Vista',
      '3x Cartão',
      '3x Boleto',
      'Status',
      'Válido De',
      'Válido Até',
      'Observações',
      'Data Criação'
    ]);

    // Dados
    priceLists.forEach(priceList => {
      priceList.products.forEach(product => {
        csvData.push([
          priceList.distributor.apelido,
          priceList.distributor.razaoSocial,
          priceList.distributor.contato.nome,
          priceList.distributor.contato.telefone,
          product.product.name,
          product.product.category,
          formatCurrency(product.pricing.aVista),
          formatCurrency(product.pricing.cartao),
          formatCurrency(product.pricing.boleto),
          product.isActive ? 'Ativo' : 'Inativo',
          formatDate(product.validFrom),
          formatDate(product.validUntil),
          product.notes || '',
          formatDate(priceList.createdAt)
        ]);
      });
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
      priceList.distributor?.apelido?.toLowerCase().includes(search) ||
      priceList.distributor?.razaoSocial?.toLowerCase().includes(search) ||
      priceList.products.some(product => 
        product.product?.name?.toLowerCase().includes(search)
      )
    );
  });

  // Debug: verificar dados filtrados
  console.log('PriceLists totais:', priceLists.length);
  console.log('PriceLists filtrados:', filteredPriceLists.length);
  console.log('Search term:', searchTerm);

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
                  <TableCell>Razão Social</TableCell>
                  <TableCell>Contato</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Produto</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>À Vista</TableCell>
                  <TableCell>3x Cartão</TableCell>
                  <TableCell>3x Boleto</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Válido De</TableCell>
                  <TableCell>Válido Até</TableCell>
                  <TableCell>Observações</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPriceLists.map((priceList) => {
                  const isDeleting = deletingItems.includes(priceList._id);
                  return priceList.products.map((product, productIndex) => (
                    <TableRow key={`${priceList._id}-${product._id}`} style={{ opacity: isDeleting ? 0.5 : 1 }}>
                      <TableCell>
                        <div style={{ fontWeight: 'bold' }}>{priceList.distributor.apelido}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{priceList.distributor.razaoSocial}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{priceList.distributor.contato.nome}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{priceList.distributor.contato.telefone}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 'bold' }}>{product.product.name}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{product.product.category}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                          {formatCurrency(product.pricing.aVista)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                          {formatCurrency(product.pricing.cartao)}
                    </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                          {formatCurrency(product.pricing.boleto)}
                            </div>
                      </TableCell>
                      <TableCell>
                            <StatusBadge $isActive={product.isActive}>
                              {product.isActive ? 'Ativo' : 'Inativo'}
                            </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{formatDate(product.validFrom)}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem' }}>{formatDate(product.validUntil)}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.notes || '-'}
                          </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {productIndex === 0 && (
                            <>
                            <ActionButton 
                                onClick={() => handleEditPriceList(priceList)}
                              disabled={isDeleting}
                                title="Editar Lista"
                            >
                              <Edit size={16} />
                            </ActionButton>
                            <ActionButton 
                                onClick={() => handleDeletePriceList(priceList)}
                              disabled={isDeleting}
                                title="Excluir Lista"
                            >
                              {isDeleting ? <Loader2 size={16} /> : <Trash2 size={16} />}
                            </ActionButton>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </Content>

      {/* Modal para criar/editar lista de preços */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingPriceList ? 'Editar Lista de Preços' : 'Nova Lista de Preços'}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Distribuidor *</Label>
                <Select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                >
                  <option value="">Selecione um distribuidor</option>
                  {distributors.map(distributor => (
                    <option key={distributor._id} value={distributor._id}>
                      {distributor.apelido} - {distributor.razaoSocial}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <Label>Produtos e Preços *</Label>
                  <AddProductButton onClick={addProduct}>
                    <Plus size={16} />
                    Adicionar Produto
                  </AddProductButton>
                </div>

                {selectedProducts.map((product, index) => (
                  <ProductItem key={index}>
                    <ProductHeader>
                      <ProductName>
                        <Select
                          value={product.productId}
                          onChange={(e) => {
                            const selectedProduct = products.find(p => p._id === e.target.value);
                            if (selectedProduct) {
                              updateProduct(index, 'productId', selectedProduct._id);
                              updateProduct(index, 'productName', selectedProduct.name);
                            }
                          }}
                        >
                          <option value="">Selecione um produto</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </Select>
                      </ProductName>
                      <RemoveButton onClick={() => removeProduct(index)}>
                        <Trash2 size={16} />
                      </RemoveButton>
                    </ProductHeader>

                    <ProductPricing>
                      <PriceRow>
                        <PriceLabel>À Vista:</PriceLabel>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.pricing.aVista}
                          onChange={(e) => updateProduct(index, 'pricing.aVista', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabel>Cartão (3x):</PriceLabel>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.pricing.cartao}
                          onChange={(e) => updateProduct(index, 'pricing.cartao', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabel>Boleto (3x):</PriceLabel>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.pricing.boleto}
                          onChange={(e) => updateProduct(index, 'pricing.boleto', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                    </ProductPricing>
                  </ProductItem>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePriceList} style={{ backgroundColor: '#3b82f6' }}>
                {editingPriceList ? 'Atualizar' : 'Criar'} Lista
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};