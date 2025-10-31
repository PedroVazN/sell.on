import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
  ErrorState,
  Pagination,
  PaginationButton,
  PaginationNumbers,
  PaginationNumber,
  Ellipsis
} from './styles';

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSeller = user?.role === 'vendedor';
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClients(currentPage, itemsPerPage, searchTerm);
      setClients(response.data || []);
      // Calcular total de páginas baseado na resposta da API
      if (response.pagination) {
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Resetar para primeira página ao buscar
  }, [searchTerm]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateClient = () => {
    if (isSeller) return; // vendedor não cria
    navigate('/clients/register');
  };

  const handleEditClient = (client: Client) => {
    if (isSeller) return; // vendedor não edita
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (isSeller) return; // vendedor não deleta
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
          {!isSeller && (
          <CreateButton disabled>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
          )}
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
            {!isSeller && (
            <CreateButton disabled>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
            )}
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
          {!isSeller && (
            <CreateButton onClick={handleCreateClient}>
              <Plus size={20} />
              Novo Cliente
            </CreateButton>
          )}
        </Actions>
      </Header>
      
      <Content>
        {clients.length === 0 ? (
          <EmptyState>
            <UserCheck size={48} />
            <h3>Nenhum cliente encontrado</h3>
            {!isSeller && (
              <>
                <p>Comece criando seu primeiro cliente</p>
                <CreateButton onClick={handleCreateClient}>
                  <Plus size={20} />
                  Novo Cliente
                </CreateButton>
              </>
            )}
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
                {!isSeller && (<TableCell>Ações</TableCell>)}
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
                  {!isSeller && (
                    <TableCell>
                      <ActionButton onClick={() => handleEditClient(client)}>
                        <Edit size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteClient(client)}>
                        <Trash2 size={16} />
                      </ActionButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Paginação */}
        {clients.length > 0 && totalPages > 1 && (
          <Pagination>
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </PaginationButton>
            
            <PaginationNumbers>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Mostrar primeira, última, atual e páginas adjacentes
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Adicionar "..." quando necessário
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <Ellipsis>...</Ellipsis>}
                      <PaginationNumber
                        onClick={() => setCurrentPage(page)}
                        $active={currentPage === page}
                      >
                        {page}
                      </PaginationNumber>
                    </React.Fragment>
                  );
                })}
            </PaginationNumbers>
            
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </PaginationButton>
          </Pagination>
        )}
      </Content>

      {!isSeller && (
        <ClientModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveClient}
          client={editingClient}
        />
      )}
    </Container>
  );
};
