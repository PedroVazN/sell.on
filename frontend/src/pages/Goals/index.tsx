import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Search, Filter, Edit, Trash2, Loader2, TrendingUp, Calendar, Users, DollarSign, Phone, MapPin, FileText, Award, RefreshCw } from 'lucide-react';
import { apiService, Goal } from '../../services/api';
import { GoalModal } from '../../components/GoalModal';
import { ProgressModal } from '../../components/ProgressModal';
import { useToast } from '../../hooks/useToast';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchInput, 
  FilterButton, 
  CreateButton,
  Content,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  StatIcon,
  GoalsGrid,
  GoalCard,
  GoalHeader,
  GoalTitle,
  GoalType,
  GoalProgress,
  ProgressBar,
  ProgressValue,
  GoalDetails,
  GoalTarget,
  GoalCurrent,
  GoalActions,
  ActionButton,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyDescription,
  LoadingState,
  ErrorState,
  FilterDropdown,
  FilterOption,
  PeriodSelector,
  PeriodButton
} from './styles';

export const Goals: React.FC = () => {
  const { addToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    priority: ''
  });

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getGoals(1, 100, {
        search: searchTerm,
        type: filters.type,
        category: filters.category,
        status: filters.status
      });
      
      if (response.success) {
        setGoals(response.data);
      } else {
        setError('Erro ao carregar metas');
      }
    } catch (err: any) {
      console.error('Erro ao carregar metas:', err);
      setError(err.message || 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  const loadDashboard = useCallback(async () => {
    try {
      const response = await apiService.getGoalsDashboard(selectedPeriod);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadGoals();
    loadDashboard();
  }, [loadGoals, loadDashboard]);

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async (goal: Goal) => {
    if (!window.confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteGoal(goal._id);
      if (response.success) {
        await loadGoals();
        await loadDashboard();
      } else {
        alert('Erro ao excluir meta');
      }
    } catch (err) {
      console.error('Erro ao excluir meta:', err);
      alert('Erro ao excluir meta');
    }
  };

  const handleRecalculateGoals = async () => {
    if (!window.confirm('Deseja recalcular TODAS as metas baseado nas vendas reais? Isso corrigirá valores duplicados.')) {
      return;
    }

    try {
      setRecalculating(true);
      addToast('info', 'Recalculando Metas', 'Aguarde, estamos recalculando todas as metas...');
      
      const response = await apiService.recalculateAllGoals();
      
      if (response.success && response.data) {
        const results = response.data;
        const totalGoals = results.length;
        const totalCorrected = results.filter(r => r.oldValue !== r.newValue).length;
        
        addToast(
          'success',
          'Metas Recalculadas!',
          `${totalGoals} metas recalculadas. ${totalCorrected} correções aplicadas.`,
          6000
        );

        // Log detalhado no console
        console.log('📊 Resultado do Recálculo:');
        results.forEach(r => {
          if (r.oldValue !== r.newValue) {
            console.log(`✅ ${r.title}: R$ ${r.oldValue} → R$ ${r.newValue} (${r.proposalsCount} vendas)`);
          }
        });

        // Recarregar dados
        await loadGoals();
        await loadDashboard();
      } else {
        addToast('error', 'Erro', 'Não foi possível recalcular as metas');
      }
    } catch (err: any) {
      console.error('Erro ao recalcular metas:', err);
      addToast('error', 'Erro', err.message || 'Erro ao recalcular metas');
    } finally {
      setRecalculating(false);
    }
  };

  const handleUpdateProgress = async (goal: Goal, value: number, description?: string) => {
    try {
      const response = await apiService.updateGoalProgress(goal._id, value, description);
      if (response.success) {
        await loadGoals();
        await loadDashboard();
      } else {
        alert('Erro ao atualizar progresso');
      }
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      alert('Erro ao atualizar progresso');
    }
  };

  const handleOpenProgressModal = (goal: Goal) => {
    setProgressGoal(goal);
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setProgressGoal(null);
  };

  const handleSaveProgress = async (value: number, description: string) => {
    if (progressGoal) {
      await handleUpdateProgress(progressGoal, value, description);
      handleCloseProgressModal();
    }
  };

  const handleUpdateStatus = async (goal: Goal, status: Goal['status']) => {
    try {
      const response = await apiService.updateGoalStatus(goal._id, status);
      if (response.success) {
        await loadGoals();
        await loadDashboard();
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status');
    }
  };

  const handleSaveGoal = async () => {
    await loadGoals();
    await loadDashboard();
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'daily': return <Calendar size={16} />;
      case 'weekly': return <Calendar size={16} />;
      case 'monthly': return <Calendar size={16} />;
      case 'quarterly': return <Calendar size={16} />;
      case 'yearly': return <Calendar size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'sales': return <TrendingUp size={16} />;
      case 'revenue': return <DollarSign size={16} />;
      case 'clients': return <Users size={16} />;
      case 'proposals': return <FileText size={16} />;
      case 'calls': return <Phone size={16} />;
      case 'visits': return <MapPin size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#059669';
      case 'paused': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'low': return '#6b7280';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const formatValue = (value: number, unit: Goal['unit']) => {
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'hours':
        return `${value}h`;
      default:
        return value.toString();
    }
  };

  const getTypeLabel = (type: Goal['type']) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return type;
    }
  };

  const getCategoryLabel = (category: Goal['category']) => {
    switch (category) {
      case 'sales': return 'Vendas';
      case 'revenue': return 'Receita';
      case 'clients': return 'Clientes';
      case 'proposals': return 'Propostas';
      case 'calls': return 'Ligações';
      case 'visits': return 'Visitas';
      case 'custom': return 'Personalizada';
      default: return category;
    }
  };

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'completed': return 'Concluída';
      case 'paused': return 'Pausada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Metas</Title>
        </Header>
        <LoadingState>
          <Loader2 size={32} />
          <p>Carregando metas...</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Metas</Title>
        </Header>
        <ErrorState>
          <p>{error}</p>
          <button onClick={loadGoals}>Tentar novamente</button>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Metas</Title>
        <Actions>
          <SearchInput
            type="text"
            placeholder="Buscar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterButton
            onClick={() => setShowFilters(!showFilters)}
            $active={showFilters}
          >
            <Filter size={16} />
            Filtros
          </FilterButton>
          <FilterButton
            onClick={handleRecalculateGoals}
            disabled={recalculating}
            $active={false}
            style={{
              background: recalculating ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#10b981'
            }}
          >
            {recalculating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Recalculando...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Recalcular Metas
              </>
            )}
          </FilterButton>
          <CreateButton onClick={handleCreateGoal}>
            <Plus size={16} />
            Nova Meta
          </CreateButton>
        </Actions>
      </Header>

      {showFilters && (
        <FilterDropdown>
          <FilterOption>
            <label>Tipo:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </FilterOption>
          <FilterOption>
            <label>Categoria:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Todas</option>
              <option value="sales">Vendas</option>
              <option value="revenue">Receita</option>
              <option value="clients">Clientes</option>
              <option value="proposals">Propostas</option>
              <option value="calls">Ligações</option>
              <option value="visits">Visitas</option>
              <option value="custom">Personalizada</option>
            </select>
          </FilterOption>
          <FilterOption>
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="active">Ativa</option>
              <option value="completed">Concluída</option>
              <option value="paused">Pausada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </FilterOption>
          <FilterOption>
            <label>Prioridade:</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">Todas</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </FilterOption>
        </FilterDropdown>
      )}

      <Content>
        <PeriodSelector>
          <PeriodButton
            $active={selectedPeriod === 'day'}
            onClick={() => setSelectedPeriod('day')}
          >
            Hoje
          </PeriodButton>
          <PeriodButton
            $active={selectedPeriod === 'week'}
            onClick={() => setSelectedPeriod('week')}
          >
            Esta Semana
          </PeriodButton>
          <PeriodButton
            $active={selectedPeriod === 'month'}
            onClick={() => setSelectedPeriod('month')}
          >
            Este Mês
          </PeriodButton>
          <PeriodButton
            $active={selectedPeriod === 'year'}
            onClick={() => setSelectedPeriod('year')}
          >
            Este Ano
          </PeriodButton>
        </PeriodSelector>

        {dashboardData && (
          <StatsGrid>
            <StatCard>
              <StatIcon $color="#10b981">
                <Target size={24} />
              </StatIcon>
              <StatValue>{dashboardData.stats.total}</StatValue>
              <StatLabel>Total de Metas</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon $color="#059669">
                <Award size={24} />
              </StatIcon>
              <StatValue>{dashboardData.stats.completed}</StatValue>
              <StatLabel>Concluídas</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon $color="#f59e0b">
                <TrendingUp size={24} />
              </StatIcon>
              <StatValue>{dashboardData.stats.averageProgress}%</StatValue>
              <StatLabel>Progresso Médio</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon $color="#3b82f6">
                <Users size={24} />
              </StatIcon>
              <StatValue>{dashboardData.stats.active}</StatValue>
              <StatLabel>Ativas</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {goals.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Target size={48} />
            </EmptyIcon>
            <EmptyTitle>Nenhuma meta encontrada</EmptyTitle>
            <EmptyDescription>
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sua primeira meta para começar a acompanhar seu progresso'
              }
            </EmptyDescription>
            {!searchTerm && !Object.values(filters).some(f => f) && (
              <CreateButton onClick={handleCreateGoal}>
                <Plus size={16} />
                Criar Primeira Meta
              </CreateButton>
            )}
          </EmptyState>
        ) : (
          <GoalsGrid>
            {goals.map((goal) => (
              <GoalCard key={goal._id} $status={goal.status}>
                <GoalHeader>
                  <GoalTitle>{goal.title}</GoalTitle>
                  <GoalType $type={goal.type}>
                    {getTypeIcon(goal.type)}
                    {getTypeLabel(goal.type)}
                  </GoalType>
                </GoalHeader>

                <GoalProgress>
                  <ProgressBar>
                    <div 
                      style={{ 
                        width: `${goal.progress.percentage}%`,
                        backgroundColor: getStatusColor(goal.status)
                      }} 
                    />
                  </ProgressBar>
                  <ProgressValue>{goal.progress.percentage}%</ProgressValue>
                </GoalProgress>

                <GoalDetails>
                  <div>
                    <span style={{ color: getCategoryIcon(goal.category) ? '#6b7280' : '#000' }}>
                      {getCategoryIcon(goal.category)}
                      {getCategoryLabel(goal.category)}
                    </span>
                  </div>
                  <GoalTarget>
                    <GoalCurrent>
                      {formatValue(goal.currentValue, goal.unit)}
                    </GoalCurrent>
                    <span>de {formatValue(goal.targetValue, goal.unit)}</span>
                  </GoalTarget>
                </GoalDetails>

                <GoalActions>
                  <ActionButton
                    onClick={() => handleOpenProgressModal(goal)}
                    $variant="primary"
                  >
                    <TrendingUp size={14} />
                    Progresso
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleEditGoal(goal)}
                    $variant="secondary"
                  >
                    <Edit size={14} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteGoal(goal)}
                    $variant="danger"
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                </GoalActions>
              </GoalCard>
            ))}
          </GoalsGrid>
        )}
      </Content>

      {showGoalModal && (
        <GoalModal
          isOpen={showGoalModal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
          goal={editingGoal}
        />
      )}

      {showProgressModal && (
        <ProgressModal
          isOpen={showProgressModal}
          onClose={handleCloseProgressModal}
          onSave={handleSaveProgress}
          goal={progressGoal}
        />
      )}
    </Container>
  );
};