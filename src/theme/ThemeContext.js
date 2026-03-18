import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Professional, calming color palette inspired by Headspace/Calm
export const lightTheme = {
  background: '#F9FAFB', // Off-white
  surface: '#FFFFFF',
  text: '#1F2937', // Dark gray for readability
  textSecondary: '#6B7280',
  primary: '#818CF8', // Soft lavender/indigo
  secondary: '#93C5FD', // Pastel blue
  accent: '#2DD4BF', // Teal
  border: '#E5E7EB',
  error: '#FCA5A5',
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  gradientStart: '#E0E7FF',
  gradientEnd: '#E4FAFA',
};

export const darkTheme = {
  background: '#111827', // Dark blue-gray
  surface: '#1F2937',
  text: '#F3F4F6', // Off-white
  textSecondary: '#9CA3AF',
  primary: '#6366F1', // Deeper indigo
  secondary: '#60A5FA', // Blue
  accent: '#14B8A6', // Dark teal
  border: '#374151',
  error: '#EF4444',
  glassBackground: 'rgba(31, 41, 55, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  gradientStart: '#0F172A',
  gradientEnd: '#1E293B',
};

// Typography settings
export const typography = {
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '500' },
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  typography,
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, typography }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
