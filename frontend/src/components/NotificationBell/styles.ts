import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  position: relative;
  display: inline-block;
`;

export const BellButton = styled.button<{ $hasUnread: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: ${({ $hasUnread }) => 
    $hasUnread 
      ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' 
      : 'linear-gradient(135deg, #667eea, #764ba2)'
  };
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export const Badge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(255, 71, 87, 0.5);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
    }
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  width: 420px;
  max-height: 520px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 480px) {
    width: 340px;
    right: -60px;
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
    backdrop-filter: blur(10px);
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const NotificationsList = styled.div`
  max-height: 420px;
  overflow-y: auto;
  padding: 8px 0;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
  }
`;

export const NotificationItem = styled.div<{ 
  $isRead: boolean; 
  $priority: 'low' | 'medium' | 'high' | 'urgent' 
}>`
  display: flex;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: ${({ $isRead }) => $isRead ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 0 12px;
  border-radius: 16px;
  margin-bottom: 8px;

  &:hover {
    background: rgba(240, 244, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: ${({ $priority }) => {
      switch ($priority) {
        case 'urgent': return 'linear-gradient(135deg, #ef4444, #dc2626)';
        case 'high': return 'linear-gradient(135deg, #f97316, #ea580c)';
        case 'medium': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        case 'low': return 'linear-gradient(135deg, #6b7280, #4b5563)';
        default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
      }
    }};
    border-radius: 0 3px 3px 0;
  }

  ${({ $isRead }) => !$isRead && `
    &::after {
      content: '';
      position: absolute;
      top: 24px;
      right: 24px;
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
  `}
`;

export const NotificationIcon = styled.div`
  font-size: 28px;
  margin-right: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

export const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NotificationTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  letter-spacing: -0.3px;
`;

export const NotificationMessage = styled.p`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const NotificationTime = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

export const NotificationActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 12px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #64748b;
`;

export const LoadingText = styled.p`
  margin: 16px 0 0 0;
  font-size: 14px;
  font-weight: 500;
`;

export const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #ef4444;
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #64748b;
`;

export const EmptyText = styled.p`
  margin: 16px 0 0 0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;
