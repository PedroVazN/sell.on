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
  flex-wrap: wrap;
  gap: 0.75rem;
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

export const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

export const StatsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  p { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.8rem; }
  strong { font-size: 1.25rem; color: #fff; }
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  background: rgba(255, 255, 255, 0.06);
  th {
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  &:hover { background: rgba(255, 255, 255, 0.04); }
  &:last-child { border-bottom: none; }
`;

export const TableCell = styled.td`
  padding: 0.6rem 0.75rem;
  color: #fff;
  font-size: 0.85rem;
`;

export const TableBody = styled.tbody``;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.15);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  p { margin: 0; font-size: 0.9rem; }
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
  gap: 0.5rem;
`;

/* Modais */
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
  max-height: 60vh;
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
  &:hover { background: rgba(255, 255, 255, 0.08); }
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
  &:hover:not(:disabled) { background: #7c3aed; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const TransferList = styled.div`
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-bottom: 12px;
`;

export const TransferListItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  transition: background 0.2s ease;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.06); }
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #8b5cf6;
  }
`;

export const TransferSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 12px;
  option { background: #1f2937; color: #fff; }
`;

export const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SelectAllBtn = styled.button`
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  &:hover { background: rgba(59, 130, 246, 0.25); }
`;

export const ClientList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
    &:last-child { border-bottom: none; }
  }
`;
