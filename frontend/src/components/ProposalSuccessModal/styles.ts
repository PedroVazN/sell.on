import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(100px) scale(0.8);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  to {
    transform: rotate(360deg) scale(2);
    opacity: 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

interface OverlayProps {
  $isClosing: boolean;
}

export const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease;
`;

interface ModalProps {
  $isClosing: boolean;
  $type: 'created' | 'win' | 'loss';
}

export const Modal = styled.div<ModalProps>`
  background: linear-gradient(135deg, 
    ${props => {
      if (props.$type === 'created') return 'rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%';
      if (props.$type === 'win') return 'rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%';
      return 'rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%';
    }}
  );
  backdrop-filter: blur(20px);
  border: 2px solid ${props => {
    if (props.$type === 'created') return 'rgba(59, 130, 246, 0.3)';
    if (props.$type === 'win') return 'rgba(16, 185, 129, 0.3)';
    return 'rgba(245, 158, 11, 0.3)';
  }};
  border-radius: 24px;
  padding: 3rem 2rem 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: ${props => props.$isClosing ? slideDown : slideUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.background.card};
    border-radius: 24px;
    z-index: -1;
  }
`;

interface IconContainerProps {
  $type: 'created' | 'win' | 'loss';
}

export const IconContainer = styled.div<IconContainerProps>`
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
  animation: ${bounce} 0.6s ease 0.2s;
`;

export const Icon = styled.div`
  font-size: 5rem;
  line-height: 1;
  position: relative;
  z-index: 2;
  animation: ${float} 2s ease-in-out infinite;
`;

interface IconRingProps {
  $type: 'created' | 'win' | 'loss';
  $delay?: number;
}

export const IconRing = styled.div<IconRingProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid ${props => {
    if (props.$type === 'created') return 'rgba(59, 130, 246, 0.5)';
    if (props.$type === 'win') return 'rgba(16, 185, 129, 0.5)';
    return 'rgba(245, 158, 11, 0.5)';
  }};
  border-radius: 50%;
  animation: ${rotate} 2s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  z-index: 1;
`;

export const Content = styled.div`
  margin-bottom: 2rem;
`;

export const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const Message = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 0.75rem 0;
  font-weight: 500;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
  line-height: 1.5;
`;

export const Emoji = styled.div`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  animation: ${float} 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
`;

export const CloseButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

