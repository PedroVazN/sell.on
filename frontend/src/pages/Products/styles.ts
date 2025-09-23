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
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
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
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-width: 300px;
  
  svg {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  flex: 1;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.success};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

export const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: blur(10px);
  text-align: center;
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 1.125rem;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

export const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background.secondary};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &:first-child {
    font-weight: 600;
  }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  margin-right: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:last-child:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $isActive, theme }) => $isActive ? `
    background: ${theme.colors.success}20;
    color: ${theme.colors.success};
  ` : `
    background: ${theme.colors.error}20;
    color: ${theme.colors.error};
  `}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  svg {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: 1.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    font-size: 1rem;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    animation: spin 1s linear infinite;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    font-size: 1rem;
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
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  p {
    color: ${({ theme }) => theme.colors.error};
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    font-size: 1rem;
  }
  
  button {
    background: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.inverse};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => theme.colors.success};
      transform: translateY(-2px);
    }
  }
`;