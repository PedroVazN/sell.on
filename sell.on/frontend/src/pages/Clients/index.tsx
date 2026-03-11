import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { ClientModal } from '../../components/ClientModal';
import { TableSkeleton } from '../../components/TableSkeleton';
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
  ErrorState,
  Pagination,
  PaginationButton,
  PaginationNumbers,
  PaginationNumber,
  Ellipsis
} from './styles';

const formatCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');
  return digits.length >= 14 ? `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}` : cnpj;
};
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length >= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
};

const ClientRow = memo(function ClientRow({
  client,
  isSeller,
  onEdit,
  onDelete,
}: {
  client: Client;
  isSeller: boolean;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <strong>{client.razaoSocial}</strong>
          {client.nomeFantasia && <div style={{ fontSize: '0.9rem', color: '#666' }}>{client.nomeFantasia}</div>}
        </div>
      </TableCell>
      <TableCell>{formatCNPJ(client.cnpj)}</TableCell>
      <TableCell>
        <div>
          <div>{client.contato.nome}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>{client.contato.email}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>{formatPhone(client.contato.telefone)}</div>
        </div>
      </TableCell>
      <TableCell>{client.endereco.uf}</TableCell>
      <TableCell>{client.classificacao}</TableCell>
      {!isSeller && (
        <TableCell>
          {client.assignedTo && typeof client.assignedTo === 'object' && 'name' in client.assignedTo
            ? client.assignedTo.name
            : client.assignedTo ? String(client.assignedTo) : '—'}
        </TableCell>
      )}
      <TableCell>
        <StatusBadge $isActive={client.isActive}>{client.isActive ? 'Ativo' : 'Inativo'}</StatusBadge>
      </TableCell>
      {!isSeller && (
        <TableCell>
          <ActionButton onClick={() => onEdit(client)}><Edit size={16} /></ActionButton>
          <ActionButton onClick={() => onDelete(client)}><Trash2 size={16} /></ActionButton>
        </TableCell>
      )}
    </TableRow>
  );
});

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const isSeller = user?.role === 'vendedor';
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
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
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  };

  const applySearch = () => {
    setSearchTerm(searchInputValue);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySearch();
  };

  const handleCreateClient = () => {
    if (isSeller) return; // vendedor não cria
    navigate('/clients/register');
  };

  const handleEditClient = useCallback((client: Client) => {
    if (isSeller) return;
    setEditingClient(client);
    setShowModal(true);
  }, [isSeller]);

  const handleDeleteClient = useCallback(async (client: Client) => {
    if (isSeller) return;
    const ok = await confirm({
      title: 'Excluir cliente',
      message: `Tem certeza que deseja excluir o cliente ${client.razaoSocial}?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiService.deleteClient(client._id);
      loadClients();
      success('Cliente excluído', 'O cliente foi removido com sucesso.');
    } catch (err) {
      showError('Erro ao excluir cliente', 'Tente novamente.');
      console.error('Erro ao excluir cliente:', err);
    }
  }, [isSeller, confirm, loadClients, success, showError]);

  const handleSaveClient = (client: Client) => {
    loadClients();
    setShowModal(false);
  };

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
            <Search size={20} aria-hidden />
            <SearchInput 
              id="clients-search"
              aria-label="Pesquisar clientes por nome, razão social ou email"
              placeholder="Pesquisar clientes (Enter ou Buscar)" 
              value={searchInputValue}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
            />
            <FilterButton type="button" onClick={applySearch} disabled={loading} aria-busy={loading} aria-label={loading ? 'Buscando clientes' : 'Executar busca'} style={{ marginLeft: '0.5rem', minWidth: loading ? 130 : undefined }}>
              {loading ? <><Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} /> Buscando...</> : 'Buscar'}
            </FilterButton>
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
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : clients.length === 0 ? (
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
                {!isSeller && <TableCell>Vendedor (carteira)</TableCell>}
                <TableCell>Status</TableCell>
                {!isSeller && (<TableCell>Ações</TableCell>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <ClientRow
                  key={client._id}
                  client={client}
                  isSeller={!!isSeller}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />
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
