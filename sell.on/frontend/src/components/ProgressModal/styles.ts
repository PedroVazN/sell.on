import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;

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
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const ModalContent = styled.div`
  padding: 0 24px 24px 24px;
`;

export const GoalInfo = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

export const GoalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const GoalDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const GoalDetail = styled.div`
  font-size: 14px;
  color: #64748b;
  
  strong {
    color: #334155;
    font-weight: 600;
  }
`;

export const ProgressPreview = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

export const ProgressLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const ProgressFill = styled.div<{ 
  $percentage: number; 
  $color: string 
}>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ $color }) => $color};
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

export const ProgressText = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  text-align: center;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const HelpText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    color: #374151;
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
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
