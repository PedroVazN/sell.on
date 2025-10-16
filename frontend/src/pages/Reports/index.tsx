import React, { useState, useEffect } from 'react';
import { FileText, TrendingDown, Calendar, AlertCircle, Download, Filter, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import * as S from './styles';

interface LossReport {
  _id: string;
  proposalNumber: string;
  client: {
    nome: string;
    empresa?: string;
  };
  distributor: {
    apelido: string;
  };
  totalValue: number;
  lossReason: string;
  lossDescription: string;
  lossDate: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
  products: Array<{
    product: {
      name: string;
    };
    quantity: number;
    unitPrice: number;
  }>;
}

interface LossStats {
  totalLost: number;
  totalValue: number;
  reasonsBreakdown: Array<{
    reason: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

const lossReasonLabels: { [key: string]: string } = {
  preco_concorrente: 'Preço Concorrente',
  condicao_pagamento: 'Condição de Pagamento',
  prazo_entrega: 'Prazo de Entrega',
  qualidade_produto: 'Qualidade do Produto',
  atendimento: 'Atendimento',
  cliente_desistiu: 'Cliente Desistiu',
  outro: 'Outro'
};

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lostProposals, setLostProposals] = useState<LossReport[]>([]);
  const [stats, setStats] = useState<LossStats | null>(null);
  const [filteredProposals, setFilteredProposals] = useState<LossReport[]>([]);
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lostProposals, dateFrom, dateTo, selectedReason, selectedSeller]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar propostas perdidas
      const response = await apiService.getProposals(1, 1000);
      
      if (response.success && response.data) {
        const lost = response.data.filter(
          (p: any) => p.status === 'venda_perdida' && p.lossReason
        );
        
        setLostProposals(lost);
        calculateStats(lost);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (proposals: LossReport[]) => {
    const totalLost = proposals.length;
    const totalValue = proposals.reduce((sum, p) => sum + (p.totalValue || 0), 0);

    // Agrupar por motivo
    const reasonsMap = new Map<string, { count: number; value: number }>();
    
    proposals.forEach(p => {
      const reason = p.lossReason || 'outro';
      const current = reasonsMap.get(reason) || { count: 0, value: 0 };
      reasonsMap.set(reason, {
        count: current.count + 1,
        value: current.value + (p.totalValue || 0)
      });
    });

    const reasonsBreakdown = Array.from(reasonsMap.entries()).map(([reason, data]) => ({
      reason,
      count: data.count,
      value: data.value,
      percentage: (data.count / totalLost) * 100
    })).sort((a, b) => b.count - a.count);

    // Tendência mensal
    const monthsMap = new Map<string, { count: number; value: number }>();
    
    proposals.forEach(p => {
      const date = new Date(p.lossDate || p.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthsMap.get(monthKey) || { count: 0, value: 0 };
      monthsMap.set(monthKey, {
        count: current.count + 1,
        value: current.value + (p.totalValue || 0)
      });
    });

    const monthlyTrend = Array.from(monthsMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setStats({
      totalLost,
      totalValue,
      reasonsBreakdown,
      monthlyTrend
    });
  };

  const applyFilters = () => {
    let filtered = [...lostProposals];

    if (dateFrom) {
      filtered = filtered.filter(p => {
        const lossDate = new Date(p.lossDate || p.createdAt);
        return lossDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(p => {
        const lossDate = new Date(p.lossDate || p.createdAt);
        return lossDate <= new Date(dateTo);
      });
    }

    if (selectedReason) {
      filtered = filtered.filter(p => p.lossReason === selectedReason);
    }

    if (selectedSeller) {
      filtered = filtered.filter(p => p.createdBy?._id === selectedSeller);
    }

    setFilteredProposals(filtered);
    calculateStats(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const exportToCSV = () => {
    const headers = [
      'Número Proposta',
      'Cliente',
      'Distribuidor',
      'Vendedor',
      'Valor Total',
      'Motivo',
      'Descrição',
      'Data Perda',
      'Data Criação'
    ];

    const rows = filteredProposals.map(p => [
      p.proposalNumber || '-',
      p.client?.nome || '-',
      p.distributor?.apelido || '-',
      p.createdBy?.name || '-',
      p.totalValue || 0,
      lossReasonLabels[p.lossReason] || p.lossReason,
      (p.lossDescription || '-').replace(/,/g, ';'),
      formatDate(p.lossDate || p.createdAt),
      formatDate(p.createdAt)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-perdas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <S.Container>
        <S.LoadingContainer>
          <S.LoadingSpinner />
          <p>Carregando relatórios...</p>
        </S.LoadingContainer>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.TitleSection>
          <S.Title>
            <FileText size={32} />
            Relatórios de Vendas
          </S.Title>
          <S.Subtitle>
            Análise completa de propostas perdidas e oportunidades de melhoria
          </S.Subtitle>
        </S.TitleSection>

        <S.ExportButton onClick={exportToCSV}>
          <Download size={20} />
          Exportar CSV
        </S.ExportButton>
      </S.Header>

      {/* Cards de Estatísticas */}
      <S.StatsGrid>
        <S.StatCard variant="danger">
          <S.StatIcon>
            <TrendingDown size={24} />
          </S.StatIcon>
          <S.StatContent>
            <S.StatLabel>Total de Perdas</S.StatLabel>
            <S.StatValue>{stats?.totalLost || 0}</S.StatValue>
            <S.StatSubtext>propostas</S.StatSubtext>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard variant="warning">
          <S.StatIcon>
            <AlertCircle size={24} />
          </S.StatIcon>
          <S.StatContent>
            <S.StatLabel>Valor Perdido</S.StatLabel>
            <S.StatValue>{formatCurrency(stats?.totalValue || 0)}</S.StatValue>
            <S.StatSubtext>em oportunidades</S.StatSubtext>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard variant="info">
          <S.StatIcon>
            <BarChart3 size={24} />
          </S.StatIcon>
          <S.StatContent>
            <S.StatLabel>Principal Motivo</S.StatLabel>
            <S.StatValue style={{ fontSize: '1.2rem' }}>
              {stats?.reasonsBreakdown[0] 
                ? lossReasonLabels[stats.reasonsBreakdown[0].reason] 
                : '-'}
            </S.StatValue>
            <S.StatSubtext>
              {stats?.reasonsBreakdown[0]?.percentage.toFixed(1)}% das perdas
            </S.StatSubtext>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard variant="neutral">
          <S.StatIcon>
            <Calendar size={24} />
          </S.StatIcon>
          <S.StatContent>
            <S.StatLabel>Período Analisado</S.StatLabel>
            <S.StatValue style={{ fontSize: '1rem' }}>
              {filteredProposals.length > 0 ? (
                <>
                  {formatDate(filteredProposals[filteredProposals.length - 1]?.lossDate || filteredProposals[filteredProposals.length - 1]?.createdAt)}
                  {' - '}
                  {formatDate(filteredProposals[0]?.lossDate || filteredProposals[0]?.createdAt)}
                </>
              ) : 'Sem dados'}
            </S.StatValue>
            <S.StatSubtext>{filteredProposals.length} registros</S.StatSubtext>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      {/* Filtros */}
      <S.FiltersSection>
        <S.FiltersTitle>
          <Filter size={20} />
          Filtros
        </S.FiltersTitle>
        
        <S.FiltersGrid>
          <S.FilterGroup>
            <S.FilterLabel>Data Início</S.FilterLabel>
            <S.FilterInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>Data Fim</S.FilterLabel>
            <S.FilterInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>Motivo da Perda</S.FilterLabel>
            <S.FilterSelect
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">Todos os motivos</option>
              {Object.entries(lossReasonLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </S.FilterSelect>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.ClearButton onClick={() => {
              setDateFrom('');
              setDateTo('');
              setSelectedReason('');
              setSelectedSeller('');
            }}>
              Limpar Filtros
            </S.ClearButton>
          </S.FilterGroup>
        </S.FiltersGrid>
      </S.FiltersSection>

      {/* Gráficos de Análise */}
      <S.ChartsGrid>
        <S.ChartCard>
          <S.ChartTitle>
            <PieChart size={20} />
            Distribuição por Motivo
          </S.ChartTitle>
          <S.ReasonsList>
            {stats?.reasonsBreakdown.map((item, index) => (
              <S.ReasonItem key={item.reason}>
                <S.ReasonInfo>
                  <S.ReasonRank>#{index + 1}</S.ReasonRank>
                  <S.ReasonName>{lossReasonLabels[item.reason]}</S.ReasonName>
                </S.ReasonInfo>
                <S.ReasonStats>
                  <S.ReasonCount>{item.count} perdas</S.ReasonCount>
                  <S.ReasonValue>{formatCurrency(item.value)}</S.ReasonValue>
                  <S.ReasonPercentage>{item.percentage.toFixed(1)}%</S.ReasonPercentage>
                </S.ReasonStats>
                <S.ReasonBar>
                  <S.ReasonBarFill $percentage={item.percentage} $color={
                    item.percentage > 30 ? '#ef4444' :
                    item.percentage > 20 ? '#f59e0b' :
                    item.percentage > 10 ? '#eab308' :
                    '#10b981'
                  } />
                </S.ReasonBar>
              </S.ReasonItem>
            ))}
          </S.ReasonsList>
        </S.ChartCard>

        <S.ChartCard>
          <S.ChartTitle>
            <BarChart3 size={20} />
            Tendência Mensal
          </S.ChartTitle>
          <S.TrendList>
            {stats?.monthlyTrend.map((item) => (
              <S.TrendItem key={item.month}>
                <S.TrendMonth>
                  {new Date(item.month + '-01').toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </S.TrendMonth>
                <S.TrendStats>
                  <S.TrendCount>{item.count} perdas</S.TrendCount>
                  <S.TrendValue>{formatCurrency(item.value)}</S.TrendValue>
                </S.TrendStats>
              </S.TrendItem>
            ))}
          </S.TrendList>
        </S.ChartCard>
      </S.ChartsGrid>

      {/* Tabela de Propostas Perdidas */}
      <S.TableSection>
        <S.TableTitle>
          Detalhamento de Propostas Perdidas ({filteredProposals.length})
        </S.TableTitle>

        <S.TableWrapper>
          <S.Table>
            <S.TableHead>
              <S.TableRow>
                <S.TableHeader>Proposta</S.TableHeader>
                <S.TableHeader>Cliente</S.TableHeader>
                <S.TableHeader>Distribuidor</S.TableHeader>
                <S.TableHeader>Vendedor</S.TableHeader>
                <S.TableHeader>Valor</S.TableHeader>
                <S.TableHeader>Motivo</S.TableHeader>
                <S.TableHeader>Descrição</S.TableHeader>
                <S.TableHeader>Data Perda</S.TableHeader>
              </S.TableRow>
            </S.TableHead>
            <S.TableBody>
              {filteredProposals.map((proposal) => (
                <S.TableRow key={proposal._id}>
                  <S.TableCell>
                    <S.ProposalBadge>{proposal.proposalNumber || '-'}</S.ProposalBadge>
                  </S.TableCell>
                  <S.TableCell>
                    <div>
                      <strong>{proposal.client?.nome || '-'}</strong>
                      {proposal.client?.empresa && (
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          {proposal.client.empresa}
                        </div>
                      )}
                    </div>
                  </S.TableCell>
                  <S.TableCell>{proposal.distributor?.apelido || '-'}</S.TableCell>
                  <S.TableCell>{proposal.createdBy?.name || '-'}</S.TableCell>
                  <S.TableCell>
                    <S.ValueBadge>{formatCurrency(proposal.totalValue || 0)}</S.ValueBadge>
                  </S.TableCell>
                  <S.TableCell>
                    <S.ReasonBadge>
                      {lossReasonLabels[proposal.lossReason] || proposal.lossReason}
                    </S.ReasonBadge>
                  </S.TableCell>
                  <S.TableCell>
                    <S.Description title={proposal.lossDescription}>
                      {proposal.lossDescription || '-'}
                    </S.Description>
                  </S.TableCell>
                  <S.TableCell>
                    {formatDate(proposal.lossDate || proposal.createdAt)}
                  </S.TableCell>
                </S.TableRow>
              ))}
            </S.TableBody>
          </S.Table>
        </S.TableWrapper>

        {filteredProposals.length === 0 && (
          <S.EmptyState>
            <AlertCircle size={48} />
            <h3>Nenhuma proposta perdida encontrada</h3>
            <p>Ajuste os filtros ou tente outro período</p>
          </S.EmptyState>
        )}
      </S.TableSection>
    </S.Container>
  );
};
