import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiService, Event } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import EventModal from '../../components/EventModal';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  FilterButton,
  Content,
  CalendarContainer,
  CalendarHeader,
  CalendarNavigation,
  CalendarTitle,
  CalendarGrid,
  CalendarDay,
  CalendarEvent,
  EventList,
  EventItem,
  EventTime,
  EventTitle,
  EventType,
  EventActions,
  ActionButton,
  EmptyState,
  LoadingState,
  ErrorState,
  ViewToggle,
  ViewButton,
  FilterDropdown,
  FilterOption,
  EventTypeFilter,
  PriorityFilter,
  StatusFilter
} from './styles';

type ViewMode = 'month' | 'week' | 'day';
type EventTypeFilter = 'all' | Event['type'];
type PriorityFilter = 'all' | Event['priority'];
type StatusFilter = 'all' | Event['status'];

export const Calendar: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      if (viewMode === 'month') {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (viewMode === 'week') {
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        endDate.setDate(startDate.getDate() + 6);
      }
      
      const response = await apiService.getEventsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      let filteredEvents = response.data;
      
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (typeFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.type === typeFilter);
      }
      
      if (priorityFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.priority === priorityFilter);
      }
      
      if (statusFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
      }
      
      setEvents(filteredEvents);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, searchTerm, typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (event: Event) => {
    const ok = await confirm({
      title: 'Excluir evento',
      message: `Tem certeza que deseja excluir o evento "${event.title}"?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiService.deleteEvent(event._id);
      loadEvents();
      success('Evento excluído', 'O evento foi removido com sucesso.');
    } catch (err) {
      showError('Erro ao excluir evento', 'Tente novamente.');
      console.error('Erro ao excluir evento:', err);
    }
  };

  const handleEventSave = () => {
    loadEvents();
    setShowEventModal(false);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.startDate === dateStr);
  };

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      meeting: '#3B82F6',
      call: '#10B981',
      visit: '#F59E0B',
      follow_up: '#8B5CF6',
      proposal: '#EF4444',
      sale: '#06B6D4',
      other: '#6B7280'
    };
    return colors[type];
  };

  const getPriorityColor = (priority: Event['priority']) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444'
    };
    return colors[priority];
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={12} />;
      case 'in_progress':
        return <AlertCircle size={12} />;
      case 'completed':
        return <CheckCircle size={12} />;
      case 'cancelled':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <CalendarDay
          key={i}
          $isCurrentMonth={isCurrentMonth}
          $isToday={isToday}
          onClick={() => handleDateClick(date)}
        >
          <span>{date.getDate()}</span>
          {dayEvents.slice(0, 3).map((event, index) => (
            <CalendarEvent
              key={event._id}
              $type={event.type}
              $priority={event.priority}
              onClick={(e) => {
                e.stopPropagation();
                handleEditEvent(event);
              }}
            >
              <span>{event.title}</span>
            </CalendarEvent>
          ))}
          {dayEvents.length > 3 && (
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
              +{dayEvents.length - 3} mais
            </div>
          )}
        </CalendarDay>
      );
    }
    
    return days;
  };

  const renderEventList = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return (
      <EventList>
        {sortedEvents.map(event => (
          <EventItem key={event._id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '4px', 
                height: '100%', 
                backgroundColor: getEventTypeColor(event.type),
                borderRadius: '2px'
              }} />
              <div style={{ flex: 1 }}>
                <EventTitle>{event.title}</EventTitle>
                <EventTime>
                  {new Date(event.startDate).toLocaleDateString('pt-BR')}
                  {event.startTime && ` às ${event.startTime}`}
                  {event.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                </EventTime>
                <EventType>
                  <span style={{ 
                    backgroundColor: getEventTypeColor(event.type) + '20',
                    color: getEventTypeColor(event.type),
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {event.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span style={{ 
                    backgroundColor: getPriorityColor(event.priority) + '20',
                    color: getPriorityColor(event.priority),
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginLeft: '0.5rem'
                  }}>
                    {event.priority.toUpperCase()}
                  </span>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6B7280'
                  }}>
                    {getStatusIcon(event.status)}
                    {event.status.replace('_', ' ').toUpperCase()}
                  </span>
                </EventType>
              </div>
            </div>
            <EventActions>
              <ActionButton onClick={() => handleEditEvent(event)}>
                <Edit size={16} />
              </ActionButton>
              <ActionButton onClick={() => handleDeleteEvent(event)}>
                <Trash2 size={16} />
              </ActionButton>
            </EventActions>
          </EventItem>
        ))}
      </EventList>
    );
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Calendário</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar eventos..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Evento
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <LoadingState>
            <Loader2 size={32} />
            <p>Carregando eventos...</p>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Calendário</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar eventos..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Evento
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <ErrorState>
            <p>{error}</p>
            <button onClick={loadEvents}>Tentar novamente</button>
          </ErrorState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Calendário</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar eventos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton onClick={handleCreateEvent}>
            <Plus size={20} />
            Novo Evento
          </CreateButton>
        </Actions>
      </Header>
      
      {showFilters && (
        <FilterDropdown>
          <FilterOption>
            <label>Tipo:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EventTypeFilter)}>
              <option value="all">Todos</option>
              <option value="meeting">Reunião</option>
              <option value="call">Ligação</option>
              <option value="visit">Visita</option>
              <option value="follow_up">Follow-up</option>
              <option value="proposal">Proposta</option>
              <option value="sale">Venda</option>
              <option value="other">Outro</option>
            </select>
          </FilterOption>
          <FilterOption>
            <label>Prioridade:</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}>
              <option value="all">Todas</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </FilterOption>
          <FilterOption>
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="all">Todos</option>
              <option value="scheduled">Agendado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </FilterOption>
        </FilterDropdown>
      )}
      
      <Content>
        <ViewToggle>
          <ViewButton 
            $active={viewMode === 'month'} 
            onClick={() => setViewMode('month')}
          >
            Mês
          </ViewButton>
          <ViewButton 
            $active={viewMode === 'week'} 
            onClick={() => setViewMode('week')}
          >
            Semana
          </ViewButton>
          <ViewButton 
            $active={viewMode === 'day'} 
            onClick={() => setViewMode('day')}
          >
            Dia
          </ViewButton>
        </ViewToggle>

        {viewMode === 'month' ? (
          <CalendarContainer>
            <CalendarHeader>
              <CalendarNavigation>
                <button onClick={handlePreviousMonth}>
                  <ChevronLeft size={20} />
                </button>
                <CalendarTitle>
                  {currentDate.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  }).toUpperCase()}
                </CalendarTitle>
                <button onClick={handleNextMonth}>
                  <ChevronRight size={20} />
                </button>
              </CalendarNavigation>
              <button onClick={handleToday}>Hoje</button>
            </CalendarHeader>
            
            <CalendarGrid>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Dom</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Seg</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Ter</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Qua</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Qui</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Sex</div>
              <div style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Sáb</div>
              {renderCalendarDays()}
            </CalendarGrid>
          </CalendarContainer>
        ) : (
          <div>
            <h3>Lista de Eventos</h3>
            {events.length === 0 ? (
              <EmptyState>
                <CalendarIcon size={48} />
                <h3>Nenhum evento encontrado</h3>
                <p>Comece criando seu primeiro evento</p>
                <CreateButton onClick={handleCreateEvent}>
                  <Plus size={20} />
                  Novo Evento
                </CreateButton>
              </EmptyState>
            ) : (
              renderEventList()
            )}
          </div>
        )}
      </Content>

      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleEventSave}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </Container>
  );
};
