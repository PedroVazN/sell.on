import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => (theme as { spacing?: { xl?: string } })?.spacing?.xl ?? '1.5rem'};
  background: ${({ theme }) => (theme as { colors?: { background?: { primary?: string } } })?.colors?.background?.primary ?? '#0a0a0f'};
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => (theme as { colors?: { text?: { primary?: string } } })?.colors?.text?.primary ?? '#fff'};
  margin: 0;
`;

export const Hint = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => (theme as { colors?: { text?: { muted?: string } } })?.colors?.text?.muted ?? 'rgba(255,255,255,0.6)'};
`;

export const Content = styled.div`
  background: ${({ theme }) => (theme as { colors?: { background?: { card?: string } } })?.colors?.background?.card ?? 'rgba(255,255,255,0.03)'};
  border: 1px solid ${({ theme }) => (theme as { colors?: { border?: { primary?: string } } })?.colors?.border?.primary ?? 'rgba(255,255,255,0.08)'};
  border-radius: 12px;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  background: ${({ theme }) => (theme as { colors?: { background?: { secondary?: string } } })?.colors?.background?.secondary ?? '#111827'};
`;

export const Th = styled.th`
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => (theme as { colors?: { text?: { muted?: string } } })?.colors?.text?.muted ?? 'rgba(255,255,255,0.65)'};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => (theme as { colors?: { border?: { primary?: string } } })?.colors?.border?.primary ?? 'rgba(255,255,255,0.08)'};
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.03); }
`;

export const Td = styled.td`
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => (theme as { colors?: { text?: { primary?: string } } })?.colors?.text?.primary ?? '#fff'};
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
`;

export const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
`;

export const LoadingState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
