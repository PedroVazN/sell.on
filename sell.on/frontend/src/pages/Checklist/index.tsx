import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ListTodo, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiService, ChecklistItem } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as S from './styles';

export const Checklist: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getChecklistItems();
      if (res.success) setItems(res.data || []);
    } catch (err: any) {
      showError('Checklist', err?.message || 'Não foi possível carregar os itens');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const completedCount = useMemo(() => items.filter(item => item.isCompleted).length, [items]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const res = await apiService.createChecklistItem({
        title: title.trim(),
        description: description.trim(),
      });
      if (res.success && res.data) {
        setItems(prev => [res.data, ...prev]);
        setTitle('');
        setDescription('');
        success('Checklist', 'Ideia adicionada com sucesso');
      }
    } catch (err: any) {
      showError('Checklist', err?.message || 'Não foi possível adicionar a ideia');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setWorkingId(id);
      const res = await apiService.toggleChecklistItem(id);
      if (res.success && res.data) {
        setItems(prev => prev.map(item => (item._id === id ? res.data : item)));
      }
    } catch (err: any) {
      showError('Checklist', err?.message || 'Não foi possível atualizar o item');
    } finally {
      setWorkingId(null);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    const ok = await confirm({
      title: 'Excluir ideia',
      message: `Deseja remover "${itemTitle}"?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      setWorkingId(id);
      const res = await apiService.deleteChecklistItem(id);
      if (res.success) {
        setItems(prev => prev.filter(item => item._id !== id));
        success('Checklist', 'Ideia removida');
      }
    } catch (err: any) {
      showError('Checklist', err?.message || 'Não foi possível remover o item');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>
            <ListTodo size={22} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            Checklist de Implementos
          </S.Title>
          <S.Subtitle>Adicione novas ideias e marque como concluídas quando forem entregues.</S.Subtitle>
        </div>
        <S.Stats>
          <S.StatPill>Total: {items.length}</S.StatPill>
          <S.StatPill $completed>Concluídas: {completedCount}</S.StatPill>
          <S.StatPill>Pendentes: {Math.max(items.length - completedCount, 0)}</S.StatPill>
        </S.Stats>
      </S.Header>

      <S.FormCard onSubmit={handleCreate}>
        <S.Label htmlFor="checklist-title">Nova ideia</S.Label>
        <S.Input
          id="checklist-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Automação de follow-up no WhatsApp"
          maxLength={180}
          required
        />
        <S.Label htmlFor="checklist-description">Descrição (opcional)</S.Label>
        <S.TextArea
          id="checklist-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhe o escopo da implementação..."
          maxLength={2000}
        />
        <S.PrimaryButton type="submit" disabled={creating}>
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {' '}
          {creating ? 'Adicionando...' : 'Adicionar ideia'}
        </S.PrimaryButton>
      </S.FormCard>

      <S.ListCard>
        {loading ? (
          <S.EmptyState>
            <Loader2 size={18} className="animate-spin" /> Carregando checklist...
          </S.EmptyState>
        ) : items.length === 0 ? (
          <S.EmptyState>Nenhuma ideia cadastrada ainda.</S.EmptyState>
        ) : (
          items.map((item) => (
            <S.ItemRow key={item._id} $done={item.isCompleted}>
              <S.Checkbox
                type="button"
                $done={item.isCompleted}
                onClick={() => handleToggle(item._id)}
                disabled={workingId === item._id}
                aria-label={item.isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                title={item.isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
              >
                {workingId === item._id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : item.isCompleted ? (
                  <Check size={12} />
                ) : null}
              </S.Checkbox>

              <div>
                <S.ItemTitle $done={item.isCompleted}>{item.title}</S.ItemTitle>
                {item.description ? <S.ItemDescription>{item.description}</S.ItemDescription> : null}
                <S.Meta>
                  Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  {item.completedAt ? ` • Concluído em ${new Date(item.completedAt).toLocaleDateString('pt-BR')}` : ''}
                </S.Meta>
              </div>

              <S.RowActions>
                <S.GhostButton
                  type="button"
                  onClick={() => handleDelete(item._id, item.title)}
                  disabled={workingId === item._id}
                  aria-label="Excluir ideia"
                  title="Excluir ideia"
                >
                  <Trash2 size={14} />
                </S.GhostButton>
              </S.RowActions>
            </S.ItemRow>
          ))
        )}
      </S.ListCard>
    </S.Container>
  );
};

export default Checklist;
