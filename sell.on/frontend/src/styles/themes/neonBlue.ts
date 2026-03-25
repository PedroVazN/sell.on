import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

/** Preto puro + azul neon forte. */
export const neonBlueTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#00b4ff',
    secondary: '#0080ff',
    accent: '#38f8ff',
    status: {
      ...darkTheme.colors.status,
      info: '#00d4ff',
    },
    background: {
      ...darkTheme.colors.background,
      main: '#000000',
      secondary: '#030508',
      tertiary: '#060a10',
      primary: '#000000',
      page: '#000000',
      card: 'rgba(0, 180, 255, 0.06)',
      cardHover: 'rgba(0, 180, 255, 0.11)',
      glass: 'rgba(0, 180, 255, 0.05)',
      glassHover: 'rgba(0, 180, 255, 0.1)',
    },
    text: {
      ...darkTheme.colors.text,
      accent: '#38f8ff',
    },
    border: {
      ...darkTheme.colors.border,
      focus: 'rgba(0, 212, 255, 0.65)',
      accent: 'rgba(0, 180, 255, 0.35)',
    },
    gradients: {
      ...darkTheme.colors.gradients,
      primary: 'linear-gradient(135deg, #00b4ff 0%, #0080ff 45%, #38f8ff 100%)',
      background: 'linear-gradient(180deg, #000000 0%, #030508 40%, #060a10 100%)',
      glow: 'linear-gradient(135deg, rgba(0, 212, 255, 0.28) 0%, rgba(0, 128, 255, 0.2) 100%)',
      button: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
      buttonSecondary: 'linear-gradient(135deg, #0080ff 0%, #0050c8 100%)',
    },
    hover: {
      ...darkTheme.colors.hover,
      primary: 'rgba(0, 212, 255, 0.14)',
      secondary: 'rgba(0, 128, 255, 0.12)',
    },
  },
  shadows: {
    ...darkTheme.shadows,
    glow: '0 0 32px rgba(0, 212, 255, 0.45)',
    glowSecondary: '0 0 28px rgba(0, 128, 255, 0.35)',
  },
};
