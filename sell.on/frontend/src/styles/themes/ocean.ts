import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

// Tema extra: “oceano” (verde/azul) para variar do padrão.
export const oceanTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#34d399',
    secondary: '#60a5fa',
    accent: '#2dd4bf',
    status: {
      success: '#34d399',
      warning: darkTheme.colors.status.warning,
      error: darkTheme.colors.status.error,
      info: '#60a5fa',
    },
    background: {
      ...darkTheme.colors.background,
      main: '#050f12',
      secondary: '#071a1f',
      tertiary: '#0b242a',
      primary: '#050f12',
      page: '#050f12',
      surface: '#0b242a',
      surfaceAlt: '#0e3038',
    },
    text: {
      ...darkTheme.colors.text,
      accent: '#2dd4bf',
    },
    border: {
      ...darkTheme.colors.border,
      focus: 'rgba(45, 212, 191, 0.55)',
      accent: 'rgba(45, 212, 191, 0.28)',
    },
    gradients: {
      ...darkTheme.colors.gradients,
      primary: 'linear-gradient(135deg, #34d399 0%, #2dd4bf 45%, #60a5fa 100%)',
      background: 'linear-gradient(135deg, #050f12 0%, #071a1f 50%, #0b242a 100%)',
      glow: 'linear-gradient(135deg, rgba(45, 212, 191, 0.22) 0%, rgba(96, 165, 250, 0.22) 100%)',
      button: 'linear-gradient(135deg, #2dd4bf 0%, #22c55e 100%)',
      buttonSecondary: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    },
    hover: {
      ...darkTheme.colors.hover,
      primary: 'rgba(45, 212, 191, 0.11)',
      secondary: 'rgba(96, 165, 250, 0.11)',
      success: 'rgba(52, 211, 153, 0.10)',
      danger: 'rgba(239, 68, 68, 0.10)',
    },
  },
};

