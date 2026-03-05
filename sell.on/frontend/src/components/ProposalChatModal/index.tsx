import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { apiService, ProposalChat, ProposalChatMessage } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Proposal } from '../../services/api';
import * as S from './styles';

interface ProposalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
}

const formatMessageTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const ProposalChatModal: React.FC<ProposalChatModalProps> = ({ isOpen, onClose, proposal }) => {
  const { user } = useAuth();
  const { error: showError } = useToastContext();
  const [chat, setChat] = useState<ProposalChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isOpen || !proposal?._id) return;
    setChat(null);
    setMessageText('');
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiService.getProposalChat(proposal._id);
        if (!cancelled && res.success && res.data) setChat(res.data);
      } catch (err) {
        if (!cancelled) showError('Erro', err instanceof Error ? err.message : 'Não foi possível carregar o chat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, proposal?._id, showError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages?.length]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !chat?._id || sending) return;
    setSending(true);
    try {
      const res = await apiService.sendProposalChatMessage(chat._id, text);
      if (res.success && res.data) {
        setChat(res.data);
        setMessageText('');
      }
    } catch (err) {
      showError('Erro', err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const title = isAdmin
    ? `Chat - ${proposal.proposalNumber} (${proposal.seller?.name || 'Vendedor'})`
    : `Chat com Admin - ${proposal.proposalNumber}`;

  return (
    <S.Overlay onClick={onClose}>
      <S.ModalBox onClick={(e) => e.stopPropagation()}>
        <S.Header>
          <S.TitleWrap>
            <MessageCircle size={22} />
            <S.Title>{title}</S.Title>
          </S.TitleWrap>
          <S.CloseButton type="button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </S.CloseButton>
        </S.Header>
        <S.Body>
          {loading ? (
            <S.LoadingWrap>
              <Loader2 size={32} className="spin" />
              <span>Carregando chat...</span>
            </S.LoadingWrap>
          ) : chat ? (
            <>
              <S.MessagesList>
                {(chat.messages || []).length === 0 ? (
                  <S.EmptyMessages>
                    Nenhuma mensagem ainda. Inicie a conversa com o {isAdmin ? 'vendedor' : 'admin'}.
                  </S.EmptyMessages>
                ) : (
                  (chat.messages || []).map((msg: ProposalChatMessage) => {
                    const senderId = typeof msg.sender === 'object' && msg.sender !== null && '_id' in msg.sender ? msg.sender._id : '';
                    const isMe = user?._id === senderId;
                    const senderName = typeof msg.sender === 'object' && msg.sender !== null && 'name' in msg.sender ? msg.sender.name : 'Usuário';
                    return (
                      <S.MessageBubble key={msg._id} $isMe={isMe}>
                        <S.MessageMeta>
                          {senderName} · {formatMessageTime(msg.createdAt)}
                        </S.MessageMeta>
                        <S.MessageText>{msg.text}</S.MessageText>
                      </S.MessageBubble>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </S.MessagesList>
              <S.InputWrap>
                <S.Input
                  placeholder={isAdmin ? 'Mensagem para o vendedor...' : 'Mensagem para o admin...'}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  maxLength={2000}
                />
                <S.SendButton type="button" onClick={handleSend} disabled={sending || !messageText.trim()}>
                  {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                </S.SendButton>
              </S.InputWrap>
            </>
          ) : (
            <S.LoadingWrap>
              <span>Não foi possível carregar o chat.</span>
            </S.LoadingWrap>
          )}
        </S.Body>
      </S.ModalBox>
    </S.Overlay>
  );
};
