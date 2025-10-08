import React from 'react';
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
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Logo, 
  MenuSection, 
  MenuItem, 
  MenuIcon, 
  MenuText,
  MenuTitle
} from './styles';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  onClick?: () => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ icon, label, path, isActive, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
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

  const menuItems = [
    {
      title: 'PRINCIPAL',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/', permission: 'dashboard' },
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
        { icon: <FileSpreadsheet size={20} />, label: 'Propostas', path: '/proposals', permission: 'proposals' },
      ]
    },
    ...(hasPermission('admin') ? [{
      title: 'SISTEMA',
      items: [
        { icon: <UsersIcon size={20} />, label: 'Usuários', path: '/users', permission: 'admin' },
        { icon: <UserPlus size={20} />, label: 'Cadastrar Usuário', path: '/users/register', permission: 'admin' },
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
    <Container>
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
            />
          ))}
        </MenuSection>
      ))}
    </Container>
  );
};
