import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Phone, MapPin, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService, User } from '../../services/api';
import * as S from './styles';

export const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: (location.pathname === '/users/create-seller' ? 'vendedor' : 'vendedor') as 'admin' | 'vendedor' | 'cliente',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    }
  });

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
    if (!formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
        address: formData.address.street ? formData.address : undefined
      };

      const response = await apiService.createUser(userData);
      
      if (response.success) {
        setSuccess('Usuário cadastrado com sucesso!');
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        setError(response.message || 'Erro ao cadastrar usuário');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <UserIcon size={28} />
          Cadastrar Usuário
        </S.Title>
        <S.Subtitle>
          Preencha os dados para criar um novo usuário no sistema
        </S.Subtitle>
      </S.Header>

      <S.Content>
        <S.Form onSubmit={handleSubmit}>
          {error && (
            <S.ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </S.ErrorMessage>
          )}

          {success && (
            <S.SuccessMessage>
              <CheckCircle size={16} />
              {success}
            </S.SuccessMessage>
          )}

          <S.Section>
            <S.SectionTitle>
              <UserIcon size={20} />
              Dados Pessoais
            </S.SectionTitle>
            
            <S.FormGrid>
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

              <S.FormGroup>
                <S.Label>
                  <UserIcon size={16} />
                  Função *
                </S.Label>
                <S.Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                  <option value="cliente">Cliente</option>
                </S.Select>
              </S.FormGroup>
            </S.FormGrid>
          </S.Section>

          <S.Section>
            <S.SectionTitle>
              <Lock size={20} />
              Segurança
            </S.SectionTitle>
            
            <S.FormGrid>
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
                  required
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
                  required
                />
              </S.FormGroup>
            </S.FormGrid>
          </S.Section>

          <S.Section>
            <S.SectionTitle>
              <MapPin size={20} />
              Endereço (Opcional)
            </S.SectionTitle>
            
            <S.FormGroup>
              <S.Label>
                <MapPin size={16} />
                Rua
              </S.Label>
              <S.Input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Digite o endereço"
              />
            </S.FormGroup>

            <S.FormGrid>
              <S.FormGroup>
                <S.Label>
                  <MapPin size={16} />
                  Cidade
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Digite a cidade"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <MapPin size={16} />
                  Estado
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="Digite o estado"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <MapPin size={16} />
                  CEP
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="00000-000"
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>
                  <MapPin size={16} />
                  País
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="Digite o país"
                />
              </S.FormGroup>
            </S.FormGrid>
          </S.Section>

          <S.ButtonGroup>
            <S.CancelButton type="button" onClick={handleCancel}>
              Cancelar
            </S.CancelButton>
            <S.SaveButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Cadastrar Usuário
                </>
              )}
            </S.SaveButton>
          </S.ButtonGroup>
        </S.Form>
      </S.Content>
    </S.Container>
  );
};
