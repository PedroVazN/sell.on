import React, { useEffect, useState } from 'react';
import * as S from './styles';
import confetti from 'canvas-confetti';

interface ProposalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'win' | 'loss';
  proposalNumber?: string;
}

export const ProposalSuccessModal: React.FC<ProposalSuccessModalProps> = ({
  isOpen,
  onClose,
  type,
  proposalNumber
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && type === 'win') {
      // Confetti quando ganhar
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, type]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  const content = type === 'win' ? {
    icon: '🎉',
    title: 'Parabéns!',
    message: proposalNumber 
      ? `Proposta ${proposalNumber} criada com sucesso!`
      : 'Proposta criada com sucesso!',
    subtitle: 'Continue assim e alcance suas metas!',
    color: '#10b981',
    emoji: '✨'
  } : {
    icon: '💪',
    title: 'Não desanime!',
    message: 'Proposta marcada como perdida',
    subtitle: 'Cada não te aproxima de um sim. Continue tentando!',
    color: '#f59e0b',
    emoji: '🚀'
  };

  return (
    <S.Overlay $isClosing={isClosing} onClick={handleClose}>
      <S.Modal $isClosing={isClosing} $type={type} onClick={(e) => e.stopPropagation()}>
        <S.IconContainer $type={type}>
          <S.Icon>{content.icon}</S.Icon>
          <S.IconRing $type={type} />
          <S.IconRing $type={type} $delay={0.3} />
        </S.IconContainer>

        <S.Content>
          <S.Title>{content.title}</S.Title>
          <S.Message>{content.message}</S.Message>
          <S.Subtitle>{content.subtitle}</S.Subtitle>
        </S.Content>

        <S.Emoji>{content.emoji}</S.Emoji>

        <S.CloseButton onClick={handleClose}>
          Fechar
        </S.CloseButton>
      </S.Modal>
    </S.Overlay>
  );
};

