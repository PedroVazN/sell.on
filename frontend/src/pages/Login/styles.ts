import styled, { keyframes } from 'styled-components';

// ==================== ANIMAÇÕES AVANÇADAS ====================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-25px) rotate(3deg);
  }
  66% {
    transform: translateY(-15px) rotate(-3deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.5;
    filter: blur(60px);
  }
  50% {
    opacity: 0.8;
    filter: blur(80px);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInFromTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// ==================== CONTAINER PRINCIPAL ====================

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #0a0a0f;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
    animation: ${pulse} 10s ease-in-out infinite;
  }
`;

export const GlowOrb = styled.div`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  animation: ${glow} 8s ease-in-out infinite;
  pointer-events: none;
  
  &:nth-child(2) {
    background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
  }
  
  @media (max-width: 1024px) {
    width: 400px;
    height: 400px;
  }
`;

export const GridPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
  animation: ${float} 20s ease-in-out infinite;
`;

// ==================== PAINEL ESQUERDO ====================

export const LeftPanel = styled.div`
  flex: 1;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(20, 20, 30, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 1024px) {
    padding: 60px 32px;
    min-height: 400px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 40px 24px;
    min-height: 300px;
  }
`;

export const BrandSection = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  animation: ${fadeInLeft} 1s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 500px;
`;

export const BrandLogo = styled.div`
  margin-bottom: 40px;
  animation: ${float} 6s ease-in-out infinite;
  display: flex;
  justify-content: center;
  
  svg {
    filter: drop-shadow(0 15px 40px rgba(59, 130, 246, 0.5));
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05) rotate(5deg);
    }
  }
`;

export const BrandTitle = styled.h1`
  font-size: 84px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 20px 0;
  letter-spacing: -4px;
  line-height: 1;
  background: linear-gradient(135deg, #ffffff 0%, #a8b5ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s ease-in-out infinite;
  background-size: 200% auto;
  
  @media (max-width: 1024px) {
    font-size: 64px;
  }
  
  @media (max-width: 768px) {
    font-size: 52px;
  }
`;

export const BrandSubtitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 20px 0;
  letter-spacing: 0.5px;
  
  @media (max-width: 1024px) {
    font-size: 22px;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const BrandDescription = styled.p`
  font-size: 17px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;


// ==================== PAINEL DIREITO ====================

export const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    padding: 60px 32px;
  }
  
  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

export const FloatingCard = styled.div`
  width: 100%;
  max-width: 480px;
  animation: ${fadeInRight} 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 48px;
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 32px 80px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 36px 28px;
    border-radius: 24px;
  }
`;

export const FormHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  animation: ${scaleIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

export const FormTitle = styled.h1`
  font-size: 38px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, #ffffff 0%, #a8b5ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const FormSubtitle = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// ==================== MENSAGENS ====================

export const MessageBox = styled.div`
  margin-bottom: 28px;
  animation: ${fadeInUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  
  svg {
    flex-shrink: 0;
    color: #EF4444;
    stroke-width: 2.5;
  }
  
  span {
    flex: 1;
    color: #FCA5A5;
    font-size: 14px;
    font-weight: 500;
  }
`;

export const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  
  svg {
    flex-shrink: 0;
    color: #10B981;
    stroke-width: 2.5;
  }
  
  span {
    flex: 1;
    color: #6EE7B7;
    font-size: 14px;
    font-weight: 500;
  }
`;

// ==================== FORMULÁRIO ====================

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: ${scaleIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.3px;
  margin-left: 4px;
`;

export const InputField = styled.input`
  width: 100%;
  height: 58px;
  padding: 0 48px;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &:focus {
    border-color: #3B82F6;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.1),
      0 8px 24px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 18px;
  bottom: 19px;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  transition: all 0.3s ease;
  
  ${InputField}:focus ~ & {
    color: #3B82F6;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 18px;
  bottom: 19px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 8px;
  
  &:hover:not(:disabled) {
    color: #3B82F6;
    background: rgba(59, 130, 246, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 58px;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
  background-size: 200% auto;
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 
      0 16px 40px rgba(59, 130, 246, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background-position: right center;
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;
  
  svg {
    stroke-width: 2.5;
  }
`;

export const ButtonLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${spin} 1s linear infinite;
`;

// ==================== FOOTER ====================

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  animation: ${fadeInUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const FooterLink = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  padding: 4px 8px;
  border-radius: 6px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 8px;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    color: #3B82F6;
    background: rgba(59, 130, 246, 0.1);
    
    &::after {
      width: calc(100% - 16px);
    }
  }
`;
