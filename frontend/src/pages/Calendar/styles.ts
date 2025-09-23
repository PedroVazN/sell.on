import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.gradients.background};
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.8s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.01) 50%, transparent 70%),
      linear-gradient(-45deg, transparent 30%, rgba(59, 130, 246, 0.02) 50%, transparent 70%);
    pointer-events: none;
    animation: shimmer 15s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(0.5deg); }
    66% { transform: translateY(5px) rotate(-0.5deg); }
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  z-index: 1;
  animation: slideIn 0.8s ease-out 0.2s both;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 120px;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  animation: fadeInUp 0.8s ease-out 0.4s both;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  min-width: 350px;
  backdrop-filter: blur(20px);
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
  
  svg {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-right: ${({ theme }) => theme.spacing.sm};
    transition: color ${({ theme }) => theme.transitions.normal};
  }
  
  &:hover svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  flex: 1;
  font-weight: 500;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: 400;
  }
  
  &:focus {
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.7s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.border.secondary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.gradients.button};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation: fadeInUp 0.8s ease-out 0.6s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glow};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

export const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: blur(30px);
  position: relative;
  z-index: 1;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation: fadeInUp 0.8s ease-out 0.8s both;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.gradients.glass};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
  }
`;

export const FilterDropdown = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FilterOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 150px;
  
  label {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  select {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.875rem;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:hover {
      border-color: ${({ theme }) => theme.colors.border.secondary};
    }
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const ViewButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  
  ${({ $active, theme }) => $active ? `
    background: ${theme.colors.primary};
    color: white;
    box-shadow: ${theme.shadows.small};
  ` : `
    background: transparent;
    color: ${theme.colors.text.secondary};
    
    &:hover {
      background: ${theme.colors.background.glassHover};
      color: ${theme.colors.text.primary};
    }
  `}
`;

export const CalendarContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const CalendarNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  
  button {
    background: ${({ theme }) => theme.colors.background.glass};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};
    
    &:hover {
      background: ${({ theme }) => theme.colors.background.glassHover};
      border-color: ${({ theme }) => theme.colors.border.secondary};
      transform: translateY(-1px);
    }
  }
`;

export const CalendarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

export const CalendarDay = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean }>`
  background: ${({ theme }) => theme.colors.background.glass};
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  
  ${({ $isCurrentMonth, theme }) => !$isCurrentMonth && `
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.tertiary};
  `}
  
  ${({ $isToday, theme }) => $isToday && `
    background: ${theme.colors.primary}20;
    border: 2px solid ${theme.colors.primary};
  `}
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.glassHover};
    transform: scale(1.02);
    z-index: 1;
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  span:first-child {
    font-weight: 600;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const CalendarEvent = styled.div<{ $type: string; $priority: string }>`
  background: ${({ $type }) => {
    const colors = {
      meeting: '#3B82F6',
      call: '#10B981',
      visit: '#F59E0B',
      follow_up: '#8B5CF6',
      proposal: '#EF4444',
      sale: '#06B6D4',
      other: '#6B7280'
    };
    return colors[$type as keyof typeof colors] || '#6B7280';
  }};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

export const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const EventItem = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(20px);
  transition: all ${({ theme }) => theme.transitions.normal};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }
`;

export const EventTime = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

export const EventTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

export const EventType = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

export const EventActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.glassHover};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px) scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
  
  &:last-child:hover {
    color: ${({ theme }) => theme.colors.error};
  }
  
  &:active {
    transform: translateY(0) scale(1.05);
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  svg {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: 1.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    font-size: 1rem;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    animation: spin 1s linear infinite;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    font-size: 1rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  
  p {
    color: ${({ theme }) => theme.colors.error};
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    font-size: 1rem;
  }
  
  button {
    background: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.inverse};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => theme.colors.success};
      transform: translateY(-2px);
    }
  }
`;

// Tipos para compatibilidade
export const EventTypeFilter = styled.div``;
export const PriorityFilter = styled.div``;
export const StatusFilter = styled.div``;
