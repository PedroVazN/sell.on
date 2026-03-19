import React, { createContext, useContext } from 'react';
import { ThemeName } from '../styles/themes';

type ThemeModeContextValue = {
  themeName: ThemeName;
  setThemeName: (next: ThemeName) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const ThemeModeProviderContext = ThemeModeContext;

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode precisa estar dentro de ThemeModeProvider');
  }
  return ctx;
}

