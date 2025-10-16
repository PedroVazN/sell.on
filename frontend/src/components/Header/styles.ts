import styled from 'styled-components';

export const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
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
    border-bottom-color: rgba(71, 85, 105, 0.5);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 12px 20px;
  min-width: 350px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    display: none; /* Ocultar busca em mobile por enquanto */
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
    border-color: rgba(71, 85, 105, 0.5);
    background: rgba(15, 23, 42, 0.9);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:focus-within {
    border-color: #3b82f6;
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 
      0 0 0 3px rgba(59, 130, 246, 0.1),
      0 8px 25px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
  
  svg {
    color: rgba(148, 163, 184, 0.6);
    margin-right: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
  }
  
  &:focus-within svg {
    color: #60a5fa;
    transform: scale(1.1);
  }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: rgba(248, 250, 252, 0.9);
  font-size: 0.95rem;
  flex: 1;
  font-weight: 500;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(148, 163, 184, 0.6);
    font-weight: 400;
    transition: all 0.3s ease;
  }
  
  &:focus::placeholder {
    color: rgba(148, 163, 184, 0.4);
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const NotificationButton = styled.button`
  position: relative;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  padding: 12px;
  color: rgba(148, 163, 184, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
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
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(15, 23, 42, 0.9);
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
  background: ${props => props.$isOpen ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)'};
  border: 1px solid ${props => props.$isOpen ? 'rgba(59, 130, 246, 0.5)' : 'rgba(71, 85, 105, 0.3)'};
  border-radius: 12px;
  padding: 12px 20px;
  color: rgba(226, 232, 240, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: visible;

  /* Responsivo para mobile */
  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 8px;
    
    span {
      display: none; /* Ocultar nome do usuário em mobile */
    }
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
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(15, 23, 42, 0.9);
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
  background: #1e293b;
  border: 1px solid #334155;
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
  color: #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  
  &:hover {
    background: #ef4444;
    color: white;
    transform: translateX(2px);
  }
`;
