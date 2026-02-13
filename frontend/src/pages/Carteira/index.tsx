import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Search, Edit, Loader2 } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ClientModal } from '../../components/ClientModal';
import {
  Container,
  Header,
  Title,
  Subtitle,
  Actions,
  SearchContainer,
  SearchInput,
  StatsCard,
  Content,
  Table,
  TableHeader,
  TableHeadCell,
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
  Ellipsis,
} from './styles';

const ITEMS_PER_PAGE = 10;

export const Carteira: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<{ totalClients: number; activeClients: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClients(
        currentPage,
        ITEMS_PER_PAGE,
        searchTerm || undefined,
        undefined,
        undefined,
        undefined,
        'me'
      );
      setClients(response.data || []);
      if (response.pagination) {
        setTotalPages(Math.max(1, Math.ceil((response.pagination.total || 0) / ITEMS_PER_PAGE)));
      }
    } catch (err) {
      setError('Erro ao carregar sua carteira de clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiService.getClientStats('me');
      if (res.data) {
        setStats({
          totalClients: res.data.totalClients ?? 0,
          activeClients: res.data.activeClients ?? 0,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSaveClient = () => {
    loadClients();
    loadStats();
    setShowModal(false);
    setEditingClient(null);
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '—';
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return cnpj;
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '—';
    const d = phone.replace(/\D/g, '');
    if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    return phone;
  };

  if (user?.role !== 'vendedor') {
    return (
      <Container>
        <Header>
          <Title>Minha Carteira</Title>
        </Header>
        <EmptyState>
          <UserCheck size={48} />
          <h3>Acesso restrito</h3>
          <p>Esta página é destinada a vendedores. Acesse com um usuário vendedor.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Minha Carteira</Title>
          <Subtitle>Clientes atribuídos à sua gestão</Subtitle>
        </div>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput
              placeholder="Buscar na carteira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </Actions>
      </Header>

      {stats !== null && (
        <StatsCard>
          <p>Total de clientes na carteira</p>
          <strong>{stats.totalClients}</strong>
          {stats.activeClients !== undefined && (
            <p style={{ marginTop: 8 }}>{stats.activeClients} ativos</p>
          )}
        </StatsCard>
      )}

      {error && <ErrorState>{error}</ErrorState>}

      <Content>
        {loading ? (
          <LoadingState>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: 12 }}>Carregando carteira...</span>
          </LoadingState>
        ) : clients.length === 0 ? (
          <EmptyState>
            <UserCheck size={48} />
            <h3>Nenhum cliente na sua carteira</h3>
            <p>Os clientes atribuídos a você pelo administrador aparecerão aqui.</p>
          </EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>Razão Social</TableHeadCell>
                  <TableHeadCell>CNPJ</TableHeadCell>
                  <TableHeadCell>Contato</TableHeadCell>
                  <TableHeadCell>UF</TableHeadCell>
                  <TableHeadCell>Classificação</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Ações</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <div>
                        <strong>{client.razaoSocial}</strong>
                        {client.nomeFantasia && (
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            {client.nomeFantasia}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCNPJ(client.cnpj)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{client.contato?.nome ?? '—'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {client.contato?.email ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {formatPhone(client.contato?.telefone ?? '')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.endereco?.uf ?? '—'}</TableCell>
                    <TableCell>{client.classificacao ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge $isActive={client.isActive ?? true}>
                        {client.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleEditClient(client)} title="Editar">
                        <Edit size={16} />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination>
                <PaginationButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </PaginationButton>
                <PaginationNumbers>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, index, arr) => {
                      const prev = arr[index - 1];
                      const showEllipsis = prev != null && page - prev > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <Ellipsis>...</Ellipsis>}
                          <PaginationNumber
                            $active={currentPage === page}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationNumber>
                        </React.Fragment>
                      );
                    })}
                </PaginationNumbers>
                <PaginationButton
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </Content>

      <ClientModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingClient(null); }}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </Container>
  );
};
