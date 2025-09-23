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
  User
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
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ icon, label, path, isActive }) => {
  const navigate = useNavigate();
  
  return (
    <MenuItem 
      onClick={() => navigate(path)} 
      $isActive={isActive}
    >
      <MenuIcon>{icon}</MenuIcon>
      <MenuText>{label}</MenuText>
    </MenuItem>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      title: 'PRINCIPAL',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/', permission: 'dashboard' },
        ...(hasPermission('admin') ? [
          { icon: <UsersIcon size={20} />, label: 'Leads', path: '/leads', permission: 'admin' },
          { icon: <TrendingUp size={20} />, label: 'Vendas', path: '/sales', permission: 'admin' },
          { icon: <FileText size={20} />, label: 'Relatórios', path: '/reports', permission: 'admin' },
          { icon: <Target size={20} />, label: 'Metas', path: '/goals', permission: 'admin' },
        ] : [])
      ]
    },
    ...(hasPermission('admin') ? [{
      title: 'ANÁLISE',
      items: [
        { icon: <Activity size={20} />, label: 'Performance', path: '/performance', permission: 'admin' },
        { icon: <BarChart3 size={20} />, label: 'Análise', path: '/analysis', permission: 'admin' },
        { icon: <Calendar size={20} />, label: 'Calendário', path: '/calendar', permission: 'admin' },
      ]
    }] : []),
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
            { icon: <Bell size={20} />, label: 'Notificações', path: '/notifications', permission: 'admin' },
            { icon: <Settings size={20} />, label: 'Configurações', path: '/configurations', permission: 'admin' },
          ]
        }] : []),
    {
      title: 'PERFIL',
      items: [
        { icon: <User size={20} />, label: 'Meu Perfil', path: '/profile', permission: 'profile' },
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
            />
          ))}
        </MenuSection>
      ))}
    </Container>
  );
};
