import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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

export const ModalOverlay = styled.div`
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
  animation: ${fadeIn} 0.3s ease;
  padding: 1rem;
`;

export const ModalContainer = styled.div`
  background: ${theme.colors.background.modal};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease;
  box-shadow: ${theme.shadows.large};
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
`;

export const ModalTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  /* Scrollbar personalizada */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  color: ${theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${({ $hasError, theme }) => 
    $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: 0.75rem;
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};
  outline: none;

  &:focus {
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${({ $hasError, theme }) => 
    $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: 0.75rem;
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

export const Textarea = styled.textarea<{ $hasError?: boolean }>`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${({ $hasError, theme }) => 
    $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: 0.75rem;
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
  flex-shrink: 0;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const LoadingSpinner = styled.div<{ size?: number }>`
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
