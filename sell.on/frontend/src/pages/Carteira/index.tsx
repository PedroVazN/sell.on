import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Search, Edit, Loader2, UserPlus, X } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import type { User } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { ClientModal } from '../../components/ClientModal';
import { TableSkeleton } from '../../components/TableSkeleton';
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
  TransferButton,
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalClose,
  ModalBody,
  SelectAllRow,
  SelectAllBtn,
  TransferList,
  TransferListItem,
  TransferSelect,
  ModalFooter,
  ModalCancel,
  ModalConfirm,
} from './styles';

const ITEMS_PER_PAGE = 10;

export const Carteira: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToastContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<{ totalClients: number; activeClients: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferClientsList, setTransferClientsList] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sellers, setSellers] = useState<User[]>([]);
  const [targetSellerId, setTargetSellerId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [loadingTransferList, setLoadingTransferList] = useState(false);

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

  const openTransferModal = useCallback(async () => {
    setShowTransferModal(true);
    setSelectedIds(new Set());
    setTargetSellerId('');
    setLoadingTransferList(true);
    try {
      const [clientsRes, usersRes] = await Promise.all([
        apiService.getClients(1, 5000, undefined, undefined, undefined, undefined, 'me'),
        apiService.getUsers(1, 200, '', 'vendedor')
      ]);
      setTransferClientsList(clientsRes.data || []);
      const list = (usersRes.data || []).filter((u) => u._id !== user?._id);
      setSellers(list);
      if (list.length > 0 && !targetSellerId) setTargetSellerId(list[0]._id);
    } catch (e) {
      toastError('Erro', 'Não foi possível carregar a lista para transferência.');
      setShowTransferModal(false);
    } finally {
      setLoadingTransferList(false);
    }
  }, [user?._id, toastError]);

  const toggleSelectAll = () => {
    if (selectedIds.size === transferClientsList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transferClientsList.map((c) => c._id)));
    }
  };

  const toggleClient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTransfer = async () => {
    if (selectedIds.size === 0 || !targetSellerId) {
      toastError('Campos obrigatórios', 'Selecione ao menos um cliente e o vendedor de destino.');
      return;
    }
    setTransferLoading(true);
    try {
      const res = await apiService.transferClients(Array.from(selectedIds), targetSellerId);
      if (res.success) {
        toastSuccess('Transferência concluída', res.message || 'Clientes transferidos.');
        setShowTransferModal(false);
        loadClients();
        loadStats();
      } else {
        toastError('Erro', res.message || 'Não foi possível transferir.');
      }
    } catch (e: any) {
      toastError('Erro', e?.message || 'Não foi possível transferir.');
    } finally {
      setTransferLoading(false);
    }
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
          <TransferButton type="button" onClick={openTransferModal} title="Transferir clientes para outro vendedor">
            <UserPlus size={18} />
            Transferir clientes
          </TransferButton>
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
          <TableSkeleton rows={8} cols={7} />
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

      {showTransferModal && (
        <ModalOverlay onClick={() => !transferLoading && setShowTransferModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Transferir clientes</h2>
              <ModalClose type="button" onClick={() => !transferLoading && setShowTransferModal(false)} aria-label="Fechar">
                <X size={22} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {loadingTransferList ? (
                <LoadingState>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: 12 }}>Carregando clientes...</span>
                </LoadingState>
              ) : transferClientsList.length === 0 ? (
                <EmptyState>
                  <p>Nenhum cliente na sua carteira para transferir.</p>
                </EmptyState>
              ) : (
                <>
                  <SelectAllRow>
                    <SelectAllBtn type="button" onClick={toggleSelectAll}>
                      {selectedIds.size === transferClientsList.length ? 'Desmarcar todos' : 'Selecionar todos os clientes da carteira'}
                    </SelectAllBtn>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                      {selectedIds.size} de {transferClientsList.length} selecionado(s)
                    </span>
                  </SelectAllRow>
                  <TransferList>
                    {transferClientsList.map((c) => (
                      <TransferListItem key={c._id}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c._id)}
                          onChange={() => toggleClient(c._id)}
                        />
                        <span>{c.razaoSocial}</span>
                        {c.nomeFantasia && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>({c.nomeFantasia})</span>}
                      </TransferListItem>
                    ))}
                  </TransferList>
                  <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                    Transferir para o vendedor
                  </label>
                  <TransferSelect
                    value={targetSellerId}
                    onChange={(e) => setTargetSellerId(e.target.value)}
                    aria-label="Escolher vendedor de destino"
                  >
                    <option value="">Selecione o vendedor</option>
                    {sellers.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} {s.email ? `(${s.email})` : ''}</option>
                    ))}
                  </TransferSelect>
                </>
              )}
            </ModalBody>
            {!loadingTransferList && transferClientsList.length > 0 && (
              <ModalFooter>
                <ModalCancel type="button" onClick={() => setShowTransferModal(false)} disabled={transferLoading}>
                  Cancelar
                </ModalCancel>
                <ModalConfirm
                  type="button"
                  onClick={handleTransfer}
                  disabled={transferLoading || selectedIds.size === 0 || !targetSellerId}
                >
                  {transferLoading ? (
                    <>
                      <Loader2 size={18} style={{ display: 'inline', animation: 'spin 1s linear infinite', marginRight: 8 }} />
                      Transferindo...
                    </>
                  ) : (
                    'Transferir'
                  )}
                </ModalConfirm>
              </ModalFooter>
            )}
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};
