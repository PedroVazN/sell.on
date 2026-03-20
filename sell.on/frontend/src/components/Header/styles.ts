import styled from 'styled-components';

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const VerseBar = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.hover.primary};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  & strong { color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600; }
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 8px 12px;
    max-width: 180px;
  }
`;

export const Container = styled.header`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
    padding-left: 80px; /* Espaço para o botão hambúrguer */
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%);
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  &:hover {
    border-bottom-color: ${({ theme }) => theme.colors.border.secondary};
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-left: auto;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const NotificationButton = styled.button`
  position: relative;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  flex-shrink: 0;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    padding: 10px;
  }
  
  &::before {
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
    color: ${({ theme }) => theme.colors.text.accent};
    border-color: ${({ theme }) => theme.colors.border.focus};
    background: ${({ theme }) => theme.colors.background.secondary};
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

export const UserButton = styled.button<{ $isOpen?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme, $isOpen }) => ($isOpen ? theme.colors.background.glass : theme.colors.background.card)};
  border: 1px solid ${({ theme, $isOpen }) => ($isOpen ? theme.colors.border.focus : theme.colors.border.primary)};
  border-radius: 12px;
  padding: 12px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: visible;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 8px;
    flex-shrink: 0;
    min-width: auto;
    
    span {
      display: none; /* Ocultar nome do usuário em mobile */
    }
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
  }
  
  &::before {
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
    color: ${({ theme }) => theme.colors.text.accent};
    border-color: ${({ theme }) => theme.colors.border.focus};
    background: ${({ theme }) => theme.colors.background.glass};
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
  
  span {
    font-size: 0.9rem;
    font-weight: 600;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }
`;

export const UserMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.5),
    0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px;
  min-width: 200px;
  z-index: 9999;
  backdrop-filter: blur(10px);
  animation: slideDown 0.2s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const UserMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  
  &:hover {
    background: ${({ theme }) => theme.colors.status.error};
    color: white;
    transform: translateX(2px);
  }
`;
