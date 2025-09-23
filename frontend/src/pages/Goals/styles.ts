import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${theme.colors.background.primary};
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: ${theme.colors.background.card};
  border-bottom: 1px solid ${theme.colors.border.primary};
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before {
    content: '🎯';
    font-size: 1.5rem;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.border.secondary};
  }
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid ${({ $active }) => $active ? theme.colors.primary : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.background.secondary};
  color: ${({ $active }) => $active ? 'white' : theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.background.tertiary};
    border-color: ${({ $active }) => $active ? theme.colors.primary : theme.colors.border.secondary};
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.secondary};
    border-radius: 4px;
    border: 1px solid ${theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
`;

export const FilterDropdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: 1rem;
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
  gap: 0.5rem;
  
  label {
    color: ${theme.colors.text.primary};
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  select {
    padding: 0.5rem;
    border: 2px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.sm};
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
    
    &:hover:not(:focus) {
      border-color: ${theme.colors.border.secondary};
    }
  }
`;

export const PeriodSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  background: ${theme.colors.background.card};
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.primary};
  width: fit-content;
`;

export const PeriodButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${({ $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.background.secondary};
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(20px);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }
`;

export const StatIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${theme.borderRadius.lg};
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  line-height: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  font-weight: 500;
`;

export const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

export const GoalCard = styled.div<{ $status: string }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(20px);
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $status }) => {
      switch ($status) {
        case 'active': return '#10b981';
        case 'completed': return '#059669';
        case 'paused': return '#f59e0b';
        case 'cancelled': return '#ef4444';
        default: return '#6b7280';
      }
    }};
    border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  }
`;

export const GoalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

export const GoalTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
`;

export const GoalType = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: ${({ $type }) => {
    switch ($type) {
      case 'daily': return '#dbeafe';
      case 'weekly': return '#d1fae5';
      case 'monthly': return '#fef3c7';
      case 'quarterly': return '#fce7f3';
      case 'yearly': return '#e0e7ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'daily': return '#1e40af';
      case 'weekly': return '#059669';
      case 'monthly': return '#d97706';
      case 'quarterly': return '#be185d';
      case 'yearly': return '#7c3aed';
      default: return '#374151';
    }
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
`;

export const GoalProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${theme.colors.background.secondary};
  border-radius: 4px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

export const ProgressValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  min-width: 3rem;
  text-align: right;
`;

export const GoalDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const GoalTarget = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
`;

export const GoalCurrent = styled.span`
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

export const GoalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

export const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2rem;
  height: 2rem;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.primary};
          
          &:hover {
            background: ${theme.colors.background.tertiary};
            border-color: ${theme.colors.border.secondary};
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
      default:
        return '';
    }
  }}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: ${theme.colors.background.card};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(20px);
`;

export const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.muted};
  margin-bottom: 1rem;
`;

export const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
`;

export const EmptyDescription = styled.p`
  margin: 0 0 2rem 0;
  color: ${theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  
  p {
    margin: 1rem 0 0 0;
    color: ${theme.colors.text.secondary};
    font-size: 1rem;
  }
`;

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  
  p {
    margin: 0 0 1rem 0;
    color: ${theme.colors.error};
    font-size: 1rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: ${theme.borderRadius.md};
    background: ${theme.colors.primary};
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  }
`;