import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { apiService, Notice } from '../../services/api';
import { 
  AlertCircle, 
  Clock, 
  User,
  Calendar,
  Target,
  Bell,
  BellOff
} from 'lucide-react';
import * as S from './styles';

const NoticesViewer: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToastContext();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotices();
      if (response.success) {
        setNotices(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar avisos:', err);
      error('Erro!', 'Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (notice: Notice) => {
    if (!notice.expiresAt) return false;
    return new Date(notice.expiresAt) < new Date();
  };

  const filteredNotices = notices.filter(notice => {
    if (filter === 'active') return notice.isActive && !isExpired(notice);
    if (filter === 'expired') return isExpired(notice);
    return true;
  });

  const activeNotices = notices.filter(notice => notice.isActive && !isExpired(notice));
  const urgentNotices = activeNotices.filter(notice => notice.priority === 'urgent');

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Mural de Avisos</S.Title>
          <S.Subtitle>Fique por dentro das últimas informações</S.Subtitle>
        </div>
        
        {urgentNotices.length > 0 && (
          <S.UrgentBadge>
            <Bell size={16} />
            {urgentNotices.length} Urgente{urgentNotices.length !== 1 ? 's' : ''}
          </S.UrgentBadge>
        )}
      </S.Header>

      <S.Filters>
        <S.FilterButton 
          $active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          Todos ({notices.length})
        </S.FilterButton>
        <S.FilterButton 
          $active={filter === 'active'} 
          onClick={() => setFilter('active')}
        >
          <Bell size={14} />
          Ativos ({activeNotices.length})
        </S.FilterButton>
        <S.FilterButton 
          $active={filter === 'expired'} 
          onClick={() => setFilter('expired')}
        >
          <BellOff size={14} />
          Expirados ({notices.filter(isExpired).length})
        </S.FilterButton>
      </S.Filters>

      <S.NoticesList>
        {loading ? (
          <S.Loading>Carregando avisos...</S.Loading>
        ) : filteredNotices.length === 0 ? (
          <S.EmptyState>
            <AlertCircle size={48} />
            <h3>Nenhum aviso encontrado</h3>
            <p>
              {filter === 'active' ? 'Não há avisos ativos no momento.' :
               filter === 'expired' ? 'Não há avisos expirados.' :
               'Não há avisos disponíveis.'}
            </p>
          </S.EmptyState>
        ) : (
          filteredNotices.map((notice) => {
            const expired = isExpired(notice);
            return (
              <S.NoticeCard 
                key={notice._id} 
                $priority={notice.priority}
                $expired={expired}
                $inactive={!notice.isActive}
              >
                <S.NoticeHeader>
                  <S.NoticeTitle>{notice.title}</S.NoticeTitle>
                  <S.PriorityBadge $priority={notice.priority}>
                    {getPriorityLabel(notice.priority)}
                  </S.PriorityBadge>
                </S.NoticeHeader>

                <S.NoticeContent>{notice.content}</S.NoticeContent>

                <S.NoticeFooter>
                  <S.NoticeInfo>
                    <S.InfoItem>
                      <User size={14} />
                      <span>{notice.createdBy?.name || 'Usuário não encontrado'}</span>
                    </S.InfoItem>
                    <S.InfoItem>
                      <Calendar size={14} />
                      <span>{formatDate(notice.createdAt)}</span>
                    </S.InfoItem>
                    {notice.expiresAt && (
                      <S.InfoItem $expired={expired}>
                        <Clock size={14} />
                        <span>
                          {expired ? 'Expirado em' : 'Expira em'}: {formatDate(notice.expiresAt)}
                        </span>
                      </S.InfoItem>
                    )}
                  </S.NoticeInfo>

                  <S.NoticeStatus $active={notice.isActive && !expired}>
                    {notice.isActive && !expired ? (
                      <>
                        <Bell size={14} />
                        <span>Ativo</span>
                      </>
                    ) : expired ? (
                      <>
                        <Clock size={14} />
                        <span>Expirado</span>
                      </>
                    ) : (
                      <>
                        <BellOff size={14} />
                        <span>Inativo</span>
                      </>
                    )}
                  </S.NoticeStatus>
                </S.NoticeFooter>
              </S.NoticeCard>
            );
          })
        )}
      </S.NoticesList>
    </S.Container>
  );
};

export default NoticesViewer;
