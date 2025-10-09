import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Goal } from '../../services/api';
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
  ProductsList,
  ProductItem,
  ProductName,
  ProductSales,
  ProductRevenue,
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
  LoadingContainer
} from './styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Target, BarChart3 } from 'lucide-react';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const getSalesData = (monthlyData: Array<{month: number; year: number; revenue: number; sales?: number; totalProposals?: number; approvedProposals?: number}>) => {
  const currentYear = new Date().getFullYear();
  return monthNames.map((month, index) => {
    const monthData = monthlyData.find(d => d.month === index + 1 && d.year === currentYear);
    return {
      month,
      vendas: monthData?.sales || 0,
      receita: monthData?.revenue || 0
    };
  });
};

const getVendedorSalesData = (monthlyData: Array<{month: number; year: number; revenue: number; sales?: number; totalProposals?: number; approvedProposals?: number}>) => {
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

const topProducts = [
  { name: 'Nenhum produto vendido', sales: 0, revenue: 0 },
  { name: 'Nenhum produto vendido', sales: 0, revenue: 0 },
  { name: 'Nenhum produto vendido', sales: 0, revenue: 0 },
];

const adminGoals = [
  { name: 'Meta Individual', progress: 0, color: '#3B82F6' },
  { name: 'Meta da Equipe', progress: 0, color: '#10B981' },
  { name: 'Meta Trimestral', progress: 0, color: '#F59E0B' },
];

const vendedorGoals = [
  { name: 'Propostas Criadas', progress: 0, color: '#3B82F6' },
  { name: 'Propostas Aprovadas', progress: 0, color: '#10B981' },
  { name: 'Meta de Conversão', progress: 0, color: '#F59E0B' },
];

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
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    quantity: number;
  }>;
  monthlyData: Array<{
    month: number;
    year: number;
    revenue: number;
    sales?: number;
    totalProposals?: number;
    approvedProposals?: number;
  }>;
}

// Componente de Loading Skeleton
const LoadingSkeleton: React.FC = () => (
  <Container>
    <Header>
      <div style={{ height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '16px', animation: 'pulse 2s infinite' }} />
      <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '60%', animation: 'pulse 2s infinite' }} />
    </Header>
    <MetricsGrid>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ 
          height: '120px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '20px', 
          animation: 'pulse 2s infinite',
          animationDelay: `${i * 0.1}s`
        }} />
      ))}
    </MetricsGrid>
  </Container>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressValue, setProgressValue] = useState('');
  const [progressDescription, setProgressDescription] = useState('');
  const [lossReasons, setLossReasons] = useState<{
    reason: string;
    label: string;
    count: number;
    totalValue: number;
  }[]>([]);

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressValue(goal.currentValue.toString());
    setProgressDescription('');
    setShowProgressModal(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedGoal || !progressValue) return;

    try {
      const value = parseFloat(progressValue);
      if (isNaN(value) || value < 0) {
        alert('Valor inválido');
        return;
      }

      const response = await apiService.updateGoalProgress(
        selectedGoal._id, 
        value, 
        progressDescription || undefined
      );

      if (response.success) {
        // Atualizar a meta na lista local
        setGoals(prev => prev.map(goal => 
          goal._id === selectedGoal._id 
            ? { ...goal, currentValue: value, progress: response.data.progress }
            : goal
        ));
        setShowProgressModal(false);
        setSelectedGoal(null);
        setProgressValue('');
        setProgressDescription('');
      } else {
        alert('Erro ao atualizar progresso da meta');
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      alert('Erro ao atualizar progresso da meta');
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user?.role === 'vendedor' && user?._id) {
        // Dashboard específico para vendedor
        console.log('🔍 Carregando dashboard do vendedor:', user._id);
        console.log('🔍 User role:', user.role);
        console.log('🔍 User ID:', user._id);
        
        const [usersResponse, productsResponse, vendedorProposalsResponse, lossReasonsResponse, proposalsResponse, goalsResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getVendedorProposals(user._id, 1, 100),
          apiService.getLossReasonsStats(),
          apiService.getProposals(1, 100),
          apiService.getGoals(1, 50, { assignedTo: user._id, status: 'active' })
        ]);

        console.log('📊 Resposta completa do vendedor:', vendedorProposalsResponse);
        const vendedorStats = vendedorProposalsResponse.stats;
        console.log('📊 Stats do vendedor:', vendedorStats);

        // Processar dados mensais das propostas do vendedor
        const vendedorProposals = proposalsResponse.data?.filter((proposal: any) => 
          proposal.createdBy?._id === user._id || proposal.createdBy === user._id
        ) || [];

        console.log('📊 Propostas do vendedor:', vendedorProposals);

        // Calcular estatísticas detalhadas das propostas do vendedor
        const proposalStats = vendedorProposals.reduce((acc: any, proposal: any) => {
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

        // Agrupar propostas por mês
        const monthlyProposals = vendedorProposals.reduce((acc: any, proposal: any) => {
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
        setLossReasons(lossReasonsResponse.data || []);
        setGoals(goalsResponse.data || []);
      } else {
        // Dashboard para admin - mesmos campos do vendedor mas com dados de todos
        console.log('🔍 Carregando dashboard do admin');
        
        const [usersResponse, productsResponse, allProposalsResponse, lossReasonsResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getProposals(1, 1000), // Buscar todas as propostas
          apiService.getLossReasonsStats()
        ]);

        console.log('📊 Todas as propostas carregadas:', allProposalsResponse.data?.length);

        // Calcular estatísticas de todas as propostas (como no vendedor)
        const allProposals = allProposalsResponse.data || [];
        const proposalStats = allProposals.reduce((acc: any, proposal: any) => {
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

        // Agrupar propostas por mês (como no vendedor)
        const monthlyProposals = allProposals.reduce((acc: any, proposal: any) => {
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

        console.log('📊 Dados mensais do admin:', monthlyData);

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
        
        console.log('📊 Dashboard data para admin:', dashboardData);
        setData(dashboardData);
        setLossReasons(lossReasonsResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoizar dados dos gráficos para evitar recálculos desnecessários
  const salesData = useMemo(() => {
    if (user?.role === 'vendedor') {
      return getVendedorSalesData(data?.monthlyData || []);
    }
    return getSalesData(data?.monthlyData || []);
  }, [data?.monthlyData, user?.role]);
  
  const revenueData = useMemo(() => getRevenueData(data?.monthlyData || []), [data?.monthlyData]);

  // Debug: verificar role do usuário
  console.log('🔍 User role no dashboard:', user?.role);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Dashboard</Title>
          <Subtitle>Erro ao carregar dados: {error}</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
        <Subtitle>
          {user?.role === 'vendedor' 
            ? 'Suas propostas e performance de vendas' 
            : 'Visão geral de todas as propostas e performance da equipe'
          }
        </Subtitle>
      </Header>

      <MetricsGrid>
        {user?.role === 'vendedor' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Valores - Admin */}
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

            {/* Quantidades - Admin */}
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
          </>
        )}
      </MetricsGrid>

      {/* Seção de Metas - Apenas para vendedores */}
      {user?.role === 'vendedor' && goals.length > 0 && (
        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Suas Metas Ativas</ChartTitle>
            <ChartSubtitle>Acompanhe o progresso das suas metas</ChartSubtitle>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        color: goal.status === 'completed' ? '#10B981' : 
                               goal.status === 'active' ? '#3B82F6' : '#6B7280',
                        fontWeight: '600'
                      }}>
                        {goal.status === 'completed' ? 'Concluída' : 
                         goal.status === 'active' ? 'Ativa' : 
                         goal.status === 'paused' ? 'Pausada' : 'Cancelada'}
                      </span>
                      {goal.status === 'active' && (
                        <button
                          onClick={() => handleUpdateProgress(goal)}
                          style={{
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Atualizar
                        </button>
                      )}
                    </div>
                  </div>
                </GoalItem>
              ))}
            </GoalsList>
          </ChartCard>
        </ChartsGrid>
      )}

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            {user?.role === 'vendedor' ? 'Performance de Propostas' : 'Performance de Vendas'}
          </ChartTitle>
          <ChartSubtitle>
            {user?.role === 'vendedor' 
              ? 'Evolução mensal de propostas criadas e aprovadas' 
              : 'Evolução mensal de vendas e receita'
            }
          </ChartSubtitle>
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
                dataKey={user?.role === 'vendedor' ? 'propostas' : 'vendas'} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                animationDuration={1000}
                name={user?.role === 'vendedor' ? 'Propostas' : 'Vendas'}
              />
              <Line 
                type="monotone" 
                dataKey={user?.role === 'vendedor' ? 'aprovadas' : 'receita'} 
                stroke="#EC4899" 
                strokeWidth={3}
                dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                animationDuration={1000}
                name={user?.role === 'vendedor' ? 'Aprovadas' : 'Receita'}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            {user?.role === 'vendedor' ? 'Valor das Propostas (R$)' : 'Receita Mensal (R$)'}
          </ChartTitle>
          <ChartSubtitle>
            {user?.role === 'vendedor' 
              ? 'Evolução do valor das propostas por mês' 
              : 'Evolução da receita por mês'
            }
          </ChartSubtitle>
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

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            {user?.role === 'vendedor' ? 'Propostas Recentes' : 'Produtos Mais Vendidos'}
          </ChartTitle>
          <ChartSubtitle>
            {user?.role === 'vendedor' 
              ? 'Suas últimas propostas criadas' 
              : 'Top 5 produtos do mês'
            }
          </ChartSubtitle>
          <ProductsList>
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((product, index) => (
                <ProductItem key={index}>
                  <ProductName>{index + 1}. {product.name}</ProductName>
                  <ProductSales>{product.quantity} unidades vendidas</ProductSales>
                  <ProductRevenue>R$ {(product.revenue || 0).toLocaleString('pt-BR')}</ProductRevenue>
                </ProductItem>
              ))
            ) : (
              <ProductItem>
                <ProductName>Nenhum produto vendido ainda</ProductName>
                <ProductSales>0 unidades</ProductSales>
                <ProductRevenue>R$ 0</ProductRevenue>
              </ProductItem>
            )}
          </ProductsList>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            {user?.role === 'vendedor' ? 'Metas de Propostas' : 'Metas de Vendas'}
          </ChartTitle>
          <ChartSubtitle>
            {user?.role === 'vendedor' 
              ? 'Progresso das suas metas de propostas' 
              : 'Progresso das metas mensais'
            }
          </ChartSubtitle>
          <GoalsList>
            {(user?.role === 'vendedor' ? vendedorGoals : adminGoals).map((goal, index) => (
              <GoalItem key={index}>
                <GoalName>{goal.name}</GoalName>
                <GoalProgress>
                  <GoalBar $color={goal.color} $width={goal.progress} />
                  <GoalPercentage>{goal.progress}%</GoalPercentage>
                </GoalProgress>
              </GoalItem>
            ))}
          </GoalsList>
        </ChartCard>
      </ChartsGrid>

      <PerformanceMetrics>
        {user?.role === 'vendedor' ? (
          <>
            <MetricItem>
              <MetricItemIcon $color="#3B82F6">
                <Target size={24} color="#3B82F6" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Pendentes</MetricItemLabel>
              <MetricItemValue $negative={data?.proposalStats?.negociacaoProposals === 0}>
                {data?.proposalStats?.negociacaoProposals || 0}
              </MetricItemValue>
              <MetricItemDescription>
                Propostas aguardando resposta do cliente
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                +0% este mês
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#EF4444">
                <AlertTriangle size={24} color="#EF4444" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Rejeitadas</MetricItemLabel>
              <MetricItemValue $negative={data?.proposalStats?.vendaPerdidaProposals === 0}>
                {data?.proposalStats?.vendaPerdidaProposals || 0}
              </MetricItemValue>
              <MetricItemDescription>
                Propostas que foram rejeitadas pelos clientes
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingDown size={12} />
                -0% este mês
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#10B981">
                <DollarSign size={24} color="#10B981" />
              </MetricItemIcon>
              <MetricItemLabel>Valor Médio Proposta</MetricItemLabel>
              <MetricItemValue $negative={!data?.salesStats?.averageSale || data?.salesStats?.averageSale === 0}>
                R$ {data?.salesStats?.averageSale?.toLocaleString('pt-BR') || '0'}
              </MetricItemValue>
              <MetricItemDescription>
                Valor médio das suas propostas criadas
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                +0% vs mês anterior
              </MetricItemTrend>
            </MetricItem>
          </>
        ) : (
          <>
            <MetricItem>
              <MetricItemIcon $color="#EF4444">
                <TrendingDown size={24} color="#EF4444" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Perdidas</MetricItemLabel>
              <MetricItemValue $negative>{data?.proposalStats?.vendaPerdidaProposals || 0}</MetricItemValue>
              <MetricItemDescription>
                Propostas que não foram convertidas em vendas
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingDown size={12} />
                -0% este mês
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#F59E0B">
                <BarChart3 size={24} color="#F59E0B" />
              </MetricItemIcon>
              <MetricItemLabel>Vendas Abertas</MetricItemLabel>
              <MetricItemValue $negative>{data?.proposalStats?.negociacaoProposals || 0}</MetricItemValue>
              <MetricItemDescription>
                Propostas em processo de negociação
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                +0% este mês
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#10B981">
                <DollarSign size={24} color="#10B981" />
              </MetricItemIcon>
              <MetricItemLabel>Ticket Médio</MetricItemLabel>
              <MetricItemValue $negative>R$ {data?.salesStats?.averageSale?.toLocaleString('pt-BR') || '0'}</MetricItemValue>
              <MetricItemDescription>
                Valor médio por venda fechada
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                +0% vs mês anterior
              </MetricItemTrend>
            </MetricItem>
          </>
        )}
      </PerformanceMetrics>

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

      {/* Modal de Atualização de Progresso */}
      {showProgressModal && selectedGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '8px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1.25rem' }}>
              Atualizar Progresso da Meta
            </h3>
            <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
              <strong>{selectedGoal.title}</strong>
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#FFFFFF', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Valor Atual ({selectedGoal.unit === 'currency' ? 'R$' : selectedGoal.unit})
              </label>
              <input
                type="number"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '1rem'
                }}
                placeholder={`Meta: ${selectedGoal.targetValue}`}
                min="0"
                step={selectedGoal.unit === 'currency' ? '0.01' : '1'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#FFFFFF', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Descrição (opcional)
              </label>
              <textarea
                value={progressDescription}
                onChange={(e) => setProgressDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Descreva o que foi realizado..."
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setSelectedGoal(null);
                  setProgressValue('');
                  setProgressDescription('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6B7280',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProgress}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Salvar Progresso
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};
