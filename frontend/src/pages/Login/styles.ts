import styled, { keyframes } from 'styled-components';

// Animações personalizadas
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const particleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% { 
    transform: translateY(-20px) translateX(10px) rotate(90deg);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-10px) translateX(-5px) rotate(180deg);
    opacity: 0.5;
  }
  75% { 
    transform: translateY(-15px) translateX(8px) rotate(270deg);
    opacity: 0.7;
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  padding: 20px;
  overflow: hidden;
  background: #0a0a0f;
`;

export const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  z-index: 0;
`;

export const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.05) 25%,
    rgba(245, 158, 11, 0.05) 50%,
    rgba(16, 185, 129, 0.05) 75%,
    rgba(59, 130, 246, 0.1) 100%
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite;
  z-index: 1;
`;

export const AbstractShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
`;

export const Shape1 = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 60px;
  height: 60px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  
  &::after {
    content: '✦';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.3);
    font-size: 20px;
  }
`;

export const Shape2 = styled.div`
  position: absolute;
  top: 20%;
  right: 15%;
  width: 80px;
  height: 80px;
  background: rgba(139, 92, 246, 0.08);
  border-radius: 50%;
  animation: ${float} 8s ease-in-out infinite reverse;
`;

export const Shape3 = styled.div`
  position: absolute;
  bottom: 30%;
  left: 20%;
  width: 100px;
  height: 100px;
  background: rgba(245, 158, 11, 0.06);
  border-radius: 50%;
  animation: ${float} 7s ease-in-out infinite;
`;

export const Shape4 = styled.div`
  position: absolute;
  bottom: 20%;
  right: 25%;
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 50%;
  animation: ${float} 5s ease-in-out infinite reverse;
  
  &::after {
    content: '✦';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
  }
`;

export const Shape5 = styled.div`
  position: absolute;
  top: 50%;
  right: 10%;
  width: 120px;
  height: 60px;
  background: linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
  border-radius: 60px;
  animation: ${float} 9s ease-in-out infinite;
  transform: rotate(-15deg);
`;

export const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
`;

export const Particle = styled.div`
  position: absolute;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.4));
  border-radius: 50%;
  animation: ${particleFloat} 6s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
`;

export const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.8s ease-out;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 
      0 32px 80px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
    border-radius: 24px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

export const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
`;

export const LogoText = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -2px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

export const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 400;
  margin: 0 0 32px 0;
  letter-spacing: 0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

export const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

export const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  padding: 18px 20px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  backdrop-filter: blur(10px);
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.6);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.1),
      0 8px 32px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.95rem;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    
    &:hover {
      transform: none;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
      
      &::before {
        left: -100%;
      }
    }
  }
`;

export const LoginIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #ffffff;
  transition: all 0.3s ease;
  
  ${LoginButton}:hover & {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.4s ease-out;
  font-weight: 500;
`;

export const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.4s ease-out;
  font-weight: 500;
`;

export const FeaturesList = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeIn} 0.8s ease-out 0.6s both;
`;

export const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: center;
`;

export const FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.1);
  }
`;

export const FeatureText = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

export const Footer = styled.div`
  text-align: center;
  margin-top: 32px;
  animation: ${fadeIn} 0.8s ease-out 0.8s both;
  
  a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: width 0.3s ease;
    }
    
    &:hover {
      color: rgba(255, 255, 255, 0.9);
      
      &::after {
        width: 100%;
      }
    }
  }
`;
