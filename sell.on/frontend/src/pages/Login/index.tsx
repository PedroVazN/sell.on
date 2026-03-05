import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container,
  LeftPanel,
  BrandSection,
  BrandLogo,
  BrandTitle,
  BrandSubtitle,
  BrandDescription,
  RightPanel,
  FormContainer,
  FormHeader,
  FormTitle,
  FormSubtitle,
  Form,
  InputWrapper,
  InputLabel,
  InputField,
  InputIcon,
  PasswordToggle,
  SubmitButton,
  ButtonContent,
  ButtonLoader,
  MessageBox,
  ErrorMessage,
  SuccessMessage,
  FooterLinks,
  FooterLink,
  AnimatedBackground,
  GlowOrb,
  GridPattern,
  FloatingCard
} from './styles';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Efeito de mouse tracking para interatividade
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await login(email, password);
      
      if (success) {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError('Email ou senha incorretos. Tente novamente.');
      }
    } catch (error) {
      setError('Erro de conexão. Verifique se o servidor está rodando.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <AnimatedBackground>
        <GlowOrb 
          style={{ 
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`
          }} 
        />
        <GlowOrb 
          style={{ 
            right: `${mousePosition.x * 0.015}px`,
            bottom: `${mousePosition.y * 0.015}px`,
            animationDelay: '2s'
          }} 
        />
        <GridPattern />
      </AnimatedBackground>

      <LeftPanel>
        <BrandSection>
          <BrandLogo>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="80" height="80" rx="20" fill="url(#logoGradient)" filter="url(#glow)" />
              <path d="M40 22L54 36L40 50L26 36L40 22Z" fill="white" fillOpacity="0.95" />
              <path d="M40 36L54 50L40 64L26 50L40 36Z" fill="white" fillOpacity="0.7" />
              <circle cx="40" cy="36" r="4" fill="white" />
            </svg>
          </BrandLogo>

          <BrandTitle>Sell.On</BrandTitle>
          <BrandSubtitle>Sistema de Gestão de Vendas</BrandSubtitle>
          <BrandDescription>
            Gerencie suas vendas, clientes e propostas de forma inteligente e profissional.
          </BrandDescription>
        </BrandSection>
      </LeftPanel>

      <RightPanel>
        <FloatingCard>
          <FormContainer>
            <FormHeader>
              <FormTitle>Bem-vindo de volta</FormTitle>
              <FormSubtitle>Entre com suas credenciais para acessar a plataforma</FormSubtitle>
            </FormHeader>

            {error && (
              <MessageBox>
                <ErrorMessage>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </ErrorMessage>
              </MessageBox>
            )}

            {success && (
              <MessageBox>
                <SuccessMessage>
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </SuccessMessage>
              </MessageBox>
            )}

            <Form onSubmit={handleSubmit}>
              <InputWrapper>
                <InputLabel>E-mail</InputLabel>
                <InputField
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <InputIcon>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 5l-8 6-8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </InputIcon>
              </InputWrapper>

              <InputWrapper>
                <InputLabel>Senha</InputLabel>
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <InputIcon>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </InputIcon>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
              </InputWrapper>

              <SubmitButton type="submit" disabled={isLoading}>
                <ButtonContent>
                  {isLoading ? (
                    <>
                      <ButtonLoader>
                        <Loader2 size={20} />
                      </ButtonLoader>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar no Sistema
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </ButtonContent>
              </SubmitButton>
            </Form>

            <FooterLinks>
              <FooterLink href="#">Esqueceu sua senha?</FooterLink>
              <FooterLink href="#">Precisa de ajuda?</FooterLink>
            </FooterLinks>
          </FormContainer>
        </FloatingCard>
      </RightPanel>
    </Container>
  );
};
