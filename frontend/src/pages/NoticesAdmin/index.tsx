import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { apiService, Notice } from '../../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Clock, 
  User,
  Calendar,
  Target
} from 'lucide-react';
import * as S from './styles';

const NoticesAdmin: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToastContext();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetRoles: ['all'] as ('admin' | 'vendedor' | 'all')[],
    expiresAt: '',
    isActive: true
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      warning('Atenção!', 'Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const noticeData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
      };

      if (editingNotice) {
        await apiService.updateNotice(editingNotice._id, noticeData);
        success('Sucesso!', 'Aviso atualizado com sucesso!');
      } else {
        await apiService.createNotice(noticeData);
        success('Sucesso!', 'Aviso criado com sucesso!');
      }

      setShowForm(false);
      setEditingNotice(null);
      resetForm();
      loadNotices();
    } catch (err) {
      console.error('Erro ao salvar aviso:', err);
      error('Erro!', 'Erro ao salvar aviso');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetRoles: notice.targetRoles,
      expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().split('T')[0] : '',
      isActive: notice.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este aviso?')) {
      try {
        await apiService.deleteNotice(id);
        success('Sucesso!', 'Aviso deletado com sucesso!');
        loadNotices();
      } catch (err) {
        console.error('Erro ao deletar aviso:', err);
        error('Erro!', 'Erro ao deletar aviso');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      targetRoles: ['all'],
      expiresAt: '',
      isActive: true
    });
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

  if (user?.role !== 'admin') {
    return (
      <S.Container>
        <S.AccessDenied>
          <AlertCircle size={48} />
          <h2>Acesso Negado</h2>
          <p>Apenas administradores podem acessar esta página.</p>
        </S.AccessDenied>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Mural de Avisos</S.Title>
          <S.Subtitle>Gerencie os avisos do sistema</S.Subtitle>
        </div>
        <S.CreateButton onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Novo Aviso
        </S.CreateButton>
      </S.Header>

      {showForm && (
        <S.Modal>
          <S.ModalContent>
            <S.ModalHeader>
              <S.ModalTitle>
                {editingNotice ? 'Editar Aviso' : 'Novo Aviso'}
              </S.ModalTitle>
              <S.CloseButton onClick={() => {
                setShowForm(false);
                setEditingNotice(null);
                resetForm();
              }}>
                ×
              </S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleSubmit}>
              <S.FormGroup>
                <S.Label>Título *</S.Label>
                <S.Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título do aviso"
                  maxLength={200}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Conteúdo *</S.Label>
                <S.TextArea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo do aviso"
                  maxLength={2000}
                  rows={6}
                />
              </S.FormGroup>

              <S.FormRow>
                <S.FormGroup>
                  <S.Label>Prioridade</S.Label>
                  <S.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </S.Select>
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Público Alvo</S.Label>
                  <S.Select
                    value={formData.targetRoles[0]}
                    onChange={(e) => setFormData({ ...formData, targetRoles: [e.target.value as any] })}
                  >
                    <option value="all">Todos</option>
                    <option value="admin">Apenas Admins</option>
                    <option value="vendedor">Apenas Vendedores</option>
                  </S.Select>
                </S.FormGroup>
              </S.FormRow>

              <S.FormGroup>
                <S.Label>Data de Expiração (opcional)</S.Label>
                <S.Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </S.FormGroup>

              <S.CheckboxGroup>
                <S.Checkbox
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <S.CheckboxLabel>Aviso ativo</S.CheckboxLabel>
              </S.CheckboxGroup>

              <S.ModalFooter>
                <S.CancelButton
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNotice(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </S.CancelButton>
                <S.SaveButton type="submit">
                  {editingNotice ? 'Atualizar' : 'Criar'} Aviso
                </S.SaveButton>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.Modal>
      )}

      <S.NoticesList>
        {loading ? (
          <S.Loading>Carregando avisos...</S.Loading>
        ) : notices.length === 0 ? (
          <S.EmptyState>
            <AlertCircle size={48} />
            <h3>Nenhum aviso encontrado</h3>
            <p>Crie seu primeiro aviso para começar.</p>
          </S.EmptyState>
        ) : (
          notices.map((notice) => (
            <S.NoticeCard key={notice._id} $priority={notice.priority}>
              <S.NoticeHeader>
                <S.NoticeTitle>{notice.title}</S.NoticeTitle>
                <S.NoticeActions>
                  <S.ActionButton onClick={() => handleEdit(notice)}>
                    <Edit size={16} />
                  </S.ActionButton>
                  <S.ActionButton 
                    onClick={() => handleDelete(notice._id)}
                    $danger
                  >
                    <Trash2 size={16} />
                  </S.ActionButton>
                </S.NoticeActions>
              </S.NoticeHeader>

              <S.NoticeContent>{notice.content}</S.NoticeContent>

              <S.NoticeFooter>
                <S.NoticeInfo>
                  <S.InfoItem>
                    <Target size={14} />
                    <span>
                      {notice.targetRoles.includes('all') ? 'Todos' : 
                       notice.targetRoles.includes('admin') ? 'Admins' : 'Vendedores'}
                    </span>
                  </S.InfoItem>
                  <S.InfoItem>
                    <User size={14} />
                    <span>{notice.createdBy?.name || 'Usuário não encontrado'}</span>
                  </S.InfoItem>
                  <S.InfoItem>
                    <Calendar size={14} />
                    <span>{formatDate(notice.createdAt)}</span>
                  </S.InfoItem>
                  {notice.expiresAt && (
                    <S.InfoItem>
                      <Clock size={14} />
                      <span>Expira: {formatDate(notice.expiresAt)}</span>
                    </S.InfoItem>
                  )}
                </S.NoticeInfo>

                <S.NoticeStatus $active={notice.isActive}>
                  {notice.isActive ? (
                    <>
                      <Eye size={14} />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      <span>Inativo</span>
                    </>
                  )}
                </S.NoticeStatus>
              </S.NoticeFooter>
            </S.NoticeCard>
          ))
        )}
      </S.NoticesList>
    </S.Container>
  );
};

export default NoticesAdmin;
