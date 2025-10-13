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
    isActive: true,
    imageUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

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
      isActive: notice.isActive,
      imageUrl: notice.imageUrl || ''
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
      isActive: true,
      imageUrl: ''
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Erro!', 'Imagem muito grande! Máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      error('Erro!', 'Arquivo deve ser uma imagem');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Usar FormData diretamente com o arquivo
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      const response = await fetch('https://api.imgbb.com/1/upload?key=82c0d0b492dbf0f5e9d0ec3d24b8c5e5', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      
      if (data.success && data.data && data.data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
        success('Sucesso!', 'Imagem enviada com sucesso!');
      } else {
        console.error('Resposta da API:', data);
        throw new Error(data.error?.message || 'Falha no upload');
      }
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      error('Erro!', err.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
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

              <S.FormGroup>
                <S.Label>Imagem (opcional)</S.Label>
                
                {/* Botão de Upload */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <label 
                    htmlFor="image-upload" 
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: uploadingImage ? '#6b7280' : '#10b981',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    {uploadingImage ? '⏳ Enviando...' : '📤 Enviar do Computador'}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* OU usar URL */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  margin: '0.5rem 0',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#334155' }} />
                  <span>OU</span>
                  <div style={{ flex: 1, height: '1px', background: '#334155' }} />
                </div>

                <S.Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Cole a URL da imagem aqui"
                  disabled={uploadingImage}
                />
                
                {/* Preview da Imagem */}
                {formData.imageUrl && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      style={{ 
                        width: '100%',
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '2px solid #334155'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      🗑️ Remover Imagem
                    </button>
                  </div>
                )}
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

              {notice.imageUrl && (
                <S.NoticeImage 
                  src={notice.imageUrl} 
                  alt={notice.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

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
