import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';

/**
 * Paleta “Cosplay Killers”: #4804D9, #2E038C, #150140, #010326, #0D0D0D
 * Fundo azul‑noite profundo + violetas; texto claro para contraste.
 */
export const cosplayVioletTheme: DefaultTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#4804D9',
    secondary: '#2E038C',
    accent: '#a78bfa',
    background: {
      ...darkTheme.colors.background,
      main: '#010326',
      secondary: '#0a0528',
      tertiary: '#150140',
      primary: '#010326',
      page: '#010326',
      surface: '#150140',
      surfaceAlt: '#1f0a55',
      card: 'rgba(72, 4, 217, 0.14)',
      cardHover: 'rgba(72, 4, 217, 0.24)',
      glass: 'rgba(72, 4, 217, 0.08)',
      glassHover: 'rgba(72, 4, 217, 0.15)',
      modal: 'rgba(1, 3, 38, 0.92)',
    },
    text: {
      primary: '#f5f3ff',
      secondary: 'rgba(245, 243, 255, 0.88)',
      muted: 'rgba(224, 213, 255, 0.62)',
      disabled: 'rgba(224, 213, 255, 0.36)',
      tertiary: 'rgba(196, 181, 253, 0.58)',
      inverse: '#0D0D0D',
      accent: '#c4b5fd',
    },
    border: {
      primary: 'rgba(167, 139, 250, 0.14)',
      secondary: 'rgba(167, 139, 250, 0.24)',
      focus: 'rgba(72, 4, 217, 0.65)',
      accent: 'rgba(72, 4, 217, 0.38)',
    },
    status: {
      ...darkTheme.colors.status,
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4804D9 0%, #2E038C 50%, #6d28d9 100%)',
      background: 'linear-gradient(180deg, #010326 0%, #150140 55%, #0D0D0D 100%)',
      card: 'linear-gradient(135deg, rgba(72, 4, 217, 0.14) 0%, rgba(21, 1, 64, 0.45) 100%)',
      button: 'linear-gradient(135deg, #4804D9 0%, #2E038C 100%)',
      buttonSecondary: 'linear-gradient(135deg, #2E038C 0%, #150140 100%)',
      glass: 'linear-gradient(135deg, rgba(72, 4, 217, 0.16) 0%, rgba(21, 1, 64, 0.28) 100%)',
      glow: 'linear-gradient(135deg, rgba(72, 4, 217, 0.38) 0%, rgba(46, 3, 140, 0.28) 100%)',
    },
    hover: {
      primary: 'rgba(72, 4, 217, 0.22)',
      secondary: 'rgba(46, 3, 140, 0.18)',
      success: darkTheme.colors.hover.success,
      danger: darkTheme.colors.hover.danger,
    },
  },
  shadows: {
    ...darkTheme.shadows,
    glow: '0 0 36px rgba(72, 4, 217, 0.48)',
    glowSecondary: '0 0 30px rgba(46, 3, 140, 0.42)',
  },
};
