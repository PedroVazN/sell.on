import React, { useState, useEffect, useCallback } from 'react';
import { Eye, ArrowRightLeft, Loader2, X, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { apiService, Client } from '../../services/api';
import type { User } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { TableSkeleton } from '../../components/TableSkeleton';
import { TransferClientDropdown } from '../../components/TransferClientDropdown';
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
  HeaderActions,
  BolsaoButton,
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
  const [bolsaoCount, setBolsaoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bolsaoLoading, setBolsaoLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [showVerModal, setShowVerModal] = useState(false);
  const [verVendedor, setVerVendedor] = useState<CarteiraItem | null>(null);
  const [verClients, setVerClients] = useState<Client[]>([]);
  const [loadingVer, setLoadingVer] = useState(false);

  const [showBolsaoModal, setShowBolsaoModal] = useState(false);
  const [bolsaoClients, setBolsaoClients] = useState<Client[]>([]);
  const [loadingBolsaoList, setLoadingBolsaoList] = useState(false);

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
      setBolsaoCount((res as { bolsao?: number }).bolsao ?? 0);
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

  const handleRunBolsao = async () => {
    const ok = window.confirm(
      'Atualizar carteiras agora?\n\nRegras:\n· 90 dias sem proposta → bolsão\n· Sem vendedor responsável → bolsão\n· Venda fechada permanece na carteira do vendedor'
    );
    if (!ok) return;

    setBolsaoLoading(true);
    try {
      const res = await apiService.runCarteiraBolsao(false);
      if (res.success && res.data) {
        const d = res.data;
        toastSuccess(
          'Bolsão atualizado',
          `${d.released} liberado(s) (${d.releasedInactive} inativos · ${d.releasedNoCarteira} sem carteira) · `
          + `${d.restored} devolvido(s) à carteira · `
          + `${d.keptWithSale} com venda · ${d.keptActive} ativos · ${d.scanned} analisado(s)`
        );
        await loadSummary();
      } else {
        toastError('Erro', (res as { message?: string }).message || 'Falha ao atualizar bolsão.');
      }
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Falha ao atualizar bolsão.');
    } finally {
      setBolsaoLoading(false);
    }
  };

  const handleExportClients = async () => {
    setExportLoading(true);
    try {
      await apiService.downloadClientsBaseExcel();
      toastSuccess('Exportação', 'Base de clientes baixada em Excel.');
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Falha ao exportar base de clientes.');
    } finally {
      setExportLoading(false);
    }
  };

  const openBolsaoModal = async () => {
    setShowBolsaoModal(true);
    setBolsaoClients([]);
    setLoadingBolsaoList(true);
    try {
      const response = await apiService.getClients(1, 500, undefined, undefined, undefined, undefined, undefined, true);
      setBolsaoClients(response.data || []);
    } catch {
      setBolsaoClients([]);
    } finally {
      setLoadingBolsaoList(false);
    }
  };

  const resolveSellerClientIds = useCallback(async (sellerId: string) => {
    const res = await apiService.getClients(1, 5000, undefined, undefined, undefined, undefined, sellerId);
    return (res.data || []).map((c) => c._id);
  }, []);

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
      if (response.success) {
        toastSuccess(
          'Sucesso',
          (response as { message?: string }).message || `${selectedIds.size} cliente(s) transferido(s).`
        );
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
          <Subtitle>
            Bolsão: 90 dias sem proposta ou sem vendedor responsável. Venda fechada mantém na carteira.
          </Subtitle>
        </div>
        <HeaderActions>
          <BolsaoButton type="button" onClick={handleExportClients} disabled={exportLoading}>
            {exportLoading ? <Loader2 size={16} className="spin" /> : <FileSpreadsheet size={16} />}
            Extrair base (Excel)
          </BolsaoButton>
          <BolsaoButton type="button" onClick={openBolsaoModal}>
            Ver bolsão ({bolsaoCount})
          </BolsaoButton>
          <BolsaoButton
            type="button"
            $primary
            onClick={handleRunBolsao}
            disabled={bolsaoLoading}
          >
            {bolsaoLoading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
            Atualizar carteira (bolsão)
          </BolsaoButton>
        </HeaderActions>
      </Header>

      <StatsRow>
        <StatsCard>
          <p>Vendedores</p>
          <strong>{list.length}</strong>
        </StatsCard>
        <StatsCard>
          <p>No bolsão</p>
          <strong>{bolsaoCount}</strong>
        </StatsCard>
        <StatsCard>
          <p>Sem carteira / bolsão</p>
          <strong>{semCarteira}</strong>
        </StatsCard>
      </StatsRow>

      <Content>
        {loading ? (
          <TableSkeleton rows={6} cols={4} />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <ActionButton
                        type="button"
                        onClick={() => openVerModal(v)}
                        title="Ver clientes"
                        aria-label="Ver clientes"
                      >
                        <Eye size={16} /> Ver
                      </ActionButton>
                      <TransferClientDropdown
                        compact
                        label="Transferir carteira"
                        currentOwnerId={v._id}
                        disabled={v.totalClients === 0}
                        resolveClientIds={() => resolveSellerClientIds(v._id)}
                        confirmMessage={(sellerName) =>
                          `Transferir todos os ${v.totalClients} cliente(s) de ${v.name} para ${sellerName}?`
                        }
                        onTransferred={loadSummary}
                      />
                      <ActionButton
                        type="button"
                        onClick={() => openTransferModal(v)}
                        disabled={v.totalClients === 0}
                        title="Escolher clientes específicos"
                        aria-label="Escolher clientes específicos"
                      >
                        <ArrowRightLeft size={16} /> Escolher
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>

      {showBolsaoModal && (
        <ModalOverlay onClick={() => setShowBolsaoModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Bolsão de clientes</h2>
              <ModalClose type="button" onClick={() => setShowBolsaoModal(false)} aria-label="Fechar">
                <X size={22} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              <p style={{ marginTop: 0, opacity: 0.75, fontSize: '0.85rem' }}>
                Clientes liberados (90 dias sem proposta ou sem vendedor responsável). Qualquer vendedor pode assumir ao criar proposta.
              </p>
              {loadingBolsaoList ? (
                <LoadingState>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Carregando...</span>
                </LoadingState>
              ) : bolsaoClients.length === 0 ? (
                <EmptyState>
                  <p>Nenhum cliente no bolsão.</p>
                </EmptyState>
              ) : (
                <ClientList>
                  {bolsaoClients.map((c) => (
                    <li key={c._id}>
                      {c.razaoSocial}
                      {c.cnpj ? ` · ${c.cnpj}` : ''}
                      {c.bolsaoReason ? ` · ${c.bolsaoReason}` : ''}
                    </li>
                  ))}
                </ClientList>
              )}
            </ModalBody>
            <ModalFooter>
              <ModalCancel type="button" onClick={() => setShowBolsaoModal(false)}>
                Fechar
              </ModalCancel>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

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
                      {c.cnpj ? ` · ${c.cnpj}` : ''}
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

      {showTransferModal && transferFrom && (
        <ModalOverlay onClick={() => setShowTransferModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Transferir de {transferFrom.name}</h2>
              <ModalClose type="button" onClick={() => setShowTransferModal(false)} aria-label="Fechar">
                <X size={22} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {loadingTransferList ? (
                <LoadingState>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Carregando...</span>
                </LoadingState>
              ) : transferClientsList.length === 0 ? (
                <EmptyState>
                  <p>Nenhum cliente na carteira para transferir.</p>
                </EmptyState>
              ) : (
                <>
                  <SelectAllRow>
                    <SelectAllBtn type="button" onClick={toggleSelectAll}>
                      {selectedIds.size === transferClientsList.length ? 'Desmarcar todos' : 'Selecionar todos os clientes da carteira'}
                    </SelectAllBtn>
                  </SelectAllRow>
                  <TransferList>
                    {transferClientsList.map((c) => (
                      <TransferListItem key={c._id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(c._id)}
                            onChange={() => toggleClient(c._id)}
                          />
                          <span>{c.razaoSocial}{c.cnpj ? ` · ${c.cnpj}` : ''}</span>
                        </label>
                      </TransferListItem>
                    ))}
                  </TransferList>
                  <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="target-seller" style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>
                      Transferir para
                    </label>
                    <TransferSelect
                      id="target-seller"
                      value={targetSellerId}
                      onChange={(e) => setTargetSellerId(e.target.value)}
                    >
                      {sellers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </TransferSelect>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <ModalCancel type="button" onClick={() => setShowTransferModal(false)}>
                Cancelar
              </ModalCancel>
              <ModalConfirm
                type="button"
                onClick={handleTransfer}
                disabled={transferLoading || selectedIds.size === 0 || !targetSellerId}
              >
                {transferLoading ? 'Transferindo...' : `Transferir (${selectedIds.size})`}
              </ModalConfirm>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};
