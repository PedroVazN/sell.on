import React, { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Loader2, Settings } from 'lucide-react';
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
} from './styles';
import { useAuth } from '../../contexts/AuthContext';
import type { Opportunity } from '../../types/funnel';
import { formatCurrency } from '../../utils/formatters';

function FunnelPageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const {
    stages,
    opportunities,
    viewMode,
    loading,
    error,
    setViewMode,
    fetchAll,
  } = useFunnel();
  const [selectedDeal, setSelectedDeal] = useState<Opportunity | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

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

  return (
    <Container>
      <Header>
        <Title>Funil de Vendas</Title>
        <Toolbar>
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

      {error && <ErrorState>{error}</ErrorState>}

      {loading && !opportunities.length ? (
        <LoadingState>
          <Loader2 size={32} className="spin" /> Carregando funil...
        </LoadingState>
      ) : viewMode === 'kanban' ? (
        <Board>
          {stages
            .filter((s) => !s.isWon && !s.isLost)
            .map((stage) => (
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
              Nenhuma oportunidade em aberto. Crie uma nova oportunidade para começar.
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

      {selectedDeal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedDeal(null)}>
          <div style={{ background: '#1f2937', padding: 24, borderRadius: 12, maxWidth: 480, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedDeal.title}</h3>
            <p>Cliente: {selectedDeal.client?.razaoSocial || selectedDeal.client?.nomeFantasia}</p>
            <p>Valor: {formatCurrency(selectedDeal.estimated_value)}</p>
            <p>Estágio: {(selectedDeal.stage as { name?: string })?.name}</p>
            <button type="button" onClick={() => setSelectedDeal(null)}>Fechar</button>
          </div>
        </div>
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
