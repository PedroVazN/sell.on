import styled from 'styled-components';

export const Container = styled.div`
  padding: 24px 32px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ViewToggle = styled.div<{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $active }) => ($active ? theme.colors.background.glassHover : theme.colors.background.glass)};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.muted)};
  cursor: pointer;
  font-size: 0.875rem;
  transition: ${({ theme }) => theme.transitions.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.background.glassHover};
  }
`;

export const Board = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 420px;
`;

export const Column = styled.div<{ $color?: string }>`
  flex: 0 0 300px;
  min-width: 300px;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
  border-top: 3px solid ${({ $color }) => $color || '#6b7280'};
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const ColumnTitle = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
`;

export const ColumnCount = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.background.glass};
  padding: 2px 8px;
  border-radius: 8px;
`;

export const CardsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 12px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.background.glassHover};
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
`;

export const CardTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

export const CardMeta = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const ListTable = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

export const ListRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 80px 100px 140px;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.background.glass};
  }
  &:last-child {
    border-bottom: none;
  }
`;

export const ListHeader = styled(ListRow)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
  cursor: default;
  &:hover {
    background: transparent;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const ErrorState = styled.div`
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.status.error};
  margin-bottom: 16px;
`;
