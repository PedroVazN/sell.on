import React, { useState, useEffect, useCallback } from 'react';
import { Eye, ArrowRightLeft, Loader2, X } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import type { User } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import {
  Container,
  Header,
  Title,
  Subtitle,
  StatsRow,
  StatsCard,
  Content,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  ActionButton,
  EmptyState,
  LoadingState,
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalClose,
  ModalBody,
  ModalFooter,
  ModalCancel,
  ModalConfirm,
  TransferList,
  TransferListItem,
  TransferSelect,
  SelectAllRow,
  SelectAllBtn,
  ClientList,
} from './styles';

interface CarteiraItem {
  _id: string;
  name: string;
  email: string;
  totalClients: number;
}

export const GestaoCarteiras: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToastContext();
  const [list, setList] = useState<CarteiraItem[]>([]);
  const [semCarteira, setSemCarteira] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showVerModal, setShowVerModal] = useState(false);
  const [verVendedor, setVerVendedor] = useState<CarteiraItem | null>(null);
  const [verClients, setVerClients] = useState<Client[]>([]);
  const [loadingVer, setLoadingVer] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState<CarteiraItem | null>(null);
  const [transferClientsList, setTransferClientsList] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sellers, setSellers] = useState<User[]>([]);
  const [targetSellerId, setTargetSellerId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [loadingTransferList, setLoadingTransferList] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getCarteirasSummary();
      setList(res.data || []);
      setSemCarteira((res as { semCarteira?: number }).semCarteira ?? 0);
    } catch (err) {
      setError('Erro ao carregar carteiras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const openVerModal = async (v: CarteiraItem) => {
    setVerVendedor(v);
    setShowVerModal(true);
    setVerClients([]);
    setLoadingVer(true);
    try {
      const response = await apiService.getClients(
        1,
        500,
        undefined,
        undefined,
        undefined,
        undefined,
        v._id
      );
      setVerClients(response.data || []);
    } catch {
      setVerClients([]);
    } finally {
      setLoadingVer(false);
    }
  };

  const openTransferModal = async (v: CarteiraItem) => {
    setTransferFrom(v);
    setShowTransferModal(true);
    setTransferClientsList([]);
    setSelectedIds(new Set());
    setTargetSellerId('');
    setLoadingTransferList(true);
    try {
      const [clientsRes, usersRes] = await Promise.all([
        apiService.getClients(1, 500, undefined, undefined, undefined, undefined, v._id),
        apiService.getUsers(1, 200),
      ]);
      setTransferClientsList(clientsRes.data || []);
      const vendedores = (usersRes.data || []).filter((u: User) => u.role === 'vendedor' && u._id !== v._id);
      setSellers(vendedores);
      if (vendedores.length) setTargetSellerId(vendedores[0]._id);
    } catch {
      setTransferClientsList([]);
      setSellers([]);
    } finally {
      setLoadingTransferList(false);
    }
  };

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
    if (!targetSellerId || selectedIds.size === 0) return;
    setTransferLoading(true);
    try {
      const response = await apiService.transferClients(Array.from(selectedIds), targetSellerId);
      if (response.success && response.data) {
        toastSuccess('Sucesso', response.data.message || `${response.data.modifiedCount} cliente(s) transferido(s).`);
        setShowTransferModal(false);
        setTransferFrom(null);
        loadSummary();
      } else {
        toastError('Erro', (response as { message?: string }).message || 'Falha ao transferir.');
      }
    } catch (err) {
      toastError('Erro', 'Falha ao transferir clientes.');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Gestão de Carteiras</Title>
          <Subtitle>Visualize e gerencie as carteiras de clientes por vendedor</Subtitle>
        </div>
      </Header>

      <StatsRow>
        <StatsCard>
          <p>Vendedores</p>
          <strong>{list.length}</strong>
        </StatsCard>
        <StatsCard>
          <p>Clientes sem carteira</p>
          <strong>{semCarteira}</strong>
        </StatsCard>
      </StatsRow>

      <Content>
        {loading ? (
          <LoadingState>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Carregando carteiras...</span>
          </LoadingState>
        ) : error ? (
          <EmptyState>
            <p>{error}</p>
          </EmptyState>
        ) : list.length === 0 ? (
          <EmptyState>
            <p>Nenhum vendedor cadastrado.</p>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <th>Vendedor</th>
                <th>E-mail</th>
                <th>Clientes na carteira</th>
                <th>Ações</th>
              </tr>
            </TableHeader>
            <TableBody>
              {list.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.totalClients}</TableCell>
                  <TableCell>
                    <ActionButton
                      type="button"
                      onClick={() => openVerModal(v)}
                      title="Ver clientes"
                      aria-label="Ver clientes"
                    >
                      <Eye size={16} /> Ver
                    </ActionButton>
                    <ActionButton
                      type="button"
                      onClick={() => openTransferModal(v)}
                      disabled={v.totalClients === 0}
                      title="Transferir clientes"
                      aria-label="Transferir clientes"
                    >
                      <ArrowRightLeft size={16} /> Transferir
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>

      {/* Modal Ver clientes */}
      {showVerModal && verVendedor && (
        <ModalOverlay onClick={() => setShowVerModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Clientes – {verVendedor.name}</h2>
              <ModalClose type="button" onClick={() => setShowVerModal(false)} aria-label="Fechar">
                <X size={22} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {loadingVer ? (
                <LoadingState>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Carregando...</span>
                </LoadingState>
              ) : verClients.length === 0 ? (
                <EmptyState>
                  <p>Nenhum cliente nesta carteira.</p>
                </EmptyState>
              ) : (
                <ClientList>
                  {verClients.map((c) => (
                    <li key={c._id}>
                      {c.razaoSocial}
                      {c.nomeFantasia && ` (${c.nomeFantasia})`}
                    </li>
                  ))}
                </ClientList>
              )}
            </ModalBody>
            <ModalFooter>
              <ModalCancel type="button" onClick={() => setShowVerModal(false)}>
                Fechar
              </ModalCancel>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Modal Transferir */}
      {showTransferModal && transferFrom && (
        <ModalOverlay onClick={() => !transferLoading && setShowTransferModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Transferir clientes – {transferFrom.name}</h2>
              <ModalClose
                type="button"
                onClick={() => !transferLoading && setShowTransferModal(false)}
                aria-label="Fechar"
              >
                <X size={22} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {loadingTransferList ? (
                <LoadingState>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Carregando clientes...</span>
                </LoadingState>
              ) : transferClientsList.length === 0 ? (
                <EmptyState>
                  <p>Nenhum cliente na carteira para transferir.</p>
                </EmptyState>
              ) : (
                <>
                  <SelectAllRow>
                    <SelectAllBtn type="button" onClick={toggleSelectAll}>
                      {selectedIds.size === transferClientsList.length
                        ? 'Desmarcar todos'
                        : 'Selecionar todos'}
                    </SelectAllBtn>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
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
                        <span>
                          {c.razaoSocial}
                          {c.nomeFantasia && ` (${c.nomeFantasia})`}
                        </span>
                      </TransferListItem>
                    ))}
                  </TransferList>
                  <label style={{ display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                    Transferir para o vendedor
                  </label>
                  <TransferSelect
                    value={targetSellerId}
                    onChange={(e) => setTargetSellerId(e.target.value)}
                    aria-label="Vendedor de destino"
                  >
                    <option value="">Selecione</option>
                    {sellers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.email ? `(${s.email})` : ''}
                      </option>
                    ))}
                  </TransferSelect>
                </>
              )}
            </ModalBody>
            {!loadingTransferList && transferClientsList.length > 0 && (
              <ModalFooter>
                <ModalCancel
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  disabled={transferLoading}
                >
                  Cancelar
                </ModalCancel>
                <ModalConfirm
                  type="button"
                  onClick={handleTransfer}
                  disabled={transferLoading || selectedIds.size === 0 || !targetSellerId}
                >
                  {transferLoading ? (
                    <>
                      <Loader2
                        size={18}
                        style={{ display: 'inline', animation: 'spin 1s linear infinite', marginRight: 8 }}
                      />
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
