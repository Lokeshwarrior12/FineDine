import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Colors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  borderLight: string;
  overlay: string;
  cardShadow: string;
  gradient: {
    start: string;
    end: string;
  };
  rating: string;
  online: string;
  offline: string;
  tab: {
    active: string;
    inactive: string;
    background: string;
  };
}

// Light theme colors
export const lightColors: Colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FDBA74',
  secondary: '#1F2937',
  accent: '#FBBF24',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textLight: '#9CA3AF',
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.5)',
  cardShadow: 'rgba(0,0,0,0.1)',
  gradient: {
    start: '#F97316',
    end: '#EF4444',
  },
  rating: '#FBBF24',
  online: '#22C55E',
  offline: '#9CA3AF',
  tab: {
    active: '#F97316',
    inactive: '#9CA3AF',
    background: '#FFFFFF',
  },
};

// Dark theme colors
export const darkColors: Colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FDBA74',
  secondary: '#E5E7EB',
  accent: '#FBBF24',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  background: '#111827',
  surface: '#1F2937',
  surfaceAlt: '#374151',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textLight: '#9CA3AF',
  border: '#4B5563',
  borderLight: '#6B7280',
  overlay: 'rgba(255,255,255,0.1)',
  cardShadow: 'rgba(255,255,255,0.05)',
  gradient: {
    start: '#F97316',
    end: '#EF4444',
  },
  rating: '#FBBF24',
  online: '#22C55E',
  offline: '#9CA3AF',
  tab: {
    active: '#F97316',
    inactive: '#6B7280',
    background: '#1F2937',
  },
};

// Theme store using Zustand
interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@finedine_theme';

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'system',
  
  setThemeMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ themeMode: mode });
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  },
  
  initializeTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode) {
        set({ themeMode: savedMode as ThemeMode });
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  },
}));

// Hook to get current colors based on theme mode
export const useColors = (): Colors => {
  const systemScheme = useColorScheme();
  const { themeMode } = useThemeStore();
  
  const effectiveScheme = themeMode === 'system' ? systemScheme : themeMode;
  
  return effectiveScheme === 'dark' ? darkColors : lightColors;
};

// Hook to check if dark mode is active
export const useIsDark = (): boolean => {
  const systemScheme = useColorScheme();
  const { themeMode } = useThemeStore();
  
  const effectiveScheme = themeMode === 'system' ? systemScheme : themeMode;
  
  return effectiveScheme === 'dark';
};

// Common shadow styles
export const getShadowStyle = (isDark: boolean) => ({
  shadowColor: isDark ? '#000' : '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isDark ? 0.3 : 0.1,
  shadowRadius: 8,
  elevation: 4,
});

export const getShadowStyleLarge = (isDark: boolean) => ({
  shadowColor: isDark ? '#000' : '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: isDark ? 0.4 : 0.15,
  shadowRadius: 12,
  elevation: 8,
});

// Common spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

// Common border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Common font sizes
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
};

// Font weights
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
// Define your font families here
export const Fonts = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  extrabold: 'System',
  mono: 'Courier',      // add monospace font
  rounded: 'System',    // or a rounded font if you have one
};

