import React, { useState, useEffect } from 'react';
import { apiService, Client } from '../../services/api';
import { X, Loader2 } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.modal};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${theme.shadows.large};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(90vh - 140px);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.secondary};
    border-radius: 4px;
    border: 1px solid ${theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.border.secondary} ${theme.colors.background.secondary};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${theme.colors.text.primary};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
  flex-shrink: 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  
  ${({ variant = 'secondary' }) => variant === 'primary' ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border.primary};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.border.secondary};
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.colors.border.primary};
`;

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client
}) => {
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
    observacoes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          cnpj: client.cnpj,
          razaoSocial: client.razaoSocial,
          nomeFantasia: client.nomeFantasia || '',
          contato: {
            nome: client.contato.nome,
            email: client.contato.email,
            telefone: client.contato.telefone,
            cargo: client.contato.cargo || ''
          },
          endereco: {
            cep: client.endereco.cep || '',
            logradouro: client.endereco.logradouro || '',
            numero: client.endereco.numero || '',
            complemento: client.endereco.complemento || '',
            bairro: client.endereco.bairro || '',
            cidade: client.endereco.cidade || '',
            uf: client.endereco.uf
          },
          classificacao: client.classificacao,
          observacoes: client.observacoes || ''
        });
      } else {
        setFormData({
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
          observacoes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, client]);

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
      const clientData = {
        cnpj: formData.cnpj,
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia || undefined,
        contato: formData.contato,
        endereco: formData.endereco,
        classificacao: formData.classificacao as 'PROVEDOR' | 'REVENDA' | 'OUTROS',
        observacoes: formData.observacoes || undefined,
        isActive: true
      };

      let response;
      if (client) {
        response = await apiService.updateClient(client._id, clientData);
      } else {
        response = await apiService.createClient(clientData);
      }
      
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
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
              <Label>Observações</Label>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações sobre o cliente..."
                rows={3}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              onClick={onClose}
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
                  Salvando...
                </>
              ) : (
                client ? 'Atualizar Cliente' : 'Criar Cliente'
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};
