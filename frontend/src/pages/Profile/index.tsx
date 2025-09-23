import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import * as S from './styles';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'Brasil'
        }
      });
    }
  }, [user]);

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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateProfileForm = () => {
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

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Senha atual é obrigatória');
      return false;
    }

    if (!passwordData.newPassword) {
      setPasswordError('Nova senha é obrigatória');
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nova senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm() || !user) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateUser(user._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: {
          street: formData.address.street.trim() || undefined,
          city: formData.address.city.trim() || undefined,
          state: formData.address.state.trim() || undefined,
          zipCode: formData.address.zipCode.trim() || undefined,
          country: formData.address.country.trim() || undefined
        }
      });

      if (response.success) {
        updateUser(response.data);
        setSuccess('Perfil atualizado com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erro ao atualizar perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm() || !user) {
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const response = await apiService.updateUserPassword(
        user._id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setPasswordSuccess('Senha alterada com sucesso!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordSuccess(null), 3000);
      } else {
        setPasswordError('Erro ao alterar senha');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <S.Container>
        <S.LoadingContainer>
          <Loader2 size={32} className="animate-spin" />
          <S.LoadingText>Carregando perfil...</S.LoadingText>
        </S.LoadingContainer>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <User size={24} />
          Meu Perfil
        </S.Title>
        <S.UserInfo>
          <S.UserName>{user.name}</S.UserName>
          <S.UserRole>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</S.UserRole>
        </S.UserInfo>
      </S.Header>

      <S.Content>
        <S.ProfileSection>
          <S.SectionTitle>Informações Pessoais</S.SectionTitle>
          
          <form onSubmit={handleProfileSubmit}>
            <S.FormGrid>
              <S.FormGroup>
                <S.Label>
                  <User size={16} />
                  Nome Completo *
                </S.Label>
                <S.Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite seu nome completo"
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
                  placeholder="Digite seu email"
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
            </S.FormGrid>

            <S.AddressSection>
              <S.SectionSubtitle>Endereço (Opcional)</S.SectionSubtitle>
              
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
            </S.AddressSection>

            {error && (
              <S.ErrorMessage>
                {error}
              </S.ErrorMessage>
            )}

            {success && (
              <S.SuccessMessage>
                <Check size={16} />
                {success}
              </S.SuccessMessage>
            )}

            <S.SaveButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              )}
            </S.SaveButton>
          </form>
        </S.ProfileSection>

        <S.PasswordSection>
          <S.SectionTitle>Alterar Senha</S.SectionTitle>
          
          <form onSubmit={handlePasswordSubmit}>
            <S.FormGroup>
              <S.Label>
                <Lock size={16} />
                Senha Atual *
              </S.Label>
              <S.Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Digite sua senha atual"
                required
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>
                <Lock size={16} />
                Nova Senha *
              </S.Label>
              <S.Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Digite sua nova senha"
                required
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>
                <Lock size={16} />
                Confirmar Nova Senha *
              </S.Label>
              <S.Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
            </S.FormGroup>

            {passwordError && (
              <S.ErrorMessage>
                {passwordError}
              </S.ErrorMessage>
            )}

            {passwordSuccess && (
              <S.SuccessMessage>
                <Check size={16} />
                {passwordSuccess}
              </S.SuccessMessage>
            )}

            <S.SaveButton type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Alterar Senha
                </>
              )}
            </S.SaveButton>
          </form>
        </S.PasswordSection>
      </S.Content>
    </S.Container>
  );
};
