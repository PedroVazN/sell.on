import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${theme.colors.gradients.background};
    color: ${theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
  }

  /* Efeito de partículas no fundo */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* Scrollbar personalizada - Elegante e moderna */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5));
    transform: scale(1.1);
  }

  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Seleção de texto - Elegante */
  ::selection {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
    color: white;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  /* Focus outline - Acessível: visível ao navegar por teclado (focus-visible) */
  *:focus {
    outline: none;
  }
  *:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus};
    border-radius: ${theme.borderRadius.sm};
  }
  /* Contraste: botões e inputs com foco visível */
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  [tabindex="0"]:focus-visible {
    box-shadow: 0 0 0 3px ${theme.colors.border.focus};
  }

  /* Animações globais - Suaves e fluidas */
  @keyframes fadeIn {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateX(-30px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from { 
      opacity: 0;
      transform: translateY(-30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.8);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -8px, 0);
    }
    70% {
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { 
      opacity: 1;
      transform: scale(1);
    }
    50% { 
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
    }
  }

  @keyframes shimmer {
    0% { 
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% { 
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Utilitários de animação */
  .animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slide-in {
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slide-up {
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slide-down {
    animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-scale-in {
    animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .animate-bounce {
    animation: bounce 0.6s ease-in-out;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }

  /* Efeitos de hover globais */
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.large};
  }

  .hover-glow {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-glow:hover {
    box-shadow: ${theme.shadows.glow};
  }

  .hover-scale {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  /* Glassmorphism */
  .glass {
    background: ${theme.colors.background.glass};
    backdrop-filter: blur(20px);
    border: 1px solid ${theme.colors.border.primary};
  }

  .glass-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-hover:hover {
    background: ${theme.colors.background.glassHover};
    border-color: ${theme.colors.border.secondary};
  }

  /* Responsividade */
  @media (max-width: ${theme.breakpoints.mobile}) {
    html {
      font-size: 14px;
    }
    
    body::before {
      background: 
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 12px;
    }
  }

  /* Melhorias de acessibilidade */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  /* Skip link para navegação por teclado (opcional: adicionar elemento no HTML) */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: ${theme.colors.primary};
    color: white;
    padding: 0.5rem 1rem;
    z-index: 100;
    border-radius: ${theme.borderRadius.sm};
    transition: top 0.2s;
  }
  .skip-link:focus {
    top: 0;
  }

  /* Estilos globais para selects - Forçar tema escuro */
  select {
    background: #1f2937 !important;
    background-color: #1f2937 !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
  }

  select option {
    background: #1f2937 !important;
    background-color: #1f2937 !important;
    color: #ffffff !important;
    padding: 0.5rem !important;
    font-size: 0.875rem !important;
  }

  /* Força estilos em todos os navegadores */
  select::-ms-expand {
    display: none !important;
  }

  /* Estilo específico para Firefox */
  @-moz-document url-prefix() {
    select option {
      background: ${theme.colors.background.card} !important;
      color: ${theme.colors.text.primary} !important;
    }
  }

  /* Estilo específico para Webkit (Chrome, Safari) */
  select::-webkit-scrollbar {
    width: 8px;
  }

  select::-webkit-scrollbar-track {
    background: ${theme.colors.background.card};
  }

  select::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.primary};
    border-radius: 4px;
  }

  /* Print styles */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;
