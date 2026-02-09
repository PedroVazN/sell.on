import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Loader2, Plus, Search, Settings, X } from 'lucide-react';
import { useFunnel } from '../../contexts/FunnelContext';
import { FunnelProvider } from '../../contexts/FunnelContext';
import {
  Container,
  Header,
  Title,
  Toolbar,
  ViewToggle,
  Board,
  Column,
  ColumnHeader,
  ColumnTitle,
  ColumnCount,
  CardsArea,
  Card,
  CardTitle,
  CardMeta,
  ListTable,
  ListHeader,
  ListRow,
  EmptyState,
  LoadingState,
  ErrorState,
  FilterBar,
  FilterInput,
  FilterSelect,
  BtnPrimary,
  BtnSecondary,
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalSubtitle,
  FormRow,
  FormGrid,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  ModalActions,
} from './styles';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import type { Opportunity } from '../../types/funnel';
import type { Client } from '../../services/api';
import type { User } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const LEAD_SOURCES = ['', 'site', 'indicacao', 'evento', 'whatsapp', 'telefone', 'email', 'outro'];

function FunnelPageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const {
    stages,
    opportunities,
    lossReasons,
    filters,
    viewMode,
    loading,
    error,
    setFilters,
    setViewMode,
    fetchAll,
    fetchOpportunities,
    createDeal,
    updateDeal,
    moveDeal,
    markWon,
    markLost,
    convertToSale,
    getOpportunityById,
    addActivity,
  } = useFunnel();

  const [selectedDeal, setSelectedDeal] = useState<Opportunity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [detailFull, setDetailFull] = useState<Opportunity | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [convertCustomerId, setConvertCustomerId] = useState('');
  const [lossReasonId, setLossReasonId] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state for create
  const [formClientId, setFormClientId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formProbability, setFormProbability] = useState(50);
  const [formDate, setFormDate] = useState('');
  const [formLeadSource, setFormLeadSource] = useState('');
  const [formResponsibleId, setFormResponsibleId] = useState(user?.role === 'vendedor' ? (user as User)._id : '');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (isAdmin) apiService.getUsers(1, 100).then((r) => r.data && setUsers(r.data));
  }, [isAdmin]);

  useEffect(() => {
    if (showCreateModal) {
      apiService.getClients(1, 100).then((r) => r.data && setClients(r.data));
      if (isAdmin) apiService.getUsers(1, 100).then((r) => r.data && setUsers(r.data));
      const firstStage = stages.find((s) => !s.isWon && !s.isLost);
      if (firstStage && !formResponsibleId && user) setFormResponsibleId((user as User)._id);
    }
  }, [showCreateModal, isAdmin, stages, user]);

  useEffect(() => {
    if (selectedDeal && !showCreateModal) {
      getOpportunityById(selectedDeal._id).then(setDetailFull);
    } else {
      setDetailFull(null);
    }
  }, [selectedDeal?._id, showCreateModal]);

  const opportunitiesByStage = useMemo(() => {
    const onlyOpen = opportunities.filter((o) => o.status === 'open');
    const map: Record<string, Opportunity[]> = {};
    stages.forEach((s) => (map[s._id] = []));
    onlyOpen.forEach((o) => {
      const sid = typeof o.stage === 'object' && o.stage !== null ? (o.stage as { _id: string })._id : (o.stage as string);
      if (!map[sid]) map[sid] = [];
      map[sid].push(o);
    });
    return map;
  }, [stages, opportunities]);

  const handleCreate = useCallback(async () => {
    const firstStage = stages.find((s) => !s.isWon && !s.isLost);
    if (!formClientId || !formTitle.trim() || !firstStage) return;
    const value = parseFloat(formValue);
    if (isNaN(value) || value < 0) return;
    setSaving(true);
    try {
      const created = await createDeal({
        client_id: formClientId,
        stage_id: firstStage._id,
        title: formTitle.trim(),
        estimated_value: value,
        win_probability: formProbability,
        expected_close_date: formDate || undefined,
        lead_source: formLeadSource || undefined,
        description: formDescription || undefined,
        responsible_user_id: formResponsibleId || undefined,
      });
      if (created) {
        setShowCreateModal(false);
        setFormClientId('');
        setFormTitle('');
        setFormValue('');
        setFormProbability(50);
        setFormDate('');
        setFormLeadSource('');
        setFormDescription('');
        fetchOpportunities();
      }
    } finally {
      setSaving(false);
    }
  }, [formClientId, formTitle, formValue, formProbability, formDate, formLeadSource, formDescription, formResponsibleId, stages, createDeal, fetchOpportunities]);

  const handleMoveStage = useCallback(
    async (oppId: string, stageId: string) => {
      try {
        await moveDeal(oppId, stageId);
        if (detailFull?._id === oppId) getOpportunityById(oppId).then(setDetailFull);
      } catch {
        //
      }
    },
    [moveDeal, detailFull, getOpportunityById]
  );

  const handleAddActivity = useCallback(
    async (oppId: string) => {
      if (!newActivityTitle.trim()) return;
      const act = await addActivity(oppId, { type: 'task', title: newActivityTitle.trim() });
      if (act) {
        setNewActivityTitle('');
        getOpportunityById(oppId).then(setDetailFull);
      }
    },
    [newActivityTitle, addActivity, getOpportunityById]
  );

  const handleMarkWon = useCallback(
    async (oppId: string) => {
      setSaving(true);
      try {
        await markWon(oppId);
        setSelectedDeal(null);
        fetchOpportunities();
      } finally {
        setSaving(false);
      }
    },
    [markWon, fetchOpportunities]
  );

  const handleMarkLost = useCallback(
    async (oppId: string) => {
      if (!lossReasonId) return;
      setSaving(true);
      try {
        await markLost(oppId, lossReasonId);
        setSelectedDeal(null);
        setLossReasonId('');
        fetchOpportunities();
      } finally {
        setSaving(false);
      }
    },
    [markLost, lossReasonId, fetchOpportunities]
  );

  const handleConvert = useCallback(
    async (oppId: string) => {
      if (!convertCustomerId) return;
      setSaving(true);
      try {
        const sale = await convertToSale(oppId, convertCustomerId);
        if (sale) {
          setSelectedDeal(null);
          setConvertCustomerId('');
          fetchOpportunities();
          window.location.href = `/sales`; // ou abrir modal de sucesso
        }
      } finally {
        setSaving(false);
      }
    },
    [convertToSale, convertCustomerId, fetchOpportunities]
  );

  const openStages = useMemo(() => stages.filter((s) => !s.isWon && !s.isLost), [stages]);
  const wonOpportunities = useMemo(() => opportunities.filter((o) => o.status === 'won'), [opportunities]);
  const lostOpportunities = useMemo(() => opportunities.filter((o) => o.status === 'lost'), [opportunities]);

  return (
    <Container>
      <Header>
        <Title>Funil de Vendas</Title>
        <Toolbar>
          <BtnPrimary onClick={() => setShowCreateModal(true)}>
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Nova oportunidade
          </BtnPrimary>
          <ViewToggle $active={viewMode === 'kanban'} onClick={() => setViewMode('kanban')}>
            <LayoutGrid size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Kanban
          </ViewToggle>
          <ViewToggle $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
            <List size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Lista
          </ViewToggle>
          {isAdmin && (
            <ViewToggle $active={false} onClick={() => {}} title="Configurar estágios (em breve)">
              <Settings size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Estágios
            </ViewToggle>
          )}
        </Toolbar>
      </Header>

      <FilterBar>
        <FilterInput
          placeholder="Buscar por nome ou empresa..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
        {isAdmin && (
          <FilterSelect
            value={filters.sellerId || ''}
            onChange={(e) => setFilters({ sellerId: e.target.value || undefined })}
          >
            <option value="">Todos os vendedores</option>
            {users.filter((u) => u.role === 'vendedor').map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </FilterSelect>
        )}
        <FilterSelect
          value={filters.stageId || ''}
          onChange={(e) => setFilters({ stageId: e.target.value || undefined })}
        >
          <option value="">Todas as etapas</option>
          {openStages.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={filters.status || ''}
          onChange={(e) => setFilters({ status: (e.target.value || undefined) as 'open' | 'won' | 'lost' | undefined })}
        >
          <option value="">Todos os status</option>
          <option value="open">Em aberto</option>
          <option value="won">Ganhas</option>
          <option value="lost">Perdidas</option>
        </FilterSelect>
        <FilterInput
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
          placeholder="De"
        />
        <FilterInput
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
          placeholder="Até"
        />
        <BtnSecondary onClick={() => fetchOpportunities()}>
          <Search size={14} style={{ marginRight: 6 }} />
          Filtrar
        </BtnSecondary>
      </FilterBar>

      {error && <ErrorState>{error}</ErrorState>}

      {loading && !opportunities.length ? (
        <LoadingState>
          <Loader2 size={32} className="spin" /> Carregando funil...
        </LoadingState>
      ) : viewMode === 'kanban' ? (
        <Board>
          {openStages.map((stage) => (
            <Column key={stage._id} $color={stage.color}>
              <ColumnHeader>
                <ColumnTitle>{stage.name}</ColumnTitle>
                <ColumnCount>{(opportunitiesByStage[stage._id] || []).length}</ColumnCount>
              </ColumnHeader>
              <CardsArea>
                {(opportunitiesByStage[stage._id] || []).map((opp) => (
                  <Card
                    key={opp._id}
                    onClick={() => setSelectedDeal(opp)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedDeal(opp)}
                  >
                    <CardTitle>{opp.title}</CardTitle>
                    <CardMeta>
                      {opp.client?.razaoSocial || opp.client?.nomeFantasia || '—'} · {formatCurrency(opp.estimated_value)}
                    </CardMeta>
                    <CardMeta>
                      {opp.win_probability}% · {opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString('pt-BR') : '—'}
                    </CardMeta>
                  </Card>
                ))}
              </CardsArea>
            </Column>
          ))}
          <Column key="won" $color="#10b981">
            <ColumnHeader>
              <ColumnTitle>Ganhas</ColumnTitle>
              <ColumnCount>{wonOpportunities.length}</ColumnCount>
            </ColumnHeader>
            <CardsArea>
              {wonOpportunities.map((opp) => (
                <Card
                  key={opp._id}
                  onClick={() => setSelectedDeal(opp)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedDeal(opp)}
                >
                  <CardTitle>{opp.title}</CardTitle>
                  <CardMeta>
                    {opp.client?.razaoSocial || opp.client?.nomeFantasia || '—'} · {formatCurrency(opp.estimated_value)}
                  </CardMeta>
                </Card>
              ))}
            </CardsArea>
          </Column>
          <Column key="lost" $color="#6b7280">
            <ColumnHeader>
              <ColumnTitle>Perdidas</ColumnTitle>
              <ColumnCount>{lostOpportunities.length}</ColumnCount>
            </ColumnHeader>
            <CardsArea>
              {lostOpportunities.map((opp) => (
                <Card
                  key={opp._id}
                  onClick={() => setSelectedDeal(opp)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedDeal(opp)}
                >
                  <CardTitle>{opp.title}</CardTitle>
                  <CardMeta>
                    {opp.client?.razaoSocial || opp.client?.nomeFantasia || '—'} · {formatCurrency(opp.estimated_value)}
                  </CardMeta>
                </Card>
              ))}
            </CardsArea>
          </Column>
        </Board>
      ) : (
        <ListTable>
          <ListHeader>
            <div>Oportunidade</div>
            <div>Valor</div>
            <div>Prob.</div>
            <div>Fechamento</div>
            <div>Responsável</div>
          </ListHeader>
          {opportunities.filter((o) => o.status === 'open').length === 0 ? (
            <EmptyState style={{ gridColumn: '1 / -1', padding: 32 }}>
              Nenhuma oportunidade em aberto. Clique em &quot;Nova oportunidade&quot; para começar.
            </EmptyState>
          ) : (
            opportunities
              .filter((o) => o.status === 'open')
              .map((opp) => (
                <ListRow key={opp._id} onClick={() => setSelectedDeal(opp)}>
                  <div>
                    <strong>{opp.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {opp.client?.razaoSocial || opp.client?.nomeFantasia || '—'}
                    </div>
                  </div>
                  <div>{formatCurrency(opp.estimated_value)}</div>
                  <div>{opp.win_probability}%</div>
                  <div>{opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString('pt-BR') : '—'}</div>
                  <div>{(opp.responsible_user as { name?: string })?.name || '—'}</div>
                </ListRow>
              ))
          )}
        </ListTable>
      )}

      {/* Modal Nova oportunidade */}
      {showCreateModal && (
        <ModalOverlay onClick={() => !saving && setShowCreateModal(false)}>
          <ModalBox $wide onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Nova oportunidade</ModalTitle>
            <ModalSubtitle>
              A nova oportunidade entra na primeira etapa do funil (ex.: Leads). Depois, clique no card e use &quot;Mover para etapa&quot; no detalhe para avançar entre Qualificação, Proposta, Negociação e Fechamento.
            </ModalSubtitle>
            <FormRow>
              <FormLabel>Cliente *</FormLabel>
              <FormSelect value={formClientId} onChange={(e) => setFormClientId(e.target.value)}>
                <option value="">Selecione o cliente</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.razaoSocial} {c.nomeFantasia ? `(${c.nomeFantasia})` : ''}
                  </option>
                ))}
              </FormSelect>
            </FormRow>
            <FormRow>
              <FormLabel>Título da oportunidade *</FormLabel>
              <FormInput value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Venda licenças - Empresa X" />
            </FormRow>
            <FormGrid>
              <FormRow>
                <FormLabel>Valor estimado (R$) *</FormLabel>
                <FormInput type="number" min={0} step={0.01} value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="0,00" />
              </FormRow>
              <FormRow>
                <FormLabel>Probabilidade de fechamento (%)</FormLabel>
                <FormInput type="number" min={0} max={100} value={formProbability} onChange={(e) => setFormProbability(Number(e.target.value) || 0)} />
              </FormRow>
            </FormGrid>
            <FormGrid>
              <FormRow>
                <FormLabel>Data prevista de fechamento</FormLabel>
                <FormInput type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </FormRow>
              <FormRow>
                <FormLabel>Origem do lead</FormLabel>
                <FormSelect value={formLeadSource} onChange={(e) => setFormLeadSource(e.target.value)}>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s || 'vazio'} value={s}>
                      {s || '—'}
                    </option>
                  ))}
                </FormSelect>
              </FormRow>
            </FormGrid>
            {isAdmin && (
              <FormRow>
                <FormLabel>Vendedor responsável</FormLabel>
                <FormSelect value={formResponsibleId} onChange={(e) => setFormResponsibleId(e.target.value)}>
                  {users.filter((u) => u.role === 'vendedor').map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </FormSelect>
              </FormRow>
            )}
            <FormRow>
              <FormLabel>Observações</FormLabel>
              <FormTextarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Anotações, histórico de contato, próximos passos..." />
            </FormRow>
            <ModalActions>
              <BtnSecondary onClick={() => !saving && setShowCreateModal(false)}>Cancelar</BtnSecondary>
              <BtnPrimary onClick={handleCreate} disabled={saving || !formClientId || !formTitle.trim()}>
                {saving ? 'Salvando...' : 'Criar oportunidade'}
              </BtnPrimary>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Modal Detalhe da oportunidade */}
      {selectedDeal && detailFull && (
        <ModalOverlay onClick={() => setSelectedDeal(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <ModalTitle style={{ margin: 0 }}>{detailFull.title}</ModalTitle>
              <button type="button" onClick={() => setSelectedDeal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <strong>Cliente:</strong> {detailFull.client?.razaoSocial || detailFull.client?.nomeFantasia || '—'}
              {detailFull.client?.contato && (
                <>
                  <br />
                  {detailFull.client.contato.telefone} · {detailFull.client.contato.email}
                </>
              )}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
              <strong>Valor:</strong> {formatCurrency(detailFull.estimated_value)} · <strong>Prob.:</strong> {detailFull.win_probability}% · <strong>Fechamento previsto:</strong>{' '}
              {detailFull.expected_close_date ? new Date(detailFull.expected_close_date).toLocaleDateString('pt-BR') : '—'}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
              <strong>Origem:</strong> {detailFull.lead_source || '—'} · <strong>Responsável:</strong> {(detailFull.responsible_user as { name?: string })?.name || '—'}
            </p>
            {detailFull.description && (
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Observações:</strong> {detailFull.description}
              </p>
            )}

            <FormRow>
              <FormLabel>Mover para etapa</FormLabel>
              <FilterSelect
                value={(detailFull.stage as { _id?: string })?._id || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) handleMoveStage(detailFull._id, id);
                }}
              >
                {openStages.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </FilterSelect>
            </FormRow>

            <FormRow>
              <FormLabel>Atividades / Follow-ups</FormLabel>
              {detailFull.activities && detailFull.activities.length > 0 ? (
                <ul style={{ margin: '0 0 8px', paddingLeft: 20, fontSize: '0.875rem' }}>
                  {detailFull.activities.map((a) => (
                    <li key={a._id}>
                      {a.title} {a.due_at ? ` (${new Date(a.due_at).toLocaleDateString('pt-BR')})` : ''} {a.completed_at ? ' ✓' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma atividade.</span>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <FilterInput
                  placeholder="Nova tarefa..."
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActivity(detailFull._id)}
                />
                <BtnSecondary onClick={() => handleAddActivity(detailFull._id)} disabled={!newActivityTitle.trim()}>
                  Adicionar
                </BtnSecondary>
              </div>
            </FormRow>

            {detailFull.status === 'open' && (
              <>
                <ModalActions style={{ marginTop: 16 }}>
                  <BtnPrimary onClick={() => handleMarkWon(detailFull._id)} disabled={saving}>
                    {saving ? '...' : 'Marcar como ganha'}
                  </BtnPrimary>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FilterSelect value={lossReasonId} onChange={(e) => setLossReasonId(e.target.value)} style={{ minWidth: 180 }}>
                      <option value="">Motivo perda</option>
                      {lossReasons.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </FilterSelect>
                    <BtnSecondary onClick={() => lossReasonId && handleMarkLost(detailFull._id)} disabled={saving || !lossReasonId}>
                      Marcar perdida
                    </BtnSecondary>
                  </div>
                </ModalActions>
                <FormRow style={{ marginTop: 12 }}>
                  <FormLabel>Converter em venda</FormLabel>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FilterSelect value={convertCustomerId} onChange={(e) => setConvertCustomerId(e.target.value)} style={{ minWidth: 200 }}>
                      <option value="">Cliente (usuário) para a venda</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </FilterSelect>
                    <BtnPrimary onClick={() => handleConvert(detailFull._id)} disabled={saving || !convertCustomerId}>
                      Converter em venda
                    </BtnPrimary>
                  </div>
                </FormRow>
              </>
            )}
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default function FunnelPage() {
  return (
    <FunnelProvider>
      <FunnelPageContent />
    </FunnelProvider>
  );
}
