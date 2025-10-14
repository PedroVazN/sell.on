import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: #0f172a;
  min-height: 100vh;
  position: relative;
  animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
      radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
      radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.06) 0%, transparent 50%);
    pointer-events: none;
    animation: backgroundShift 25s ease-in-out infinite;
  }

  @keyframes backgroundShift {
    0%, 100% {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
    }
    25% {
      transform: translateX(-15px) translateY(-8px) scale(1.02);
      opacity: 0.8;
    }
    50% {
      transform: translateX(8px) translateY(-12px) scale(0.98);
      opacity: 0.9;
    }
    75% {
      transform: translateX(-8px) translateY(6px) scale(1.01);
      opacity: 0.85;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
  animation: slideIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  letter-spacing: -1px;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: titleGlow 4s ease-in-out infinite alternate, titleSlide 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 80px;
    height: 3px;
    background: linear-gradient(135deg, #3b82f6, #10b981);
    border-radius: 3px;
    animation: underlineGlow 3s ease-in-out infinite alternate, underlineExpand 1s cubic-bezier(0.4, 0, 0.2, 1) 1s both;
  }
  
  @keyframes titleGlow {
    0% {
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
    }
    100% {
      filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
    }
  }
  
  @keyframes titleSlide {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes underlineGlow {
    0% {
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
    }
    100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 1);
    }
  }
  
  @keyframes underlineExpand {
    from {
      width: 0;
    }
    to {
      width: 80px;
    }
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-weight: 500;
  animation: fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
  line-height: 1.5;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.9s both;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'neutral' }>`
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 20px;
  padding: 28px;
  backdrop-filter: blur(25px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: scaleIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.08));
    border-radius: 20px;
    z-index: -1;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15));
    border-radius: 20px;
    z-index: -2;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.9);
  }

  &:hover {
    transform: translateY(-12px) scale(1.03);
    border-color: rgba(71, 85, 105, 0.6);
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 0.4;
      transform: scale(1);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(30px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
`;

export const MetricValue = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'neutral' }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#e2e8f0';
    }
  }};
  margin-bottom: 0.5rem;
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
  padding: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
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
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

export const MetricItemLabel = styled.div`
  font-size: 0.875rem;
  color: #A3A3A3;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

export const MetricItemValue = styled.div<{ $negative?: boolean }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ $negative }) => $negative ? '#EF4444' : '#10B981'};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const MetricItemIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color }) => $color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  
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