import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.background.main};
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
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: ${theme.colors.text.muted};
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  margin-bottom: ${theme.spacing.md};
  label {
    font-size: 0.85rem;
    color: ${theme.colors.text.muted};
  }
  input[type="date"] {
    background: ${theme.colors.background.tertiary};
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: ${theme.colors.text.primary};
    font-size: 0.9rem;
  }
  select {
    background: ${theme.colors.background.tertiary};
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: ${theme.colors.text.primary};
    font-size: 0.9rem;
    min-width: 200px;
  }
  button {
    background: ${theme.colors.primary};
    color: white;
    border: none;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.sm};
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.9; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.small};
  margin-bottom: ${theme.spacing.xl};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  background: ${theme.colors.background.secondary};
  th {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${theme.colors.text.muted};
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

export const TableRow = styled.tr<{ $highlight?: boolean }>`
  border-bottom: 1px solid ${theme.colors.border.primary};
  transition: background ${theme.transitions.normal};
  ${p => p.$highlight && `background: rgba(59, 130, 246, 0.08);`}
  &:hover { background: ${theme.colors.background.cardHover}; }
  &:last-child { border-bottom: none; }
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-size: 0.85rem;
`;

export const TableBody = styled.tbody``;

export const BadgePosition = styled.span<{ $top?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  background: ${p => p.$top ? 'linear-gradient(135deg, #f59e0b, #d97706)' : theme.colors.background.tertiary};
  color: ${p => p.$top ? '#fff' : theme.colors.text.primary};
`;

export const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.md};
  position: relative;
  z-index: 1;
`;

export const DetailCard = styled.div`
  position: relative;
  z-index: 1;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
  label {
    font-size: 0.9rem;
    color: ${theme.colors.text.muted};
  }
  select {
    background: ${theme.colors.background.tertiary};
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: ${theme.colors.text.primary};
    font-size: 0.9rem;
    min-width: 220px;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

export const SummaryCard = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  p {
    margin: 0 0 4px;
    font-size: 0.75rem;
    color: ${theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  strong {
    font-size: 1.25rem;
    color: ${theme.colors.text.primary};
  }
  &.success strong { color: ${theme.colors.status.success}; }
  &.danger strong { color: ${theme.colors.status.error}; }
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 320px;
  margin-top: ${theme.spacing.md};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.muted};
  p { margin: 0 0 0.5rem; font-size: 1rem; }
  small { font-size: 0.85rem; }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.muted};
  gap: ${theme.spacing.sm};
`;
