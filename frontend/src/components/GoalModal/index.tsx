import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Target, Calendar, DollarSign, Users, Phone, MapPin, FileText, Award } from 'lucide-react';
import { apiService, Goal, User, CreateGoalData, UpdateGoalData } from '../../services/api';
import * as S from './styles';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  goal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal = null
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'monthly' as Goal['type'],
    category: goal?.category || 'sales' as Goal['category'],
    targetValue: goal?.targetValue || 0,
    unit: goal?.unit || 'quantity' as Goal['unit'],
    priority: goal?.priority || 'medium' as Goal['priority'],
    assignedTo: goal?.assignedTo || '',
    period: {
      startDate: goal?.period?.startDate || new Date().toISOString().split('T')[0],
      endDate: goal?.period?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    tags: goal?.tags || [],
    isRecurring: goal?.isRecurring || false,
    rewards: {
      enabled: goal?.rewards?.enabled || false,
      description: goal?.rewards?.description || '',
      points: goal?.rewards?.points || 0
    },
    notifications: {
      enabled: goal?.notifications?.enabled || true,
      frequency: goal?.notifications?.frequency || 'daily' as 'daily' | 'weekly' | 'monthly',
      threshold: goal?.notifications?.threshold || 80
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      
      if (goal) {
        setFormData({
          title: goal.title,
          description: goal.description || '',
          type: goal.type,
          category: goal.category,
          targetValue: goal.targetValue,
          unit: goal.unit,
          priority: goal.priority,
          assignedTo: goal.assignedTo,
          period: {
            startDate: goal.period.startDate,
            endDate: goal.period.endDate
          },
          tags: goal.tags || [],
          isRecurring: goal.isRecurring,
          rewards: {
            enabled: goal.rewards?.enabled || false,
            description: goal.rewards?.description || '',
            points: goal.rewards?.points || 0
          },
          notifications: {
            enabled: goal.notifications?.enabled || true,
            frequency: goal.notifications?.frequency || 'daily',
            threshold: goal.notifications?.threshold || 80
          }
        });
      }
      
      setErrors({});
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, goal]);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers(1, 100);
      setUsers(response.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('period.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        period: {
          ...prev.period,
          [field]: value
        }
      }));
    } else if (name.startsWith('rewards.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rewards: {
          ...prev.rewards,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                   field === 'points' ? parseInt(value) || 0 : value
        }
      }));
    } else if (name.startsWith('notifications.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                   field === 'threshold' ? parseInt(value) || 80 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                name === 'targetValue' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = 'Valor da meta deve ser maior que zero';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Usuário responsável é obrigatório';
    }

    if (!formData.period.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.period.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (formData.period.startDate && formData.period.endDate && 
        new Date(formData.period.startDate) >= new Date(formData.period.endDate)) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let selectedUser = null;
      
      if (formData.assignedTo === 'all') {
        // Para "Todos os usuários", vamos criar uma meta para cada vendedor
        const vendedores = users.filter(u => u.role === 'vendedor');
        
        if (vendedores.length === 0) {
          setError('Nenhum vendedor encontrado para atribuir a meta');
          setLoading(false);
          return;
        }
        
        // Criar meta para cada vendedor
        const promises = vendedores.map(vendedor => {
          const goalData = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            category: formData.category,
            targetValue: formData.targetValue,
            currentValue: goal?.currentValue || 0,
            unit: formData.unit,
            priority: formData.priority,
            status: goal?.status || 'active' as Goal['status'],
            assignedTo: vendedor._id,
            period: {
              ...formData.period,
              year: new Date(formData.period.startDate).getFullYear(),
              month: new Date(formData.period.startDate).getMonth() + 1,
              week: Math.ceil((new Date(formData.period.startDate).getTime() - new Date(new Date(formData.period.startDate).getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
              day: new Date(formData.period.startDate).getDate()
            },
            tags: formData.tags,
            isRecurring: formData.isRecurring,
            rewards: formData.rewards,
            notifications: formData.notifications
          };
          
          return goal ? apiService.updateGoal(goal._id, goalData) : apiService.createGoal(goalData);
        });
        
        const responses = await Promise.all(promises);
        const failedResponses = responses.filter(r => !r.success);
        
        if (failedResponses.length > 0) {
          setError(`Erro ao criar metas para ${failedResponses.length} vendedores`);
          setLoading(false);
          return;
        }
        
        setSuccess(`Meta criada com sucesso para ${vendedores.length} vendedores!`);
        onSave();
        setLoading(false);
        return;
      } else {
        selectedUser = users.find(u => u._id === formData.assignedTo);
        
        if (!selectedUser) {
          setError('Usuário selecionado não encontrado');
          setLoading(false);
          return;
        }
      }
      
      const baseGoalData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        category: formData.category,
        targetValue: formData.targetValue,
        currentValue: goal?.currentValue || 0,
        unit: formData.unit,
        priority: formData.priority,
        status: goal?.status || 'active' as Goal['status'],
        assignedTo: selectedUser._id,
        period: {
          ...formData.period,
          year: new Date(formData.period.startDate).getFullYear(),
          month: new Date(formData.period.startDate).getMonth() + 1,
          week: Math.ceil((new Date(formData.period.startDate).getTime() - new Date(new Date(formData.period.startDate).getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
          day: new Date(formData.period.startDate).getDate()
        },
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isRecurring: formData.isRecurring,
        rewards: formData.rewards.enabled ? {
          enabled: true,
          description: formData.rewards.description || undefined,
          points: formData.rewards.points
        } : undefined,
        notifications: formData.notifications.enabled ? {
          enabled: true,
          frequency: formData.notifications.frequency,
          threshold: formData.notifications.threshold
        } : undefined
      };

      if (goal) {
        await apiService.updateGoal(goal._id, baseGoalData as UpdateGoalData);
        setSuccess('Meta atualizada com sucesso!');
      } else {
        await apiService.createGoal(baseGoalData as CreateGoalData);
        setSuccess('Meta criada com sucesso!');
      }
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar meta');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'sales': return <Target size={16} />;
      case 'revenue': return <DollarSign size={16} />;
      case 'clients': return <Users size={16} />;
      case 'proposals': return <FileText size={16} />;
      case 'calls': return <Phone size={16} />;
      case 'visits': return <MapPin size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'daily': return <Calendar size={16} />;
      case 'weekly': return <Calendar size={16} />;
      case 'monthly': return <Calendar size={16} />;
      case 'quarterly': return <Calendar size={16} />;
      case 'yearly': return <Calendar size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <X size={20} />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.Form onSubmit={handleSubmit}>
            {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
            {success && <S.SuccessMessage>{success}</S.SuccessMessage>}

            {/* Informações Básicas */}
            <S.FormGroup>
              <h3>Informações Básicas</h3>
              <S.FormRow>
                <div>
                  <S.Label htmlFor="title">Título *</S.Label>
                  <S.Input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Título da meta"
                    $hasError={!!errors.title}
                    required
                  />
                  {errors.title && <S.ErrorMessage>{errors.title}</S.ErrorMessage>}
                </div>
                <div>
                  <S.Label htmlFor="assignedTo">Responsável *</S.Label>
                  <S.Select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    $hasError={!!errors.assignedTo}
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    <option value="all">Todos os usuários</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </S.Select>
                  {errors.assignedTo && <S.ErrorMessage>{errors.assignedTo}</S.ErrorMessage>}
                </div>
              </S.FormRow>
              
              <S.FormRow>
                <div>
                  <S.Label htmlFor="type">Tipo *</S.Label>
                  <S.Select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                  </S.Select>
                </div>
                <div>
                  <S.Label htmlFor="category">Categoria *</S.Label>
                  <S.Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="sales">Vendas</option>
                    <option value="revenue">Receita</option>
                    <option value="clients">Clientes</option>
                    <option value="proposals">Propostas</option>
                    <option value="calls">Ligações</option>
                    <option value="visits">Visitas</option>
                    <option value="custom">Personalizada</option>
                  </S.Select>
                </div>
              </S.FormRow>

              <S.FormGroup>
                <S.Label htmlFor="description">Descrição</S.Label>
                <S.TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição da meta..."
                  rows={3}
                />
              </S.FormGroup>
            </S.FormGroup>

            {/* Meta e Período */}
            <S.FormGroup>
              <h3>Meta e Período</h3>
              <S.FormRow>
                <div>
                  <S.Label htmlFor="targetValue">Valor da Meta *</S.Label>
                  <S.Input
                    id="targetValue"
                    type="number"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    $hasError={!!errors.targetValue}
                    required
                  />
                  {errors.targetValue && <S.ErrorMessage>{errors.targetValue}</S.ErrorMessage>}
                </div>
                <div>
                  <S.Label htmlFor="unit">Unidade *</S.Label>
                  <S.Select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="quantity">Quantidade</option>
                    <option value="currency">Moeda (R$)</option>
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="hours">Horas</option>
                    <option value="calls">Ligações</option>
                    <option value="visits">Visitas</option>
                  </S.Select>
                </div>
              </S.FormRow>
              
              <S.FormRow>
                <div>
                  <S.Label htmlFor="period.startDate">Data de Início *</S.Label>
                  <S.Input
                    id="period.startDate"
                    type="date"
                    name="period.startDate"
                    value={formData.period.startDate}
                    onChange={handleInputChange}
                    $hasError={!!errors.startDate}
                    required
                  />
                  {errors.startDate && <S.ErrorMessage>{errors.startDate}</S.ErrorMessage>}
                </div>
                <div>
                  <S.Label htmlFor="period.endDate">Data de Fim *</S.Label>
                  <S.Input
                    id="period.endDate"
                    type="date"
                    name="period.endDate"
                    value={formData.period.endDate}
                    onChange={handleInputChange}
                    $hasError={!!errors.endDate}
                    required
                  />
                  {errors.endDate && <S.ErrorMessage>{errors.endDate}</S.ErrorMessage>}
                </div>
              </S.FormRow>

              <S.FormRow>
                <div>
                  <S.Label htmlFor="priority">Prioridade</S.Label>
                  <S.Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </S.Select>
                </div>
                <div>
                  <S.CheckboxContainer>
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                    />
                    <S.Label htmlFor="isRecurring">Meta recorrente</S.Label>
                  </S.CheckboxContainer>
                </div>
              </S.FormRow>
            </S.FormGroup>

            {/* Tags */}
            <S.FormGroup>
              <h3>Tags</h3>
              <S.TagContainer>
                <S.TagInput>
                  <S.Input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <S.TagButton type="button" onClick={handleAddTag}>
                    Adicionar
                  </S.TagButton>
                </S.TagInput>
                {formData.tags.length > 0 && (
                  <S.TagList>
                    {formData.tags.map((tag, index) => (
                      <S.TagItem key={index}>
                        {tag}
                        <S.TagRemove onClick={() => handleRemoveTag(tag)}>
                          ×
                        </S.TagRemove>
                      </S.TagItem>
                    ))}
                  </S.TagList>
                )}
              </S.TagContainer>
            </S.FormGroup>

            {/* Recompensas */}
            <S.FormGroup>
              <h3>Recompensas</h3>
              <S.RewardSettings>
                <S.CheckboxContainer>
                  <input
                    type="checkbox"
                    id="rewards.enabled"
                    name="rewards.enabled"
                    checked={formData.rewards.enabled}
                    onChange={handleInputChange}
                  />
                  <S.Label htmlFor="rewards.enabled">Ativar recompensas</S.Label>
                </S.CheckboxContainer>
                
                {formData.rewards.enabled && (
                  <S.FormRow>
                    <div>
                      <S.Label htmlFor="rewards.description">Descrição da recompensa</S.Label>
                      <S.Input
                        id="rewards.description"
                        type="text"
                        name="rewards.description"
                        value={formData.rewards.description}
                        onChange={handleInputChange}
                        placeholder="Ex: Bônus de R$ 500"
                      />
                    </div>
                    <div>
                      <S.Label htmlFor="rewards.points">Pontos</S.Label>
                      <S.Input
                        id="rewards.points"
                        type="number"
                        name="rewards.points"
                        value={formData.rewards.points}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </S.FormRow>
                )}
              </S.RewardSettings>
            </S.FormGroup>

            {/* Notificações */}
            <S.FormGroup>
              <h3>Notificações</h3>
              <S.NotificationSettings>
                <S.CheckboxContainer>
                  <input
                    type="checkbox"
                    id="notifications.enabled"
                    name="notifications.enabled"
                    checked={formData.notifications.enabled}
                    onChange={handleInputChange}
                  />
                  <S.Label htmlFor="notifications.enabled">Ativar notificações</S.Label>
                </S.CheckboxContainer>
                
                {formData.notifications.enabled && (
                  <S.FormRow>
                    <div>
                      <S.Label htmlFor="notifications.frequency">Frequência</S.Label>
                      <S.Select
                        id="notifications.frequency"
                        name="notifications.frequency"
                        value={formData.notifications.frequency}
                        onChange={handleInputChange}
                      >
                        <option value="daily">Diária</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </S.Select>
                    </div>
                    <div>
                      <S.Label htmlFor="notifications.threshold">Limiar de alerta (%)</S.Label>
                      <S.Input
                        id="notifications.threshold"
                        type="number"
                        name="notifications.threshold"
                        value={formData.notifications.threshold}
                        onChange={handleInputChange}
                        placeholder="80"
                        min="0"
                        max="100"
                      />
                    </div>
                  </S.FormRow>
                )}
              </S.NotificationSettings>
            </S.FormGroup>

            <S.ModalFooter>
              <S.Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </S.Button>
              <S.Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {goal ? 'Atualizar' : 'Criar'} Meta
                  </>
                )}
              </S.Button>
            </S.ModalFooter>
          </S.Form>
        </S.ModalBody>
      </S.ModalContainer>
    </S.ModalOverlay>
  );
};

export default GoalModal;
