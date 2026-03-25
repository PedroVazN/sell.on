import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Goal, User } from '../../services/api';
import { formatCurrency, formatInteger } from '../../utils/formatters';
import { 
  Container, 
  Header, 
  Title, 
  Subtitle, 
  MetricsGrid, 
  MetricCard, 
  MetricValue, 
  MetricLabel, 
  MetricChange,
  ChartsGrid,
  ChartCard,
  ChartTitle,
  ChartSubtitle,
  GoalsList,
  GoalItem,
  GoalName,
  GoalProgress,
  GoalBar,
  GoalPercentage,
  PerformanceMetrics,
  MetricItem,
  MetricItemLabel,
  MetricItemValue,
  MetricItemIcon,
  MetricItemDescription,
  MetricItemTrend,
  LoadingContainer,
  VendedorSelector,
  SelectorLabel,
  SelectorSelect,
  SelectorContainer
} from './styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp, DollarSign, AlertTriangle, Target, Users, Clock3, Percent, Briefcase, Activity } from 'lucide-react';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CHART_START_YEAR = 2025;
const CHART_START_MONTH = 10;

function getChartMonthRange(): Array<{ month: number; year: number; label: string }> {
  const now = new Date();
  const start = new Date(CHART_START_YEAR, CHART_START_MONTH - 1, 1);
  const range: Array<{ month: number; year: number; label: string }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= now) {
    range.push({
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
      label: `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return range;
}

function isDateInChartRange(date: Date): boolean {
  const start = new Date(CHART_START_YEAR, CHART_START_MONTH - 1, 1);
  const now = new Date();
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d >= start && d <= now;
}

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  salesStats: {
    totalSales: number;
    totalRevenue: number;
    averageSale: number;
    totalItems: number;
  };
  proposalStats: {
    totalProposals: number;
    totalValue: number;
    negociacaoProposals: number;
    negociacaoValue: number;
    vendaFechadaProposals: number;
    vendaFechadaValue: number;
    vendaPerdidaProposals: number;
    vendaPerdidaValue: number;
    expiradaProposals: number;
    expiradaValue: number;
  };
  topProducts: any[];
  monthlyData: Array<{month: number; year: number; totalProposals: number; approvedProposals: number; revenue: number}>;
}

interface SellerAnalysis {
  conversionRate: number;
  lossRate: number;
  avgWonTicket: number;
  avgProposalValue: number;
  pipelineValue: number;
  staleProposals: number;
  noResponseProposals: number;
  avgCloseDays: number;
  distributorStats: Array<{ name: string; proposals: number; won: number; value: number }>;
  statusBreakdown: Array<{ label: string; value: number }>;
}

const LoadingSkeleton = () => (
  <Container>
    <Header>
      <Title>Dashboard Vendedores</Title>
      <Subtitle>Carregando dados...</Subtitle>
    </Header>
    <LoadingContainer>
      <Loader2 size={32} />
      <p>Carregando dashboard...</p>
    </LoadingContainer>
  </Container>
);

export const VendedorDashboard: React.FC = () => {
  const theme = useTheme();
  const rechartsTooltipStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.background.surface,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '8px',
      color: theme.colors.text.primary,
    }),
    [theme],
  );
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [vendedores, setVendedores] = useState<User[]>([]);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string>('');
  const [selectedVendedor, setSelectedVendedor] = useState<User | null>(null);
  const [lossReasons, setLossReasons] = useState<{
    reason: string;
    label: string;
    count: number;
    totalValue: number;
  }[]>([]);
  const [analysis, setAnalysis] = useState<SellerAnalysis | null>(null);
  // Filtros de mês e ano
  const [dashboardMonth, setDashboardMonth] = useState<number | 0>(new Date().getMonth() + 1);
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());

  const loadVendedores = useCallback(async () => {
    try {
      const response = await apiService.getUsers(1, 100);
      if (response.success) {
        const vendedoresList = response.data.filter((user: User) => user.role === 'vendedor');
        setVendedores(vendedoresList);
        if (vendedoresList.length > 0) {
          setSelectedVendedorId(vendedoresList[0]._id);
          setSelectedVendedor(vendedoresList[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    }
  }, []);

  const loadDashboardData = useCallback(async (vendedorId: string) => {
    if (!vendedorId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Carregando dashboard do vendedor:', vendedorId);
      
      // Carregar dados básicos primeiro
      const [usersResponse, productsResponse, proposalsResponse] = await Promise.all([
        apiService.getUsers(1, 1),
        apiService.getProducts(1, 1),
        apiService.getProposals(1, 2000)
      ]);

      // Carregar dados específicos do vendedor
      const [vendedorProposalsResponse, lossReasonsResponse, goalsResponse] = await Promise.allSettled([
        apiService.getVendedorProposals(vendedorId, 1, 100),
        apiService.getLossReasonsStats(),
        apiService.getGoals(1, 200, { assignedTo: vendedorId })
      ]);

      // Processar resultados do Promise.allSettled
      const vendedorProposalsData = vendedorProposalsResponse.status === 'fulfilled' ? vendedorProposalsResponse.value : { success: false, data: [], stats: {} };
      const lossReasonsData = lossReasonsResponse.status === 'fulfilled' ? lossReasonsResponse.value : { success: false, data: [] };
      const goalsData = goalsResponse.status === 'fulfilled' ? goalsResponse.value : { success: false, data: [] };

      console.log('📊 Resposta completa do vendedor:', vendedorProposalsData);
      const vendedorStats = vendedorProposalsData.stats || {};
      console.log('📊 Stats do vendedor:', vendedorStats);

      // Processar dados mensais das propostas do vendedor
      let vendedorProposals = proposalsResponse.data?.filter((proposal: any) => 
        proposal.createdBy?._id === vendedorId || proposal.createdBy === vendedorId
      ) || [];

      // Filtrar propostas: "Todos os meses" = Out/2025 até hoje; senão pelo mês/ano selecionado
      const filteredProposals = dashboardMonth === 0
        ? vendedorProposals.filter((proposal: any) => {
            const created = new Date(proposal.createdAt);
            const closed = proposal.closedAt ? new Date(proposal.closedAt) : new Date(proposal.updatedAt);
            return isDateInChartRange(created) || isDateInChartRange(closed);
          })
        : vendedorProposals.filter((proposal: any) => {
            const date = new Date(proposal.createdAt);
            return date.getMonth() + 1 === dashboardMonth && date.getFullYear() === dashboardYear;
          });

      console.log('📊 Propostas filtradas do vendedor:', filteredProposals);

      // Calcular estatísticas detalhadas das propostas FILTRADAS do vendedor
      const proposalStats = filteredProposals.reduce((acc: any, proposal: any) => {
        const total = proposal.total || 0;
        
        acc.totalProposals++;
        acc.totalValue += total;
        
        switch (proposal.status) {
          case 'negociacao':
            acc.negociacaoProposals++;
            acc.negociacaoValue += total;
            break;
          case 'venda_fechada':
            acc.vendaFechadaProposals++;
            acc.vendaFechadaValue += total;
            break;
          case 'venda_perdida':
            acc.vendaPerdidaProposals++;
            acc.vendaPerdidaValue += total;
            break;
          case 'expirada':
            acc.expiradaProposals++;
            acc.expiradaValue += total;
            break;
        }
        
        return acc;
      }, {
        totalProposals: 0,
        totalValue: 0,
        negociacaoProposals: 0,
        negociacaoValue: 0,
        vendaFechadaProposals: 0,
        vendaFechadaValue: 0,
        vendaPerdidaProposals: 0,
        vendaPerdidaValue: 0,
        expiradaProposals: 0,
        expiradaValue: 0
      });

      const now = new Date();
      const staleThreshold = 15;
      const noResponseThreshold = 7;
      const staleProposals = filteredProposals.filter((p: any) => {
        if (p.status !== 'negociacao') return false;
        const updated = new Date(p.updatedAt || p.createdAt);
        const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= staleThreshold;
      }).length;
      const noResponseProposals = filteredProposals.filter((p: any) => {
        if (p.status !== 'negociacao') return false;
        const created = new Date(p.createdAt);
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= noResponseThreshold;
      }).length;

      const wonProposals = filteredProposals.filter((p: any) => p.status === 'venda_fechada');
      const closedProposals = filteredProposals.filter((p: any) => p.status === 'venda_fechada' || p.status === 'venda_perdida');
      const avgCloseDays = closedProposals.length > 0
        ? closedProposals.reduce((sum: number, p: any) => {
            const start = new Date(p.createdAt);
            const end = new Date(p.closedAt || p.updatedAt || p.createdAt);
            const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            return sum + days;
          }, 0) / closedProposals.length
        : 0;

      const byDistributorMap: Record<string, { name: string; proposals: number; won: number; value: number }> = {};
      filteredProposals.forEach((p: any) => {
        const key = p.distributor?._id || p.distributor?.razaoSocial || p.distributor?.apelido || 'sem-distribuidor';
        if (!byDistributorMap[key]) {
          byDistributorMap[key] = {
            name: p.distributor?.apelido || p.distributor?.razaoSocial || 'Não informado',
            proposals: 0,
            won: 0,
            value: 0,
          };
        }
        byDistributorMap[key].proposals += 1;
        if (p.status === 'venda_fechada') byDistributorMap[key].won += 1;
        byDistributorMap[key].value += p.total || 0;
      });

      const statusBreakdown = [
        { label: 'Negociação', value: proposalStats.negociacaoProposals },
        { label: 'Ganhas', value: proposalStats.vendaFechadaProposals },
        { label: 'Perdidas', value: proposalStats.vendaPerdidaProposals },
        { label: 'Expiradas', value: proposalStats.expiradaProposals }
      ];

      const sellerAnalysis: SellerAnalysis = {
        conversionRate: proposalStats.totalProposals > 0 ? (proposalStats.vendaFechadaProposals / proposalStats.totalProposals) * 100 : 0,
        lossRate: proposalStats.totalProposals > 0 ? (proposalStats.vendaPerdidaProposals / proposalStats.totalProposals) * 100 : 0,
        avgWonTicket: wonProposals.length > 0 ? proposalStats.vendaFechadaValue / wonProposals.length : 0,
        avgProposalValue: proposalStats.totalProposals > 0 ? proposalStats.totalValue / proposalStats.totalProposals : 0,
        pipelineValue: proposalStats.negociacaoValue,
        staleProposals,
        noResponseProposals,
        avgCloseDays,
        distributorStats: Object.values(byDistributorMap)
          .sort((a, b) => b.proposals - a.proposals)
          .slice(0, 6),
        statusBreakdown
      };

      // Agrupar propostas FILTRADAS por mês
      const monthlyProposals = filteredProposals.reduce((acc: any, proposal: any) => {
        const date = new Date(proposal.createdAt);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        if (!acc[key]) {
          acc[key] = {
            month,
            year,
            totalProposals: 0,
            approvedProposals: 0,
            revenue: 0
          };
        }
        
        acc[key].totalProposals++;
        if (proposal.status === 'venda_fechada') {
          acc[key].approvedProposals++;
          acc[key].revenue += proposal.total || 0;
        }
        
        return acc;
      }, {});

      const monthlyData = Object.values(monthlyProposals).sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      }) as Array<{month: number; year: number; totalProposals: number; approvedProposals: number; revenue: number}>;

      console.log('📊 Dados mensais do vendedor:', monthlyData);

      const dashboardData = {
        totalUsers: usersResponse.pagination?.total || 0,
        totalProducts: productsResponse.pagination?.total || 0,
        totalSales: proposalStats.totalProposals,
        totalRevenue: proposalStats.vendaFechadaValue,
        salesStats: {
          totalSales: proposalStats.vendaFechadaProposals,
          totalRevenue: proposalStats.vendaFechadaValue,
          averageSale: proposalStats.vendaFechadaProposals > 0 
            ? proposalStats.vendaFechadaValue / proposalStats.vendaFechadaProposals 
            : 0,
          totalItems: 0
        },
        proposalStats: {
          totalProposals: proposalStats.totalProposals,
          totalValue: proposalStats.totalValue,
          negociacaoProposals: proposalStats.negociacaoProposals,
          negociacaoValue: proposalStats.negociacaoValue,
          vendaFechadaProposals: proposalStats.vendaFechadaProposals,
          vendaFechadaValue: proposalStats.vendaFechadaValue,
          vendaPerdidaProposals: proposalStats.vendaPerdidaProposals,
          vendaPerdidaValue: proposalStats.vendaPerdidaValue,
          expiradaProposals: proposalStats.expiradaProposals,
          expiradaValue: proposalStats.expiradaValue
        },
        topProducts: [],
        monthlyData: monthlyData
      };
      
      console.log('📊 Dashboard data para vendedor:', dashboardData);
      setData(dashboardData);
      setLossReasons(lossReasonsData.data || []);
      setGoals(goalsData.data || []);
      setAnalysis(sellerAnalysis);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardMonth, dashboardYear]);

  const handleVendedorChange = (vendedorId: string) => {
    setSelectedVendedorId(vendedorId);
    const vendedor = vendedores.find(v => v._id === vendedorId);
    setSelectedVendedor(vendedor || null);
    if (vendedorId) {
      loadDashboardData(vendedorId);
    }
  };

  useEffect(() => {
    loadVendedores();
  }, [loadVendedores]);

  useEffect(() => {
    if (selectedVendedorId) {
      loadDashboardData(selectedVendedorId);
    }
  }, [selectedVendedorId, loadDashboardData]);

  // Gráficos: "Todos os meses" = Out/2025 até mês atual; senão só o mês selecionado
  const salesData = data ? (() => {
    if (dashboardMonth === 0) {
      const range = getChartMonthRange();
      const monthly = data.monthlyData || [];
      return range.map(({ month, year, label }) => {
        const monthData = monthly.find(d => d.month === month && d.year === year);
        return {
          month: label,
          propostas: monthData?.totalProposals || 0,
          aprovadas: monthData?.approvedProposals || 0,
          receita: monthData?.revenue || 0
        };
      });
    }
    const filteredMonthlyData = data.monthlyData.filter(d =>
      d.month === dashboardMonth && d.year === dashboardYear
    );
    return monthNames.map((month, index) => {
      if (index + 1 === dashboardMonth) {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return {
          month,
          propostas: monthData?.totalProposals || 0,
          aprovadas: monthData?.approvedProposals || 0,
          receita: monthData?.revenue || 0
        };
      }
      return { month, propostas: 0, aprovadas: 0, receita: 0 };
    });
  })() : [];

  const revenueData = data ? (() => {
    if (dashboardMonth === 0) {
      const range = getChartMonthRange();
      const monthly = data.monthlyData || [];
      return range.map(({ month, year, label }) => {
        const monthData = monthly.find(d => d.month === month && d.year === year);
        return { month: label, receita: monthData?.revenue || 0 };
      });
    }
    const filteredMonthlyData = data.monthlyData.filter(d =>
      d.month === dashboardMonth && d.year === dashboardYear
    );
    return monthNames.map((month, index) => {
      if (index + 1 === dashboardMonth) {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return { month, receita: monthData?.revenue || 0 };
      }
      return { month, receita: 0 };
    });
  })() : [];

  const statusData = analysis?.statusBreakdown || [];

  if (isLoading && !data) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Dashboard Vendedores</Title>
          <Subtitle>Erro ao carregar dados: {error}</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard Vendedores</Title>
        <Subtitle>Visualize o desempenho de cada vendedor</Subtitle>
      </Header>

      <VendedorSelector>
        <SelectorContainer>
          <SelectorLabel>Selecionar Vendedor:</SelectorLabel>
          <SelectorSelect
            value={selectedVendedorId}
            onChange={(e) => handleVendedorChange(e.target.value)}
          >
            <option value="">Selecione um vendedor</option>
            {vendedores.map(vendedor => (
              <option key={vendedor._id} value={vendedor._id}>
                {vendedor.name} ({vendedor.email})
              </option>
            ))}
          </SelectorSelect>
        </SelectorContainer>
        
        {selectedVendedor && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={dashboardMonth}
              onChange={(e) => setDashboardMonth(Number(e.target.value))}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.background = 'rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              <option value={0}>Todos os Meses</option>
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
            <select
              value={dashboardYear}
              onChange={(e) => setDashboardYear(Number(e.target.value))}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.background = 'rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              {[2023, 2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </VendedorSelector>

      {selectedVendedor && data && (
        <>
          <Header>
            <Title>Dashboard - {selectedVendedor.name}</Title>
            <Subtitle>
              Performance e métricas do vendedor - {
                dashboardMonth === 0 
                  ? `Todos os meses de ${dashboardYear}`
                  : `${monthNames[dashboardMonth - 1]} ${dashboardYear}`
              }
            </Subtitle>
          </Header>

          <MetricsGrid>
            {/* Valores */}
            <MetricCard>
              <MetricValue>{formatCurrency(data?.proposalStats?.vendaFechadaValue || 0)}</MetricValue>
              <MetricLabel>Valor Ganho</MetricLabel>
              <MetricChange>Propostas fechadas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{formatCurrency(data?.proposalStats?.vendaPerdidaValue || 0)}</MetricValue>
              <MetricLabel>Valor Perdido</MetricLabel>
              <MetricChange>Propostas perdidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{formatCurrency(data?.proposalStats?.totalValue || 0)}</MetricValue>
              <MetricLabel>Valor Propostas Geradas</MetricLabel>
              <MetricChange>Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{formatCurrency(data?.proposalStats?.negociacaoValue || 0)}</MetricValue>
              <MetricLabel>Valor Propostas em Negociação</MetricLabel>
              <MetricChange>Em andamento</MetricChange>
            </MetricCard>

            {/* Quantidades */}
            <MetricCard>
              <MetricValue>{data?.proposalStats?.vendaFechadaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Ganhas</MetricLabel>
              <MetricChange>Fechadas com sucesso</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.proposalStats?.vendaPerdidaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Perdidas</MetricLabel>
              <MetricChange>Não convertidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.proposalStats?.totalProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Geradas</MetricLabel>
              <MetricChange>Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.proposalStats?.negociacaoProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas em Negociação</MetricLabel>
              <MetricChange>Em andamento</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{analysis ? `${analysis.conversionRate.toFixed(1)}%` : '0%'}</MetricValue>
              <MetricLabel>Taxa de Conversão</MetricLabel>
              <MetricChange>Ganhas sobre total de propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{analysis ? `${analysis.lossRate.toFixed(1)}%` : '0%'}</MetricValue>
              <MetricLabel>Taxa de Perda</MetricLabel>
              <MetricChange>Perdidas sobre total de propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{formatCurrency(analysis?.avgWonTicket || 0)}</MetricValue>
              <MetricLabel>Ticket Médio Ganho</MetricLabel>
              <MetricChange>Valor médio das vendas fechadas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{analysis ? `${analysis.avgCloseDays.toFixed(1)}d` : '0d'}</MetricValue>
              <MetricLabel>Tempo Médio de Fechamento</MetricLabel>
              <MetricChange>Dias entre criação e fechamento</MetricChange>
            </MetricCard>
          </MetricsGrid>

          {/* Seção de Metas */}
          {goals.length > 0 && (
            <ChartsGrid>
              <ChartCard>
                <ChartTitle>Metas Ativas - {selectedVendedor.name}</ChartTitle>
                <ChartSubtitle>Acompanhe o progresso das metas do vendedor</ChartSubtitle>
                <GoalsList>
                  {(() => {
                    const relevant = goals.filter(g => g.status === 'active' || g.status === 'completed');
                    const achieved = relevant.filter(g => g.status === 'completed' || (g.progress?.percentage ?? 0) >= 100);
                    const ongoing = relevant.filter(g => !achieved.includes(g));

                    const showOngoing = ongoing.slice(0, 3);
                    const showAchieved = achieved.slice(0, 3);

                    return (
                      <>
                        {showOngoing.length > 0 ? (
                          showOngoing.map((goal) => (
                            <GoalItem key={goal._id}>
                              <GoalName>{goal.title}</GoalName>
                              <GoalProgress>
                                <GoalBar 
                                  $color={goal.progress.percentage >= 100 ? '#10B981' : 
                                         goal.progress.percentage >= 80 ? '#3B82F6' : 
                                         goal.progress.percentage >= 50 ? '#F59E0B' : '#EF4444'}
                                  $width={Math.min(100, goal.progress.percentage)}
                                >
                                  <div 
                                    style={{
                                      width: `${Math.min(100, goal.progress.percentage)}%`,
                                      height: '100%',
                                      backgroundColor: goal.progress.percentage >= 100 ? '#10B981' : 
                                                     goal.progress.percentage >= 80 ? '#3B82F6' : 
                                                     goal.progress.percentage >= 50 ? '#F59E0B' : '#EF4444',
                                      borderRadius: '4px',
                                      transition: 'width 0.3s ease'
                                    }}
                                  />
                                </GoalBar>
                                <GoalPercentage>
                                  {goal.progress.percentage}%
                                </GoalPercentage>
                              </GoalProgress>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginTop: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#9CA3AF'
                              }}>
                                <span>
                                  {goal.unit === 'currency'
                                    ? `${formatCurrency(goal.currentValue)} / ${formatCurrency(goal.targetValue)}`
                                    : `${goal.currentValue} / ${goal.targetValue} ${goal.unit}`}
                                </span>
                                <span style={{ 
                                  color: goal.status === 'completed' ? '#10B981' : 
                                         goal.status === 'active' ? '#3B82F6' : '#6B7280',
                                  fontWeight: '600'
                                }}>
                                  {goal.status === 'completed' ? 'Concluída' : 
                                   goal.status === 'active' ? 'Ativa' : 
                                   goal.status === 'paused' ? 'Pausada' : 'Cancelada'}
                                </span>
                              </div>
                            </GoalItem>
                          ))
                        ) : (
                          <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                            Nenhuma meta em andamento.
                          </div>
                        )}

                        {showAchieved.length > 0 && (
                          <>
                            <div style={{ 
                              margin: '0.75rem 0 0.25rem', 
                              paddingTop: '0.75rem',
                              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                              color: '#10B981',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}>
                              Metas atingidas
                            </div>
                            {showAchieved.map((goal) => (
                              <GoalItem key={goal._id}>
                                <GoalName>{goal.title}</GoalName>
                                <GoalProgress>
                                  <GoalBar $color="#10B981" $width={100}>
                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981', borderRadius: '4px' }} />
                                  </GoalBar>
                                  <GoalPercentage>100%</GoalPercentage>
                                </GoalProgress>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  marginTop: '0.5rem',
                                  fontSize: '0.875rem',
                                  color: '#9CA3AF'
                                }}>
                                  <span>
                                    {goal.unit === 'currency'
                                      ? `${formatCurrency(goal.currentValue)} / ${formatCurrency(goal.targetValue)}`
                                      : `${goal.currentValue} / ${goal.targetValue} ${goal.unit}`}
                                  </span>
                                  <span style={{ color: '#10B981', fontWeight: 700 }}>Concluída</span>
                                </div>
                              </GoalItem>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </GoalsList>
              </ChartCard>
            </ChartsGrid>
          )}

          <ChartsGrid>
            <ChartCard>
              <ChartTitle>Performance de Propostas</ChartTitle>
              <ChartSubtitle>Evolução mensal de propostas criadas e aprovadas</ChartSubtitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="month" stroke="#A3A3A3" />
                  <YAxis stroke="#A3A3A3" />
                  <Tooltip 
                    contentStyle={rechartsTooltipStyle}
                    formatter={(value: number, name: string) => [formatInteger(value), name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="propostas" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    animationDuration={1000}
                    name="Propostas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aprovadas" 
                    stroke="#EC4899" 
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                    animationDuration={1000}
                    name="Aprovadas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Valor das Propostas (R$)</ChartTitle>
              <ChartSubtitle>Evolução do valor das propostas por mês</ChartSubtitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="month" stroke="#A3A3A3" />
                  <YAxis stroke="#A3A3A3" tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={rechartsTooltipStyle}
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  />
                  <Bar 
                    dataKey="receita" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4AA" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </ChartsGrid>

          <ChartsGrid>
            <ChartCard>
              <ChartTitle>Status das Propostas</ChartTitle>
              <ChartSubtitle>Distribuição por estágio no período selecionado</ChartSubtitle>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="label" stroke="#A3A3A3" />
                  <YAxis stroke="#A3A3A3" />
                  <Tooltip
                    contentStyle={rechartsTooltipStyle}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Ranking de Distribuidores</ChartTitle>
              <ChartSubtitle>Quem mais converte com este vendedor</ChartSubtitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(analysis?.distributorStats || []).map((dist, idx) => (
                  <div
                    key={`${dist.name}-${idx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: theme.colors.background.surfaceAlt,
                      border: `1px solid ${theme.colors.border.secondary}`,
                      borderRadius: 8
                    }}
                  >
                    <div style={{ color: '#fff', fontWeight: 600 }}>{dist.name}</div>
                    <div style={{ color: '#93c5fd', fontSize: '0.85rem' }}>{dist.won}/{dist.proposals} ganhas</div>
                    <div style={{ color: '#34d399', fontSize: '0.85rem' }}>{formatCurrency(dist.value)}</div>
                  </div>
                ))}
                {(!analysis || analysis.distributorStats.length === 0) && (
                  <div style={{ color: '#9ca3af' }}>Sem dados de distribuidores no período.</div>
                )}
              </div>
            </ChartCard>
          </ChartsGrid>

          {/* Seção de Motivos de Perda */}
          {lossReasons.length > 0 && (
            <ChartsGrid>
              <ChartCard>
                <ChartTitle>Principais Motivos de Venda Perdida</ChartTitle>
                <ChartSubtitle>Análise dos motivos mais comuns de perda de vendas</ChartSubtitle>
                <div style={{ marginTop: '1rem' }}>
                  {lossReasons.slice(0, 5).map((reason, index) => (
                    <div key={reason.reason} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: theme.colors.background.surfaceAlt,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border.secondary}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : index === 2 ? '#eab308' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {reason.label}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            {reason.count} venda{reason.count !== 1 ? 's' : ''} perdida{reason.count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>
                          {formatCurrency(reason.totalValue || 0)}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          Valor perdido
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </ChartsGrid>
          )}

          <ChartsGrid>
            <ChartCard>
              <ChartTitle>Análise Total do Vendedor</ChartTitle>
              <ChartSubtitle>Pontos críticos e oportunidades de melhoria</ChartSubtitle>
              <PerformanceMetrics style={{ marginTop: 0 }}>
                <MetricItem>
                  <MetricItemIcon $color="#f59e0b">
                    <Briefcase size={20} color="#f59e0b" />
                  </MetricItemIcon>
                  <MetricItemLabel>Pipeline Atual</MetricItemLabel>
                  <MetricItemValue>{formatCurrency(analysis?.pipelineValue || 0)}</MetricItemValue>
                  <MetricItemDescription>Valor em propostas de negociação</MetricItemDescription>
                </MetricItem>
                <MetricItem>
                  <MetricItemIcon $color="#ef4444">
                    <Clock3 size={20} color="#ef4444" />
                  </MetricItemIcon>
                  <MetricItemLabel>Sem Retorno (7+ dias)</MetricItemLabel>
                  <MetricItemValue>{analysis?.noResponseProposals || 0}</MetricItemValue>
                  <MetricItemDescription>Propostas sem avanço recente</MetricItemDescription>
                </MetricItem>
                <MetricItem>
                  <MetricItemIcon $color="#fb7185">
                    <AlertTriangle size={20} color="#fb7185" />
                  </MetricItemIcon>
                  <MetricItemLabel>Negociações Estagnadas (15+ dias)</MetricItemLabel>
                  <MetricItemValue>{analysis?.staleProposals || 0}</MetricItemValue>
                  <MetricItemDescription>Necessita follow-up imediato</MetricItemDescription>
                </MetricItem>
                <MetricItem>
                  <MetricItemIcon $color="#22c55e">
                    <Percent size={20} color="#22c55e" />
                  </MetricItemIcon>
                  <MetricItemLabel>Valor Médio por Proposta</MetricItemLabel>
                  <MetricItemValue>{formatCurrency(analysis?.avgProposalValue || 0)}</MetricItemValue>
                  <MetricItemDescription>Inclui propostas ganhas, perdidas e em aberto</MetricItemDescription>
                </MetricItem>
                <MetricItem>
                  <MetricItemIcon $color="#60a5fa">
                    <Activity size={20} color="#60a5fa" />
                  </MetricItemIcon>
                  <MetricItemLabel>Produtividade do Período</MetricItemLabel>
                  <MetricItemValue>{data?.proposalStats?.totalProposals || 0}</MetricItemValue>
                  <MetricItemDescription>Total de propostas geradas no filtro atual</MetricItemDescription>
                </MetricItem>
              </PerformanceMetrics>
            </ChartCard>
          </ChartsGrid>
        </>
      )}

      {!selectedVendedor && !isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#9CA3AF'
        }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Selecione um vendedor</h3>
          <p>Escolha um vendedor no filtro acima para visualizar seu dashboard</p>
        </div>
      )}
    </Container>
  );
};
