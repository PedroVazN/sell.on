import React from 'react';
import styled from 'styled-components';
import { Toast } from '../Toast';
import { useToastContext } from '../../contexts/ToastContext';

const Wrapper = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(500px, calc(100vw - 2rem));
  pointer-events: none;
  & > * { pointer-events: auto; }
`;

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <Wrapper aria-live="polite">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </Wrapper>
  );
};
