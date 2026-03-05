import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.primary};
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-width: 300px;
  
  svg {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  flex: 1;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

export const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: blur(10px);
  text-align: center;
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 1.125rem;
  }
`;
