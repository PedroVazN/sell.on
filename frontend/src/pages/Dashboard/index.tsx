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

const getSalesData = (monthlyData: Array<{month: number; year: number; revenue: number; sales: number}>) => {
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

const getRevenueData = (monthlyData: Array<{month: number; year: number; revenue: number; sales: number}>) => {
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
    sales: number;
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

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersResponse, productsResponse, salesResponse, salesStatsResponse, proposalsSalesResponse] = await Promise.all([
        apiService.getUsers(1, 1),
        apiService.getProducts(1, 1),
        apiService.getSales(1, 1),
        apiService.getSalesStats(),
        apiService.getProposalsDashboardSales()
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
        topProducts: proposalsSalesResponse.data?.topProducts || [],
        monthlyData: proposalsSalesResponse.data?.monthlyData || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoizar dados dos gráficos para evitar recálculos desnecessários
  const salesData = useMemo(() => getSalesData(data?.monthlyData || []), [data?.monthlyData]);
  const revenueData = useMemo(() => getRevenueData(data?.monthlyData || []), [data?.monthlyData]);

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
            <MetricCard>
              <MetricValue>0</MetricValue>
              <MetricLabel>Propostas Criadas</MetricLabel>
              <MetricChange $positive>+0% este mês</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>0</MetricValue>
              <MetricLabel>Propostas Aprovadas</MetricLabel>
              <MetricChange $positive>+0% taxa de conversão</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>R$ 0</MetricValue>
              <MetricLabel>Valor Total Propostas</MetricLabel>
              <MetricChange $positive>+0% vs mês anterior</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue>0</MetricValue>
              <MetricLabel>Clientes Atendidos</MetricLabel>
              <MetricChange $positive>+0% novos clientes</MetricChange>
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
                dataKey="vendas" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#EC4899" 
                strokeWidth={3}
                dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                animationDuration={1000}
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
              <MetricItemValue $negative>0</MetricItemValue>
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
              <MetricItemValue $negative>0</MetricItemValue>
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
              <MetricItemValue $negative>R$ 0</MetricItemValue>
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
              <MetricItemValue $negative>{data?.salesStats?.totalSales || 0}</MetricItemValue>
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
              <MetricItemValue $negative>{data?.salesStats?.totalSales || 0}</MetricItemValue>
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
    </Container>
  );
};
