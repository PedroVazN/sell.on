import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme, ThemeName, themes } from '../styles/themes';
import { ThemeModeProviderContext } from '../contexts/ThemeModeContext';

const STORAGE_KEY = 'sellon_theme';

const VALID_THEME_IDS = Object.keys(themes) as ThemeName[];

function getInitialTheme(): ThemeName {
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (saved && VALID_THEME_IDS.includes(saved as ThemeName)) {
    return saved as ThemeName;
  }

  // Preferência do sistema (fallback)
  return 'dark';
}

export const AppThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => getInitialTheme());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, themeName);
  }, [themeName]);

  const theme = useMemo(() => getTheme(themeName), [themeName]);

  const contextValue = useMemo(() => ({ themeName, setThemeName }), [themeName]);

  return (
    <ThemeModeProviderContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeProviderContext.Provider>
  );
};

