import { DefaultTheme } from 'styled-components';
import { theme as darkTheme } from '../theme';
import { pinkTheme } from './pink';
import { modernTheme } from './modern';
import { oceanTheme } from './ocean';
import { neonOrangeTheme } from './neonOrange';
import { neonBlueTheme } from './neonBlue';

export type ThemeName = 'dark' | 'pink' | 'modern' | 'ocean' | 'neonOrange' | 'neonBlue';

export const themes: Record<ThemeName, DefaultTheme> = {
  dark: darkTheme,
  pink: pinkTheme,
  modern: modernTheme,
  ocean: oceanTheme,
  neonOrange: neonOrangeTheme,
  neonBlue: neonBlueTheme,
};

export const getTheme = (name: ThemeName): DefaultTheme => themes[name] || themes.dark;

