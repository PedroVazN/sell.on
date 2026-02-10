import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Goal } from '../../services/api';
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
import { Loader2, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Target, BarChart3, FileDown } from 'lucide-react';
import { generateDashboardPdf, DashboardPdfData } from '../../utils/pdfGenerator';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Gráficos começam em outubro/2025 e vão até o mês atual
const CHART_START_YEAR = 2025;
const CHART_START_MONTH = 10; // Outubro

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
      <div style={{ height: '60px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '16px' }} />
      <div style={{ height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', width: '60%' }} />
    </Header>
    <MetricsGrid>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ 
          height: '120px', 
          background: 'rgba(255,255,255,0.08)', 
          borderRadius: '20px'
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
  const [lossReasons, setLossReasons] = useState<{
    reason: string;
    label: string;
    count: number;
    totalValue: number;
  }[]>([]);
  // Mês principal para filtro do dashboard (admin)
  // 0 = Todos os meses
  const [dashboardMonth, setDashboardMonth] = useState<number | 0>(new Date().getMonth() + 1);
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());
  
  // Mês para o gráfico diário (sincronizado com o principal)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyProposalsData, setDailyProposalsData] = useState<{
    day: number;
    date: string;
    ganhas: number;
    perdidas: number;
    geradas: number;
    negociacao: number;
    valorGanhas: number;
    valorPerdidas: number;
    valorGeradas: number;
    valorNegociacao: number;
  }[]>([]);
  const [todayStats, setTodayStats] = useState({
    geradas: 0,
    ganhas: 0,
    perdidas: 0,
    negociacao: 0,
    valorGeradas: 0,
    valorGanhas: 0,
    valorPerdidas: 0,
    valorNegociacao: 0
  });

  const [isDailyDataLoading, setIsDailyDataLoading] = useState(false);
  const [topQuotedProducts, setTopQuotedProducts] = useState<Array<{
    name: string;
    quantity: number;
    timesQuoted: number;
  }>>([]);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Modal de detalhes do dia
  const [selectedDayData, setSelectedDayData] = useState<{
    day: number;
    date: string;
    ganhas: number;
    perdidas: number;
    geradas: number;
    negociacao: number;
    valorGanhas: number;
    valorPerdidas: number;
    valorGeradas: number;
    valorNegociacao: number;
  } | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const handleDayClick = (dayData: typeof dailyProposalsData[0]) => {
    setSelectedDayData(dayData);
    setShowDayModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setTimeout(() => setSelectedDayData(null), 300);
  };


  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user?.role === 'vendedor' && user?._id) {
        // Dashboard específico para vendedor - Buscar TODAS as propostas
        const [usersResponse, productsResponse, proposalsResponse, goalsResponse, salesDataResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getProposals(1, 2000), // Limitar para reduzir tempo de carregamento
          apiService.getGoals(1, 100, { assignedTo: user._id, status: 'active' }),
          apiService.getProposalsDashboardSales()
        ]);

        // Processar dados mensais das propostas do vendedor - filtrar no frontend
        const vendedorProposals = (proposalsResponse.data || []).filter((proposal: any) => 
          proposal.createdBy?._id === user._id || proposal.createdBy === user._id
        );

        // Filtrar propostas: "Todos os meses" = de out/2025 até hoje; senão pelo mês/ano selecionado
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
        // IMPORTANTE: Propostas geradas usa createdAt, Propostas ganhas usa closedAt
        const monthlyProposals: any = {};
        
        filteredProposals.forEach((proposal: any) => {
          // Para propostas GERADAS: usar createdAt
          const createdDate = new Date(proposal.createdAt);
          const createdMonth = createdDate.getMonth() + 1;
          const createdYear = createdDate.getFullYear();
          const createdKey = `${createdYear}-${createdMonth}`;
          
          if (!monthlyProposals[createdKey]) {
            monthlyProposals[createdKey] = {
              month: createdMonth,
              year: createdYear,
              totalProposals: 0,
              approvedProposals: 0,
              revenue: 0
            };
          }
          monthlyProposals[createdKey].totalProposals++;
          
          // Para propostas GANHAS: usar closedAt (data de fechamento)
          if (proposal.status === 'venda_fechada') {
            const closedDate = proposal.closedAt ? new Date(proposal.closedAt) : new Date(proposal.updatedAt);
            const closedMonth = closedDate.getMonth() + 1;
            const closedYear = closedDate.getFullYear();
            const closedKey = `${closedYear}-${closedMonth}`;
            
            if (!monthlyProposals[closedKey]) {
              monthlyProposals[closedKey] = {
                month: closedMonth,
                year: closedYear,
                totalProposals: 0,
                approvedProposals: 0,
                revenue: 0
              };
            }
            monthlyProposals[closedKey].approvedProposals++;
            monthlyProposals[closedKey].revenue += proposal.total || 0;
          }
        });

        const monthlyData = Object.values(monthlyProposals).sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        }) as Array<{month: number; year: number; totalProposals: number; approvedProposals: number; revenue: number}>;

        // Calcular motivos de perda apenas das propostas FILTRADAS do vendedor
        const lossReasonsMap: { [key: string]: { reason: string; label: string; count: number; totalValue: number } } = {};
        
        filteredProposals.forEach((proposal: any) => {
          if (proposal.status === 'venda_perdida' && proposal.lossReason) {
            if (!lossReasonsMap[proposal.lossReason]) {
              // Mapear labels dos motivos
              const reasonLabels: { [key: string]: string } = {
                'preco_concorrente': 'Preço Concorrente',
                'condicao_pagamento': 'Condição de Pagamento',
                'sem_retorno': 'Sem Retorno',
                'credito_negado': 'Crédito Negado',
                'concorrencia_marca': 'Concorrência (Marca)',
                'adiamento_compra': 'Adiamento de Compra',
                'cotacao_preco': 'Cotação de Preço',
                'perca_preco': 'Perda de Preço',
                'urgencia_comprou_local': 'Urgência / Comprou Localmente',
                'golpe': 'Golpe',
                'licitacao': 'Licitação',
                'fechado_outro_parceiro': 'Fechado em Outro Parceiro'
              };
              
              lossReasonsMap[proposal.lossReason] = {
                reason: proposal.lossReason,
                label: reasonLabels[proposal.lossReason] || proposal.lossReason,
                count: 0,
                totalValue: 0
              };
            }
            lossReasonsMap[proposal.lossReason].count++;
            lossReasonsMap[proposal.lossReason].totalValue += proposal.total || 0;
          }
        });

        const vendedorLossReasons = Object.values(lossReasonsMap).sort((a, b) => b.count - a.count);

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
          topProducts: salesDataResponse.data?.topProducts || [],
          monthlyData: monthlyData
        };
        
        setData(dashboardData);
        setLossReasons(vendedorLossReasons);
        setGoals(goalsResponse.data || []);
      } else {
        // Dashboard para admin - Buscar TODAS as propostas
        const [usersResponse, productsResponse, allProposalsResponse, lossReasonsResponse, goalsResponse, salesDataResponse] = await Promise.all([
          apiService.getUsers(1, 1),
          apiService.getProducts(1, 1),
          apiService.getProposals(1, 2000), // Limitar para reduzir tempo de carregamento
          apiService.getLossReasonsStats(),
          apiService.getGoals(1, 100, { status: 'active' }),
          apiService.getProposalsDashboardSales()
        ]);

        // Filtrar propostas: "Todos os meses" = de out/2025 até hoje; senão pelo mês/ano selecionado
        const allProposals = allProposalsResponse.data || [];
        const filteredProposals = dashboardMonth === 0
          ? allProposals.filter((proposal: any) => {
              const created = new Date(proposal.createdAt);
              const closed = proposal.closedAt ? new Date(proposal.closedAt) : new Date(proposal.updatedAt);
              return isDateInChartRange(created) || isDateInChartRange(closed);
            })
          : allProposals.filter((proposal: any) => {
              const date = new Date(proposal.createdAt);
              return date.getMonth() + 1 === dashboardMonth && date.getFullYear() === dashboardYear;
            });
        
        // Calcular estatísticas apenas das propostas filtradas
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

        // Agrupar propostas por mês (apenas do mês selecionado)
        // IMPORTANTE: Propostas geradas usa createdAt, Propostas ganhas usa closedAt
        const monthlyProposals: any = {};
        
        filteredProposals.forEach((proposal: any) => {
          // Para propostas GERADAS: usar createdAt
          const createdDate = new Date(proposal.createdAt);
          const createdMonth = createdDate.getMonth() + 1;
          const createdYear = createdDate.getFullYear();
          const createdKey = `${createdYear}-${createdMonth}`;
          
          if (!monthlyProposals[createdKey]) {
            monthlyProposals[createdKey] = {
              month: createdMonth,
              year: createdYear,
              totalProposals: 0,
              approvedProposals: 0,
              revenue: 0
            };
          }
          monthlyProposals[createdKey].totalProposals++;
          
          // Para propostas GANHAS: usar closedAt (data de fechamento)
          if (proposal.status === 'venda_fechada') {
            const closedDate = proposal.closedAt ? new Date(proposal.closedAt) : new Date(proposal.updatedAt);
            const closedMonth = closedDate.getMonth() + 1;
            const closedYear = closedDate.getFullYear();
            const closedKey = `${closedYear}-${closedMonth}`;
            
            if (!monthlyProposals[closedKey]) {
              monthlyProposals[closedKey] = {
                month: closedMonth,
                year: closedYear,
                totalProposals: 0,
                approvedProposals: 0,
                revenue: 0
              };
            }
            monthlyProposals[closedKey].approvedProposals++;
            monthlyProposals[closedKey].revenue += proposal.total || 0;
          }
        });

        let monthlyData = Object.values(monthlyProposals)
          .sort((a: any, b: any) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          })
          .map((item: any) => ({ ...item, sales: item.approvedProposals || 0 })) as Array<{month: number; year: number; totalProposals?: number; approvedProposals?: number; revenue: number; sales?: number}>;

        // "Todos os meses": usar monthlyData do backend (dashboard/sales) para ter todos os meses sem limite de 2000
        if (dashboardMonth === 0 && salesDataResponse.data?.monthlyData?.length) {
          monthlyData = salesDataResponse.data.monthlyData.map((d: { month: number; year: number; revenue: number; sales: number }) => ({
            month: d.month,
            year: d.year,
            revenue: d.revenue,
            sales: d.sales ?? 0
          }));
        }

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
          topProducts: salesDataResponse.data?.topProducts || [],
          monthlyData: monthlyData
        };
        
        setData(dashboardData);
        setLossReasons(lossReasonsResponse.data || []);
        setGoals(goalsResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, user?._id, dashboardMonth, dashboardYear]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Sincronizar seletores de mês (dashboard principal e gráfico diário)
  // Não sincronizar se for "Todos os meses" (0)
  useEffect(() => {
    if (dashboardMonth !== 0) {
      setSelectedMonth(dashboardMonth);
      setSelectedYear(dashboardYear);
    }
  }, [dashboardMonth, dashboardYear]);

  // Função para gerar PDF do dashboard
  const handleGeneratePdf = () => {
    if (!data) return;
    
    try {
      setIsGeneratingPdf(true);
      
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthName = dashboardMonth === 0 ? 'Todos os Meses' : monthNames[dashboardMonth - 1];
      
      const pdfData: DashboardPdfData = {
        month: monthName,
        year: dashboardYear,
        proposalStats: data.proposalStats,
        salesStats: data.salesStats,
        topProducts: data.topProducts || [],
        goals: goals.map(g => ({
          title: g.title,
          currentValue: g.currentValue,
          targetValue: g.targetValue,
          progress: g.progress,
          status: g.status,
          assignedTo: typeof g.assignedTo === 'object' ? g.assignedTo : undefined
        }))
      };
      
      generateDashboardPdf(pdfData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF do dashboard');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Processar dados diários quando mudar o mês - OTIMIZADO COM CACHE
  useEffect(() => {
    let isMounted = true;
    
    const processDailyData = async () => {
      try {
        if (!isMounted) return;
        setIsDailyDataLoading(true);
        
        // Buscar TODAS as propostas para cálculo correto
        const response = await apiService.getProposals(1, 2000);
        let proposals = response.data || [];
        
        // Se for vendedor, filtrar apenas suas propostas
        if (user?.role === 'vendedor' && user?._id) {
          proposals = proposals.filter((p: any) => 
            p.createdBy?._id === user._id || p.createdBy === user._id
          );
        }
        
        if (!isMounted) return;

        // Obter número de dias do mês
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        
        // Inicializar dados para todos os dias
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
          const dayDate = new Date(selectedYear, selectedMonth - 1, i + 1);
          return {
            day: i + 1,
            date: dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            ganhas: 0,
            perdidas: 0,
            geradas: 0,
            negociacao: 0,
            valorGanhas: 0,
            valorPerdidas: 0,
            valorGeradas: 0,
            valorNegociacao: 0
          };
        });

        // Processar propostas - usar data correta baseada no status
        // Geradas: usa createdAt
        // Ganhas/Perdidas: usa closedAt (ou updatedAt como fallback) - contabiliza no mês de FECHAMENTO
        proposals.forEach((p: any) => {
          const valor = p.total || 0;
          const createdDate = new Date(p.createdAt);
          // Data de fechamento: usar closedAt se existir, senão updatedAt
          const closedDate = p.closedAt ? new Date(p.closedAt) : new Date(p.updatedAt);
          
          // Propostas GERADAS neste mês (usa createdAt)
          if (createdDate.getMonth() + 1 === selectedMonth && createdDate.getFullYear() === selectedYear) {
            const dayIndex = createdDate.getDate() - 1;
            if (dayIndex >= 0 && dayIndex < daysInMonth) {
              dailyData[dayIndex].geradas++;
              dailyData[dayIndex].valorGeradas += valor;
              
              // Se está em negociação, conta como negociação no dia da criação
              if (p.status === 'negociacao') {
                dailyData[dayIndex].negociacao++;
                dailyData[dayIndex].valorNegociacao += valor;
              }
            }
          }
          
          // Propostas FECHADAS/PERDIDAS neste mês (usa closedAt/updatedAt)
          // Contabiliza no mês em que FOI FECHADA, não criada
          if (closedDate.getMonth() + 1 === selectedMonth && closedDate.getFullYear() === selectedYear) {
            const dayIndex = closedDate.getDate() - 1;
            if (dayIndex >= 0 && dayIndex < daysInMonth) {
              if (p.status === 'venda_fechada') {
                dailyData[dayIndex].ganhas++;
                dailyData[dayIndex].valorGanhas += valor;
              } else if (p.status === 'venda_perdida') {
                dailyData[dayIndex].perdidas++;
                dailyData[dayIndex].valorPerdidas += valor;
              }
            }
          }
        });

        setDailyProposalsData(dailyData);

        // Calcular estatísticas de hoje
        const today = new Date();
        
        const todayStatsCalc = proposals.reduce((acc: any, p: any) => {
          const valor = p.total || 0;
          const createdDate = new Date(p.createdAt);
          // Data de fechamento: usar closedAt se existir, senão updatedAt
          const closedDate = p.closedAt ? new Date(p.closedAt) : new Date(p.updatedAt);
          const todayStr = today.toDateString();

          // Propostas geradas hoje (usa createdAt)
          if (createdDate.toDateString() === todayStr) {
            acc.geradas++;
            acc.valorGeradas += valor;
          }

          // Propostas ganhas hoje (usa closedAt ou updatedAt)
          if (p.status === 'venda_fechada' && closedDate.toDateString() === todayStr) {
            acc.ganhas++;
            acc.valorGanhas += valor;
          }

          // Propostas perdidas hoje (usa closedAt ou updatedAt)
          if (p.status === 'venda_perdida' && closedDate.toDateString() === todayStr) {
            acc.perdidas++;
            acc.valorPerdidas += valor;
          }

          // Propostas em negociação (status atual, não importa a data)
          if (p.status === 'negociacao') {
            acc.negociacao++;
            acc.valorNegociacao += valor;
          }

          return acc;
        }, {
          geradas: 0,
          ganhas: 0,
          perdidas: 0,
          negociacao: 0,
          valorGeradas: 0,
          valorGanhas: 0,
          valorPerdidas: 0,
          valorNegociacao: 0
        });

        if (!isMounted) return;
        setTodayStats(todayStatsCalc);

        // Calcular produtos mais cotados (todos os produtos em todas as propostas)
        const productCount: { [key: string]: { name: string; quantity: number; timesQuoted: number } } = {};
        
        proposals.forEach((proposal: any) => {
          if (proposal.items && Array.isArray(proposal.items)) {
            proposal.items.forEach((item: any) => {
              const productName = item.product?.name || 'Produto';
              const productId = item.product?._id || productName;
              
              if (!productCount[productId]) {
                productCount[productId] = {
                  name: productName,
                  quantity: 0,
                  timesQuoted: 0
                };
              }
              
              productCount[productId].quantity += item.quantity || 0;
              productCount[productId].timesQuoted += 1;
            });
          }
        });

        // Ordenar por vezes cotado e pegar top 5
        const sortedProducts = Object.values(productCount)
          .sort((a, b) => b.timesQuoted - a.timesQuoted)
          .slice(0, 5);
        
        if (!isMounted) return;
        setTopQuotedProducts(sortedProducts);

      } catch (error) {
        console.error('Erro ao processar dados diários:', error);
      } finally {
        if (isMounted) {
          setIsDailyDataLoading(false);
        }
      }
    };

    processDailyData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear, user?.role, user?._id]);

  // Memoizar dados dos gráficos: "Todos os meses" = Out/2025 até mês atual; senão só o mês selecionado
  const salesData = useMemo(() => {
    if (dashboardMonth === 0) {
      const range = getChartMonthRange();
      const monthly = data?.monthlyData || [];
      return range.map(({ month, year, label }) => {
        const monthData = monthly.find(d => d.month === month && d.year === year);
        if (user?.role === 'vendedor') {
          return {
            month: label,
            propostas: monthData?.totalProposals || 0,
            aprovadas: monthData?.approvedProposals || 0,
            receita: monthData?.revenue || 0
          };
        }
        return {
          month: label,
          vendas: monthData?.sales ?? monthData?.approvedProposals ?? 0,
          receita: monthData?.revenue || 0
        };
      });
    }
    const filteredMonthlyData = (data?.monthlyData || []).filter(d =>
      d.month === dashboardMonth && d.year === dashboardYear
    );
    return monthNames.map((month, index) => {
      if (index + 1 === dashboardMonth) {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        if (user?.role === 'vendedor') {
          return {
            month,
            propostas: monthData?.totalProposals || 0,
            aprovadas: monthData?.approvedProposals || 0,
            receita: monthData?.revenue || 0
          };
        }
        return {
          month,
          vendas: monthData?.sales ?? monthData?.approvedProposals ?? 0,
          receita: monthData?.revenue || 0
        };
      }
      if (user?.role === 'vendedor') {
        return { month, propostas: 0, aprovadas: 0, receita: 0 };
      }
      return { month, vendas: 0, receita: 0 };
    });
  }, [data?.monthlyData, user?.role, dashboardMonth, dashboardYear]);

  const revenueData = useMemo(() => {
    if (dashboardMonth === 0) {
      const range = getChartMonthRange();
      const monthly = data?.monthlyData || [];
      return range.map(({ month, year, label }) => {
        const monthData = monthly.find(d => d.month === month && d.year === year);
        return {
          month: label,
          receita: monthData?.revenue || 0
        };
      });
    }
    const filteredMonthlyData = (data?.monthlyData || []).filter(d =>
      d.month === dashboardMonth && d.year === dashboardYear
    );
    return monthNames.map((month, index) => {
      if (index + 1 === dashboardMonth) {
        const monthData = filteredMonthlyData.find(d => d.month === index + 1 && d.year === dashboardYear);
        return { month, receita: monthData?.revenue || 0 };
      }
      return { month, receita: 0 };
    });
  }, [data?.monthlyData, user?.role, dashboardMonth, dashboardYear]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Title>Dashboard</Title>
            <Subtitle>
              {user?.role === 'vendedor' 
                ? `Suas propostas e performance de vendas - ${
                    dashboardMonth === 0 
                      ? `Out/2025 até ${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`
                      : `${monthNames[dashboardMonth - 1]} ${dashboardYear}`
                  }`
                : `Visão geral de todas as propostas e performance da equipe${dashboardMonth === 0 ? ` (Out/2025 até ${monthNames[new Date().getMonth()]} ${new Date().getFullYear()})` : ''}`
              }
            </Subtitle>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
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
            {user?.role === 'admin' && (
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf || !data}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: isGeneratingPdf || !data 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: isGeneratingPdf || !data ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isGeneratingPdf || !data ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isGeneratingPdf && data) {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGeneratingPdf && data) {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                  }
                }}
              >
                <FileDown size={16} />
                {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
              </button>
            )}
          </div>
        </div>
      </Header>

      {/* Meta Ativa do Vendedor */}
      {user?.role === 'vendedor' && goals.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <ChartCard>
            <ChartTitle style={{ marginBottom: '1rem' }}>
              🎯 Sua Meta Ativa
            </ChartTitle>
            <GoalsList>
              {goals.map((goal) => (
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
                          borderRadius: '4px'
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
                      {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
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
                    </div>
                  </div>
                </GoalItem>
              ))}
            </GoalsList>
          </ChartCard>
        </div>
      )}

      <MetricsGrid>
        {user?.role === 'vendedor' ? (
          <>
            {/* Valores */}
            <MetricCard>
              <MetricValue $variant="success">{formatCurrency(data?.proposalStats?.vendaFechadaValue)}</MetricValue>
              <MetricLabel>Valor Ganho</MetricLabel>
              <MetricChange $variant="success">Propostas fechadas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="danger">{formatCurrency(data?.proposalStats?.vendaPerdidaValue)}</MetricValue>
              <MetricLabel>Valor Perdido</MetricLabel>
              <MetricChange $variant="danger">Propostas perdidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="neutral">{formatCurrency(data?.proposalStats?.totalValue)}</MetricValue>
              <MetricLabel>Valor Propostas Geradas</MetricLabel>
              <MetricChange $variant="neutral">Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="warning">{formatCurrency(data?.proposalStats?.negociacaoValue)}</MetricValue>
              <MetricLabel>Valor Propostas em Negociação</MetricLabel>
              <MetricChange $variant="warning">Em andamento</MetricChange>
            </MetricCard>

            {/* Quantidades */}
            <MetricCard>
              <MetricValue $variant="success">{data?.proposalStats?.vendaFechadaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Ganhas</MetricLabel>
              <MetricChange $variant="success">Fechadas com sucesso</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="danger">{data?.proposalStats?.vendaPerdidaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Perdidas</MetricLabel>
              <MetricChange $variant="danger">Não convertidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="neutral">{data?.proposalStats?.totalProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Geradas</MetricLabel>
              <MetricChange $variant="neutral">Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="warning">{data?.proposalStats?.negociacaoProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas em Negociação</MetricLabel>
              <MetricChange $variant="warning">Em andamento</MetricChange>
            </MetricCard>
          </>
        ) : (
          <>
            {/* Valores - Admin */}
            <MetricCard>
              <MetricValue $variant="success">{formatCurrency(data?.proposalStats?.vendaFechadaValue)}</MetricValue>
              <MetricLabel>Valor Ganho</MetricLabel>
              <MetricChange $variant="success">Propostas fechadas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="danger">{formatCurrency(data?.proposalStats?.vendaPerdidaValue)}</MetricValue>
              <MetricLabel>Valor Perdido</MetricLabel>
              <MetricChange $variant="danger">Propostas perdidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="neutral">{formatCurrency(data?.proposalStats?.totalValue)}</MetricValue>
              <MetricLabel>Valor Propostas Geradas</MetricLabel>
              <MetricChange $variant="neutral">Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="warning">{formatCurrency(data?.proposalStats?.negociacaoValue)}</MetricValue>
              <MetricLabel>Valor Propostas em Negociação</MetricLabel>
              <MetricChange $variant="warning">Em andamento</MetricChange>
            </MetricCard>

            {/* Quantidades - Admin */}
            <MetricCard>
              <MetricValue $variant="success">{data?.proposalStats?.vendaFechadaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Ganhas</MetricLabel>
              <MetricChange $variant="success">Fechadas com sucesso</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="danger">{data?.proposalStats?.vendaPerdidaProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Perdidas</MetricLabel>
              <MetricChange $variant="danger">Não convertidas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="neutral">{data?.proposalStats?.totalProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas Geradas</MetricLabel>
              <MetricChange $variant="neutral">Todas as propostas</MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricValue $variant="warning">{data?.proposalStats?.negociacaoProposals || 0}</MetricValue>
              <MetricLabel>Quantidade Propostas em Negociação</MetricLabel>
              <MetricChange $variant="warning">Em andamento</MetricChange>
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
                formatter={(value: number, name: string) => [name === 'Receita' || name === 'Aprovadas' ? formatCurrency(value) : formatInteger(value), name]}
              />
              <Line 
                type="monotone" 
                dataKey={user?.role === 'vendedor' ? 'propostas' : 'vendas'} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                isAnimationActive={false}
                name={user?.role === 'vendedor' ? 'Propostas' : 'Vendas'}
              />
              <Line 
                type="monotone" 
                dataKey={user?.role === 'vendedor' ? 'aprovadas' : 'receita'} 
                stroke="#EC4899" 
                strokeWidth={3}
                dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                isAnimationActive={false}
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
              <YAxis stroke="#A3A3A3" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Bar 
                dataKey="receita" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
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

      <ChartsGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                  <ProductRevenue>{formatCurrency(product.revenue)}</ProductRevenue>
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
          <ChartTitle>Produtos Mais Cotados</ChartTitle>
          <ChartSubtitle>Top 5 produtos em propostas</ChartSubtitle>
          <ProductsList>
            {topQuotedProducts.length > 0 ? (
              topQuotedProducts.map((product, index) => (
                <ProductItem key={index}>
                  <ProductName>{index + 1}. {product.name}</ProductName>
                  <ProductSales>{product.timesQuoted} {product.timesQuoted === 1 ? 'proposta' : 'propostas'}</ProductSales>
                  <ProductRevenue>{product.quantity} unidades cotadas</ProductRevenue>
                </ProductItem>
              ))
            ) : (
              <ProductItem>
                <ProductName>Nenhum produto cotado ainda</ProductName>
                <ProductSales>0 propostas</ProductSales>
                <ProductRevenue>0 unidades</ProductRevenue>
              </ProductItem>
            )}
          </ProductsList>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            {user?.role === 'vendedor' ? 'Suas Metas Ativas' : 'Metas de Vendas da Equipe'}
          </ChartTitle>
          <ChartSubtitle>
            {user?.role === 'vendedor' 
              ? 'Acompanhe o progresso das suas metas' 
              : 'Progresso de todas as metas ativas'}
          </ChartSubtitle>
          <GoalsList>
            {goals.length > 0 ? (
              goals.map((goal) => (
                <GoalItem key={goal._id}>
                  <GoalName>
                    {goal.title}
                    {user?.role === 'admin' && goal.assignedTo && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#6B7280', 
                        marginLeft: '0.5rem',
                        fontWeight: 'normal'
                      }}>
                        ({typeof goal.assignedTo === 'string' ? goal.assignedTo : (goal.assignedTo as any).name})
                      </span>
                    )}
                  </GoalName>
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
                      {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
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
                    </div>
                  </div>
                </GoalItem>
              ))
            ) : (
              <GoalItem>
                <GoalName>Nenhuma meta ativa</GoalName>
                <GoalProgress>
                  <GoalBar $color="#6B7280" $width={0} />
                  <GoalPercentage>0%</GoalPercentage>
                </GoalProgress>
              </GoalItem>
            )}
          </GoalsList>
        </ChartCard>
      </ChartsGrid>

      {/* Gráfico de Propostas Diárias */}
      <ChartsGrid>
        <ChartCard style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <ChartTitle>Propostas Diárias</ChartTitle>
              <ChartSubtitle>Ganhas, Perdidas e Geradas por dia do mês</ChartSubtitle>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.875rem'
                }}
              >
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.875rem'
                }}
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Ganhas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '3px', background: '#ef4444', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Perdidas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '3px', background: '#3b82f6', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Geradas</span>
            </div>
          </div>

          {/* Container do Gráfico */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '340px',
            background: '#0f172a',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            gap: '0.5rem',
            opacity: isDailyDataLoading ? 0.5 : 1
          }}>
            {/* Eixo Y (números à esquerda) */}
            {dailyProposalsData.length > 0 && (() => {
              const maxValue = Math.max(...dailyProposalsData.flatMap(d => [d.ganhas, d.perdidas, d.geradas]), 1);
              const ySteps = 5;
              
              return (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  paddingBottom: '2rem',
                  minWidth: '35px',
                  textAlign: 'right'
                }}>
                  {Array.from({ length: ySteps + 1 }, (_, i) => {
                    const value = Math.round(maxValue * (1 - i / ySteps));
                    return (
                      <span key={i} style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {value}
                      </span>
                    );
                  })}
                </div>
              );
            })()}

            {/* Container do SVG */}
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 60}
                    x2="1000"
                    y2={i * 60}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                ))}

                {/* Linhas do gráfico */}
                {dailyProposalsData.length > 0 && (() => {
                  const maxValue = Math.max(...dailyProposalsData.flatMap(d => [d.ganhas, d.perdidas, d.geradas]), 1);
                  const xStep = 1000 / (dailyProposalsData.length - 1 || 1);

                  // Linha de Ganhas (Verde)
                  const ganhasPath = dailyProposalsData.map((d, i) => {
                    const x = i * xStep;
                    const y = 300 - (d.ganhas / maxValue) * 280;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  // Linha de Perdidas (Vermelha)
                  const perdidasPath = dailyProposalsData.map((d, i) => {
                    const x = i * xStep;
                    const y = 300 - (d.perdidas / maxValue) * 280;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  // Linha de Geradas (Azul)
                  const geradasPath = dailyProposalsData.map((d, i) => {
                    const x = i * xStep;
                    const y = 300 - (d.geradas / maxValue) * 280;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  return (
                    <>
                      <path d={geradasPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                      <path d={perdidasPath} fill="none" stroke="#ef4444" strokeWidth="2" />
                      <path d={ganhasPath} fill="none" stroke="#10b981" strokeWidth="2" />
                      
                      {/* Pontos clicáveis em cada dia */}
                      {dailyProposalsData.map((d, i) => {
                        const x = i * xStep;
                        const yGeradas = 300 - (d.geradas / maxValue) * 280;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={yGeradas}
                            r="6"
                            fill="#3b82f6"
                            stroke="#0f172a"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDayClick(d)}
                          >
                            <title>{`Dia ${d.day}: ${d.geradas} propostas`}</title>
                          </circle>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* Labels dos dias (abaixo do gráfico) */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '0.5rem',
                fontSize: '0.7rem',
                color: '#64748b',
                paddingRight: '0.5rem'
              }}>
                {dailyProposalsData.length > 0 && (() => {
                  const daysInMonth = dailyProposalsData.length;
                  const showDays = daysInMonth <= 28 
                    ? [1, 5, 10, 15, 20, 25, daysInMonth]
                    : daysInMonth <= 30
                    ? [1, 5, 10, 15, 20, 25, 30]
                    : [1, 5, 10, 15, 20, 25, 31];
                    
                  return showDays
                    .filter(day => day <= daysInMonth)
                    .map(day => {
                      const dataItem = dailyProposalsData[day - 1];
                      return (
                        <span key={day}>{dataItem?.date || day}</span>
                      );
                    });
                })()}
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginTop: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {dailyProposalsData.reduce((sum, d) => sum + d.ganhas, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Ganhas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {dailyProposalsData.reduce((sum, d) => sum + d.perdidas, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Perdidas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {dailyProposalsData.reduce((sum, d) => sum + d.geradas, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Geradas</div>
            </div>
          </div>
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
                {formatCurrency(data?.salesStats?.averageSale)}
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
              <MetricItemIcon $color="#3b82f6">
                <Target size={24} color="#3b82f6" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Geradas Hoje</MetricItemLabel>
              <MetricItemValue $negative={false}>{formatCurrency(todayStats.valorGeradas)}</MetricItemValue>
              <MetricItemDescription>
                {todayStats.geradas} proposta{todayStats.geradas !== 1 ? 's' : ''} criada{todayStats.geradas !== 1 ? 's' : ''} hoje
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                Hoje
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#10b981">
                <DollarSign size={24} color="#10b981" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Ganhas Hoje</MetricItemLabel>
              <MetricItemValue $negative={false}>{formatCurrency(todayStats.valorGanhas)}</MetricItemValue>
              <MetricItemDescription>
                {todayStats.ganhas} proposta{todayStats.ganhas !== 1 ? 's' : ''} fechada{todayStats.ganhas !== 1 ? 's' : ''} hoje
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                Hoje
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#ef4444">
                <TrendingDown size={24} color="#ef4444" />
              </MetricItemIcon>
              <MetricItemLabel>Propostas Perdidas Hoje</MetricItemLabel>
              <MetricItemValue $negative={false}>{formatCurrency(todayStats.valorPerdidas)}</MetricItemValue>
              <MetricItemDescription>
                {todayStats.perdidas} proposta{todayStats.perdidas !== 1 ? 's' : ''} perdida{todayStats.perdidas !== 1 ? 's' : ''} hoje
              </MetricItemDescription>
              <MetricItemTrend $positive={false}>
                <TrendingDown size={12} />
                Hoje
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#f59e0b">
                <BarChart3 size={24} color="#f59e0b" />
              </MetricItemIcon>
              <MetricItemLabel>Em Negociação Hoje</MetricItemLabel>
              <MetricItemValue $negative={false}>{formatCurrency(todayStats.valorNegociacao)}</MetricItemValue>
              <MetricItemDescription>
                {todayStats.negociacao} proposta{todayStats.negociacao !== 1 ? 's' : ''} em negociação hoje
              </MetricItemDescription>
              <MetricItemTrend $positive>
                <TrendingUp size={12} />
                Hoje
              </MetricItemTrend>
            </MetricItem>
            <MetricItem>
              <MetricItemIcon $color="#10B981">
                <DollarSign size={24} color="#10B981" />
              </MetricItemIcon>
              <MetricItemLabel>Ticket Médio</MetricItemLabel>
              <MetricItemValue $negative>{formatCurrency(data?.salesStats?.averageSale)}</MetricItemValue>
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
                      {formatCurrency(reason.totalValue)}
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

      {/* Modal de Detalhes do Dia */}
      {showDayModal && selectedDayData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={closeDayModal}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: '#f8fafc',
                  margin: '0 0 0.5rem 0'
                }}>
                  Detalhes do Dia {selectedDayData.day}
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {selectedDayData.date}
                </p>
              </div>
              <button
                onClick={closeDayModal}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '1.5rem',
                  lineHeight: '1',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Grid de Estatísticas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {/* Propostas Geradas */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  📝 Propostas Geradas
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#3b82f6',
                  marginBottom: '0.25rem'
                }}>
                  {selectedDayData.geradas}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  {formatCurrency(selectedDayData.valorGeradas)}
                </div>
              </div>

              {/* Propostas Ganhas */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  ✅ Vendas Fechadas
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#10b981',
                  marginBottom: '0.25rem'
                }}>
                  {selectedDayData.ganhas}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  {formatCurrency(selectedDayData.valorGanhas)}
                </div>
              </div>

              {/* Propostas Perdidas */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  ❌ Vendas Perdidas
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#ef4444',
                  marginBottom: '0.25rem'
                }}>
                  {selectedDayData.perdidas}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  fontWeight: '600'
                }}>
                  {formatCurrency(selectedDayData.valorPerdidas)}
                </div>
              </div>

              {/* Propostas em Negociação */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  ⏳ Em Negociação
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#f59e0b',
                  marginBottom: '0.25rem'
                }}>
                  {selectedDayData.negociacao}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#f59e0b',
                  fontWeight: '600'
                }}>
                  {formatCurrency(selectedDayData.valorNegociacao)}
                </div>
              </div>
            </div>

            {/* Resumo Total */}
            <div style={{
              background: 'rgba(100, 116, 139, 0.1)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    💰 Valor Total do Dia
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#f8fafc'
                  }}>
                    {formatCurrency(
                      selectedDayData.valorGeradas + 
                      selectedDayData.valorGanhas + 
                      selectedDayData.valorPerdidas + 
                      selectedDayData.valorNegociacao
                    )}
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Taxa de Conversão
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: selectedDayData.geradas > 0
                      ? ((selectedDayData.ganhas / selectedDayData.geradas) * 100) >= 50
                        ? '#10b981'
                        : '#f59e0b'
                      : '#64748b'
                  }}>
                    {selectedDayData.geradas > 0
                      ? `${((selectedDayData.ganhas / selectedDayData.geradas) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </Container>
  );
};
