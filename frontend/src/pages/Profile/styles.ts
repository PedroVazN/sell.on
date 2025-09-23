import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  min-height: 100vh;
  background: #0f172a;
  padding: 24px;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const UserName = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export const UserRole = styled.span`
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ProfileSection = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
`;

export const PasswordSection = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  height: fit-content;
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
`;

export const SectionTitle = styled.h3`
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  padding-bottom: 12px;
  border-bottom: 3px solid rgba(71, 85, 105, 0.3);
  position: relative;
  z-index: 1;
`;

export const SectionSubtitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  position: relative;
  z-index: 1;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
  z-index: 1;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  position: relative;
  z-index: 1;

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
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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

export const AddressSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  position: relative;
  z-index: 1;
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
  position: relative;
  z-index: 1;
`;

export const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  position: relative;
  z-index: 1;
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
  width: 100%;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;

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

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
  }
`;

export const LoadingText = styled.p`
  margin: 16px 0 0 0;
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;
