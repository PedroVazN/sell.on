import React from 'react';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styled from 'styled-components';
import { ProposalScore as ProposalScoreType } from '../../services/api';

interface ProposalScoreProps {
  score: ProposalScoreType | null;
  loading?: boolean;
  compact?: boolean;
}

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScoreValue = styled.div<{ level: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: ${props => {
    switch (props.level) {
      case 'alto': return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)';
      case 'medio': return 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)';
      case 'baixo': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)';
      case 'muito_baixo': return 'linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, rgba(153, 27, 27, 0.3) 100%)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.level) {
      case 'alto': return 'rgba(16, 185, 129, 0.5)';
      case 'medio': return 'rgba(251, 191, 36, 0.5)';
      case 'baixo': return 'rgba(239, 68, 68, 0.5)';
      case 'muito_baixo': return 'rgba(153, 27, 27, 0.5)';
      default: return 'rgba(107, 114, 128, 0.5)';
    }
  }};
`;

const ScorePercentage = styled.div<{ level: string }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => {
    switch (props.level) {
      case 'alto': return '#10b981';
      case 'medio': return '#fbbf24';
      case 'baixo': return '#ef4444';
      case 'muito_baixo': return '#991b1b';
      default: return '#6b7280';
    }
  }};
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const ScoreBar = styled.div<{ percentage: number; level: string }>`
  width: 100%;
  height: 8px;
  background: rgba(107, 114, 128, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: ${props => {
      switch (props.level) {
        case 'alto': return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        case 'medio': return 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)';
        case 'baixo': return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
        case 'muito_baixo': return 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 100%)';
        default: return '#6b7280';
      }
    }};
    transition: width 0.3s ease;
  }
`;

const ActionText = styled.div`
  font-size: 0.75rem;
  color: #d1d5db;
  font-style: italic;
  padding: 0.25rem 0.5rem;
  background: rgba(31, 41, 55, 0.5);
  border-radius: 0.25rem;
`;

const CompactScore = styled.div<{ level: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: ${props => {
    switch (props.level) {
      case 'alto': return 'rgba(16, 185, 129, 0.2)';
      case 'medio': return 'rgba(251, 191, 36, 0.2)';
      case 'baixo': return 'rgba(239, 68, 68, 0.2)';
      case 'muito_baixo': return 'rgba(127, 29, 29, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.level) {
      case 'alto': return 'rgba(16, 185, 129, 0.4)';
      case 'medio': return 'rgba(251, 191, 36, 0.4)';
      case 'baixo': return 'rgba(239, 68, 68, 0.4)';
      case 'muito_baixo': return 'rgba(153, 27, 27, 0.4)';
      default: return 'rgba(107, 114, 128, 0.4)';
    }
  }};
`;

const CompactPercentage = styled.span<{ level: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    switch (props.level) {
      case 'alto': return '#10b981';
      case 'medio': return '#fbbf24';
      case 'baixo': return '#ef4444';
      case 'muito_baixo': return '#dc2626';
      default: return '#9ca3af';
    }
  }};
`;

export const ProposalScore: React.FC<ProposalScoreProps> = ({ score, loading, compact }) => {
  if (loading) {
    return (
      <ScoreContainer>
        <ScoreValue level="medio">
          <Brain size={16} />
          <ScoreLabel>Calculando score...</ScoreLabel>
        </ScoreValue>
      </ScoreContainer>
    );
  }

  if (!score) {
    return (
      <ScoreContainer>
        <ScoreValue level="medio">
          <Minus size={16} />
          <ScoreLabel>Score não disponível</ScoreLabel>
        </ScoreValue>
      </ScoreContainer>
    );
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'alto': return 'Alta chance';
      case 'medio': return 'Média chance';
      case 'baixo': return 'Baixa chance';
      case 'muito_baixo': return 'Muito baixa';
      default: return 'Indefinido';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'alto': return <TrendingUp size={16} />;
      case 'baixo':
      case 'muito_baixo': return <TrendingDown size={16} />;
      default: return <Minus size={16} />;
    }
  };

  if (compact) {
    return (
      <CompactScore level={score.level}>
        {getLevelIcon(score.level)}
        <CompactPercentage level={score.level}>
          {score.percentual}%
        </CompactPercentage>
      </CompactScore>
    );
  }

  return (
    <ScoreContainer>
      <ScoreHeader>
        <Brain size={18} color="#6366f1" />
        <ScoreValue level={score.level}>
          {getLevelIcon(score.level)}
          <ScorePercentage level={score.level}>
            {score.percentual}%
          </ScorePercentage>
          <ScoreLabel>
            {getLevelLabel(score.level)} de fechar
          </ScoreLabel>
        </ScoreValue>
      </ScoreHeader>
      
      <ScoreBar percentage={score.percentual} level={score.level} />
      
      {score.action && (
        <ActionText>
          🤖 {score.action}
        </ActionText>
      )}
    </ScoreContainer>
  );
};

