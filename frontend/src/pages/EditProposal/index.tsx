import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, FileText, Plus, Trash2, Calculator, Download, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService, Product, Distributor, User as UserType, Proposal, PriceOption, PriceListItem as PriceListItemType } from '../../services/api';
import { generateProposalPdf, ProposalPdfData } from '../../utils/pdfGenerator';
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
  GeneratePdfButton
} from '../CreateProposal/styles';

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

export const EditProposal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [distributorPriceList, setDistributorPriceList] = useState<PriceListItemType[]>([]);
  
  // Dados para seleção
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [sellers, setSellers] = useState<UserType[]>([]);
  
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
      _id: '',
      name: '',
      email: ''
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
      
      // Carregar proposta
      if (id) {
        console.log('Carregando proposta com ID:', id);
        const proposalResponse = await apiService.getProposal(id);
        console.log('Resposta da API:', proposalResponse);
        if (proposalResponse.success && proposalResponse.data) {
          const proposalData = proposalResponse.data;
          console.log('Dados da proposta:', proposalData);
          setProposal(proposalData);
          
          // Preencher formulário com dados da proposta
          setFormData({
            client: {
              name: proposalData.client.name,
              email: proposalData.client.email,
              phone: proposalData.client.phone || '',
              company: proposalData.client.company || '',
              cnpj: proposalData.client.cnpj || '',
              razaoSocial: proposalData.client.razaoSocial || ''
            },
            seller: proposalData.seller,
            distributor: {
              ...proposalData.distributor,
              cnpj: proposalData.distributor.cnpj || ''
            },
            items: proposalData.items.map(item => ({
              product: {
                _id: item.product._id,
                name: item.product.name,
                description: item.product.description || '',
                category: item.product.category || '',
                price: item.product.price || 0,
                stock: { current: 0, min: 0 },
                isActive: true,
                createdAt: '',
                updatedAt: ''
              } as Product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total
            })),
            paymentCondition: proposalData.paymentCondition,
            validUntil: proposalData.validUntil.split('T')[0],
            observations: proposalData.observations || ''
          });
        }
      }
      
      // Carregar dados para seleção
      const [productsResponse, distributorsResponse, sellersResponse] = await Promise.all([
        apiService.getProducts(1, 1000),
        apiService.getDistributors(),
        apiService.getUsers()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
      }
      if (distributorsResponse.success) {
        setDistributors(distributorsResponse.data || []);
      }
      if (sellersResponse.success) {
        setSellers(sellersResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Carregar lista de preços quando o distribuidor for definido
  useEffect(() => {
    const loadDistributorPriceList = async () => {
      if (formData.distributor._id) {
        try {
          const priceListResponse = await apiService.getPriceListByDistributor(formData.distributor._id, 1, 100);
          setDistributorPriceList(priceListResponse.data || []);
          console.log('Lista de preços do distribuidor carregada:', priceListResponse.data);
        } catch (error) {
          console.error('Erro ao carregar lista de preços:', error);
          setDistributorPriceList([]);
        }
      }
    };

    loadDistributorPriceList();
  }, [formData.distributor._id]);

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

  const handleSellerChange = (sellerId: string) => {
    const seller = sellers.find(s => s._id === sellerId);
    if (seller) {
      setFormData(prev => ({
        ...prev,
        seller: {
          _id: seller._id,
          name: seller.name,
          email: seller.email
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

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const newItems = [...formData.items];
      const price = product.price || 0; // Usar 0 como padrão se price for undefined
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
      
      // Validar dados obrigatórios
      if (!formData.client.name || !formData.client.email) {
        alert('Nome e email do cliente são obrigatórios');
        return;
      }
      
      if (!formData.seller._id) {
        alert('Vendedor é obrigatório');
        return;
      }
      
      if (!formData.distributor._id) {
        alert('Distribuidor é obrigatório');
        return;
      }
      
      if (formData.items.some(item => !item.product)) {
        alert('Todos os produtos devem ser selecionados');
        return;
      }
      
      if (!formData.paymentCondition) {
        alert('Condição de pagamento é obrigatória');
        return;
      }
      
      if (!formData.validUntil) {
        alert('Data de validade é obrigatória');
        return;
      }

      if (!id) {
        alert('ID da proposta não encontrado');
        return;
      }

      // Preparar dados para envio
      const proposalData = {
        client: formData.client,
        seller: formData.seller,
        distributor: formData.distributor,
        items: formData.items.map(item => ({
          product: {
            _id: item.product!._id,
            name: item.product!.name,
            description: item.product!.description || '',
            category: item.product!.category || '',
            price: item.product!.price || 0
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
        observations: formData.observations,
        status: proposal?.status || 'negociacao',
        validUntil: new Date(formData.validUntil).toISOString()
      };

      const response = await apiService.updateProposal(id, proposalData);
      
      if (response.success) {
        // Atualizar metas se a proposta foi fechada
        if (proposalData.status === 'venda_fechada' && formData.seller._id) {
          try {
            await apiService.updateGoalsOnProposalClose(formData.seller._id, total);
          } catch (error) {
            console.warn('Erro ao atualizar metas:', error);
          }
        }
        
        alert('Proposta atualizada com sucesso!');
        navigate('/proposals');
      } else {
        alert('Erro ao atualizar proposta');
      }
    } catch (error) {
      console.error('Erro ao salvar proposta:', error);
      alert('Erro ao salvar proposta');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true);
      
      if (!proposal) {
        alert('Proposta não encontrada');
        return;
      }
      
      // Preparar dados para o PDF
      const pdfData: ProposalPdfData = {
        proposalNumber: proposal.proposalNumber,
        client: formData.client,
        seller: formData.seller,
        distributor: formData.distributor,
        items: formData.items.map(item => ({
          product: {
            name: item.product!.name,
            description: item.product!.description || ''
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
        status: proposal.status,
        createdAt: proposal.createdAt
      };
      
      // Gerar PDF
      generateProposalPdf(pdfData);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShowSummary = () => {
    setShowSummaryModal(true);
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

  if (!proposal) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/proposals')}>
            <ArrowLeft size={20} />
            Voltar
          </BackButton>
          <Title>Proposta não encontrada</Title>
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
        <Title>Editar Proposta - {proposal.proposalNumber}</Title>
      </Header>

      <FormContainer>
        <TwoColumnLayout>
          <LeftColumn>
        {/* Dados do Cliente */}
        <FormSection>
          <SectionTitle>Dados do Cliente</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Nome *</Label>
              <Input
                type="text"
                value={formData.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="Nome completo do cliente"
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
              <Label>Empresa</Label>
              <Input
                type="text"
                value={formData.client.company}
                onChange={(e) => handleClientChange('company', e.target.value)}
                placeholder="Nome da empresa"
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>CNPJ</Label>
              <Input
                type="text"
                value={formData.client.cnpj}
                onChange={(e) => handleClientChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </FormGroup>
            <FormGroup>
              <Label>Razão Social</Label>
              <Input
                type="text"
                value={formData.client.razaoSocial}
                onChange={(e) => handleClientChange('razaoSocial', e.target.value)}
                placeholder="Razão social da empresa"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Vendedor e Distribuidor */}
        <FormSection>
          <SectionTitle>Vendedor e Distribuidor</SectionTitle>
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
                    {seller.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
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
            <ProductItem key={index}>
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
                        {product.name} - R$ {(product.price || 0).toFixed(2)}
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
                
                <FormGroup>
                  <Label>Total</Label>
                  <ProductInput
                    type="text"
                    value={`R$ ${item.total.toFixed(2)}`}
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
            <TotalValue>R$ {subtotal.toFixed(2)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <span>Desconto:</span>
            <TotalValue>- R$ {totalDiscount.toFixed(2)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <span>Total:</span>
            <TotalValue>R$ {total.toFixed(2)}</TotalValue>
          </TotalRow>
        </TotalSection>

        {/* Botões de Ação */}
        <ActionButtons>
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Atualizar Proposta'}
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
                    <PriceValue>R$ {(item.pricing?.aVista || 0).toFixed(2)}</PriceValue>
                  </PriceRow>
                  {item.pricing?.boleto?.map((option: PriceOption, index: number) => (
                    <PriceRow key={`boleto-${index}`}>
                      <PriceLabel>{option.parcelas}x Boleto:</PriceLabel>
                      <PriceValue>R$ {option.preco.toFixed(2)}</PriceValue>
                    </PriceRow>
                  ))}
                  {item.pricing?.credito?.map((option: PriceOption, index: number) => (
                    <PriceRow key={`credito-${index}`}>
                      <PriceLabel>{option.parcelas}x Cartão:</PriceLabel>
                      <PriceValue>R$ {option.preco.toFixed(2)}</PriceValue>
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
                  <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Vendedor:</strong> {formData.seller.name}</p>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Distribuidor:</strong> {formData.distributor.apelido || formData.distributor.razaoSocial || 'N/A'}</p>
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
                        <strong> Preço:</strong> R$ {(item.unitPrice || 0).toFixed(2)} | 
                        <strong> Desconto:</strong> {item.discount}% | 
                        <strong> Total:</strong> R$ {(item.total || 0).toFixed(2)}
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
                    <strong>Subtotal:</strong> R$ {(subtotal || 0).toFixed(2)}
                  </p>
                  <p style={{ margin: '4px 0', color: '#4b5563' }}>
                    <strong>Desconto:</strong> -R$ {(totalDiscount || 0).toFixed(2)}
                  </p>
                  <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>
                    <strong>TOTAL:</strong> R$ {(total || 0).toFixed(2)}
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
    </Container>
  );
};
