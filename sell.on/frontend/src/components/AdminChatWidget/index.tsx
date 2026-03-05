import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, ArrowLeft } from 'lucide-react';
import { apiService, ProposalChat, ProposalChatMessage } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import * as S from './styles';

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatMessageTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const AdminChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { error: showError } = useToastContext();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'thread'>('list');
  const [chats, setChats] = useState<ProposalChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<ProposalChat | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!open || !isAdmin) return;
    if (view === 'list') {
      let cancelled = false;
      setLoadingList(true);
      apiService
        .getProposalChatList()
        .then((res) => {
          if (!cancelled && res.success && Array.isArray(res.data)) {
            setChats(res.data);
          }
        })
        .catch(() => {
          if (!cancelled) showError('Erro', 'Não foi possível carregar as conversas.');
        })
        .finally(() => {
          if (!cancelled) setLoadingList(false);
        });
      return () => { cancelled = true; };
    }
  }, [open, view, isAdmin, showError]);

  useEffect(() => {
    if (view !== 'thread' || !selectedChat?._id) return;
    let cancelled = false;
    setLoadingThread(true);
    apiService
      .getProposalChatById(selectedChat._id)
      .then((res) => {
        if (!cancelled && res.success && res.data) setSelectedChat(res.data);
      })
      .catch(() => {
        if (!cancelled) showError('Erro', 'Não foi possível carregar o chat.');
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => { cancelled = true; };
  }, [view, selectedChat?._id, showError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages?.length]);

  const handleOpenChat = (chat: ProposalChat) => {
    setSelectedChat(chat);
    setMessageText('');
    setView('thread');
  };

  const handleBack = () => {
    setView('list');
    setSelectedChat(null);
    setMessageText('');
    // Recarrega a lista ao voltar para refletir novas mensagens
    if (isAdmin) {
      setLoadingList(true);
      apiService.getProposalChatList()
        .then((res) => { if (res.success && Array.isArray(res.data)) setChats(res.data); })
        .finally(() => setLoadingList(false));
    }
  };

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !selectedChat?._id || sending) return;
    setSending(true);
    try {
      const res = await apiService.sendProposalChatMessage(selectedChat._id, text);
      if (res.success && res.data) setSelectedChat(res.data);
      setMessageText('');
    } catch {
      showError('Erro', 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const lastMessage = (chat: ProposalChat) => {
    const msgs = chat.messages || [];
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

  const vendedorName = (chat: ProposalChat) => {
    const v = chat.vendedor;
    if (typeof v === 'object' && v !== null && 'name' in v) return (v as { name: string }).name;
    return 'Vendedor';
  };

  const proposalNumber = (chat: ProposalChat) => {
    const p = chat.proposal;
    if (typeof p === 'object' && p !== null && 'proposalNumber' in p) return (p as { proposalNumber: string }).proposalNumber;
    return '';
  };

  if (!isAdmin) return null;

  return (
    <S.WidgetWrap>
      <div style={{ position: 'relative' }}>
        <S.ToggleButton
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fechar mensagens' : 'Abrir mensagens'}
        >
          <MessageCircle size={26} />
        </S.ToggleButton>
        {!open && chats.some((c) => (c.messages?.length ?? 0) > 0) && (
          <S.Badge>{chats.filter((c) => (c.messages?.length ?? 0) > 0).length}</S.Badge>
        )}
      </div>

      {open && (
        <S.Panel>
          {view === 'list' ? (
            <>
              <S.PanelHeader>
                <S.PanelTitle>
                  <MessageCircle size={20} />
                  Mensagens
                </S.PanelTitle>
                <S.HeaderButton type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                  <X size={20} />
                </S.HeaderButton>
              </S.PanelHeader>
              <S.ChatList>
                {loadingList ? (
                  <S.LoadingWrap>
                    <Loader2 size={20} className="spin" />
                    Carregando...
                  </S.LoadingWrap>
                ) : chats.length === 0 ? (
                  <S.EmptyList>Nenhuma conversa ainda.</S.EmptyList>
                ) : (
                  chats.map((chat) => {
                    const last = lastMessage(chat);
                    const updated = chat.updatedAt || (last?.createdAt ?? '');
                    return (
                      <S.ChatCard key={chat._id} type="button" onClick={() => handleOpenChat(chat)}>
                        <S.ChatCardTop>
                          <S.ChatCardName>{vendedorName(chat)}</S.ChatCardName>
                          <S.ChatCardTime>{updated ? formatTime(updated) : ''}</S.ChatCardTime>
                        </S.ChatCardTop>
                        <S.ChatCardProposal>Proposta {proposalNumber(chat)}</S.ChatCardProposal>
                        {last && (
                          <S.ChatCardPreview>
                            {last.text.length > 45 ? last.text.slice(0, 45) + '…' : last.text}
                          </S.ChatCardPreview>
                        )}
                      </S.ChatCard>
                    );
                  })
                )}
              </S.ChatList>
            </>
          ) : (
            <S.ThreadView>
              <S.ThreadHeader>
                <S.HeaderButton type="button" onClick={handleBack} aria-label="Voltar">
                  <ArrowLeft size={20} />
                </S.HeaderButton>
                <S.PanelTitle>
                  {selectedChat ? `${proposalNumber(selectedChat)} · ${vendedorName(selectedChat)}` : 'Chat'}
                </S.PanelTitle>
                <S.HeaderButton type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                  <X size={20} />
                </S.HeaderButton>
              </S.ThreadHeader>
              {loadingThread ? (
                <S.LoadingWrap>
                  <Loader2 size={20} className="spin" />
                  Carregando...
                </S.LoadingWrap>
              ) : selectedChat ? (
                <>
                  <S.ThreadMessages>
                    {(selectedChat.messages || []).length === 0 ? (
                      <S.EmptyList>Nenhuma mensagem ainda.</S.EmptyList>
                    ) : (
                      (selectedChat.messages || []).map((msg: ProposalChatMessage) => {
                        const sender = typeof msg.sender === 'object' && msg.sender !== null && '_id' in msg.sender ? msg.sender : null;
                        const senderId = sender && '_id' in sender ? String((sender as { _id: string })._id) : '';
                        const isMe = user?._id === senderId;
                        const senderName = sender && 'name' in sender ? (sender as { name: string }).name : 'Usuário';
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
                  </S.ThreadMessages>
                  <S.ThreadInputWrap>
                    <S.ThreadInput
                      placeholder="Mensagem para o vendedor..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      disabled={sending}
                      maxLength={2000}
                    />
                    <S.SendBtn type="button" onClick={handleSend} disabled={sending || !messageText.trim()}>
                      {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                    </S.SendBtn>
                  </S.ThreadInputWrap>
                </>
              ) : (
                <S.EmptyList>Chat não encontrado.</S.EmptyList>
              )}
            </S.ThreadView>
          )}
        </S.Panel>
      )}
    </S.WidgetWrap>
  );
};
