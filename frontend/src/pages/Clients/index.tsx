import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import { ClientModal } from '../../components/ClientModal';
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

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClients(1, 100, searchTerm);
      setClients(response.data);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadClients();
  }, [searchTerm, loadClients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateClient = () => {
    navigate('/clients/register');
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${client.razaoSocial}?`)) {
      try {
        await apiService.deleteClient(client._id);
        loadClients();
      } catch (err) {
        alert('Erro ao excluir cliente');
        console.error('Erro ao excluir cliente:', err);
      }
    }
  };

  const handleSaveClient = (client: Client) => {
    loadClients();
    setShowModal(false);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Clientes</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar clientes..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <LoadingState>
            <Loader2 size={32} />
            <p>Carregando clientes...</p>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Clientes</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar clientes..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <ErrorState>
            <p>{error}</p>
            <button onClick={loadClients}>Tentar novamente</button>
          </ErrorState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Clientes</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar clientes..." 
              value={searchTerm || ''}
              onChange={handleSearch}
            />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton onClick={handleCreateClient}>
            <Plus size={20} />
            Novo Cliente
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        {clients.length === 0 ? (
          <EmptyState>
            <UserCheck size={48} />
            <h3>Nenhum cliente encontrado</h3>
            <p>Comece criando seu primeiro cliente</p>
            <CreateButton onClick={handleCreateClient}>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Razão Social</TableCell>
                <TableCell>CNPJ</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>UF</TableCell>
                <TableCell>Classificação</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell>
                    <div>
                      <strong>{client.razaoSocial}</strong>
                      {client.nomeFantasia && (
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {client.nomeFantasia}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatCNPJ(client.cnpj)}</TableCell>
                  <TableCell>
                    <div>
                      <div>{client.contato.nome}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {client.contato.email}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {formatPhone(client.contato.telefone)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.endereco.uf}</TableCell>
                  <TableCell>{client.classificacao}</TableCell>
                  <TableCell>
                    <StatusBadge $isActive={client.isActive}>
                      {client.isActive ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton onClick={() => handleEditClient(client)}>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteClient(client)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>

      <ClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </Container>
  );
};
