import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Loader2, Sparkles } from 'lucide-react';
import { apiService, Notification } from '../../services/api';
import * as S from './styles';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar notificações não lidas
  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Erro ao carregar contador de notificações:', err);
    }
  };

  // Carregar notificações
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getNotifications(1, 10, false);
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
      const response = await apiService.deleteNotification(notification._id);
      if (response.success) {
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

  // Atualizar contador a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000);
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
                  Você receberá notificações quando bater metas!
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
                    {!notification.isRead && (
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
