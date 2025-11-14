export const lightTheme = {
  colors: {
    primary: '#79589b',
    secondary: '#79589b',
    text: '#111827',
    subtleText: '#6b7280',
    border: '#d3d3d3',
    borderLight: '#f3f4f6',
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
    diffChangedBg: '#fef3c7',
    diffChangedText: '#92400e',
    diffModifiedBg: '#fef3c7',
    diffModifiedText: '#92400e',
    gradientStart: '#79589b',
    gradientEnd: '#6a4d87',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  spacing: (n: number) => `${n * 4}px`,
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

export const darkTheme = {
  colors: {
    primary: '#79589b',
    secondary: '#79589b',
    text: '#f9fafb',
    subtleText: '#d1d5db',
    border: '#374151',
    borderLight: '#4b5563',
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
    diffChangedBg: 'rgba(245, 158, 11, 0.2)',
    diffChangedText: '#fcd34d',
    diffModifiedBg: 'rgba(245, 158, 11, 0.2)',
    diffModifiedText: '#fcd34d',
    gradientStart: '#a78bfa',
    gradientEnd: '#8b5cf6',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  spacing: (n: number) => `${n * 4}px`,
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
} as const;



// Default theme (light)
export const theme = lightTheme;

// Base theme type for styled-components
export type AppTheme = {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    subtleText: string;
    border: string;
    borderLight: string;
    error: string;
    white: string;
    purple: string;
    purpleLight: string;
    purpleMedium: string;
    purpleDark: string;
    background: string;
    surface: string;
    surfaceHover: string;
    inputBackground: string;
    inputBorder: string;
    cardBackground: string;
    textSecondary: string;
    textTertiary: string;
    diffAddedBg: string;
    diffAddedText: string;
    diffRemovedBg: string;
    diffRemovedText: string;
    diffModifiedBg: string;
    diffModifiedText: string;
    gradientStart: string;
    gradientEnd: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  spacing: (n: number) => string;
  fonts: {
    body: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
};