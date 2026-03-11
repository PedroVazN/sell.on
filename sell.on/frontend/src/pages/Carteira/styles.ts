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
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  min-width: 220px;
  svg { color: ${theme.colors.text.muted}; margin-right: ${theme.spacing.sm}; }
  &:focus-within { border-color: ${theme.colors.border.focus}; svg { color: ${theme.colors.primary}; } }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.85rem;
  flex: 1;
  &::placeholder { color: rgba(255, 255, 255, 0.4); }
`;

export const StatsCard = styled.div`
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  position: relative;
  z-index: 1;
  box-shadow: ${theme.shadows.small};
  transition: box-shadow ${theme.transitions.normal};
  &:hover {
    box-shadow: ${theme.shadows.medium};
  }
  p { margin: 0; color: ${theme.colors.text.muted}; font-size: 0.8rem; }
  strong { font-size: 1.25rem; color: ${theme.colors.text.primary}; }
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  box-shadow: ${theme.shadows.small};
  transition: box-shadow ${theme.transitions.normal};
  &:hover {
    box-shadow: ${theme.shadows.medium};
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.small};
`;

export const TableHeader = styled.thead`
  background: ${theme.colors.background.cardHover};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border.primary};
  transition: background ${theme.transitions.normal};
  &:last-child { border-bottom: none; }
  &:hover { background: ${theme.colors.background.cardHover}; }
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-size: 0.8rem;
  &:first-child { padding-left: ${theme.spacing.md}; }
  &:last-child { padding-right: ${theme.spacing.md}; }
`;

export const TableHeadCell = styled.th`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${theme.colors.text.muted};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  &:first-child { padding-left: ${theme.spacing.md}; }
  &:last-child { padding-right: ${theme.spacing.md}; }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.text.muted};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.normal};
  &:hover {
    color: ${theme.colors.primary};
    background: ${theme.colors.hover?.primary ?? 'rgba(59, 130, 246, 0.15)'};
  }
  &:active { transform: scale(0.97); }
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$isActive ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)'};
  color: ${p => p.$isActive ? '#22c55e' : '#ef4444'};
  border: 1px solid ${p => p.$isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  color: ${theme.colors.text.muted};
  svg { margin-bottom: ${theme.spacing.md}; opacity: 0.6; width: 40px; height: 40px; }
  h3 { color: ${theme.colors.text.primary}; margin: 0 0 ${theme.spacing.sm}; font-size: 1.05rem; font-weight: 600; }
  p { margin: 0; font-size: 0.85rem; line-height: 1.45; max-width: 320px; margin-left: auto; margin-right: auto; }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.muted};
`;

export const ErrorState = styled.div`
  padding: ${theme.spacing.lg};
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.lg};
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

export const PaginationButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.secondary};
  background: ${theme.colors.background.card};
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 0.9rem;
  transition: background ${theme.transitions.normal};
  &:hover:not(:disabled) { background: ${theme.colors.background.cardHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const PaginationNumber = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.secondary};
  background: ${p => p.$active ? (theme.colors.hover?.primary ?? 'rgba(59, 130, 246, 0.3)') : theme.colors.background.card};
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: background ${theme.transitions.normal};
  font-size: 0.9rem;
  min-width: 40px;
  &:hover { background: ${theme.colors.background.cardHover}; }
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

// Modal Transferir clientes
export const TransferButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.hover?.secondary ?? 'rgba(139, 92, 246, 0.2)'};
  border: 1px solid ${theme.colors.border.accent};
  color: #a78bfa;
  border-radius: ${theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: ${theme.colors.secondary};
    color: #c4b5fd;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
`;

export const ModalBox = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${theme.shadows.large};
`;

export const ModalHeader = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 { margin: 0; font-size: 1.1rem; color: ${theme.colors.text.primary}; }
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.muted};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  transition: color ${theme.transitions.normal};
  &:hover { color: ${theme.colors.text.primary}; }
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.md};
  overflow-y: auto;
  flex: 1;
`;

export const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

export const SelectAllBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.hover?.primary ?? 'rgba(59, 130, 246, 0.15)'};
  border: 1px solid ${theme.colors.border.accent};
  color: #60a5fa;
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.85rem;
  cursor: pointer;
  transition: background ${theme.transitions.normal};
  &:hover { background: rgba(59, 130, 246, 0.25); }
`;

export const TransferList = styled.div`
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const TransferListItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.primary};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  font-size: 0.9rem;
  transition: background ${theme.transitions.normal}, color ${theme.transitions.normal};
  &:last-child { border-bottom: none; }
  &:hover { background: ${theme.colors.background.cardHover}; }
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
    transition: transform ${theme.transitions.normal}, box-shadow ${theme.transitions.normal};
    accent-color: ${theme.colors.secondary};
  }
  input[type="checkbox"]:checked {
    transform: scale(1.05);
  }
`;

export const TransferSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md};
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 0.95rem;
  margin-bottom: ${theme.spacing.xl};
  option { background: ${theme.colors.background.tertiary}; color: ${theme.colors.text.primary}; }
`;

export const ModalFooter = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.primary};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`;

export const ModalCancel = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: transparent;
  border: 1px solid ${theme.colors.border.secondary};
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all ${theme.transitions.normal};
  &:hover { background: ${theme.colors.background.glassHover}; border-color: ${theme.colors.border.secondary}; }
`;

export const ModalConfirm = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.secondary};
  border: none;
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  &:hover:not(:disabled) { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
