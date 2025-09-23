import React, { useState, useEffect } from 'react';
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
  LoadingContainer
} from './styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2 } from 'lucide-react';

const salesData = [
  { month: 'Jan', vendas: 0, receita: 0 },
  { month: 'Fev', vendas: 0, receita: 0 },
  { month: 'Mar', vendas: 0, receita: 0 },
  { month: 'Abr', vendas: 0, receita: 0 },
  { month: 'Mai', vendas: 0, receita: 0 },
  { month: 'Jun', vendas: 0, receita: 0 },
  { month: 'Jul', vendas: 0, receita: 0 },
  { month: 'Ago', vendas: 0, receita: 0 },
  { month: 'Set', vendas: 0, receita: 0 },
];

const revenueData = [
  { month: 'Jan', receita: 0 },
  { month: 'Fev', receita: 0 },
  { month: 'Mar', receita: 0 },
  { month: 'Abr', receita: 0 },
  { month: 'Mai', receita: 0 },
  { month: 'Jun', receita: 0 },
  { month: 'Jul', receita: 0 },
  { month: 'Ago', receita: 0 },
  { month: 'Set', receita: 0 },
];

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
  }>;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersResponse, productsResponse, salesResponse, salesStatsResponse] = await Promise.all([
        apiService.getUsers(1, 1),
        apiService.getProducts(1, 1),
        apiService.getSales(1, 1),
        apiService.getSalesStats()
      ]);

      const topProducts = await getTopProducts();

      setData({
        totalUsers: usersResponse.pagination?.total || 0,
        totalProducts: productsResponse.pagination?.total || 0,
        totalSales: salesResponse.pagination?.total || 0,
        totalRevenue: salesStatsResponse.data?.totalRevenue || 0,
        salesStats: salesStatsResponse.data || {
          totalSales: 0,
          totalRevenue: 0,
          averageSale: 0,
          totalItems: 0
        },
        topProducts
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getTopProducts = async () => {
    try {
      const response = await apiService.getProducts(1, 5);
      return response.data.map(product => ({
        name: product.name,
        sales: 0, // Dados reais - sem vendas ainda
        revenue: 0 // Dados reais - sem receita ainda
      }));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <Loader2 size={48} className="animate-spin" />
          <p>Carregando dashboard...</p>
        </LoadingContainer>
      </Container>
    );
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
              />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#EC4899" 
                strokeWidth={3}
                dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
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
            {data?.topProducts.map((product, index) => (
              <ProductItem key={index}>
                <ProductName>{index + 1} {product.name}</ProductName>
                <ProductSales>{product.sales} vendas</ProductSales>
                <ProductRevenue>R$ {product.revenue.toLocaleString('pt-BR')}</ProductRevenue>
              </ProductItem>
            ))}
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
              <MetricItemLabel>Propostas Pendentes</MetricItemLabel>
              <MetricItemValue $negative>0</MetricItemValue>
            </MetricItem>
            <MetricItem>
              <MetricItemLabel>Propostas Rejeitadas</MetricItemLabel>
              <MetricItemValue $negative>0</MetricItemValue>
            </MetricItem>
            <MetricItem>
              <MetricItemLabel>Valor Médio Proposta</MetricItemLabel>
              <MetricItemValue $negative>R$ 0</MetricItemValue>
            </MetricItem>
          </>
        ) : (
          <>
            <MetricItem>
              <MetricItemLabel>Propostas Perdidas</MetricItemLabel>
              <MetricItemValue $negative>0</MetricItemValue>
            </MetricItem>
            <MetricItem>
              <MetricItemLabel>Vendas Abertas</MetricItemLabel>
              <MetricItemValue $negative>0</MetricItemValue>
            </MetricItem>
            <MetricItem>
              <MetricItemLabel>Ticket Médio</MetricItemLabel>
              <MetricItemValue $negative>R$ 0</MetricItemValue>
            </MetricItem>
          </>
        )}
      </PerformanceMetrics>
    </Container>
  );
};
