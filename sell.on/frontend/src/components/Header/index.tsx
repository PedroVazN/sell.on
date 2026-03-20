import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { 
  Container, 
  HeaderRow,
  ActionsContainer, 
  UserButton,
  UserMenu,
  UserMenuItem,
} from './styles';

export const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserClick = () => {
    console.log('Clicou no usuário, showUserMenu atual:', showUserMenu);
    console.log('Vai mudar para:', !showUserMenu);
    setShowUserMenu(!showUserMenu);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <Container>
      <HeaderRow>
        <ActionsContainer>
          <NotificationBell />
        
          <div style={{ position: 'relative' }}>
            <UserButton
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick();
              }}
              $isOpen={showUserMenu}
            >
              <User size={20} />
              <span>{user?.name || 'Usuário'}</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>
                ({user?.role === 'admin' ? 'Administrador' : 'Vendedor'})
              </span>
              <span style={{ 
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </UserButton>
            
            {showUserMenu && (
              <UserMenu onClick={handleMenuClick}>
                <UserMenuItem type="button" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sair</span>
                </UserMenuItem>
              </UserMenu>
            )}
          </div>
        </ActionsContainer>
      </HeaderRow>
    </Container>
  );
};
