import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeColors {
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
  gradient: {
    start: string;
    end: string;
  };
  tab: {
    active: string;
    inactive: string;
    background: string;
  };
}

interface ThemeContextType {
  isDark: boolean;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#E85D04',
  primaryDark: '#D45500',
  primaryLight: '#FF8A4C',
  secondary: '#1A1A2E',
  accent: '#FFB703',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  gradient: {
    start: '#E85D04',
    end: '#FF8A4C',
  },
  tab: {
    active: '#E85D04',
    inactive: '#9CA3AF',
    background: '#FFFFFF',
  },
};

const darkColors: ThemeColors = {
  primary: '#FF8A4C',
  primaryDark: '#E85D04',
  primaryLight: '#FFB088',
  secondary: '#2D2D44',
  accent: '#FFD25C',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F0F1E',
  surface: '#1A1A2E',
  surfaceAlt: '#252538',
  card: '#1F1F35',
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textLight: '#9CA3AF',
  border: '#374151',
  borderLight: '#2D2D44',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradient: {
    start: '#FF8A4C',
    end: '#FFB088',
  },
  tab: {
    active: '#FF8A4C',
    inactive: '#6B7280',
    background: '#1A1A2E',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@finedine_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  // Update theme when system preference or user preference changes
  useEffect(() => {
    const effectiveScheme = colorScheme === 'auto' ? systemColorScheme : colorScheme;
    setIsDark(effectiveScheme === 'dark');
  }, [colorScheme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedScheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedScheme) {
        setColorSchemeState(savedScheme as ColorScheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colorScheme, colors, setColorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Common style helpers
export const getThemedStyles = (isDark: boolean) => ({
  shadow: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLg: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glassmorphism: {
    backgroundColor: isDark ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
  },
});

export default ThemeContext;