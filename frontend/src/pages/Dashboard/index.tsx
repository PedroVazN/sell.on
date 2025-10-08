import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
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
  const [lossReasons, setLossReasons] = useState<{
    reason: string;
    label: string;
    count: number;
    totalValue: number;
  }[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user?.role === 'vendedor' && user?._id) {
        // Dashboard específico para vendedor
        console.log('🔍 Carregando dashboard do vendedor:', user._id);
        console.log('🔍 User role:', user.role);
        console.log('🔍 User ID:', user._id);
        
        const [usersResponse, productsResponse, vendedorProposalsResponse, lossReasonsResponse, proposalsResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getVendedorProposals(user._id, 1, 100),
          apiService.getLossReasonsStats(),
          apiService.getProposals(1, 100)
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
      } else {
        // Dashboard para admin
        console.log('🔍 Carregando dashboard do admin');
        
        const [usersResponse, productsResponse, salesResponse, salesStatsResponse, proposalsSalesResponse, proposalsStatsResponse, lossReasonsResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getSales(1, 1),
          apiService.getSalesStats(),
          apiService.getProposalsDashboardSales(),
          apiService.getProposalsDashboardStats(),
          apiService.getLossReasonsStats()
        ]);

        setData({
          totalUsers: usersResponse.pagination?.total || 0,
          totalProducts: productsResponse.pagination?.total || 0,
          totalSales: proposalsSalesResponse.data?.salesStats?.totalSales || 0,
          totalRevenue: proposalsSalesResponse.data?.salesStats?.totalRevenue || 0,
          salesStats: proposalsSalesResponse.data?.salesStats || {
            totalSales: 0,
            totalRevenue: 0,
            averageSale: 0,
            totalItems: 0
          },
          proposalStats: {
            totalProposals: proposalsStatsResponse.data?.proposalStats?.totalProposals || 0,
            totalValue: 0, // Será calculado se necessário
            negociacaoProposals: proposalsStatsResponse.data?.proposalStats?.negociacaoProposals || 0,
            negociacaoValue: 0, // Será calculado se necessário
            vendaFechadaProposals: proposalsStatsResponse.data?.proposalStats?.vendaFechadaProposals || 0,
            vendaFechadaValue: 0, // Será calculado se necessário
            vendaPerdidaProposals: proposalsStatsResponse.data?.proposalStats?.vendaPerdidaProposals || 0,
            vendaPerdidaValue: 0, // Será calculado se necessário
            expiradaProposals: proposalsStatsResponse.data?.proposalStats?.expiradaProposals || 0,
            expiradaValue: 0 // Será calculado se necessário
          },
          topProducts: proposalsSalesResponse.data?.topProducts || [],
          monthlyData: proposalsSalesResponse.data?.monthlyData || []
        });
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
            : 'Visão geral das suas vendas e performance'
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
            <MetricCard>
              <MetricValue>R$ {data?.totalRevenue.toLocaleString('pt-BR') || '0'}</MetricValue>
              <MetricLabel>Receita Total</MetricLabel>
              <MetricChange $positive>+0% vs mês anterior</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.totalUsers || 0}</MetricValue>
              <MetricLabel>Usuários</MetricLabel>
              <MetricChange $positive>+0% novos usuários</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.totalSales || 0}</MetricValue>
              <MetricLabel>Vendas Fechadas</MetricLabel>
              <MetricChange $positive>+0% este mês</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>{data?.totalProducts || 0}</MetricValue>
              <MetricLabel>Produtos</MetricLabel>
              <MetricChange $positive>+0% novos produtos</MetricChange>
            </MetricCard>
          </>
        )}
      </MetricsGrid>

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
                  <ProductRevenue>R$ {product.revenue.toLocaleString('pt-BR')}</ProductRevenue>
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
                      R$ {reason.totalValue.toLocaleString('pt-BR')}
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
    </Container>
  );
};
