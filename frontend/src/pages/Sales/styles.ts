import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.primary};
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-width: 300px;
  
  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.cardHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.gradients.button};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

// Estatísticas
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.75rem;
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

// Filtros
export const FiltersContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(10px);
`;

export const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const FilterSelect = styled.select`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FilterInput = styled.input`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

export const FilterButtonSecondary = styled.button`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.cardHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FilterButtonPrimary = styled.button`
  background: ${({ theme }) => theme.colors.gradients.button};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

// Tabela de vendas
export const SalesTable = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.cardHover};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.cardHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.div<{ colSpan?: number }>`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  grid-column: ${({ colSpan }) => colSpan ? `1 / ${colSpan + 1}` : 'auto'};
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'venda_fechada': return 'rgba(16, 185, 129, 0.15)';
      case 'venda_perdida': return 'rgba(239, 68, 68, 0.15)';
      case 'negociacao': return 'rgba(59, 130, 246, 0.15)';
      case 'expirada': return 'rgba(156, 163, 175, 0.15)';
      default: return 'rgba(156, 163, 175, 0.15)';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'venda_fechada': return '#10B981';
      case 'venda_perdida': return '#EF4444';
      case 'negociacao': return '#3B82F6';
      case 'expirada': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  }};
  border: 1px solid ${({ $status }) => {
    switch ($status) {
      case 'venda_fechada': return 'rgba(16, 185, 129, 0.3)';
      case 'venda_perdida': return 'rgba(239, 68, 68, 0.3)';
      case 'negociacao': return 'rgba(59, 130, 246, 0.3)';
      case 'expirada': return 'rgba(156, 163, 175, 0.3)';
      default: return 'rgba(156, 163, 175, 0.3)';
    }
  }};
  box-shadow: ${({ $status }) => {
    switch ($status) {
      case 'venda_fechada': return '0 0 0 1px rgba(16, 185, 129, 0.1)';
      case 'venda_perdida': return '0 0 0 1px rgba(239, 68, 68, 0.1)';
      case 'negociacao': return '0 0 0 1px rgba(59, 130, 246, 0.1)';
      case 'expirada': return '0 0 0 1px rgba(156, 163, 175, 0.1)';
      default: return '0 0 0 1px rgba(156, 163, 175, 0.1)';
    }
  }};
`;

export const PaymentStatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'pago': return theme.colors.hover.success;
      case 'pendente': return theme.colors.hover.secondary;
      case 'parcial': return theme.colors.hover.primary;
      case 'cancelado': return theme.colors.hover.danger;
      default: return theme.colors.text.secondary;
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'pago': return theme.colors.success;
      case 'pendente': return theme.colors.warning;
      case 'parcial': return theme.colors.primary;
      case 'cancelado': return theme.colors.error;
      default: return theme.colors.text.primary;
    }
  }};
`;

export const ActionsCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'danger': return theme.colors.error;
      default: return theme.colors.background.primary;
    }
  }};
  color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary': return 'white';
      case 'danger': return 'white';
      default: return theme.colors.text.primary;
    }
  }};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

// Paginação
export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary : theme.colors.background.card};
  color: ${({ $active, theme }) => 
    $active ? 'white' : theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary : theme.colors.background.cardHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  
  h3 {
    margin: ${({ theme }) => theme.spacing.md} 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;