import styled from 'styled-components';

export const ClockContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 16px 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 16px 48px rgba(0, 0, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.colors.primary} 0%, 
      ${({ theme }) => theme.colors.secondary} 50%, 
      ${({ theme }) => theme.colors.accent} 100%
    );
    border-radius: 20px 20px 0 0;
    opacity: 0.8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.05) 100%
    );
    border-radius: 20px;
    pointer-events: none;
  }
`;

export const ClockIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary} 0%, 
    ${({ theme }) => theme.colors.secondary} 100%
  );
  border-radius: 14px;
  color: white;
  box-shadow: 
    0 4px 16px rgba(59, 130, 246, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: pulse 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 70%
    );
    animation: shine 2s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 
        0 4px 16px rgba(59, 130, 246, 0.3),
        0 2px 8px rgba(0, 0, 0, 0.2);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 
        0 6px 20px rgba(59, 130, 246, 0.4),
        0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }
  
  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
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

export const GreetingDisplay = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
  opacity: 0.9;
`;

export const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 6px;
  
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
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  
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
