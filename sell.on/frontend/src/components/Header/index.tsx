import React, { useState, useEffect } from 'react';
import { Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { apiService } from '../../services/api';
import { 
  Container, 
  HeaderRow,
  VerseBar,
  SearchContainer, 
  SearchInput, 
  ActionsContainer, 
  UserButton,
  UserMenu,
  UserMenuItem
} from './styles';

export const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    apiService.getRandomVerse()
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        const d = res.data;
        if (d.text && d.reference) setVerse({ text: d.text, reference: d.reference });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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
        <SearchContainer>
          <Search size={20} />
          <SearchInput placeholder="Pesquisar..." />
        </SearchContainer>

        <ActionsContainer>
        <NotificationBell />
        
        <div style={{ position: 'relative' }}>
          <UserButton onClick={handleUserClick} $isOpen={showUserMenu}>
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
          
          {showUserMenu && (() => {
            console.log('RENDERIZANDO MENU - showUserMenu:', showUserMenu);
            return (
              <div 
                onClick={handleMenuClick} 
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'red',
                  zIndex: 9999,
                  padding: '10px',
                  border: '2px solid yellow',
                  minWidth: '150px',
                  borderRadius: '8px'
                }}
              >
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            );
          })()}
        </div>
      </ActionsContainer>
      </HeaderRow>

      {verse && (
        <VerseBar title={verse.reference}>
          <strong>“{verse.text}”</strong>
          {verse.reference && <span> — {verse.reference}</span>}
        </VerseBar>
      )}
    </Container>
  );
};
