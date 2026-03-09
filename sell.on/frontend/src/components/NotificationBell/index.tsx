import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Loader2, Sparkles, UserCheck, UserX } from 'lucide-react';
import { apiService, Notification } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import * as S from './styles';

interface NotificationBellProps {
  className?: string;
}

const requestIdForNotification = (n: Notification) =>
  (n.data && (n.data as any).requestId) || n.relatedEntity || '';

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { success: toastSuccess, error: toastError } = useToastContext();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousUnreadRef = useRef<number | null>(null);

  // Carregar notificações não lidas
  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.success) {
        const newCount = response.data.count;
        if (previousUnreadRef.current !== null && newCount > previousUnreadRef.current) {
          toastSuccess('Nova mensagem no chat', 'Você tem novas notificações. Clique no sino para ver.');
        }
        previousUnreadRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error('Erro ao carregar contador de notificações:', err);
      setUnreadCount(0);
    }
  };

  // Carregar notificações
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔔 Carregando notificações do usuário...');
      const response = await apiService.getNotifications(1, 10, false);
      if (response.success) {
        console.log(`🔔 Notificações carregadas: ${response.data.length} notificações`);
        console.log('🔔 Notificações:', response.data.map(n => ({
          id: n._id,
          recipient: n.recipient,
          title: n.title,
          isRead: n.isRead
        })));
        setNotifications(response.data);
      } else {
        setError('Erro ao carregar notificações');
      }
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setError(err.message || 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notification: Notification) => {
    try {
      console.log(`🔔 Marcando notificação como lida:`, {
        id: notification._id,
        recipient: notification.recipient,
        title: notification.title
      });
      
      const response = await apiService.markNotificationAsRead(notification._id);
      if (response.success) {
        console.log('✅ Notificação marcada como lida com sucesso');
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
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
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  // Deletar notificação
  const deleteNotification = async (notification: Notification) => {
    try {
      console.log(`🗑️ Deletando notificação:`, {
        id: notification._id,
        recipient: notification.recipient,
        title: notification.title
      });
      
      const response = await apiService.deleteNotification(notification._id);
      if (response.success) {
        console.log('✅ Notificação deletada com sucesso');
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        if (!notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
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
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  };

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
        setUnreadCount((c) => Math.max(0, c - 1));
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
        setUnreadCount((c) => Math.max(0, c - 1));
      } else {
        toastError('Erro', res.message || 'Não foi possível rejeitar.');
      }
    } catch (err: any) {
      toastError('Erro', err.message || 'Não foi possível rejeitar.');
    } finally {
      setProcessingId(null);
    }
  };

  // Abrir dropdown
  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };


  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar contador inicial
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Atualizar contador a cada 15 segundos (inclui novas mensagens de chat para admin)
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 15000);
    return () => clearInterval(interval);
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
      case 'chat_message':
        return '💬';
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

  return (
    <S.Container className={className}>
      <S.BellButton onClick={handleToggle} $hasUnread={unreadCount > 0}>
        <Bell size={20} />
        {unreadCount > 0 && <S.Badge>{unreadCount}</S.Badge>}
      </S.BellButton>

      {isOpen && (
        <S.Dropdown ref={dropdownRef}>
          <S.DropdownHeader>
            <S.Title>
              <Bell size={20} style={{ marginRight: '8px' }} />
              Notificações
            </S.Title>
            <S.HeaderActions>
              {notifications.some(n => !n.isRead) && (
                <S.ActionButton onClick={markAllAsRead} title="Marcar todas como lidas">
                  <Check size={18} />
                </S.ActionButton>
              )}
              {notifications.length > 0 && (
                <S.ActionButton onClick={clearAll} title="Limpar todas as notificações">
                  <Sparkles size={18} />
                </S.ActionButton>
              )}
              <S.CloseButton onClick={() => setIsOpen(false)}>
                <X size={18} />
              </S.CloseButton>
            </S.HeaderActions>
          </S.DropdownHeader>

          <S.NotificationsList>
            {loading ? (
              <S.LoadingContainer>
                <Loader2 size={24} className="animate-spin" />
                <S.LoadingText>Carregando notificações...</S.LoadingText>
              </S.LoadingContainer>
            ) : error ? (
              <S.ErrorContainer>
                <S.ErrorText>{error}</S.ErrorText>
              </S.ErrorContainer>
            ) : notifications.length === 0 ? (
              <S.EmptyContainer>
                <Bell size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <S.EmptyText>Nenhuma notificação</S.EmptyText>
                <S.EmptyText style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  Você receberá notificações quando bater metas ou houver avisos!
                </S.EmptyText>
              </S.EmptyContainer>
            ) : (
              notifications.map((notification) => (
                <S.NotificationItem
                  key={notification._id}
                  $isRead={notification.isRead}
                  $priority={notification.priority}
                >
                  <S.NotificationIcon>
                    {getNotificationIcon(notification.type)}
                  </S.NotificationIcon>
                  <S.NotificationContent>
                    <S.NotificationTitle>{notification.title}</S.NotificationTitle>
                    <S.NotificationMessage>{notification.message}</S.NotificationMessage>
                    <S.NotificationTime>
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </S.NotificationTime>
                  </S.NotificationContent>
                  <S.NotificationActions>
                    {notification.type === 'client_access_request' && (
                      <>
                        <S.ActionButton
                          onClick={() => handleApproveClientAccess(notification)}
                          title="Aceitar uso do cliente"
                          disabled={processingId === notification._id}
                        >
                          {processingId === notification._id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        </S.ActionButton>
                        <S.ActionButton
                          onClick={() => handleRejectClientAccess(notification)}
                          title="Rejeitar"
                          disabled={processingId === notification._id}
                        >
                          <UserX size={14} />
                        </S.ActionButton>
                      </>
                    )}
                    {!notification.isRead && notification.type !== 'client_access_request' && (
                      <S.ActionButton
                        onClick={() => markAsRead(notification)}
                        title="Marcar como lida"
                      >
                        <Check size={14} />
                      </S.ActionButton>
                    )}
                    <S.ActionButton
                      onClick={() => deleteNotification(notification)}
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </S.ActionButton>
                  </S.NotificationActions>
                </S.NotificationItem>
              ))
            )}
          </S.NotificationsList>
        </S.Dropdown>
      )}
    </S.Container>
  );
};

export default NotificationBell;
