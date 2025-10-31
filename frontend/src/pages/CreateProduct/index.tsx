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
  ButtonGroup,
  Button,
  LoadingSpinner
} from './styles';

interface ProductFormData {
  name: string;
  category: string;
  description: string;
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
    description: ''
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
      
      // Enviar apenas os campos essenciais
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        stock: {
          current: 0,
          min: 0,
          max: 0
        },
        isActive: true
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
            <Package size={28} />
            Novo Produto
          </Title>
          <Subtitle>
            Cadastre um novo produto no sistema
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