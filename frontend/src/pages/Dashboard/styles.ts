import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: #0f172a;
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.8s ease-out;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    pointer-events: none;
    animation: backgroundShift 20s ease-in-out infinite;
  }

  @keyframes backgroundShift {
    0%, 100% {
      transform: translateX(0) translateY(0);
    }
    25% {
      transform: translateX(-10px) translateY(-5px);
    }
    50% {
      transform: translateX(5px) translateY(-10px);
    }
    75% {
      transform: translateX(-5px) translateY(5px);
    }
  }
`;

export const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
  animation: slideIn 0.8s ease-out 0.2s both;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  letter-spacing: -1px;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: titleGlow 3s ease-in-out infinite alternate;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 80px;
    height: 3px;
    background: linear-gradient(135deg, #3b82f6, #10b981);
    border-radius: 3px;
    animation: underlineGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes titleGlow {
    0% {
      filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
    }
    100% {
      filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6));
    }
  }
  
  @keyframes underlineGlow {
    0% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
    }
    100% {
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
    }
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-weight: 500;
  animation: fadeInUp 0.8s ease-out 0.4s both;
  line-height: 1.5;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out 0.6s both;
`;

export const MetricCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: scaleIn 0.6s ease-out both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05));
    border-radius: 16px;
    z-index: -1;
    opacity: 0;
    transition: all 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
    border-radius: 16px;
    z-index: -2;
    opacity: 0;
    transition: all 0.3s ease;
    transform: scale(0.95);
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(71, 85, 105, 0.5);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 0.3;
      transform: scale(1);
    }
  }

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
`;

export const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

export const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 2px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    border-radius: 2px;
    animation: expand 0.8s ease-out 1s both;
  }
`;

export const MetricChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ $positive, theme }) => 
    $positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $positive, theme }) => 
    $positive ? theme.colors.success : theme.colors.error};
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out 1.2s both;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out 0.8s both;
`;

export const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);
  box-shadow: 
    ${({ theme }) => theme.shadows.medium},
    0 0 0 1px ${({ theme }) => theme.colors.border.primary},
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  animation: scaleIn 0.6s ease-out both;

  &:hover {
    transform: translateY(-4px) scale(1.005);
    box-shadow: 
      ${({ theme }) => theme.shadows.glow},
      0 0 0 1px ${({ theme }) => theme.colors.border.secondary},
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.card};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -2;
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.normal};
  }

  &:hover::after {
    opacity: 0.05;
  }

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
`;

export const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  position: relative;
  z-index: 1;
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.6s ease-out 1s both;
`;

export const ChartSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  position: relative;
  z-index: 1;
  font-weight: 500;
  animation: fadeInUp 0.6s ease-out 1.1s both;
`;

export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
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
`;

export const GoalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
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
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
`;

export const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const MetricItemLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export const MetricItemValue = styled.div<{ $negative?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $negative, theme }) => 
    $negative ? theme.colors.error : theme.colors.text.primary};
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
`;