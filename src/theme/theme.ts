export const lightTheme = {
  colors: {
    background: '#f8f9fa',
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceHover: 'rgba(255, 255, 255, 0.9)',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#9ca3af',
    subtleText: '#6b7280',
    border: 'rgba(0, 0, 0, 0.08)',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    secondary: '#ec4899',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Gradient colors
    gradientStart: '#8B5CF6',
    gradientEnd: '#D946EF',

    // Diff specific
    diffAddedBg: 'rgba(16, 185, 129, 0.15)',
    diffAddedText: '#059669',
    diffRemovedBg: 'rgba(239, 68, 68, 0.15)',
    diffRemovedText: '#dc2626',
    diffChangedBg: 'rgba(245, 158, 11, 0.15)',
    diffChangedText: '#d97706',

    // UI Elements
    inputBackground: 'rgba(255, 255, 255, 0.5)',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    cardBackground: '#ffffff',

    // Special
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    purpleLight: 'rgba(139, 92, 246, 0.1)',
    purpleMedium: 'rgba(139, 92, 246, 0.2)',
    purpleDark: 'rgba(139, 92, 246, 0.4)',

    white: '#ffffff',
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    xl: '32px',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0 8px 24px rgba(0, 0, 0, 0.08)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.12)',
    floating: '0 20px 50px rgba(139, 92, 246, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Monaco", monospace',
  }
};

export const darkTheme = {
  colors: {
    background: '#0B0D14', // Deep dark navy/black from screenshot
    surface: '#151923', // Darker card background
    surfaceHover: '#1E2330',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    subtleText: '#4B5563',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#A78BFA',
    primaryHover: '#8B5CF6',
    secondary: '#F472B6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#60A5FA',

    // Gradient colors
    gradientStart: '#8B5CF6',
    gradientEnd: '#D946EF',

    // Diff specific - Matching screenshot
    diffAddedBg: 'rgba(16, 185, 129, 0.1)',
    diffAddedText: '#34D399', // Bright green
    diffRemovedBg: 'rgba(239, 68, 68, 0.1)',
    diffRemovedText: '#F87171', // Soft red
    diffChangedBg: 'rgba(245, 158, 11, 0.1)',
    diffChangedText: '#FBBF24', // Bright yellow/orange

    // UI Elements
    inputBackground: '#0F1219', // Very dark input background
    inputBorder: 'rgba(255, 255, 255, 0.08)',
    cardBackground: '#151923',

    // Special
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    purpleLight: 'rgba(167, 139, 250, 0.1)',
    purpleMedium: 'rgba(167, 139, 250, 0.2)',
    purpleDark: 'rgba(167, 139, 250, 0.3)',

    white: '#ffffff',
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    xl: '32px',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
    md: '0 8px 24px rgba(0, 0, 0, 0.3)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.4)',
    floating: '0 20px 50px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  fonts: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Monaco", monospace',
  }
};

export const theme = lightTheme;

export type AppTheme = {
  colors: {
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    subtleText: string;
    border: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    gradientStart: string;
    gradientEnd: string;
    diffAddedBg: string;
    diffAddedText: string;
    diffRemovedBg: string;
    diffRemovedText: string;
    diffChangedBg: string;
    diffChangedText: string;
    inputBackground: string;
    inputBorder: string;
    cardBackground: string;
    glassBorder: string;
    purpleLight: string;
    purpleMedium: string;
    purpleDark: string;
    white: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    floating: string;
    inner: string;
  };
  fonts: {
    body: string;
    mono: string;
  };
};