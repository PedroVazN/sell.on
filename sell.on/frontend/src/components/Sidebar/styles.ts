import styled from 'styled-components';

export const SIDEBAR_WIDTH_EXPANDED = 280;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

interface ContainerProps {
  $isOpen?: boolean;
  $collapsed?: boolean;
}

export const Container = styled.aside<ContainerProps>`
  position: fixed;
  left: 0;
  top: 0;
  width: ${({ $collapsed }) => ($collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED)}px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.primary};
  backdrop-filter: blur(20px);
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  /* Uma única sombra para evitar “sombra pegando metade” */
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    width: 280px;
    transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '-100%'});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${({ $isOpen }) => $isOpen 
      ? '4px 0 30px rgba(0, 0, 0, 0.3)' 
      : 'none'
    };
  }
  
  /* Removido o ::before (gradiente) para evitar efeito de “sombra na metade” */
  
  &:hover {
    border-right-color: ${({ theme }) => theme.colors.border.secondary};
  }
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.focus};
    border-radius: 2px;
    transition: none;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.focus};
  }
`;

export const Logo = styled.div<{ $collapsed?: boolean }>`
  padding: ${({ $collapsed }) => ($collapsed ? '16px 10px' : '20px 18px')};
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  text-align: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: ${({ $collapsed }) => ($collapsed ? '56px' : 'auto')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
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
    font-size: ${({ $collapsed }) => ($collapsed ? '1.25rem' : '2.2rem')};
    font-weight: 800;
    background: ${({ theme }) => theme.colors.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    text-shadow: none;
    transition: all 0.3s ease;
    animation: logoGlow 3s ease-in-out infinite alternate;
  }
  
  span {
    font-size: ${({ $collapsed }) => ($collapsed ? '0.6rem' : '0.9rem')};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 600;
    letter-spacing: ${({ $collapsed }) => ($collapsed ? '1px' : '3px')};
    text-transform: uppercase;
    margin-top: 4px;
    display: block;
    transition: all 0.3s ease;
    opacity: ${({ $collapsed }) => ($collapsed ? 0.9 : 1)};
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

export const MenuSection = styled.div<{ $collapsed?: boolean }>`
  padding: ${({ $collapsed }) => ($collapsed ? '12px 0' : '24px 0')};
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const MenuTitle = styled.h3<{ $collapsed?: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 16px 24px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  max-height: ${({ $collapsed }) => ($collapsed ? '0' : '24px')};
  margin-bottom: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
  transition: opacity 0.25s ease, max-height 0.25s ease, margin 0.25s ease;
  
  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    border-radius: 50%;
  }
`;

export const MenuItem = styled.div<{ $isActive?: boolean; $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ $collapsed }) => ($collapsed ? '14px 0' : '16px 24px')};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 0 ${({ $collapsed }) => ($collapsed ? '8px' : '12px')};
  border-radius: 12px;
  overflow: hidden;
  
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.hover.primary : 'transparent'};
  
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text.accent : theme.colors.text.secondary};
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.colors.gradients.glow};
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
    background: ${({ theme }) => theme.colors.hover.primary};
    color: ${({ theme }) => theme.colors.text.accent};
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

export const MenuIcon = styled.div<{ $collapsed?: boolean }>`
  margin-right: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  
  svg {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const MenuText = styled.span<{ $collapsed?: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s ease, width 0.25s ease;
  position: relative;
  z-index: 1;
  letter-spacing: 0.025em;
  overflow: hidden;
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  width: ${({ $collapsed }) => ($collapsed ? '0' : 'auto')};
  max-width: ${({ $collapsed }) => ($collapsed ? '0' : '200px')};
`;

export const CollapseToggle = styled.button`
  display: none;
  @media (min-width: 769px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 10px;
    top: 12px;
    transform: none;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border.secondary};
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    z-index: 1102;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      background: ${({ theme }) => theme.colors.hover.primary};
      border-color: ${({ theme }) => theme.colors.border.focus};
      color: ${({ theme }) => theme.colors.text.accent};
      transform: scale(1.06);
    }
    &:active {
      transform: scale(0.96);
    }
  }
`;

/* Overlay para fechar o menu em mobile */
export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

/* Botão hambúrguer para mobile */
export const MenuToggle = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 20px;
    left: 20px;
    width: 48px;
    height: 48px;
    background: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: 12px;
    cursor: pointer;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
    
    &:active {
      transform: scale(0.95);
    }
    
    svg {
      color: white;
      transition: all 0.3s ease;
    }
  }
`;

/* Botão de fechar dentro do sidebar em mobile */
export const CloseButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    cursor: pointer;
    z-index: 1002;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
    }
    
    svg {
      color: #ef4444;
      transition: all 0.3s ease;
    }
  }
`;
