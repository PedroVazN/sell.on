import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: {
        main: string;
        secondary: string;
        tertiary: string;
        primary: string;
        card: string;
        cardHover: string;
        modal: string;
        glass: string;
        glassHover: string;
      };
      text: {
        primary: string;
        secondary: string;
        muted: string;
        disabled: string;
        tertiary: string;
        inverse: string;
        accent: string;
      };
      border: {
        primary: string;
        secondary: string;
        focus: string;
        accent: string;
      };
      status: {
        success: string;
        warning: string;
        error: string;
        info: string;
      };
      warning: string;
      info: string;
      success: string;
      error: string;
      hover: {
        primary: string;
        secondary: string;
        success: string;
        danger: string;
      };
      gradients: {
        primary: string;
        background: string;
        card: string;
        button: string;
        buttonSecondary: string;
        glass: string;
        glow: string;
      };
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      glow: string;
      glowSecondary: string;
      inner: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      full: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
      bounce: string;
      elastic: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
    zIndex: {
      dropdown: number;
      modal: number;
      tooltip: number;
      notification: number;
    };
    animations: {
      fadeIn: string;
      slideIn: string;
      slideUp: string;
      scaleIn: string;
      bounce: string;
      pulse: string;
      glow: string;
    };
  }
}
