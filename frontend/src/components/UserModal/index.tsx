import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User as UserIcon, Mail, Lock, Phone, MapPin, Shield, UserCheck } from 'lucide-react';
import { apiService, User } from '../../services/api';
import * as S from './styles';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
  defaultRole?: 'admin' | 'vendedor' | 'cliente';
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user = null,
  defaultRole
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'vendedor' as 'admin' | 'vendedor' | 'cliente',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'vendedor',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'Brasil'
        }
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: defaultRole || 'vendedor',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        }
      });
    }
    setError(null);
    setSuccess(null);
  }, [user, isOpen, defaultRole]);

  const handleInputChange = (field: string, value: string) => {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    if (!user && !formData.password) {
      setError('Senha é obrigatória');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        address: {
          street: formData.address.street.trim() || undefined,
          city: formData.address.city.trim() || undefined,
          state: formData.address.state.trim() || undefined,
          zipCode: formData.address.zipCode.trim() || undefined,
          country: formData.address.country.trim() || undefined
        }
      };

      if (user) {
        // Atualizar usuário existente
        await apiService.updateUser(user._id, userData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await apiService.createUser({
          ...userData,
          password: formData.password
        });
        setSuccess('Usuário criado com sucesso!');
      }

      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.Title>
            <UserIcon size={24} />
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </S.Title>
          <S.CloseButton onClick={onClose}>
            <X size={20} />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalContent>
          <form onSubmit={handleSubmit}>
            <S.FormSection>
              <S.SectionTitle>Informações Básicas</S.SectionTitle>
              
              <S.FormGroup>
                <S.Label>
                  <UserIcon size={16} />
                  Nome Completo *
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <Mail size={16} />
                  Email *
                </S.Label>
                <S.Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Digite o email"
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <Shield size={16} />
                  Cargo *
                </S.Label>
                <S.Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                  <option value="cliente">Cliente</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <Phone size={16} />
                  Telefone
                </S.Label>
                <S.Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </S.FormGroup>
            </S.FormSection>

            {!user && (
              <S.FormSection>
                <S.SectionTitle>Segurança</S.SectionTitle>
                
                <S.FormGroup>
                  <S.Label>
                    <Lock size={16} />
                    Senha *
                  </S.Label>
                  <S.Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Digite a senha"
                    required={!user}
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>
                    <Lock size={16} />
                    Confirmar Senha *
                  </S.Label>
                  <S.Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme a senha"
                    required={!user}
                  />
                </S.FormGroup>
              </S.FormSection>
            )}

            <S.FormSection>
              <S.SectionTitle>Endereço (Opcional)</S.SectionTitle>
              
              <S.FormGroup>
                <S.Label>
                  <MapPin size={16} />
                  Rua
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Nome da rua"
                />
              </S.FormGroup>

              <S.FormRow>
                <S.FormGroup>
                  <S.Label>Cidade</S.Label>
                  <S.Input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Cidade"
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Estado</S.Label>
                  <S.Input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="Estado"
                  />
                </S.FormGroup>
              </S.FormRow>

              <S.FormRow>
                <S.FormGroup>
                  <S.Label>CEP</S.Label>
                  <S.Input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    placeholder="00000-000"
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>País</S.Label>
                  <S.Input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="País"
                  />
                </S.FormGroup>
              </S.FormRow>
            </S.FormSection>

            {error && (
              <S.ErrorMessage>
                {error}
              </S.ErrorMessage>
            )}

            {success && (
              <S.SuccessMessage>
                {success}
              </S.SuccessMessage>
            )}

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose}>
                Cancelar
              </S.CancelButton>
              <S.SaveButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {user ? 'Atualizar' : 'Criar'} Usuário
                  </>
                )}
              </S.SaveButton>
            </S.ButtonGroup>
          </form>
        </S.ModalContent>
      </S.ModalContainer>
    </S.ModalOverlay>
  );
};

export default UserModal;
