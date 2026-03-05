import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const PageContainer = styled.div`
  padding: 2rem;
  background: ${theme.colors.gradients.background};
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
    pointer-events: none;
    animation: backgroundShift 20s ease-in-out infinite;
  }

  @keyframes backgroundShift {
    0%, 100% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(-20px) translateY(-10px); }
    50% { transform: translateX(20px) translateY(10px); }
    75% { transform: translateX(-10px) translateY(20px); }
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;

export const PageHeader = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: ${theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  text-shadow: ${theme.shadows.glow};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  font-weight: 500;
`;

export const PageContent = styled.div`
  position: relative;
  z-index: 1;
`;
