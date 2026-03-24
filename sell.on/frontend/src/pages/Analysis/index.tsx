import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, RefreshCcw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DataScienceAnalysis, apiService } from '../../services/api';
import {
  ActionButton,
  Actions,
  Card,
  CardGrid,
  CardLabel,
  CardValue,
  ChartCard,
  ChartTitle,
  Container,
  ErrorText,
  EngineBadge,
  Header,
  InsightsCard,
  InsightText,
  LoaderElapsed,
  LoaderPanel,
  LoaderProgressFill,
  LoaderProgressTrack,
  LoaderShimmer,
  LoaderSub,
  LoaderTitle,
  Meta,
  SectionGrid,
  ChartsBlockingOverlay,
  ChartSkeletonCard,
  ChartSkeletonBar,
  ChartSkeletonBlock,
  Subtitle,
  Title,
} from './styles';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatPercent = (value: number) => `${(value || 0).toFixed(1)}%`;
const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value || 0);

function loadPhaseMessage(elapsedSec: number): string {
  if (elapsedSec < 3) return 'Conectando ao servidor...';
  if (elapsedSec < 10) return 'Buscando propostas e totais da base...';
  if (elapsedSec < 25) return 'Enviando dados para o motor de análise...';
  return 'Calculando métricas e agregações (cold start do Python no Render pode levar até ~1 min).';
}

/** Barra de progresso suave até ~92% — o restante só ao receber a resposta. */
function loadProgressPercent(elapsedSec: number): number {
  return Math.min(92, 6 + (1 - Math.exp(-elapsedSec / 18)) * 78);
}

function estimateRemainingLabel(elapsedSec: number): string | null {
  if (elapsedSec < 2) return 'Estimativa: ~15–60 s (primeira vez costuma ser mais lento).';
  if (elapsedSec < 20) {
    const r = Math.max(8, 48 - elapsedSec);
    return `Faltam cerca de ${r} s (estimativa; depende do servidor).`;
  }
  if (elapsedSec < 55) {
    const r = Math.max(5, 72 - elapsedSec);
    return `Faltam cerca de ${r} s se o serviço Python estiver em cold start.`;
  }
  if (elapsedSec < 120) return 'Ainda dentro do tempo esperado para análise pesada. Quase lá.';
  return null;
}

const STAGE_SHORT: Record<string, string> = {
  negociacao: 'Negociação',
  aguardando_pagamento: 'Aguard. pag.',
  venda_fechada: 'Ganha',
  venda_perdida: 'Perdida',
  expirada: 'Expirada',
};

function shortStage(key: string) {
  return STAGE_SHORT[key] || key;
}

export const Analysis: React.FC = () => {
  const [data, setData] = useState<DataScienceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [chartsReady, setChartsReady] = useState(false);

  const loadDashboard = useCallback(async (force = false) => {
    try {
      setError(null);
      setLoading(!force);
      setRecalculating(force);

      const response = force
        ? await apiService.recalculateDataScienceAnalysis()
        : await apiService.getDataScienceAnalysis(false);

      if (response.success && response.data) {
        setData(response.data);
        setCached(!!response.cached);
      } else {
        setError('Não foi possível carregar a análise.');
      }
    } catch (err: any) {
      const msg = err?.name === 'AbortError' ? 'Tempo limite da análise (120s). Tente novamente.' : err?.message;
      setError(msg || 'Erro ao carregar análise.');
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  useEffect(() => {
    const busy = loading || recalculating;
    if (!busy) {
      setElapsedMs(0);
      return;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => setElapsedMs(performance.now() - t0), 250);
    return () => clearInterval(id);
  }, [loading, recalculating]);

  useEffect(() => {
    if (!data) {
      setChartsReady(false);
      return;
    }
    setChartsReady(false);
    const id = window.setTimeout(() => setChartsReady(true), 48);
    return () => clearTimeout(id);
  }, [data]);

  const statusChartData = useMemo(
    () =>
      (data?.statusBreakdown || []).map((item) => ({
        status: item.status,
        propostas: item.count,
        valor: item.total,
      })),
    [data]
  );

  const monthlySmart = useMemo(() => {
    const trend = data?.monthlyTrend || [];
    const latest = trend.length ? trend[trend.length - 1] : null;
    const previous = trend.length > 1 ? trend[trend.length - 2] : null;

    const revenueDeltaPct = latest && previous && previous.revenue > 0
      ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
      : 0;
    const proposalDeltaPct = latest && previous && previous.proposals > 0
      ? ((latest.proposals - previous.proposals) / previous.proposals) * 100
      : 0;
    const monthWinRate = latest && latest.proposals > 0 ? (latest.won / latest.proposals) * 100 : 0;

    return { latest, previous, revenueDeltaPct, proposalDeltaPct, monthWinRate };
  }, [data]);

  const pipelineSmart = useMemo(() => {
    const breakdown = data?.statusBreakdown || [];
    const total = data?.summary.totalProposals || 0;
    const open = breakdown.find((s) => s.status === 'Em negociacao')?.count || 0;
    const closedWon = breakdown.find((s) => s.status === 'Ganhas')?.count || 0;
    const openRate = total > 0 ? (open / total) * 100 : 0;
    const closeRate = total > 0 ? (closedWon / total) * 100 : 0;
    return { openRate, closeRate };
  }, [data]);

  const concentrationSmart = useMemo(() => {
    const sellers = data?.topSellers || [];
    const distributors = data?.topDistributors || [];
    const totalSellerRevenue = sellers.reduce((acc, s) => acc + (s.revenue || 0), 0);
    const sellerShare = totalSellerRevenue > 0 ? ((sellers[0]?.revenue || 0) / totalSellerRevenue) * 100 : 0;
    const totalDistRevenue = distributors.reduce((acc, d) => acc + (d.revenue || 0), 0);
    const distShare = totalDistRevenue > 0 ? ((distributors[0]?.revenue || 0) / totalDistRevenue) * 100 : 0;
    return { sellerShare, distShare };
  }, [data]);

  const smartInsights = useMemo(() => {
    const insights: string[] = [];
    if (monthlySmart.latest) {
      insights.push(
        `Mês ${monthlySmart.latest.month}: ${monthlySmart.latest.proposals} propostas e receita de ${formatCurrency(monthlySmart.latest.revenue)}.`
      );
      insights.push(
        `Variação mensal: ${formatPercent(monthlySmart.revenueDeltaPct)} em receita e ${formatPercent(monthlySmart.proposalDeltaPct)} em volume de propostas.`
      );
    }
    if (pipelineSmart.openRate > 45) insights.push(`Pipeline com ${formatPercent(pipelineSmart.openRate)} em negociação: bom potencial de fechamento com follow-up ativo.`);
    if (concentrationSmart.sellerShare > 45) insights.push(`Alta concentração: principal vendedor representa ${formatPercent(concentrationSmart.sellerShare)} da receita dos top sellers.`);
    if (concentrationSmart.distShare > 45) insights.push(`Dependência de distribuidor: principal parceiro concentra ${formatPercent(concentrationSmart.distShare)} da receita dos top distribuidores.`);
    return insights;
  }, [monthlySmart, pipelineSmart, concentrationSmart]);

  const transitionChart = useMemo(
    () =>
      (data?.funnelTransitions || []).map((t) => ({
        name: `${shortStage(t.fromStage)} → ${shortStage(t.toStage)}`,
        rate: t.transitionRate,
      })),
    [data]
  );

  const segmentPie = useMemo(
    () =>
      (data?.clientSegments || []).map((s) => ({
        name: `Cluster ${s.segment}`,
        value: Math.max(0, s.totalRevenue),
        clients: s.clients,
      })),
    [data]
  );

  const topClientsChart = useMemo(
    () =>
      (data?.topClients || []).map((c) => ({
        name: c.clientName.length > 22 ? `${c.clientName.slice(0, 20)}…` : c.clientName,
        receita: c.revenue,
        propostas: c.proposals,
      })),
    [data]
  );

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '10px',
      color: '#e2e8f0',
    },
    labelStyle: { color: '#f8fafc', fontWeight: 700 },
    itemStyle: { color: '#cbd5e1' },
  };

  const elapsedSec = elapsedMs / 1000;
  const loadHint = loadPhaseMessage(elapsedSec);
  const loadPct = loadProgressPercent(elapsedSec);
  const etaText = estimateRemainingLabel(elapsedSec);

  if (loading) {
    return (
      <Container>
        <LoaderPanel>
          <LoaderTitle>
            <Loader2
              size={22}
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: 8,
                animation: 'analysis-spin 0.9s linear infinite',
              }}
            />
            Carregando análise Data Science
          </LoaderTitle>
          <LoaderSub>{loadHint}</LoaderSub>
          <LoaderElapsed>
            Tempo decorrido: {elapsedSec.toFixed(1)} s
            {etaText ? ` · ${etaText}` : ''}
          </LoaderElapsed>
          <LoaderProgressTrack>
            <LoaderProgressFill $pct={loadPct} />
          </LoaderProgressTrack>
          <LoaderShimmer />
          <LoaderSub style={{ marginTop: 16, marginBottom: 0, fontSize: '0.8rem' }}>
            Dica: após o primeiro carregamento, o cache do servidor (5 min) deixa a próxima visita bem mais rápida.
          </LoaderSub>
        </LoaderPanel>
        <style>{`@keyframes analysis-spin { to { transform: rotate(360deg); } }`}</style>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <Header>
          <div>
            <Title>Análise Data Science</Title>
            <Subtitle>Python + pandas + seaborn + matplotlib</Subtitle>
          </div>
        </Header>
        <ErrorText>{error || 'Sem dados de análise.'}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      {recalculating && (
        <ChartsBlockingOverlay>
          <LoaderPanel style={{ margin: 0 }}>
            <LoaderTitle>Recalculando análise</LoaderTitle>
            <LoaderSub>{loadPhaseMessage(elapsedSec)}</LoaderSub>
            <LoaderElapsed>Decorrido: {elapsedSec.toFixed(1)} s</LoaderElapsed>
            <LoaderProgressTrack>
              <LoaderProgressFill $pct={loadPct} />
            </LoaderProgressTrack>
            <LoaderShimmer />
          </LoaderPanel>
        </ChartsBlockingOverlay>
      )}
      <Header>
        <div>
          <Title>Análise Data Science</Title>
          <Subtitle>
            Visão expandida: funil por estágio, transições, top clientes, clusters (K-Means no Python), previsão de receita e
            probabilidade de ganho no pipeline aberto. Com motor Node alguns blocos são resumidos.
          </Subtitle>
          <Meta>
            Atualizado em {new Date(data.generatedAt).toLocaleString('pt-BR')}
            {cached ? ' (cache)' : ''}
          </Meta>
          <EngineBadge $python={data.engine === 'python'}>
            Motor: {data.engine === 'python' ? 'Python' : 'Node (fallback)'}
          </EngineBadge>
        </div>
        <Actions>
          <ActionButton onClick={() => loadDashboard(true)} disabled={recalculating}>
            <RefreshCcw size={16} />
            {recalculating ? 'Recalculando...' : 'Recalcular'}
          </ActionButton>
        </Actions>
      </Header>

      <CardGrid>
        <Card>
          <CardLabel>Total de Propostas</CardLabel>
          <CardValue>{data.summary.totalProposals}</CardValue>
        </Card>
        <Card>
          <CardLabel>Receita Fechada</CardLabel>
          <CardValue>{formatCurrency(data.summary.totalRevenueClosed)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Taxa de Ganho</CardLabel>
          <CardValue>{formatPercent(data.summary.winRate)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Taxa de Perda</CardLabel>
          <CardValue>{formatPercent(data.summary.lossRate)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Ticket Médio</CardLabel>
          <CardValue>{formatCurrency(data.summary.avgTicket)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Base Ativa</CardLabel>
          <CardValue>
            C:{data.summary.clientesAtivos} D:{data.summary.distribuidoresAtivos} V:{data.summary.vendedoresAtivos}
          </CardValue>
        </Card>
        <Card>
          <CardLabel>Receita Mês Atual</CardLabel>
          <CardValue>{monthlySmart.latest ? formatCurrency(monthlySmart.latest.revenue) : formatCurrency(0)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Win Rate do Mês</CardLabel>
          <CardValue>{formatPercent(monthlySmart.monthWinRate)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Pipeline em Negociação</CardLabel>
          <CardValue>{formatPercent(pipelineSmart.openRate)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Concentração Top Vendedor</CardLabel>
          <CardValue>{formatPercent(concentrationSmart.sellerShare)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Propostas no pipeline</CardLabel>
          <CardValue>{data.summary.pipelineOpenCount ?? '—'}</CardValue>
        </Card>
        <Card>
          <CardLabel>Valor no pipeline</CardLabel>
          <CardValue>
            {data.summary.pipelineOpenValue != null ? formatCurrency(data.summary.pipelineOpenValue) : '—'}
          </CardValue>
        </Card>
        <Card>
          <CardLabel>Tempo médio até fechar</CardLabel>
          <CardValue>
            {data.summary.avgDaysToClose != null && data.summary.avgDaysToClose !== undefined
              ? `${Number(data.summary.avgDaysToClose).toFixed(1)} dias`
              : '—'}
          </CardValue>
        </Card>
        <Card>
          <CardLabel>Previsão receita (próx. mês)</CardLabel>
          <CardValue>
            {data.predictive?.forecast?.ok && data.predictive.forecast.nextMonthRevenue != null
              ? formatCurrency(data.predictive.forecast.nextMonthRevenue)
              : '—'}
          </CardValue>
        </Card>
        {data.engine === 'python' && (
          <Card>
            <CardLabel>Modelos (AUC teste)</CardLabel>
            <CardValue style={{ fontSize: '1.05rem' }}>
              LR {data.predictive?.winModel?.rocAucLr ?? '—'} · RF {data.predictive?.winModel?.rocAucRf ?? '—'}
            </CardValue>
          </Card>
        )}
      </CardGrid>

      <SectionGrid>
        {!chartsReady ? (
          <>
            {Array.from({ length: 11 }, (_, k) => k).map((k) => (
              <ChartSkeletonCard key={k}>
                <ChartSkeletonBar $w="55%" />
                <ChartSkeletonBlock />
              </ChartSkeletonCard>
            ))}
          </>
        ) : (
          <>
            <ChartCard>
              <ChartTitle>
                <BarChart3 size={18} />
                Status das Propostas
              </ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number, name: string) =>
                      name === 'valor' ? [formatCurrency(Number(value)), 'Valor'] : [value, 'Propostas']
                    }
                  />
                  <Legend />
                  <Bar dataKey="propostas" fill={data.palette?.[0] || '#3b82f6'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Funil por estágio (volume)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={data.funnelStages || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar dataKey="count" name="Propostas" fill={data.palette?.[1] || '#10b981'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Transição entre estágios (heurística %)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={transitionChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-22} textAnchor="end" height={72} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Taxa']} />
                  <Legend />
                  <Bar dataKey="rate" name="Taxa" fill={data.palette?.[3] || '#ef4444'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Tendência Mensal (12 meses)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <LineChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="proposals" stroke={data.palette?.[1] || '#10b981'} strokeWidth={2} />
                  <Line type="monotone" dataKey="won" stroke={data.palette?.[2] || '#f59e0b'} strokeWidth={2} />
                  <Line type="monotone" dataKey="lost" stroke={data.palette?.[3] || '#ef4444'} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Top clientes (receita fechada)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={topClientsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={78} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number, name: string) =>
                      name === 'receita' ? [formatCurrency(Number(value)), 'Receita'] : [value, 'Propostas']
                    }
                  />
                  <Legend />
                  <Bar dataKey="receita" name="receita" fill={data.palette?.[2] || '#f59e0b'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Segmentação de clientes (K-Means — receita)</ChartTitle>
              {segmentPie.length === 0 ? (
                <InsightText style={{ marginTop: 80 }}>
                  Clusters aparecem com o motor Python e volume suficiente de clientes distintos nas propostas.
                </InsightText>
              ) : (
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={segmentPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, clients }) => `${name} (${clients})`}
                    >
                      {segmentPie.map((_, i) => (
                        <Cell key={`seg-${i}`} fill={data.palette?.[i % (data.palette?.length || 1)] || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number, _n: string, item: { payload?: { clients?: number } }) => [
                        `${formatCurrency(Number(value))} · ${item?.payload?.clients ?? 0} clientes`,
                        'Receita no cluster',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard>
              <ChartTitle>Top vendedores — conversão %</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={data.topSellers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="seller" interval={0} angle={-22} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Conversão']} />
                  <Legend />
                  <Bar dataKey="conversionRate" fill={data.palette?.[4] || '#8b5cf6'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Top vendedores — receita + score eficiência</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={data.topSellers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="seller" interval={0} angle={-22} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number, name: string) =>
                      name === 'revenue' ? [formatCurrency(Number(value)), 'Receita'] : [`${Number(value).toFixed(1)}`, 'Eficiência']
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="revenue" fill={data.palette?.[0] || '#3b82f6'} />
                  <Bar yAxisId="right" dataKey="efficiencyScore" name="efficiencyScore" fill={data.palette?.[1] || '#10b981'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Top distribuidores (receita)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={data.topDistributors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="distributor" />
                  <YAxis />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [formatCurrency(Number(value)), 'Receita']} />
                  <Legend />
                  <Bar dataKey="revenue" fill={data.palette?.[0] || '#3b82f6'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Receita mensal (barras)</ChartTitle>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number) => [formatCurrency(Number(value)), 'Receita']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill={data.palette?.[2] || '#f59e0b'} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Pipeline aberto — probabilidade estimada de ganho (Python)</ChartTitle>
              {(data.predictive?.pipelineScores || []).length === 0 ? (
                <InsightText style={{ marginTop: 80 }}>
                  {data.engine === 'python'
                    ? data.predictive?.winModel?.message ||
                      'Poucas propostas fechadas para treinar o modelo, ou nenhuma proposta aberta no pipeline.'
                    : 'Probabilidade por proposta requer o motor Python (RandomForest + regressão logística).'}
                </InsightText>
              ) : (
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={data.predictive?.pipelineScores || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" height={88} tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number, name: string, props: { payload?: { value?: number } }) =>
                        name === 'probPct'
                          ? [`${Number(value).toFixed(1)}%`, 'Prob. ganho']
                          : [formatCurrency(Number(props?.payload?.value)), 'Valor']
                      }
                    />
                    <Legend />
                    <Bar dataKey="probPct" name="probPct" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </>
        )}
      </SectionGrid>

      <InsightsCard>
        <ChartTitle>Insights Automáticos</ChartTitle>
        {data.insights.map((insight, index) => (
          <InsightText key={`${insight}-${index}`}>- {insight}</InsightText>
        ))}
        {smartInsights.map((insight, index) => (
          <InsightText key={`smart-${index}`}>- {insight}</InsightText>
        ))}
        {monthlySmart.latest && (
          <InsightText>
            - Meta sugerida: manter receita mensal acima de {formatCompactCurrency(monthlySmart.latest.revenue * 1.1)}.
          </InsightText>
        )}
      </InsightsCard>
    </Container>
  );
};
