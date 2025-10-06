import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, X } from 'lucide-react';
import { apiService, Distributor, Product } from '../../services/api';
import { 
  Container, 
  Header, 
  Title, 
  BackButton,
  Content,
  Form,
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
  ButtonGroup,
  SectionTitle,
  ProductList,
  EmptyState
} from './styles';

interface PriceListProduct {
  productId: string;
  productName: string;
  price: number;
  paymentMethod: 'aVista' | 'cartao' | 'boleto';
  installments?: number;
}

export const CreatePriceList: React.FC = () => {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<PriceListProduct[]>([]);

  useEffect(() => {
    loadData();
    
    // Injeta CSS global para forçar cores das opções
    const style = document.createElement('style');
    style.textContent = `
      /* Força cores em TODOS os selects e opções */
      select[data-theme="dark"], 
      select[data-theme="dark"] *,
      select[data-theme="dark"] option {
        background: #1f2937 !important;
        background-color: #1f2937 !important;
        color: #ffffff !important;
        padding: 8px !important;
        font-size: 14px !important;
        border: none !important;
      }
      
      select[data-theme="dark"] option:hover {
        background: #374151 !important;
        background-color: #374151 !important;
        color: #ffffff !important;
      }
      
      select[data-theme="dark"] option:checked {
        background: #3b82f6 !important;
        background-color: #3b82f6 !important;
        color: #ffffff !important;
      }
      
      select[data-theme="dark"] option:focus {
        background: #1f2937 !important;
        background-color: #1f2937 !important;
        color: #ffffff !important;
      }
      
      select[data-theme="dark"] option:active {
        background: #374151 !important;
        background-color: #374151 !important;
        color: #ffffff !important;
      }
      
      /* Fallback para todos os selects */
      select, select option {
        background: #1f2937 !important;
        background-color: #1f2937 !important;
        color: #ffffff !important;
      }
      
      /* Força para Webkit */
      select::-webkit-list-button {
        background: #1f2937 !important;
        color: #ffffff !important;
      }
      
      /* Força para Firefox */
      select:-moz-focusring {
        color: transparent !important;
        text-shadow: 0 0 0 #ffffff !important;
      }
      
      /* Força para Edge */
      select::-ms-value {
        background: #1f2937 !important;
        color: #ffffff !important;
      }
      
      select::-ms-expand {
        background: #1f2937 !important;
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
    
    // Força cores via JavaScript também
    const forceSelectColors = () => {
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        const options = select.querySelectorAll('option');
        options.forEach(option => {
          option.style.backgroundColor = '#1f2937';
          option.style.color = '#ffffff';
          option.style.padding = '8px';
        });
      });
    };
    
    // Aplica imediatamente
    forceSelectColors();
    
    // Aplica quando o DOM muda
    const observer = new MutationObserver(forceSelectColors);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [distributorsResponse, productsResponse] = await Promise.all([
        apiService.getDistributors(1, 100),
        apiService.getProducts(1, 100)
      ]);
      
      setDistributors(distributorsResponse.data || []);
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
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
      setSaving(true);
      
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

      await apiService.createPriceList(priceListData);
      
      alert('Lista de preços criada com sucesso!');
      navigate('/price-list');
    } catch (error) {
      console.error('Erro ao criar lista de preços:', error);
      alert('Erro ao criar lista de preços. Tente novamente.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/price-list')}>
            <ArrowLeft size={20} />
            Voltar
          </BackButton>
          <Title>Criar Lista de Preços</Title>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Carregando dados...</p>
          </div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/price-list')}>
          <ArrowLeft size={20} />
          Voltar
        </BackButton>
        <Title>Criar Lista de Preços</Title>
      </Header>
      
      <Content>
        <Form>
          <FormGroup>
            <Label>Distribuidor *</Label>
            <Select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              style={{
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
              data-theme="dark"
            >
              <option value="">Selecione um distribuidor</option>
              {distributors.map(distributor => (
                <option key={distributor._id} value={distributor._id}>
                  {distributor.apelido || distributor.razaoSocial}
                </option>
              ))}
            </Select>
          </FormGroup>

          <SectionTitle>Produtos e Preços *</SectionTitle>
          
          <ProductList>
            {selectedProducts.length === 0 ? (
              <EmptyState>
                <p>Nenhum produto adicionado</p>
                <AddProductButton onClick={addProduct}>
                  <Plus size={16} />
                  Adicionar Primeiro Produto
                </AddProductButton>
              </EmptyState>
            ) : (
              selectedProducts.map((product, index) => (
                <ProductItem key={index}>
                  <ProductHeader>
                    <ProductNameContainer>
                      <Select
                        value={product.productId}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p._id === e.target.value);
                          if (selectedProduct) {
                            updateProduct(index, 'productId', selectedProduct._id);
                            updateProduct(index, 'productName', selectedProduct.name);
                          }
                        }}
                        style={{
                          backgroundColor: '#1f2937',
                          color: '#ffffff'
                        }}
                        data-theme="dark"
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
                        style={{
                          backgroundColor: '#1f2937',
                          color: '#ffffff'
                        }}
                        data-theme="dark"
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
                          style={{
                            backgroundColor: '#1f2937',
                            color: '#ffffff'
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                            <option key={num} value={num}>{num}x</option>
                          ))}
                        </Select>
                      </PriceRow>
                    )}
                  </ProductPricing>
                </ProductItem>
              ))
            )}
          </ProductList>

          <ButtonGroup>
            <AddProductButton onClick={addProduct}>
              <Plus size={16} />
              Adicionar Produto
            </AddProductButton>
          </ButtonGroup>

          <ButtonGroup style={{ marginTop: '2rem', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => navigate('/price-list')}
              style={{ backgroundColor: '#6b7280', marginRight: '1rem' }}
            >
              <X size={16} />
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePriceList}
              disabled={saving || !selectedDistributor || selectedProducts.length === 0}
              style={{ backgroundColor: '#10b981' }}
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Lista'}
            </Button>
          </ButtonGroup>
        </Form>
      </Content>
    </Container>
  );
};
