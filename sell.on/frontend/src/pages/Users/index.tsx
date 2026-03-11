import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Plus, Search, Filter, Edit, Trash2, Loader2, UserCheck, UserX, Shield, User } from 'lucide-react';
import { apiService, User as UserType } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { UserModal } from '../../components/UserModal';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  FilterButton,
  FilterDropdown,
  FilterOption,
  Content,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  UsersGrid,
  UserCard,
  UserInfo,
  UserName,
  UserEmail,
  UserRole,
  UserStatus,
  UserActions,
  ActionButton,
  EmptyState,
  EmptyIcon,
  EmptyText,
  LoadingContainer,
  LoadingText
} from './styles';

export const Users: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    role: ''
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers(1, 100, searchTerm, filters.role);
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.role]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  // Verificar se deve abrir o modal de criação automaticamente
  useEffect(() => {
    if (location.pathname === '/users/create-seller') {
      setEditingUser(null);
      setShowUserModal(true);
      // Redirecionar para a página de usuários
      window.history.replaceState({}, '', '/users');
    }
  }, [location.pathname]);

  const handleCreateUser = () => {
    navigate('/users/register');
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: UserType) => {
    const ok = await confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir o usuário ${user.name}?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const response = await apiService.deleteUser(user._id);
      if (response.success) {
        await loadUsers();
        await loadStats();
        success('Usuário excluído', 'O usuário foi removido com sucesso.');
      } else {
        showError('Erro ao excluir', 'Não foi possível excluir o usuário.');
      }
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      showError('Erro ao excluir', 'Não foi possível excluir o usuário.');
    }
  };

  const handleSaveUser = async () => {
    await loadUsers();
    await loadStats();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applySearch = () => {
    setSearchTerm(searchInputValue);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySearch();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} />;
      case 'vendedor':
        return <User size={16} />;
      default:
        return <UserCheck size={16} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'cliente':
        return 'Cliente';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'vendedor':
        return '#3b82f6';
      case 'cliente':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <UsersIcon size={24} />
          Gerenciar Usuários
        </Title>
        <Actions>
          <SearchContainer>
            <Search size={20} aria-hidden />
            <SearchInput
              id="users-search"
              aria-label="Buscar usuários por nome ou email"
              placeholder="Buscar usuários (Enter ou Buscar)"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <FilterButton type="button" onClick={applySearch} disabled={loading} aria-busy={loading} aria-label={loading ? 'Buscando usuários' : 'Executar busca'} style={{ marginLeft: '0.5rem', minWidth: loading ? 130 : undefined }}>
              {loading ? <><Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} /> Buscando...</> : 'Buscar'}
            </FilterButton>
          </SearchContainer>
          
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
            Filtros
          </FilterButton>

          {showFilters && (
            <FilterDropdown>
              <FilterOption
                onClick={() => handleFilterChange('role', '')}
                $active={filters.role === ''}
              >
                Todos os cargos
              </FilterOption>
              <FilterOption
                onClick={() => handleFilterChange('role', 'admin')}
                $active={filters.role === 'admin'}
              >
                Administradores
              </FilterOption>
              <FilterOption
                onClick={() => handleFilterChange('role', 'vendedor')}
                $active={filters.role === 'vendedor'}
              >
                Vendedores
              </FilterOption>
              <FilterOption
                onClick={() => handleFilterChange('role', 'cliente')}
                $active={filters.role === 'cliente'}
              >
                Clientes
              </FilterOption>
            </FilterDropdown>
          )}

          <ActionButton onClick={handleCreateUser} $variant="primary">
            <Plus size={20} />
            Novo Usuário
          </ActionButton>
        </Actions>
      </Header>

      <Content>
        {stats && (
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total de Usuários</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.active}</StatValue>
              <StatLabel>Usuários Ativos</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.byRole.vendedor}</StatValue>
              <StatLabel>Vendedores</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.byRole.admin}</StatValue>
              <StatLabel>Administradores</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {loading ? (
          <LoadingContainer>
            <Loader2 size={32} className="animate-spin" />
            <LoadingText>Carregando usuários...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <EmptyState>
            <EmptyIcon>⚠️</EmptyIcon>
            <EmptyText>{error}</EmptyText>
          </EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>Nenhum usuário encontrado</EmptyText>
          </EmptyState>
        ) : (
          <UsersGrid>
            {users.map((user) => (
              <UserCard key={user._id}>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                  <UserRole $color={getRoleColor(user.role)}>
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </UserRole>
                  <UserStatus $active={user.isActive}>
                    {user.isActive ? (
                      <>
                        <UserCheck size={14} />
                        Ativo
                      </>
                    ) : (
                      <>
                        <UserX size={14} />
                        Inativo
                      </>
                    )}
                  </UserStatus>
                </UserInfo>

                <UserActions>
                  <ActionButton
                    onClick={() => handleEditUser(user)}
                    $variant="secondary"
                  >
                    <Edit size={14} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteUser(user)}
                    $variant="danger"
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                </UserActions>
              </UserCard>
            ))}
          </UsersGrid>
        )}
      </Content>

      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          user={editingUser}
          defaultRole={editingUser ? undefined : 'vendedor'}
        />
      )}
    </Container>
  );
};
