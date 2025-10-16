import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, FileText, Plus, Trash2, Calculator, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Product, Distributor, User as UserType, PriceOption } from '../../services/api';
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
  GeneratePdfButton
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

export const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState<'created' | 'win' | 'loss'>('created');
  const [proposalNumber, setProposalNumber] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [distributorPriceList, setDistributorPriceList] = useState<any[]>([]);
  
  // Dados para seleção
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  
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
      
      const [productsResponse, distributorsResponse] = await Promise.all([
        apiService.getProducts(1, 1000),
        apiService.getDistributors(1, 1000) // Aumentado para mostrar todos os distribuidores
      ]);

      console.log('Products response:', productsResponse);
      console.log('Distributors response:', distributorsResponse);

      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
        console.log('Products loaded:', productsResponse.data?.length || 0);
      }
      
      // Distribuidores - verificar se tem success ou apenas data
      if (distributorsResponse.success || distributorsResponse.data) {
        setDistributors(distributorsResponse.data || []);
        console.log('Distributors loaded:', distributorsResponse.data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const searchClientByCnpj = async (cnpj: string) => {
    if (!cnpj || cnpj.length < 14) return;

    try {
      console.log('🔍 Buscando cliente por CNPJ:', cnpj);
      const cleanCnpj = cnpj.replace(/\D/g, ''); // Remove formatação
      
      // Buscar cliente na API
      const response = await apiService.getClients(1, 100);
      const existingClient = response.data?.find((client: any) => 
        client.cnpj?.replace(/\D/g, '') === cleanCnpj
      );

      if (existingClient) {
        console.log('✅ Cliente encontrado:', existingClient);
        // Preencher todos os dados do cliente
        setFormData(prev => ({
          ...prev,
          client: {
            name: existingClient.contato?.nome || '',
            email: existingClient.contato?.email || '',
            phone: existingClient.contato?.telefone || '',
            company: existingClient.nomeFantasia || '',
            cnpj: existingClient.cnpj || '',
            razaoSocial: existingClient.razaoSocial || ''
          }
        }));
        alert('Cliente encontrado! Dados preenchidos automaticamente.');
      } else {
        console.log('ℹ️ Cliente não encontrado. Novo cliente será criado.');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
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
      if (!formData.client.cnpj || !formData.client.name || !formData.client.email || !formData.client.razaoSocial) {
        alert('CNPJ, nome do contato, email e razão social são obrigatórios');
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

      // Verificar se cliente existe e criar se necessário
      const cleanCnpj = formData.client.cnpj.replace(/\D/g, '');
      const clientsResponse = await apiService.getClients(1, 100);
      let existingClient = clientsResponse.data?.find((client: any) => 
        client.cnpj?.replace(/\D/g, '') === cleanCnpj
      );

      // Se cliente não existe, criar novo
      if (!existingClient) {
        console.log('📝 Criando novo cliente...');
        const newClientData = {
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
        
        const createResponse = await apiService.createClient(newClientData);
        if (createResponse.success) {
          console.log('✅ Cliente criado com sucesso:', createResponse.data);
          existingClient = createResponse.data;
        } else {
          alert('Erro ao criar cliente. Tente novamente.');
          return;
        }
      } else {
        console.log('✅ Cliente já existe:', existingClient);
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
        status: 'negociacao' as const,
        validUntil: new Date(formData.validUntil).toISOString()
      };

      const response = await apiService.createProposal(proposalData);
      
      if (response.success) {
        // Pegar o número da proposta da resposta
        const propNumber = response.data?.proposalNumber || 'N/A';
        setProposalNumber(propNumber);
        setSuccessModalType('created'); // Tipo 'created' para proposta criada
        setShowSuccessModal(true);
        
        // Aguardar um pouco e navegar
        setTimeout(() => {
          navigate('/proposals');
        }, 3000);
      } else {
        alert('Erro ao criar proposta');
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
      
      // Validar se há dados suficientes para gerar PDF
      if (!formData.client.name || !formData.distributor._id) {
        alert('Preencha os dados básicos antes de gerar o PDF');
        return;
      }
      
      if (formData.items.some(item => !item.product)) {
        alert('Selecione todos os produtos antes de gerar o PDF');
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
        status: 'negociacao',
        createdAt: new Date().toISOString()
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
      alert('Nenhum distribuidor encontrado! Verifique se há distribuidores cadastrados.');
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

    alert('Dados de teste preenchidos com sucesso!');
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

    </Container>
  );
};
