import React, { useEffect, useState } from 'react';
import * as S from './styles';
import confetti from 'canvas-confetti';

interface ProposalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'created' | 'win' | 'loss';
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
      // Confetti INTENSO quando FECHAR VENDA - muito mais celebração!
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 40, spread: 360, ticks: 80, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 80 * (timeLeft / duration);

        // Mais confetti de vários lugares!
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
        });
        confetti({
          ...defaults,
          particleCount: particleCount / 2,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#fbbf24', '#34d399', '#60a5fa']
        });
      }, 200);

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

  const getContent = () => {
    if (type === 'created') {
      return {
        icon: '📝',
        title: 'Proposta Criada!',
        message: proposalNumber 
          ? `Proposta ${proposalNumber} criada com sucesso!`
          : 'Proposta criada com sucesso!',
        subtitle: 'Agora é só aguardar a resposta do cliente!',
        color: '#3b82f6',
        emoji: '✅'
      };
    }
    
    if (type === 'win') {
      return {
        icon: '🎉',
        title: 'Venda Fechada!',
        message: proposalNumber 
          ? `Proposta ${proposalNumber} fechada com sucesso!`
          : 'Venda fechada com sucesso!',
        subtitle: 'Excelente trabalho! Continue assim e bata suas metas!',
        color: '#10b981',
        emoji: '🏆'
      };
    }
    
    return {
      icon: '💪',
      title: 'Não desanime!',
      message: 'Proposta marcada como perdida',
      subtitle: 'Cada não te aproxima de um sim. Continue tentando!',
      color: '#f59e0b',
      emoji: '🚀'
    };
  };
  
  const content = getContent();

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

