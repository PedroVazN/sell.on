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
  Filter,
  ChevronLeft,
  ChevronRight,
  Briefcase
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
  CloseButton,
  CollapseToggle
} from './styles';

const STORAGE_SIDEBAR_COLLAPSED = 'sidebarCollapsed';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  onAfterClick?: () => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ icon, label, path, isActive, collapsed, onClick, onAfterClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
    if (onAfterClick) onAfterClick();
  };
  
  return (
    <MenuItem onClick={handleClick} $isActive={isActive} $collapsed={collapsed} title={collapsed ? label : undefined}>
      <MenuIcon $collapsed={collapsed}>{icon}</MenuIcon>
      <MenuText $collapsed={collapsed}>{label}</MenuText>
    </MenuItem>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
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
        ...(user?.role === 'vendedor' ? [
          { icon: <Briefcase size={20} />, label: 'Minha Carteira', path: '/carteira', permission: 'proposals' },
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
      <Container $isOpen={isOpen} $collapsed={collapsed}>
        <CloseButton onClick={closeMenu}>
          <X size={20} />
        </CloseButton>

        {onToggleCollapse && (
          <CollapseToggle onClick={onToggleCollapse} type="button" title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </CollapseToggle>
        )}

        <Logo $collapsed={collapsed}>
          <h1>Sell.On</h1>
          <span>CRM</span>
        </Logo>
        
        {menuItems.map((section, index) => (
          <MenuSection key={index} $collapsed={collapsed}>
            <MenuTitle $collapsed={collapsed}>{section.title}</MenuTitle>
            {section.items.map((item, itemIndex) => (
              <MenuItemComponent
                key={itemIndex}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                collapsed={collapsed}
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
