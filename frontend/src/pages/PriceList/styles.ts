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
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 1200px;
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
  border-right: 1px solid ${({ theme }) => theme.colors.border.secondary};
  
  &:last-child {
    border-right: none;
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
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $isActive, theme }) => 
    $isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${({ $isActive }) => 
    $isActive ? '#10b981' : '#ef4444'};
  border: 1px solid ${({ $isActive }) => 
    $isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0 0 2rem 0;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0 0 1rem 0;
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
    }
  }
`;

// Modal styles
export const Modal = styled.div`
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
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

export const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
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

export const ProductNameContainer = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

export const ProductPricing = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const PriceLabelInput = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 100px;
`;

export const PriceInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  width: 120px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const RemoveButton = styled.button`
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
  transition: all 0.2s ease;

  &:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }
`;

export const AddProductButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const DistributorRow = styled(TableRow)<{ $isExpanded: boolean; $isDeleting: boolean }>`
  cursor: pointer;
  opacity: ${({ $isDeleting }) => $isDeleting ? 0.5 : 1};
  background: ${({ $isExpanded, theme }) => 
    $isExpanded ? theme.colors.background : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const ProductRow = styled(TableRow)`
  background: ${({ theme }) => theme.colors.background};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const DistributorName = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ProductInfo = styled.div`
  margin-left: 1rem;
`;

export const ProductNameDisplay = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PriceValue = styled.div<{ $color: string }>`
  font-weight: bold;
  color: ${({ $color }) => $color};
`;

export const PriceLabelDisplay = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ProductStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const DateRange = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ProductNotes = styled.div`
  font-size: 0.75rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SummaryInfo = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;