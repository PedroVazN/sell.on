import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  background: ${({ theme }) => theme.colors.background.primary};
`;
