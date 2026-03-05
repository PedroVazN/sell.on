import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Target, TrendingUp } from 'lucide-react';
import { Goal } from '../../services/api';
import * as S from './styles';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: number, description: string) => void;
  goal: Goal | null;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal
}) => {
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal && isOpen) {
      setValue(goal.currentValue);
      setDescription('');
      setError(null);
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal) return;

    if (value < 0) {
      setError('O valor não pode ser negativo');
      return;
    }

    if (value > goal.targetValue * 1.2) {
      setError('O valor não pode ser mais de 120% da meta');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(value, description);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar progresso');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = () => {
    if (!goal) return 0;
    return Math.round((value / goal.targetValue) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 80) return '#f59e0b';
    if (percentage >= 50) return '#3b82f6';
    return '#6b7280';
  };

  if (!isOpen || !goal) return null;

  const percentage = calculatePercentage();
  const progressColor = getProgressColor(percentage);

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.Title>
            <Target size={24} />
            Atualizar Progresso da Meta
          </S.Title>
          <S.CloseButton onClick={onClose}>
            <X size={20} />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalContent>
          <S.GoalInfo>
            <S.GoalTitle>{goal.title}</S.GoalTitle>
            <S.GoalDetails>
              <S.GoalDetail>
                <strong>Meta:</strong> {goal.targetValue.toLocaleString()} {goal.unit}
              </S.GoalDetail>
              <S.GoalDetail>
                <strong>Atual:</strong> {goal.currentValue.toLocaleString()} {goal.unit}
              </S.GoalDetail>
              <S.GoalDetail>
                <strong>Progresso:</strong> {goal.progress.percentage}%
              </S.GoalDetail>
            </S.GoalDetails>
          </S.GoalInfo>

          <S.ProgressPreview>
            <S.ProgressLabel>Novo Progresso</S.ProgressLabel>
            <S.ProgressBar>
              <S.ProgressFill 
                $percentage={Math.min(percentage, 100)} 
                $color={progressColor}
              />
            </S.ProgressBar>
            <S.ProgressText $color={progressColor}>
              {percentage}% ({value.toLocaleString()} {goal.unit})
            </S.ProgressText>
          </S.ProgressPreview>

          <form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label>
                <TrendingUp size={16} />
                Novo Valor
              </S.Label>
              <S.Input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                min="0"
                max={goal.targetValue * 1.2}
                step="0.01"
                placeholder="Digite o novo valor"
                required
              />
              <S.HelpText>
                Meta: {goal.targetValue.toLocaleString()} {goal.unit} | 
                Máximo: {(goal.targetValue * 1.2).toLocaleString()} {goal.unit}
              </S.HelpText>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Descrição (opcional)</S.Label>
              <S.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que foi realizado..."
                rows={3}
              />
            </S.FormGroup>

            {error && (
              <S.ErrorMessage>
                {error}
              </S.ErrorMessage>
            )}

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose}>
                Cancelar
              </S.CancelButton>
              <S.SaveButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Atualizar Progresso
                  </>
                )}
              </S.SaveButton>
            </S.ButtonGroup>
          </form>
        </S.ModalContent>
      </S.ModalContainer>
    </S.ModalOverlay>
  );
};

export default ProgressModal;
