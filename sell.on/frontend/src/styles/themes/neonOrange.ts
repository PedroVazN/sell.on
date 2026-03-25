import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

/** Preto puro + laranja neon como cor secundária/acento. */
export const neonOrangeTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#ff6600',
    secondary: '#ff9500',
    accent: '#ffb020',
    status: {
      ...darkTheme.colors.status,
      warning: '#ff9500',
      info: '#ff8500',
    },
    background: {
      ...darkTheme.colors.background,
      main: '#000000',
      secondary: '#050505',
      tertiary: '#0a0a0a',
      primary: '#000000',
      page: '#000000',
      surface: '#140800',
      surfaceAlt: '#1a0c02',
      card: 'rgba(255, 102, 0, 0.06)',
      cardHover: 'rgba(255, 102, 0, 0.1)',
      glass: 'rgba(255, 102, 0, 0.05)',
      glassHover: 'rgba(255, 102, 0, 0.09)',
    },
    text: {
      ...darkTheme.colors.text,
      accent: '#ff8500',
    },
    border: {
      ...darkTheme.colors.border,
      focus: 'rgba(255, 102, 0, 0.65)',
      accent: 'rgba(255, 149, 0, 0.35)',
    },
    gradients: {
      ...darkTheme.colors.gradients,
      primary: 'linear-gradient(135deg, #ff6600 0%, #ff9500 45%, #ffb020 100%)',
      background: 'linear-gradient(180deg, #000000 0%, #050505 40%, #0a0a0a 100%)',
      glow: 'linear-gradient(135deg, rgba(255, 102, 0, 0.28) 0%, rgba(255, 149, 0, 0.18) 100%)',
      button: 'linear-gradient(135deg, #ff6600 0%, #ff4500 100%)',
      buttonSecondary: 'linear-gradient(135deg, #ff9500 0%, #ff6600 100%)',
    },
    hover: {
      ...darkTheme.colors.hover,
      primary: 'rgba(255, 102, 0, 0.14)',
      secondary: 'rgba(255, 149, 0, 0.12)',
    },
  },
  shadows: {
    ...darkTheme.shadows,
    glow: '0 0 32px rgba(255, 102, 0, 0.42)',
    glowSecondary: '0 0 28px rgba(255, 149, 0, 0.32)',
  },
};
