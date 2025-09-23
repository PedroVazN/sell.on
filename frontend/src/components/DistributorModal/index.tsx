import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { apiService, Distributor } from '../../services/api';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Form,
  FormGroup,
  FormRow,
  Label,
  Input,
  Select,
  TextArea,
  ModalFooter,
  Button,
  ErrorMessage,
  SuccessMessage
} from './styles';

interface DistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  distributor?: Distributor | null;
}

export const DistributorModal: React.FC<DistributorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  distributor = null
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    apelido: distributor?.apelido || '',
    razaoSocial: distributor?.razaoSocial || '',
    idDistribuidor: distributor?.idDistribuidor || '',
    contato: {
      nome: distributor?.contato?.nome || '',
      email: distributor?.contato?.email || '',
      telefone: distributor?.contato?.telefone || '',
      cargo: distributor?.contato?.cargo || ''
    },
    origem: distributor?.origem || '',
    atendimento: {
      horario: distributor?.atendimento?.horario || '',
      dias: distributor?.atendimento?.dias || '',
      observacoes: distributor?.atendimento?.observacoes || ''
    },
    frete: {
      tipo: distributor?.frete?.tipo || 'CIF',
      valor: distributor?.frete?.valor || 0,
      prazo: distributor?.frete?.prazo || 0,
      observacoes: distributor?.frete?.observacoes || ''
    },
    pedidoMinimo: {
      valor: distributor?.pedidoMinimo?.valor || 0,
      observacoes: distributor?.pedidoMinimo?.observacoes || ''
    },
    endereco: {
      cep: distributor?.endereco?.cep || '',
      logradouro: distributor?.endereco?.logradouro || '',
      numero: distributor?.endereco?.numero || '',
      complemento: distributor?.endereco?.complemento || '',
      bairro: distributor?.endereco?.bairro || '',
      cidade: distributor?.endereco?.cidade || '',
      uf: distributor?.endereco?.uf || ''
    },
    isActive: distributor?.isActive ?? true,
    observacoes: distributor?.observacoes || ''
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (distributor) {
        // Atualizar distribuidor existente
        await apiService.updateDistributor(distributor._id, formData);
        setSuccess('Distribuidor atualizado com sucesso!');
      } else {
        // Criar novo distribuidor
        await apiService.createDistributor(formData);
        setSuccess('Distribuidor cadastrado com sucesso!');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar distribuidor');
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {distributor ? 'Editar Distribuidor' : 'Novo Distribuidor'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            {/* Informações Básicas */}
            <FormGroup>
              <h3>Informações Básicas</h3>
              <FormRow>
                <div>
                  <Label htmlFor="apelido">Apelido *</Label>
                  <Input
                    id="apelido"
                    type="text"
                    value={formData.apelido}
                    onChange={(e) => handleInputChange('apelido', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    type="text"
                    value={formData.razaoSocial}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    required
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="idDistribuidor">ID Distribuidor *</Label>
                  <Input
                    id="idDistribuidor"
                    type="text"
                    value={formData.idDistribuidor}
                    onChange={(e) => handleInputChange('idDistribuidor', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="origem">Origem *</Label>
                  <Input
                    id="origem"
                    type="text"
                    value={formData.origem}
                    onChange={(e) => handleInputChange('origem', e.target.value)}
                    required
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Contato */}
            <FormGroup>
              <h3>Contato</h3>
              <FormRow>
                <div>
                  <Label htmlFor="contato.nome">Nome *</Label>
                  <Input
                    id="contato.nome"
                    type="text"
                    value={formData.contato.nome}
                    onChange={(e) => handleInputChange('contato.nome', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contato.email">E-mail *</Label>
                  <Input
                    id="contato.email"
                    type="email"
                    value={formData.contato.email}
                    onChange={(e) => handleInputChange('contato.email', e.target.value)}
                    required
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="contato.telefone">Telefone *</Label>
                  <Input
                    id="contato.telefone"
                    type="text"
                    value={formData.contato.telefone}
                    onChange={(e) => handleInputChange('contato.telefone', formatPhone(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contato.cargo">Cargo</Label>
                  <Input
                    id="contato.cargo"
                    type="text"
                    value={formData.contato.cargo}
                    onChange={(e) => handleInputChange('contato.cargo', e.target.value)}
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Endereço */}
            <FormGroup>
              <h3>Endereço</h3>
              <FormRow>
                <div>
                  <Label htmlFor="endereco.cep">CEP</Label>
                  <Input
                    id="endereco.cep"
                    type="text"
                    value={formData.endereco.cep}
                    onChange={(e) => handleInputChange('endereco.cep', formatCEP(e.target.value))}
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="endereco.uf">UF</Label>
                  <Input
                    id="endereco.uf"
                    type="text"
                    value={formData.endereco.uf}
                    onChange={(e) => handleInputChange('endereco.uf', e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="endereco.logradouro">Logradouro</Label>
                  <Input
                    id="endereco.logradouro"
                    type="text"
                    value={formData.endereco.logradouro}
                    onChange={(e) => handleInputChange('endereco.logradouro', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endereco.numero">Número</Label>
                  <Input
                    id="endereco.numero"
                    type="text"
                    value={formData.endereco.numero}
                    onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="endereco.bairro">Bairro</Label>
                  <Input
                    id="endereco.bairro"
                    type="text"
                    value={formData.endereco.bairro}
                    onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endereco.cidade">Cidade</Label>
                  <Input
                    id="endereco.cidade"
                    type="text"
                    value={formData.endereco.cidade}
                    onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="endereco.complemento">Complemento</Label>
                  <Input
                    id="endereco.complemento"
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Frete */}
            <FormGroup>
              <h3>Frete</h3>
              <FormRow>
                <div>
                  <Label htmlFor="frete.tipo">Tipo de Frete *</Label>
                  <Select
                    id="frete.tipo"
                    value={formData.frete.tipo}
                    onChange={(e) => handleInputChange('frete.tipo', e.target.value)}
                    required
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="TERCEIRO">TERCEIRO</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frete.valor">Valor</Label>
                  <Input
                    id="frete.valor"
                    type="number"
                    step="0.01"
                    value={formData.frete.valor}
                    onChange={(e) => handleInputChange('frete.valor', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="frete.prazo">Prazo (dias)</Label>
                  <Input
                    id="frete.prazo"
                    type="number"
                    value={formData.frete.prazo}
                    onChange={(e) => handleInputChange('frete.prazo', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="frete.observacoes">Observações</Label>
                  <Input
                    id="frete.observacoes"
                    type="text"
                    value={formData.frete.observacoes}
                    onChange={(e) => handleInputChange('frete.observacoes', e.target.value)}
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Pedido Mínimo */}
            <FormGroup>
              <h3>Pedido Mínimo</h3>
              <FormRow>
                <div>
                  <Label htmlFor="pedidoMinimo.valor">Valor Mínimo *</Label>
                  <Input
                    id="pedidoMinimo.valor"
                    type="number"
                    step="0.01"
                    value={formData.pedidoMinimo.valor}
                    onChange={(e) => handleInputChange('pedidoMinimo.valor', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pedidoMinimo.observacoes">Observações</Label>
                  <Input
                    id="pedidoMinimo.observacoes"
                    type="text"
                    value={formData.pedidoMinimo.observacoes}
                    onChange={(e) => handleInputChange('pedidoMinimo.observacoes', e.target.value)}
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Atendimento */}
            <FormGroup>
              <h3>Atendimento</h3>
              <FormRow>
                <div>
                  <Label htmlFor="atendimento.horario">Horário</Label>
                  <Input
                    id="atendimento.horario"
                    type="text"
                    value={formData.atendimento.horario}
                    onChange={(e) => handleInputChange('atendimento.horario', e.target.value)}
                    placeholder="Ex: 08:00 às 18:00"
                  />
                </div>
                <div>
                  <Label htmlFor="atendimento.dias">Dias</Label>
                  <Input
                    id="atendimento.dias"
                    type="text"
                    value={formData.atendimento.dias}
                    onChange={(e) => handleInputChange('atendimento.dias', e.target.value)}
                    placeholder="Ex: Segunda a Sexta"
                  />
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="atendimento.observacoes">Observações</Label>
                  <TextArea
                    id="atendimento.observacoes"
                    value={formData.atendimento.observacoes}
                    onChange={(e) => handleInputChange('atendimento.observacoes', e.target.value)}
                    rows={3}
                  />
                </div>
              </FormRow>
            </FormGroup>

            {/* Status e Observações */}
            <FormGroup>
              <h3>Status e Observações</h3>
              <FormRow>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    id="isActive"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </Select>
                </div>
              </FormRow>
              
              <FormRow>
                <div>
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  <TextArea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    rows={4}
                  />
                </div>
              </FormRow>
            </FormGroup>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {distributor ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};
