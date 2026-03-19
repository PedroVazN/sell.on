import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';
import { pinkTheme } from './pink';
import { modernTheme } from './modern';
import { oceanTheme } from './ocean';

export type ThemeName = 'dark' | 'pink' | 'modern' | 'ocean';

export const themes: Record<ThemeName, DefaultTheme> = {
  dark: darkTheme,
  pink: pinkTheme,
  modern: modernTheme,
  ocean: oceanTheme,
};

export const getTheme = (name: ThemeName): DefaultTheme => themes[name] || themes.dark;

