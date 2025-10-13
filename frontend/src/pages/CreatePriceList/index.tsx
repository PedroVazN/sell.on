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

interface PriceOption {
  parcelas: number;
  preco: number;
}

interface PriceListProduct {
  productId: string;
  productName: string;
  aVista: number;
  credito: PriceOption[];
  boleto: PriceOption[];
  isActive: boolean;
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
        apiService.getProducts(1, 1000)
      ]);
      
      setDistributors(distributorsResponse.data || []);
      setProducts(productsResponse.data || []);
      
      // Inicializar todos os produtos como inativos
      const allProductsInactive = (productsResponse.data || []).map(product => ({
        productId: product._id,
        productName: product.name,
        aVista: 0,
        credito: [],
        boleto: [],
        isActive: false
      }));
      
      setSelectedProducts(allProductsInactive);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePriceList = async () => {
    const activeProducts = selectedProducts.filter(p => p.isActive);
    
    if (!selectedDistributor || activeProducts.length === 0) {
      alert('Selecione um distribuidor e ative pelo menos um produto');
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
        products: activeProducts.map(product => ({
          productId: product.productId,
          pricing: {
            aVista: product.aVista,
            credito: product.credito,
            boleto: product.boleto
          }
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

  const toggleProductActive = (index: number) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === index) {
        return { ...product, isActive: !product.isActive };
      }
      return product;
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === index) {
        return { ...product, [field]: value };
      }
      return product;
    }));
  };

  const addPriceOption = (productIndex: number, type: 'credito' | 'boleto') => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === productIndex) {
        return {
          ...product,
          [type]: [...product[type], { parcelas: 1, preco: 0 }]
        };
      }
      return product;
    }));
  };

  const removePriceOption = (productIndex: number, type: 'credito' | 'boleto', optionIndex: number) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === productIndex) {
        return {
          ...product,
          [type]: product[type].filter((_, idx) => idx !== optionIndex)
        };
      }
      return product;
    }));
  };

  const updatePriceOption = (productIndex: number, type: 'credito' | 'boleto', optionIndex: number, field: 'parcelas' | 'preco', value: any) => {
    setSelectedProducts(prev => prev.map((product, i) => {
      if (i === productIndex) {
        return {
          ...product,
          [type]: product[type].map((option, idx) => 
            idx === optionIndex ? { ...option, [field]: value } : option
          )
        };
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

          <SectionTitle>
            Produtos e Preços * 
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '8px' }}>
              ({selectedProducts.filter(p => p.isActive).length} ativos de {selectedProducts.length})
            </span>
          </SectionTitle>
          
          <ProductList>
            {selectedProducts.length === 0 ? (
              <EmptyState>
                <p>Carregando produtos...</p>
              </EmptyState>
            ) : (
              selectedProducts.map((product, index) => (
                <ProductItem key={index} style={{ 
                  opacity: product.isActive ? 1 : 0.6,
                  border: product.isActive ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <ProductHeader>
                    <ProductNameContainer>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => toggleProductActive(index)}
                          style={{
                            background: product.isActive ? '#10b981' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            minWidth: '80px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {product.isActive ? 'ATIVO' : 'Ativar'}
                        </button>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: product.isActive ? 'bold' : 'normal',
                          color: product.isActive ? '#111827' : '#6b7280',
                          flex: 1
                        }}>
                          {product.productName}
                        </span>
                      </div>
                    </ProductNameContainer>
                  </ProductHeader>

                  {product.isActive && (
                    <ProductPricing>
                      {/* Preço à Vista */}
                      <PriceRow>
                        <PriceLabelInput>Preço à Vista (R$):</PriceLabelInput>
                        <PriceInput
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.aVista || 0}
                          onChange={(e) => updateProduct(index, 'aVista', parseFloat(e.target.value) || 0)}
                        />
                      </PriceRow>

                    {/* Preços no Crédito */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <PriceLabelInput>Preços no Crédito:</PriceLabelInput>
                        <button
                          type="button"
                          onClick={() => addPriceOption(index, 'credito')}
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
                      {product.credito.map((option, optionIndex) => (
                        <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={option.parcelas}
                            onChange={(e) => updatePriceOption(index, 'credito', optionIndex, 'parcelas', parseInt(e.target.value) || 1)}
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
                            onChange={(e) => updatePriceOption(index, 'credito', optionIndex, 'preco', parseFloat(e.target.value) || 0)}
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
                            onClick={() => removePriceOption(index, 'credito', optionIndex)}
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
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <PriceLabelInput>Preços no Boleto:</PriceLabelInput>
                        <button
                          type="button"
                          onClick={() => addPriceOption(index, 'boleto')}
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
                      {product.boleto.map((option, optionIndex) => (
                        <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={option.parcelas}
                            onChange={(e) => updatePriceOption(index, 'boleto', optionIndex, 'parcelas', parseInt(e.target.value) || 1)}
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
                            onChange={(e) => updatePriceOption(index, 'boleto', optionIndex, 'preco', parseFloat(e.target.value) || 0)}
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
                            onClick={() => removePriceOption(index, 'boleto', optionIndex)}
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
                    </ProductPricing>
                  )}
                </ProductItem>
              ))
            )}
          </ProductList>

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
              disabled={saving || !selectedDistributor || selectedProducts.filter(p => p.isActive).length === 0}
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
