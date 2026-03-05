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

export const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
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
  min-width: 280px;
  svg { color: rgba(255, 255, 255, 0.5); margin-right: 12px; }
  &:focus-within { border-color: rgba(59, 130, 246, 0.5); svg { color: #3b82f6; } }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.95rem;
  flex: 1;
  &::placeholder { color: rgba(255, 255, 255, 0.4); }
`;

export const StatsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  p { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; }
  strong { font-size: 1.5rem; color: #fff; }
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
`;

export const TableHeader = styled.thead`
  background: rgba(255, 255, 255, 0.06);
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

export const TableCell = styled.td`
  padding: 14px 16px;
  color: #ffffff;
  font-size: 0.9rem;
  &:first-child { padding-left: 20px; }
  &:last-child { padding-right: 20px; }
`;

export const TableHeadCell = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  &:first-child { padding-left: 20px; }
  &:last-child { padding-right: 20px; }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover { color: #3b82f6; background: rgba(59, 130, 246, 0.15); }
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${p => p.$isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${p => p.$isActive ? '#22c55e' : '#ef4444'};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: rgba(255, 255, 255, 0.6);
  svg { margin-bottom: 16px; opacity: 0.5; }
  h3 { color: #fff; margin: 0 0 8px; font-size: 1.25rem; }
  p { margin: 0; font-size: 0.95rem; }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: rgba(255, 255, 255, 0.6);
`;

export const ErrorState = styled.div`
  padding: 24px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  margin-bottom: 24px;
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const PaginationNumber = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${p => p.$active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 40px;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

export const PaginationNumbers = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Ellipsis = styled.span`
  color: rgba(255, 255, 255, 0.5);
  padding: 0 4px;
`;
