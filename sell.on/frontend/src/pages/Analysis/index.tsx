import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, RefreshCcw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
  LoadingText,
  Meta,
  SectionGrid,
  Subtitle,
  Title,
} from './styles';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatPercent = (value: number) => `${(value || 0).toFixed(1)}%`;

export const Analysis: React.FC = () => {
  const [data, setData] = useState<DataScienceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

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
      setError(err?.message || 'Erro ao carregar análise.');
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  const statusChartData = useMemo(
    () =>
      (data?.statusBreakdown || []).map((item) => ({
        status: item.status,
        propostas: item.count,
        valor: item.total,
      })),
    [data]
  );

  if (loading) {
    return (
      <Container>
        <LoadingText>Carregando análise de dados...</LoadingText>
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
      <Header>
        <div>
          <Title>Análise Data Science</Title>
          <Subtitle>Painel analítico com processamento Python</Subtitle>
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
      </CardGrid>

      <SectionGrid>
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
              <Tooltip />
              <Legend />
              <Bar dataKey="propostas" fill={data.palette?.[0] || '#3b82f6'} />
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
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="proposals" stroke={data.palette?.[1] || '#10b981'} strokeWidth={2} />
              <Line type="monotone" dataKey="won" stroke={data.palette?.[2] || '#f59e0b'} strokeWidth={2} />
              <Line type="monotone" dataKey="lost" stroke={data.palette?.[3] || '#ef4444'} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Top Vendedores (conversão)</ChartTitle>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={data.topSellers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="seller" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversionRate" fill={data.palette?.[4] || '#8b5cf6'} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Top Distribuidores (receita)</ChartTitle>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={data.topDistributors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="distributor" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="revenue" fill={data.palette?.[0] || '#3b82f6'} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </SectionGrid>

      <InsightsCard>
        <ChartTitle>Insights Automáticos</ChartTitle>
        {data.insights.map((insight, index) => (
          <InsightText key={`${insight}-${index}`}>- {insight}</InsightText>
        ))}
      </InsightsCard>
    </Container>
  );
};
