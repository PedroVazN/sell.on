import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
`;

export const ModalBox = styled.div`
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);

  .spin {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #374151;
`;

export const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f3f4f6;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: #fff;
    background: #374151;
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 280px;
`;

export const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #9ca3af;
  flex: 1;
`;

export const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 360px;
`;

export const EmptyMessages = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
`;

export const MessageBubble = styled.div<{ $isMe?: boolean }>`
  align-self: ${({ $isMe }) => ($isMe ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  background: ${({ $isMe }) => ($isMe ? '#3b82f6' : '#374151')};
  color: #fff;
`;

export const MessageMeta = styled.div`
  font-size: 0.7rem;
  opacity: 0.85;
  margin-bottom: 0.2rem;
`;

export const MessageText = styled.div`
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const InputWrap = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #374151;
`;

export const Input = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 0.6rem 0.9rem;
  border: 1px solid #4b5563;
  border-radius: 8px;
  background: #111827;
  color: #fff;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  &::placeholder {
    color: #6b7280;
  }
  &:focus {
    border-color: #3b82f6;
  }
`;

export const SendButton = styled.button`
  padding: 0.6rem 1rem;
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
