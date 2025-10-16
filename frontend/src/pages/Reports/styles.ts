import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: #0f172a;
  min-height: 100vh;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme}) => theme.spacing.xxl};
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TitleSection = styled.div`
  flex: 1;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: #3b82f6;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface StatCardProps {
  variant: 'danger' | 'warning' | 'info' | 'neutral';
}

const variantColors = {
  danger: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: '#ef4444'
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: '#f59e0b'
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: '#3b82f6'
  },
  neutral: {
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.3)',
    icon: '#64748b'
  }
};

export const StatCard = styled.div<StatCardProps>`
  background: ${props => variantColors[props.variant].bg};
  border: 1px solid ${props => variantColors[props.variant].border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: rgba(15, 23, 42, 0.5);
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const FiltersSection = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: blur(20px);
`;

export const FiltersTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    color: #3b82f6;
  }
`;

export const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const FilterInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #f8fafc;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #f8fafc;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  option {
    background: #1e293b;
    color: #f8fafc;
  }
`;

export const ClearButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    color: #3b82f6;
  }
`;

export const ReasonsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ReasonItem = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

export const ReasonInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const ReasonRank = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
`;

export const ReasonName = styled.div`
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f8fafc;
`;

export const ReasonStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

export const ReasonCount = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ReasonValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
`;

export const ReasonPercentage = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
`;

export const ReasonBar = styled.div`
  height: 6px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 3px;
  overflow: hidden;
`;

interface ReasonBarFillProps {
  $percentage: number;
  $color: string;
}

export const ReasonBarFill = styled.div<ReasonBarFillProps>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 0.6s ease;
`;

export const TrendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(71, 85, 105, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(59, 130, 246, 0.5);
    }
  }
`;

export const TrendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: rgba(15, 23, 42, 0.5);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border-left: 3px solid #3b82f6;
`;

export const TrendMonth = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  text-transform: capitalize;
`;

export const TrendStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

export const TrendCount = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const TrendValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #f59e0b;
`;

export const TableSection = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const TableTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.borderRadius.md};

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(71, 85, 105, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(59, 130, 246, 0.5);
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;

  @media (max-width: 768px) {
    min-width: 900px;
  }
`;

export const TableHead = styled.thead`
  background: rgba(15, 23, 42, 0.8);
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
`;

export const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TableBody = styled.tbody``;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: top;
`;

export const ProposalBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  font-size: 0.75rem;
`;

export const ValueBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  font-size: 0.75rem;
`;

export const ReasonBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 500;
  font-size: 0.75rem;
  white-space: nowrap;
`;

export const Description = styled.div`
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: help;

  &:hover {
    white-space: normal;
    overflow: visible;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;

  svg {
    color: rgba(148, 163, 184, 0.5);
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: #f8fafc;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: ${({ theme }) => theme.colors.text.secondary};

  p {
    margin-top: ${({ theme }) => theme.spacing.lg};
    font-size: 1.1rem;
  }
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
