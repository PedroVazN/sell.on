import styled from 'styled-components';

export const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  min-width: 300px;

  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-right: 0.5rem;
  }
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;

  label {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-right: 0.25rem;
  }
  input[type="date"] {
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.875rem;
  }
  select {
    padding: 0.5rem;
    min-width: 180px;
  }
`;

export const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  overflow: hidden;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  zoom: 0.9;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const TableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  white-space: nowrap;
  
  /* Coluna de ações permite quebra */
  &:last-child {
    white-space: normal;
    min-width: 140px;
  }
  
  /* Coluna de produtos centralizada */
  &:nth-child(5) {
    text-align: center;
  }
  
  /* Coluna de total em negrito */
  &:nth-child(6) {
    font-weight: 600;
  }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span<{ $isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ $isActive }) => $isActive ? '#10b981' : '#6b7280'};
  color: white;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0 0 2rem 0;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};

  div {
    margin-bottom: 1rem;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`;

export const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #374151;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.875rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #374151;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
  }

  option {
    background: #374151;
    color: #ffffff;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #374151;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ProductItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.background};
`;

export const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ProductName = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

export const ProductDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

export const PriceRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PriceLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const PriceInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: #fef2f2;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

export const AddProductButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 0.875rem;

  &:last-child {
    border-bottom: none;
  }
`;

export const TotalLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const TotalValue = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;
