import styled from 'styled-components';

export const Container = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(15, 23, 42, 0.95);
  border-right: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.05),
    4px 0 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%);
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  &:hover {
    border-right-color: rgba(71, 85, 105, 0.5);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.1),
      8px 0 30px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }
`;

export const Logo = styled.div`
  padding: 32px 24px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  text-align: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
    transition: all 0.3s ease;
  }
  
  &:hover {
    &::after {
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
    }
  }
  
  h1 {
    font-size: 2.2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    text-shadow: none;
    transition: all 0.3s ease;
    animation: logoGlow 3s ease-in-out infinite alternate;
  }
  
  span {
    font-size: 0.9rem;
    color: rgba(148, 163, 184, 0.8);
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 4px;
    display: block;
    transition: all 0.3s ease;
  }

  @keyframes logoGlow {
    0% {
      filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
    }
    100% {
      filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6));
    }
  }
`;

export const MenuSection = styled.div`
  padding: 24px 0;
`;

export const MenuTitle = styled.h3`
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 16px 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 50%;
  }
`;

export const MenuItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 0 12px;
  border-radius: 12px;
  overflow: hidden;
  
  background: ${({ $isActive }) => 
    $isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent'};
  
  color: ${({ $isActive }) => 
    $isActive ? '#60a5fa' : 'rgba(226, 232, 240, 0.8)'};
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(135deg, #3b82f6, #10b981);
    border-radius: 0 2px 2px 0;
    transform: scaleY(0);
    transform-origin: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05));
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  &:hover {
    background: rgba(59, 130, 246, 0.08);
    color: #60a5fa;
    transform: translateX(6px) scale(1.02);
    box-shadow: 
      0 4px 12px rgba(59, 130, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &::before {
      transform: scaleY(1);
    }
    
    &::after {
      opacity: 1;
    }
  }
  
  ${({ $isActive }) => $isActive && `
    &::before {
      transform: scaleY(1);
    }
    
    &::after {
      opacity: 0.3;
    }
    
    box-shadow: 
      0 2px 8px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}
`;

export const MenuIcon = styled.div`
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  
  svg {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const MenuText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  letter-spacing: 0.025em;
`;
