import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Sparkles, Zap, BarChart3, PieChart, LineChart as LineChartIcon, Activity } from 'lucide-react';
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
  ConfidenceBadge
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
  }>;
  atRiskProposals: Array<{
    proposalId: string;
    proposalNumber: string;
    client: string;
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
    };
    next30Days: {
      sales: number;
      revenue: number;
      confidence: number;
    };
  };
  topSellers: Array<{
    name: string;
    proposals: number;
    avgScore: number;
    totalValue: number;
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
}

export const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const sellersBarData = data.topSellers.map(seller => ({
    name: seller.name.split(' ')[0], // Primeiro nome
    score: Math.round(seller.avgScore),
    proposals: seller.proposals
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
                onClick={() => handleProposalClick(proposal.proposalId)}
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
        {/* Previsão de Vendas */}
        <ChartCard>
          <ChartTitle>
            <Target size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
            Previsão de Vendas
          </ChartTitle>
          <ChartSubtitle>
            Baseado em análise de séries temporais e padrões históricos
          </ChartSubtitle>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <ForecastCard>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>Próximos 7 dias</div>
              <ForecastValue>{data.forecast.next7Days.sales}</ForecastValue>
              <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600' }}>
                {formatCurrency(data.forecast.next7Days.revenue)}
              </div>
              <ConfidenceBadge>
                {data.forecast.next7Days.confidence}% de confiança
              </ConfidenceBadge>
            </ForecastCard>

            <ForecastCard>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>Próximos 30 dias</div>
              <ForecastValue>{data.forecast.next30Days.sales}</ForecastValue>
              <div style={{ fontSize: '1.25rem', color: '#6366f1', fontWeight: '600' }}>
                {formatCurrency(data.forecast.next30Days.revenue)}
              </div>
              <ConfidenceBadge>
                {data.forecast.next30Days.confidence}% de confiança
              </ConfidenceBadge>
            </ForecastCard>
          </div>
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
                  formatter={(value: number) => `${value}%`}
                />
                <Bar 
                  dataKey="score" 
                  fill="url(#colorGradient2)"
                  radius={[0, 4, 4, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
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
    </Container>
  );
};

