import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    overflow-x: hidden;
    position: relative;
    scroll-behavior: auto;
  }

  /* Efeito de partículas flutuantes */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    animation: none;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  #root {
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background.primary};
  }

  /* Removido tema de scrollbar para evitar confusão de duplo scroll */

  /* Seleção de texto */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.inverse};
  }

  /* Placeholder */
  ::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
    opacity: 1;
  }

  /* Focus outline */
  *:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Remover transições globais para evitar travas de scroll */
  * {
    transition: none;
  }

  /* Reset para inputs */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Estilos para selects */
  select {
    background: ${({ theme }) => theme.colors.background.secondary} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    border: 1px solid ${({ theme }) => theme.colors.border.primary} !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    appearance: none !important;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 16px !important;
    padding-right: 40px !important;
  }

  select option {
    background: ${({ theme }) => theme.colors.background.secondary} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    padding: 8px !important;
  }

  select:focus {
    outline: none !important;
    border-color: ${({ theme }) => theme.colors.primary} !important;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20 !important;
  }

  /* Reset para botões */
  button {
    font-family: inherit;
    cursor: pointer;
  }

  /* Reset para links */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Reset para listas */
  ul, ol {
    list-style: none;
  }
`;
