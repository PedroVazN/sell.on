import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.main};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

export const Subtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 0.9rem;
`;

export const Toolbar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  align-items: flex-end;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const MonthInput = styled.input`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
`;

export const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger ? '#dc2626' : $primary ? 'transparent' : theme.colors.border.secondary};
  background: ${({ theme, $primary, $danger }) =>
    $danger ? '#fef2f2' : $primary ? theme.colors.primary : theme.colors.background.card};
  color: ${({ theme, $primary, $danger }) =>
    $danger ? '#dc2626' : $primary ? '#fff' : theme.colors.text.primary};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SummaryRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

export const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 14px 18px;
  min-width: 160px;
  flex: 1 1 160px;
`;

export const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SummaryValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 4px;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
    font-size: 13px;
    vertical-align: top;
  }

  th {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 600;
    background: ${({ theme }) => theme.colors.background.secondary};
    position: sticky;
    top: 0;
    z-index: 1;
  }
`;

export const NfInput = styled.input`
  width: 130px;
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 4px;
  font-size: 13px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const AttachmentChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 220px;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export const IconBtn = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid
    ${({ theme, $danger }) => ($danger ? '#fecaca' : theme.colors.border.secondary)};
  background: ${({ theme, $danger }) => ($danger ? '#fef2f2' : 'transparent')};
  color: ${({ theme, $danger }) => ($danger ? '#dc2626' : theme.colors.text.primary)};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) =>
    $status === 'aprovado' ? '#dcfce7' : $status === 'reprovado' ? '#fee2e2' : '#fef9c3'};
  color: ${({ $status }) =>
    $status === 'aprovado' ? '#15803d' : $status === 'reprovado' ? '#b91c1c' : '#92400e'};
`;

export const ValidationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const UploadInput = styled.input`
  display: none;
`;

export const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
