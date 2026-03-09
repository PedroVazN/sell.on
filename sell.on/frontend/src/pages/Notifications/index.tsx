import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Check, Trash2, Loader2, Sparkles, X, UserCheck, UserX } from 'lucide-react';
import { apiService, Notification } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  FilterButton,
  Content,
  NotificationsList,
  NotificationItem,
  NotificationIcon,
  NotificationContent,
  NotificationTitle,
  NotificationMessage,
  NotificationTime,
  NotificationActions,
  ActionButton,
  EmptyContainer,
  EmptyText,
  LoadingContainer,
  LoadingText,
  ErrorContainer,
  ErrorText,
  HeaderActions,
  MarkAllButton,
  ClearAllButton
} from './styles';

export const Notifications: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToastContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Carregar notificações
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getNotifications(1, 50, false);
      if (response.success) {
        setNotifications(response.data);
      } else {
        setError('Erro ao carregar notificações');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notification: Notification) => {
    try {
      const response = await apiService.markNotificationAsRead(notification._id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  // Deletar notificação
  const deleteNotification = async (notification: Notification) => {
    try {
      const response = await apiService.deleteNotification(notification._id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
      }
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
    }
  };

  // Limpar todas as notificações
  const clearAll = async () => {
    try {
      const response = await apiService.clearAllNotifications();
      if (response.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  };

  const requestIdForNotification = (n: Notification) =>
    (n.data && (n.data as any).requestId) || n.relatedEntity || '';

  const handleApproveClientAccess = async (notification: Notification) => {
    const requestId = requestIdForNotification(notification);
    if (!requestId) return;
    setProcessingId(notification._id);
    try {
      const res = await apiService.approveClientAccessRequest(requestId);
      if (res.success) {
        toastSuccess('Aprovado', 'Uso do cliente liberado para o vendedor.');
        await apiService.deleteNotification(notification._id);
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      } else {
        toastError('Erro', res.message || 'Não foi possível aprovar.');
      }
    } catch (err: any) {
      toastError('Erro', err.message || 'Não foi possível aprovar.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClientAccess = async (notification: Notification) => {
    const requestId = requestIdForNotification(notification);
    if (!requestId) return;
    setProcessingId(notification._id);
    try {
      const res = await apiService.rejectClientAccessRequest(requestId);
      if (res.success) {
        toastSuccess('Rejeitado', 'Solicitação de uso do cliente rejeitada.');
        await apiService.deleteNotification(notification._id);
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      } else {
        toastError('Erro', res.message || 'Não foi possível rejeitar.');
      }
    } catch (err: any) {
      toastError('Erro', err.message || 'Não foi possível rejeitar.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'goal_achieved':
        return '🎯';
      case 'goal_milestone':
        return '📈';
      case 'goal_completed':
        return '🏆';
      case 'goal_created':
        return '➕';
      case 'goal_updated':
        return '✏️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'notice':
        return '📢';
      case 'client_access_request':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Container>
      <Header>
        <Title>
          <Bell size={24} style={{ marginRight: '12px' }} />
          Notificações
        </Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar notificações..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
        </Actions>
      </Header>
      
      <Content>
        <HeaderActions>
          {notifications.some(n => !n.isRead) && (
            <MarkAllButton onClick={markAllAsRead}>
              <Check size={18} />
              Marcar todas como lidas
            </MarkAllButton>
          )}
          {notifications.length > 0 && (
            <ClearAllButton onClick={clearAll}>
              <Sparkles size={18} />
              Limpar todas
            </ClearAllButton>
          )}
        </HeaderActions>

        <NotificationsList>
          {loading ? (
            <LoadingContainer>
              <Loader2 size={24} className="animate-spin" />
              <LoadingText>Carregando notificações...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorText>{error}</ErrorText>
            </ErrorContainer>
          ) : filteredNotifications.length === 0 ? (
            <EmptyContainer>
              <Bell size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <EmptyText>Nenhuma notificação encontrada</EmptyText>
              <EmptyText style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                Você receberá notificações quando bater metas ou houver avisos!
              </EmptyText>
            </EmptyContainer>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                $isRead={notification.isRead}
                $priority={notification.priority}
              >
                <NotificationIcon>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </NotificationTime>
                </NotificationContent>
                <NotificationActions>
                  {notification.type === 'client_access_request' && (
                    <>
                      <ActionButton
                        onClick={() => handleApproveClientAccess(notification)}
                        title="Aceitar uso do cliente"
                        disabled={processingId === notification._id}
                      >
                        {processingId === notification._id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleRejectClientAccess(notification)}
                        title="Rejeitar"
                        disabled={processingId === notification._id}
                      >
                        <UserX size={14} />
                      </ActionButton>
                    </>
                  )}
                  {!notification.isRead && notification.type !== 'client_access_request' && (
                    <ActionButton
                      onClick={() => markAsRead(notification)}
                      title="Marcar como lida"
                    >
                      <Check size={14} />
                    </ActionButton>
                  )}
                  <ActionButton
                    onClick={() => deleteNotification(notification)}
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                </NotificationActions>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </Content>
    </Container>
  );
};
