import styled from 'styled-components';

export const TriggerButton = styled.button<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${({ $compact, theme }) => ($compact ? `6px ${theme.spacing.sm}` : `${theme.spacing.sm} ${theme.spacing.md}`)};
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ $compact }) => ($compact ? '0.8rem' : '0.85rem')};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.border.accent};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.glassHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const Menu = styled.div`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  min-width: 260px;
  max-width: 340px;
  background: ${({ theme }) => theme.colors.background.modal};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.large};
  overflow: hidden;
`;

export const MenuTitle = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const SearchRow = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const SearchField = styled.input`
  width: 100%;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
  }
`;

export const OptionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 260px;
  overflow-y: auto;
`;

export const OptionItem = styled.li`
  margin: 0;
`;

export const OptionButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  strong {
    font-weight: 600;
  }

  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.glassHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const MenuMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  gap: 8px;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
