import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px;
  background: #0a0a0f;
  min-height: 100vh;
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

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 300px;
  
  svg {
    color: rgba(255, 255, 255, 0.5);
    margin-right: 12px;
  }
  
  &:focus-within {
    border-color: rgba(59, 130, 246, 0.5);
    
    svg {
      color: #3b82f6;
    }
  }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.95rem;
  flex: 1;
  font-weight: 400;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Content = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  z-index: 1;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: transparent;
`;

export const TableHeader = styled.thead`
  background: rgba(255, 255, 255, 0.05);
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 16px 12px;
  text-align: left;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 400;
  
  strong {
    font-weight: 600;
    color: #ffffff;
  }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.15s ease;
  margin-right: 8px;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }
  
  &:last-child:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $isActive }) => $isActive ? `
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  ` : `
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  `}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  
  svg {
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 24px;
  }
  
  h3 {
    color: #ffffff;
    margin: 0 0 12px 0;
    font-size: 1.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 24px 0;
    font-size: 1rem;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  
  svg {
    color: #3b82f6;
    margin-bottom: 24px;
    animation: spin 1s linear infinite;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
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
  padding: 48px;
  text-align: center;
  
  p {
    color: #ef4444;
    margin: 0 0 24px 0;
    font-size: 1rem;
  }
  
  button {
    background: #3b82f6;
    border: none;
    border-radius: 12px;
    padding: 10px 20px;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    
    &:hover {
      background: #2563eb;
    }
  }
`;

// Paginação
export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const PaginationButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const PaginationNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PaginationNumber = styled.button<{ $active: boolean }>`
  min-width: 36px;
  height: 36px;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${({ $active }) => $active ? '#3b82f6' : '#ffffff'};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

export const Ellipsis = styled.span`
  color: rgba(255, 255, 255, 0.5);
  padding: 0 4px;
`;