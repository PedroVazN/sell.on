import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

export const MainContent = styled.main<{ $sidebarWidth?: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ $sidebarWidth = 280 }) => $sidebarWidth}px;
  background: ${({ theme }) => theme.colors.background.primary};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;
