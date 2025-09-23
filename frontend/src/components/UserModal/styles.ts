import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContainer = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
    pointer-events: none;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`;

export const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(71, 85, 105, 0.2);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(71, 85, 105, 0.3);
    color: #e2e8f0;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ModalContent = styled.div`
  padding: 0 24px 24px 24px;
  position: relative;
  z-index: 1;
`;

export const FormSection = styled.div`
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(71, 85, 105, 0.3);
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(71, 85, 105, 0.3);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  color: #f8fafc;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 
      0 0 0 3px rgba(59, 130, 246, 0.1),
      0 4px 12px rgba(59, 130, 246, 0.15);
    background: rgba(15, 23, 42, 0.8);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(71, 85, 105, 0.3);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  cursor: pointer;
  color: #f8fafc;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 
      0 0 0 3px rgba(59, 130, 246, 0.1),
      0 4px 12px rgba(59, 130, 246, 0.15);
    background: rgba(15, 23, 42, 0.8);
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
`;

export const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
`;

export const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 2px solid rgba(71, 85, 105, 0.3);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    border-color: rgba(71, 85, 105, 0.5);
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.8);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }
`;
