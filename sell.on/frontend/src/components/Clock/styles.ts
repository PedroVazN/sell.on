import styled from 'styled-components';

type Variant = 'sun' | 'rain' | 'cloudy' | null;

export const ClockContainer = styled.div<{ $variant?: Variant }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${({ $variant }) =>
    $variant === 'sun'
      ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(234, 88, 12, 0.15) 50%, rgba(255, 255, 255, 0.08) 100%)'
      : $variant === 'rain'
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
  border: 1px solid ${({ $variant }) =>
    $variant === 'sun' ? 'rgba(251, 146, 60, 0.4)' : $variant === 'rain' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 20px;
  padding: 16px 24px;
  backdrop-filter: blur(20px);
  box-shadow: ${({ $variant }) =>
    $variant === 'sun'
      ? '0 8px 32px rgba(234, 88, 12, 0.25), 0 4px 16px rgba(0, 0, 0, 0.2)'
      : $variant === 'rain'
        ? '0 8px 32px rgba(30, 64, 175, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
        : '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: ${({ $variant }) =>
      $variant === 'sun' ? 'rgba(251, 146, 60, 0.5)' : $variant === 'rain' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $variant, theme }) =>
      $variant === 'sun'
        ? 'linear-gradient(90deg, #f97316 0%, #ea580c 50%, #fb923c 100%)'
        : $variant === 'rain'
          ? 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)'
          : `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`};
    border-radius: 20px 20px 0 0;
    opacity: 0.9;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $variant }) =>
      $variant === 'sun'
        ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, transparent 50%)'
        : $variant === 'rain'
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, transparent 50%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'};
    border-radius: 20px;
    pointer-events: none;
  }
`;

export const RainOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 20px;
  overflow: hidden;
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -100%;
    left: 0;
    right: 0;
    height: 200%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    );
    animation: rainFall 1.2s linear infinite;
  }
  &::after {
    left: 20%;
    animation-duration: 1.5s;
    animation-delay: 0.2s;
    opacity: 0.7;
  }
  @keyframes rainFall {
    0% { transform: translateY(0); }
    100% { transform: translateY(50%); }
  }
`;

export const ClockIconWrapper = styled.div<{ $variant?: Variant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: ${({ $variant, theme }) =>
    $variant === 'sun'
      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
      : $variant === 'rain'
        ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
        : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`};
  border-radius: 14px;
  color: white;
  box-shadow: ${({ $variant }) =>
    $variant === 'sun'
      ? '0 4px 16px rgba(234, 88, 12, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
      : $variant === 'rain'
        ? '0 4px 16px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 4px 16px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'};
  animation: pulse 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.15) 50%, 
      transparent 70%
    );
    animation: shine 2s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

export const TimeDisplay = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 3px;
  position: relative;
  z-index: 1;
`;

export const SecondsDisplay = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.8;
  animation: blink 1s ease-in-out infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 0.8; }
    51%, 100% { opacity: 0.4; }
  }
`;

export const GreetingDisplay = styled.div<{ $variant?: Variant }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $variant, theme }) =>
    $variant === 'sun' ? '#ea580c' : $variant === 'rain' ? '#93c5fd' : theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
  opacity: 0.95;
`;

export const WeatherDisplay = styled.div<{ $variant?: Variant }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $variant, theme }) =>
    $variant === 'sun' ? '#f97316' : $variant === 'rain' ? '#93c5fd' : theme.colors.text.secondary};
  margin-top: 2px;
  z-index: 1;
  position: relative;
  svg { flex-shrink: 0; }
`;

export const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
  position: relative;
  z-index: 1;
  
  svg {
    opacity: 0.8;
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  span {
    font-family: 'Inter', sans-serif;
    text-transform: capitalize;
    letter-spacing: 0.6px;
  }
`;

export const TimeZoneDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 1;

  svg {
    opacity: 0.9;
    width: 12px;
    height: 12px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  span {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
  }
`;
