import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gradients.background};
  padding: 2rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.background.cardHover};
    border-color: ${theme.colors.border.secondary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

export const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const Form = styled.div`
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: 2rem;
  box-shadow: ${theme.shadows.medium};
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card} !important;
  color: ${theme.colors.text.primary} !important;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.875rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}33;
  }

  /* Força cores das opções com máxima prioridade */
  option {
    background: #1f2937 !important;
    background-color: #1f2937 !important;
    color: #ffffff !important;
    padding: 0.5rem !important;
    font-size: 0.875rem !important;
  }

  /* Para todos os navegadores */
  &::-ms-expand {
    display: none !important;
  }

  /* Firefox específico */
  @-moz-document url-prefix() {
    option {
      background: #1f2937 !important;
      background-color: #1f2937 !important;
      color: #ffffff !important;
    }
  }

  /* Webkit específico */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1f2937;
  }

  &::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 4px;
  }
`;

export const Button = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.disabled ? theme.colors.background.tertiary : theme.colors.primary};
  color: ${props => props.disabled ? theme.colors.text.disabled : theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: ${theme.colors.hover.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.medium};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const ProductItem = styled.div`
  background: ${theme.colors.background.cardHover};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.border.secondary};
    box-shadow: ${theme.shadows.small};
  }
`;

export const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const ProductNameContainer = styled.div`
  flex: 1;
`;

export const ProductPricing = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

export const PriceLabelInput = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  min-width: 120px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

export const PriceInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}33;
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: ${theme.colors.error};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.hover.danger};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const AddProductButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.background.cardHover};
    border-color: ${theme.colors.border.secondary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${theme.colors.border.primary};
`;

export const ProductList = styled.div`
  margin-bottom: 1rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${theme.colors.background.cardHover};
  border: 2px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};

  p {
    margin-bottom: 1rem;
    font-size: 1rem;
  }
`;
