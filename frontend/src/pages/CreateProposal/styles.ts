import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background.tertiary};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.background.card};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    transform: translateY(-1px);
  }
`;

export const FormContainer = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border};
          
          &:hover {
            background: ${theme.colors.background.tertiary};
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ProductItem = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

export const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 0.75rem;
  align-items: end;
  min-width: 0;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ProductInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const ProductButton = styled.button<{ variant?: 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #ef4444;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
`;

export const TotalSection = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1rem;

  &:last-child {
    font-weight: 600;
    font-size: 1.125rem;
    padding-top: 1rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const TotalValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SaveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

export const GeneratePdfButton = styled(Button)`
  background: #059669;
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    background: #047857;
    transform: translateY(-2px);
  }
`;

export const TwoColumnLayout = styled.div`
  display: flex;
  gap: 2rem;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const LeftColumn = styled.div`
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
`;

export const RightColumn = styled.div`
  width: 400px;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
`;

export const PriceListTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PriceListItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ProductName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

export const PriceLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const PriceValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const NoPricesMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  padding: 2rem;
`;