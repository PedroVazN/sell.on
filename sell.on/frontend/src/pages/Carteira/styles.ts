import styled from 'styled-components';

export const Container = styled.div`
  padding: 1rem 1.25rem;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 220px;
  svg { color: rgba(255, 255, 255, 0.5); margin-right: 8px; }
  &:focus-within { border-color: rgba(59, 130, 246, 0.5); svg { color: #3b82f6; } }
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  p { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.8rem; }
  strong { font-size: 1.25rem; color: #fff; }
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const TableHeader = styled.thead`
  background: rgba(255, 255, 255, 0.06);
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.06); }
`;

export const TableCell = styled.td`
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  font-size: 0.8rem;
  &:first-child { padding-left: 12px; }
  &:last-child { padding-right: 12px; }
`;

export const TableHeadCell = styled.th`
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  &:first-child { padding-left: 12px; }
  &:last-child { padding-right: 12px; }
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.15);
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
  padding: 2rem 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  svg { margin-bottom: 0.75rem; opacity: 0.6; width: 40px; height: 40px; }
  h3 { color: #fff; margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 600; }
  p { margin: 0; font-size: 0.85rem; line-height: 1.45; max-width: 320px; margin-left: auto; margin-right: auto; }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

// Modal Transferir clientes
export const TransferButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: #a78bfa;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: #8b5cf6;
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
  padding: 24px;
`;

export const ModalBox = styled.div`
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

export const ModalHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 { margin: 0; font-size: 1.1rem; color: #fff; }
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  &:hover { color: #fff; }
`;

export const ModalBody = styled.div`
  padding: 12px 16px;
  overflow-y: auto;
  flex: 1;
`;

export const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const SelectAllBtn = styled.button`
  padding: 8px 14px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { background: rgba(59, 130, 246, 0.25); }
`;

export const TransferList = styled.div`
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const TransferListItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  transition: background 0.2s ease, color 0.2s ease;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.06); }
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    accent-color: #8b5cf6;
  }
  input[type="checkbox"]:checked {
    transform: scale(1.05);
  }
`;

export const TransferSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 20px;
  option { background: #1f2937; color: #fff; }
`;

export const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

export const ModalCancel = styled.button`
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.35); }
`;

export const ModalConfirm = styled.button`
  padding: 8px 14px;
  background: #8b5cf6;
  border: none;
  color: #fff;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { background: #7c3aed; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
