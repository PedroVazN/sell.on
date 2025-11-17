import styled from 'styled-components';

export const Container = styled.div`
  padding: 2rem;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: #ffffff;
  margin-left: 0;
  margin-right: 0;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #a3a3a3;
  margin: 0;
  font-weight: 400;
`;

export const VendedorSelector = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

export const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
`;

export const SelectorLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
`;

export const SelectorSelect = styled.select`
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-size: 1rem;
  min-width: 300px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  option {
    background: #374151;
    color: #ffffff;
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
`;

export const MetricCard = styled.div`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 1px solid #4b5563;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
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
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

export const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #a3a3a3;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

export const MetricChange = styled.div`
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

export const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
`;

export const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: #a3a3a3;
  margin: 0 0 1.5rem 0;
`;

export const GoalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const GoalItem = styled.div`
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #4b5563;
  }
`;

export const GoalName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
`;

export const GoalProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

export const GoalBar = styled.div<{ $color: string; $width: number }>`
  flex: 1;
  height: 8px;
  background: #1f2937;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$width}%;
    background: ${props => props.$color};
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

export const GoalPercentage = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  min-width: 40px;
  text-align: right;
`;

export const PerformanceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
`;

export const MetricItem = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #374151;
  }
`;

export const MetricItemIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => props.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const MetricItemLabel = styled.div`
  font-size: 0.875rem;
  color: #a3a3a3;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

export const MetricItemValue = styled.div<{ $negative?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$negative ? '#ef4444' : '#ffffff'};
`;

export const MetricItemDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

export const MetricItemTrend = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-weight: 500;
  margin-top: 0.25rem;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  svg {
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: #a3a3a3;
    font-size: 1.125rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
