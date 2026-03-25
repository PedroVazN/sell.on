import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

// Tema rosa (mantém o estilo “dark elegante”, mas com identidade rosa/ameixa).
export const pinkTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#f472b6',
    status: {
      success: darkTheme.colors.status.success,
      warning: darkTheme.colors.status.warning,
      error: darkTheme.colors.status.error,
      info: '#ec4899',
    },
    background: {
      ...darkTheme.colors.background,
      main: '#0b0710',
      secondary: '#1a1020',
      tertiary: '#22142c',
      primary: '#0b0710',
      page: '#0b0710',
      surface: '#1a1028',
      surfaceAlt: '#22142c',
      glass: 'rgba(255, 255, 255, 0.045)',
      glassHover: 'rgba(255, 255, 255, 0.075)',
    },
    text: {
      ...darkTheme.colors.text,
      accent: '#ec4899',
    },
    border: {
      ...darkTheme.colors.border,
      focus: 'rgba(236, 72, 153, 0.55)',
      accent: 'rgba(236, 72, 153, 0.30)',
    },
    gradients: {
      ...darkTheme.colors.gradients,
      primary: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #f472b6 100%)',
      background: 'linear-gradient(135deg, #0b0710 0%, #1a1020 50%, #22142c 100%)',
      glow: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
      button: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      buttonSecondary: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    },
    hover: {
      ...darkTheme.colors.hover,
      primary: 'rgba(236, 72, 153, 0.11)',
      secondary: 'rgba(168, 85, 247, 0.11)',
      success: 'rgba(16, 185, 129, 0.10)',
      danger: 'rgba(239, 68, 68, 0.10)',
    },
  },
};

