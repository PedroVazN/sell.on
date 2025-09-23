import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
`;

export const Card = styled.div`
  background: ${props => props.theme.colors.background.card};
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.theme.colors.border.primary};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
    border-radius: 2px;
  }
`;

export const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 20px 0 0 0;
  font-weight: 400;
  line-height: 1.6;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const FormSection = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border-radius: 16px;
  padding: 40px;
  border: 1px solid ${props => props.theme.colors.border.primary};
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.hover.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 32px 0;
  display: flex;
  align-items: center;
  gap: 16px;

  &::before {
    content: '';
    width: 6px;
    height: 32px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
    border-radius: 3px;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

export const Label = styled.label`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '*';
    color: ${props => props.theme.colors.error};
    font-weight: 700;
    font-size: 1.2rem;
  }
`;

export const Input = styled.input`
  padding: 20px 24px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: 16px;
  font-size: 1.1rem;
  background: ${props => props.theme.colors.background.card};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 6px ${props => props.theme.colors.primary}15;
    transform: translateY(-3px);
  }

  &:hover {
    border-color: ${props => props.theme.colors.hover.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 400;
  }
`;

export const Select = styled.select`
  padding: 20px 24px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: 16px;
  font-size: 1.1rem;
  background: ${props => props.theme.colors.background.secondary} !important;
  color: ${props => props.theme.colors.text.primary} !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 20px center !important;
  background-size: 20px !important;
  padding-right: 60px !important;

  option {
    background: ${props => props.theme.colors.background.secondary} !important;
    color: ${props => props.theme.colors.text.primary} !important;
    padding: 10px !important;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 6px ${props => props.theme.colors.primary}15;
    transform: translateY(-3px);
  }

  &:hover {
    border-color: ${props => props.theme.colors.hover.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 16px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: ${props => props.theme.colors.hover.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const SwitchLabel = styled.label`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;

  &::before {
    content: '📦';
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

export const Switch = styled.input`
  position: relative;
  width: 64px;
  height: 32px;
  appearance: none;
  background: ${props => props.theme.colors.border.primary};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &:checked {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
    box-shadow: 0 4px 12px ${props => props.theme.colors.primary}40;
  }

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 28px;
    height: 28px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:checked::before {
    transform: translateX(32px);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 56px;
  padding-top: 40px;
  border-top: 2px solid ${props => props.theme.colors.border.primary};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 20px 40px;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  letter-spacing: 0.5px;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
    color: white;
    box-shadow: 0 8px 24px ${props.theme.colors.primary}30;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px ${props.theme.colors.primary}50;
    }

    &:active {
      transform: translateY(-2px);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 2px solid ${props.theme.colors.border.primary};

    &:hover {
      background: ${props.theme.colors.background.cardHover};
      color: ${props.theme.colors.text.primary};
      border-color: ${props.theme.colors.primary};
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover::before {
    left: 100%;
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

export const StatusIndicator = styled.div<{ isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  background: ${props => props.isActive ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)'};
  color: white;
  box-shadow: 0 4px 12px ${props => props.isActive ? '#10B981' : '#EF4444'}40;

  &::before {
    content: ${props => props.isActive ? '✓' : '✗'};
    font-weight: 900;
    font-size: 1.2rem;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: 12px;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-bottom: 32px;

  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;