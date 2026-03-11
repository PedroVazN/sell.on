import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Loader2, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import {
  Container,
  Header,
  Title,
  Subtitle,
  FilterRow,
  Content,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  BadgePosition,
  SectionTitle,
  DetailCard,
  DetailHeader,
  SummaryGrid,
  SummaryCard,
  ChartWrapper,
  EmptyState,
  LoadingState,
} from './styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DEFAULT_START = '2025-10-01';

function getTodayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

interface RankingItem {
  _id: string;
  name: string;
  email: string;
  position: number;
  totalPropostas: number;
  vendasFechadas: number;
  vendasPerdidas: number;
  valorFechado: number;
}

interface MonthlyItem {
  label: string;
  totalPropostas: number;
  vendasFechadas: number;
  vendasPerdidas: number;
  valorFechado: number;
}

const COLORS = { total: '#6366f1', ganhas: '#10b981', perdidas: '#ef4444' };

export const Ranking: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(DEFAULT_START);
  const [dateTo, setDateTo] = useState(getTodayISO());
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailSellerId, setDetailSellerId] = useState('');
  const [detailMonthly, setDetailMonthly] = useState<MonthlyItem[]>([]);
  const [detailSummary, setDetailSummary] = useState<{
    totalPropostas: number;
    vendasFechadas: number;
    vendasPerdidas: number;
    valorFechado: number;
  } | null>(null);
  const [detailSellerName, setDetailSellerName] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [sellers, setSellers] = useState<Array<{ _id: string; name: string; email: string }>>([]);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getProposalsRanking(dateFrom, dateTo);
      const raw = res as { data?: RankingItem[] | { data?: RankingItem[] } };
      const list: RankingItem[] = Array.isArray(raw.data) ? raw.data : (raw.data && typeof raw.data === 'object' && Array.isArray((raw.data as { data?: RankingItem[] }).data)) ? (raw.data as { data: RankingItem[] }).data : [];
      setRanking(list);
      setSellers(list.map((r: RankingItem) => ({ _id: r._id, name: r.name, email: r.email })));
      if (list.length) setDetailSellerId((prev) => prev || list[0]._id);
    } catch (err) {
      console.error(err);
      setRanking([]);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const loadDetail = useCallback(async () => {
    if (!detailSellerId) {
      setDetailMonthly([]);
      setDetailSummary(null);
      setDetailSellerName('');
      return;
    }
    setDetailLoading(true);
    try {
      const res = await apiService.getProposalsRankingDetail(detailSellerId, dateFrom, dateTo) as {
        data?: { monthly?: MonthlyItem[]; summary?: { totalPropostas: number; vendasFechadas: number; vendasPerdidas: number; valorFechado: number } | null; seller?: { name?: string } };
        monthly?: MonthlyItem[];
        summary?: { totalPropostas: number; vendasFechadas: number; vendasPerdidas: number; valorFechado: number } | null;
        seller?: { name?: string };
      };
      const payload = (res && typeof res === 'object' && 'monthly' in res) ? res : res?.data;
      const monthly = (payload.monthly ?? []).map((m: MonthlyItem) => ({
        label: m.label,
        totalPropostas: m.totalPropostas,
        vendasFechadas: m.vendasFechadas,
        vendasPerdidas: m.vendasPerdidas,
        valorFechado: m.valorFechado,
      }));
      setDetailMonthly(monthly);
      setDetailSummary(payload.summary ?? null);
      setDetailSellerName(payload.seller?.name ?? '');
    } catch (err) {
      console.error(err);
      setDetailMonthly([]);
      setDetailSummary(null);
      setDetailSellerName('');
    } finally {
      setDetailLoading(false);
    }
  }, [detailSellerId, dateFrom, dateTo]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const applyFilter = () => {
    loadRanking();
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>
            <Trophy size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Ranking de Vendedores
          </Title>
          <Subtitle>
            Desempenho por vendas fechadas, perdidas e valor no período. Período padrão: outubro/2025 até hoje.
          </Subtitle>
        </div>
      </Header>

      <FilterRow>
        <label>De:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Data inicial"
        />
        <label>Até:</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Data final"
        />
        <button type="button" onClick={applyFilter}>
          Atualizar
        </button>
      </FilterRow>

      <SectionTitle>Leaderboard (por valor fechado)</SectionTitle>
      <Content>
        {loading ? (
          <LoadingState>
            <Loader2 size={24} className="animate-spin" />
            Carregando ranking…
          </LoadingState>
        ) : ranking.length === 0 ? (
          <EmptyState>
            <p>Nenhum dado de ranking no período.</p>
            <small>Ajuste as datas ou verifique se há propostas no sistema.</small>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <th>#</th>
                <th>Vendedor</th>
                <th>Propostas</th>
                <th>Vendas ganhas</th>
                <th>Vendas perdidas</th>
                <th>Valor fechado</th>
              </tr>
            </TableHeader>
            <TableBody>
              {ranking.map((row) => (
                <TableRow key={row._id} $highlight={row._id === detailSellerId}>
                  <TableCell>
                    <BadgePosition $top={row.position <= 3}>{row.position}</BadgePosition>
                  </TableCell>
                  <TableCell>
                    <strong>{row.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{row.email}</div>
                  </TableCell>
                  <TableCell>{row.totalPropostas}</TableCell>
                  <TableCell style={{ color: '#10b981' }}>{row.vendasFechadas}</TableCell>
                  <TableCell style={{ color: '#ef4444' }}>{row.vendasPerdidas}</TableCell>
                  <TableCell>
                    <strong style={{ color: '#10b981' }}>{formatCurrency(row.valorFechado || 0)}</strong>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>

      <SectionTitle>Detalhe por vendedor (out/2025 até agora)</SectionTitle>
      <DetailCard>
        <DetailHeader>
          <label htmlFor="ranking-select-seller">
            <User size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Vendedor:
          </label>
          <select
            id="ranking-select-seller"
            value={detailSellerId}
            onChange={(e) => setDetailSellerId(e.target.value)}
            aria-label="Selecionar vendedor"
          >
            <option value="">Selecione um vendedor</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </DetailHeader>

        {!detailSellerId ? (
          <EmptyState>
            <p>Selecione um vendedor para ver o gráfico e o resumo.</p>
          </EmptyState>
        ) : detailLoading ? (
          <LoadingState>
            <Loader2 size={24} className="animate-spin" />
            Carregando detalhe…
          </LoadingState>
        ) : (
          <>
            {detailSummary && (
              <SummaryGrid>
                <SummaryCard>
                  <p>Total propostas</p>
                  <strong>{detailSummary.totalPropostas}</strong>
                </SummaryCard>
                <SummaryCard className="success">
                  <p>Vendas ganhas</p>
                  <strong>{detailSummary.vendasFechadas}</strong>
                </SummaryCard>
                <SummaryCard className="danger">
                  <p>Vendas perdidas</p>
                  <strong>{detailSummary.vendasPerdidas}</strong>
                </SummaryCard>
                <SummaryCard className="success">
                  <p>Valor fechado</p>
                  <strong>{formatCurrency(detailSummary.valorFechado || 0)}</strong>
                </SummaryCard>
              </SummaryGrid>
            )}

            {detailMonthly.length > 0 ? (
              <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={detailMonthly}
                    margin={{ top: 12, right: 12, left: 0, bottom: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1f2937',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'valorFechado') return [formatCurrency(value), 'Valor fechado'];
                        return [value, name === 'vendasFechadas' ? 'Vendas ganhas' : name === 'vendasPerdidas' ? 'Vendas perdidas' : 'Propostas'];
                      }}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={(value) =>
                        value === 'totalPropostas'
                          ? 'Propostas'
                          : value === 'vendasFechadas'
                          ? 'Vendas ganhas'
                          : value === 'vendasPerdidas'
                          ? 'Vendas perdidas'
                          : 'Valor fechado'
                      }
                    />
                    <Bar dataKey="totalPropostas" name="totalPropostas" fill={COLORS.total} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vendasFechadas" name="vendasFechadas" fill={COLORS.ganhas} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vendasPerdidas" name="vendasPerdidas" fill={COLORS.perdidas} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            ) : (
              <EmptyState>
                <p>Nenhum dado mensal para o vendedor {detailSellerName || 'selecionado'} no período.</p>
              </EmptyState>
            )}
          </>
        )}
      </DetailCard>
    </Container>
  );
};
