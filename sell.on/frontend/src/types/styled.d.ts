import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      
      background: {
        main: string;
        primary: string;
        secondary: string;
        tertiary: string;
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
      };
      
      border: {
        primary: string;
        secondary: string;
        focus: string;
        glass: string;
      };
      
      gradients: {
        primary: string;
        background: string;
        card: string;
        button: string;
        glass: string;
        shimmer: string;
      };
      
      status: {
        success: string;
        warning: string;
        error: string;
        info: string;
      };
    };
    
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    
    shadows: {
      small: string;
      medium: string;
      large: string;
      glow: string;
      glass: string;
      glassHover: string;
      card: string;
      cardHover: string;
    };
    
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    
    zIndex: {
      dropdown: number;
      modal: number;
      tooltip: number;
    };
  }
}

