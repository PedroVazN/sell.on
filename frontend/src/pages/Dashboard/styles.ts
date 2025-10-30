import styled from 'styled-components';

// ==================== ANIMAÇÕES ELEGANTES ====================

const fadeIn = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const slideIn = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const scaleIn = `
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const glow = `
  @keyframes glow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
    }
  }
`;

const shimmer = `
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: #0a0a0f;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  letter-spacing: -2px;
  position: relative;
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
  
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'neutral' }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: none;
  position: relative;
  overflow: hidden;
  
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {}

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.15s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.25s; }
  &:nth-child(5) { animation-delay: 0.3s; }
  &:nth-child(6) { animation-delay: 0.35s; }
  &:nth-child(7) { animation-delay: 0.4s; }
  &:nth-child(8) { animation-delay: 0.45s; }
`;

export const MetricValue = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'neutral' }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#ffffff';
    }
  }};
  margin-bottom: 12px;
  letter-spacing: -1.5px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

export const MetricChange = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'neutral' }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#94a3b8';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'danger': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  }};
  border-radius: 8px;
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'success': return 'rgba(16, 185, 129, 0.3)';
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  }};
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out 1.2s both;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-top: 2rem;
  }

  @media (max-width: 480px) {
    margin-top: 1.5rem;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: none;
  position: relative;
  overflow: hidden;
  
  z-index: 1;

  @media (max-width: 768px) {
    padding: 24px;
    overflow-x: auto;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
    border-radius: 24px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {}

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`;

export const ChartTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const ChartSubtitle = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 24px 0;
  font-weight: 400;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  /* Responsivo para mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;

  /* Responsivo para mobile */
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

export const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ProductSales = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ProductRevenue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const GoalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  /* Responsivo para mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const GoalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  /* Responsivo para mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

export const GoalName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const GoalProgress = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;

  /* Responsivo para mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

export const GoalBar = styled.div<{ $color: string; $width: number }>`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $width }) => $width}%;
    background: ${({ $color }) => $color};
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

export const GoalPercentage = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
  text-align: right;
`;

export const PerformanceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
  animation: slideIn 0.8s ease-out 0.6s both;

  @media (max-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3B82F6, #10B981, #F59E0B);
    border-radius: ${({ theme }) => theme.borderRadius.xl} ${({ theme }) => theme.borderRadius.xl} 0 0;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 1600px) {
    padding: 1rem;
  }
`;

export const MetricItemLabel = styled.div`
  font-size: 0.75rem;
  color: #A3A3A3;
  text-align: left;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  line-height: 1.3;

  @media (max-width: 1600px) {
    font-size: 0.7rem;
  }
`;

export const MetricItemValue = styled.div<{ $negative?: boolean }>`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ $negative }) => $negative ? '#EF4444' : '#10B981'};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-break: break-word;
  line-height: 1.2;

  @media (max-width: 1600px) {
    font-size: 1.5rem;
  }

  @media (max-width: 1200px) {
    font-size: 1.75rem;
  }
`;

export const MetricItemIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  position: relative;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ $color }) => $color}40;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;

export const MetricItemDescription = styled.div`
  color: #6B7280;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.4;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const MetricItemTrend = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ $positive }) => $positive ? '#10B981' : '#EF4444'};
  font-size: 0.75rem;
  font-weight: 600;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${({ theme }) => theme.spacing.lg};
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 1rem;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;