import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const Box = styled.div`
  background: ${({ theme }) => theme.colors?.background?.secondary || '#1f2937'};
  border: 1px solid ${({ theme }) => theme.colors?.border?.primary || 'rgba(255,255,255,0.1)'};
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Title = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Message = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text?.muted || 'rgba(255,255,255,0.7)'};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
  ${({ $primary, $danger }) =>
    $danger
      ? `background: #dc2626; color: #fff;`
      : $primary
        ? `background: #3b82f6; color: #fff;`
        : `background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);`}
`;

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setPending({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    pending?.resolve(true);
    setPending(null);
  }, [pending]);

  const handleCancel = useCallback(() => {
    pending?.resolve(false);
    setPending(null);
  }, [pending]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <Overlay onClick={handleCancel}>
          <Box onClick={(e) => e.stopPropagation()}>
            <Title>
              <AlertTriangle size={22} color={pending.variant === 'danger' ? '#ef4444' : '#f59e0b'} />
              {pending.title}
            </Title>
            {pending.message && <Message>{pending.message}</Message>}
            <Actions>
              <Btn onClick={handleCancel} type="button">
                {pending.cancelLabel ?? 'Cancelar'}
              </Btn>
              <Btn
                $primary={pending.variant !== 'danger'}
                $danger={pending.variant === 'danger'}
                onClick={handleConfirm}
                type="button"
              >
                {pending.confirmLabel ?? 'Confirmar'}
              </Btn>
            </Actions>
          </Box>
        </Overlay>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};
