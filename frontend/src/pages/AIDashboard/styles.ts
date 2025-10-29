import styled from 'styled-components';

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
      filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.6));
    }
  }
`;

export const Container = styled.div`
  ${fadeIn}
  ${slideIn}
  ${scaleIn}
  ${glow}
  
  padding: ${({ theme }) => theme.spacing.xxl};
  background: #0a0a0f;
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  &::before {
    content: '🤖';
    margin-right: 1rem;
    -webkit-text-fill-color: #6366f1;
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

export const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateY(-4px);
    box-shadow: 
      0 28px 70px rgba(99, 102, 241, 0.3),
      0 0 0 1px rgba(99, 102, 241, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 1200px) {
    padding: 1.75rem;
    min-height: 130px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-height: 120px;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    min-height: 110px;
  }
`;

export const MetricValue = styled.div<{ $color?: string }>`
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 800;
  color: ${props => props.$color || '#6366f1'};
  margin-bottom: 0.5rem;
  line-height: 1.15;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
  width: 100%;
  max-width: 100%;
  
  /* Garantir que números grandes apareçam */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  
  /* Permitir quebra de linha para valores muito longos */
  hyphens: auto;
  
  /* Ajuste para valores monetários longos */
  small {
    font-size: 0.6em;
    font-weight: 600;
    opacity: 0.9;
  }

  /* Garantir visibilidade em todos os tamanhos */
  @media (max-width: 1200px) {
    font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  }

  @media (max-width: 768px) {
    font-size: clamp(1.4rem, 4vw, 2.2rem);
    line-height: 1.2;
  }

  @media (max-width: 480px) {
    font-size: clamp(1.2rem, 5vw, 1.8rem);
    line-height: 1.25;
  }
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

export const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 
      0 28px 70px rgba(99, 102, 241, 0.3),
      0 0 0 1px rgba(99, 102, 241, 0.4);
  }
`;

export const ChartTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
`;

export const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1.5rem 0;
`;

export const InsightCard = styled.div<{ $type?: 'success' | 'warning' | 'info' | 'urgent' }>`
  background: ${props => {
    switch (props.$type) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'urgent': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'success': return 'rgba(16, 185, 129, 0.3)';
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      case 'urgent': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    border-color: ${props => {
      switch (props.$type) {
        case 'success': return 'rgba(16, 185, 129, 0.5)';
        case 'warning': return 'rgba(245, 158, 11, 0.5)';
        case 'urgent': return 'rgba(239, 68, 68, 0.5)';
        default: return 'rgba(59, 130, 246, 0.5)';
      }
    }};
  }
`;

export const InsightTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const InsightMessage = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
`;

export const InsightAction = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-style: italic;
`;

export const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const ProposalItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateX(4px);
  }
`;

export const ProposalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
`;

export const ProposalInfo = styled.div`
  flex: 1;
`;

export const ProposalNumber = styled.div`
  font-weight: 700;
  color: #ffffff;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

export const ProposalClient = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

export const ProposalValue = styled.div`
  font-weight: 700;
  color: #10b981;
  font-size: 1rem;
`;

export const ScoreBar = styled.div<{ $percentage: number; $level: string }>`
  width: 100%;
  height: 8px;
  background: rgba(107, 114, 128, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${props => {
      switch (props.$level) {
        case 'alto': return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        case 'medio': return 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)';
        case 'baixo': return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
        case 'muito_baixo': return 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 100%)';
        default: return '#6b7280';
      }
    }};
    transition: width 0.5s ease;
  }
`;

export const ScoreText = styled.div<{ $level: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => {
    switch (props.$level) {
      case 'alto': return '#10b981';
      case 'medio': return '#fbbf24';
      case 'baixo': return '#ef4444';
      case 'muito_baixo': return '#dc2626';
      default: return '#9ca3af';
    }
  }};
  margin-top: 0.25rem;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
`;

export const ForecastCard = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
`;

export const ForecastValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #6366f1;
  margin: 0.5rem 0;
`;

export const ForecastLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
`;

export const ConfidenceBadge = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  font-size: 0.75rem;
  font-weight: 600;
  color: #818cf8;
  margin-top: 0.5rem;
`;

export const AnomalyCard = styled.div<{ $priority: 'critica' | 'alta' | 'media' | 'baixa' }>`
  background: ${props => {
    switch (props.$priority) {
      case 'critica': return 'rgba(239, 68, 68, 0.15)';
      case 'alta': return 'rgba(249, 115, 22, 0.15)';
      case 'media': return 'rgba(251, 191, 36, 0.15)';
      case 'baixa': return 'rgba(59, 130, 246, 0.15)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$priority) {
      case 'critica': return 'rgba(239, 68, 68, 0.5)';
      case 'alta': return 'rgba(249, 115, 22, 0.5)';
      case 'media': return 'rgba(251, 191, 36, 0.5)';
      case 'baixa': return 'rgba(59, 130, 246, 0.5)';
      default: return 'rgba(99, 102, 241, 0.3)';
    }
  }};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: ${props => {
      switch (props.$priority) {
        case 'critica': return '#ef4444';
        case 'alta': return '#f97316';
        case 'media': return '#fbbf24';
        case 'baixa': return '#3b82f6';
        default: return '#6366f1';
      }
    }};
  }

  &:hover {
    transform: translateX(4px);
    border-color: ${props => {
      switch (props.$priority) {
        case 'critica': return 'rgba(239, 68, 68, 0.8)';
        case 'alta': return 'rgba(249, 115, 22, 0.8)';
        case 'media': return 'rgba(251, 191, 36, 0.8)';
        case 'baixa': return 'rgba(59, 130, 246, 0.8)';
        default: return 'rgba(99, 102, 241, 0.6)';
      }
    }};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

export const AnomalyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const AnomalyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  
  span:first-child {
    font-size: 1.5rem;
  }
`;

export const AnomalyPriority = styled.div<{ $priority: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$priority) {
      case 'critica': return 'rgba(239, 68, 68, 0.3)';
      case 'alta': return 'rgba(249, 115, 22, 0.3)';
      case 'media': return 'rgba(251, 191, 36, 0.3)';
      case 'baixa': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(99, 102, 241, 0.3)';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'critica': return '#fca5a5';
      case 'alta': return '#fdba74';
      case 'media': return '#fde047';
      case 'baixa': return '#93c5fd';
      default: return '#a5b4fc';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$priority) {
      case 'critica': return 'rgba(239, 68, 68, 0.5)';
      case 'alta': return 'rgba(249, 115, 22, 0.5)';
      case 'media': return 'rgba(251, 191, 36, 0.5)';
      case 'baixa': return 'rgba(59, 130, 246, 0.5)';
      default: return 'rgba(99, 102, 241, 0.5)';
    }
  }};
`;

export const AnomalyMessage = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
`;

export const AnomalyActions = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const AnomalyActionsTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AnomalyActionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const AnomalyActionItem = styled.li`
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  border-left: 3px solid rgba(99, 102, 241, 0.5);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-left-color: #6366f1;
    transform: translateX(4px);
  }

  &::before {
    content: '→';
    margin-right: 0.5rem;
    color: #818cf8;
  }
`;

// Modal de Cálculo
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  z-index: 10;
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
`;

export const FactorCard = styled.div<{ $impact: number }>`
  background: ${props => {
    const impact = props.$impact || 0;
    if (impact > 0) return 'rgba(16, 185, 129, 0.1)';
    if (impact < 0) return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  border: 1px solid ${props => {
    const impact = props.$impact || 0;
    if (impact > 0) return 'rgba(16, 185, 129, 0.3)';
    if (impact < 0) return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const FactorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const FactorName = styled.div`
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
`;

export const FactorImpact = styled.div<{ $impact: number }>`
  font-weight: 700;
  font-size: 1rem;
  color: ${props => {
    const impact = props.$impact || 0;
    if (impact > 0) return '#10b981';
    if (impact < 0) return '#ef4444';
    return 'rgba(255, 255, 255, 0.6)';
  }};
`;

export const FactorDescription = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

export const SummaryCard = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

export const SummaryScore = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #6366f1;
  margin: 0.5rem 0;
`;

export const SummaryText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
`;

export const ConfidenceBadgeModal = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  font-size: 0.875rem;
  font-weight: 600;
  color: #818cf8;
  margin-top: 0.5rem;
`;

