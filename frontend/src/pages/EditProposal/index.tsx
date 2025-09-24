import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, FileText, Plus, Trash2, Calculator, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService, Product, Distributor, User as UserType, Proposal } from '../../services/api';
import { generateProposalPdf, ProposalPdfData } from '../../utils/pdfGenerator';
import { testPdf } from '../../utils/testPdf';
import { 
  Container, 
  Header, 
  Title, 
  BackButton,
  FormContainer,
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
  const [proposal, setProposal] = useState<Proposal | null>(null);
  
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
      company: ''
    },
    seller: {
      _id: '',
      name: '',
      email: ''
    },
    distributor: {
      _id: '',
      apelido: '',
      razaoSocial: ''
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

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar proposta
      if (id) {
        const proposalResponse = await apiService.getProposal(id);
        if (proposalResponse.success && proposalResponse.data) {
          const proposalData = proposalResponse.data;
          setProposal(proposalData);
          
          // Preencher formulário com dados da proposta
          setFormData({
            client: {
              name: proposalData.client.name,
              email: proposalData.client.email,
              phone: proposalData.client.phone || '',
              company: proposalData.client.company || ''
            },
            seller: proposalData.seller,
            distributor: proposalData.distributor,
            items: proposalData.items.map(item => ({
              product: {
                _id: item.product._id,
                name: item.product.name,
                description: item.product.description || '',
                category: item.product.category || '',
                price: item.product.price,
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
        apiService.getProducts(),
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

  const handleDistributorChange = (distributorId: string) => {
    const distributor = distributors.find(d => d._id === distributorId);
    if (distributor) {
      setFormData(prev => ({
        ...prev,
        distributor: {
          _id: distributor._id,
          apelido: distributor.apelido || '',
          razaoSocial: distributor.razaoSocial || ''
        }
      }));
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        product,
        unitPrice: product.price,
        total: newItems[index].quantity * product.price * (1 - newItems[index].discount / 100)
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
            price: item.product!.price
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
        status: proposal?.status || 'sent',
        validUntil: new Date(formData.validUntil).toISOString()
      };

      const response = await apiService.updateProposal(id, proposalData);
      
      if (response.success) {
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
                    {distributor.apelido || 'N/A'} - {distributor.razaoSocial || 'N/A'}
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
                        {product.name} - R$ {product.price.toFixed(2)}
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
              <Input
                type="text"
                value={formData.paymentCondition}
                onChange={(e) => handleInputChange('paymentCondition', e.target.value)}
                placeholder="Ex: À vista, 30 dias, parcelado em 3x"
              />
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
            onClick={() => testPdf()}
            variant="secondary"
          >
            <FileText size={16} />
            Testar PDF
          </Button>
        </ActionButtons>
      </FormContainer>
    </Container>
  );
};
