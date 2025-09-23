import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { apiService, Event, Client, Distributor } from '../../services/api';
import * as S from './styles';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  event?: Event | null;
  selectedDate?: Date | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event = null,
  selectedDate = null
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate || (selectedDate ? selectedDate.toISOString().split('T')[0] : ''),
    endDate: event?.endDate || (selectedDate ? selectedDate.toISOString().split('T')[0] : ''),
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    type: event?.type || 'meeting' as Event['type'],
    priority: event?.priority || 'medium' as Event['priority'],
    status: event?.status || 'scheduled' as Event['status'],
    client: event?.client?._id || '',
    distributor: event?.distributor?._id || '',
    location: event?.location || '',
    notes: event?.notes || '',
    reminder: {
      enabled: event?.reminder?.enabled || false,
      minutes: event?.reminder?.minutes || 15
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadDistributors();
      
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          type: event.type,
          priority: event.priority,
          status: event.status,
          client: event.client?._id || '',
          distributor: event.distributor?._id || '',
          location: event.location || '',
          notes: event.notes || '',
          reminder: {
            enabled: event.reminder?.enabled || false,
            minutes: event.reminder?.minutes || 15
          }
        });
      } else if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          startDate: selectedDate.toISOString().split('T')[0],
          endDate: selectedDate.toISOString().split('T')[0]
        }));
      }
      
      setErrors({});
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, event, selectedDate]);

  const loadClients = async () => {
    try {
      const response = await apiService.getClients(1, 100);
      setClients(response.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await apiService.getDistributors(1, 100);
      setDistributors(response.data);
    } catch (err) {
      console.error('Erro ao carregar distribuidores:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('reminder.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        reminder: {
          ...prev.reminder,
          [field]: field === 'enabled' ? (e.target as HTMLInputElement).checked : parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    if (formData.startTime && formData.endTime && formData.startDate === formData.endDate) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Horário de fim deve ser posterior ao horário de início';
      }
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
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        client: formData.client ? {
          _id: formData.client,
          name: clients.find(c => c._id === formData.client)?.razaoSocial || '',
          email: clients.find(c => c._id === formData.client)?.contato.email || '',
          phone: clients.find(c => c._id === formData.client)?.contato.telefone || ''
        } : undefined,
        distributor: formData.distributor ? {
          _id: formData.distributor,
          apelido: distributors.find(d => d._id === formData.distributor)?.apelido || '',
          razaoSocial: distributors.find(d => d._id === formData.distributor)?.razaoSocial || ''
        } : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        reminder: formData.reminder.enabled ? {
          enabled: true,
          minutes: formData.reminder.minutes
        } : undefined
      };

      if (event) {
        await apiService.updateEvent(event._id, eventData);
        setSuccess('Evento atualizado com sucesso!');
      } else {
        await apiService.createEvent(eventData);
        setSuccess('Evento criado com sucesso!');
      }
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>
            {event ? 'Editar Evento' : 'Novo Evento'}
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
                    placeholder="Título do evento"
                    $hasError={!!errors.title}
                    required
                  />
                  {errors.title && <S.ErrorMessage>{errors.title}</S.ErrorMessage>}
                </div>
                <div>
                  <S.Label htmlFor="type">Tipo *</S.Label>
                  <S.Select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="meeting">Reunião</option>
                    <option value="call">Ligação</option>
                    <option value="visit">Visita</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="proposal">Proposta</option>
                    <option value="sale">Venda</option>
                    <option value="other">Outro</option>
                  </S.Select>
                </div>
              </S.FormRow>
              
              <S.FormRow>
                <div>
                  <S.Label htmlFor="priority">Prioridade *</S.Label>
                  <S.Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </S.Select>
                </div>
                <div>
                  <S.Label htmlFor="status">Status *</S.Label>
                  <S.Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
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
                  placeholder="Descrição do evento..."
                  rows={3}
                />
              </S.FormGroup>
            </S.FormGroup>

            {/* Data e Horário */}
            <S.FormGroup>
              <h3>Data e Horário</h3>
              <S.FormRow>
                <div>
                  <S.Label htmlFor="startDate">Data de Início *</S.Label>
                  <S.Input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    $hasError={!!errors.startDate}
                    required
                  />
                  {errors.startDate && <S.ErrorMessage>{errors.startDate}</S.ErrorMessage>}
                </div>
                <div>
                  <S.Label htmlFor="endDate">Data de Fim *</S.Label>
                  <S.Input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    $hasError={!!errors.endDate}
                    required
                  />
                  {errors.endDate && <S.ErrorMessage>{errors.endDate}</S.ErrorMessage>}
                </div>
              </S.FormRow>
              
              <S.FormRow>
                <div>
                  <S.Label htmlFor="startTime">Horário de Início</S.Label>
                  <S.Input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <S.Label htmlFor="endTime">Horário de Fim</S.Label>
                  <S.Input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    $hasError={!!errors.endTime}
                  />
                  {errors.endTime && <S.ErrorMessage>{errors.endTime}</S.ErrorMessage>}
                </div>
              </S.FormRow>
            </S.FormGroup>

            {/* Cliente e Distribuidor */}
            <S.FormGroup>
              <h3>Cliente e Distribuidor</h3>
              <S.FormRow>
                <div>
                  <S.Label htmlFor="client">Cliente</S.Label>
                  <S.ClientSelector
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.razaoSocial}
                      </option>
                    ))}
                  </S.ClientSelector>
                </div>
                <div>
                  <S.Label htmlFor="distributor">Distribuidor</S.Label>
                  <S.DistributorSelector
                    id="distributor"
                    name="distributor"
                    value={formData.distributor}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione um distribuidor</option>
                    {distributors.map(distributor => (
                      <option key={distributor._id} value={distributor._id}>
                        {distributor.apelido || distributor.razaoSocial}
                      </option>
                    ))}
                  </S.DistributorSelector>
                </div>
              </S.FormRow>
            </S.FormGroup>

            {/* Localização e Observações */}
            <S.FormGroup>
              <h3>Localização e Observações</h3>
              <S.FormRow>
                <div>
                  <S.Label htmlFor="location">Local</S.Label>
                  <S.Input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Local do evento"
                  />
                </div>
              </S.FormRow>
              
              <S.FormGroup>
                <S.Label htmlFor="notes">Observações</S.Label>
                <S.TextArea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais..."
                  rows={4}
                />
              </S.FormGroup>
            </S.FormGroup>

            {/* Lembrete */}
            <S.FormGroup>
              <h3>Lembrete</h3>
              <S.ReminderSettings>
                <S.CheckboxContainer>
                  <input
                    type="checkbox"
                    id="reminder.enabled"
                    name="reminder.enabled"
                    checked={formData.reminder.enabled}
                    onChange={handleInputChange}
                  />
                  <S.Label htmlFor="reminder.enabled">Ativar lembrete</S.Label>
                </S.CheckboxContainer>
                
                {formData.reminder.enabled && (
                  <S.FormRow>
                    <div>
                      <S.Label htmlFor="reminder.minutes">Lembrar com antecedência (minutos)</S.Label>
                      <S.Select
                        id="reminder.minutes"
                        name="reminder.minutes"
                        value={formData.reminder.minutes}
                        onChange={handleInputChange}
                      >
                        <option value={5}>5 minutos</option>
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                        <option value={1440}>1 dia</option>
                      </S.Select>
                    </div>
                  </S.FormRow>
                )}
              </S.ReminderSettings>
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
                    {event ? 'Atualizar' : 'Criar'} Evento
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

export default EventModal;
