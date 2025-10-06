import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Edit, Trash2, Loader2, Download } from 'lucide-react';
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
  ProductNameContainer,
  ProductPricing,
  PriceRow,
  PriceLabelInput,
  PriceInput,
  RemoveButton,
  AddProductButton,
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
  const [priceLists, setPriceLists] = useState<PriceListInterface[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<PriceListProduct[]>([]);
  const [deletingItems, setDeletingItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando dados...');
      
      const [distributorsResponse, productsResponse, priceListsResponse] = await Promise.all([
        apiService.getDistributors(1, 100),
        apiService.getProducts(1, 100),
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
    setSelectedDistributor('');
    setSelectedProducts([]);
    setShowModal(true);
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

  const handleSavePriceList = async () => {
    if (!selectedDistributor || selectedProducts.length === 0) {
      alert('Selecione um distribuidor e pelo menos um produto');
      return;
    }

    const distributor = distributors.find(d => d._id === selectedDistributor);
    if (!distributor) {
      alert('Distribuidor não encontrado');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar dados para a API
      const priceListData = {
        distributorId: selectedDistributor,
        products: selectedProducts.map(product => ({
          productId: product.productId,
          pricing: {
            aVista: product.price,
            boleto: product.paymentMethod === 'boleto' ? product.price : 0,
            cartao: product.paymentMethod === 'cartao' ? product.price : 0
          },
          installments: product.installments || 1
        }))
      };

      console.log('Enviando dados para API:', priceListData);
      await apiService.createPriceList(priceListData);
      
      alert('Lista de preços criada com sucesso!');
      setShowModal(false);
      setSelectedDistributor('');
      setSelectedProducts([]);
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao criar lista de preços:', error);
      alert('Erro ao criar lista de preços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    if (products.length > 0) {
      setSelectedProducts(prev => [...prev, {
        productId: products[0]._id,
        productName: products[0].name,
        price: 0,
        paymentMethod: 'aVista',
        installments: 1
      }]);
    }
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === index) {
          return { ...product, [field]: value };
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
      'Produto',
      'Preço',
      'Forma de Pagamento',
      'Parcelas',
      'Data Criação'
    ]);

    // Dados
    priceLists.forEach(priceList => {
      csvData.push([
        priceList.distributor?.apelido || priceList.distributor?.razaoSocial || 'Distribuidor',
        priceList.product?.name || 'Produto não encontrado',
        formatCurrency(priceList.pricing.aVista),
        'À Vista',
        '1',
        formatDate(priceList.createdAt)
      ]);
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
                          <SummaryInfo>{formatDate(priceList.createdAt)}</SummaryInfo>
                      </TableCell>
                      <TableCell>
                          <ActionContainer onClick={(e) => e.stopPropagation()}>
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
                                <ProductNameDisplay>{product.name || 'Produto não encontrado'}</ProductNameDisplay>
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

      {/* Modal para criar lista de preços */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Nova Lista de Preços</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Distribuidor *</Label>
                <Select
                  value={selectedDistributor || ''}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                >
                  <option value="">Selecione um distribuidor</option>
                  {distributors.map(distributor => (
                    <option key={distributor._id} value={distributor._id}>
                      {distributor.apelido || distributor.razaoSocial}
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
                      <ProductNameContainer>
                        <Select
                          value={product.productId || ''}
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
                      </ProductNameContainer>
                      <RemoveButton onClick={() => removeProduct(index)}>
                        <Trash2 size={16} />
                      </RemoveButton>
                    </ProductHeader>

                    <ProductPricing>
                      <PriceRow>
                        <PriceLabelInput>Preço:</PriceLabelInput>
                        <PriceInput
                          type="number"
                          step="0.01"
                          value={product.price || 0}
                          onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>
                      <PriceRow>
                        <PriceLabelInput>Forma de Pagamento:</PriceLabelInput>
                        <Select
                          value={product.paymentMethod}
                          onChange={(e) => updateProduct(index, 'paymentMethod', e.target.value)}
                        >
                          <option value="aVista">À Vista</option>
                          <option value="cartao">Cartão</option>
                          <option value="boleto">Boleto</option>
                        </Select>
                      </PriceRow>
                      {(product.paymentMethod === 'cartao' || product.paymentMethod === 'boleto') && (
                      <PriceRow>
                          <PriceLabelInput>Parcelas:</PriceLabelInput>
                          <Select
                            value={product.installments || 1}
                            onChange={(e) => updateProduct(index, 'installments', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <option key={num} value={num}>{num}x</option>
                            ))}
                          </Select>
                      </PriceRow>
                      )}
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
                Criar Lista
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};