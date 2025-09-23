import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  text-decoration: none;
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        `;
      case 'lg':
        return css`
          padding: 1rem 2rem;
          font-size: 1.125rem;
        `;
      default:
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        `;
    }
  }}

  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: ${theme.colors.gradients.primary};
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          
          &:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
          }
        `;
      case 'secondary':
        return css`
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: ${theme.colors.text.primary};
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        `;
      case 'danger':
        return css`
          background: ${theme.colors.status.error};
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.secondary};
          border: 1px solid transparent;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.background.card};
            color: ${theme.colors.text.primary};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

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

  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

export const IconButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  ${({ variant = 'secondary' }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: ${theme.colors.gradients.button};
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          
          &:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.background.card};
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.background.cardHover};
            color: ${theme.colors.text.primary};
            transform: translateY(-2px) scale(1.05);
          }
        `;
      case 'danger':
        return css`
          background: rgba(239, 68, 68, 0.2);
          color: ${theme.colors.status.error};
          border: 1px solid rgba(239, 68, 68, 0.3);
          
          &:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.3);
            transform: translateY(-2px) scale(1.05);
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.muted};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.background.card};
            color: ${theme.colors.text.primary};
            transform: scale(1.05);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;
