import styled from 'styled-components';

export const WidgetWrap = styled.div`
  position: fixed;
  bottom: 10rem;
  right: 1.5rem;
  z-index: 1001;
  font-family: inherit;
`;

export const ToggleButton = styled.button<{ $hasUnread?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors?.primary || '#3b82f6'};
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary || '#3b82f6'};
    outline-offset: 2px;
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Panel = styled.div`
  position: absolute;
  bottom: calc(56px + 12px);
  right: 0;
  width: 380px;
  max-width: calc(100vw - 2rem);
  max-height: 520px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .spin {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: ${({ theme }) => theme.colors.background.secondary};
  flex-shrink: 0;
`;

export const PanelTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const HeaderButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

export const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
`;

export const ChatCard = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  text-align: left;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

export const ChatCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

export const ChatCardName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: #fff;
`;

export const ChatCardTime = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

export const ChatCardProposal = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  display: block;
  margin-bottom: 0.2rem;
`;

export const ChatCardPreview = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EmptyList = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const ThreadView = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const ThreadHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background: ${({ theme }) => theme.colors.background.secondary};
  flex-shrink: 0;
`;

export const ThreadMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 180px;
  max-height: 280px;
`;

export const MessageBubble = styled.div<{ $isMe?: boolean }>`
  align-self: ${({ $isMe }) => ($isMe ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: ${({ theme, $isMe }) =>
    $isMe ? theme.colors.primary : theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
`;

export const MessageMeta = styled.div`
  font-size: 0.65rem;
  opacity: 0.85;
  margin-bottom: 0.15rem;
`;

export const MessageText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ThreadInputWrap = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
  flex-shrink: 0;
`;

export const ThreadInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SendBtn = styled.button`
  padding: 0.5rem 0.75rem;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover:not(:disabled) {
    background: #059669;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.9rem;
`;
