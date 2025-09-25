import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Proposal } from '../../services/api';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  FilterButton,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  StatChange,
  FiltersContainer,
  FiltersGrid,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  FilterInput,
  FilterActions,
  FilterButtonSecondary,
  FilterButtonPrimary,
  SalesTable,
  TableHeader,
  TableRow,
  TableCell,
  StatusBadge,
  ActionsCell,
  ActionButton,
  Pagination,
  PaginationButton,
  LoadingContainer,
  EmptyState
} from './styles';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
  TrendingDown,
  Award,
  Package
} from 'lucide-react';

interface ProposalsFilters {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}

interface ProposalsStats {
  totalProposals: number;
  vendaFechadaProposals: number;
  vendaPerdidaProposals: number;
  totalRevenue: number;
  averageProposal: number;
  totalItems: number;
}

interface TopDistributor {
  _id: string;
  apelido: string;
  razaoSocial: string;
  totalProposals: number;
  vendaFechadaProposals: number;
  totalRevenue: number;
}

interface TopProduct {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
  proposals: number;
}

interface TopSeller {
  _id: string;
  name: string;
  email: string;
  totalProposals: number;
  vendaFechadaProposals: number;
  totalRevenue: number;
}

export const Sales: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalsStats | null>(null);
  const [topDistributors, setTopDistributors] = useState<TopDistributor[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<ProposalsFilters>({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const loadProposals = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getProposals(
        page,
        10,
        filters.status || undefined,
        filters.search || undefined
      );

      setProposals(response.data);
      setCurrentPage(response.pagination?.current || 1);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      setError('Erro ao carregar propostas');
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.search]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiService.getProposalsDashboardStats();
      setStats({
        totalProposals: response.data.proposalStats.totalProposals,
        vendaFechadaProposals: response.data.proposalStats.vendaFechadaProposals,
        vendaPerdidaProposals: response.data.proposalStats.vendaPerdidaProposals,
        totalRevenue: response.data.salesStats.totalRevenue,
        averageProposal: response.data.salesStats.averageSale,
        totalItems: 0 // Será calculado baseado nas propostas
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  const loadTopPerformers = useCallback(async () => {
    try {
      const response = await apiService.getProposalsTopPerformers();
      setTopDistributors(response.data.topDistributors);
      setTopProducts(response.data.topProducts);
      setTopSellers(response.data.topSellers);
    } catch (error) {
      console.error('Erro ao carregar top performers:', error);
    }
  }, []);

  useEffect(() => {
    loadProposals(currentPage);
    loadStats();
    loadTopPerformers();
  }, [loadProposals, loadStats, loadTopPerformers, currentPage]);

  const handleFilterChange = (key: keyof ProposalsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadProposals(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
    loadProposals(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProposals(page);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'venda_fechada': 'Venda Fechada',
      'venda_perdida': 'Venda Perdida',
      'negociacao': 'Em Negociação',
      'expirada': 'Expirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading && proposals.length === 0) {
    return (
      <Container>
        <LoadingContainer>
          <Loader2 size={32} className="animate-spin" />
          <span>Carregando propostas...</span>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Vendas (Propostas)</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar propostas..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </SearchContainer>
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton>
            <Plus size={20} />
            Nova Proposta
          </CreateButton>
        </Actions>
      </Header>
      
      {/* Estatísticas Principais */}
      {stats && (
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalProposals}</StatValue>
            <StatLabel>Total de Propostas</StatLabel>
            <StatChange $positive>
              <TrendingUp size={12} />
              +0% este mês
            </StatChange>
          </StatCard>
          <StatCard>
            <StatValue>{stats.vendaFechadaProposals}</StatValue>
            <StatLabel>Propostas Fechadas</StatLabel>
            <StatChange $positive>
              <Target size={12} />
              {stats.totalProposals > 0 ? Math.round((stats.vendaFechadaProposals / stats.totalProposals) * 100) : 0}% conversão
            </StatChange>
          </StatCard>
          <StatCard>
            <StatValue>{stats.vendaPerdidaProposals}</StatValue>
            <StatLabel>Propostas Perdidas</StatLabel>
            <StatChange $positive={false}>
              <TrendingDown size={12} />
              {stats.totalProposals > 0 ? Math.round((stats.vendaPerdidaProposals / stats.totalProposals) * 100) : 0}% perda
            </StatChange>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
            <StatLabel>Receita Total</StatLabel>
            <StatChange $positive>
              <DollarSign size={12} />
              +0% este mês
            </StatChange>
          </StatCard>
        </StatsGrid>
      )}

      {/* Top Performers */}
      <StatsGrid>
        <StatCard>
          <StatLabel>🏆 Melhor Distribuidor</StatLabel>
          <StatValue style={{ fontSize: '1.2rem' }}>
            {topDistributors[0]?.apelido || topDistributors[0]?.razaoSocial || 'N/A'}
          </StatValue>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topDistributors[0] ? `${topDistributors[0].totalProposals} propostas` : ''}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topDistributors[0] ? formatCurrency(topDistributors[0].totalRevenue) : ''}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
            {topDistributors[0] && topDistributors[0].totalProposals > 0 ? 
              `${Math.round((topDistributors[0].vendaFechadaProposals / topDistributors[0].totalProposals) * 100)}% conversão` : 
              '0% conversão'
            }
          </div>
        </StatCard>
        
        <StatCard>
          <StatLabel>📦 Produto Mais Vendido</StatLabel>
          <StatValue style={{ fontSize: '1.2rem' }}>
            {topProducts[0]?._id || 'N/A'}
          </StatValue>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topProducts[0] ? `${topProducts[0].totalQuantity} unidades` : ''}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topProducts[0] ? formatCurrency(topProducts[0].totalRevenue) : ''}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '4px' }}>
            {topProducts[0] ? `${topProducts[0].proposals} propostas` : ''}
          </div>
        </StatCard>
        
        <StatCard>
          <StatLabel>👑 Melhor Vendedor</StatLabel>
          <StatValue style={{ fontSize: '1.2rem' }}>
            {topSellers[0]?.name || 'N/A'}
          </StatValue>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topSellers[0] ? `${topSellers[0].totalProposals} propostas` : ''}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {topSellers[0] ? formatCurrency(topSellers[0].totalRevenue) : ''}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
            {topSellers[0] && topSellers[0].totalProposals > 0 ? 
              `${Math.round((topSellers[0].vendaFechadaProposals / topSellers[0].totalProposals) * 100)}% conversão` : 
              '0% conversão'
            }
          </div>
        </StatCard>
        
        <StatCard>
          <StatLabel>📊 Ticket Médio</StatLabel>
          <StatValue>{formatCurrency(stats?.averageProposal || 0)}</StatValue>
          <StatChange $positive>
            <TrendingUp size={12} />
            +0% vs mês anterior
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Filtros */}
      {showFilters && (
        <FiltersContainer>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="venda_fechada">Venda Fechada</option>
                <option value="venda_perdida">Venda Perdida</option>
                <option value="negociacao">Em Negociação</option>
                <option value="expirada">Expirada</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Data Inicial</FilterLabel>
              <FilterInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Data Final</FilterLabel>
              <FilterInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Ordenar por</FilterLabel>
              <FilterSelect
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Data de Criação</option>
                <option value="total">Valor Total</option>
                <option value="proposalNumber">Número da Proposta</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Ordem</FilterLabel>
              <FilterSelect
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersGrid>
          <FilterActions>
            <FilterButtonSecondary onClick={handleClearFilters}>
              Limpar Filtros
            </FilterButtonSecondary>
            <FilterButtonPrimary onClick={handleApplyFilters}>
              Aplicar Filtros
            </FilterButtonPrimary>
          </FilterActions>
        </FiltersContainer>
      )}

      {/* Tabela de Propostas */}
      <SalesTable>
        <TableHeader>
          <TableCell>Número</TableCell>
          <TableCell>Cliente</TableCell>
          <TableCell>Vendedor</TableCell>
          <TableCell>Distribuidor</TableCell>
          <TableCell>Valor Total</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Data</TableCell>
          <TableCell>Ações</TableCell>
        </TableHeader>
        
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8}>
              <LoadingContainer>
                <Loader2 size={20} className="animate-spin" />
                <span>Carregando...</span>
              </LoadingContainer>
            </TableCell>
          </TableRow>
        ) : proposals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8}>
              <EmptyState>
                <ShoppingCart size={48} />
                <h3>Nenhuma proposta encontrada</h3>
                <p>Não há propostas que correspondam aos filtros aplicados.</p>
              </EmptyState>
            </TableCell>
          </TableRow>
        ) : (
          proposals.map((proposal) => (
            <TableRow key={proposal._id}>
              <TableCell>{proposal.proposalNumber}</TableCell>
              <TableCell>
                <div>
                  <div style={{ fontWeight: 500 }}>{proposal.client.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {proposal.client.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div style={{ fontWeight: 500 }}>{proposal.seller.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {proposal.seller.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div style={{ fontWeight: 500 }}>{proposal.distributor.apelido || proposal.distributor.razaoSocial}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {proposal.distributor.razaoSocial}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div style={{ fontWeight: 600 }}>
                  {formatCurrency(proposal.total)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {proposal.items.length} item(s)
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge $status={proposal.status}>
                  {getStatusLabel(proposal.status)}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <div>
                  <div>{formatDate(proposal.createdAt)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Válida até: {formatDate(proposal.validUntil)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <ActionsCell>
                  <ActionButton $variant="primary">
                    <Eye size={14} />
                  </ActionButton>
                  <ActionButton $variant="secondary">
                    <Edit size={14} />
                  </ActionButton>
                  <ActionButton $variant="danger">
                    <Trash2 size={14} />
                  </ActionButton>
                </ActionsCell>
              </TableCell>
            </TableRow>
          ))
        )}
      </SalesTable>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </PaginationButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationButton
              key={page}
              $active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PaginationButton>
          ))}
          
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </PaginationButton>
        </Pagination>
      )}
    </Container>
  );
};