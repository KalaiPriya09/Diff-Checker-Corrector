import type { AppProps } from 'next/app';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import './globals.css';

function ThemedApp({ Component, pageProps }: AppProps) {
  const { mode } = useTheme();
  const currentTheme = theme[mode];

  return (
    <StyledThemeProvider theme={currentTheme}>
      <Component {...pageProps} />
    </StyledThemeProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider>
      <ThemedApp {...props} />
    </ThemeProvider>
  );
}

