import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { apiService, ProposalTask } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import * as S from './styles';

type FilterStatus = 'pending' | 'completed' | 'all';

export const FollowUpTasks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastContext();
  const [tasks, setTasks] = useState<ProposalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [followUpDays, setFollowUpDays] = useState(7);

  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getProposalTasks({
        status: filter === 'all' ? undefined : filter,
        pending: filter === 'pending' ? true : undefined,
      });
      if (res.success) {
        setTasks(res.data || []);
        if (res.meta?.followUpDays) setFollowUpDays(res.meta.followUpDays);
      }
    } catch (err) {
      showError('Follow-up', err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [filter, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (task: ProposalTask) => {
    try {
      const res = await apiService.completeProposalTask(task._id);
      if (res.success) {
        showSuccess('Follow-up', 'Tarefa concluída');
        load();
      }
    } catch (err) {
      showError('Follow-up', err instanceof Error ? err.message : 'Erro ao concluir');
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await apiService.runProposalFollowUpScan();
      if (res.success && res.data) {
        const d = res.data;
        showSuccess(
          'Follow-up',
          `Varredura: ${d.tasksCreated} tarefa(s), ${d.notificationsCreated} notificação(ões)`
        );
        load();
      }
    } catch (err) {
      showError('Follow-up', err instanceof Error ? err.message : 'Erro na varredura');
    } finally {
      setScanning(false);
    }
  };

  const openProposal = (task: ProposalTask) => {
    const id =
      typeof task.proposal === 'object' && task.proposal?._id
        ? task.proposal._id
        : (task.proposal as string);
    if (id) navigate(`/proposals/edit/${id}`);
  };

  const clientLabel = (task: ProposalTask) => {
    const p = task.proposal;
    if (!p || typeof p !== 'object') return '';
    const c = p.client;
    return c?.razaoSocial || c?.company || c?.name || '';
  };

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Follow-up de propostas</S.Title>
          <S.Subtitle>
            Propostas em negociação há {followUpDays}+ dias geram tarefa automática e notificação
            no sino.
          </S.Subtitle>
        </div>
        <S.Actions>
          <S.Button type="button" onClick={load} disabled={loading}>
            <RefreshCw size={16} />
            Atualizar
          </S.Button>
          {isAdmin && (
            <S.Button type="button" $primary onClick={handleScan} disabled={scanning}>
              {scanning ? <Loader2 size={16} /> : <Clock size={16} />}
              Executar automação
            </S.Button>
          )}
        </S.Actions>
      </S.Header>

      <S.FilterRow>
        <S.FilterBtn $active={filter === 'pending'} onClick={() => setFilter('pending')}>
          Pendentes
        </S.FilterBtn>
        <S.FilterBtn $active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Concluídas
        </S.FilterBtn>
        <S.FilterBtn $active={filter === 'all'} onClick={() => setFilter('all')}>
          Todas
        </S.FilterBtn>
      </S.FilterRow>

      {loading ? (
        <S.Empty>
          <Loader2 size={24} style={{ marginRight: 8 }} />
          Carregando...
        </S.Empty>
      ) : tasks.length === 0 ? (
        <S.Empty>Nenhuma tarefa neste filtro.</S.Empty>
      ) : (
        <S.List>
          {tasks.map((task) => {
            const overdue =
              task.status === 'pending' &&
              task.dueAt &&
              new Date(task.dueAt) < new Date();
            return (
              <S.Card key={task._id} $overdue={overdue}>
                <S.CardBody>
                  <S.CardTitle>{task.title}</S.CardTitle>
                  <S.CardMeta>
                    {typeof task.proposal === 'object' && task.proposal?.proposalNumber && (
                      <>
                        <strong>{task.proposal.proposalNumber}</strong>
                        {clientLabel(task) ? ` · ${clientLabel(task)}` : ''}
                        <br />
                      </>
                    )}
                    {task.daysInNegotiation != null &&
                      `${task.daysInNegotiation} dias em negociação`}
                    {task.dueAt &&
                      ` · Prazo: ${new Date(task.dueAt).toLocaleDateString('pt-BR')}`}
                    {task.notes && (
                      <>
                        <br />
                        {task.notes}
                      </>
                    )}
                  </S.CardMeta>
                </S.CardBody>
                <S.CardActions>
                  <S.Button type="button" onClick={() => openProposal(task)}>
                    <ExternalLink size={16} />
                    Proposta
                  </S.Button>
                  {task.status === 'pending' &&
                    (isAdmin ||
                      (typeof task.assignedTo === 'object' &&
                        task.assignedTo?._id === user?._id)) && (
                      <S.Button type="button" $primary onClick={() => handleComplete(task)}>
                        <CheckCircle2 size={16} />
                        Concluir
                      </S.Button>
                    )}
                </S.CardActions>
              </S.Card>
            );
          })}
        </S.List>
      )}
    </S.Container>
  );
};

export default FollowUpTasks;
