import styled from 'styled-components';

export const Container = styled.div`
  padding: 2rem;
  background: #0f172a;
  min-height: 100vh;
  position: relative;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #1e293b;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #334155;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
`;

export const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #f8fafc;
  }
`;

export const Form = styled.form`
  padding: 1.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #f8fafc;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  option {
    background: #334155;
    color: #f8fafc;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #f8fafc;
  cursor: pointer;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #334155;
`;

export const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #475569;
  color: #f8fafc;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #64748b;
  }
`;

export const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #059669, #047857);
  }
`;

export const NoticesList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const NoticeCard = styled.div<{ $priority: string }>`
  background: #1e293b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border-left: 4px solid ${({ $priority }) => {
    switch ($priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }};
  border: 1px solid #334155;
  transition: all 0.2s;

  &:hover {
    border-color: #475569;
    transform: translateY(-1px);
  }
`;

export const NoticeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const NoticeTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
  flex: 1;
`;

export const NoticeActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem;
  background: ${({ $danger }) => $danger ? '#ef4444' : '#475569'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $danger }) => $danger ? '#dc2626' : '#64748b'};
  }
`;

export const NoticeImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #334155;
`;

export const NoticeContent = styled.p`
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NoticeFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const NoticeInfo = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
`;

export const NoticeStatus = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${({ $active }) => $active ? '#10b981' : '#ef4444'};
  font-weight: 500;
`;

export const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 1rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #94a3b8;

  h3 {
    color: #f8fafc;
    margin: 1rem 0 0.5rem 0;
  }

  p {
    margin: 0;
  }
`;

export const AccessDenied = styled.div`
  text-align: center;
  padding: 3rem;
  color: #94a3b8;

  h2 {
    color: #f8fafc;
    margin: 1rem 0 0.5rem 0;
  }

  p {
    margin: 0;
  }
`;
