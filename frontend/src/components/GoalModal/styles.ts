import styled from 'styled-components';
import { theme } from '../../styles/theme';

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
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background: ${theme.colors.background.modal};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${theme.shadows.large};
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(90vh - 140px);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.secondary};
    border-radius: 4px;
    border: 1px solid ${theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.border.secondary} ${theme.colors.background.secondary};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    color: ${theme.colors.text.primary};
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${theme.colors.primary};
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: ${theme.colors.gradients.button};
      border-radius: 1px;
    }
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  color: ${theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.border.secondary};
  }
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.border.secondary};
  }
  
  option {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
    padding: 0.5rem;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  width: 100%;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.border.secondary};
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: ${theme.colors.primary};
    cursor: pointer;
  }
  
  label {
    margin: 0;
    cursor: pointer;
    font-weight: 500;
  }
`;

export const TagContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

export const TagButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.primary};
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TagItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary}40;
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.875rem;
  font-weight: 500;
`;

export const TagRemove = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

export const RewardSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
`;

export const NotificationSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
  flex-shrink: 0;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  
  ${({ variant = 'secondary' }) => variant === 'primary' ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border.primary};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.border.secondary};
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '⚠';
    font-size: 0.75rem;
  }
`;

export const SuccessMessage = styled.div`
  background: ${theme.colors.success}20;
  color: ${theme.colors.success};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.success}40;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    font-size: 1rem;
    font-weight: bold;
  }
`;
