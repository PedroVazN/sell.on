import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: #0a0a0f;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  position: relative;
  z-index: 1;
`;

export const Header = styled.div`
  text-align: left;
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Subtitle = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  
  &::after {
    content: '*';
    color: #ef4444;
    margin-left: 4px;
  }
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  transition: all 0.15s ease;
  font-weight: 400;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const Select = styled.select`
  padding: 12px 16px;
  padding-right: 48px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  transition: all 0.15s ease;
  font-weight: 400;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;

  option {
    background: #1a1a23;
    color: #ffffff;
    padding: 10px;
  }

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background-color: rgba(255, 255, 255, 0.08);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid transparent;
  border-top: 3px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 24px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
    color: #ffffff;
  }
`;