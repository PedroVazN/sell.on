import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.secondary};
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

export const UrgentBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

export const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.md};
  background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.background.tertiary};
  color: ${({ $active }) => $active ? 'white' : theme.colors.text.muted};
  border: 1px solid ${({ $active }) => $active ? theme.colors.primary : theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : theme.colors.background.glassHover};
    border-color: ${({ $active }) => $active ? '#2563eb' : theme.colors.border.secondary};
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

export const NoticeCard = styled.div<{ 
  $priority: string; 
  $expired?: boolean; 
  $inactive?: boolean; 
}>`
  background: ${({ $expired, $inactive }) => 
    $expired ? theme.colors.background.tertiary : 
    $inactive ? '#374151' : 
    theme.colors.background.tertiary
  };
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${({ $priority }) => {
    switch ($priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return theme.colors.success;
      default: return '#6b7280';
    }
  }};
  border: 1px solid ${({ $expired, $inactive }) => 
    $expired ? theme.colors.border.secondary : 
    $inactive ? '#4b5563' : 
    theme.colors.border.secondary
  };
  transition: all ${theme.transitions.normal};
  opacity: ${({ $expired, $inactive }) => 
    $expired || $inactive ? 0.7 : 1
  };

  &:hover {
    border-color: ${theme.colors.border.secondary};
    transform: translateY(-1px);
    opacity: 1;
  }
`;

export const NoticeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const NoticeTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
  flex: 1;
`;

export const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 0.25rem 0.75rem;
  background: ${({ $priority }) => {
    switch ($priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }};
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
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

export const InfoItem = styled.div<{ $expired?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${({ $expired }) => $expired ? '#ef4444' : '#94a3b8'};
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

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.lg};
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border.secondary};
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${theme.shadows.large};
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  gap: ${theme.spacing.md};
`;

export const ModalTitle = styled.h2`
  color: ${theme.colors.text.secondary};
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

export const ModalImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: ${theme.colors.background.secondary};
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

export const ModalText = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.8;
  margin: 0 0 ${theme.spacing.lg} 0;
  white-space: pre-wrap;
  font-size: 1rem;
`;

export const ModalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.secondary};
`;

export const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.secondary};
  display: flex;
  justify-content: flex-end;

  button {
    background: ${theme.colors.primary};
    color: white;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border: none;
    border-radius: ${theme.borderRadius.sm};
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background ${theme.transitions.normal};

    &:hover {
      background: #1d4ed8;
    }
  }
`;
