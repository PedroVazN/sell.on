import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.15);
    border-color: ${theme.colors.border.secondary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &::after {
      left: 100%;
    }
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  margin: 0.25rem 0 0 0;
`;

export const CardContent = styled.div`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${theme.colors.border.primary};
`;

export const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.15);
    border-color: ${theme.colors.border.secondary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &::after {
      left: 100%;
    }
  }
`;

export const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

export const MetricChange = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $positive, $negative }) => {
    if ($positive) return theme.colors.status.success;
    if ($negative) return theme.colors.status.error;
    return theme.colors.text.muted;
  }};
`;
