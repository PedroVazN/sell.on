import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

/**
 * Tema claro: fundo azul-cinza suave (não branco puro) + cartões brancos + texto escuro.
 * Evita branco sobre branco: texto principal #0f172a sobre page #e8edf5 e surface #fff.
 */
export const lightBlueTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#1d4ed8',
    secondary: '#2563eb',
    accent: '#3b82f6',
    background: {
      ...darkTheme.colors.background,
      main: '#e8edf5',
      secondary: '#e2e8f0',
      tertiary: '#cbd5e1',
      primary: '#e8edf5',
      page: '#e8edf5',
      surface: '#ffffff',
      surfaceAlt: '#f1f5f9',
      card: 'rgba(255, 255, 255, 0.92)',
      cardHover: 'rgba(29, 78, 216, 0.07)',
      modal: 'rgba(15, 23, 42, 0.5)',
      glass: 'rgba(255, 255, 255, 0.75)',
      glassHover: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#0f172a',
      secondary: 'rgba(15, 23, 42, 0.78)',
      muted: 'rgba(15, 23, 42, 0.55)',
      disabled: 'rgba(15, 23, 42, 0.38)',
      tertiary: 'rgba(15, 23, 42, 0.62)',
      inverse: '#ffffff',
      accent: '#1d4ed8',
    },
    border: {
      primary: 'rgba(15, 23, 42, 0.1)',
      secondary: 'rgba(15, 23, 42, 0.16)',
      focus: 'rgba(29, 78, 216, 0.45)',
      accent: 'rgba(37, 99, 235, 0.32)',
    },
    status: {
      ...darkTheme.colors.status,
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
      background: 'linear-gradient(180deg, #e8edf5 0%, #eef2f7 40%, #e8edff 100%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%)',
      button: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      buttonSecondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 245, 249, 0.96) 100%)',
      glow: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.12) 100%)',
    },
    hover: {
      primary: 'rgba(29, 78, 216, 0.1)',
      secondary: 'rgba(37, 99, 235, 0.08)',
      success: 'rgba(16, 185, 129, 0.12)',
      danger: 'rgba(239, 68, 68, 0.1)',
    },
  },
  shadows: {
    ...darkTheme.shadows,
    small: '0 2px 8px rgba(15, 23, 42, 0.07)',
    medium: '0 4px 20px rgba(15, 23, 42, 0.1)',
    large: '0 8px 40px rgba(15, 23, 42, 0.12)',
    glow: '0 0 24px rgba(37, 99, 235, 0.22)',
    glowSecondary: '0 0 20px rgba(29, 78, 216, 0.18)',
  },
};
