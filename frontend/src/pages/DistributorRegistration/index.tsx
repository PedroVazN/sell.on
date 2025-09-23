import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Loader2, CheckCircle } from 'lucide-react';
import { apiService, Distributor } from '../../services/api';
import { 
  Container, 
  Header, 
  Title, 
  BackButton,
  Content,
  Form,
  Section,
  SectionTitle,
  FormGroup,
  Label,
  Input,
  Select,
  Textarea,
  ErrorMessage,
  Button,
  LoadingSpinner,
  SuccessMessage,
  Grid
} from './styles';

export const DistributorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    apelido: '',
    razaoSocial: '',
    idDistribuidor: '',
    contato: {
      nome: '',
      email: '',
      telefone: '',
      cargo: ''
    },
    origem: '',
    atendimento: {
      horario: '',
      dias: '',
      observacoes: ''
    },
    frete: {
      tipo: 'CIF' as 'CIF' | 'FOB' | 'TERCEIRO',
      valor: 0,
      prazo: 0,
      observacoes: ''
    },
    pedidoMinimo: {
      valor: 0,
      observacoes: ''
    },
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    isActive: true,
    observacoes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contato.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contato: {
          ...prev.contato,
          [field]: value
        }
      }));
    } else if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        }
      }));
    } else if (name.startsWith('atendimento.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        atendimento: {
          ...prev.atendimento,
          [field]: value
        }
      }));
    } else if (name.startsWith('frete.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        frete: {
          ...prev.frete,
          [field]: field === 'valor' || field === 'prazo' 
            ? parseFloat(value) || 0 
            : field === 'tipo' 
              ? value as 'CIF' | 'FOB' | 'TERCEIRO'
              : value
        }
      }));
    } else if (name.startsWith('pedidoMinimo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pedidoMinimo: {
          ...prev.pedidoMinimo,
          [field]: field === 'valor' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }
    return value;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.apelido) {
      newErrors.apelido = 'Apelido é obrigatório';
    }

    if (!formData.razaoSocial) {
      newErrors.razaoSocial = 'Razão social é obrigatória';
    }

    if (!formData.idDistribuidor) {
      newErrors.idDistribuidor = 'ID do distribuidor é obrigatório';
    }

    if (!formData.origem) {
      newErrors.origem = 'Origem é obrigatória';
    }

    if (!formData.contato.nome) {
      newErrors['contato.nome'] = 'Nome do contato é obrigatório';
    }

    if (!formData.contato.email) {
      newErrors['contato.email'] = 'Email do contato é obrigatório';
    }

    if (!formData.contato.telefone) {
      newErrors['contato.telefone'] = 'Telefone do contato é obrigatório';
    }

    if (!formData.pedidoMinimo.valor || formData.pedidoMinimo.valor <= 0) {
      newErrors['pedidoMinimo.valor'] = 'Valor do pedido mínimo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.createDistributor(formData);
      setIsSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/distributors');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar distribuidor:', error);
      alert('Erro ao salvar distribuidor. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/distributors');
  };

  if (isSuccess) {
    return (
      <Container>
        <Header>
          <Title>Cadastro de Distribuidor</Title>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
            Voltar
          </BackButton>
        </Header>
        <Content>
          <SuccessMessage>
            <CheckCircle size={48} />
            <h3>Distribuidor cadastrado com sucesso!</h3>
            <p>Redirecionando para a lista de distribuidores...</p>
          </SuccessMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Cadastro de Distribuidor</Title>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          Voltar
        </BackButton>
      </Header>
      
      <Content>
        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>Informações Básicas</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>Apelido *</Label>
                <Input
                  type="text"
                  name="apelido"
                  value={formData.apelido}
                  onChange={handleInputChange}
                  placeholder="Apelido do distribuidor"
                  $hasError={!!errors.apelido}
                />
                {errors.apelido && <ErrorMessage>{errors.apelido}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Razão Social *</Label>
                <Input
                  type="text"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleInputChange}
                  placeholder="Razão Social da Empresa"
                  $hasError={!!errors.razaoSocial}
                />
                {errors.razaoSocial && <ErrorMessage>{errors.razaoSocial}</ErrorMessage>}
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>ID Distribuidor *</Label>
                <Input
                  type="text"
                  name="idDistribuidor"
                  value={formData.idDistribuidor}
                  onChange={handleInputChange}
                  placeholder="ID único do distribuidor"
                  $hasError={!!errors.idDistribuidor}
                />
                {errors.idDistribuidor && <ErrorMessage>{errors.idDistribuidor}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Origem *</Label>
                <Input
                  type="text"
                  name="origem"
                  value={formData.origem}
                  onChange={handleInputChange}
                  placeholder="Cidade/Estado de origem"
                  $hasError={!!errors.origem}
                />
                {errors.origem && <ErrorMessage>{errors.origem}</ErrorMessage>}
              </FormGroup>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>Contato</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>Nome do Contato *</Label>
                <Input
                  type="text"
                  name="contato.nome"
                  value={formData.contato.nome}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  $hasError={!!errors['contato.nome']}
                />
                {errors['contato.nome'] && <ErrorMessage>{errors['contato.nome']}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  name="contato.email"
                  value={formData.contato.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  $hasError={!!errors['contato.email']}
                />
                {errors['contato.email'] && <ErrorMessage>{errors['contato.email']}</ErrorMessage>}
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>Telefone *</Label>
                <Input
                  type="text"
                  name="contato.telefone"
                  value={formData.contato.telefone}
                  onChange={(e) => {
                    e.target.value = formatPhone(e.target.value);
                    handleInputChange(e);
                  }}
                  placeholder="(00) 00000-0000"
                  $hasError={!!errors['contato.telefone']}
                />
                {errors['contato.telefone'] && <ErrorMessage>{errors['contato.telefone']}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Cargo</Label>
                <Input
                  type="text"
                  name="contato.cargo"
                  value={formData.contato.cargo}
                  onChange={handleInputChange}
                  placeholder="Cargo (opcional)"
                />
              </FormGroup>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>Endereço</SectionTitle>
            <Grid columns={3}>
              <FormGroup>
                <Label>CEP</Label>
                <Input
                  type="text"
                  name="endereco.cep"
                  value={formData.endereco.cep}
                  onChange={(e) => {
                    e.target.value = formatCEP(e.target.value);
                    handleInputChange(e);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </FormGroup>

              <FormGroup>
                <Label>UF</Label>
                <Input
                  type="text"
                  name="endereco.uf"
                  value={formData.endereco.uf}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    handleInputChange(e);
                  }}
                  placeholder="UF"
                  maxLength={2}
                />
              </FormGroup>

              <FormGroup>
                <Label>Cidade</Label>
                <Input
                  type="text"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                />
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>Logradouro</Label>
                <Input
                  type="text"
                  name="endereco.logradouro"
                  value={formData.endereco.logradouro}
                  onChange={handleInputChange}
                  placeholder="Rua, Avenida, etc."
                />
              </FormGroup>

              <FormGroup>
                <Label>Número</Label>
                <Input
                  type="text"
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleInputChange}
                  placeholder="Número"
                />
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>Complemento</Label>
                <Input
                  type="text"
                  name="endereco.complemento"
                  value={formData.endereco.complemento}
                  onChange={handleInputChange}
                  placeholder="Apartamento, sala, etc."
                />
              </FormGroup>

              <FormGroup>
                <Label>Bairro</Label>
                <Input
                  type="text"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleInputChange}
                  placeholder="Bairro"
                />
              </FormGroup>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>Frete</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>Tipo de Frete *</Label>
                <Select
                  name="frete.tipo"
                  value={formData.frete.tipo}
                  onChange={handleInputChange}
                >
                  <option value="CIF">CIF</option>
                  <option value="FOB">FOB</option>
                  <option value="TERCEIRO">TERCEIRO</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Valor do Frete</Label>
                <Input
                  type="number"
                  name="frete.valor"
                  value={formData.frete.valor}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>Prazo (dias)</Label>
                <Input
                  type="number"
                  name="frete.prazo"
                  value={formData.frete.prazo}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>Observações do Frete</Label>
                <Input
                  type="text"
                  name="frete.observacoes"
                  value={formData.frete.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações sobre o frete"
                />
              </FormGroup>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>Pedido Mínimo</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>Valor Mínimo *</Label>
                <Input
                  type="number"
                  name="pedidoMinimo.valor"
                  value={formData.pedidoMinimo.valor}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  $hasError={!!errors['pedidoMinimo.valor']}
                />
                {errors['pedidoMinimo.valor'] && <ErrorMessage>{errors['pedidoMinimo.valor']}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Observações do Pedido Mínimo</Label>
                <Input
                  type="text"
                  name="pedidoMinimo.observacoes"
                  value={formData.pedidoMinimo.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações sobre o pedido mínimo"
                />
              </FormGroup>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>Atendimento</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>Horário de Atendimento</Label>
                <Input
                  type="text"
                  name="atendimento.horario"
                  value={formData.atendimento.horario}
                  onChange={handleInputChange}
                  placeholder="Ex: 08:00 às 18:00"
                />
              </FormGroup>

              <FormGroup>
                <Label>Dias de Atendimento</Label>
                <Input
                  type="text"
                  name="atendimento.dias"
                  value={formData.atendimento.dias}
                  onChange={handleInputChange}
                  placeholder="Ex: Segunda a Sexta"
                />
              </FormGroup>
            </Grid>

            <FormGroup>
              <Label>Observações de Atendimento</Label>
              <Textarea
                name="atendimento.observacoes"
                value={formData.atendimento.observacoes}
                onChange={handleInputChange}
                placeholder="Observações sobre o atendimento..."
                rows={3}
              />
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Status e Observações</SectionTitle>
            <FormGroup>
              <Label>Status</Label>
              <Select
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isActive: e.target.value === 'true'
                  }));
                }}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Observações Gerais</Label>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações gerais sobre o distribuidor..."
                rows={4}
              />
            </FormGroup>
          </Section>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Distribuidor'
              )}
            </Button>
          </div>
        </Form>
      </Content>
    </Container>
  );
};
