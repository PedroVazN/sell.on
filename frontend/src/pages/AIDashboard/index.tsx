import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Sparkles, Zap, BarChart3, PieChart, LineChart as LineChartIcon, Activity, AlertCircle, CheckCircle, Clock, Calculator, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  Title,
  Subtitle,
  MetricsGrid,
  MetricCard,
  MetricValue,
  MetricLabel,
  ChartsGrid,
  ChartCard,
  ChartTitle,
  ChartSubtitle,
  InsightCard,
  InsightTitle,
  InsightMessage,
  InsightAction,
  ProposalList,
  ProposalItem,
  ProposalHeader,
  ProposalInfo,
  ProposalNumber,
  ProposalClient,
  ProposalValue,
  ScoreBar,
  ScoreText,
  LoadingContainer,
  ForecastCard,
  ForecastValue,
  ForecastLabel,
  ConfidenceBadge,
  AnomalyCard,
  AnomalyHeader,
  AnomalyTitle,
  AnomalyPriority,
  AnomalyMessage,
  AnomalyActions,
  AnomalyActionsTitle,
  AnomalyActionList,
  AnomalyActionItem,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  FactorCard,
  FactorHeader,
  FactorName,
  FactorImpact,
  FactorDescription,
  SummaryCard,
  SummaryScore,
  SummaryText,
  ConfidenceBadgeModal
} from './styles';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';

interface AIDashboardData {
  scoreDistribution: {
    alto: number;
    medio: number;
    baixo: number;
    muito_baixo: number;
    totalValue: number;
  };
  topProposals: Array<{
    proposalId: string;
    proposalNumber: string;
    client: string;
    value: number;
    score: number;
    percentual: number;
    level: string;
    action: string;
    factors?: Array<{
      name: string;
      value: number;
      impact: number;
      description?: string;
    }>;
    confidence?: number;
    breakdown?: any;
  }>;
  atRiskProposals: Array<{
    proposalId: string;
    proposalNumber: string;
    client: string;
    seller?: string;
    sellerEmail?: string;
    value: number;
    score: number;
    percentual: number;
    level: string;
    action: string;
  }>;
  insights: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
    icon: string;
    action?: string;
  }>;
  forecast: {
    next7Days: {
      sales: number;
      revenue: number;
      confidence: number;
      lowerBound?: number;
      upperBound?: number;
    };
    next30Days: {
      sales: number;
      revenue: number;
      confidence: number;
      lowerBound?: number;
      upperBound?: number;
    };
    trends?: {
      direction: string;
      rate: number;
      periodComparison: number;
      strength: string;
      description: string;
    };
    goalComparison?: {
      hasGoals: boolean;
      goal?: number;
      forecast?: number;
      difference?: number;
      percentageDiff?: number;
      status?: string;
      achievementProbability?: number;
    };
    insights?: Array<{
      type: string;
      priority: string;
      title: string;
      message: string;
      icon: string;
    }>;
  };
  forecastDetails?: {
    historical: {
      totalDays: number;
      totalSales: number;
      totalRevenue: number;
      avgDailyRevenue: number;
      avgDailySales: number;
      period: {
        start: string;
        end: string;
      };
    };
    seasonality: {
      weeklyPattern: Array<{
        day: string;
        value: number;
        multiplier: number;
      }>;
      detected: boolean;
    };
    sellerForecasts: Array<{
      sellerId: string;
      sellerName: string;
      historical: {
        sales: number;
        revenue: number;
        avgSaleValue: number;
        marketShare: number;
      };
      forecast: {
        next30Days: {
          sales: number;
          revenue: number;
        };
      };
    }>;
  };
  topSellers: Array<{
    name: string;
    proposals: number;
    avgScore: number;
    totalValue: number;
    weight?: number; // Peso em porcentagem (market share)
  }>;
  topClients: Array<{
    name: string;
    proposals: number;
    avgScore: number;
  }>;
  conversionRates: Array<{
    level: string;
    rate: number;
    closed: number;
    total: number;
  }>;
  stats: {
    totalProposalsAnalyzed: number;
    avgScore: number;
    highScoreCount: number;
    riskCount: number;
  };
  anomalies?: {
    total: number;
    byPriority: {
      critica: number;
      alta: number;
      media: number;
      baixa: number;
    };
    anomalies: Array<{
      type: string;
      priority: string;
      title: string;
      message: string;
      details: any;
      suggestedActions: string[];
      detectedAt: string;
      icon: string;
    }>;
  };
}

export const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getAIDashboard();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Erro ao carregar dados do dashboard de IA');
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard de IA:', err);
      setError('Erro ao carregar dados do dashboard de IA');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalClick = (proposalId: string) => {
    navigate(`/proposals/edit/${proposalId}`);
  };

  // Carregar cálculo detalhado de uma proposta
  const loadProposalCalculation = async (proposalId: string) => {
    try {
      const response = await apiService.getProposalScore(proposalId);
      if (response.success && response.data) {
        setSelectedProposal({
          ...selectedProposal,
          factors: response.data.factors || [],
          confidence: response.data.confidence,
          breakdown: response.data
        });
        setShowCalculationModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar cálculo:', error);
      // Mesmo assim mostrar modal com dados que temos
      setShowCalculationModal(true);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Brain size={48} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <div>Carregando insights de IA...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <Header>
          <Title>Dashboard IA & ML</Title>
          <Subtitle>{error || 'Nenhum dado disponível'}</Subtitle>
        </Header>
      </Container>
    );
  }

  // Dados para gráfico de pizza (distribuição de scores)
  const scorePieData = [
    { name: 'Alta Chance', value: data.scoreDistribution.alto, color: '#10b981' },
    { name: 'Média Chance', value: data.scoreDistribution.medio, color: '#fbbf24' },
    { name: 'Baixa Chance', value: data.scoreDistribution.baixo, color: '#ef4444' },
    { name: 'Muito Baixa', value: data.scoreDistribution.muito_baixo, color: '#991b1b' },
  ].filter(item => item.value > 0);

  // Dados para gráfico de barras (taxa de conversão por score)
  const conversionBarData = data.conversionRates.map(cr => ({
    level: cr.level === 'alto' ? 'Alto' : 
           cr.level === 'medio' ? 'Médio' : 
           cr.level === 'baixo' ? 'Baixo' : 'Muito Baixo',
    rate: Math.round(cr.rate),
    closed: cr.closed,
    total: cr.total
  }));

  // Dados para gráfico de vendedores
  if (!data) {
    return (
      <Container>
        <LoadingContainer>
          <Brain size={48} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <div>Carregando dashboard de IA...</div>
        </LoadingContainer>
      </Container>
    );
  }

  const sellersBarData = data.topSellers.map(seller => ({
    name: seller.name.split(' ')[0], // Primeiro nome
    score: Math.round(seller.avgScore),
    proposals: seller.proposals,
    weight: seller.weight || 0 // Peso (market share)
  }));

  return (
    <Container>
      <Header>
        <Title>Dashboard IA & Machine Learning</Title>
        <Subtitle>
          Insights inteligentes, previsões e análises automáticas para otimizar suas vendas
        </Subtitle>
      </Header>

      {/* Métricas Principais */}
      <MetricsGrid>
        <MetricCard>
          <MetricValue $color="#6366f1">{data.stats.totalProposalsAnalyzed}</MetricValue>
          <MetricLabel>Propostas Analisadas</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricValue $color="#10b981">{Math.round(data.stats.avgScore)}%</MetricValue>
          <MetricLabel>Score Médio</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricValue $color="#10b981">{data.stats.highScoreCount}</MetricValue>
          <MetricLabel>Alta Probabilidade</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricValue $color="#ef4444">{data.stats.riskCount}</MetricValue>
          <MetricLabel>Propostas em Risco</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricValue 
            $color="#fbbf24" 
            style={{ 
              fontSize: 'clamp(1.4rem, 3.2vw, 2.5rem)',
              lineHeight: '1.1',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {formatCurrency(data.forecast.next7Days.revenue)}
          </MetricValue>
          <MetricLabel>Previsão 7 Dias</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricValue 
            $color="#8b5cf6" 
            style={{ 
              fontSize: 'clamp(1.4rem, 3.2vw, 2.5rem)',
              lineHeight: '1.1',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {formatCurrency(data.forecast.next30Days.revenue)}
          </MetricValue>
          <MetricLabel>Previsão 30 Dias</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {/* Insights Automáticos */}
      {data.insights.length > 0 && (
        <ChartsGrid style={{ gridTemplateColumns: '1fr' }}>
          <ChartCard>
            <ChartTitle>
              <Sparkles size={24} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
              Insights Automáticos da IA
            </ChartTitle>
            <ChartSubtitle>
              Recomendações inteligentes baseadas em análise dos dados
            </ChartSubtitle>
            
            {data.insights.map((insight, index) => (
              <InsightCard 
                key={index} 
                $type={insight.type as any}
              >
                <InsightTitle>
                  <span style={{ fontSize: '1.25rem' }}>{insight.icon}</span>
                  {insight.title}
                </InsightTitle>
                <InsightMessage>{insight.message}</InsightMessage>
                {insight.action && (
                  <InsightAction>🤖 {insight.action}</InsightAction>
                )}
              </InsightCard>
            ))}
          </ChartCard>
        </ChartsGrid>
      )}

      {/* Gráficos */}
      <ChartsGrid>
        {/* Distribuição de Scores */}
        <ChartCard>
          <ChartTitle>
            <PieChart size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
            Distribuição de Scores
          </ChartTitle>
          <ChartSubtitle>
            Propostas categorizadas por probabilidade de fechamento
          </ChartSubtitle>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={scorePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {scorePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }} 
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Taxa de Conversão por Score */}
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
            Taxa de Conversão por Score
          </ChartTitle>
          <ChartSubtitle>
            Probabilidade real de fechamento baseada em histórico
          </ChartSubtitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="level" stroke="#A3A3A3" />
              <YAxis stroke="#A3A3A3" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Bar 
                dataKey="rate" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              >
                {conversionBarData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.level === 'Alto' ? '#10b981' :
                      entry.level === 'Médio' ? '#fbbf24' :
                      entry.level === 'Baixo' ? '#ef4444' : '#991b1b'
                    }
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      {/* Top Propostas e Propostas em Risco */}
      <ChartsGrid>
        {/* Top Propostas (Maior Score) */}
        <ChartCard>
          <ChartTitle>
            <TrendingUp size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
            Top 10 Propostas (Maior Score)
          </ChartTitle>
          <ChartSubtitle>
            Propostas com maior probabilidade de fechamento
          </ChartSubtitle>
          <ProposalList>
            {data.topProposals.map((proposal) => (
              <ProposalItem 
                key={proposal.proposalId}
              >
                <ProposalHeader>
                  <ProposalInfo>
                    <ProposalNumber>{proposal.proposalNumber}</ProposalNumber>
                    <ProposalClient>{proposal.client}</ProposalClient>
                  </ProposalInfo>
                  <ProposalValue>{formatCurrency(proposal.value)}</ProposalValue>
                </ProposalHeader>
                <ScoreBar 
                  $percentage={proposal.percentual} 
                  $level={proposal.level}
                />
                <ScoreText $level={proposal.level}>
                  {proposal.percentual}% chance de fechar - {proposal.action}
                </ScoreText>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProposalClick(proposal.proposalId);
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      color: '#a5b4fc',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                    }}
                  >
                    Ver Proposta
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProposal(proposal);
                      // Se não tem factors, buscar do backend
                      if (!proposal.factors || proposal.factors.length === 0) {
                        loadProposalCalculation(proposal.proposalId);
                      } else {
                        setShowCalculationModal(true);
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      color: '#c4b5fd',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Calculator size={14} />
                    Ver Cálculo
                  </button>
                </div>
              </ProposalItem>
            ))}
          </ProposalList>
        </ChartCard>

        {/* Propostas em Risco */}
        <ChartCard>
          <ChartTitle>
            <AlertTriangle size={20} style={{ marginRight: '0.5rem', display: 'inline-block', color: '#ef4444' }} />
            Propostas em Risco
          </ChartTitle>
          <ChartSubtitle>
            Propostas que precisam de atenção imediata
          </ChartSubtitle>
          <ProposalList>
            {data.atRiskProposals.length > 0 ? (
              data.atRiskProposals.map((proposal) => (
                <ProposalItem 
                  key={proposal.proposalId}
                  onClick={() => handleProposalClick(proposal.proposalId)}
                >
                  <ProposalHeader>
                    <ProposalInfo>
                      <ProposalNumber>{proposal.proposalNumber}</ProposalNumber>
                      <ProposalClient>{proposal.client}</ProposalClient>
                      {proposal.seller && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginTop: '0.25rem'
                        }}>
                          Vendedor: {proposal.seller}
                        </div>
                      )}
                    </ProposalInfo>
                    <ProposalValue>{formatCurrency(proposal.value)}</ProposalValue>
                  </ProposalHeader>
                  <ScoreBar 
                    $percentage={proposal.percentual} 
                    $level={proposal.level}
                  />
                  <ScoreText $level={proposal.level}>
                    ⚠️ {proposal.percentual}% chance - {proposal.action}
                  </ScoreText>
                </ProposalItem>
              ))
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem'
              }}>
                🎉 Nenhuma proposta em risco no momento!
              </div>
            )}
          </ProposalList>
        </ChartCard>
      </ChartsGrid>

      {/* Previsões e Performance */}
      <ChartsGrid>
        {/* Previsão de Vendas Avançada */}
        <ChartCard>
          <ChartTitle>
            <LineChartIcon size={24} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
            Previsão de Vendas com IA
          </ChartTitle>
          <ChartSubtitle>
            Análise estatística avançada com detecção de tendências e sazonalidade
          </ChartSubtitle>
          
          {/* Cards de Resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <ForecastCard>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Próximos 7 dias</div>
              <ForecastValue style={{ fontSize: '1.75rem' }}>{data.forecast.next7Days.sales}</ForecastValue>
              <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                {formatCurrency(data.forecast.next7Days.revenue)}
              </div>
              {data.forecast.next7Days.lowerBound && data.forecast.next7Days.upperBound && (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.5rem' }}>
                  {formatCurrency(data.forecast.next7Days.lowerBound)} - {formatCurrency(data.forecast.next7Days.upperBound)}
                </div>
              )}
              <ConfidenceBadge>
                {data.forecast.next7Days.confidence}% confiança
              </ConfidenceBadge>
            </ForecastCard>

            <ForecastCard>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Próximos 30 dias</div>
              <ForecastValue style={{ fontSize: '1.75rem' }}>{data.forecast.next30Days.sales}</ForecastValue>
              <div style={{ fontSize: '1.25rem', color: '#6366f1', fontWeight: '600', marginBottom: '0.5rem' }}>
                {formatCurrency(data.forecast.next30Days.revenue)}
              </div>
              {data.forecast.next30Days.lowerBound && data.forecast.next30Days.upperBound && (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.5rem' }}>
                  {formatCurrency(data.forecast.next30Days.lowerBound)} - {formatCurrency(data.forecast.next30Days.upperBound)}
                </div>
              )}
              <ConfidenceBadge>
                {data.forecast.next30Days.confidence}% confiança
              </ConfidenceBadge>
            </ForecastCard>

            {/* Comparação com Meta */}
            {data.forecast.goalComparison && data.forecast.goalComparison.hasGoals && (
              <ForecastCard style={{ 
                background: data.forecast.goalComparison.status === 'acima' 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                borderColor: data.forecast.goalComparison.status === 'acima' 
                  ? 'rgba(16, 185, 129, 0.5)' 
                  : 'rgba(239, 68, 68, 0.5)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Meta vs Previsão</div>
                <ForecastValue style={{ 
                  fontSize: '1.5rem',
                  color: data.forecast.goalComparison.status === 'acima' ? '#10b981' : '#ef4444'
                }}>
                  {data.forecast.goalComparison.status === 'acima' ? '+' : ''}{data.forecast.goalComparison.percentageDiff?.toFixed(1)}%
                </ForecastValue>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                  {formatCurrency(data.forecast.goalComparison.forecast || 0)} / {formatCurrency(data.forecast.goalComparison.goal || 0)}
                </div>
                <ConfidenceBadge style={{ 
                  background: data.forecast.goalComparison.status === 'acima' 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  borderColor: data.forecast.goalComparison.status === 'acima' 
                    ? 'rgba(16, 185, 129, 0.4)' 
                    : 'rgba(239, 68, 68, 0.4)',
                  color: data.forecast.goalComparison.status === 'acima' ? '#34d399' : '#fca5a5'
                }}>
                  {data.forecast.goalComparison.achievementProbability}% probabilidade
                </ConfidenceBadge>
              </ForecastCard>
            )}

            {/* Tendência */}
            {data.forecast.trends && (
              <ForecastCard style={{ 
                background: data.forecast.trends.direction === 'crescimento'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                  Tendência
                </div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {data.forecast.trends.direction === 'crescimento' ? '📈' : '📉'}
                </div>
                <div style={{ fontSize: '1rem', color: data.forecast.trends.direction === 'crescimento' ? '#10b981' : '#fbbf24', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {Math.abs(data.forecast.trends.periodComparison).toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {data.forecast.trends.strength === 'forte' ? 'Forte' : data.forecast.trends.strength === 'moderada' ? 'Moderada' : 'Fraca'}
                </div>
              </ForecastCard>
            )}
          </div>

          {/* Gráfico de Previsão */}
          {data.forecastDetails && data.forecastDetails.historical && (
            <div style={{ marginTop: '2rem' }}>
              <ChartSubtitle style={{ marginBottom: '1rem' }}>
                Visualização de Tendência e Previsão
              </ChartSubtitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { name: 'Histórico', value: data.forecastDetails.historical.avgDailyRevenue },
                  { name: 'Previsão 7d', value: data.forecast.next7Days.revenue / 7 },
                  { name: 'Previsão 30d', value: data.forecast.next30Days.revenue / 30 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#A3A3A3"
                    tick={{ fill: '#A3A3A3' }}
                  />
                  <YAxis 
                    stroke="#A3A3A3"
                    tick={{ fill: '#A3A3A3' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#6366f1' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights da Previsão */}
          {data.forecast.insights && data.forecast.insights.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <ChartSubtitle style={{ marginBottom: '1rem' }}>Insights da Previsão</ChartSubtitle>
              {data.forecast.insights.map((insight, index) => (
                <InsightCard 
                  key={index}
                  $type={insight.type as any}
                  style={{ marginBottom: '1rem' }}
                >
                  <InsightTitle>
                    <span style={{ fontSize: '1.25rem' }}>{insight.icon}</span>
                    {insight.title}
                  </InsightTitle>
                  <InsightMessage>{insight.message}</InsightMessage>
                </InsightCard>
              ))}
            </div>
          )}

          {/* Previsão por Vendedor (se admin) */}
          {data.forecastDetails && data.forecastDetails.sellerForecasts && data.forecastDetails.sellerForecasts.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <ChartSubtitle style={{ marginBottom: '1rem' }}>Previsão por Vendedor (Próximos 30 dias)</ChartSubtitle>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.forecastDetails.sellerForecasts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="sellerName" 
                    stroke="#A3A3A3"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#A3A3A3', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#A3A3A3"
                    tick={{ fill: '#A3A3A3' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar 
                    dataKey="forecast.next30Days.revenue" 
                    fill="url(#forecastGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sazonalidade Semanal */}
          {data.forecastDetails && data.forecastDetails.seasonality && data.forecastDetails.seasonality.detected && (
            <div style={{ marginTop: '2rem' }}>
              <ChartSubtitle style={{ marginBottom: '1rem' }}>Padrão Semanal Detectado</ChartSubtitle>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem' 
              }}>
                {data.forecastDetails.seasonality.weeklyPattern.map((day, index) => (
                  <div 
                    key={index}
                    style={{
                      background: day.multiplier > 1.1 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : day.multiplier < 0.9 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : 'rgba(99, 102, 241, 0.15)',
                      border: `1px solid ${day.multiplier > 1.1 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : day.multiplier < 0.9 
                        ? 'rgba(239, 68, 68, 0.3)' 
                        : 'rgba(99, 102, 241, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
                      {day.day.substring(0, 3)}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>
                      {(day.multiplier * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Top Vendedores */}
        {data.topSellers.length > 0 && (
          <ChartCard>
            <ChartTitle>
              <Zap size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
              Top Vendedores (Score Médio)
            </ChartTitle>
            <ChartSubtitle>
              Vendedores com melhor performance preditiva
            </ChartSubtitle>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sellersBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis type="number" stroke="#A3A3A3" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#A3A3A3" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1A1A', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === 'score') {
                      return `${value}% (Score)`;
                    }
                    if (name === 'weight') {
                      return `${value.toFixed(1)}% (Peso/Market Share)`;
                    }
                    return `${value}`;
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="url(#colorGradient2)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="weight" 
                  fill="url(#weightGradient)"
                  radius={[0, 4, 4, 0]}
                  opacity={0.6}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    paddingTop: '1rem'
                  }}
                  formatter={(value) => {
                    if (value === 'score') return 'Score Médio';
                    if (value === 'weight') return 'Peso (Market Share)';
                    return value;
                  }}
                />
                <defs>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Lista com peso */}
            <div style={{ 
              marginTop: '1.5rem',
              display: 'grid',
              gap: '0.75rem'
            }}>
              {data.topSellers.map((seller, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '0.25rem'
                    }}>
                      {index + 1}. {seller.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {seller.proposals} proposta(s) • Score: {Math.round(seller.avgScore)}%
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#a78bfa'
                  }}>
                    {seller.weight?.toFixed(1) || 0}% peso
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </ChartsGrid>

      {/* Top Clientes */}
      {data.topClients.length > 0 && (
        <ChartsGrid style={{ gridTemplateColumns: '1fr' }}>
          <ChartCard>
            <ChartTitle>
              <Target size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
              Top Clientes (Alto Potencial)
            </ChartTitle>
            <ChartSubtitle>
              Clientes com histórico positivo e alta probabilidade de conversão
            </ChartSubtitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {data.topClients.map((client, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    {index === 0 && '🏆 '}{client.name}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                    {Math.round(client.avgScore)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Score médio
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                    {client.proposals} proposta{client.proposals !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </ChartsGrid>
      )}

      {/* Detecção de Anomalias */}
      {data.anomalies && data.anomalies.total > 0 && (
        <ChartsGrid style={{ gridTemplateColumns: '1fr' }}>
          <ChartCard>
            <ChartTitle>
              <AlertCircle size={24} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
              Detecção de Anomalias
            </ChartTitle>
            <ChartSubtitle>
              Padrões incomuns detectados automaticamente pela IA
            </ChartSubtitle>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              {data.anomalies.byPriority.critica > 0 && (
                <MetricCard style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <MetricValue $color="#ef4444">{data.anomalies.byPriority.critica}</MetricValue>
                  <MetricLabel>Críticas</MetricLabel>
                </MetricCard>
              )}
              {data.anomalies.byPriority.alta > 0 && (
                <MetricCard style={{ background: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                  <MetricValue $color="#f97316">{data.anomalies.byPriority.alta}</MetricValue>
                  <MetricLabel>Altas</MetricLabel>
                </MetricCard>
              )}
              {data.anomalies.byPriority.media > 0 && (
                <MetricCard style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                  <MetricValue $color="#fbbf24">{data.anomalies.byPriority.media}</MetricValue>
                  <MetricLabel>Médias</MetricLabel>
                </MetricCard>
              )}
              {data.anomalies.byPriority.baixa > 0 && (
                <MetricCard style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <MetricValue $color="#3b82f6">{data.anomalies.byPriority.baixa}</MetricValue>
                  <MetricLabel>Baixas</MetricLabel>
                </MetricCard>
              )}
            </div>

            {data.anomalies.anomalies.map((anomaly, index) => (
              <AnomalyCard key={index} $priority={anomaly.priority as any}>
                <AnomalyHeader>
                  <AnomalyTitle>
                    <span>{anomaly.icon}</span>
                    <span>{anomaly.title}</span>
                  </AnomalyTitle>
                  <AnomalyPriority $priority={anomaly.priority}>
                    {anomaly.priority === 'critica' ? 'CRÍTICA' : 
                     anomaly.priority === 'alta' ? 'ALTA' :
                     anomaly.priority === 'media' ? 'MÉDIA' : 'BAIXA'}
                  </AnomalyPriority>
                </AnomalyHeader>
                <AnomalyMessage>{anomaly.message}</AnomalyMessage>
                {anomaly.suggestedActions && anomaly.suggestedActions.length > 0 && (
                  <AnomalyActions>
                    <AnomalyActionsTitle>
                      <CheckCircle size={16} />
                      Ações Recomendadas:
                    </AnomalyActionsTitle>
                    <AnomalyActionList>
                      {anomaly.suggestedActions.map((action, idx) => (
                        <AnomalyActionItem key={idx}>{action}</AnomalyActionItem>
                      ))}
                    </AnomalyActionList>
                  </AnomalyActions>
                )}
                <div style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.75rem', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Clock size={12} />
                  Detectado: {new Date(anomaly.detectedAt).toLocaleString('pt-BR')}
                </div>
              </AnomalyCard>
            ))}
          </ChartCard>
        </ChartsGrid>
      )}

      {/* Estatísticas Detalhadas */}
      <ChartsGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <ChartCard>
          <ChartTitle style={{ fontSize: '1.25rem' }}>📊 Distribuição de Scores</ChartTitle>
          <div style={{ marginTop: '1rem' }}>
            {Object.entries({
              'Alta Chance': { count: data.scoreDistribution.alto, color: '#10b981' },
              'Média Chance': { count: data.scoreDistribution.medio, color: '#fbbf24' },
              'Baixa Chance': { count: data.scoreDistribution.baixo, color: '#ef4444' },
              'Muito Baixa': { count: data.scoreDistribution.muito_baixo, color: '#991b1b' },
            }).map(([label, info]) => (
              <div key={label} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: info.color 
                  }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>{label}</span>
                </div>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem' }}>{info.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard>
          <ChartTitle style={{ fontSize: '1.25rem' }}>💡 Valor Total por Categoria</ChartTitle>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#6366f1',
              marginBottom: '0.5rem'
            }}>
              {formatCurrency(data.scoreDistribution.totalValue)}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Total em propostas em negociação
            </div>
          </div>
        </ChartCard>

        <ChartCard>
          <ChartTitle style={{ fontSize: '1.25rem' }}>🎯 Taxa de Conversão</ChartTitle>
          <div style={{ marginTop: '1rem' }}>
            {data.conversionRates.map((cr, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'capitalize'
                  }}>
                    {cr.level === 'alto' ? 'Alta' : 
                     cr.level === 'medio' ? 'Média' : 
                     cr.level === 'baixo' ? 'Baixa' : 'Muito Baixa'}
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    {Math.round(cr.rate)}%
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${cr.rate}%`, 
                    height: '100%', 
                    background: cr.level === 'alto' ? '#10b981' :
                               cr.level === 'medio' ? '#fbbf24' :
                               cr.level === 'baixo' ? '#ef4444' : '#991b1b',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '0.25rem'
                }}>
                  {cr.closed} de {cr.total} propostas fecharam
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </ChartsGrid>

      {/* Modal de Cálculo do Score */}
      {showCalculationModal && selectedProposal && (
        <ModalOverlay onClick={() => setShowCalculationModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Calculator size={24} />
                Análise Detalhada do Score
              </ModalTitle>
              <ModalCloseButton onClick={() => setShowCalculationModal(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              {/* Resumo */}
              <SummaryCard>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                  Proposta {selectedProposal.proposalNumber}
                </div>
                <SummaryScore>{selectedProposal.percentual}%</SummaryScore>
                <SummaryText>
                  Probabilidade de Fechamento
                </SummaryText>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '0.5rem'
                }}>
                  Cliente: {selectedProposal.client} • Valor: {formatCurrency(selectedProposal.value)}
                </div>
                {selectedProposal.confidence && (
                  <ConfidenceBadgeModal>
                    Confiança: {selectedProposal.confidence}%
                  </ConfidenceBadgeModal>
                )}
              </SummaryCard>

              {/* Fatores de Análise */}
              {selectedProposal.factors && selectedProposal.factors.length > 0 ? (
                <>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Brain size={20} />
                    Fatores de Análise
                  </div>
                  {selectedProposal.factors.map((factor: any, index: number) => (
                    <FactorCard key={index} $impact={factor.impact || 0}>
                      <FactorHeader>
                        <FactorName>{factor.name || `Fator ${index + 1}`}</FactorName>
                        <FactorImpact $impact={factor.impact || 0}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact?.toFixed(1) || factor.value?.toFixed(1) || 0}%
                        </FactorImpact>
                      </FactorHeader>
                      {factor.description && (
                        <FactorDescription>
                          {factor.description}
                        </FactorDescription>
                      )}
                      {factor.value && (
                        <FactorDescription style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                          Valor: {typeof factor.value === 'number' ? factor.value.toFixed(2) : factor.value}
                        </FactorDescription>
                      )}
                    </FactorCard>
                  ))}
                </>
              ) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem'
                }}>
                  Detalhes do cálculo não disponíveis. A análise foi feita com base em múltiplos fatores combinados.
                </div>
              )}

              {/* Ação Recomendada */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                borderLeft: '4px solid #6366f1'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#a5b4fc',
                  marginBottom: '0.5rem'
                }}>
                  🎯 Ação Recomendada
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  color: '#ffffff'
                }}>
                  {selectedProposal.action || 'Analisar proposta e seguir o processo padrão'}
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

