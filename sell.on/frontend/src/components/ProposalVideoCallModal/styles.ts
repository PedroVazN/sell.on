import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1150;
  padding: 1rem;
`;

export const ModalBox = styled.div`
  width: min(1100px, 96vw);
  height: min(760px, 92vh);
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.medium};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${theme.colors.border.secondary};
`;

export const Title = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ExternalLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-size: 0.875rem;
  &:hover {
    text-decoration: underline;
  }
`;

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${theme.colors.hover?.primary || 'rgba(59,130,246,0.1)'};
    color: ${theme.colors.text.primary};
  }
`;

export const Content = styled.div`
  position: relative;
  flex: 1;
  min-height: 320px;
`;

export const Frame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

export const LoadingState = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  background: rgba(0, 0, 0, 0.25);
`;
