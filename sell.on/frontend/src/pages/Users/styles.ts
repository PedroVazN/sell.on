import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  min-height: 100vh;
  background: #0f172a;
  padding: 24px;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 300px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(71, 85, 105, 0.5);
    transform: translateY(-1px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  &:focus-within {
    background: rgba(15, 23, 42, 0.95);
    border-color: #3b82f6;
    box-shadow: 
      0 0 0 3px rgba(59, 130, 246, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #e2e8f0;
  width: 100%;
  margin-left: 12px;
  font-weight: 500;

  &::placeholder {
    color: #94a3b8;
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  color: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(71, 85, 105, 0.5);
    transform: translateY(-1px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  padding: 8px 0;
  min-width: 200px;
  z-index: 100;
  margin-top: 8px;
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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

export const FilterOption = styled.div<{ $active: boolean }>`
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.2)' : 'transparent'};
  color: ${({ $active }) => $active ? '#60a5fa' : '#e2e8f0'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  position: relative;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
  }

  ${({ $active }) => $active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #3b82f6;
      border-radius: 0 2px 2px 0;
    }
  `}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(71, 85, 105, 0.5);

    &::before {
      opacity: 1;
    }
  }
`;

export const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

export const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

export const UserCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(71, 85, 105, 0.5);

    &::before {
      opacity: 1;
    }
  }
`;

export const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

export const UserName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export const UserEmail = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.4;
`;

export const UserRole = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 8px;
  padding: 6px 12px;
  background: ${({ $color }) => `${$color}20`};
  border: 1px solid ${({ $color }) => `${$color}40`};
  border-radius: 8px;
  width: fit-content;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const UserStatus = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #f8fafc;
  padding: 6px 12px;
  background: ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  border-radius: 8px;
  width: fit-content;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const UserActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  position: relative;
  z-index: 1;
`;

export const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ $variant }) => $variant === 'primary' ? '12px 20px' : '8px 12px'};
  border: none;
  border-radius: 8px;
  font-size: ${({ $variant }) => $variant === 'primary' ? '14px' : '12px'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: ${({ $variant }) => $variant === 'primary' ? 'auto' : '36px'};
  height: ${({ $variant }) => $variant === 'primary' ? 'auto' : '36px'};
  backdrop-filter: blur(10px);

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

          &:hover {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: rgba(15, 23, 42, 0.8);
          color: #e2e8f0;
          border: 1px solid rgba(71, 85, 105, 0.3);

          &:hover {
            background: rgba(15, 23, 42, 0.9);
            transform: scale(1.05);
            border-color: rgba(71, 85, 105, 0.5);
          }
        `;
      case 'danger':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #f8fafc;
          border: 1px solid rgba(239, 68, 68, 0.3);

          &:hover {
            background: rgba(239, 68, 68, 0.3);
            transform: scale(1.05);
            border-color: rgba(239, 68, 68, 0.4);
          }
        `;
    }
  }}

  &:active {
    transform: scale(0.95);
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  }
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
  position: relative;
  z-index: 1;
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
  text-align: center;
  position: relative;
  z-index: 1;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  }
`;

export const LoadingText = styled.p`
  margin: 16px 0 0 0;
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;
