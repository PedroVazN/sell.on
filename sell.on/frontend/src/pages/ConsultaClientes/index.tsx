import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, X, FileText } from 'lucide-react';
import { apiService, ConsultaClienteItem, ConsultaClienteDetail } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TableSkeleton } from '../../components/TableSkeleton';
import {
  Container,
  Header,
  Title,
  Subtitle,
  FilterRow,
  Content,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatPill,
  ProductBadge,
  DetailButton,
  Pagination,
  PaginationButton,
  EmptyState,
  LoadingState,
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  SectionTitle,
  DetailTable,
} from './styles';

const formatCNPJ = (cnpj: string) => {
  const d = (cnpj || '').replace(/\D/g, '');
  return d.length >= 14 ? `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}` : cnpj || '—';
};

const formatCurrency = (n: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const CLASSIFICACAO = ['PROVEDOR', 'REVENDA', 'OUTROS'];

export default function ConsultaClientes() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uf, setUf] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [orderBy, setOrderBy] = useState('valorTotalFechado');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsultaClienteItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 0, total: 0, limit: 20 });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConsultaClienteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getClientesConsulta(page, 20, search || undefined, uf || undefined, classificacao || undefined, orderBy, order);
      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
      if (res.pagination) {
        setPagination({
          current: res.pagination.current ?? 1,
          pages: res.pagination.pages ?? 0,
          total: res.pagination.total ?? 0,
          limit: 20,
        });
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, uf, classificacao, orderBy, order]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDetail = async (clientId: string) => {
    setDetailId(clientId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await apiService.getClienteConsultaDetail(clientId);
      if (res.success && res.data) {
        setDetail(res.data);
      }
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetail(null);
  };

  const clientName = (item: ConsultaClienteItem) =>
    item.client?.razaoSocial || item.client?.nomeFantasia || '—';

  return (
    <Container>
      <Header>
        <div>
          <Title>Consulta de Clientes</Title>
          <Subtitle>
            Análise por propostas, vendas fechadas e produtos mais comprados
          </Subtitle>
        </div>
      </Header>

      <FilterRow>
        <label htmlFor="consulta-search">Buscar</label>
        <input
          id="consulta-search"
          type="text"
          placeholder="Razão social, CNPJ, e-mail..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <label htmlFor="consulta-uf">UF</label>
        <select id="consulta-uf" value={uf} onChange={(e) => setUf(e.target.value)}>
          <option value="">Todas</option>
          {UFS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label htmlFor="consulta-class">Classificação</label>
        <select id="consulta-class" value={classificacao} onChange={(e) => setClassificacao(e.target.value)}>
          <option value="">Todas</option>
          {CLASSIFICACAO.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label htmlFor="consulta-order">Ordenar por</label>
        <select
          id="consulta-order"
          value={`${orderBy}_${order}`}
          onChange={(e) => {
            const v = e.target.value;
            const [f, d] = v.split('_');
            setOrderBy(f);
            setOrder((d as 'asc' | 'desc') || 'desc');
            setPage(1);
          }}
        >
          <option value="valorTotalFechado_desc">Maior valor fechado</option>
          <option value="valorTotalFechado_asc">Menor valor fechado</option>
          <option value="vendasFechadas_desc">Mais vendas ganhas</option>
          <option value="vendasFechadas_asc">Menos vendas ganhas</option>
          <option value="totalPropostas_desc">Mais propostas</option>
          <option value="totalPropostas_asc">Menos propostas</option>
          <option value="vendasPerdidas_desc">Mais vendas perdidas</option>
          <option value="vendasPerdidas_asc">Menos vendas perdidas</option>
          <option value="nome_asc">Nome (A–Z)</option>
          <option value="nome_desc">Nome (Z–A)</option>
        </select>
        <button type="button" onClick={handleSearch}>
          <Search size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Buscar
        </button>
      </FilterRow>

      <Content>
        {loading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : data.length === 0 ? (
          <EmptyState>Nenhum cliente encontrado com os filtros informados.</EmptyState>
        ) : (
          <>
            <Table>
              <TableHeader>
                <tr>
                  <th>Cliente</th>
                  <th>Propostas</th>
                  <th>Vendas ganhas</th>
                  <th>Vendas perdidas</th>
                  <th>Valor fechado</th>
                  <th>Produtos mais comprados</th>
                  <th></th>
                </tr>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow
                    key={item.client._id}
                    $clickable
                    onClick={() => handleDetail(item.client._id)}
                  >
                    <TableCell>
                      <div>
                        <strong>{clientName(item)}</strong>
                        {item.client?.contato?.email && (
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            {item.client.contato.email}
                          </div>
                        )}
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                          {formatCNPJ(item.client?.cnpj)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatPill>{item.totalPropostas}</StatPill>
                    </TableCell>
                    <TableCell>
                      <StatPill $variant="success">{item.vendasFechadas}</StatPill>
                    </TableCell>
                    <TableCell>
                      <StatPill $variant="danger">{item.vendasPerdidas}</StatPill>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                        {formatCurrency(item.valorTotalFechado)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.topProdutos.length === 0 ? (
                        '—'
                      ) : (
                        item.topProdutos.slice(0, 3).map((p) => (
                          <ProductBadge key={p.name}>
                            {p.name} ({p.quantity})
                          </ProductBadge>
                        ))
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DetailButton type="button" onClick={() => handleDetail(item.client._id)}>
                        <FileText size={14} />
                        Ver detalhe
                      </DetailButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination.pages > 1 && (
              <Pagination>
                <PaginationButton
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={18} />
                </PaginationButton>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Página {pagination.current} de {pagination.pages} ({pagination.total} clientes)
                </span>
                <PaginationButton
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={18} />
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </Content>

      {detailId && (
        <ModalOverlay onClick={closeDetail}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {detail ? clientName(detail) : 'Carregando...'}
              </ModalTitle>
              <ModalClose type="button" onClick={closeDetail} aria-label="Fechar">
                <X size={24} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {detailLoading && !detail && <LoadingState>Carregando detalhes...</LoadingState>}
              {detail && !detailLoading && (
                <>
                  <StatsGrid>
                    <StatCard>
                      <StatValue>{detail.totalPropostas}</StatValue>
                      <StatLabel>Total de propostas</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue style={{ color: 'var(--success, #10b981)' }}>{detail.vendasFechadas}</StatValue>
                      <StatLabel>Vendas ganhas</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue style={{ color: 'var(--error, #ef4444)' }}>{detail.vendasPerdidas}</StatValue>
                      <StatLabel>Vendas perdidas</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>{formatCurrency(detail.valorTotalFechado)}</StatValue>
                      <StatLabel>Valor total fechado</StatLabel>
                    </StatCard>
                  </StatsGrid>

                  {detail.topProdutos.length > 0 && (
                    <>
                      <SectionTitle>Produtos mais comprados</SectionTitle>
                      <DetailTable>
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.topProdutos.map((p) => (
                            <tr key={p.name}>
                              <td>{p.name}</td>
                              <td>{p.quantity}</td>
                              <td>{formatCurrency(p.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </DetailTable>
                    </>
                  )}

                  {detail.ultimasPropostas && detail.ultimasPropostas.length > 0 && (
                    <>
                      <SectionTitle>Últimas propostas (vendas fechadas)</SectionTitle>
                      <DetailTable>
                        <thead>
                          <tr>
                            <th>Número</th>
                            <th>Valor</th>
                            <th>Data fechamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.ultimasPropostas.map((prop) => (
                            <tr key={prop._id}>
                              <td>{prop.proposalNumber || '—'}</td>
                              <td>{prop.total != null ? formatCurrency(prop.total) : '—'}</td>
                              <td>
                                {prop.closedAt
                                  ? new Date(prop.closedAt).toLocaleDateString('pt-BR')
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </DetailTable>
                    </>
                  )}

                  {detail.topProdutos.length === 0 && (!detail.ultimasPropostas || detail.ultimasPropostas.length === 0) && (
                    <EmptyState>Nenhuma venda fechada ainda para este cliente.</EmptyState>
                  )}
                </>
              )}
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
}
