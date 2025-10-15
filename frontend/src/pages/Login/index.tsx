import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, Sparkles, Shield, Zap, Star, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Background,
  GradientOverlay,
  AbstractShapes,
  Shape1,
  Shape2,
  Shape3,
  Shape4,
  Shape5,
  FloatingParticles,
  Particle,
  LoginCard, 
  Logo,
  LogoIcon,
  LogoText,
  Subtitle,
  Form, 
  InputGroup, 
  Label,
  Input, 
  PasswordToggle, 
  LoginButton,
  LoginIcon,
  Footer,
  ErrorMessage,
  SuccessMessage,
  FeaturesList,
  FeatureItem,
  FeatureIcon,
  FeatureText
} from './styles';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Criar partículas animadas
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5
    }));
    setParticles(newParticles);
  }, []);

  // Animar partículas
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y > window.innerHeight ? -10 : particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await login(email, password);
      
      if (success) {
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError('Email ou senha incorretos');
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
      <Background />
      <GradientOverlay />
      
      <AbstractShapes>
        <Shape1 />
        <Shape2 />
        <Shape3 />
        <Shape4 />
        <Shape5 />
      </AbstractShapes>

      <FloatingParticles>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.id * 0.1}s`
            }}
          />
        ))}
      </FloatingParticles>

      <LoginCard>
        <Logo>
          <LogoIcon>
            <Shield size={32} />
          </LogoIcon>
          <LogoText>Sell.On™</LogoText>
        </Logo>
        
        <Subtitle>Gestão Comercial Inteligente</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <InputGroup>
            <Label>
              <Mail size={14} />
              EMAIL ADDRESS
            </Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </InputGroup>
          
          <InputGroup>
            <Label>
              <Lock size={14} />
              PASSWORD
            </Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </PasswordToggle>
          </InputGroup>
          
          <LoginButton type="submit" disabled={isLoading}>
            <span>{isLoading ? 'ENTRANDO...' : 'ACESSAR SISTEMA'}</span>
            <LoginIcon>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </LoginIcon>
          </LoginButton>
        </Form>
        
        <FeaturesList>
          <FeatureItem>
            <FeatureIcon>
              <Shield size={16} />
            </FeatureIcon>
            <FeatureText>Segurança Empresarial</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>
              <Zap size={16} />
            </FeatureIcon>
            <FeatureText>Performance Otimizada</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>
              <Star size={16} />
            </FeatureIcon>
            <FeatureText>Interface Moderna</FeatureText>
          </FeatureItem>
        </FeaturesList>
        
        <Footer>
          <a href="#">Esqueceu sua senha?</a>
        </Footer>
      </LoginCard>
    </Container>
  );
};
