import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { apiService, ProposalChat } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as S from './styles';

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const vendedorName = (chat: ProposalChat) => {
  const v = chat.vendedor;
  if (typeof v === 'object' && v !== null && 'name' in v) return (v as { name: string }).name;
  return 'Vendedor';
};

const proposalNumber = (chat: ProposalChat) => {
  const p = chat.proposal;
  if (typeof p === 'object' && p !== null && 'proposalNumber' in p) return (p as { proposalNumber: string }).proposalNumber;
  return '—';
};

const lastMessagePreview = (chat: ProposalChat) => {
  const msgs = chat.messages || [];
  if (msgs.length === 0) return '—';
  const last = msgs[msgs.length - 1];
  const text = last.text || '';
  return text.length > 50 ? text.slice(0, 50) + '…' : text;
};

export const Chats: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const [chats, setChats] = useState<ProposalChat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getProposalChatList();
      if (res.success && Array.isArray(res.data)) setChats(res.data);
    } catch {
      showError('Erro', 'Não foi possível carregar as conversas.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleDelete = async (chat: ProposalChat) => {
    const ok = await confirm({
      title: 'Excluir conversa',
      message: `Excluir a conversa da proposta ${proposalNumber(chat)} com ${vendedorName(chat)}? As mensagens serão removidas permanentemente.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiService.deleteProposalChat(chat._id);
      loadChats();
      success('Conversa excluída', 'A conversa foi removida.');
    } catch {
      showError('Erro', 'Não foi possível excluir a conversa.');
    }
  };

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Mensagens</S.Title>
          <S.Hint>Use o botão de mensagens no canto inferior direito da tela para abrir e responder as conversas.</S.Hint>
        </div>
      </S.Header>
      <S.Content>
        {loading ? (
          <S.LoadingState>
            <Loader2 size={22} className="spin" />
            Carregando conversas...
          </S.LoadingState>
        ) : chats.length === 0 ? (
          <S.EmptyState>Nenhuma conversa ainda.</S.EmptyState>
        ) : (
          <S.Table>
            <S.TableHeader>
              <tr>
                <S.Th>Proposta</S.Th>
                <S.Th>Vendedor</S.Th>
                <S.Th>Última mensagem</S.Th>
                <S.Th>Atualizado</S.Th>
                <S.Th style={{ width: 80 }}>Ações</S.Th>
              </tr>
            </S.TableHeader>
            <S.TableBody>
              {chats.map((chat) => {
                const last = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
                const updated = chat.updatedAt || last?.createdAt || '';
                return (
                  <S.TableRow key={chat._id}>
                    <S.Td>{proposalNumber(chat)}</S.Td>
                    <S.Td>{vendedorName(chat)}</S.Td>
                    <S.Td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMessagePreview(chat)}
                    </S.Td>
                    <S.Td>{updated ? formatTime(updated) : '—'}</S.Td>
                    <S.Td>
                      <S.ActionButton type="button" onClick={() => handleDelete(chat)} aria-label="Excluir conversa" title="Excluir conversa">
                        <Trash2 size={18} />
                      </S.ActionButton>
                    </S.Td>
                  </S.TableRow>
                );
              })}
            </S.TableBody>
          </S.Table>
        )}
      </S.Content>
    </S.Container>
  );
};
