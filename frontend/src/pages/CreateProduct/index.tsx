import React, { useState } from 'react';
import { ArrowLeft, Save, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  Container, 
  Card,
  Header, 
  Title,
  Subtitle,
  BackButton,
  Form,
  FormSection,
  SectionTitle,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  SwitchContainer,
  SwitchLabel,
  Switch,
  ButtonGroup,
  Button,
  LoadingSpinner,
  StatusIndicator
} from './styles';

interface ProductFormData {
  name: string;
  category: string;
  description: string; // Agora obrigatório
  isActive: boolean;
  // Campos opcionais
  price?: number;
  cost?: number;
  brand?: string;
  sku?: string;
  barcode?: string;
  stock: {
    current: number;
    min: number;
    max: number;
  };
  images?: Array<{
    url: string;
    alt: string;
  }>;
  tags?: string[];
}

const categories = [
  'Software',
  'Hardware',
  'Serviços',
  'Consultoria',
  'Marketing',
  'Design',
  'Desenvolvimento',
  'Infraestrutura',
  'Segurança',
  'Outros'
];

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '', // Agora obrigatório
    isActive: true,
    // Valores padrão para compatibilidade com a API
    price: 0,
    cost: 0,
    brand: '',
    sku: '',
    barcode: '',
    stock: {
      current: 0,
      min: 0,
      max: 0
    },
    images: [],
    tags: []
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.description || formData.description.trim().length < 5) {
      alert('Por favor, preencha todos os campos obrigatórios (nome, categoria e descrição com pelo menos 5 caracteres)');
      return;
    }

    try {
      setLoading(true);
      
      // Simplificar dados para evitar problemas
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description, // Agora obrigatório
        // Preço opcional - só incluir se fornecido
        ...(formData.price && formData.price > 0 && { price: formData.price }),
        cost: formData.cost || 0,
        brand: formData.brand || '',
        // Só incluir sku e barcode se não estiverem vazios (para evitar erro de unique)
        ...(formData.sku && { sku: formData.sku }),
        ...(formData.barcode && { barcode: formData.barcode }),
        stock: {
          current: formData.stock.current || 0,
          min: formData.stock.min || 0,
          max: formData.stock.max || 0
        },
        isActive: formData.isActive
      };
      
      console.log('Dados do formulário:', productData);
      await apiService.createProduct(productData);
      alert('Produto criado com sucesso!');
      navigate('/products');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <Container>
      <BackButton onClick={handleCancel}>
        <ArrowLeft size={20} />
        Voltar para Produtos
      </BackButton>

      <Card>
        <Header>
          <Title>
            <Package size={32} />
            Novo Produto
          </Title>
          <Subtitle>
            Cadastre um novo produto no sistema com as informações essenciais
          </Subtitle>
        </Header>

        <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <FormSection>
            <SectionTitle>Informações do Produto</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label>Nome do Produto</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome do produto"
                />
              </FormGroup>

              <FormGroup>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Descrição *</Label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Digite uma descrição detalhada do produto (mínimo 5 caracteres)"
                  required
                />
              </FormGroup>

              <FormGroup>
                <SwitchContainer>
                  <SwitchLabel htmlFor="isActive">
                    Status do Produto
                  </SwitchLabel>
                  <Switch
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                </SwitchContainer>
                {formData.isActive && (
                  <StatusIndicator isActive={formData.isActive}>
                    Produto Ativo
                  </StatusIndicator>
                )}
              </FormGroup>
            </FormRow>
          </FormSection>

          <ButtonGroup>
            <Button 
              type="button"
              variant="secondary" 
              onClick={handleCancel}
            >
              <ArrowLeft size={20} />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Produto
                </>
              )}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};