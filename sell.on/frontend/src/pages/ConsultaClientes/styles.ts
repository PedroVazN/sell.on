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
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
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
  input, select {
    background: ${theme.colors.background.tertiary};
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: ${theme.colors.text.primary};
    font-size: 0.9rem;
  }
  input { min-width: 200px; }
  select { min-width: 140px; }
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
    text-align: left;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: 0.8rem;
    font-weight: 600;
    color: ${theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${theme.colors.border.primary};
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr<{ $clickable?: boolean }>`
  border-bottom: 1px solid ${theme.colors.border.primary};
  transition: background ${theme.transitions.normal};
  ${(p) => p.$clickable && 'cursor: pointer;'}
  &:hover {
    background: ${theme.colors.hover?.primary ?? 'rgba(59, 130, 246, 0.06)'};
  }
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: 0.9rem;
  color: ${theme.colors.text.secondary};
  vertical-align: middle;
`;

export const StatPill = styled.span<{ $variant?: 'default' | 'success' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(p) =>
    p.$variant === 'success' ? 'rgba(16, 185, 129, 0.2)' : p.$variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)'};
  color: ${(p) =>
    p.$variant === 'success' ? '#10b981' : p.$variant === 'danger' ? '#ef4444' : theme.colors.text.secondary};
`;

export const ProductBadge = styled.span`
  display: inline-block;
  margin: 2px 4px 2px 0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  background: rgba(139, 92, 246, 0.2);
  color: rgba(255,255,255,0.9);
`;

export const DetailButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.primary};
  flex-wrap: wrap;
`;

export const PaginationButton = styled.button`
  padding: 8px 14px;
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.text.secondary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background: ${theme.colors.hover?.primary ?? 'rgba(59, 130, 246, 0.1)'};
    border-color: ${theme.colors.primary};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.muted};
  font-size: 0.95rem;
`;

export const LoadingState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.muted};
`;

/* Modal detalhe */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${theme.spacing.lg};
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

export const ModalBox = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.large};
  animation: scaleIn 0.25s ease;
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.primary};
  flex-shrink: 0;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.muted};
  cursor: pointer;
  padding: 4px;
  font-size: 1.25rem;
  line-height: 1;
  &:hover { color: ${theme.colors.text.primary}; }
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  flex: 1;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

export const StatCard = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${theme.colors.text.muted};
  margin-top: 4px;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

export const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-bottom: ${theme.spacing.xl};
  th, td {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border.primary};
  }
  th {
    color: ${theme.colors.text.muted};
    font-weight: 500;
  }
  td { color: ${theme.colors.text.secondary}; }
`;
