import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users as UsersIcon, 
  TrendingUp, 
  FileText, 
  Target,
  Activity,
  Calendar,
  Bell,
  Settings,
  Package,
  UserCheck,
  Truck,
  FileSpreadsheet,
  DollarSign,
  UserPlus,
  User,
  LogOut,
  Megaphone,
  Menu,
  X,
  FileBarChart,
  Brain,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Logo, 
  MenuSection, 
  MenuItem, 
  MenuIcon, 
  MenuText,
  MenuTitle,
  Overlay,
  MenuToggle,
  CloseButton
} from './styles';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  onClick?: () => void;
  onAfterClick?: () => void; // Callback após o click (para fechar menu em mobile)
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ icon, label, path, isActive, onClick, onAfterClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
    // Chamar callback após navegação (para fechar menu em mobile)
    if (onAfterClick) {
      onAfterClick();
    }
  };
  
  return (
    <MenuItem 
      onClick={handleClick} 
      $isActive={isActive}
    >
      <MenuIcon>{icon}</MenuIcon>
      <MenuText>{label}</MenuText>
    </MenuItem>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, hasPermission, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    {
      title: 'PRINCIPAL',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/', permission: 'dashboard' },
        ...(hasPermission('admin') ? [
          { icon: <Brain size={20} />, label: 'Dashboard IA', path: '/ai-dashboard', permission: 'admin' },
        ] : []),
        { 
          icon: <Megaphone size={20} />, 
          label: user?.role === 'admin' ? 'Gerenciar Avisos' : 'Mural de Avisos', 
          path: user?.role === 'admin' ? '/notices-admin' : '/notices', 
          permission: 'notices' 
        },
      ]
    },
    {
      title: user?.role === 'vendedor' ? 'PROPOSTAS' : 'GESTÃO',
      items: [
        ...(hasPermission('admin') ? [
          { icon: <Package size={20} />, label: 'Produtos', path: '/products', permission: 'admin' },
          { icon: <UserCheck size={20} />, label: 'Clientes', path: '/clients', permission: 'admin' },
          { icon: <Truck size={20} />, label: 'Distribuidores', path: '/distributors', permission: 'admin' },
          { icon: <DollarSign size={20} />, label: 'Lista de Preços', path: '/price-list', permission: 'admin' },
        ] : []),
        { icon: <Filter size={20} />, label: 'Funil de Vendas', path: '/funnel', permission: 'funnel' },
        { icon: <FileSpreadsheet size={20} />, label: 'Propostas', path: '/proposals', permission: 'proposals' },
        ...(hasPermission('admin') ? [
          { icon: <FileBarChart size={20} />, label: 'Relatórios', path: '/reports', permission: 'admin' },
        ] : []),
      ]
    },
    ...(hasPermission('admin') ? [{
      title: 'SISTEMA',
      items: [
        { icon: <UsersIcon size={20} />, label: 'Usuários', path: '/users', permission: 'admin' },
        { icon: <UserPlus size={20} />, label: 'Cadastrar Usuário', path: '/users/register', permission: 'admin' },
        { icon: <Target size={20} />, label: 'Metas', path: '/goals', permission: 'admin' },
        { icon: <BarChart3 size={20} />, label: 'Dashboard Vendedores', path: '/vendedor-dashboard', permission: 'admin' },
      ]
    }] : []),
    {
      title: 'PERFIL',
      items: [
        { icon: <LogOut size={20} />, label: 'Sair', path: '', onClick: logout },
      ]
    }
  ];

  return (
    <>
      {/* Botão hambúrguer para abrir o menu em mobile */}
      <MenuToggle onClick={toggleMenu}>
        <Menu size={24} />
      </MenuToggle>

      {/* Overlay escuro para fechar o menu */}
      <Overlay $isOpen={isOpen} onClick={closeMenu} />

      {/* Sidebar */}
      <Container $isOpen={isOpen}>
        {/* Botão de fechar dentro do sidebar (mobile) */}
        <CloseButton onClick={closeMenu}>
          <X size={20} />
        </CloseButton>

        <Logo>
          <h1>Sell.On</h1>
          <span>CRM</span>
        </Logo>
        
        {menuItems.map((section, index) => (
          <MenuSection key={index}>
            <MenuTitle>{section.title}</MenuTitle>
            {section.items.map((item, itemIndex) => (
              <MenuItemComponent
                key={itemIndex}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                onClick={'onClick' in item ? item.onClick : undefined}
                onAfterClick={closeMenu}
              />
            ))}
          </MenuSection>
        ))}
      </Container>
    </>
  );
};
