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
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${({ $active }) => $active ? '#3b82f6' : '#334155'};
  color: ${({ $active }) => $active ? 'white' : '#cbd5e1'};
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#475569'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#475569'};
    border-color: ${({ $active }) => $active ? '#2563eb' : '#64748b'};
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
    $expired ? '#1f2937' : 
    $inactive ? '#374151' : 
    '#1e293b'
  };
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
  border: 1px solid ${({ $expired, $inactive }) => 
    $expired ? '#374151' : 
    $inactive ? '#4b5563' : 
    '#334155'
  };
  transition: all 0.2s;
  opacity: ${({ $expired, $inactive }) => 
    $expired || $inactive ? 0.7 : 1
  };

  &:hover {
    border-color: #475569;
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
