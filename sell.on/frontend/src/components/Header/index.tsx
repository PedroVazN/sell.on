import React, { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { apiService } from '../../services/api';
import { 
  Container, 
  HeaderRow,
  VerseBar,
  ActionsContainer, 
  UserButton,
  UserMenu,
  UserMenuItem,
} from './styles';

// Fallback quando a API do versículo falhar (ex.: Vercel/ABíbliaDigital)
const FALLBACK_VERSES: { text: string; reference: string }[] = [
  { text: 'O Senhor é meu pastor; nada me faltará.', reference: 'Salmos 23:1' },
  { text: 'Tudo posso naquele que me fortalece.', reference: 'Filipenses 4:13' },
  { text: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', reference: 'Salmos 37:5' },
  { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.', reference: 'João 3:16' },
  { text: 'O que for feito com as mãos prosperará.', reference: 'Provérbios 31:31' },
];

function pickRandomVerse() {
  return FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
}

export const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [verse, setVerse] = useState<{ text: string; reference: string }>(() => pickRandomVerse());
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    apiService.getRandomVerse()
      .then((res) => {
        if (cancelled) return;
        const d = (res && (res as { data?: { text?: string; reference?: string } }).data) || null;
        if (d?.text && d?.reference) {
          setVerse({ text: d.text, reference: d.reference });
        }
      })
      .catch(() => {
        if (!cancelled) setVerse(pickRandomVerse());
      });
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
        <VerseBar title={verse.reference}>
          <strong>{verse.text}</strong>
          <span> - {verse.reference}</span>
        </VerseBar>
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
