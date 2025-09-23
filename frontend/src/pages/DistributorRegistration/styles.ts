import styled from 'styled-components';
import { Loader2 } from 'lucide-react';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.gradients.background};
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.8s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.01) 50%, transparent 70%),
      linear-gradient(-45deg, transparent 30%, rgba(59, 130, 246, 0.02) 50%, transparent 70%);
    pointer-events: none;
    animation: shimmer 15s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(0.5deg); }
    66% { transform: translateY(5px) rotate(-0.5deg); }
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
  animation: slideIn 0.8s ease-out 0.2s both;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 120px;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.4s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.border.secondary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: blur(30px);
  position: relative;
  z-index: 1;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation: fadeInUp 0.8s ease-out 0.6s both;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxl};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: ${({ theme }) => theme.colors.gradients.button};
    border-radius: 1px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ $hasError, theme }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 400;
  }
  
  &:hover:not(:focus) {
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ $hasError, theme }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover:not(:focus) {
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
  
  option {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.normal};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 400;
  }
  
  &:hover:not(:focus) {
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
`;

export const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &::before {
    content: '⚠';
    font-size: 0.75rem;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 160px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  ${({ variant = 'secondary', theme }) => variant === 'primary' ? `
    background: ${theme.colors.gradients.button};
    color: white;
    box-shadow: ${theme.shadows.medium};
    
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
    
    &:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: ${theme.shadows.glow};
      
      &::before {
        left: 100%;
      }
    }
    
    &:active:not(:disabled) {
      transform: translateY(-1px) scale(0.98);
    }
  ` : `
    background: ${theme.colors.background.glass};
    color: ${theme.colors.text.primary};
    border: 2px solid ${theme.colors.border.primary};
    backdrop-filter: blur(20px);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme.colors.gradients.glass};
      border-radius: ${theme.borderRadius.lg};
      z-index: -1;
    }
    
    &:hover:not(:disabled) {
      color: ${theme.colors.primary};
      border-color: ${theme.colors.border.secondary};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.medium};
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  background: ${({ theme }) => theme.colors.background.glass};
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
  
  svg {
    color: ${({ theme }) => theme.colors.success};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    animation: bounce 0.6s ease-in-out;
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: 1.75rem;
    font-weight: 700;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

export const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
