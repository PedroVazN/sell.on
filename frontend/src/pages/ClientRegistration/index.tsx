import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Loader2, CheckCircle } from 'lucide-react';
import { apiService, Client, User } from '../../services/api';
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

export const ClientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    contato: {
      nome: '',
      email: '',
      telefone: '',
      cargo: ''
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
    classificacao: 'OUTROS',
    observacoes: '',
    assignedTo: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    apiService.getUsers(1, 200).then((r) => r.data && setUsers(r.data));
  }, []);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (!formData.razaoSocial) {
      newErrors.razaoSocial = 'Razão social é obrigatória';
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

    if (!formData.endereco.uf) {
      newErrors['endereco.uf'] = 'UF é obrigatória';
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
      const clientData: Parameters<typeof apiService.createClient>[0] = {
        cnpj: formData.cnpj,
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia || undefined,
        contato: formData.contato,
        endereco: formData.endereco,
        classificacao: formData.classificacao as 'PROVEDOR' | 'REVENDA' | 'OUTROS',
        observacoes: formData.observacoes || undefined,
        isActive: true
      };
      if (formData.assignedTo) {
        (clientData as Record<string, unknown>).assignedTo = formData.assignedTo;
      }

      await apiService.createClient(clientData);
      setIsSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clients');
  };

  if (isSuccess) {
    return (
      <Container>
        <Header>
          <Title>Cadastro de Cliente</Title>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
            Voltar
          </BackButton>
        </Header>
        <Content>
          <SuccessMessage>
            <CheckCircle size={48} />
            <h3>Cliente cadastrado com sucesso!</h3>
            <p>Redirecionando para a lista de clientes...</p>
          </SuccessMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Cadastro de Cliente</Title>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          Voltar
        </BackButton>
      </Header>
      
      <Content>
        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>Dados da Empresa</SectionTitle>
            <Grid columns={2}>
              <FormGroup>
                <Label>CNPJ *</Label>
                <Input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  $hasError={!!errors.cnpj}
                />
                {errors.cnpj && <ErrorMessage>{errors.cnpj}</ErrorMessage>}
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

            <FormGroup>
              <Label>Nome Fantasia</Label>
              <Input
                type="text"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleInputChange}
                placeholder="Nome Fantasia (opcional)"
              />
            </FormGroup>
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
              </FormGroup>

              <FormGroup>
                <Label>UF *</Label>
                <Select
                  name="endereco.uf"
                  value={formData.endereco.uf}
                  onChange={handleInputChange}
                  $hasError={!!errors['endereco.uf']}
                >
                  <option value="">Selecione a UF</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </Select>
                {errors['endereco.uf'] && <ErrorMessage>{errors['endereco.uf']}</ErrorMessage>}
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
            <SectionTitle>Classificação</SectionTitle>
            <FormGroup>
              <Label>Classificação</Label>
              <Select
                name="classificacao"
                value={formData.classificacao}
                onChange={handleInputChange}
              >
                <option value="PROVEDOR">PROVEDOR</option>
                <option value="REVENDA">REVENDA</option>
                <option value="OUTROS">OUTROS</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Vendedor responsável (carteira)</Label>
              <Select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
              >
                <option value="">Nenhum / Não atribuído</option>
                {users.filter((u) => u.role === 'vendedor').map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} {u.email ? `(${u.email})` : ''}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Observações</Label>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações sobre o cliente..."
                rows={3}
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
                'Cadastrar Cliente'
              )}
            </Button>
          </div>
        </Form>
      </Content>
    </Container>
  );
};
