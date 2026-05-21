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

export const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

export const Button = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $primary }) =>
      $primary ? 'transparent' : theme.colors.border.secondary};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.background.card};
  color: ${({ theme, $primary }) =>
    $primary ? '#fff' : theme.colors.text.primary};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

export const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.background.card};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.text.secondary)};
  cursor: pointer;
  font-size: 0.85rem;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Card = styled.div<{ $overdue?: boolean }>`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid
    ${({ theme, $overdue }) =>
      $overdue ? '#f97316' : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 200px;
`;

export const CardTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

export const CardMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.4;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xl};
`;
