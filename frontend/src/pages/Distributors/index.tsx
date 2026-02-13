import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import { apiService, Distributor } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { DistributorModal } from '../../components/DistributorModal';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  FilterButton,
  Content,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  ActionButton,
  StatusBadge,
  EmptyState,
  LoadingState,
  ErrorState
} from './styles';

export const Distributors: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);

  const loadDistributors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDistributors(1, 100, searchTerm);
      setDistributors(response.data);
    } catch (err) {
      setError('Erro ao carregar distribuidores');
      console.error('Erro ao carregar distribuidores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadDistributors();
  }, [loadDistributors]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDistributor = async (distributor: Distributor) => {
    const ok = await confirm({
      title: 'Excluir distribuidor',
      message: `Tem certeza que deseja excluir o distribuidor ${distributor.apelido || 'N/A'}?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiService.deleteDistributor(distributor._id);
      loadDistributors();
      success('Distribuidor excluído', 'O distribuidor foi removido com sucesso.');
    } catch (err) {
      showError('Erro ao excluir distribuidor', 'Tente novamente.');
      console.error('Erro ao excluir distribuidor:', err);
    }
  };

  const handleCreateDistributor = () => {
    navigate('/distributors/register');
  };

  const handleEditDistributor = (distributor: Distributor) => {
    setEditingDistributor(distributor);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDistributor(null);
  };

  const handleModalSuccess = () => {
    loadDistributors();
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Distribuidores</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar distribuidores..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Distribuidor
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <LoadingState>
            <Loader2 size={32} />
            <p>Carregando distribuidores...</p>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Distribuidores</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar distribuidores..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Distribuidor
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <ErrorState>
            <p>{error}</p>
            <button onClick={loadDistributors}>Tentar novamente</button>
          </ErrorState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Distribuidores</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar distribuidores..." 
              value={searchTerm || ''}
              onChange={handleSearch}
            />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton onClick={handleCreateDistributor}>
            <Plus size={20} />
            Novo Distribuidor
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        {distributors.length === 0 ? (
          <EmptyState>
            <Truck size={48} />
            <h3>Nenhum distribuidor encontrado</h3>
            <p>Comece criando seu primeiro distribuidor</p>
            <CreateButton onClick={handleCreateDistributor}>
              <Plus size={20} />
              Novo Distribuidor
            </CreateButton>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Apelido</TableCell>
                <TableCell>Razão Social</TableCell>
                <TableCell>ID Distribuidor</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributors.map((distributor) => (
                <TableRow key={distributor._id}>
                  <TableCell>
                    <div>
                      <strong>{distributor.apelido || 'N/A'}</strong>
                    </div>
                  </TableCell>
                  <TableCell>{distributor.razaoSocial || 'N/A'}</TableCell>
                  <TableCell>{distributor.idDistribuidor || 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <div>{distributor.contato?.nome || distributor.contactPerson?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {distributor.contato?.email || distributor.email || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {distributor.contato?.telefone ? formatPhone(distributor.contato.telefone) : distributor.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{distributor.origem || distributor.address?.city || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusBadge $isActive={distributor.isActive}>
                      {distributor.isActive ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton onClick={() => handleEditDistributor(distributor)}>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteDistributor(distributor)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>
      
      <DistributorModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        distributor={editingDistributor}
      />
    </Container>
  );
};
