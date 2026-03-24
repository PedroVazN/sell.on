import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.primary};
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Subtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Meta = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 0.85rem;
`;

export const EngineBadge = styled.span<{ $python: boolean }>`
  display: inline-flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${({ $python }) => ($python ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.2)')};
  color: ${({ $python }) => ($python ? '#10b981' : '#f59e0b')};
  border: 1px solid ${({ $python }) => ($python ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.45)')};
`;

export const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  color: ${({ theme }) => theme.colors.text.inverse};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
`;

export const CardLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
`;

export const CardValue = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.4rem;
  font-weight: 600;
`;

export const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 340px;
`;

export const ChartTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
`;

export const InsightsCard = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
`;

export const InsightText = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 1rem;
`;
