const lightColors = {
  primary: '#79589b',
  secondary: '#79589b',
    text: '#111827',
    subtleText: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    white: '#ffffff',
  purple: '#79589b',
  purpleLight: 'rgba(121, 88, 155, 0.1)',
  purpleMedium: 'rgba(121, 88, 155, 0.2)',
  purpleDark: '#6a4d87',
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceHover: '#f3f4f6',
  inputBackground: '#ffffff',
  inputBorder: '#e5e7eb',
  cardBackground: '#ffffff',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  diffAddedBg: '#d1fae5',
  diffAddedText: '#065f46',
  diffRemovedBg: '#fee2e2',
  diffRemovedText: '#991b1b',
  diffModifiedBg: '#fef3c7',
  diffModifiedText: '#92400e',
};

const darkColors = {
  primary: '#79589b',
  secondary: '#79589b',
  text: '#f9fafb',
  subtleText: '#d1d5db',
  border: '#374151',
  error: '#ef4444',
  white: '#ffffff',
  purple: '#79589b',
  purpleLight: 'rgba(121, 88, 155, 0.2)',
  purpleMedium: 'rgba(121, 88, 155, 0.3)',
  purpleDark: '#6a4d87',
  background: '#111827',
  surface: '#1f2937',
  surfaceHover: '#374151',
  inputBackground: '#1f2937',
  inputBorder: '#374151',
  cardBackground: '#1f2937',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  diffAddedBg: 'rgba(16, 185, 129, 0.2)',
  diffAddedText: '#6ee7b7',
  diffRemovedBg: 'rgba(239, 68, 68, 0.2)',
  diffRemovedText: '#fca5a5',
  diffModifiedBg: 'rgba(245, 158, 11, 0.2)',
  diffModifiedText: '#fcd34d',
};

export const theme = {
  light: {
    colors: lightColors,
    radii: {
      sm: '6px',
      md: '8px',
      lg: '12px',
    },
    spacing: (n: number) => `${n * 4}px`,
  },
  dark: {
    colors: darkColors,
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  spacing: (n: number) => `${n * 4}px`,
  },
} as const;

export type AppTheme = typeof theme.light;

