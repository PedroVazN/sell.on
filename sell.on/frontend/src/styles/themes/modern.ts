import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

// Tema “moderno”: azul/ciano + violeta, mantendo fundo dark.
export const modernTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#22d3ee',
    secondary: '#6366f1',
    accent: '#60a5fa',
    status: {
      success: darkTheme.colors.status.success,
      warning: darkTheme.colors.status.warning,
      error: darkTheme.colors.status.error,
      info: '#22d3ee',
    },
    background: {
      ...darkTheme.colors.background,
      main: '#070a12',
      secondary: '#0b1220',
      tertiary: '#111b33',
      primary: '#070a12',
      page: '#070a12',
      surface: '#111b33',
      surfaceAlt: '#162038',
    },
    text: {
      ...darkTheme.colors.text,
      accent: '#22d3ee',
    },
    border: {
      ...darkTheme.colors.border,
      focus: 'rgba(34, 211, 238, 0.55)',
      accent: 'rgba(34, 211, 238, 0.28)',
    },
    gradients: {
      ...darkTheme.colors.gradients,
      primary: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #60a5fa 100%)',
      background: 'linear-gradient(135deg, #070a12 0%, #0b1220 50%, #111b33 100%)',
      glow: 'linear-gradient(135deg, rgba(34, 211, 238, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)',
      button: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)',
      buttonSecondary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
    hover: {
      ...darkTheme.colors.hover,
      primary: 'rgba(34, 211, 238, 0.11)',
      secondary: 'rgba(99, 102, 241, 0.11)',
      success: 'rgba(16, 185, 129, 0.10)',
      danger: 'rgba(239, 68, 68, 0.10)',
    },
  },
};

