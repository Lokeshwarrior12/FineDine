import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';

const customColors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FDBA74',
  secondary: '#1F2937',
  accent: '#FBBF24',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  rating: '#FBBF24',
  online: '#22C55E',
  offline: '#9CA3AF',
  gradient: { start: '#F97316', end: '#EF4444' },
};

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const lightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: customColors.primary,
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    border: '#D1D5DB',
    notification: customColors.accent,
  },
};
export const Fonts = {
  regular: 'System',
  mono: 'Courier',
  rounded: 'System',
};
const darkTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: customColors.primary,
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#4B5563',
    notification: customColors.accent,
  },
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'system',
  setMode: async (newMode) => {
    await AsyncStorage.setItem('themeMode', newMode);
    set({ mode: newMode });
  },
}));

export const useAppTheme = (): Theme => {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  const resolvedMode = mode === 'system' ? systemScheme : mode;
  return resolvedMode === 'dark' ? darkTheme : lightTheme;
};

export const useColors = () => {
  const theme = useAppTheme();
  return {
    ...customColors,
    background: theme.colors.background,
    text: theme.colors.text,
    card: theme.colors.card,
  };
};
