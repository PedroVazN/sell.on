import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Goal, User } from '../../services/api';
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
import { Loader2, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Target, BarChart3, Users } from 'lucide-react';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const getSalesData = (monthlyData: Array<{month: number; year: number; revenue: number; sales?: number; totalProposals?: number; approvedProposals?: number}>) => {
  const currentYear = new Date().getFullYear();
  return monthNames.map((month, index) => {
    const monthData = monthlyData.find(d => d.month === index + 1 && d.year === currentYear);
    return {
      month,
      propostas: monthData?.totalProposals || 0,
      aprovadas: monthData?.approvedProposals || 0,
      receita: monthData?.revenue || 0
    };
  });
};

const getRevenueData = (monthlyData: Array<{month: number; year: number; revenue: number; sales?: number; totalProposals?: number; approvedProposals?: number}>) => {
  const currentYear = new Date().getFullYear();
  return monthNames.map((month, index) => {
    const monthData = monthlyData.find(d => d.month === index + 1 && d.year === currentYear);
    return {
      month,
      receita: monthData?.revenue || 0
    };
  });
};

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
        apiService.getGoals(1, 50, { assignedTo: vendedorId, status: 'active' })
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

      // Filtrar propostas pelo mês/ano selecionado
      const filteredProposals = dashboardMonth === 0
        ? vendedorProposals.filter((proposal: any) => {
            const date = new Date(proposal.createdAt);
            return date.getFullYear() === dashboardYear;
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

  // Processar dados dos gráficos considerando o filtro de mês
  const salesData = data ? (() => {
    if (dashboardMonth === 0) {
      // Todos os meses - mostrar todos os meses do ano
      const filteredMonthlyData = data.monthlyData.filter(d => d.year === dashboardYear);
      return monthNames.map((month, index) => {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return {
          month,
          propostas: monthData?.totalProposals || 0,
          aprovadas: monthData?.approvedProposals || 0,
          receita: monthData?.revenue || 0
        };
      });
    }
    // Mês específico - mostrar apenas o mês selecionado
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
      return {
        month,
        propostas: 0,
        aprovadas: 0,
        receita: 0
      };
    });
  })() : [];

  const revenueData = data ? (() => {
    if (dashboardMonth === 0) {
      // Todos os meses - mostrar todos os meses do ano
      const filteredMonthlyData = data.monthlyData.filter(d => d.year === dashboardYear);
      return monthNames.map((month, index) => {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return {
          month,
          receita: monthData?.revenue || 0
        };
      });
    }
    // Mês específico - mostrar apenas o mês selecionado
    const filteredMonthlyData = data.monthlyData.filter(d => 
      d.month === dashboardMonth && d.year === dashboardYear
    );
    return monthNames.map((month, index) => {
      if (index + 1 === dashboardMonth) {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return {
          month,
          receita: monthData?.revenue || 0
        };
      }
      return {
        month,
        receita: 0
      };
    });
  })() : [];

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
              <MetricValue>R$ {data?.proposalStats?.vendaFechadaValue?.toFixed(2) || '0,00'}</MetricValue>
              <MetricLabel>Valor Ganho</MetricLabel>
              <MetricChange>Propostas fechadas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>R$ {data?.proposalStats?.vendaPerdidaValue?.toFixed(2) || '0,00'}</MetricValue>
              <MetricLabel>Valor Perdido</MetricLabel>
              <MetricChange>Propostas perdidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>R$ {data?.proposalStats?.totalValue?.toFixed(2) || '0,00'}</MetricValue>
              <MetricLabel>Valor Propostas Geradas</MetricLabel>
              <MetricChange>Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>R$ {data?.proposalStats?.negociacaoValue?.toFixed(2) || '0,00'}</MetricValue>
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
          </MetricsGrid>

          {/* Seção de Metas */}
          {goals.length > 0 && (
            <ChartsGrid>
              <ChartCard>
                <ChartTitle>Metas Ativas - {selectedVendedor.name}</ChartTitle>
                <ChartSubtitle>Acompanhe o progresso das metas do vendedor</ChartSubtitle>
                <GoalsList>
                  {goals.slice(0, 3).map((goal) => (
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
                          {goal.currentValue} / {goal.targetValue} {goal.unit === 'currency' ? 'R$' : goal.unit}
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
                  ))}
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
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
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
                  <YAxis stroke="#A3A3A3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
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
                      backgroundColor: '#1f2937',
                      borderRadius: '8px',
                      border: '1px solid #374151'
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
                          R$ {(reason.totalValue || 0).toLocaleString('pt-BR')}
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
