import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    // Cores principais - Tema escuro elegante
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    
    // Backgrounds - Gradientes escuros sofisticados
    background: {
      main: '#0a0a0f',
      secondary: '#111827',
      tertiary: '#1f2937',
      primary: '#0a0a0f',
      card: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.06)',
      modal: 'rgba(0, 0, 0, 0.9)',
      glass: 'rgba(255, 255, 255, 0.05)',
      glassHover: 'rgba(255, 255, 255, 0.08)',
    },
    
    // Textos - Hierarquia clara
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      muted: 'rgba(255, 255, 255, 0.65)',
      disabled: 'rgba(255, 255, 255, 0.35)',
      tertiary: 'rgba(255, 255, 255, 0.55)',
      inverse: '#000000',
      accent: '#3b82f6',
    },
    
    // Bordas - Sutis e elegantes
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.15)',
      focus: 'rgba(59, 130, 246, 0.6)',
      accent: 'rgba(139, 92, 246, 0.3)',
    },
    
    // Status - Cores vibrantes
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Cores diretas para compatibilidade
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Gradientes - Sofisticados e modernos
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #f59e0b 100%)',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #1f2937 100%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      button: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      buttonSecondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      glow: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
    },
    
    // Cores de hover e interação
    hover: {
      primary: 'rgba(59, 130, 246, 0.1)',
      secondary: 'rgba(139, 92, 246, 0.1)',
      danger: 'rgba(239, 68, 68, 0.1)',
      success: 'rgba(16, 185, 129, 0.1)',
    },
  },
  
  // Sombras - Profundidade e elegância
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.4)',
    large: '0 8px 40px rgba(0, 0, 0, 0.5)',
    glow: '0 0 30px rgba(59, 130, 246, 0.4)',
    glowSecondary: '0 0 30px rgba(139, 92, 246, 0.4)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  
  // Espaçamentos - Sistema consistente
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
    xxxl: '4rem',
  },
  
  // Bordas - Arredondadas e modernas
  borderRadius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    full: '50%',
  },
  
  // Transições - Suaves e fluidas
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Breakpoints - Responsivo
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },
  
  // Z-index - Hierarquia de camadas
  zIndex: {
    dropdown: 100,
    modal: 1000,
    tooltip: 1100,
    notification: 1200,
  },
  
  // Animações - Keyframes personalizados
  animations: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
    slideIn: 'slideIn 0.3s ease-out',
    slideUp: 'slideUp 0.3s ease-out',
    scaleIn: 'scaleIn 0.2s ease-out',
    bounce: 'bounce 0.6s ease-in-out',
    pulse: 'pulse 2s infinite',
    glow: 'glow 2s ease-in-out infinite alternate',
  },
};

export type Theme = typeof theme;